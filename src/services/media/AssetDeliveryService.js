import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { WorkspaceAsset } from '../../models/WorkspaceAsset.js';
import { SocialPost } from '../../models/SocialPost.js';
import { AdCreative } from '../../models/AdCreative.js';
import { getStorageAdapter, validateStorageConfiguration } from './storage/index.js';

/**
 * AssetDeliveryService
 * Orchestrates multi-tenant private asset storage, signature validation,
 * short-lived signed URL generation, authenticated retrieval, explicit public publishing,
 * and safe unpublish/revocation.
 */
export class AssetDeliveryService {
  /**
   * Active StorageAdapter (LocalStorageAdapter or R2StorageAdapter)
   */
  static get storageAdapter() {
    return getStorageAdapter();
  }

  /**
   * Configurable storage root (supports local volume mount or Render persistent disk)
   */
  static get STORAGE_ROOT() {
    return process.env.STORAGE_ROOT
      ? path.resolve(process.env.STORAGE_ROOT)
      : path.resolve(process.cwd(), 'storage');
  }

  static get PRIVATE_STORAGE_ROOT() {
    return path.resolve(this.STORAGE_ROOT, 'uploads', 'private');
  }

  static get PUBLISHED_STORAGE_ROOT() {
    return path.resolve(this.STORAGE_ROOT, 'uploads', 'published');
  }

  static get SUPPORT_STORAGE_ROOT() {
    return path.resolve(this.STORAGE_ROOT, 'uploads', 'support');
  }

  static get UNRESOLVED_STORAGE_ROOT() {
    return path.resolve(this.STORAGE_ROOT, 'uploads', 'quarantine_unresolved');
  }

  /**
   * Validates media delivery configuration at service startup.
   * Enforces dedicated MEDIA_SIGNING_SECRET and explicit STORAGE_PROVIDER in production.
   */
  static validateConfiguration() {
    const isProduction = process.env.NODE_ENV === 'production';
    const secret = process.env.MEDIA_SIGNING_SECRET;

    if (isProduction) {
      if (!secret || typeof secret !== 'string' || secret.trim().length < 32) {
        throw new Error(
          '[FATAL CRITICAL SECURITY]: Production environment requires a dedicated MEDIA_SIGNING_SECRET environment variable (minimum 32 characters). Silent derivation from session keys is strictly forbidden.'
        );
      }
    }

    // Validate storage adapter provider & credentials (fail-closed)
    validateStorageConfiguration();

    return true;
  }

  /**
   * Dedicated media signing secret (completely decoupled from user session JWT secret).
   * In production, requires explicit MEDIA_SIGNING_SECRET and refuses fallback derivation.
   */
  static get MEDIA_SIGNING_SECRET() {
    const isProduction = process.env.NODE_ENV === 'production';
    const secret = process.env.MEDIA_SIGNING_SECRET;

    if (isProduction) {
      if (!secret || typeof secret !== 'string' || secret.trim().length < 32) {
        throw new Error(
          '[FATAL CRITICAL SECURITY]: Production requires a dedicated MEDIA_SIGNING_SECRET (min 32 characters).'
        );
      }
      return secret.trim();
    }

    // Isolated development & testing secret (strictly separate from JWT_SECRET)
    return secret && secret.trim()
      ? secret.trim()
      : 'vyuhox_media_signing_key_dev_testing_isolated_sha256';
  }

  /**
   * Ensures storage base directories exist (only for local/persistent storage provider)
   */
  static initStorageDirs() {
    if (this.storageAdapter.isCloudStorage) {
      return;
    }
    [this.PRIVATE_STORAGE_ROOT, this.PUBLISHED_STORAGE_ROOT, this.SUPPORT_STORAGE_ROOT, this.UNRESOLVED_STORAGE_ROOT].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Returns workspace-isolated private directory
   */
  static getPrivateDir(workspaceId) {
    const dir = path.resolve(this.PRIVATE_STORAGE_ROOT, workspaceId.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Returns workspace-isolated published directory
   */
  static getPublishedDir(workspaceId) {
    const dir = path.resolve(this.PUBLISHED_STORAGE_ROOT, workspaceId.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Returns private support storage directory
   */
  static getSupportDir() {
    if (!fs.existsSync(this.SUPPORT_STORAGE_ROOT)) {
      fs.mkdirSync(this.SUPPORT_STORAGE_ROOT, { recursive: true });
    }
    return this.SUPPORT_STORAGE_ROOT;
  }

  /**
   * Saves private workspace asset via active StorageAdapter
   */
  static async savePrivateAsset(workspaceId, filename, sourcePathOrData, mimeType) {
    return await this.storageAdapter.savePrivate(workspaceId, filename, sourcePathOrData, mimeType);
  }

  /**
   * Resolves private media stream via active StorageAdapter
   */
  static async resolvePrivateMediaStream(workspaceId, filename) {
    return await this.storageAdapter.resolvePrivateStream(workspaceId, filename);
  }

  /**
   * Saves support attachment via active StorageAdapter
   */
  static async saveSupportAttachment(filename, sourcePathOrData, mimeType) {
    return await this.storageAdapter.saveSupport(filename, sourcePathOrData, mimeType);
  }

  /**
   * Resolves support attachment stream via active StorageAdapter
   */
  static async resolveSupportAttachmentStream(filename) {
    return await this.storageAdapter.resolveSupportStream(filename);
  }

  /**
   * Generates a short-lived (5 min), asset-specific signed media token using dedicated HMAC secret.
   * Grants read-only access to one specific asset only; cannot authenticate any other API route.
   */
  static generateSignedMediaToken({ assetId, workspaceId, expiresInSeconds = 300 }) {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = {
      assetId: assetId.toString(),
      wsId: workspaceId.toString(),
      exp,
      scope: 'ASSET_MEDIA_READ',
    };
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.MEDIA_SIGNING_SECRET)
      .update(payloadStr)
      .digest('base64url');
    return `${payloadStr}.${signature}`;
  }

  /**
   * Verifies an asset-specific signed media token.
   * Enforces expiration, signature integrity, and scope validation.
   */
  static verifySignedMediaToken(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'MISSING_TOKEN' };
    }
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'MALFORMED_TOKEN' };
    }

    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', this.MEDIA_SIGNING_SECRET)
      .update(payloadStr)
      .digest('base64url');

    // Constant-time signature comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, error: 'INVALID_SIGNATURE' };
    }

    try {
      const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
      if (payload.scope !== 'ASSET_MEDIA_READ') {
        return { valid: false, error: 'INVALID_SCOPE' };
      }
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, error: 'EXPIRED' };
      }
      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'INVALID_PAYLOAD' };
    }
  }

  /**
   * Deep content inspection: Verifies file magic bytes match declared extension and MIME type.
   * Protects against forged MIME types, disguised executables, and malicious content.
   */
  static verifyMediaMagicBytes(filePath, ext, mime) {
    try {
      if (!fs.existsSync(filePath)) return false;
      const stats = fs.statSync(filePath);
      if (stats.size < 12) return false;

      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(64);
      const bytesRead = fs.readSync(fd, buffer, 0, 64, 0);
      fs.closeSync(fd);

      if (bytesRead < 12) return false;

      const cleanExt = (ext || '').toLowerCase().replace('.', '');
      const cleanMime = (mime || '').toLowerCase();

      // 1. JPEG: FF D8 FF
      if (['jpg', 'jpeg'].includes(cleanExt) && cleanMime === 'image/jpeg') {
        return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      }

      // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
      if (cleanExt === 'png' && cleanMime === 'image/png') {
        return (
          buffer[0] === 0x89 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x4E &&
          buffer[3] === 0x47
        );
      }

      // 3. WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
      if (cleanExt === 'webp' && cleanMime === 'image/webp') {
        const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
        const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
        return isRiff && isWebp;
      }

      // 4. GIF: GIF87a or GIF89a
      if (cleanExt === 'gif' && cleanMime === 'image/gif') {
        const header = buffer.toString('ascii', 0, 4);
        return header === 'GIF8';
      }

      // 5. Video (MP4 / MOV / M4V): Strict ISO BMFF / QuickTime box structure
      if (['mp4', 'mov', 'm4v'].includes(cleanExt) && (cleanMime === 'video/mp4' || cleanMime === 'video/quicktime' || cleanMime === 'video/x-m4v')) {
        const boxSize = buffer.readUInt32BE(0);
        const boxType = buffer.toString('ascii', 4, 8);
        const validBoxes = ['ftyp', 'moov', 'mdat', 'wide', 'free', 'skip'];
        if (!validBoxes.includes(boxType) || boxSize < 8) {
          return false;
        }
        if (boxType === 'ftyp' && bytesRead >= 12) {
          const majorBrand = buffer.toString('ascii', 8, 12);
          const validBrands = ['isom', 'iso2', 'mp41', 'mp42', 'qt  ', 'M4V ', 'MSNV', 'avc1', 'dash', 'CAEP'];
          return validBrands.some((b) => majorBrand.startsWith(b.trim()));
        }
        return true;
      }

      // 6. WebM: EBML header (1A 45 DF A3)
      if (cleanExt === 'webm' && cleanMime === 'video/webm') {
        return (
          buffer[0] === 0x1A &&
          buffer[1] === 0x45 &&
          buffer[2] === 0xDF &&
          buffer[3] === 0xA3
        );
      }

      // 7. AVI: RIFF (0-3) + AVI (8-11)
      if (cleanExt === 'avi' && (cleanMime === 'video/x-msvideo' || cleanMime === 'video/avi')) {
        const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
        const isAvi = buffer.toString('ascii', 8, 12) === 'AVI ';
        return isRiff && isAvi;
      }

      // 8. PDF (For Support Uploads): %PDF- (25 50 44 46)
      if (cleanExt === 'pdf' && cleanMime === 'application/pdf') {
        return (
          buffer[0] === 0x25 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x44 &&
          buffer[3] === 0x46
        );
      }

      // 9. Plain text / log: Must be valid ASCII/UTF-8 without active code signatures
      if (['txt', 'log'].includes(cleanExt) && cleanMime === 'text/plain') {
        const textSample = buffer.toString('utf8', 0, bytesRead).toLowerCase();
        if (/<script|<\?php|<html|<!doctype|eval\(|<svg/i.test(textSample)) {
          return false;
        }
        return true;
      }

      return false;
    } catch (e) {
      console.error('[AssetDeliveryService] Magic byte check failed:', e.message);
      return false;
    }
  }

  /**
   * Resolves private file path securely, enforcing workspace directory boundary
   * and preventing path traversal attacks.
   */
  static resolvePrivatePath(workspaceId, filename) {
    const wsId = workspaceId.toString();
    const safeFilename = path.basename(filename);
    const wsBase = path.resolve(this.PRIVATE_STORAGE_ROOT, wsId);
    const targetPath = path.resolve(wsBase, safeFilename);

    if (!targetPath.startsWith(wsBase)) {
      return null;
    }

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }

    // Backward compatibility: check legacy uploads folder
    const legacyBase = path.resolve(process.cwd(), 'client', 'public', 'uploads', wsId);
    const legacyPath = path.resolve(legacyBase, safeFilename);
    if (legacyPath.startsWith(legacyBase) && fs.existsSync(legacyPath)) {
      return legacyPath;
    }

    return null;
  }

  /**
   * Explicitly publishes a private workspace asset for external social/ad distribution.
   * Copies media to published storage with atomic rollback if database save fails.
   */
  static async publishAsset(assetIdentifier, workspaceId) {
    let asset = null;
    const wsIdStr = workspaceId.toString();

    if (mongoose.isValidObjectId(assetIdentifier)) {
      asset = await WorkspaceAsset.findOne({ _id: assetIdentifier, workspaceId: wsIdStr });
    } else if (typeof assetIdentifier === 'string') {
      const match = assetIdentifier.match(/\/api\/assets\/([a-f\d]{24})/i);
      if (match) {
        asset = await WorkspaceAsset.findOne({ _id: match[1], workspaceId: wsIdStr });
      } else {
        const basename = path.basename(assetIdentifier);
        asset = await WorkspaceAsset.findOne({ filename: basename, workspaceId: wsIdStr });
      }
    }

    if (!asset) {
      return { success: false, message: 'Asset not found or does not belong to this workspace' };
    }

    if (asset.workspaceId.toString() !== wsIdStr) {
      return { success: false, message: 'Unauthorized asset access' };
    }

    if (asset.revocationTx && asset.revocationTx.phase && asset.revocationTx.phase !== 'IDLE') {
      return {
        success: false,
        conflict: true,
        message: 'Asset is currently undergoing revocation and cannot be published.',
      };
    }

    let publishedUrl = null;
    const safeFilename = path.basename(asset.filename);

    if (this.storageAdapter.isCloudStorage) {
      const exists = await this.storageAdapter.existsPrivate(wsIdStr, safeFilename);
      if (!exists) {
        return { success: false, message: 'Private file does not exist in storage' };
      }
      publishedUrl = await this.storageAdapter.publish(wsIdStr, safeFilename);
    } else {
      const privatePath = this.resolvePrivatePath(wsIdStr, asset.filename);
      if (!privatePath) {
        return { success: false, message: 'Private file does not exist on disk' };
      }

      const pubDir = this.getPublishedDir(wsIdStr);
      const publishedPath = path.resolve(pubDir, safeFilename);

      // Copy to published directory
      fs.copyFileSync(privatePath, publishedPath);
      publishedUrl = `/published/${wsIdStr}/${safeFilename}`;
    }

    // Atomic update with rollback if DB write fails
    try {
      asset.status = 'PUBLISHED';
      asset.publishedUrl = publishedUrl;
      await asset.save();
    } catch (saveErr) {
      if (this.storageAdapter.isCloudStorage) {
        try {
          await this.storageAdapter.revoke(wsIdStr, safeFilename);
        } catch (_) {}
      } else {
        const pubDir = this.getPublishedDir(wsIdStr);
        const publishedPath = path.resolve(pubDir, safeFilename);
        if (fs.existsSync(publishedPath)) {
          try {
            fs.unlinkSync(publishedPath);
          } catch (_) {}
        }
      }
      throw saveErr;
    }

    return {
      success: true,
      publishedUrl,
      asset,
    };
  }

  /**
   * Safely revokes and unpublishes an asset using a durable, 4-phase transaction state machine:
   * 1. LOCK_ACQUIRED: Conditional atomic lock acquisition with stale-lock preemption (> 5 min).
   * 2. FILE_QUARANTINED: Move published file to quarantine name (`.quarantine_<txId>`).
   * 3. DB_COMMITTED: Update status to PRIVATE, publishedUrl to null, phase to DB_COMMITTED.
   * 4. COMPLETED: Verify private master exists; unlink quarantine copy OR rescue to private storage if missing!
   */
  static async revokePublishedAsset(assetIdentifier, workspaceId, options = {}) {
    const wsIdStr = workspaceId.toString();
    let asset = null;

    if (mongoose.isValidObjectId(assetIdentifier)) {
      asset = await WorkspaceAsset.findOne({ _id: assetIdentifier, workspaceId: wsIdStr });
    } else {
      const match = String(assetIdentifier).match(/\/api\/assets\/([a-f\d]{24})/i);
      if (match) {
        asset = await WorkspaceAsset.findOne({ _id: match[1], workspaceId: wsIdStr });
      } else {
        const basename = path.basename(assetIdentifier);
        asset = await WorkspaceAsset.findOne({ filename: basename, workspaceId: wsIdStr });
      }
    }

    if (!asset) {
      return { success: false, notFound: true, message: 'Asset not found.' };
    }

    if (asset.status !== 'PUBLISHED' && !asset.publishedUrl) {
      return { success: true, message: 'Asset is already in private state.' };
    }

    const pubUrl = asset.publishedUrl || `/published/${wsIdStr}/${asset.filename}`;

    // Inspect whether another active post or running ad campaign references this published media
    const checkActiveReferences = async () => {
      const [activePost, activeCreative] = await Promise.all([
        SocialPost.findOne({
          workspaceId: wsIdStr,
          status: { $in: ['PUBLISHED', 'SCHEDULED'] },
          $or: [
            { mediaUrl: pubUrl },
            { mediaUrls: pubUrl },
            { mediaUrl: asset.url },
            { mediaUrls: asset.url },
          ],
        }),
        AdCreative.findOne({
          workspaceId: wsIdStr,
          status: 'ACTIVE',
          approvalStatus: 'CLIENT_APPROVED',
          mediaUrl: { $in: [pubUrl, asset.url] },
        }),
      ]);
      return activePost || activeCreative;
    };

    if (await checkActiveReferences()) {
      return {
        success: false,
        conflict: true,
        message: 'Cannot revoke asset: Media is actively referenced by a live published post or active ad campaign.',
      };
    }

    // Atomic conditional lock acquisition
    const txId = crypto.randomUUID();
    const pubDir = this.getPublishedDir(wsIdStr);
    const safeFilename = path.basename(asset.filename);
    const pubFile = path.resolve(pubDir, safeFilename);
    const quarantineFilename = `${safeFilename}.quarantine_${txId}`;
    const quarantineFile = path.resolve(pubDir, quarantineFilename);

    const lockExpiryThreshold = new Date(Date.now() - 300000); // 5 min stale lock cutoff

    const lockedAsset = await WorkspaceAsset.findOneAndUpdate(
      {
        _id: asset._id,
        workspaceId: wsIdStr,
        $or: [
          { 'revocationTx.phase': 'IDLE' },
          { 'revocationTx.phase': null },
          { 'revocationTx': null },
          { 'revocationTx.initiatedAt': { $lt: lockExpiryThreshold } },
        ],
      },
      {
        $set: {
          'revocationTx.txId': txId,
          'revocationTx.phase': 'LOCK_ACQUIRED',
          'revocationTx.quarantineFilename': quarantineFilename,
          'revocationTx.targetPubFile': pubFile,
          'revocationTx.initiatedAt': new Date(),
          'revocationTx.hostInstance': process.env.HOSTNAME || 'localhost',
          'revocationTx.recoveryNotes': 'Lock acquired for revocation transaction',
        },
      },
      { new: true }
    );

    if (!lockedAsset) {
      return {
        success: false,
        conflict: true,
        message: 'Asset is currently locked by another revocation transaction or concurrent operation.',
      };
    }

    asset = lockedAsset;

    // Post-lock check: ensure no race condition with a concurrently published post/ad
    if (await checkActiveReferences()) {
      await WorkspaceAsset.updateOne(
        { _id: asset._id, 'revocationTx.txId': txId },
        {
          $set: {
            'revocationTx.phase': 'IDLE',
            'revocationTx.recoveryNotes': 'Released lock: active references detected post-lock',
          },
        }
      );
      return {
        success: false,
        conflict: true,
        message: 'Cannot revoke asset: Media is actively referenced by a live published post or active ad campaign.',
      };
    }

    // Cloud storage revocation (R2/S3):
    // In cloud storage, the master asset is securely preserved in privateBucket.
    // Revocation deletes the object from publishedBucket, preventing data loss.
    if (this.storageAdapter.isCloudStorage) {
      await this.storageAdapter.revoke(wsIdStr, safeFilename);

      await WorkspaceAsset.updateOne(
        { _id: asset._id, 'revocationTx.txId': txId },
        {
          $set: {
            status: 'PRIVATE',
            publishedUrl: null,
            'revocationTx.phase': 'IDLE',
            'revocationTx.recoveryNotes': 'Cloud revocation: removed from published bucket',
          },
        }
      );
      console.log(`[REVOCATION_AUDIT] Asset ${asset._id} revoked from cloud storage in workspace ${wsIdStr}. TxId: ${txId}`);
      return { success: true, message: 'Asset successfully revoked and removed from public delivery.', txId };
    }

    // Fault injection hook 1: Crash BEFORE_RENAME
    if (options._simulateCrashPoint === 'BEFORE_RENAME' || options._simulateFsError) {
      if (options._simulateFsError) {
        await WorkspaceAsset.updateOne(
          { _id: asset._id, 'revocationTx.txId': txId },
          { $set: { 'revocationTx.phase': 'IDLE', 'revocationTx.recoveryNotes': 'FS error before rename' } }
        );
        return { success: false, message: 'Simulated filesystem failure during revocation.' };
      }
      throw new Error('[CRASH_SIMULATION] Simulated crash BEFORE_RENAME');
    }

    // Phase 1 -> 2: Quarantine the published file
    let fileWasQuarantined = false;
    if (fs.existsSync(pubFile)) {
      try {
        fs.renameSync(pubFile, quarantineFile);
        fileWasQuarantined = true;
      } catch (err) {
        console.error('[AssetDeliveryService] Filesystem error during revocation quarantine:', err);
        await WorkspaceAsset.updateOne(
          { _id: asset._id, 'revocationTx.txId': txId },
          { $set: { 'revocationTx.phase': 'IDLE', 'revocationTx.recoveryNotes': `Rename failed: ${err.message}` } }
        );
        return { success: false, message: `Failed to remove public asset from delivery: ${err.message}` };
      }
    }

    // Transition state to FILE_QUARANTINED
    await WorkspaceAsset.updateOne(
      { _id: asset._id, 'revocationTx.txId': txId },
      {
        $set: {
          'revocationTx.phase': 'FILE_QUARANTINED',
          'revocationTx.recoveryNotes': fileWasQuarantined ? 'File renamed to quarantine' : 'No public file found on disk to quarantine',
        },
      }
    );

    // Fault injection hook 2: Crash after rename / before DB commit
    if (options._simulateCrashPoint === 'AFTER_RENAME' || options._simulateCrashPoint === 'BEFORE_DB_COMMIT') {
      throw new Error(`[CRASH_SIMULATION] Simulated crash at ${options._simulateCrashPoint}`);
    }

    // Phase 2 -> 3: Commit DB state to PRIVATE
    try {
      if (options._simulateDbError) {
        throw new Error('Simulated database failure during revocation save.');
      }
      await WorkspaceAsset.updateOne(
        { _id: asset._id, 'revocationTx.txId': txId },
        {
          $set: {
            status: 'PRIVATE',
            publishedUrl: null,
            'revocationTx.phase': 'DB_COMMITTED',
            'revocationTx.recoveryNotes': 'DB updated to PRIVATE and DB_COMMITTED',
          },
        }
      );
    } catch (dbErr) {
      console.error('[AssetDeliveryService] Database error during revocation commit; executing compensating rollback:', dbErr.message);
      // Compensating rollback: Restore the public file from quarantine if it was moved
      if (fileWasQuarantined && fs.existsSync(quarantineFile)) {
        try {
          fs.renameSync(quarantineFile, pubFile);
        } catch (rollbackErr) {
          console.error('[AssetDeliveryService] Critical compensating rollback error:', rollbackErr);
        }
      }
      await WorkspaceAsset.updateOne(
        { _id: asset._id, 'revocationTx.txId': txId },
        {
          $set: {
            'revocationTx.phase': 'IDLE',
            'revocationTx.recoveryNotes': `Compensating rollback due to DB error: ${dbErr.message}`,
          },
        }
      );
      return { success: false, message: `Database update failed during revocation: ${dbErr.message}` };
    }

    // Fault injection hook 3: Crash after DB commit / before unlink
    if (options._simulateCrashPoint === 'AFTER_DB_COMMIT' || options._simulateCrashPoint === 'BEFORE_UNLINK') {
      throw new Error(`[CRASH_SIMULATION] Simulated crash at ${options._simulateCrashPoint}`);
    }

    // Phase 3 -> 4: Cleanup quarantine file or Rescue if private master missing!
    if (fileWasQuarantined && fs.existsSync(quarantineFile)) {
      const privateDir = this.getPrivateDir(wsIdStr);
      const expectedPrivatePath = path.resolve(privateDir, safeFilename);
      const privatePath = this.resolvePrivatePath(wsIdStr, safeFilename);

      if (!privatePath || !fs.existsSync(privatePath)) {
        // Master private copy is missing! Rescue quarantine file!
        console.warn(`[REVOCATION_RESCUE] Master private copy missing for asset ${asset._id} (${safeFilename}); rescuing quarantine copy to ${expectedPrivatePath}`);
        try {
          fs.renameSync(quarantineFile, expectedPrivatePath);
          console.log(`[REVOCATION_RESCUE] Successfully rescued quarantine file to private master storage.`);
        } catch (rescueErr) {
          console.error(`[REVOCATION_RESCUE] Failed to move quarantine file to private master:`, rescueErr);
        }
      } else {
        try {
          fs.unlinkSync(quarantineFile);
        } catch (unlinkErr) {
          console.warn('[AssetDeliveryService] Quarantined file unlink warning:', unlinkErr.message);
        }
      }
    }

    // Complete transaction: Return phase to IDLE
    await WorkspaceAsset.updateOne(
      { _id: asset._id, 'revocationTx.txId': txId },
      {
        $set: {
          'revocationTx.phase': 'IDLE',
          'revocationTx.recoveryNotes': 'Revocation transaction successfully completed',
        },
      }
    );

    console.log(`[REVOCATION_AUDIT] Asset ${asset._id} successfully revoked in workspace ${wsIdStr}. TxId: ${txId}`);

    return {
      success: true,
      message: 'Asset successfully revoked and removed from public delivery.',
      txId,
    };
  }

  /**
   * Startup & periodic reconciliation service for interrupted revocation transactions.
   * Scans MongoDB for locked/in-flight revocation transactions and reconciles them:
   * - LOCK_ACQUIRED: Checks staleness and unlocks.
   * - FILE_QUARANTINED: Inspects active references; if none, commits to PRIVATE & cleans up;
   *   if active references found, rolls back quarantine file to published.
   * - DB_COMMITTED: Ensures quarantine file is deleted or rescued if private master is missing.
   * - Ambiguous/orphaned quarantine files on disk: Safely moved to UNRESOLVED_STORAGE_ROOT.
   */
  static async reconcileQuarantinedAssets(options = {}) {
    const report = {
      scannedCount: 0,
      reconciledCount: 0,
      rolledBackCount: 0,
      forwardCompletedCount: 0,
      ambiguousPreservedCount: 0,
      errors: [],
    };

    const staleThresholdMs = options.staleThresholdMs || (options.forceStale ? 0 : 300000); // 5 min default
    const cutoffTime = new Date(Date.now() - staleThresholdMs);

    try {
      // 1. Query MongoDB for any assets in a non-IDLE revocation phase
      const pendingAssets = await WorkspaceAsset.find({
        'revocationTx.phase': { $in: ['LOCK_ACQUIRED', 'FILE_QUARANTINED', 'DB_COMMITTED'] },
      });

      report.scannedCount += pendingAssets.length;

      for (const asset of pendingAssets) {
        try {
          const wsIdStr = asset.workspaceId.toString();
          const pubDir = this.getPublishedDir(wsIdStr);
          const safeFilename = path.basename(asset.filename);
          const pubFile = path.resolve(pubDir, safeFilename);
          const tx = asset.revocationTx || {};
          const isStale = options.forceStale || !tx.initiatedAt || (new Date(tx.initiatedAt) <= cutoffTime);

          // If not stale and forceStale is not set, skip as it might be currently executing
          if (!isStale) {
            continue;
          }

          const quarantineFilename = tx.quarantineFilename || `${safeFilename}.quarantine_${tx.txId || 'recovered'}`;
          const quarantineFile = path.resolve(pubDir, quarantineFilename);

          if (tx.phase === 'LOCK_ACQUIRED') {
            // Lock was acquired but file was not quarantined yet. Simply unlock.
            await WorkspaceAsset.updateOne(
              { _id: asset._id },
              { $set: { 'revocationTx.phase': 'IDLE', 'revocationTx.recoveryNotes': 'Reconciliation: Unlocked stale LOCK_ACQUIRED' } }
            );
            report.rolledBackCount++;
            report.reconciledCount++;
            console.log(`[REVOCATION_AUDIT] Reconciled stale LOCK_ACQUIRED for asset ${asset._id}`);
          } else if (tx.phase === 'FILE_QUARANTINED') {
            // File was quarantined. Check active references to decide rollback or forward-commit.
            const pubUrl = asset.publishedUrl || `/published/${wsIdStr}/${safeFilename}`;
            const [activePost, activeCreative] = await Promise.all([
              SocialPost.findOne({
                workspaceId: wsIdStr,
                status: { $in: ['PUBLISHED', 'SCHEDULED'] },
                $or: [
                  { mediaUrl: pubUrl },
                  { mediaUrls: pubUrl },
                  { mediaUrl: asset.url },
                  { mediaUrls: asset.url },
                ],
              }),
              AdCreative.findOne({
                workspaceId: wsIdStr,
                status: 'ACTIVE',
                approvalStatus: 'CLIENT_APPROVED',
                mediaUrl: { $in: [pubUrl, asset.url] },
              }),
            ]);

            if (activePost || activeCreative) {
              // Active reference exists! Rollback: restore quarantine file to public delivery
              if (fs.existsSync(quarantineFile)) {
                try {
                  fs.renameSync(quarantineFile, pubFile);
                } catch (rbErr) {
                  console.error(`[REVOCATION_RECONCILIATION] Failed to rollback quarantine file:`, rbErr);
                }
              }
              await WorkspaceAsset.updateOne(
                { _id: asset._id },
                {
                  $set: {
                    status: 'PUBLISHED',
                    publishedUrl: pubUrl,
                    'revocationTx.phase': 'IDLE',
                    'revocationTx.recoveryNotes': 'Reconciliation: Rolled back due to active references',
                  },
                }
              );
              report.rolledBackCount++;
              report.reconciledCount++;
              console.log(`[REVOCATION_AUDIT] Reconciled FILE_QUARANTINED via rollback for asset ${asset._id} (active references found)`);
            } else {
              // No active reference. Forward commit to PRIVATE
              await WorkspaceAsset.updateOne(
                { _id: asset._id },
                {
                  $set: {
                    status: 'PRIVATE',
                    publishedUrl: null,
                    'revocationTx.phase': 'DB_COMMITTED',
                    'revocationTx.recoveryNotes': 'Reconciliation: Forward-committed to DB_COMMITTED',
                  },
                }
              );

              // Check private master rescue / unlink
              if (fs.existsSync(quarantineFile)) {
                const privateDir = this.getPrivateDir(wsIdStr);
                const expectedPrivatePath = path.resolve(privateDir, safeFilename);
                const privatePath = this.resolvePrivatePath(wsIdStr, safeFilename);

                if (!privatePath || !fs.existsSync(privatePath)) {
                  console.warn(`[REVOCATION_RESCUE] Master private copy missing for asset ${asset._id}; rescuing during reconciliation to ${expectedPrivatePath}`);
                  try {
                    fs.renameSync(quarantineFile, expectedPrivatePath);
                  } catch (rescueErr) {
                    console.error('[REVOCATION_RESCUE] Failed to rescue quarantine file during reconciliation:', rescueErr);
                  }
                } else {
                  try {
                    fs.unlinkSync(quarantineFile);
                  } catch (unlinkErr) {
                    console.warn('[AssetDeliveryService] Reconciliation unlink warning:', unlinkErr.message);
                  }
                }
              }

              await WorkspaceAsset.updateOne(
                { _id: asset._id },
                { $set: { 'revocationTx.phase': 'IDLE', 'revocationTx.recoveryNotes': 'Reconciliation: Completed forward revocation' } }
              );
              report.forwardCompletedCount++;
              report.reconciledCount++;
              console.log(`[REVOCATION_AUDIT] Reconciled FILE_QUARANTINED via forward commit for asset ${asset._id}`);
            }
          } else if (tx.phase === 'DB_COMMITTED') {
            // DB is already committed to PRIVATE. Ensure quarantine file cleanup or rescue.
            if (fs.existsSync(quarantineFile)) {
              const privateDir = this.getPrivateDir(wsIdStr);
              const expectedPrivatePath = path.resolve(privateDir, safeFilename);
              const privatePath = this.resolvePrivatePath(wsIdStr, safeFilename);

              if (!privatePath || !fs.existsSync(privatePath)) {
                console.warn(`[REVOCATION_RESCUE] Master private copy missing for asset ${asset._id}; rescuing during reconciliation to ${expectedPrivatePath}`);
                try {
                  fs.renameSync(quarantineFile, expectedPrivatePath);
                } catch (rescueErr) {
                  console.error('[REVOCATION_RESCUE] Failed to rescue quarantine file during reconciliation:', rescueErr);
                }
              } else {
                try {
                  fs.unlinkSync(quarantineFile);
                } catch (unlinkErr) {
                  console.warn('[AssetDeliveryService] Reconciliation unlink warning:', unlinkErr.message);
                }
              }
            }

            await WorkspaceAsset.updateOne(
              { _id: asset._id },
              { $set: { 'revocationTx.phase': 'IDLE', 'revocationTx.recoveryNotes': 'Reconciliation: Completed DB_COMMITTED cleanup' } }
            );
            report.forwardCompletedCount++;
            report.reconciledCount++;
            console.log(`[REVOCATION_AUDIT] Reconciled DB_COMMITTED for asset ${asset._id}`);
          }
        } catch (assetErr) {
          report.errors.push({ assetId: asset._id, error: assetErr.message });
          console.error(`[REVOCATION_RECONCILIATION] Error reconciling asset ${asset._id}:`, assetErr);
        }
      }

      // 2. Scan published storage directories for orphaned/ambiguous quarantine files (local storage only)
      if (!this.storageAdapter.isCloudStorage && fs.existsSync(this.PUBLISHED_STORAGE_ROOT)) {
        const wsDirs = fs.readdirSync(this.PUBLISHED_STORAGE_ROOT);
        for (const wsDir of wsDirs) {
          const wsDirPath = path.resolve(this.PUBLISHED_STORAGE_ROOT, wsDir);
          if (!fs.statSync(wsDirPath).isDirectory()) continue;

          const files = fs.readdirSync(wsDirPath);
          for (const file of files) {
            if (file.includes('.quarantine_')) {
              report.scannedCount++;
              const filePath = path.resolve(wsDirPath, file);

              // Check if any asset in MongoDB is currently associated with this file
              const isClaimed = await WorkspaceAsset.findOne({
                workspaceId: wsDir,
                $or: [
                  { 'revocationTx.quarantineFilename': file },
                  { filename: file.split('.quarantine_')[0] },
                ],
                'revocationTx.phase': { $in: ['LOCK_ACQUIRED', 'FILE_QUARANTINED', 'DB_COMMITTED'] },
              });

              if (!isClaimed) {
                // Ambiguous orphan quarantine file! Safely move to UNRESOLVED_STORAGE_ROOT
                const unresolvedDir = this.UNRESOLVED_STORAGE_ROOT;
                if (!fs.existsSync(unresolvedDir)) {
                  fs.mkdirSync(unresolvedDir, { recursive: true });
                }
                const destPath = path.resolve(unresolvedDir, `${wsDir}_${Date.now()}_${file}`);
                try {
                  fs.renameSync(filePath, destPath);
                  report.ambiguousPreservedCount++;
                  report.reconciledCount++;
                  console.log(`[REVOCATION_RECONCILIATION] Ambiguous quarantine file preserved to unresolved: ${destPath}`);
                } catch (mvErr) {
                  report.errors.push({ file: filePath, error: mvErr.message });
                  console.error(`[REVOCATION_RECONCILIATION] Failed to move ambiguous quarantine file:`, mvErr);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      report.errors.push({ global: err.message });
      console.error('[REVOCATION_RECONCILIATION] Global reconciliation error:', err);
    }

    return report;
  }

  /**
   * Automatically resolves and publishes media attached to a social post
   * when the post is explicitly published by client or autopilot cron.
   */
  static async publishPostMedia(post) {
    if (!post || !post.workspaceId) return;

    const wsId = post.workspaceId.toString();
    const updatedUrls = [];

    const urls = Array.isArray(post.mediaUrls) ? post.mediaUrls : [];
    if (post.mediaUrl && !urls.includes(post.mediaUrl)) {
      urls.unshift(post.mediaUrl);
    }

    for (const url of urls) {
      if (typeof url !== 'string') continue;

      if (url.includes('/api/assets/') || url.includes(`/uploads/${wsId}/`)) {
        try {
          const res = await this.publishAsset(url, wsId);
          if (res.success && res.publishedUrl) {
            updatedUrls.push(res.publishedUrl);
            continue;
          }
        } catch (e) {
          console.warn('[AssetDeliveryService] Could not publish post media asset:', e.message);
        }
      }

      updatedUrls.push(url);
    }

    if (updatedUrls.length > 0) {
      post.mediaUrls = updatedUrls;
      post.mediaUrl = updatedUrls[0];
    }

    // Also resolve and publish attached voiceover audio if stored as a private asset
    if (post.audioUrl && typeof post.audioUrl === 'string' && post.audioUrl.includes('/api/assets/')) {
      try {
        const audioRes = await this.publishAsset(post.audioUrl, wsId);
        if (audioRes.success && audioRes.publishedUrl) {
          post.audioUrl = audioRes.publishedUrl;
        }
      } catch (aErr) {
        console.warn('[AssetDeliveryService] Could not publish post voiceover audio asset:', aErr.message);
      }
    }

    await post.save();
  }

  /**
   * Safely delivers a media stream or file to an HTTP response.
   * Handles stream errors, client aborts/disconnects, and prevents double-header responses.
   * Redacts all internal filesystem paths and sensitive details.
   */
  static pipeMediaStream(mediaRes, res, req = null) {
    if (!mediaRes) {
      if (!res.headersSent) {
        return res.status(404).json({ success: false, message: 'Media source unavailable.' });
      }
      return;
    }

    if (mediaRes.stream) {
      const stream = mediaRes.stream;

      const safeDestroy = (err) => {
        if (typeof stream.destroy === 'function' && !stream.destroyed) {
          stream.destroy(err);
        }
      };

      stream.on('error', (err) => {
        console.error('[MediaDelivery] Stream error during media transfer:', err.message);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Failed to stream media asset.' });
        } else {
          res.destroy();
        }
      });

      if (req) {
        // Genuinely aborted by the client
        req.on('aborted', () => {
          safeDestroy();
        });
        // Normal completion of incoming request (e.g. GET request data received) must NOT destroy stream.
        // Only destroy if the request was genuinely aborted.
        req.on('close', () => {
          if (req.aborted) {
            safeDestroy();
          }
        });
      }

      // Outgoing response connection prematurely closed
      res.on('close', () => {
        if (!res.writableEnded) {
          safeDestroy();
        }
      });

      res.on('error', (err) => {
        console.error('[MediaDelivery] Response socket error:', err.message);
        safeDestroy();
      });

      return stream.pipe(res);
    }

    if (mediaRes.filePath) {
      return res.sendFile(mediaRes.filePath, (err) => {
        if (err) {
          if (!res.headersSent) {
            res.status(err.status || 500).json({ success: false, message: 'Failed to deliver media file.' });
          } else {
            res.destroy();
          }
        }
      });
    }

    if (!res.headersSent) {
      return res.status(404).json({ success: false, message: 'Media stream unavailable.' });
    }
  }
}
