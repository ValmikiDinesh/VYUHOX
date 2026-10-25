import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      default: 'B2B',
    },
    businessCategory: {
      type: String,
      trim: true,
      default: '',
    },
    businessModelDescription: {
      type: String,
      trim: true,
      default: '',
    },
    ownerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    ownerName: {
      type: String,
      trim: true,
      default: '',
    },
    operatingMode: {
      type: String,
      enum: ['TOOL', 'AI_COMPANY'],
      default: 'TOOL',
    },
    logo: {
      type: String,
      default: '',
    },
    branding: {
      primaryColor: { type: String, default: '#06B6D4' },
      secondaryColor: { type: String, default: '#10B981' },
      companyName: { type: String, default: '' },
    },
    currentStrategyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GtmStrategy',
      default: null,
    },
    hiredAgents: [
      {
        agentRole: {
          type: String,
          enum: ['CMO', 'SDR', 'VOICE_CLOSER', 'CFO', 'CUSTOMER_SUCCESS', 'CEO'],
          required: true,
        },
        name: { type: String, default: '' },
        monthlyCost: { type: Number, default: 39 },
        active: { type: Boolean, default: true },
        hiredAt: { type: Date, default: Date.now },
      },
    ],
    subscription: {
      planTier: {
        type: String,
        enum: ['TOOL_MODE', 'AI_COMPANY_STARTER', 'AI_COMPANY_SCALE', 'CUSTOM'],
        default: 'TOOL_MODE',
      },
      baseMonthlyFee: { type: Number, default: 49 },
      agentAddonFee: { type: Number, default: 0 },
      totalMonthlyFee: { type: Number, default: 49 },
      status: { type: String, default: 'ACTIVE' },
      billingCycle: { type: String, default: 'MONTHLY' },
      nextBillingDate: { type: Date },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
