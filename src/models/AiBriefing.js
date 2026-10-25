import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  actionId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    enum: [
      'SCRAPE_LEADS',
      'SCALE_AD_BUDGET',
      'TRIGGER_RE_ENGAGEMENT',
      'OPTIMIZE_FINOPS_PRICING',
      'RESOLVE_CHURN_RISK',
      'CUSTOM',
    ],
    default: 'SCRAPE_LEADS',
  },
  // Execution payload for 1-click execution
  executionPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  estimatedImpact: {
    type: String,
    default: '+15 Qualified Meetings',
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED_AND_EXECUTED', 'DISMISSED'],
    default: 'PENDING',
  },
  executedAt: {
    type: Date,
    default: null,
  },
  executionResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

const aiBriefingSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    briefingScope: {
      type: String,
      enum: ['CLIENT_WORKSPACE', 'SUPERADMIN_GLOBAL'],
      default: 'CLIENT_WORKSPACE',
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    title: {
      type: String,
      default: 'Autonomous Morning Executive Intelligence Briefing',
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    kpiSnapshot: {
      leadsScraped24h: { type: Number, default: 0 },
      emailsSent24h: { type: Number, default: 0 },
      callsCompleted24h: { type: Number, default: 0 },
      demosBooked24h: { type: Number, default: 0 },
      pipelineValueUSD: { type: Number, default: 0 },
      blendedRoas: { type: Number, default: 3.8 },
      churnRiskTenantsCount: { type: Number, default: 0 },
      platformWholesaleCostUSD: { type: Number, default: 0 },
    },
    actionCards: [actionItemSchema],
    deliveryChannels: {
      type: [String],
      default: ['IN_APP_DASHBOARD', 'WHATSAPP'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AiBriefing = mongoose.model('AiBriefing', aiBriefingSchema);
export default AiBriefing;
