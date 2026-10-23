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
      enum: ['twilio', 'bland_ai', 'meta_ads', 'google_ads', 'telegram', 'resend', 'openai'],
      required: true,
    },
    credentials: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure unique integration per workspace and service
integrationConfigSchema.index({ workspaceId: 1, serviceName: 1 }, { unique: true });

export const IntegrationConfig = mongoose.model('IntegrationConfig', integrationConfigSchema);
