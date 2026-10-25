import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    activeChannel: {
      type: String,
      enum: ['WHATSAPP', 'TELEGRAM', 'SMS', 'EMAIL'],
      default: 'WHATSAPP',
      required: true,
    },
    lastMessageSnippet: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    sentiment: {
      type: String,
      enum: ['HIGH_INTENT', 'OBJECTION', 'GENERAL_INQUIRY', 'NOT_INTERESTED', 'NEUTRAL'],
      default: 'NEUTRAL',
      index: true,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    autoReplyEnabled: {
      type: Boolean,
      default: true,
    },
    aiDrafts: {
      EMAIL: {
        subject: { type: String, default: '' },
        body: { type: String, default: '' },
      },
      WHATSAPP: {
        body: { type: String, default: '' },
      },
      TELEGRAM: {
        body: { type: String, default: '' },
      },
      SMS: {
        body: { type: String, default: '' },
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound index to ensure 1 primary conversation thread per lead per workspace
conversationSchema.index({ workspaceId: 1, leadId: 1 }, { unique: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);
