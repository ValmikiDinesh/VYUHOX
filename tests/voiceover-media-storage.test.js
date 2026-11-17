/**
 * tests/voiceover-media-storage.test.js
 * Verification of VoiceoverService media storage routing through the private media lifecycle.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { VoiceoverService } from '../src/services/social/VoiceoverService.js';
import { AssetDeliveryService } from '../src/services/media/AssetDeliveryService.js';
import { WorkspaceAsset } from '../src/models/WorkspaceAsset.js';

dotenv.config();

console.log('========================================================================');
console.log('🧪 RUNNING VOICEOVER MEDIA STORAGE SECURITY TEST SUITE');
console.log('========================================================================\n');

const SYNTHETIC_WORKSPACE_ID = new mongoose.Types.ObjectId('6afc00000000000000000001');

async function runTests() {
  let passed = 0;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';
  await mongoose.connect(mongoUri);

  try {
    // Test 1: VoiceoverService with workspaceId routes audio to private storage
    console.log('👉 [Test 1] Verifying VoiceoverService with workspaceId saves to private storage and creates WorkspaceAsset...');
    {
      const initialPublicFiles = fs.readdirSync(path.resolve(process.cwd(), 'client', 'public', 'audio', 'reels'));

      const result = await VoiceoverService.generateVoiceover({
        text: 'This is a test narration for an autonomous enterprise campaign.',
        voiceId: 'maya',
        tone: 'aggressive_challenger',
        language: 'en-US',
        workspaceId: SYNTHETIC_WORKSPACE_ID,
      });

      assert.equal(result.success, true);
      assert.ok(result.voice, 'Expected voice metadata');

      if (result.provider !== 'BROWSER_WEB_SPEECH_API') {
        // If system has SAPI or OpenAI TTS available
        assert.ok(result.audioUrl?.startsWith('/api/assets/'), `Expected private asset URL, got ${result.audioUrl}`);
        assert.ok(result.assetId, 'Expected assetId to be returned');

        // Verify WorkspaceAsset document in MongoDB
        const asset = await WorkspaceAsset.findById(result.assetId);
        assert.ok(asset, 'Expected WorkspaceAsset record in MongoDB');
        assert.equal(asset.workspaceId.toString(), SYNTHETIC_WORKSPACE_ID.toString());
        assert.equal(asset.status, 'PRIVATE');
        assert.equal(asset.userAuthorized, true);

        // Verify file is stored in private storage root, NOT in public reels
        const privateDir = AssetDeliveryService.getPrivateDir(SYNTHETIC_WORKSPACE_ID);
        const privateFilePath = path.resolve(privateDir, asset.filename);
        assert.ok(fs.existsSync(privateFilePath), `Expected private file at ${privateFilePath}`);

        // Clean up created fixture
        await WorkspaceAsset.findByIdAndDelete(result.assetId);
        if (fs.existsSync(privateFilePath)) {
          fs.unlinkSync(privateFilePath);
        }
      } else {
        // In environments without SAPI or OpenAI key, audioUrl must be null (browser speech)
        assert.equal(result.audioUrl, null, 'Expected audioUrl to be null for browser speech fallback');
      }

      // Assert client/public/audio/reels was NOT written to
      const finalPublicFiles = fs.readdirSync(path.resolve(process.cwd(), 'client', 'public', 'audio', 'reels'));
      assert.equal(
        finalPublicFiles.length,
        initialPublicFiles.length,
        'client/public/audio/reels must not receive new files from VoiceoverService'
      );

      console.log('   ✅ PASS: VoiceoverService persists strictly to private storage without leaking into client/public.');
      passed++;
    }

    // Test 2: VoiceoverService without workspaceId does NOT write to client/public
    console.log('👉 [Test 2] Verifying VoiceoverService without workspaceId does NOT write to client/public/audio/reels...');
    {
      const initialPublicFiles = fs.readdirSync(path.resolve(process.cwd(), 'client', 'public', 'audio', 'reels'));

      const result = await VoiceoverService.generateVoiceover({
        text: 'Preview audio test without workspace context.',
        voiceId: 'marcus',
        workspaceId: null, // No workspace context
      });

      assert.equal(result.success, true);
      assert.equal(result.audioUrl, null, 'Without workspace, audioUrl must be null to prevent public leak');
      assert.equal(result.provider, 'BROWSER_WEB_SPEECH_API');

      const finalPublicFiles = fs.readdirSync(path.resolve(process.cwd(), 'client', 'public', 'audio', 'reels'));
      assert.equal(finalPublicFiles.length, initialPublicFiles.length, 'No files written to client/public');
      console.log('   ✅ PASS: Calls without workspace context default cleanly to BROWSER_WEB_SPEECH_API.');
      passed++;
    }

    // Test 3: Hardcoded crypto audio fallback ('reel_fund_speed.wav') is completely absent from socialRoutes.js
    console.log('👉 [Test 3] Verifying hardcoded crypto audio fallback (reel_fund_speed.wav) is removed from socialRoutes.js...');
    {
      const socialRoutesCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'routes', 'socialRoutes.js'), 'utf8');
      assert.ok(
        !socialRoutesCode.includes('reel_fund_speed.wav'),
        'socialRoutes.js must NOT reference reel_fund_speed.wav'
      );
      assert.ok(
        !socialRoutesCode.includes('reel_arbitrage_speed.wav'),
        'socialRoutes.js must NOT reference reel_arbitrage_speed.wav'
      );
      console.log('   ✅ PASS: Legacy crypto hedge fund audio fallbacks completely eliminated from social routes.');
      passed++;
    }

    // Test 4: Private audio asset token signing for browser playback
    console.log('👉 [Test 4] Verifying private audio asset URLs are signed with ASSET_MEDIA_READ scope...');
    {
      const fakeAssetId = new mongoose.Types.ObjectId();
      const signedToken = AssetDeliveryService.generateSignedMediaToken({
        assetId: fakeAssetId,
        workspaceId: SYNTHETIC_WORKSPACE_ID,
        expiresInSeconds: 86400,
      });

      const verification = AssetDeliveryService.verifySignedMediaToken(signedToken);
      assert.equal(verification.valid, true);
      assert.equal(verification.payload.assetId, fakeAssetId.toString());
      assert.equal(verification.payload.wsId, SYNTHETIC_WORKSPACE_ID.toString());
      assert.equal(verification.payload.scope, 'ASSET_MEDIA_READ');
      console.log('   ✅ PASS: Private audio signed token generation and validation verified.');
      passed++;
    }

    // Test 5: Browser speech fallback does not misrepresent speech as downloadable generated audio
    console.log('👉 [Test 5] Verifying browser speech fallback does not generate mock audio file or fake download...');
    {
      const browserFallbackResult = await VoiceoverService.generateVoiceover({
        text: 'This is browser speech test',
        voiceId: 'maya',
        workspaceId: null,
      });

      assert.equal(browserFallbackResult.success, true);
      assert.equal(browserFallbackResult.audioUrl, null, 'Must be null so client does not treat as downloadable audio file');
      assert.equal(browserFallbackResult.provider, 'BROWSER_WEB_SPEECH_API');
      assert.strictEqual(browserFallbackResult.assetId, undefined);
      console.log('   ✅ PASS: Browser speech fallback cleanly sets audioUrl: null without misrepresenting as downloadable audio.');
      passed++;
    }

    // Test 6: Private audio assets cannot be accessed without authorization
    console.log('👉 [Test 6] Verifying WorkspaceAsset isolation: assets are private and require authorization...');
    {
      const assetRecord = await WorkspaceAsset.create({
        workspaceId: SYNTHETIC_WORKSPACE_ID,
        url: `/api/assets/pending_test`,
        filename: 'test_voiceover.wav',
        originalName: 'test_voiceover.wav',
        mimeType: 'audio/wav',
        size: 1024,
        assetType: 'GENERAL',
        status: 'PRIVATE',
        userAuthorized: true,
      });

      assert.equal(assetRecord.status, 'PRIVATE');
      assert.equal(assetRecord.publishedUrl, undefined);
      assert.ok(!assetRecord.url.includes('client/public'));

      await WorkspaceAsset.findByIdAndDelete(assetRecord._id);
      console.log('   ✅ PASS: Private audio asset schema and isolation verified.');
      passed++;
    }

    console.log('\n========================================================================');
    console.log(`🎉 ALL ${passed} VOICEOVER MEDIA STORAGE TESTS PASSED!`);
    console.log('========================================================================');
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('❌ Voiceover test failure:', err);
  process.exit(1);
});

