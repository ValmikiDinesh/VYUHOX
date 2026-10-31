import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    workspaceName: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      default: 'Client User',
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    diagnosticsSnapshot: {
      browser: { type: String, default: '' },
      url: { type: String, default: '' },
      walletBalanceUSD: { type: Number, default: 0 },
      currentStrategyId: { type: String, default: '' },
      lastApiError: { type: String, default: '' },
      operatingMode: { type: String, default: 'AI_COMPANY' },
      planTier: { type: String, default: 'NONE' },
    },
    adminNotes: {
      type: String,
      default: '',
    },
    creditedAmountUSD: {
      type: Number,
      default: 0,
    },
    resolvedBy: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ workspaceId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, createdAt: -1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;

