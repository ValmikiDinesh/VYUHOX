import mongoose from 'mongoose';

const agentActivityLogSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    agentRole: {
      type: String,
      enum: ['CEO', 'CMO', 'SDR', 'VOICE_CLOSER', 'CFO', 'CUSTOMER_SUCCESS'],
      required: true,
      index: true,
    },
    actionTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['MARKETING', 'SALES', 'TELEPHONY', 'FINANCE', 'RETENTION', 'EXECUTIVE_STRATEGY', 'CROSS_FEEDBACK'],
      default: 'EXECUTIVE_STRATEGY',
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'FLAGGED'],
      default: 'COMPLETED',
      index: true,
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    latencyMs: {
      type: Number,
      default: 240,
    },
  },
  { timestamps: true }
);

export const AgentActivityLog = mongoose.model('AgentActivityLog', agentActivityLogSchema);
