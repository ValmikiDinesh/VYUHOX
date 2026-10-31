import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      default: 'Super Admin',
      trim: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'RATE_UPDATED',
        'WALLET_CREDITED',
        'CLIENT_PURGED',
        'PLAN_MODIFIED',
        'CIRCUIT_BREAKER_TRIGGERED',
        'GLOBAL_DNC_ADDED',
        'ANNOUNCEMENT_BROADCAST',
        'INTEGRATION_KEY_UPDATED',
        'SUPPORT_TICKET_RESOLVED',
      ],
    },
    targetWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
    targetWorkspaceName: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

