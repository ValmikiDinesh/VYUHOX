import mongoose from 'mongoose';

const dripStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  delayDays: {
    type: Number,
    default: 1,
  },
  subject: {
    type: String,
    default: '',
  },
  bodyTemplate: {
    type: String,
    required: true,
  },
});

const dripSequenceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      enum: ['EMAIL', 'WHATSAPP', 'SMS'],
      default: 'EMAIL',
      required: true,
    },
    steps: [dripStepSchema],
    activeLeadIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'DRAFT'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const DripSequence = mongoose.model('DripSequence', dripSequenceSchema);
