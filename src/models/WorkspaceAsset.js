import mongoose from 'mongoose';

/**
 * WorkspaceAsset Schema
 * Provides database-backed, multi-tenant asset ownership and authorization tracking.
 * Guarantees that assets uploaded or authorized by Workspace A can never leak into Workspace B.
 */
const workspaceAssetSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      default: '',
      trim: true,
    },
    mimeType: {
      type: String,
      default: 'image/jpeg',
    },
    size: {
      type: Number,
      default: 0,
    },
    assetType: {
      type: String,
      enum: ['PRODUCT_IMAGE', 'LOGO', 'B_ROLL_VIDEO', 'ATTACHMENT', 'GENERAL'],
      default: 'PRODUCT_IMAGE',
    },
    status: {
      type: String,
      enum: ['PRIVATE', 'PUBLISHED', 'ARCHIVED'],
      default: 'PRIVATE',
      index: true,
    },
    publishedUrl: {
      type: String,
      default: null,
    },
    storagePath: {
      type: String,
      default: null,
    },
    userAuthorized: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    revocationTx: {
      txId: {
        type: String,
        default: null,
        index: true,
      },
      phase: {
        type: String,
        enum: ['IDLE', 'LOCK_ACQUIRED', 'FILE_QUARANTINED', 'DB_COMMITTED', 'COMPLETED'],
        default: 'IDLE',
        index: true,
      },
      quarantineFilename: {
        type: String,
        default: null,
      },
      targetPubFile: {
        type: String,
        default: null,
      },
      initiatedAt: {
        type: Date,
        default: null,
      },
      hostInstance: {
        type: String,
        default: null,
      },
      recoveryNotes: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

workspaceAssetSchema.index({ workspaceId: 1, userAuthorized: 1 });

export const WorkspaceAsset = mongoose.model('WorkspaceAsset', workspaceAssetSchema);
export default WorkspaceAsset;

