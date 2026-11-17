/**
 * tests/r2-storage-adapter.test.js
 * 
 * Verifies Cloudflare R2 and Local Storage Adapters:
 * - Interface inheritance and contract compliance
 * - Workspace-scoped key isolation for private, published, and support assets
 * - Dual-bucket separation (Private Bucket vs Published Bucket)
 * - Configuration validation and strict production fail-closed behavior (NO silent fallback)
 * - Public delivery URL generation
 * - LocalStorageAdapter complete lifecycle (upload, stream, publish, revoke, support, delete)
 * - Error handling when cloud SDK is unconfigured
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { R2StorageAdapter } from '../src/services/media/storage/R2StorageAdapter.js';
import { LocalStorageAdapter } from '../src/services/media/storage/LocalStorageAdapter.js';
import { StorageAdapter } from '../src/services/media/storage/StorageAdapter.js';
import { validateStorageConfiguration, getStorageAdapter } from '../src/services/media/storage/index.js';

console.log('================================================================');
console.log('🧪 RUNNING CLOUDFLARE R2 & STORAGE ADAPTER TEST SUITE');
console.log('================================================================\n');

// 1. Interface Inheritance
console.log('Test 1: Interface compliance and inheritance...');
const r2Adapter = new R2StorageAdapter();
const localAdapter = new LocalStorageAdapter();
assert.ok(r2Adapter instanceof StorageAdapter, 'R2StorageAdapter must inherit from StorageAdapter');
assert.ok(localAdapter instanceof StorageAdapter, 'LocalStorageAdapter must inherit from StorageAdapter');
assert.strictEqual(r2Adapter.isCloudStorage, true);
assert.strictEqual(localAdapter.isCloudStorage, false);
console.log('  ✅ Passed');

// 2. Configuration Validation - Incomplete Config
console.log('Test 2: Configuration validation with missing credentials...');
const unconfiguredAdapter = new R2StorageAdapter({});
const unconfResult = unconfiguredAdapter.validateConfiguration();
assert.strictEqual(unconfResult.valid, false, 'Must fail validation when credentials are empty');
assert.ok(unconfResult.missing.length >= 3, 'Must report missing required keys');
console.log('  ✅ Passed');

// 3. Configuration Validation - Dual-Bucket Complete Valid Config
console.log('Test 3: Configuration validation with complete dual-bucket parameters...');
const configuredAdapter = new R2StorageAdapter({
  accountId: 'test_cloudflare_account_12345',
  accessKeyId: 'test_access_key_abcde',
  secretAccessKey: 'test_secret_key_9876543210abcdef',
  privateBucket: 'vyuhox-private-master-vault',
  publishedBucket: 'vyuhox-public-cdn-vault',
  publicDomain: 'https://cdn.vyuhox.com',
});
const confResult = configuredAdapter.validateConfiguration();
assert.strictEqual(confResult.valid, true, 'Must pass validation when all parameters are present');
assert.strictEqual(configuredAdapter.privateBucket, 'vyuhox-private-master-vault');
assert.strictEqual(configuredAdapter.publishedBucket, 'vyuhox-public-cdn-vault');
console.log('  ✅ Passed');

// 4. Workspace-Scoped Key Isolation & Dual-Bucket Separation
console.log('Test 4: Strict workspace-scoped key isolation & dual-bucket prefixes...');
const wsId = '6ae1f5d0880ed8a2eb96e282';
const filename = 'luxury_wedding_invite.png';

const privateKey = configuredAdapter.getPrivateKey(wsId, filename);
assert.strictEqual(privateKey, `workspaces/${wsId}/${filename}`, 'Private key must follow workspaces/:wsId/:filename');

const publishedKey = configuredAdapter.getPublishedKey(wsId, filename);
assert.strictEqual(publishedKey, `published/${wsId}/${filename}`, 'Published key must follow published/:wsId/:filename');

const supportKey = configuredAdapter.getSupportKey('ticket_receipt.pdf');
assert.strictEqual(supportKey, 'support/ticket_receipt.pdf', 'Support key must follow support/:filename');

// Path traversal defense in key generator
const traversalFilename = '../../etc/passwd';
const safeTraversedKey = configuredAdapter.getPrivateKey(wsId, traversalFilename);
assert.strictEqual(safeTraversedKey, `workspaces/${wsId}/passwd`, 'Key generator must sanitize traversal filenames via path.basename');
console.log('  ✅ Passed');

// 5. Public Delivery URL Construction
console.log('Test 5: Public delivery URL generation (custom CDN domain vs default R2 endpoint)...');
const cdnUrl = configuredAdapter.getPublicDeliveryUrl(wsId, filename);
assert.strictEqual(cdnUrl, `https://cdn.vyuhox.com/published/${wsId}/${filename}`);

const defaultEndpointAdapter = new R2StorageAdapter({
  accountId: 'cf_acc_123',
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  publishedBucket: 'cdn-media-bucket',
  privateBucket: 'private-vault-bucket',
});
const defaultUrl = defaultEndpointAdapter.getPublicDeliveryUrl(wsId, filename);
assert.strictEqual(defaultUrl, `https://cdn-media-bucket.cf_acc_123.r2.cloudflarestorage.com/published/${wsId}/${filename}`);
console.log('  ✅ Passed');

// 6. Fail-Closed Error Handling When SDK/Credentials are Unconfigured
console.log('Test 6: Fail-closed error handling when SDK/credentials are unconfigured...');
let saveError = null;
try {
  await unconfiguredAdapter.savePrivate(wsId, filename, Buffer.from('test'));
} catch (e) {
  saveError = e;
}
assert.ok(saveError, 'Must throw error when attempting save without credentials');
assert.ok(saveError.message.includes('incomplete') || saveError.message.includes('failed'), 'Error message must clearly state initialization/configuration failure');
console.log('  ✅ Passed');

// 7. Strict Production Fail-Closed Behavior (NO Silent Fallback)
console.log('Test 7: Production configuration validation strictly fails closed...');
const origEnv = process.env.NODE_ENV;
const origProvider = process.env.STORAGE_PROVIDER;

try {
  // Scenario A: Production with unset STORAGE_PROVIDER -> Must throw!
  process.env.NODE_ENV = 'production';
  delete process.env.STORAGE_PROVIDER;
  assert.throws(() => {
    validateStorageConfiguration();
  }, /requires an explicit STORAGE_PROVIDER setting/, 'Production must reject unset STORAGE_PROVIDER');

  // Scenario B: Production requesting R2 with incomplete credentials -> Must throw!
  process.env.STORAGE_PROVIDER = 'r2';
  assert.throws(() => {
    validateStorageConfiguration();
  }, /Cloudflare R2 requested .* but configuration is incomplete/, 'Production must fail closed on invalid R2 config');

  // Scenario C: Local explicitly requested in production -> Allowed (persistent volume mount)
  process.env.STORAGE_PROVIDER = 'local';
  assert.strictEqual(validateStorageConfiguration(), true);

} finally {
  process.env.NODE_ENV = origEnv;
  if (origProvider !== undefined) process.env.STORAGE_PROVIDER = origProvider;
  else delete process.env.STORAGE_PROVIDER;
}
console.log('  ✅ Passed');

// 8. LocalStorageAdapter Full Lifecycle (Upload, Stream, Publish, Revoke, Support, Delete)
console.log('Test 8: LocalStorageAdapter full lifecycle verification...');
const testWs = '6afb88880000000000000001';
const testFile = `local_lifecycle_${Date.now()}.txt`;
const testContent = 'LOCAL_ADAPTER_LIFECYCLE_TEST_PAYLOAD';

// 8a. Save Private
const savedPath = await localAdapter.savePrivate(testWs, testFile, Buffer.from(testContent));
assert.ok(fs.existsSync(savedPath), 'File must be written to disk');
assert.ok(await localAdapter.existsPrivate(testWs, testFile), 'existsPrivate must return true');

// 8b. Resolve Private Stream
const streamRes = await localAdapter.resolvePrivateStream(testWs, testFile);
assert.ok(streamRes && streamRes.stream, 'Must resolve readable stream');
assert.strictEqual(streamRes.size, Buffer.byteLength(testContent));

// 8c. Publish
const publishedUrl = await localAdapter.publish(testWs, testFile);
assert.strictEqual(publishedUrl, `/published/${testWs}/${testFile}`);
assert.ok(await localAdapter.existsPublished(testWs, testFile), 'existsPublished must return true');

// 8d. Revoke
const revSuccess = await localAdapter.revoke(testWs, testFile);
assert.strictEqual(revSuccess, true);
assert.strictEqual(await localAdapter.existsPublished(testWs, testFile), false, 'Published file must be removed');
assert.strictEqual(await localAdapter.existsPrivate(testWs, testFile), true, 'Private master must remain intact');

// 8e. Support Attachment
const supportFile = `support_test_${Date.now()}.log`;
await localAdapter.saveSupport(supportFile, Buffer.from('SUPPORT_LOG_DATA'));
const supportStream = await localAdapter.resolveSupportStream(supportFile);
assert.ok(supportStream && supportStream.stream);

// 8f. Clean up test files
await localAdapter.deletePrivate(testWs, testFile);
assert.strictEqual(await localAdapter.existsPrivate(testWs, testFile), false);
const supportPath = await localAdapter.resolveSupportPath(supportFile);
if (supportPath && fs.existsSync(supportPath)) fs.unlinkSync(supportPath);

// Remove synthetic directory if empty
const testWsDir = localAdapter.getPrivateDir(testWs);
if (fs.existsSync(testWsDir) && fs.readdirSync(testWsDir).length === 0) fs.rmdirSync(testWsDir);
const testPubDir = localAdapter.getPublishedDir(testWs);
if (fs.existsSync(testPubDir) && fs.readdirSync(testPubDir).length === 0) fs.rmdirSync(testPubDir);

console.log('  ✅ Passed');

console.log('\n================================================================');
console.log('🎉 ALL CLOUDFLARE R2 & STORAGE ADAPTER TESTS PASSED (8 / 8)');
console.log('================================================================');
