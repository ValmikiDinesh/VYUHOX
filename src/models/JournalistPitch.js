import mongoose from 'mongoose';

const journalistPitchSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null, // Null means platform-level (VYUHOX)
    },
    publication: {
      type: String,
      required: true,
      trim: true,
    },
    publicationDr: {
      type: Number,
      default: 85,
    },
    journalistName: {
      type: String,
      default: 'Editorial Staff',
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    query: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    category: {
      type: String,
      enum: ['B2B_SALES', 'AI_TECH', 'SAAS_GROWTH', 'FINTECH', 'LEAD_GEN', 'STARTUPS'],
      default: 'B2B_SALES',
    },
    draftedQuote: {
      type: String,
      default: '',
    },
    attributedFounder: {
      name: { type: String, default: 'Valmiki Dinesh' },
      title: { type: String, default: 'Founder & CEO, VYUHOX Autonomous GTM' },
      websiteUrl: { type: String, default: 'https://vyuhox.com' },
    },
    status: {
      type: String,
      enum: ['OPPORTUNITY_FOUND', 'DRAFTED', 'SUBMITTED', 'ACCEPTED_BACKLINK_WON', 'REJECTED'],
      default: 'OPPORTUNITY_FOUND',
      index: true,
    },
    backlinkUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    sourceFeed: {
      type: String,
      enum: ['CONNECTIVELY_HARO', 'QWOTED', 'JOURNALIST_TWITTER', 'EDITORIAL_OUTREACH'],
      default: 'CONNECTIVELY_HARO',
    },
  },
  { timestamps: true }
);

export const JournalistPitch = mongoose.model('JournalistPitch', journalistPitchSchema);
export default JournalistPitch;
