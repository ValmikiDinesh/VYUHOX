import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['CLIENT_TOOL', 'CLIENT_AI', 'ENTERPRISE'],
      default: 'CLIENT_AI',
    },
    targetRegion: {
      type: String,
      enum: ['ALL', 'INDIA_ONLY', 'GLOBAL_ONLY'],
      default: 'ALL',
    },
    priceUSD: {
      monthly: { type: Number, required: true },
      annualMonthly: { type: Number, required: true },
    },
    priceINR: {
      monthly: { type: Number, required: true },
      annualMonthly: { type: Number, required: true },
    },
    includedAgents: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    limits: {
      leadsPerMonth: { type: Number, default: 500 },
      voiceMinutesPerMonth: { type: Number, default: 60 },
      whatsappMessages: { type: Number, default: 1000 },
    },
    badge: {
      type: String,
      default: '',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);
