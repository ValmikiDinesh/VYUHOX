import mongoose from 'mongoose';

const integrationConfigSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    serviceName: {
      type: String,
      enum: [
        'google_workspace',
        'outlook_365',
        'smtp_imap',
        'whatsapp_cloud',
        'bland_ai_voice',
        'bland_ai',
        'twilio_voice',
        'twilio',
        'meta_ads',
        'google_ads',
        'telegram',
        'linkedin',
        'resend',
        'openai',
      ],
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    // Sensitive credentials strictly isolated per workspace
    credentials: {
      type: Map,
      of: String,
      default: {},
    },
    // OAuth token lifecycle
    oauthDetails: {
      accessToken: { type: String, default: null },
      refreshToken: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      scope: { type: [String], default: [] },
      accountEmail: { type: String, default: null },
      callerIdPhone: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['CONNECTED', 'NEEDS_AUTH', 'REVOKED', 'FAILED_PING'],
      default: 'CONNECTED',
    },
    lastPingAt: {
      type: Date,
      default: Date.now,
    },
    lastPingLatencyMs: {
      type: Number,
      default: 45,
    },
  },
  { timestamps: true }
);

// Strict multi-tenant compound index ensuring absolute credential isolation
integrationConfigSchema.index({ workspaceId: 1, serviceName: 1 }, { unique: true });

export const IntegrationConfig = mongoose.model('IntegrationConfig', integrationConfigSchema);
