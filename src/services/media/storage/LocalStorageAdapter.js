import fs from 'fs';
import path from 'path';
import { StorageAdapter } from './StorageAdapter.js';

/**
 * LocalStorageAdapter
 * Local filesystem implementation of StorageAdapter with configurable STORAGE_ROOT.
 * Supports persistent volume mounts (e.g. Render Persistent Disk or local volume).
 */
export class LocalStorageAdapter extends StorageAdapter {
  constructor(customRoot = null) {
    super();
    this.storageRoot = customRoot
      ? path.resolve(customRoot)
      : (process.env.STORAGE_ROOT ? path.resolve(process.env.STORAGE_ROOT) : path.resolve(process.cwd(), 'storage'));
    
    this.privateRoot = path.resolve(this.storageRoot, 'uploads', 'private');
    this.publishedRoot = path.resolve(this.storageRoot, 'uploads', 'published');
    this.supportRoot = path.resolve(this.storageRoot, 'uploads', 'support');
    this.unresolvedRoot = path.resolve(this.storageRoot, 'uploads', 'quarantine_unresolved');
  }

  get isCloudStorage() {
    return false;
  }

  async init() {
    [this.privateRoot, this.publishedRoot, this.supportRoot, this.unresolvedRoot].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getPrivateDir(workspaceId) {
    const dir = path.resolve(this.privateRoot, workspaceId.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  getPublishedDir(workspaceId) {
    const dir = path.resolve(this.publishedRoot, workspaceId.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  getSupportDir() {
    if (!fs.existsSync(this.supportRoot)) {
      fs.mkdirSync(this.supportRoot, { recursive: true });
    }
    return this.supportRoot;
  }

  getUnresolvedDir() {
    if (!fs.existsSync(this.unresolvedRoot)) {
      fs.mkdirSync(this.unresolvedRoot, { recursive: true });
    }
    return this.unresolvedRoot;
  }

  async savePrivate(workspaceId, filename, data, mimeType) {
    const dir = this.getPrivateDir(workspaceId);
    const safeFilename = path.basename(filename);
    const targetPath = path.resolve(dir, safeFilename);

    if (typeof data === 'string' && fs.existsSync(data)) {
      // Data is a local source file path (e.g. from Multer temporary upload)
      if (data !== targetPath) {
        fs.copyFileSync(data, targetPath);
      }
    } else {
      await fs.promises.writeFile(targetPath, data);
    }
    return targetPath;
  }

  async resolvePrivatePath(workspaceId, filename) {
    const wsId = workspaceId.toString();
    const safeFilename = path.basename(filename);
    const wsBase = path.resolve(this.privateRoot, wsId);
    const targetPath = path.resolve(wsBase, safeFilename);

    // Traversal check
    if (!targetPath.startsWith(wsBase)) {
      return null;
    }

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }

    // Backward compatibility fallback: check client/public/uploads/:wsId
    const legacyBase = path.resolve(process.cwd(), 'client', 'public', 'uploads', wsId);
    const legacyPath = path.resolve(legacyBase, safeFilename);
    if (legacyPath.startsWith(legacyBase) && fs.existsSync(legacyPath)) {
      return legacyPath;
    }

    return null;
  }

  async resolvePrivateStream(workspaceId, filename) {
    const filePath = await this.resolvePrivatePath(workspaceId, filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }
    const stats = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    return {
      stream,
      filePath,
      size: stats.size,
    };
  }

  async saveSupport(filename, data, mimeType) {
    const safeFilename = path.basename(filename);
    const targetPath = path.resolve(this.getSupportDir(), safeFilename);

    if (typeof data === 'string' && fs.existsSync(data)) {
      if (data !== targetPath) {
        fs.copyFileSync(data, targetPath);
      }
    } else {
      await fs.promises.writeFile(targetPath, data);
    }
    return targetPath;
  }

  async resolveSupportPath(filename) {
    const safeFilename = path.basename(filename);
    const supportBase = this.getSupportDir();
    const targetPath = path.resolve(supportBase, safeFilename);

    if (!targetPath.startsWith(supportBase)) {
      return null;
    }

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }

    // Legacy fallback check: client/public/uploads/support
    const legacyBase = path.resolve(process.cwd(), 'client', 'public', 'uploads', 'support');
    const legacyPath = path.resolve(legacyBase, safeFilename);
    if (legacyPath.startsWith(legacyBase) && fs.existsSync(legacyPath)) {
      return legacyPath;
    }

    return null;
  }

  async resolveSupportStream(filename) {
    const filePath = await this.resolveSupportPath(filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }
    const stats = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    return {
      stream,
      filePath,
      size: stats.size,
    };
  }

  async publish(workspaceId, filename) {
    const wsId = workspaceId.toString();
    const safeFilename = path.basename(filename);
    const privatePath = await this.resolvePrivatePath(wsId, safeFilename);
    if (!privatePath) {
      throw new Error(`Private file does not exist: ${filename}`);
    }

    const pubDir = this.getPublishedDir(wsId);
    const publishedPath = path.resolve(pubDir, safeFilename);

    fs.copyFileSync(privatePath, publishedPath);
    return this.getPublicDeliveryUrl(wsId, safeFilename);
  }

  async revoke(workspaceId, filename) {
    const wsId = workspaceId.toString();
    const safeFilename = path.basename(filename);
    const pubDir = this.getPublishedDir(wsId);
    const pubFile = path.resolve(pubDir, safeFilename);

    if (fs.existsSync(pubFile)) {
      await fs.promises.unlink(pubFile);
      return true;
    }
    return false;
  }

  async existsPrivate(workspaceId, filename) {
    const p = await this.resolvePrivatePath(workspaceId, filename);
    return Boolean(p);
  }

  async existsPublished(workspaceId, filename) {
    const pubDir = this.getPublishedDir(workspaceId);
    const safeFilename = path.basename(filename);
    const pubFile = path.resolve(pubDir, safeFilename);
    return fs.existsSync(pubFile);
  }

  async deletePrivate(workspaceId, filename) {
    const filePath = await this.resolvePrivatePath(workspaceId, filename);
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  getPublicDeliveryUrl(workspaceId, filename) {
    return `/published/${workspaceId.toString()}/${path.basename(filename)}`;
  }
}
