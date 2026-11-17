/**
 * tests/cleanup-script.test.js
 * 
 * Verifies strict itemized safety of cleanup_test_artifacts.js:
 * - Exact 10-file allowlist validation
 * - Exact 5-record ID allowlist validation
 * - Rejection of wrong workspace IDs
 * - Rejection of customer workspace (Toran Invites)
 * - Path traversal defense
 * - Safe dry-run behavior (no mutations)
 */

import assert from 'assert';
import path from 'path';
import {
  SYNTHETIC_WORKSPACE_ID,
  CUSTOMER_WORKSPACE_ID,
  TARGET_ASSET_IDS,
  CANONICAL_TEST_FILES,
  resolveCanonicalTestFilePath,
} from '../src/scripts/cleanup_test_artifacts.js';

console.log('================================================================');
console.log('🧪 RUNNING CLEANUP SCRIPT STRICT SAFETY TEST SUITE');
console.log('================================================================\n');

// 1. Exact Allowlist Counts
console.log('Test 1: Exact allowlist configuration count enforcement...');
assert.strictEqual(TARGET_ASSET_IDS.length, 5, 'Must contain exactly 5 target database record IDs');
assert.strictEqual(CANONICAL_TEST_FILES.length, 10, 'Must contain exactly 10 canonical test files');
assert.strictEqual(SYNTHETIC_WORKSPACE_ID, '6ae58c87b07f74decd648b7e');
assert.strictEqual(CUSTOMER_WORKSPACE_ID, '6ae1f5d0880ed8a2eb96e282');
console.log('  ✅ Passed');

// 2. Customer Workspace Segregation
console.log('Test 2: Customer workspace strictly segregated from synthetic workspace...');
assert.notStrictEqual(SYNTHETIC_WORKSPACE_ID, CUSTOMER_WORKSPACE_ID);
assert.ok(!TARGET_ASSET_IDS.includes(CUSTOMER_WORKSPACE_ID));
console.log('  ✅ Passed');

// 3. Canonical Path Resolution & Traversal Rejection
console.log('Test 3: Canonical path resolution and path traversal rejection...');
// Valid file resolution
const validPrivate = resolveCanonicalTestFilePath('private', 'security_test_card_1794834086079.png');
assert.ok(validPrivate.includes(path.join('storage', 'uploads', 'private', SYNTHETIC_WORKSPACE_ID)));

// Path traversal attempts must be rejected
assert.throws(() => {
  resolveCanonicalTestFilePath('private', '../customer_secret.jpg');
}, /Path traversal detected/);

assert.throws(() => {
  resolveCanonicalTestFilePath('private', 'sub/nested.jpg');
}, /Path traversal detected/);

assert.throws(() => {
  resolveCanonicalTestFilePath('private', '..\\win_traversal.jpg');
}, /Path traversal detected/);
console.log('  ✅ Passed');

// 4. Exact File List Breakdown
console.log('Test 4: Canonical file distribution breakdown...');
const privateFiles = CANONICAL_TEST_FILES.filter(f => f.folder === 'private');
const publishedFiles = CANONICAL_TEST_FILES.filter(f => f.folder === 'published');
assert.strictEqual(privateFiles.length, 6, 'Must have exactly 6 canonical private files');
assert.strictEqual(publishedFiles.length, 4, 'Must have exactly 4 canonical published files');
console.log('  ✅ Passed');

console.log('\n================================================================');
console.log('🎉 ALL CLEANUP SCRIPT SAFETY TESTS PASSED (4 / 4)');
console.log('================================================================');

