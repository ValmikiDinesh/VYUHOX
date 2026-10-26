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
    // Autonomous Growth Engine Mode
    growthEngine: {
      type: String,
      enum: ['OUTBOUND_B2B', 'PAID_ADS_D2C', 'HYBRID', 'AUTO_RECOMMENDED'],
      default: 'AUTO_RECOMMENDED',
    },
    // Phase 7: Two-Sided Trade Engine & Dual Pipelines
    tradeMode: {
      type: String,
      enum: ['STANDARD', 'TWO_SIDED_TRADE', 'SUPPLIER_SOURCING', 'BUYER_DISTRIBUTION'],
      default: 'STANDARD',
    },
    twoSidedTradeConfig: {
      isTwoSided: { type: Boolean, default: false },
      supplierPipeline: {
        hsCodes: { type: [String], default: [] },
        targetCountries: { type: [String], default: [] },
        leadQuota: { type: Number, default: 50 },
        activeSourcingQuery: { type: String, default: '' },
      },
      buyerPipeline: {
        hsCodes: { type: [String], default: [] },
        targetCountries: { type: [String], default: [] },
        leadQuota: { type: Number, default: 50 },
        activeDistributionQuery: { type: String, default: '' },
      },
    },
    // Instant AI Micro-Site Generated for No-Website clients
    microSite: {
      slug: { type: String, unique: true, sparse: true, index: true },
      isPublished: { type: Boolean, default: false },
      headline: { type: String, default: '' },
      subheadline: { type: String, default: '' },
      offers: { type: [String], default: [] },
      ctaPhone: { type: String, default: '' },
      ctaWhatsApp: { type: String, default: '' },
      generatedFrom: {
        type: String,
        enum: ['WEBSITE', 'GOOGLE_MAPS', 'INSTAGRAM_BIO', 'VOICE_PROMPT'],
        default: 'WEBSITE',
      },
      visitorBookingsCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const GtmStrategy = mongoose.model('GtmStrategy', gtmStrategySchema);
export default GtmStrategy;
