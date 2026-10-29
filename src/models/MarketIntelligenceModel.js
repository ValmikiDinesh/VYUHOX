import mongoose from 'mongoose';

const marketIntelligenceSchema = new mongoose.Schema(
  {
    categoryKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    businessModel: {
      type: String,
      default: 'COMMERCIAL_ENTERPRISE',
    },
    industryKeywords: [{ type: String }],
    swotMatrix: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
    },
    targetAudience: {
      primaryPersona: { type: String },
      decisionMakers: [{ type: String }],
      painPoints: [{ type: String }],
      buyingTriggers: [{ type: String }],
      typicalACV: { type: String },
    },
    creativeAdStrategies: [
      {
        angleName: { type: String },
        platform: { type: String },
        headlineHook: { type: String },
        primaryTextTemplate: { type: String },
        visualDirective: { type: String },
        suggestedCta: { type: String },
      },
    ],
    viralReelConcepts: [
      {
        hookText: { type: String },
        visualBrollTheme: { type: String },
        recommendedVoice: { type: String },
        ctaAction: { type: String },
      },
    ],
    trendingSignals: [
      {
        trendTitle: { type: String },
        momentumScore: { type: Number, default: 85 },
        source: { type: String, default: 'Autonomous Market Radar' },
        discoveredAt: { type: Date, default: Date.now },
      },
    ],
    lastStudiedAt: {
      type: Date,
      default: Date.now,
    },
    learnedCaseStudiesCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const MarketIntelligence = mongoose.model('MarketIntelligence', marketIntelligenceSchema);
export default MarketIntelligence;
