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
    businessPlanDocument: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    presentationDeck: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    visualCoverUrl: {
      type: String,
      default: '',
    },
    stepByStepRoadmap: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    clientNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const GtmStrategy = mongoose.model('GtmStrategy', gtmStrategySchema);
