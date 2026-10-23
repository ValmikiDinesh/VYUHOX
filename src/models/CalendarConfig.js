import mongoose from 'mongoose';

const calendarConfigSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    googleCalendar: {
      connected: { type: Boolean, default: false },
      email: { type: String, default: '' },
      calendarId: { type: String, default: 'primary' },
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
      syncActive: { type: Boolean, default: true },
      lastSyncedAt: { type: Date },
    },
    calCom: {
      connected: { type: Boolean, default: false },
      apiKey: { type: String, default: '' },
      eventTypeId: { type: String, default: '' },
      username: { type: String, default: '' },
      webhookActive: { type: Boolean, default: true },
    },
    defaultDurationMinutes: {
      type: Number,
      default: 30,
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      days: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri
      timezone: { type: String, default: 'America/New_York' },
    },
    bufferMinutes: {
      type: Number,
      default: 15,
    },
    autoDispatchMeetLink: {
      type: Boolean,
      default: true,
    },
    autoSmsReminderHours: {
      type: Number,
      default: 1, // 1 hour before meeting
    },
    roundRobinMembers: [
      {
        name: { type: String, default: 'Founding Team' },
        email: { type: String, default: 'team@vyuhox.com' },
        active: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export const CalendarConfig = mongoose.model('CalendarConfig', calendarConfigSchema);
