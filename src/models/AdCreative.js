import mongoose from 'mongoose';

const adCreativeSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdCampaign',
      required: true,
      index: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    primaryText: {
      type: String,
      required: true,
    },
    ctaText: {
      type: String,
      default: 'Book Strategy Call',
    },
    destinationUrl: {
      type: String,
      default: 'https://growth.hedgex.io/demo',
    },
    mediaUrl: {
      type: String,
      default: '/media/hedgex_reel.jpg',
    },
    platformFormat: {
      type: String,
      enum: ['META_FEED', 'META_STORY', 'GOOGLE_SEARCH_RESPONSIVE'],
      default: 'META_FEED',
      index: true,
    },
    ctrScore: {
      type: Number,
      default: 3.4, // % CTR
    },
    isFatigued: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AdCreative = mongoose.model('AdCreative', adCreativeSchema);
export default AdCreative;
