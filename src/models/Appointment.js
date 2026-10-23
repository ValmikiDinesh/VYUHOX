import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
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
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    timezone: {
      type: String,
      default: 'America/New_York',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'CONFIRMED',
      index: true,
    },
    provider: {
      type: String,
      enum: ['GOOGLE_CALENDAR', 'CAL_COM', 'INTERNAL'],
      default: 'GOOGLE_CALENDAR',
    },
    meetLink: {
      type: String,
      default: '',
    },
    externalEventId: {
      type: String,
      default: '',
    },
    attendeeName: {
      type: String,
      required: true,
      trim: true,
    },
    attendeeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    attendeePhone: {
      type: String,
      trim: true,
      default: '',
    },
    hostName: {
      type: String,
      default: 'Founding Team',
    },
    hostEmail: {
      type: String,
      default: 'team@vyuhox.com',
    },
    bookedBy: {
      type: String,
      enum: ['AI_VOICE_AGENT', 'WHATSAPP_BOT', 'MANUAL_DASHBOARD', 'PUBLIC_LINK'],
      default: 'AI_VOICE_AGENT',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderScheduledFor: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
