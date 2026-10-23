import mongoose from 'mongoose';

const gtmStrategySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['B2B SaaS', 'D2C E-Commerce', 'Fintech / Web3', 'Local Service', 'Agency'],
      default: 'B2B SaaS',
    },
    rawExtractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analysisResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const GtmStrategy = mongoose.model('GtmStrategy', gtmStrategySchema);
