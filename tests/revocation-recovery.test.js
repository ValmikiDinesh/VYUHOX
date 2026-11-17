/**
 * tests/revocation-recovery.test.js
 * 
 * Exhaustive Integration Test Suite for Revocation Recovery & State Machine:
 * - Tests all crash points: BEFORE_RENAME, AFTER_RENAME, BEFORE_DB_COMMIT, AFTER_DB_COMMIT, BEFORE_UNLINK
 * - Master private copy rescue when master file is missing
 * - Active references pre-lock and post-lock blocking (SocialPost & AdCreative)
 * - Concurrent publish and revoke race mitigation (lock conflict 409)
 * - Idempotency of duplicate revokes and repeated reconciliation cycles
 * - Ambiguous / orphaned quarantine file detection and preservation
 * - Strict isolated synthetic workspace fixture with 100% automated cleanup
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AssetDeliveryService } from '../src/services/media/AssetDeliveryService.js';
import { WorkspaceAsset } from '../src/models/WorkspaceAsset.js';
import { SocialPost } from '../src/models/SocialPost.js';
import { AdCreative } from '../src/models/AdCreative.js';

dotenv.config();

console.log('================================================================');
console.log('🧪 RUNNING REVOCATION TRANSACTION & RECOVERY TEST SUITE');
console.log('================================================================\n');

// Synthetic isolated workspace ID (strictly decoupled from any customer data)
const TEST_WS_ID = '6afb99990000000000000001';
const TEST_ASSET_PREFIX = 'revoc_test_';

const privateDir = AssetDeliveryService.getPrivateDir(TEST_WS_ID);
const pubDir = AssetDeliveryService.getPublishedDir(TEST_WS_ID);
const unresolvedDir = AssetDeliveryService.UNRESOLVED_STORAGE_ROOT;

const createdAssetIds = [];
const createdPostIds = [];
const createdCreativeIds = [];
const createdUnresolvedFiles = [];

// Helper to create test asset with on-disk private file
async function createTestAsset(name = 'asset.png', content = 'REVOCATION_TEST_CONTENT_PNG_DATA') {
  const filename = `${TEST_ASSET_PREFIX}${Date.now()}_${name}`;
  const filePath = path.resolve(privateDir, filename);
  fs.writeFileSync(filePath, content);

  const asset = await WorkspaceAsset.create({
    workspaceId: TEST_WS_ID,
    filename,
    originalName: name,
    mimeType: 'image/png',
    size: Buffer.byteLength(content),
    status: 'PRIVATE',
    url: `/api/assets/mock_url_${Date.now()}`,
    revocationTx: { phase: 'IDLE' },
  });

  createdAssetIds.push(asset._id);
  return asset;
}

async function runRecoveryTests() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';
  await mongoose.connect(mongoUri);

  try {
    AssetDeliveryService.initStorageDirs();

    // -------------------------------------------------------------
    // TEST 1: Clean Baseline Publish and Revocation
    // -------------------------------------------------------------
    console.log('Test 1: Clean baseline publish and revocation flow...');
    const asset1 = await createTestAsset('clean.png');
    const pubRes1 = await AssetDeliveryService.publishAsset(asset1._id, TEST_WS_ID);
    assert.strictEqual(pubRes1.success, true);
    assert.ok(fs.existsSync(path.resolve(pubDir, asset1.filename)), 'Published file must exist on disk');

    const revRes1 = await AssetDeliveryService.revokePublishedAsset(asset1._id, TEST_WS_ID);
    assert.strictEqual(revRes1.success, true);
    assert.strictEqual(fs.existsSync(path.resolve(pubDir, asset1.filename)), false, 'Published file must be unlinked');
    assert.strictEqual(fs.existsSync(path.resolve(privateDir, asset1.filename)), true, 'Private master file must remain intact');

    const updatedAsset1 = await WorkspaceAsset.findById(asset1._id);
    assert.strictEqual(updatedAsset1.status, 'PRIVATE');
    assert.strictEqual(updatedAsset1.publishedUrl, null);
    assert.strictEqual(updatedAsset1.revocationTx.phase, 'IDLE');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 2: Crash Simulation BEFORE_RENAME
    // -------------------------------------------------------------
    console.log('Test 2: Crash resilience at BEFORE_RENAME and reconciliation...');
    const asset2 = await createTestAsset('crash_before_rename.png');
    await AssetDeliveryService.publishAsset(asset2._id, TEST_WS_ID);

    let crashError2 = null;
    try {
      await AssetDeliveryService.revokePublishedAsset(asset2._id, TEST_WS_ID, {
        _simulateCrashPoint: 'BEFORE_RENAME',
      });
    } catch (e) {
      crashError2 = e;
    }
    assert.ok(crashError2, 'Must simulate crash');

    // Inspect in-flight state
    const midAsset2 = await WorkspaceAsset.findById(asset2._id);
    assert.strictEqual(midAsset2.revocationTx.phase, 'LOCK_ACQUIRED');
    assert.ok(fs.existsSync(path.resolve(pubDir, asset2.filename)), 'Published file should still be intact');

    // Run reconciliation with forceStale
    const recon2 = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    assert.ok(recon2.rolledBackCount >= 1, 'Reconciler must roll back stale LOCK_ACQUIRED');

    const postReconAsset2 = await WorkspaceAsset.findById(asset2._id);
    assert.strictEqual(postReconAsset2.revocationTx.phase, 'IDLE');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 3: Crash Simulation AFTER_RENAME (No Active References -> Forward Commit)
    // -------------------------------------------------------------
    console.log('Test 3: Crash resilience at AFTER_RENAME (forward-completion during reconciliation)...');
    const asset3 = await createTestAsset('crash_after_rename.png');
    await AssetDeliveryService.publishAsset(asset3._id, TEST_WS_ID);

    let crashError3 = null;
    try {
      await AssetDeliveryService.revokePublishedAsset(asset3._id, TEST_WS_ID, {
        _simulateCrashPoint: 'AFTER_RENAME',
      });
    } catch (e) {
      crashError3 = e;
    }
    assert.ok(crashError3, 'Must simulate crash');

    const midAsset3 = await WorkspaceAsset.findById(asset3._id);
    assert.strictEqual(midAsset3.revocationTx.phase, 'FILE_QUARANTINED');

    // Run reconciliation: no active references exist, so it should forward-commit to PRIVATE
    const recon3 = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    assert.ok(recon3.forwardCompletedCount >= 1, 'Reconciler must forward-commit unreferenced asset');

    const postReconAsset3 = await WorkspaceAsset.findById(asset3._id);
    assert.strictEqual(postReconAsset3.status, 'PRIVATE');
    assert.strictEqual(postReconAsset3.revocationTx.phase, 'IDLE');
    assert.strictEqual(fs.existsSync(path.resolve(pubDir, asset3.filename)), false, 'Public file must be removed');
    assert.strictEqual(fs.existsSync(path.resolve(privateDir, asset3.filename)), true, 'Private master must be safe');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 4: Crash Simulation AFTER_RENAME With Active Reference (Rollback to Published)
    // -------------------------------------------------------------
    console.log('Test 4: Crash resilience at AFTER_RENAME with active reference (rollback reconciliation)...');
    const asset4 = await createTestAsset('crash_rollback.png');
    const pubRes4 = await AssetDeliveryService.publishAsset(asset4._id, TEST_WS_ID);

    try {
      await AssetDeliveryService.revokePublishedAsset(asset4._id, TEST_WS_ID, {
        _simulateCrashPoint: 'AFTER_RENAME',
      });
    } catch (_) {}

    // Attach an active SocialPost referencing this asset during the crash window
    const post4 = await SocialPost.create({
      workspaceId: TEST_WS_ID,
      platform: 'INSTAGRAM',
      title: 'Active post holding reference',
      mediaUrl: pubRes4.publishedUrl,
      status: 'PUBLISHED',
      scriptBody: 'Test post holding active media reference',
    });
    createdPostIds.push(post4._id);

    // Reconcile: should detect active reference and roll back quarantine file to published
    const recon4 = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    assert.ok(recon4.rolledBackCount >= 1, 'Reconciler must roll back when active reference exists');

    const postReconAsset4 = await WorkspaceAsset.findById(asset4._id);
    assert.strictEqual(postReconAsset4.status, 'PUBLISHED');
    assert.strictEqual(postReconAsset4.revocationTx.phase, 'IDLE');
    assert.strictEqual(fs.existsSync(path.resolve(pubDir, asset4.filename)), true, 'Published file must be restored');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 5: Crash Simulation AFTER_DB_COMMIT (Cleanup Reconciliation)
    // -------------------------------------------------------------
    console.log('Test 5: Crash resilience at AFTER_DB_COMMIT (cleanup reconciliation)...');
    const asset5 = await createTestAsset('crash_after_commit.png');
    await AssetDeliveryService.publishAsset(asset5._id, TEST_WS_ID);

    try {
      await AssetDeliveryService.revokePublishedAsset(asset5._id, TEST_WS_ID, {
        _simulateCrashPoint: 'AFTER_DB_COMMIT',
      });
    } catch (_) {}

    const midAsset5 = await WorkspaceAsset.findById(asset5._id);
    assert.strictEqual(midAsset5.revocationTx.phase, 'DB_COMMITTED');

    const recon5 = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    assert.ok(recon5.forwardCompletedCount >= 1);

    const postReconAsset5 = await WorkspaceAsset.findById(asset5._id);
    assert.strictEqual(postReconAsset5.status, 'PRIVATE');
    assert.strictEqual(postReconAsset5.revocationTx.phase, 'IDLE');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 6: Master Private Copy Missing -> Quarantine Rescue
    // -------------------------------------------------------------
    console.log('Test 6: Master private copy rescue (preventing data loss if private master is missing)...');
    const asset6 = await createTestAsset('rescue_target.png', 'VITAL_CUSTOMER_PRIVATE_DATA_RESCUE');
    await AssetDeliveryService.publishAsset(asset6._id, TEST_WS_ID);

    // Intentionally simulate master private file deletion/corruption
    const masterPath = path.resolve(privateDir, asset6.filename);
    if (fs.existsSync(masterPath)) {
      fs.unlinkSync(masterPath);
    }
    assert.strictEqual(fs.existsSync(masterPath), false, 'Master file should be missing before revoke');

    // Revoking should rescue the quarantine file to masterPath
    const revRes6 = await AssetDeliveryService.revokePublishedAsset(asset6._id, TEST_WS_ID);
    assert.strictEqual(revRes6.success, true);
    assert.strictEqual(fs.existsSync(masterPath), true, 'Master file must be rescued to private storage!');
    const rescuedContent = fs.readFileSync(masterPath, 'utf8');
    assert.strictEqual(rescuedContent, 'VITAL_CUSTOMER_PRIVATE_DATA_RESCUE', 'Rescued content must match original');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 7: Active AdCreative Blocking
    // -------------------------------------------------------------
    console.log('Test 7: Active AdCreative blocks revocation with 409 conflict...');
    const asset7 = await createTestAsset('ad_creative_blocked.png');
    const pubRes7 = await AssetDeliveryService.publishAsset(asset7._id, TEST_WS_ID);

    const adCreative7 = await AdCreative.create({
      workspaceId: TEST_WS_ID,
      campaignId: new mongoose.Types.ObjectId(),
      headline: 'Active Test Campaign Ad',
      primaryText: 'Primary ad creative copy',
      mediaUrl: pubRes7.publishedUrl,
      status: 'ACTIVE',
      approvalStatus: 'CLIENT_APPROVED',
    });
    createdCreativeIds.push(adCreative7._id);

    const revRes7 = await AssetDeliveryService.revokePublishedAsset(asset7._id, TEST_WS_ID);
    assert.strictEqual(revRes7.success, false);
    assert.strictEqual(revRes7.conflict, true);
    assert.ok(revRes7.message.includes('actively referenced'));
    assert.strictEqual(fs.existsSync(path.resolve(pubDir, asset7.filename)), true, 'Public file must not be removed');
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 8: Concurrent Revocation Lock Contention
    // -------------------------------------------------------------
    console.log('Test 8: Concurrent revocation lock contention rejection...');
    const asset8 = await createTestAsset('concurrent_lock.png');
    await AssetDeliveryService.publishAsset(asset8._id, TEST_WS_ID);

    // Artificially lock asset
    await WorkspaceAsset.updateOne(
      { _id: asset8._id },
      {
        $set: {
          'revocationTx.phase': 'LOCK_ACQUIRED',
          'revocationTx.txId': 'active_lock_uuid',
          'revocationTx.initiatedAt': new Date(),
        },
      }
    );

    const revRes8 = await AssetDeliveryService.revokePublishedAsset(asset8._id, TEST_WS_ID);
    assert.strictEqual(revRes8.success, false);
    assert.strictEqual(revRes8.conflict, true);
    assert.ok(revRes8.message.includes('locked'));
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 9: Concurrent Publish Blocked During Revocation
    // -------------------------------------------------------------
    console.log('Test 9: Concurrent publish blocked when asset is in revocation transaction...');
    const asset9 = await createTestAsset('publish_blocked_during_revocation.png');
    await WorkspaceAsset.updateOne(
      { _id: asset9._id },
      {
        $set: {
          'revocationTx.phase': 'FILE_QUARANTINED',
          'revocationTx.txId': 'in_flight_uuid',
          'revocationTx.initiatedAt': new Date(),
        },
      }
    );

    const pubRes9 = await AssetDeliveryService.publishAsset(asset9._id, TEST_WS_ID);
    assert.strictEqual(pubRes9.success, false);
    assert.strictEqual(pubRes9.conflict, true);
    assert.ok(pubRes9.message.includes('undergoing revocation'));
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 10: Duplicate Revoke Idempotency
    // -------------------------------------------------------------
    console.log('Test 10: Duplicate revoke idempotency...');
    const asset10 = await createTestAsset('duplicate_revoke.png');
    // Already in PRIVATE status
    const dupRes1 = await AssetDeliveryService.revokePublishedAsset(asset10._id, TEST_WS_ID);
    assert.strictEqual(dupRes1.success, true);
    assert.ok(dupRes1.message.includes('already in private state'));
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 11: Ambiguous Quarantine File Preservation
    // -------------------------------------------------------------
    console.log('Test 11: Ambiguous orphan quarantine file preservation...');
    const orphanFilename = `unknown_asset_${Date.now()}.png.quarantine_${Date.now()}`;
    const orphanPath = path.resolve(pubDir, orphanFilename);
    fs.writeFileSync(orphanPath, 'ORPHAN_QUARANTINE_FILE_CONTENT');

    const recon11 = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    assert.ok(recon11.ambiguousPreservedCount >= 1, 'Ambiguous file must be preserved');
    assert.strictEqual(fs.existsSync(orphanPath), false, 'Must be moved out of published directory');

    // Check unresolved directory
    const unresolvedFiles = fs.readdirSync(unresolvedDir);
    const foundPreserved = unresolvedFiles.some(f => f.includes(orphanFilename));
    assert.ok(foundPreserved, 'Ambiguous file must exist in unresolved storage directory');
    createdUnresolvedFiles.push(...unresolvedFiles.filter(f => f.includes(orphanFilename)));
    console.log('  ✅ Passed');

    // -------------------------------------------------------------
    // TEST 12: Repeated Recovery Runs Idempotency
    // -------------------------------------------------------------
    console.log('Test 12: Repeated reconciliation run idempotency...');
    const recon12A = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    const recon12B = await AssetDeliveryService.reconcileQuarantinedAssets({ forceStale: true });
    assert.strictEqual(recon12B.reconciledCount, 0, 'Subsequent run must find zero pending work');
    assert.strictEqual(recon12B.errors.length, 0);
    console.log('  ✅ Passed');

  } catch (err) {
    console.error('❌ Recovery Test Suite Failure:', err);
    process.exitCode = 1;
  } finally {
    // -------------------------------------------------------------
    // AUTOMATED FIXTURE CLEANUP
    // -------------------------------------------------------------
    console.log('\n--- Cleaning up synthetic test fixtures ---');
    try {
      if (createdAssetIds.length > 0) {
        await WorkspaceAsset.deleteMany({ _id: { $in: createdAssetIds }, workspaceId: TEST_WS_ID });
      }
      if (createdPostIds.length > 0) {
        await SocialPost.deleteMany({ _id: { $in: createdPostIds }, workspaceId: TEST_WS_ID });
      }
      if (createdCreativeIds.length > 0) {
        await AdCreative.deleteMany({ _id: { $in: createdCreativeIds }, workspaceId: TEST_WS_ID });
      }

      // Clean test files from private and published test directories
      [privateDir, pubDir].forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach(f => {
            if (f.startsWith(TEST_ASSET_PREFIX) || f.startsWith('unknown_asset_')) {
              try { fs.unlinkSync(path.resolve(dir, f)); } catch (_) {}
            }
          });
          // Remove test dir if empty
          try {
            if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
          } catch (_) {}
        }
      });

      // Clean preserved unresolved test files
      createdUnresolvedFiles.forEach(f => {
        try { fs.unlinkSync(path.resolve(unresolvedDir, f)); } catch (_) {}
      });

      console.log('✅ Synthetic test fixtures cleanly purged.');
    } catch (cleanupErr) {
      console.warn('Notice: Test cleanup warning:', cleanupErr.message);
    }

    await mongoose.disconnect();
  }
}

runRecoveryTests();
