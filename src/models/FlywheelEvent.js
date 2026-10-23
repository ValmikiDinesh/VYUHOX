import mongoose from 'mongoose';

const flywheelEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'AGENCY_DISCOVERED',
        'OUTBOUND_DISPATCHED',
        'VOICE_DEMO_TRIGGERED',
        'STRIPE_CHECKOUT_SENT',
        'PAYMENT_CONVERTED',
        'WORKSPACE_AUTOPROVISIONED',
      ],
      required: true,
    },
    agencyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      default: 'Business Founder',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    planTier: {
      type: String,
      enum: ['TOOL_MODE', 'AI_COMPANY', 'CUSTOM_ENTERPRISE'],
      default: 'AI_COMPANY',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'IN_PROGRESS', 'QUEUED', 'CONVERTED'],
      default: 'SUCCESS',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    revenueUSD: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const FlywheelEvent = mongoose.model('FlywheelEvent', flywheelEventSchema);
