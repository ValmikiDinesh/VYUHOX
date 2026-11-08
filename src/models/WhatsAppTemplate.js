import mongoose from 'mongoose';

const buttonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25,
  },
  value: {
    type: String,
    default: '',
    trim: true,
  },
});

const whatsAppTemplateSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    templateName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]+$/,
    },
    metaTemplateId: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
      default: 'MARKETING',
      required: true,
    },
    language: {
      type: String,
      default: 'en_US',
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PAUSED'],
      default: 'APPROVED',
      index: true,
    },
    scenarioType: {
      type: String,
      enum: [
        'COLD_PROSPECTING',
        'DISCUSSION_RESUME',
        'SPEED_TO_LEAD',
        'MEETING_REMINDER',
        'QUOTE_READY',
        'SEASONAL_PROMO',
        'FEEDBACK_REVIEW',
        'CUSTOM',
      ],
      default: 'CUSTOM',
    },
    header: {
      type: {
        type: String,
        enum: ['NONE', 'TEXT', 'IMAGE', 'DOCUMENT', 'VIDEO'],
        default: 'NONE',
      },
      text: { type: String, default: '', trim: true },
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1024,
    },
    footer: {
      type: String,
      default: 'Reply STOP to unsubscribe',
      trim: true,
      maxlength: 60,
    },
    buttons: [buttonSchema],
    sampleVariables: [{ type: String, trim: true }],
    rejectionReason: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound index to guarantee unique template names within a single workspace
whatsAppTemplateSchema.index({ workspaceId: 1, templateName: 1 }, { unique: true });

export const WhatsAppTemplate = mongoose.model('WhatsAppTemplate', whatsAppTemplateSchema);
export default WhatsAppTemplate;

