/**
 * StorageAdapter.js
 * Abstract interface for multi-tenant private media and published asset storage.
 * Designed to support both local filesystem storage and cloud object storage (AWS S3, Cloudflare R2, Google Cloud Storage).
 */
export class StorageAdapter {
  constructor() {
    if (new.target === StorageAdapter) {
      throw new TypeError('Cannot construct StorageAdapter instances directly; implement a subclass.');
    }
  }

  /**
   * Whether this adapter operates on cloud object storage (true) or local filesystem (false)
   */
  get isCloudStorage() {
    return false;
  }

  /**
   * Initializes storage base directories or bucket configurations
   */
  async init() {
    throw new Error('init() must be implemented by subclass');
  }

  /**
   * Saves private media asset for a workspace
   */
  async savePrivate(workspaceId, filename, data, mimeType) {
    throw new Error('savePrivate() must be implemented by subclass');
  }

  /**
   * Resolves private file path (if local filesystem) or null (if cloud object storage)
   */
  async resolvePrivatePath(workspaceId, filename) {
    throw new Error('resolvePrivatePath() must be implemented by subclass');
  }

  /**
   * Resolves private media stream for authenticated delivery through Express
   */
  async resolvePrivateStream(workspaceId, filename) {
    throw new Error('resolvePrivateStream() must be implemented by subclass');
  }

  /**
   * Saves support attachment in private storage
   */
  async saveSupport(filename, data, mimeType) {
    throw new Error('saveSupport() must be implemented by subclass');
  }

  /**
   * Resolves support attachment stream for authenticated delivery
   */
  async resolveSupportStream(filename) {
    throw new Error('resolveSupportStream() must be implemented by subclass');
  }

  /**
   * Copies/promotes private media to public delivery
   */
  async publish(workspaceId, filename) {
    throw new Error('publish() must be implemented by subclass');
  }

  /**
   * Revokes and removes public delivery copy
   */
  async revoke(workspaceId, filename) {
    throw new Error('revoke() must be implemented by subclass');
  }

  /**
   * Checks if private asset exists
   */
  async existsPrivate(workspaceId, filename) {
    throw new Error('existsPrivate() must be implemented by subclass');
  }

  /**
   * Checks if published asset exists
   */
  async existsPublished(workspaceId, filename) {
    throw new Error('existsPublished() must be implemented by subclass');
  }

  /**
   * Deletes private media asset
   */
  async deletePrivate(workspaceId, filename) {
    throw new Error('deletePrivate() must be implemented by subclass');
  }

  /**
   * Returns the external public delivery URL for a published asset
   */
  getPublicDeliveryUrl(workspaceId, filename) {
    throw new Error('getPublicDeliveryUrl() must be implemented by subclass');
  }
}
