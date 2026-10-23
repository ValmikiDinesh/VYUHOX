import mongoose from 'mongoose';

const postingScheduleSlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "10:30", "15:00", "19:00"
    },
    preferredType: {
      type: String,
      enum: ['REEL', 'CAROUSEL', 'STATIC_GRAPHIC', 'TEXT_THREAD'],
      default: 'REEL',
    },
  },
  { _id: false }
);

const socialAccountConfigSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    brandVoice: {
      tone: { type: String, default: 'Authoritative, Data-Driven & Visionary' },
      style: { type: String, default: 'Punchy hooks, high-energy cadence, zero corporate fluff' },
      targetAudience: { type: String, default: 'Founders, quantitative traders, and GTM leaders' },
      keywords: { type: [String], default: ['Autonomous GTM', 'Algorithmic Scale', 'Sub-second Voice AI'] },
    },
    defaultHashtags: {
      type: [String],
      default: ['#SaaSGrowth', '#AIAutomation', '#GTM', '#BuildInPublic', '#TechFounders'],
    },
    autopilotEnabled: {
      type: Boolean,
      default: true,
    },
    publishingMode: {
      type: String,
      enum: ['AUTOPILOT', 'REVIEW_APPROVE'],
      default: 'AUTOPILOT',
    },
    connectedAccounts: {
      instagram: {
        connected: { type: Boolean, default: true },
        username: { type: String, default: '@vyuhox_hq' },
        followers: { type: Number, default: 14200 },
      },
      tiktok: {
        connected: { type: Boolean, default: true },
        username: { type: String, default: '@vyuhox.ai' },
        followers: { type: Number, default: 38500 },
      },
      youtube: {
        connected: { type: Boolean, default: true },
        channelName: { type: String, default: 'VYUHOX Autonomous Systems' },
        subscribers: { type: Number, default: 8900 },
      },
      twitter: {
        connected: { type: Boolean, default: true },
        handle: { type: String, default: '@vyuhox' },
        followers: { type: Number, default: 22400 },
      },
      linkedin: {
        connected: { type: Boolean, default: true },
        companyName: { type: String, default: 'VYUHOX AI Technologies' },
        followers: { type: Number, default: 11600 },
      },
      facebook: {
        connected: { type: Boolean, default: true },
        pageName: { type: String, default: 'VYUHOX Growth & Quantitative Systems' },
        followers: { type: Number, default: 18400 },
        adAccountId: { type: String, default: 'act_492019482019' },
      },
    },
    postingSchedule: {
      type: [postingScheduleSlotSchema],
      default: [
        { dayOfWeek: 'MON', timeSlot: '10:00', preferredType: 'REEL' },
        { dayOfWeek: 'MON', timeSlot: '18:30', preferredType: 'CAROUSEL' },
        { dayOfWeek: 'TUE', timeSlot: '12:00', preferredType: 'REEL' },
        { dayOfWeek: 'WED', timeSlot: '09:30', preferredType: 'STATIC_GRAPHIC' },
        { dayOfWeek: 'WED', timeSlot: '17:00', preferredType: 'REEL' },
        { dayOfWeek: 'THU', timeSlot: '11:00', preferredType: 'TEXT_THREAD' },
        { dayOfWeek: 'FRI', timeSlot: '14:30', preferredType: 'REEL' },
        { dayOfWeek: 'SAT', timeSlot: '16:00', preferredType: 'CAROUSEL' },
        { dayOfWeek: 'SUN', timeSlot: '19:30', preferredType: 'REEL' },
      ],
    },
    videoSettings: {
      voiceId: { type: String, default: 'maya_energetic' },
      language: { type: String, default: 'en-US' },
      tone: { type: String, default: 'aggressive_challenger' },
      subtitleStyle: { type: String, default: 'karaoke_neon_glow' },
      watermarkEnabled: { type: Boolean, default: true },
      bgMusicVolume: { type: Number, default: 0.18 },
    },
  },
  { timestamps: true }
);

export const SocialAccountConfig = mongoose.model('SocialAccountConfig', socialAccountConfigSchema);
export default SocialAccountConfig;
