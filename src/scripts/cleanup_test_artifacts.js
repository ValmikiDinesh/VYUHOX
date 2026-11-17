/**
 * src/scripts/cleanup_test_artifacts.js
 * 
 * Strictly Itemized Test Artifact Inventory and Dry-Run Verification Script.
 * 
 * Purpose:
 * Audits and verifies the EXACT synthetic test artifacts generated during security test runs
 * for synthetic workspace `6ae58c87b07f74decd648b7e`.
 * 
 * STRICT CHANGE-CONTROL RULES:
 * 1. DRY-RUN BY DEFAULT: Performs zero writes, zero unlinks, and zero database mutations.
 * 2. Strict Workspace Guard: Confines all actions solely to synthetic workspace `6ae58c87b07f74decd648b7e`.
 * 3. Customer Data Protection: Strictly verifies that neither Toran Invites (`6ae1f5d0880ed8a2eb96e282`)
 *    nor any other customer workspace is ever touched.
 * 4. Itemized Allowlist Enforcement:
 *    - Strictly 10 canonical synthetic files across designated folders.
 *    - Strictly 5 canonical WorkspaceAsset database records.
 * 5. Immediate Abort on Discrepancy:
 *    - Aborts if any unexpected file is found in synthetic directories.
 *    - Aborts if any record does not match expected workspace or allowlist.
 *    - Aborts on path traversal or non-canonical paths.
 *    - Aborts if any active post or ad creative references any artifact.
 * 6. Requires explicit `--execute-cleanup-confirmed` argument to perform actual removal.
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// STRICT CANONICAL IDENTIFIERS FOR SYNTHETIC TEST ARTIFACTS
export const SYNTHETIC_WORKSPACE_ID = '6ae58c87b07f74decd648b7e';
export const CUSTOMER_WORKSPACE_ID = '6ae1f5d0880ed8a2eb96e282'; // Toran Invites (STRICTLY PROHIBITED)

export const TARGET_ASSET_IDS = [
  '6afafe2dcca175e140c967c5',
  '6afafea6cca175e140c967d7',
  '6afafec6cca175e140c967e9',
  '6afaff5acca175e140c96801',
  '6afb2609a829c4691e9bb458',
];

export const CANONICAL_TEST_FILES = [
  { folder: 'private', filename: 'security_test_card_1794834086079.png' },
  { folder: 'private', filename: 'security_test_card_1794834118164.png' },
  { folder: 'private', filename: 'security_test_card_1794834266464.png' },
  { folder: 'private', filename: 'test_synth_1794833965320.png' },
  { folder: 'private', filename: 'test_valid_a_1794844169484.png' },
  { folder: 'private', filename: 'test_valid_a_1794844493817.png' },
  { folder: 'published', filename: 'security_test_card_1794834086079.png' },
  { folder: 'published', filename: 'security_test_card_1794834118164.png' },
  { folder: 'published', filename: 'security_test_card_1794834266464.png' },
  { folder: 'published', filename: 'test_synth_1794833965320.png' },
];

const SCAN_DIRECTORIES = [
  { folder: 'private', path: path.resolve(PROJECT_ROOT, 'storage', 'uploads', 'private', SYNTHETIC_WORKSPACE_ID) },
  { folder: 'published', path: path.resolve(PROJECT_ROOT, 'storage', 'uploads', 'published', SYNTHETIC_WORKSPACE_ID) },
];

// Minimal Mongoose Schema Definitions for verification
const WorkspaceAssetSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: String,
  status: String,
  url: String,
  publishedUrl: String,
  revocationTx: {
    txId: String,
    phase: String,
  },
}, { timestamps: true });

const SocialPostSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  mediaUrl: String,
  mediaUrls: [String],
  status: String,
});

const AdCreativeSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  mediaUrl: String,
  status: String,
});

const WorkspaceAsset = mongoose.models.WorkspaceAsset || mongoose.model('WorkspaceAsset', WorkspaceAssetSchema);
const SocialPost = mongoose.models.SocialPost || mongoose.model('SocialPost', SocialPostSchema);
const AdCreative = mongoose.models.AdCreative || mongoose.model('AdCreative', AdCreativeSchema);

/**
 * Validates canonical path and ensures zero path traversal
 */
export function resolveCanonicalTestFilePath(folder, filename) {
  const safeFilename = path.basename(filename);
  if (safeFilename !== filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error(`Path traversal detected in filename: ${filename}`);
  }
  const baseDir = path.resolve(PROJECT_ROOT, 'storage', 'uploads', folder, SYNTHETIC_WORKSPACE_ID);
  const resolved = path.resolve(baseDir, safeFilename);
  if (!resolved.startsWith(baseDir)) {
    throw new Error(`Canonical directory escape detected for: ${filename}`);
  }
  return resolved;
}

export async function runInventory() {
  const isExecuteConfirmed = process.argv.includes('--execute-cleanup-confirmed');

  console.log('================================================================');
  console.log('🔍 VYUHOX STRICTLY ITEMIZED TEST-ARTIFACT AUDITOR');
  console.log(`MODE: ${isExecuteConfirmed ? '⚠️ LIVE EXECUTION' : '🛡️ DRY-RUN ONLY (NO MUTATIONS)'}`);
  console.log(`TARGET SYNTHETIC WORKSPACE: ${SYNTHETIC_WORKSPACE_ID}`);
  console.log(`PROTECTED CUSTOMER WORKSPACE: ${CUSTOMER_WORKSPACE_ID} (UNTOUCHED)`);
  console.log('================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';
  await mongoose.connect(mongoUri);

  try {
    // -------------------------------------------------------------
    // 1. Audit Database Records Against Exact Record ID Allowlist
    // -------------------------------------------------------------
    console.log('--- 1. DATABASE RECORD AUDIT (EXACT 5-ID ALLOWLIST) ---');
    const assetRecords = await WorkspaceAsset.find({
      _id: { $in: TARGET_ASSET_IDS.map(id => new mongoose.Types.ObjectId(id)) },
    }).lean();

    if (assetRecords.length !== TARGET_ASSET_IDS.length) {
      console.warn(`[WARNING]: Found ${assetRecords.length} of ${TARGET_ASSET_IDS.length} target records.`);
    }

    const allowlistFilenames = new Set(CANONICAL_TEST_FILES.map(f => f.filename));

    for (const record of assetRecords) {
      // 1a. Strict Workspace ID Guard
      if (record.workspaceId.toString() !== SYNTHETIC_WORKSPACE_ID) {
        throw new Error(`CRITICAL VIOLATION: Asset ${record._id} belongs to workspace ${record.workspaceId}, NOT synthetic workspace! Aborting immediately.`);
      }

      // 1b. Customer Workspace Rejection
      if (record.workspaceId.toString() === CUSTOMER_WORKSPACE_ID) {
        throw new Error(`CRITICAL SECURITY ALERT: Asset ${record._id} belongs to customer Toran Invites! Immediate abort.`);
      }

      // 1c. Filename Allowlist Check
      if (!allowlistFilenames.has(record.filename)) {
        throw new Error(`CRITICAL VIOLATION: Record ${record._id} references non-allowlisted file ${record.filename}. Aborting.`);
      }

      // 1d. Check for active references in SocialPost or AdCreative
      const pubUrl = record.publishedUrl || `/published/${SYNTHETIC_WORKSPACE_ID}/${record.filename}`;
      const [refPost, refAd] = await Promise.all([
        SocialPost.findOne({
          $or: [{ mediaUrl: pubUrl }, { mediaUrls: pubUrl }, { mediaUrl: record.url }, { mediaUrls: record.url }],
        }).lean(),
        AdCreative.findOne({
          $or: [{ mediaUrl: pubUrl }, { mediaUrl: record.url }],
        }).lean(),
      ]);

      if (refPost || refAd) {
        throw new Error(`ABORT: Asset ${record._id} (${record.filename}) is actively referenced by post ${refPost?._id} or ad ${refAd?._id}. Cannot delete.`);
      }

      console.log(`  • ID: ${record._id} | File: ${record.filename} | Status: ${record.status} | RevocationPhase: ${record.revocationTx?.phase || 'IDLE'} | ✅ Validated`);
    }

    // -------------------------------------------------------------
    // 2. Audit Filesystem Artifacts Against Canonical 10-File Allowlist
    // -------------------------------------------------------------
    console.log('\n--- 2. FILESYSTEM ARTIFACT AUDIT (EXACT 10-FILE ALLOWLIST) ---');
    const verifiedCanonicalFiles = [];

    // 2a. Verify all canonical files and their canonical paths
    for (const item of CANONICAL_TEST_FILES) {
      const canonicalPath = resolveCanonicalTestFilePath(item.folder, item.filename);
      if (!fs.existsSync(canonicalPath)) {
        throw new Error(`CRITICAL DISCREPANCY: Expected canonical file missing from disk: ${canonicalPath}`);
      }
      const stats = fs.statSync(canonicalPath);
      verifiedCanonicalFiles.push({
        folder: item.folder,
        filename: item.filename,
        fullPath: canonicalPath,
        relPath: path.relative(PROJECT_ROOT, canonicalPath),
        sizeBytes: stats.size,
        modified: stats.mtime.toISOString(),
      });
      console.log(`  • [${item.folder.toUpperCase()}] ${item.filename} (${stats.size} bytes) | ✅ Canonical Path Verified`);
    }

    // 2b. Strict Directory Scan: Verify NO unexpected / extra files exist in synthetic folders
    console.log('\n--- 2b. UNEXPECTED FILE DETECTION IN SYNTHETIC DIRECTORIES ---');
    for (const dirObj of SCAN_DIRECTORIES) {
      if (fs.existsSync(dirObj.path)) {
        const diskFiles = fs.readdirSync(dirObj.path);
        const expectedInFolder = new Set(
          CANONICAL_TEST_FILES.filter(f => f.folder === dirObj.folder).map(f => f.filename)
        );

        for (const file of diskFiles) {
          if (!expectedInFolder.has(file)) {
            throw new Error(`CRITICAL ABORT: Unexpected file discovered in ${dirObj.folder}: "${file}". Not in allowlist! Immediate abort.`);
          }
        }
        console.log(`  • Directory ${path.relative(PROJECT_ROOT, dirObj.path)}: Clean (${diskFiles.length} / ${expectedInFolder.size} exact match)`);
      }
    }

    console.log(`\nTotal Itemized Synthetic Files Verified: ${verifiedCanonicalFiles.length} / ${CANONICAL_TEST_FILES.length}`);

    // -------------------------------------------------------------
    // 3. Execution / Dry-Run Summary
    // -------------------------------------------------------------
    console.log('\n--- 3. ACTION SUMMARY ---');
    if (!isExecuteConfirmed) {
      console.log('🛡️ DRY-RUN COMPLETE: Zero files unlinked. Zero database records deleted.');
      console.log('Strict Allowlist Enforced: 10 files, 5 database records, synthetic workspace only.');
      console.log('To perform confirmed cleanup in an authorized maintenance window, pass:');
      console.log('  node src/scripts/cleanup_test_artifacts.js --execute-cleanup-confirmed\n');
    } else {
      console.log('⚠️ Performing STRICTLY ITEMIZED deletion of synthetic test artifacts...');
      
      // Delete database records strictly matching TARGET_ASSET_IDS and SYNTHETIC_WORKSPACE_ID
      const delResult = await WorkspaceAsset.deleteMany({
        _id: { $in: TARGET_ASSET_IDS.map(id => new mongoose.Types.ObjectId(id)) },
        workspaceId: SYNTHETIC_WORKSPACE_ID,
      });
      console.log(`  Database records deleted: ${delResult.deletedCount}`);

      // Delete only the verified canonical files
      let filesDeleted = 0;
      for (const item of verifiedCanonicalFiles) {
        if (item.fullPath.includes(SYNTHETIC_WORKSPACE_ID) && !item.fullPath.includes(CUSTOMER_WORKSPACE_ID)) {
          fs.unlinkSync(item.fullPath);
          filesDeleted++;
        }
      }
      console.log(`  Filesystem files unlinked: ${filesDeleted}`);
      console.log('✅ Strictly itemized cleanup completed safely.');
    }

  } catch (err) {
    console.error('❌ Error during cleanup script execution:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

// Only auto-run when executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('cleanup_test_artifacts.js')) {
  runInventory();
}
