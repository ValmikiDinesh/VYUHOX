import mongoose from 'mongoose';

const timedWordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
  },
  { _id: false }
);

const timedCaptionSchema = new mongoose.Schema(
  {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
    words: [timedWordSchema],
  },
  { _id: false }
);

const carouselSlideSchema = new mongoose.Schema(
  {
    slideNumber: { type: Number, required: true },
    headline: { type: String, required: true },
    subtext: { type: String, default: '' },
    statCallout: { type: String, default: '' },
    visualTheme: { type: String, default: 'cyber-dark' },
  },
  { _id: false }
);

const socialPostSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE_SHORTS', 'TWITTER', 'LINKEDIN'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['REEL', 'CAROUSEL', 'STATIC_GRAPHIC', 'TEXT_THREAD'],
      default: 'REEL',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    scriptHook: {
      type: String,
      default: '',
    },
    scriptBody: {
      type: String,
      default: '',
    },
    scriptCta: {
      type: String,
      default: '',
    },
    timedCaptions: [timedCaptionSchema],
    mediaUrl: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
    carouselSlides: [carouselSlideSchema],
    caption: {
      type: String,
      default: '',
    },
    hashtags: {
      type: [String],
      default: [],
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED'],
      default: 'DRAFT',
      index: true,
    },
    publishingMode: {
      type: String,
      enum: ['AUTOPILOT', 'REVIEW_APPROVE'],
      default: 'REVIEW_APPROVE',
    },
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
    },
    failureReason: {
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

socialPostSchema.index({ workspaceId: 1, scheduledAt: 1, status: 1 });

export const SocialPost = mongoose.model('SocialPost', socialPostSchema);
export default SocialPost;
