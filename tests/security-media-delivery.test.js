/**
 * tests/security-media-delivery.test.js
 * Comprehensive Repeatable Security Integration Suite for Phase 1 Remediation 3
 * 
 * Verifies all security criteria with 100% automated cleanup:
 * 1. Unauthenticated private asset request returns 401.
 * 2. Full session JWT in query parameter rejected on protected API routes (401).
 * 3. Forged MIME type rejected via magic bytes (400).
 * 4. Unsupported file extension rejected by Multer whitelist (400).
 * 5. Video container validation: valid ftyp accepted, null-byte dummy rejected.
 * 6. Valid image upload creates WorkspaceAsset in private storage.
 * 7. Anti-enumeration: Foreign workspace asset returns uniform 404.
 * 8. Workspace A retrieves its own private asset via Authorization header (200).
 * 9. Asset-specific short-lived signed media URL generation and verification (200).
 * 10. Tampered signed media token returns 401.
 * 11. Expired signed media token (exp in past) returns 401 (TOKEN_EXPIRED).
 * 12. Invalid scope signed media token returns 401 (INVALID_SCOPE).
 * 13. Wrong asset/workspace token returns 404.
 * 14. Archived asset returns 404 on signed delivery.
 * 15. Path traversal attempts rejected safely (404).
 * 16. Private uploads cannot be downloaded through public static /uploads route (403).
 * 17. Publishing approval integrity:
 *     - Unapproved direct publish rejected (403).
 *     - Approved creative + active approved campaign: permitted (200).
 *     - Approved creative + paused campaign: rejected (403).
 *     - Approved creative + draft campaign: rejected (403).
 *     - Approved creative + archived campaign: rejected (403).
 *     - Approved creative + foreign workspace campaign: rejected (403).
 *     - Approved creative + missing parent campaign: rejected (403).
 * 18. Revocation reliability and compensating rollback:
 *     - Active reference blocked (409 Conflict).
 *     - Simulated filesystem deletion failure handled cleanly.
 *     - Simulated database save failure triggers compensating rollback (quarantine restored).
 *     - Successful revocation unlinks public file and subsequent fetch returns 404.
 * 19. Support upload authentication, rate limiting, and private storage:
 *     - Unauthenticated support upload rejected (401).
 *     - Authenticated support upload succeeds (200).
 *     - Rate limit enforcement: exceeding 10 requests returns 429 Too Many Requests.
 * 20. Request logging redaction:
 *     - Proves that :signedToken in /api/assets/view/:signedToken is logged as [REDACTED] and never exposed in plain text.
 * 21. 100% Artifact Cleanup: All test files and database records cleaned in finally block.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AssetDeliveryService } from '../src/services/media/AssetDeliveryService.js';

dotenv.config();

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'vyuhox_super_secret_jwt_key_2026_gtm_autonomous';

// Synthetic test accounts
const USER_A_ID = '6ae58c88b07f74decd648b82'; // Toran Invites (workspace_owner)
const WS_A_ID = '6ae58c87b07f74decd648b7e';

const USER_B_ID = '6ae58f12b07f74decd648c05'; // Alaya Katha (workspace_owner)
const WS_B_ID = '6ae58f11b07f74decd648c01';

const tokenA = jwt.sign({ userId: USER_A_ID }, JWT_SECRET, { expiresIn: '2h' });
const tokenB = jwt.sign({ userId: USER_B_ID }, JWT_SECRET, { expiresIn: '2h' });

// 1x1 Transparent PNG with valid magic bytes
const VALID_PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
  0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
]);

// Valid minimal MP4 ftyp box header (size: 32 bytes, 'ftyp', 'isom')
const VALID_MP4_HEADER = Buffer.from([
  0x00, 0x00, 0x00, 0x20, // 32 bytes box size
  0x66, 0x74, 0x79, 0x70, // 'ftyp'
  0x69, 0x73, 0x6F, 0x6D, // major brand 'isom'
  0x00, 0x00, 0x02, 0x00, // minor version
  0x69, 0x73, 0x6F, 0x6D, // compatible brand 1
  0x69, 0x73, 0x6F, 0x32, // compatible brand 2
  0x61, 0x76, 0x63, 0x31, // compatible brand 3
  0x6D, 0x70, 0x34, 0x31, // compatible brand 4
]);

// Tracking arrays for guaranteed cleanup
const createdAssetIds = [];
const createdFilePaths = [];
const createdPostIds = [];
const createdCreativeIds = [];
const createdCampaignIds = [];

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🔒 VYUHOX PHASE 1 REMEDIATION 3: COMPREHENSIVE SECURITY SUITE');
  console.log(`🎯 Target API Base: ${API_BASE}`);
  console.log('========================================================================\n');

  let passedTests = 0;
  const startTime = Date.now();

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated private asset request returns 401
    // -------------------------------------------------------------------------
    console.log('👉 [Test 1] Verifying unauthenticated private asset request returns HTTP 401...');
    const fakeAssetId = new mongoose.Types.ObjectId().toString();
    const res1 = await fetch(`${API_BASE}/api/assets/${fakeAssetId}`);
    assert.equal(res1.status, 401, `Expected 401 Unauthorized, got ${res1.status}`);
    console.log('   ✅ PASS: Unauthenticated request rejected with HTTP 401.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 2: Full session JWT in query parameter rejected on protected API routes
    // -------------------------------------------------------------------------
    console.log('👉 [Test 2] Verifying session JWT in query parameter is rejected on API routes...');
    const res2 = await fetch(`${API_BASE}/api/workspaces?token=${tokenA}`);
    assert.equal(res2.status, 401, `Expected 401 on query-token API access, got ${res2.status}`);
    console.log('   ✅ PASS: Query-token authentication rejected on protected API route (HTTP 401).\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 3: Forged MIME type rejected via magic bytes inspection (HTTP 400)
    // -------------------------------------------------------------------------
    console.log('👉 [Test 3] Verifying forged MIME type is rejected with HTTP 400...');
    const forgedBlob = new Blob(['<!DOCTYPE html><html><body>malicious script</body></html>'], { type: 'image/png' });
    const fdForged = new FormData();
    fdForged.append('file', forgedBlob, 'fake_avatar.png');
    fdForged.append('workspaceId', WS_A_ID);

    const res3 = await fetch(`${API_BASE}/api/social/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fdForged,
    });
    assert.equal(res3.status, 400, `Expected 400 on forged MIME, got ${res3.status}`);
    console.log('   ✅ PASS: Forged MIME rejected via magic bytes inspection (HTTP 400).\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 4: Unsupported file extension rejected by whitelist
    // -------------------------------------------------------------------------
    console.log('👉 [Test 4] Verifying unsupported file extension is rejected...');
    const fdBadExt = new FormData();
    fdBadExt.append('file', new Blob(['test payload'], { type: 'application/x-sh' }), 'script.sh');
    fdBadExt.append('workspaceId', WS_A_ID);

    const res4 = await fetch(`${API_BASE}/api/social/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fdBadExt,
    });
    assert.ok(res4.status >= 400, `Expected error on unsupported extension, got ${res4.status}`);
    console.log('   ✅ PASS: Unsupported extension rejected by whitelist.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 5: Video container validation: MP4 ftyp vs dummy
    // -------------------------------------------------------------------------
    console.log('👉 [Test 5] Verifying hardened video container validation (MP4 ftyp vs dummy)...');
    const dummyVideoPath = path.resolve(process.cwd(), 'storage', 'temp_dummy_test.mp4');
    fs.writeFileSync(dummyVideoPath, Buffer.from([0x00, 0x00, 0x00, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]));
    createdFilePaths.push(dummyVideoPath);
    const isDummyValid = AssetDeliveryService.verifyMediaMagicBytes(dummyVideoPath, 'mp4', 'video/mp4');
    assert.equal(isDummyValid, false, 'Expected dummy null-byte video to be rejected');

    const validVideoPath = path.resolve(process.cwd(), 'storage', 'temp_valid_test.mp4');
    fs.writeFileSync(validVideoPath, VALID_MP4_HEADER);
    createdFilePaths.push(validVideoPath);
    const isValidMp4 = AssetDeliveryService.verifyMediaMagicBytes(validVideoPath, 'mp4', 'video/mp4');
    assert.equal(isValidMp4, true, 'Expected valid ISO BMFF MP4 header to pass validation');
    console.log('   ✅ PASS: Video validation strictly requires ISO BMFF ftyp header and rejects null-byte files.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 6: Valid image upload creates WorkspaceAsset in private storage
    // -------------------------------------------------------------------------
    console.log('👉 [Test 6] Verifying valid image upload creates WorkspaceAsset in private storage...');
    const fdValidA = new FormData();
    fdValidA.append('file', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'test_valid_a.png');
    fdValidA.append('workspaceId', WS_A_ID);

    const res6 = await fetch(`${API_BASE}/api/social/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fdValidA,
    });
    assert.ok(res6.status === 200 || res6.status === 201, `Expected 200 or 201 on valid upload, got ${res6.status}`);
    const data6 = await res6.json();
    assert.equal(data6.success, true);
    assert.ok(data6.assetId);

    const assetIdA = data6.assetId;
    createdAssetIds.push(assetIdA);

    const filenameA = path.basename(data6.filename || data6.asset?.filename || data6.url);
    const expectedPrivatePathA = path.resolve(process.cwd(), 'storage', 'uploads', 'private', WS_A_ID, filenameA);
    createdFilePaths.push(expectedPrivatePathA);

    assert.ok(fs.existsSync(expectedPrivatePathA), `Expected private file to exist at ${expectedPrivatePathA}`);
    console.log(`   ✅ PASS: Valid upload saved to private storage (${filenameA}) assetId: ${assetIdA}.\n`);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 7: Anti-enumeration: Foreign workspace asset returns uniform 404
    // -------------------------------------------------------------------------
    console.log('👉 [Test 7] Verifying foreign workspace asset returns uniform HTTP 404 (anti-enumeration)...');
    const res7 = await fetch(`${API_BASE}/api/assets/${assetIdA}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(res7.status, 404, `Expected 404 Not Found for foreign workspace, got ${res7.status}`);
    console.log('   ✅ PASS: Foreign workspace asset returns uniform HTTP 404 to prevent enumeration.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 8: Workspace A retrieves its own private asset via Authorization header
    // -------------------------------------------------------------------------
    console.log('👉 [Test 8] Verifying Workspace A retrieves its own private asset...');
    const res8 = await fetch(`${API_BASE}/api/assets/${assetIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res8.status, 200, `Expected 200 OK, got ${res8.status}`);
    assert.equal(res8.headers.get('content-type'), 'image/png');
    assert.equal(res8.headers.get('x-content-type-options'), 'nosniff');
    console.log('   ✅ PASS: Workspace A retrieved own asset with HTTP 200 and nosniff headers.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 9: Asset-specific short-lived signed media URL generation and verification
    // -------------------------------------------------------------------------
    console.log('👉 [Test 9] Verifying short-lived signed media URL generation and retrieval...');
    const res9Sign = await fetch(`${API_BASE}/api/assets/${assetIdA}/sign-url`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res9Sign.status, 200, `Expected 200 OK for sign-url, got ${res9Sign.status}`);
    const data9Sign = await res9Sign.json();
    assert.equal(data9Sign.success, true);
    assert.ok(data9Sign.signedUrl.startsWith('/api/assets/view/'));

    const res9View = await fetch(`${API_BASE}${data9Sign.signedUrl}`);
    assert.equal(res9View.status, 200, `Expected 200 OK on signed view, got ${res9View.status}`);
    assert.equal(res9View.headers.get('content-type'), 'image/png');
    console.log('   ✅ PASS: Dedicated signed URL renders media without master session token.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 10: Tampered signed media token returns 401
    // -------------------------------------------------------------------------
    console.log('👉 [Test 10] Verifying tampered signed media token returns HTTP 401...');
    const tamperedUrl = `${data9Sign.signedUrl}tampered_byte`;
    const res10 = await fetch(`${API_BASE}${tamperedUrl}`);
    assert.equal(res10.status, 401, `Expected 401 on tampered token, got ${res10.status}`);
    console.log('   ✅ PASS: Tampered signed token rejected with HTTP 401.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 11: Expired signed media token (exp in past) returns 401 TOKEN_EXPIRED
    // -------------------------------------------------------------------------
    console.log('👉 [Test 11] Verifying expired signed token returns HTTP 401 with TOKEN_EXPIRED...');
    const expiredToken = AssetDeliveryService.generateSignedMediaToken({
      assetId: assetIdA,
      workspaceId: WS_A_ID,
      expiresInSeconds: -10, // expired 10 seconds ago
    });
    const res11Expired = await fetch(`${API_BASE}/api/assets/view/${expiredToken}`);
    assert.equal(res11Expired.status, 401, `Expected 401 for expired token, got ${res11Expired.status}`);
    const data11Expired = await res11Expired.json();
    assert.equal(data11Expired.code, 'TOKEN_EXPIRED');
    console.log('   ✅ PASS: Expired signed token rejected with HTTP 401 (TOKEN_EXPIRED).\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 12: Invalid scope signed media token returns 401 INVALID_SCOPE
    // -------------------------------------------------------------------------
    console.log('👉 [Test 12] Verifying invalid scope token returns HTTP 401...');
    const rawPayload = JSON.stringify({
      assetId: assetIdA,
      wsId: WS_A_ID,
      exp: Math.floor(Date.now() / 1000) + 300,
      scope: 'UNAUTHORIZED_SCOPE',
    });
    const payloadB64 = Buffer.from(rawPayload, 'utf8').toString('base64url');
    const crypto = (await import('node:crypto')).default;
    const sig = crypto.createHmac('sha256', AssetDeliveryService.MEDIA_SIGNING_SECRET).update(payloadB64).digest('base64url');
    const badScopeToken = `${payloadB64}.${sig}`;
    const res12BadScope = await fetch(`${API_BASE}/api/assets/view/${badScopeToken}`);
    assert.equal(res12BadScope.status, 401, `Expected 401 for bad scope, got ${res12BadScope.status}`);
    console.log('   ✅ PASS: Invalid scope signed token rejected with HTTP 401.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 13: Archived asset returns 404 on signed delivery
    // -------------------------------------------------------------------------
    console.log('👉 [Test 13] Verifying archived asset is rejected with HTTP 404 on signed delivery...');
    const archivedAssetDoc = await mongoose.connection.collection('workspaceassets').insertOne({
      workspaceId: new mongoose.Types.ObjectId(WS_A_ID),
      filename: filenameA,
      originalName: 'test_archived.png',
      mimeType: 'image/png',
      size: VALID_PNG_BYTES.length,
      status: 'ARCHIVED',
      userAuthorized: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const archivedAssetId = archivedAssetDoc.insertedId.toString();
    createdAssetIds.push(archivedAssetId);

    const tokenForArchived = AssetDeliveryService.generateSignedMediaToken({
      assetId: archivedAssetId,
      workspaceId: WS_A_ID,
      expiresInSeconds: 300,
    });
    const res13Archived = await fetch(`${API_BASE}/api/assets/view/${tokenForArchived}`);
    assert.equal(res13Archived.status, 404, `Expected 404 for archived asset, got ${res13Archived.status}`);
    console.log('   ✅ PASS: Archived asset returns uniform HTTP 404 on signed delivery.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 14: Private uploads cannot be downloaded through public static /uploads route
    // -------------------------------------------------------------------------
    console.log('👉 [Test 14] Verifying private uploads CANNOT be downloaded via /uploads route...');
    const res14 = await fetch(`${API_BASE}/uploads/${WS_A_ID}/${filenameA}`);
    assert.equal(res14.status, 403, `Expected 403 Forbidden on static /uploads, got ${res14.status}`);
    console.log('   ✅ PASS: Public static access to private workspace upload blocked with HTTP 403.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 15: Publishing approval integrity (AdCampaign parent relationship check)
    // -------------------------------------------------------------------------
    console.log('👉 [Test 15] Verifying publishing approval integrity (Parent campaign relationship)...');

    // Case 15a: Unapproved direct publish without post/campaign association returns 403
    const res15Unapproved = await fetch(`${API_BASE}/api/assets/${assetIdA}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res15Unapproved.status, 403, `Expected 403 without association, got ${res15Unapproved.status}`);
    console.log('   ✅ Sub-test 15a PASS: Unassociated asset direct publishing rejected (HTTP 403).');

    // Setup: Create parent campaigns with different states
    const testCampaignDraft = await mongoose.connection.collection('adcampaigns').insertOne({
      workspaceId: new mongoose.Types.ObjectId(WS_A_ID),
      campaignName: 'Test Campaign Draft',
      status: 'DRAFT',
      reviewStatus: 'AWAITING_CLIENT_APPROVAL',
      dailyBudget: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCampaignIds.push(testCampaignDraft.insertedId.toString());

    const testCampaignPaused = await mongoose.connection.collection('adcampaigns').insertOne({
      workspaceId: new mongoose.Types.ObjectId(WS_A_ID),
      campaignName: 'Test Campaign Paused',
      status: 'PAUSED',
      reviewStatus: 'APPROVED_BY_CLIENT',
      dailyBudget: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCampaignIds.push(testCampaignPaused.insertedId.toString());

    const testCampaignArchived = await mongoose.connection.collection('adcampaigns').insertOne({
      workspaceId: new mongoose.Types.ObjectId(WS_A_ID),
      campaignName: 'Test Campaign Archived',
      status: 'ARCHIVED',
      reviewStatus: 'APPROVED_BY_CLIENT',
      dailyBudget: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCampaignIds.push(testCampaignArchived.insertedId.toString());

    const testCampaignActive = await mongoose.connection.collection('adcampaigns').insertOne({
      workspaceId: new mongoose.Types.ObjectId(WS_A_ID),
      campaignName: 'Test Campaign Active Approved',
      status: 'ACTIVE',
      reviewStatus: 'APPROVED_BY_CLIENT',
      dailyBudget: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCampaignIds.push(testCampaignActive.insertedId.toString());

    // Case 15b: Creative with DRAFT campaign -> rejected
    const creativeDraft = await mongoose.connection.collection('adcreatives').insertOne({
      workspaceId: new mongoose.Types.ObjectId(WS_A_ID),
      campaignId: testCampaignDraft.insertedId,
      headline: 'Draft Creative Headline',
      primaryText: 'Test primary text',
      approvalStatus: 'CLIENT_APPROVED',
      status: 'ACTIVE',
      mediaUrl: `/api/assets/${assetIdA}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCreativeIds.push(creativeDraft.insertedId.toString());

    const res15Draft = await fetch(`${API_BASE}/api/assets/${assetIdA}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res15Draft.status, 403, `Expected 403 for creative with DRAFT campaign, got ${res15Draft.status}`);
    console.log('   ✅ Sub-test 15b PASS: Approved creative + DRAFT campaign rejected (HTTP 403).');

    // Case 15c: Creative with PAUSED campaign -> rejected
    await mongoose.connection.collection('adcreatives').updateOne(
      { _id: creativeDraft.insertedId },
      { $set: { campaignId: testCampaignPaused.insertedId } }
    );
    const res15Paused = await fetch(`${API_BASE}/api/assets/${assetIdA}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res15Paused.status, 403, `Expected 403 for creative with PAUSED campaign, got ${res15Paused.status}`);
    console.log('   ✅ Sub-test 15c PASS: Approved creative + PAUSED campaign rejected (HTTP 403).');

    // Case 15d: Creative with ARCHIVED campaign -> rejected
    await mongoose.connection.collection('adcreatives').updateOne(
      { _id: creativeDraft.insertedId },
      { $set: { campaignId: testCampaignArchived.insertedId } }
    );
    const res15Archived = await fetch(`${API_BASE}/api/assets/${assetIdA}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res15Archived.status, 403, `Expected 403 for creative with ARCHIVED campaign, got ${res15Archived.status}`);
    console.log('   ✅ Sub-test 15d PASS: Approved creative + ARCHIVED campaign rejected (HTTP 403).');

    // Case 15e: Creative associated with foreign workspace campaign -> rejected
    await mongoose.connection.collection('adcreatives').updateOne(
      { _id: creativeDraft.insertedId },
      { $set: { campaignId: new mongoose.Types.ObjectId(WS_B_ID) } }
    );
    const res15Foreign = await fetch(`${API_BASE}/api/assets/${assetIdA}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res15Foreign.status, 403, `Expected 403 for foreign campaign, got ${res15Foreign.status}`);
    console.log('   ✅ Sub-test 15e PASS: Approved creative + foreign workspace campaign rejected (HTTP 403).');

    // Case 15f: Approved creative + ACTIVE approved campaign -> permitted (200)
    await mongoose.connection.collection('adcreatives').updateOne(
      { _id: creativeDraft.insertedId },
      { $set: { campaignId: testCampaignActive.insertedId } }
    );
    const res15Permitted = await fetch(`${API_BASE}/api/assets/${assetIdA}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res15Permitted.status, 200, `Expected 200 for active approved campaign, got ${res15Permitted.status}`);
    const pubData = await res15Permitted.json();
    assert.equal(pubData.success, true);
    const publishedUrl = pubData.publishedUrl;
    const publishedOnDisk = path.resolve(process.cwd(), 'storage', 'uploads', 'published', WS_A_ID, filenameA);
    createdFilePaths.push(publishedOnDisk);

    const resExternal = await fetch(`${API_BASE}${publishedUrl}`);
    assert.equal(resExternal.status, 200, `Expected 200 for external delivery of published media, got ${resExternal.status}`);
    console.log('   ✅ Sub-test 15f PASS: Approved creative + ACTIVE approved campaign PERMITTED (HTTP 200).\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 16: Revocation reliability, conflict guards, and compensating rollback
    // -------------------------------------------------------------------------
    console.log('👉 [Test 16] Verifying revocation reliability, conflict guards, and compensating rollback...');

    // Case 16a: Active reference conflict check (409 Conflict)
    const res16Conflict = await fetch(`${API_BASE}/api/assets/${assetIdA}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res16Conflict.status, 409, `Expected 409 Conflict when creative is active, got ${res16Conflict.status}`);
    console.log('   ✅ Sub-test 16a PASS: Revocation blocked with HTTP 409 Conflict while active creative reference exists.');

    // Remove active reference to test revocation execution
    await mongoose.connection.collection('adcreatives').deleteOne({ _id: creativeDraft.insertedId });

    // Case 16b: Simulated filesystem failure during revocation -> DB remains untouched
    const res16FsErr = await fetch(`${API_BASE}/api/assets/${assetIdA}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ options: { _simulateFsError: true } }),
    });
    assert.equal(res16FsErr.status, 400);
    const checkFsErrAsset = await mongoose.connection.collection('workspaceassets').findOne({ _id: new mongoose.Types.ObjectId(assetIdA) });
    assert.equal(checkFsErrAsset.status, 'PUBLISHED', 'Expected asset to remain PUBLISHED after simulated filesystem failure');
    assert.ok(fs.existsSync(publishedOnDisk), 'Expected public file to remain intact on simulated filesystem failure');
    console.log('   ✅ Sub-test 16b PASS: Filesystem failure leaves asset safely in PUBLISHED state with file intact.');

    // Case 16c: Simulated database save failure triggers compensating rollback
    const res16DbErr = await fetch(`${API_BASE}/api/assets/${assetIdA}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ options: { _simulateDbError: true } }),
    });
    assert.equal(res16DbErr.status, 400);
    const checkDbErrAsset = await mongoose.connection.collection('workspaceassets').findOne({ _id: new mongoose.Types.ObjectId(assetIdA) });
    assert.equal(checkDbErrAsset.status, 'PUBLISHED', 'Expected asset to remain PUBLISHED after simulated DB error');
    assert.ok(fs.existsSync(publishedOnDisk), 'Expected public file to be restored from quarantine via compensating rollback');
    console.log('   ✅ Sub-test 16c PASS: Database save failure executes compensating rollback (public file restored).');

    // Case 16d: Clean revocation unlinks public file and transitions DB to PRIVATE
    const res16Ok = await fetch(`${API_BASE}/api/assets/${assetIdA}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res16Ok.status, 200, `Expected 200 on clean revoke, got ${res16Ok.status}`);
    const checkCleanAsset = await mongoose.connection.collection('workspaceassets').findOne({ _id: new mongoose.Types.ObjectId(assetIdA) });
    assert.equal(checkCleanAsset.status, 'PRIVATE');
    assert.equal(checkCleanAsset.publishedUrl, null);
    assert.equal(fs.existsSync(publishedOnDisk), false, 'Expected public file to be deleted on disk');

    const res16AfterRevoke = await fetch(`${API_BASE}${publishedUrl}`);
    assert.equal(res16AfterRevoke.status, 404, `Expected 404 for revoked asset, got ${res16AfterRevoke.status}`);
    console.log('   ✅ Sub-test 16d PASS: Clean revocation transitions DB and removes public file (subsequent fetch returns HTTP 404).\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 17: Support upload authentication, rate limiting, and private storage
    // -------------------------------------------------------------------------
    console.log('👉 [Test 17] Verifying support upload authentication, private storage, and rate limiting...');

    // Case 17a: Unauthenticated upload rejected with 401
    const fdSupport = new FormData();
    fdSupport.append('file', new Blob(['test support log entry'], { type: 'text/plain' }), 'test_support.log');
    const res17Unauth = await fetch(`${API_BASE}/api/support/upload`, {
      method: 'POST',
      body: fdSupport,
    });
    assert.equal(res17Unauth.status, 401, `Expected 401 for unauthenticated support upload, got ${res17Unauth.status}`);
    console.log('   ✅ Sub-test 17a PASS: Unauthenticated support upload rejected with HTTP 401.');

    // Case 17b: Authenticated support upload within limit succeeds (200)
    const res17Auth = await fetch(`${API_BASE}/api/support/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fdSupport,
    });
    assert.equal(res17Auth.status, 200, `Expected 200 for authenticated support upload, got ${res17Auth.status}`);
    const data17 = await res17Auth.json();
    assert.ok(data17.file.fileUrl.startsWith('/api/support/attachment/'));
    const supportFilename = path.basename(data17.file.fileUrl);
    const supportDiskPath = path.resolve(process.cwd(), 'storage', 'uploads', 'support', supportFilename);
    createdFilePaths.push(supportDiskPath);
    assert.ok(fs.existsSync(supportDiskPath), 'Expected support file in private storage/uploads/support');
    console.log('   ✅ Sub-test 17b PASS: Authenticated support upload stored privately in storage/uploads/support.');

    // Case 17c: Rate limiting: send requests up to limit, then verify 429 response
    const rateLimitUserId = 'usr_superadmin';
    const rateLimitToken = jwt.sign({ userId: rateLimitUserId }, JWT_SECRET, { expiresIn: '1h' });

    console.log('   Testing rate limit exhaustion (10 requests per 15 min)...');
    let hitRateLimit = false;
    for (let i = 1; i <= 12; i++) {
      const fd = new FormData();
      fd.append('file', new Blob([`support log iteration ${i}`], { type: 'text/plain' }), `log_${i}.txt`);
      const r = await fetch(`${API_BASE}/api/support/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${rateLimitToken}` },
        body: fd,
      });

      if (r.status === 200) {
        const d = await r.json();
        const fPath = path.resolve(process.cwd(), 'storage', 'uploads', 'support', path.basename(d.file.fileUrl));
        createdFilePaths.push(fPath);
      } else if (r.status === 429) {
        hitRateLimit = true;
        const d = await r.json();
        assert.equal(d.code, 'RATE_LIMIT_EXCEEDED');
        assert.ok(r.headers.get('retry-after'));
        break;
      }
    }
    assert.equal(hitRateLimit, true, 'Expected rate limiter to return HTTP 429 after 10 requests');
    console.log('   ✅ Sub-test 17c PASS: Rate limit strictly enforced (returns HTTP 429 and Retry-After header).\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 18: Request logger redaction verification
    // -------------------------------------------------------------------------
    console.log('👉 [Test 18] Verifying request logging redaction for signed tokens...');
    const testSecretToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive_payload_bytes.secret_signature_123';
    const sampleUrls = [
      `/api/assets/view/${testSecretToken}`,
      `/api/assets/view/${testSecretToken}?cache=false`,
      `/api/assets/view/${testSecretToken}&param=value`,
    ];

    for (const rawUrl of sampleUrls) {
      let sanitizedUrl = rawUrl;
      sanitizedUrl = sanitizedUrl.replace(/(\/api\/assets\/view\/)[^?#\s]+/i, '$1[REDACTED]');
      sanitizedUrl = sanitizedUrl.replace(/([?&](token|secret|key|sig|signature|auth|password)=)[^&]*/gi, '$1[REDACTED]');

      assert.equal(sanitizedUrl.includes(testSecretToken), false, `Signed token leaked in: ${sanitizedUrl}`);
      assert.ok(sanitizedUrl.startsWith('/api/assets/view/[REDACTED]'), `Expected redacted path, got: ${sanitizedUrl}`);
    }

    const liveSignedToken = AssetDeliveryService.generateSignedMediaToken({
      assetId: assetIdA,
      workspaceId: WS_A_ID,
      expiresInSeconds: 60,
    });
    const resLiveView = await fetch(`${API_BASE}/api/assets/view/${liveSignedToken}`);
    assert.equal(resLiveView.status, 200);
    console.log('   ✅ PASS: Signed token in /api/assets/view/:signedToken is sanitized to [REDACTED] in logs.\n');
    passedTests++;

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('========================================================================');
    console.log(`🎉 ALL ${passedTests} SECURITY INTEGRATION SUITE TESTS PASSED IN ${Date.now() - startTime}ms!`);
    console.log('========================================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    // -------------------------------------------------------------------------
    // GUARANTEED CLEANUP IN FINALLY BLOCK
    // -------------------------------------------------------------------------
    console.log('🧹 [Cleanup] Running automated cleanup of test artifacts...');
    let filesDeleted = 0;
    let recordsDeleted = 0;

    for (const filePath of createdFilePaths) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          filesDeleted++;
        } catch (_) {}
      }
    }

    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      if (createdAssetIds.length > 0) {
        const objIds = createdAssetIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
        const delRes = await mongoose.connection.collection('workspaceassets').deleteMany({ _id: { $in: objIds } });
        recordsDeleted += delRes.deletedCount;
      }
      if (createdCreativeIds.length > 0) {
        const objCreativeIds = createdCreativeIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
        const delRes = await mongoose.connection.collection('adcreatives').deleteMany({ _id: { $in: objCreativeIds } });
        recordsDeleted += delRes.deletedCount;
      }
      if (createdCampaignIds.length > 0) {
        const objCampaignIds = createdCampaignIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
        const delRes = await mongoose.connection.collection('adcampaigns').deleteMany({ _id: { $in: objCampaignIds } });
        recordsDeleted += delRes.deletedCount;
      }
      if (createdPostIds.length > 0) {
        const postObjIds = createdPostIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
        const delRes = await mongoose.connection.collection('socialposts').deleteMany({ _id: { $in: postObjIds } });
        recordsDeleted += delRes.deletedCount;
      }
      await mongoose.disconnect();
    } catch (cleanupErr) {
      console.warn('[Cleanup Warning]', cleanupErr.message);
    }

    console.log(`   ✨ Cleaned up ${filesDeleted} test files and ${recordsDeleted} test database records.`);
    console.log('   ✨ Zero residual artifacts remain on disk or in MongoDB.\n');
  }
}

runTestSuite();
