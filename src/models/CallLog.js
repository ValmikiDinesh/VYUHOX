import mongoose from 'mongoose';

const transcriptEntrySchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['assistant', 'user', 'system', 'human_rep'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const whisperEntrySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const callLogSchema = new mongoose.Schema(
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
    callId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ['OUTBOUND', 'INBOUND'],
      default: 'OUTBOUND',
    },
    fromNumber: {
      type: String,
      default: '+1 (800) 555-0199',
    },
    toNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'in-progress', 'completed', 'busy', 'no-answer', 'failed', 'transferred'],
      default: 'queued',
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    transcript: [transcriptEntrySchema],
    aiSummary: {
      type: String,
      default: '',
    },
    actionItems: [
      {
        type: String,
      },
    ],
    sentiment: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'HIGH_INTENT'],
      default: 'NEUTRAL',
    },
    sentimentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    takenOver: {
      type: Boolean,
      default: false,
    },
    takenOverBy: {
      type: String,
      default: '',
    },
    whisperHistory: [whisperEntrySchema],
    speedToLeadTriggered: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

callLogSchema.index({ workspaceId: 1, createdAt: -1 });

export const CallLog = mongoose.model('CallLog', callLogSchema);
