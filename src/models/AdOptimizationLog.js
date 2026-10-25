import mongoose from 'mongoose';

const adOptimizationLogSchema = new mongoose.Schema(
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
    ruleTriggered: {
      type: String,
      enum: ['KILL_UNDERPERFORMER', 'SCALE_WINNER', 'SWAP_FATIGUED_CREATIVE', 'AUTO_HEAL_REJECTION', 'STORE_COMPLIANCE_AUDIT'],
      required: true,
      index: true,
    },
    actionTaken: {
      type: String,
      required: true,
    },
    previousValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
    rationale: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const AdOptimizationLog = mongoose.model('AdOptimizationLog', adOptimizationLogSchema);
export default AdOptimizationLog;
