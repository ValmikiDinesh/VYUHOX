import mongoose from 'mongoose';

const dncRecordSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PHONE', 'EMAIL', 'BOTH'],
      default: 'PHONE',
    },
    phone: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      default: '',
    },
    reason: {
      type: String,
      default: 'Inbound STOP reply keyword',
    },
    channel: {
      type: String,
      enum: ['SMS', 'VOICE', 'EMAIL', 'WHATSAPP', 'MANUAL'],
      default: 'SMS',
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    leadName: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const DncRecord = mongoose.model('DncRecord', dncRecordSchema);
