import mongoose from 'mongoose';

const adCampaignSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: [
        'META',
        'GOOGLE_ADS',
        'META_FACEBOOK',
        'INSTAGRAM_REELS',
        'META_FEED',
        'META_REELS',
        'META_LEAD_FORM',
        'META_WHATSAPP',
        'META_CATALOG',
        'GOOGLE_SEARCH',
        'GOOGLE_SHOPPING',
        'GOOGLE_PMAX',
        'GOOGLE_YOUTUBE',
        'GOOGLE_DISPLAY',
      ],
      default: 'META',
      index: true,
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    objective: {
      type: String,
      enum: [
        'LEAD_GENERATION',
        'CONVERSIONS',
        'TRAFFIC',
        'VIDEO_VIEWS',
        'CATALOG_SALES',
        'SHOPPING',
        'WHATSAPP_CONVERSATIONS',
        'BRAND_AWARENESS',
      ],
      default: 'LEAD_GENERATION',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED', 'DISAPPROVED', 'HEALING'],
      default: 'ACTIVE',
      index: true,
    },
    dailyBudget: {
      type: Number,
      required: true,
      default: 150,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    targetCpa: {
      type: Number,
      default: 35, // Target Cost per Acquisition ($)
    },
    targeting: {
      locations: { type: [String], default: ['United States', 'United Kingdom', 'Switzerland', 'Singapore'] },
      ageRange: { type: [Number], default: [25, 65] },
      interests: { type: [String], default: ['Algorithmic Trading', 'Hedge Funds', 'Quant Finance', 'Family Office'] },
      keywords: { type: [String], default: ['crypto hedge fund execution', 'sub second trading latency', 'institutional quant alpha'] },
    },
    metrics: {
      spend: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      roas: { type: Number, default: 3.8 }, // Return on Ad Spend (e.g. 3.8x)
      cpa: { type: Number, default: 0 }, // Cost per acquisition
      ctr: { type: Number, default: 3.2 }, // Click through rate %
    },
    lastOptimizedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtuals / aliases for compatibility
adCampaignSchema.virtual('dailyBudgetUSD').get(function () {
  return this.dailyBudget;
}).set(function (v) {
  this.dailyBudget = v;
});

adCampaignSchema.virtual('totalSpendUSD').get(function () {
  return this.totalSpend || this.metrics?.spend || 0;
}).set(function (v) {
  this.totalSpend = v;
  if (!this.metrics) this.metrics = {};
  this.metrics.spend = v;
});

adCampaignSchema.set('toJSON', { virtuals: true });
adCampaignSchema.set('toObject', { virtuals: true });

export const AdCampaign = mongoose.model('AdCampaign', adCampaignSchema);
export default AdCampaign;
