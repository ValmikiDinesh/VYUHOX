import { StorageAdapter } from './StorageAdapter.js';
import path from 'path';
import fs from 'fs';

/**
 * R2StorageAdapter
 * Cloudflare R2 / S3-compatible cloud object storage adapter.
 * 
 * Enforces dual-bucket security architecture:
 * 1. Private Bucket (`R2_PRIVATE_BUCKET`):
 *    - Strictly private, never bound to public domains or CDN endpoints.
 *    - Holds all customer master assets (`workspaces/${wsId}/${filename}`) and support attachments (`support/${filename}`).
 *    - Assets are streamed exclusively through authenticated, signed Express endpoints.
 * 2. Published Bucket (`R2_PUBLISHED_BUCKET`):
 *    - Bound exclusively to approved public CDN delivery (`R2_PUBLIC_DOMAIN`).
 *    - Holds only client-approved, published creative media (`published/${wsId}/${filename}`).
 *    - Revocation deletes from this bucket; private master copy remains untouched in private bucket.
 * 
 * Zero hardcoded credentials: configuration is loaded strictly from environment variables.
 */
export class R2StorageAdapter extends StorageAdapter {
  constructor(config = {}) {
    super();
    this.accountId = config.accountId || process.env.R2_ACCOUNT_ID || null;
    this.accessKeyId = config.accessKeyId || process.env.R2_ACCESS_KEY_ID || null;
    this.secretAccessKey = config.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY || null;
    
    // Separate private and published buckets (with single-bucket backward compatibility)
    this.privateBucket = config.privateBucket || process.env.R2_PRIVATE_BUCKET || config.bucketName || process.env.R2_BUCKET_NAME || null;
    this.publishedBucket = config.publishedBucket || process.env.R2_PUBLISHED_BUCKET || config.bucketName || process.env.R2_BUCKET_NAME || null;
    this.bucketName = this.privateBucket; // Legacy alias

    this.publicDomain = config.publicDomain || process.env.R2_PUBLIC_DOMAIN || null;
    this.endpoint = config.endpoint || (this.accountId ? `https://${this.accountId}.r2.cloudflarestorage.com` : null);

    this.s3Client = null;
    this.isSdkAvailable = false;
  }

  get isCloudStorage() {
    return true;
  }

  /**
   * Validates whether all mandatory environment variables or configurations are supplied.
   * Zero hardcoded credentials; strictly validates runtime configuration.
   */
  validateConfiguration() {
    const missing = [];
    if (!this.accountId && !this.endpoint) missing.push('R2_ACCOUNT_ID or R2_ENDPOINT');
    if (!this.accessKeyId) missing.push('R2_ACCESS_KEY_ID');
    if (!this.secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
    if (!this.privateBucket) missing.push('R2_PRIVATE_BUCKET or R2_BUCKET_NAME');
    if (!this.publishedBucket) missing.push('R2_PUBLISHED_BUCKET or R2_BUCKET_NAME');

    if (missing.length > 0) {
      return {
        valid: false,
        missing,
        message: `Cloudflare R2 configuration incomplete. Missing: ${missing.join(', ')}`,
      };
    }
    return { valid: true };
  }

  /**
   * Initializes the S3 client instance if credentials and SDK are available.
   */
  async init() {
    const validation = this.validateConfiguration();
    if (!validation.valid) {
      throw new Error(`Cloudflare R2 initialization failed: ${validation.message}`);
    }

    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });
      this.isSdkAvailable = true;
      return true;
    } catch (e) {
      this.isSdkAvailable = false;
      throw new Error(`Cloudflare R2 SDK unavailable: @aws-sdk/client-s3 must be installed. ${e.message}`);
    }
  }

  /**
   * Returns workspace-scoped S3 key for private assets
   */
  getPrivateKey(workspaceId, filename) {
    const safeFilename = path.basename(filename);
    return `workspaces/${workspaceId.toString()}/${safeFilename}`;
  }

  /**
   * Returns workspace-scoped S3 key for published assets
   */
  getPublishedKey(workspaceId, filename) {
    const safeFilename = path.basename(filename);
    return `published/${workspaceId.toString()}/${safeFilename}`;
  }

  /**
   * Returns S3 key for private support attachments
   */
  getSupportKey(filename) {
    const safeFilename = path.basename(filename);
    return `support/${safeFilename}`;
  }

  /**
   * Returns public delivery URL for a published asset via approved CDN domain
   */
  getPublicDeliveryUrl(workspaceId, filename) {
    const safeFilename = path.basename(filename);
    const key = `published/${workspaceId.toString()}/${safeFilename}`;
    if (this.publicDomain) {
      const domain = this.publicDomain.replace(/\/+$/, '');
      return `${domain}/${key}`;
    }
    return `https://${this.publishedBucket}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  async savePrivate(workspaceId, filename, data, mimeType) {
    if (!this.s3Client) {
      await this.init();
    }
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.getPrivateKey(workspaceId, filename);

    let body = data;
    if (typeof data === 'string' && fs.existsSync(data)) {
      body = fs.createReadStream(data);
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.privateBucket,
        Key: key,
        Body: body,
        ContentType: mimeType || 'application/octet-stream',
      })
    );
    return key;
  }

  async resolvePrivatePath(workspaceId, filename) {
    // In cloud object storage, there is no local filesystem path
    return null;
  }

  async resolvePrivateStream(workspaceId, filename) {
    if (!this.s3Client) {
      await this.init();
    }
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.getPrivateKey(workspaceId, filename);
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.privateBucket,
        Key: key,
      })
    );
    return {
      stream: response.Body,
      mimeType: response.ContentType,
      size: response.ContentLength,
    };
  }

  async saveSupport(filename, data, mimeType) {
    if (!this.s3Client) {
      await this.init();
    }
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.getSupportKey(filename);

    let body = data;
    if (typeof data === 'string' && fs.existsSync(data)) {
      body = fs.createReadStream(data);
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.privateBucket,
        Key: key,
        Body: body,
        ContentType: mimeType || 'application/octet-stream',
      })
    );
    return key;
  }

  async resolveSupportStream(filename) {
    if (!this.s3Client) {
      await this.init();
    }
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.getSupportKey(filename);
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.privateBucket,
        Key: key,
      })
    );
    return {
      stream: response.Body,
      mimeType: response.ContentType,
      size: response.ContentLength,
    };
  }

  async publish(workspaceId, filename) {
    if (!this.s3Client) {
      await this.init();
    }
    const { CopyObjectCommand } = await import('@aws-sdk/client-s3');
    const sourceKey = this.getPrivateKey(workspaceId, filename);
    const targetKey = this.getPublishedKey(workspaceId, filename);

    // Copy from private bucket to published bucket
    await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: this.publishedBucket,
        CopySource: `${this.privateBucket}/${sourceKey}`,
        Key: targetKey,
      })
    );

    return this.getPublicDeliveryUrl(workspaceId, filename);
  }

  async revoke(workspaceId, filename) {
    if (!this.s3Client) {
      await this.init();
    }
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.getPublishedKey(workspaceId, filename);

    // Delete ONLY from the published bucket; private master copy remains safely preserved in privateBucket
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.publishedBucket,
        Key: key,
      })
    );
    return true;
  }

  async existsPrivate(workspaceId, filename) {
    if (!this.s3Client) {
      await this.init();
    }
    try {
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
      const key = this.getPrivateKey(workspaceId, filename);
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.privateBucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async existsPublished(workspaceId, filename) {
    if (!this.s3Client) {
      await this.init();
    }
    try {
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
      const key = this.getPublishedKey(workspaceId, filename);
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.publishedBucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async deletePrivate(workspaceId, filename) {
    if (!this.s3Client) {
      await this.init();
    }
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.getPrivateKey(workspaceId, filename);
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.privateBucket,
        Key: key,
      })
    );
    return true;
  }
}
