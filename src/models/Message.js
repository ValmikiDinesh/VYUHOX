import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
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
    direction: {
      type: String,
      enum: ['INBOUND', 'OUTBOUND'],
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['WHATSAPP', 'TELEGRAM', 'SMS', 'EMAIL'],
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'SENT',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
