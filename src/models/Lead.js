import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'UNVERIFIED', 'RISKY', 'DISPOSABLE'],
      default: 'UNVERIFIED',
    },
    mxHost: {
      type: String,
      default: '',
    },
    stage: {
      type: String,
      enum: ['Prospect', 'Contacted', 'Qualified', 'Demo_Booked', 'Won', 'Lost'],
      default: 'Prospect',
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    source: {
      type: String,
      enum: ['Scraper', 'Form', 'Ad', 'Inbound', 'INSTANT_AI_MICROSITE'],
      default: 'Scraper',
    },
    entityRole: {
      type: String,
      enum: ['BUYER', 'SELLER', 'HYBRID_TRADER', 'DECISION_MAKER', 'UNSPECIFIED'],
      default: 'BUYER',
      index: true,
    },
    tradeDetails: {
      hsCodes: [{ type: String }],
      products: [{ type: String }],
      verificationAudit: { type: String, default: '' },
      roleConfidenceScore: { type: Number, default: 85 },
    },
    channels: {
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
