import mongoose from 'mongoose';

const adCreativeSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdCampaign',
      required: true,
      index: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    primaryText: {
      type: String,
      required: true,
    },
    bodyCopy: {
      type: String,
    },
    description: {
      type: String,
      default: '',
    },
    ctaText: {
      type: String,
      default: 'Book Strategy Call',
    },
    callToAction: {
      type: String,
      default: 'LEARN_MORE',
    },
    destinationUrl: {
      type: String,
      default: 'https://growth.hedgex.io/demo',
    },
    mediaType: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'CAROUSEL'],
      default: 'IMAGE',
    },
    mediaUrl: {
      type: String,
      default: '/media/hedgex_reel.jpg',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    aspectRatio: {
      type: String,
      default: '1:1',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'DISAPPROVED', 'HEALING', 'ARCHIVED'],
      default: 'DRAFT',
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING_CLIENT_REVIEW', 'CLIENT_APPROVED', 'REJECTED_OR_SKIPPED'],
      default: 'PENDING_CLIENT_REVIEW',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    platformFormat: {
      type: String,
      enum: [
        'META_FEED',
        'META_STORY',
        'META_REELS',
        'META_LEAD_FORM',
        'META_WHATSAPP',
        'META_CATALOG',
        'GOOGLE_SEARCH_RESPONSIVE',
        'GOOGLE_SEARCH',
        'GOOGLE_SHOPPING',
        'GOOGLE_PMAX',
        'GOOGLE_YOUTUBE',
        'GOOGLE_DISPLAY',
      ],
      default: 'META_FEED',
      index: true,
    },
    ctrScore: {
      type: Number,
      default: 3.4, // % CTR
    },
    isFatigued: {
      type: Boolean,
      default: false,
    },
    complianceStatus: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'DISAPPROVED', 'HEALING', 'HEALED'],
      default: 'APPROVED',
      index: true,
    },
    rejectionReason: {
      code: { type: String, default: null },
      details: { type: String, default: null },
      policyTopic: { type: String, default: null },
      flaggedAt: { type: Date, default: null },
    },
    healingHistory: [
      {
        attempt: { type: Number, default: 1 },
        previousHeadline: { type: String },
        previousPrimaryText: { type: String },
        healedHeadline: { type: String },
        healedPrimaryText: { type: String },
        policyAddressed: { type: String },
        appliedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['RESUBMITTED', 'REAPPROVED', 'FAILED'], default: 'RESUBMITTED' },
      },
    ],
  },
  { timestamps: true }
);

export const AdCreative = mongoose.model('AdCreative', adCreativeSchema);
export default AdCreative;
