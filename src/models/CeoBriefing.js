import mongoose from 'mongoose';

const ceoProposalActionSchema = new mongoose.Schema({
  actionId: {
    type: String,
    required: true,
  },
  agentRole: {
    type: String,
    enum: ['CEO', 'CMO', 'SDR', 'VOICE_CLOSER', 'CFO', 'CUSTOMER_SUCCESS'],
    required: true,
  },
  actionTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'],
    default: 'PENDING',
  },
  impact: {
    type: String,
    default: 'High Growth',
  },
  estimatedValue: {
    type: String,
    default: '+$14,500 MRR',
  },
  executedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
});

const ceoBriefingSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    briefingDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    title: {
      type: String,
      default: '9:00 AM Executive Briefing & Performance Synthesis',
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    metricsSnapshot: {
      mrr: { type: Number, default: 48500 },
      mrrGrowthPct: { type: Number, default: 14.8 },
      cac: { type: Number, default: 215 },
      ltv: { type: Number, default: 4600 },
      ltvCacRatio: { type: Number, default: 21.4 },
      roas: { type: Number, default: 4.12 },
      activeDemosBooked: { type: Number, default: 12 },
      churnRiskCount: { type: Number, default: 1 },
      burnRateUsd: { type: Number, default: 1420 },
    },
    proposedActions: [ceoProposalActionSchema],
    deliveredVia: {
      type: String,
      enum: ['WHATSAPP', 'TELEGRAM', 'DASHBOARD', 'EMAIL'],
      default: 'WHATSAPP',
    },
    deliveredTo: {
      type: String,
      default: '+1 (555) 019-2831',
    },
    deliveryStatus: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'READ', 'PENDING'],
      default: 'DELIVERED',
    },
  },
  { timestamps: true }
);

export const CeoBriefing = mongoose.model('CeoBriefing', ceoBriefingSchema);
