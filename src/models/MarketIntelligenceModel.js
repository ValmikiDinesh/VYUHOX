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
      enum: [
        'B2B_SAAS_SUBSCRIPTION',
        'D2C_ECOMMERCE_PHYSICAL',
        'LOCAL_SERVICE_CONTRACTOR',
        'HIGH_TICKET_CONSULTING_AGENCY',
        'HEALTHCARE_CLINIC_PROFESSIONAL',
        'FINTECH_DEFI_CHITFUND',
        'LOGISTICS_MANUFACTURING_B2B',
        'EDTECH_COACHING_ACADEMY',
        'RESTAURANT_HOSPITALITY_RETAIL',
        'REAL_ESTATE_DEVELOPMENT_BROKER',
        'CREATIVE_MEDIA_ENTERTAINMENT',
        'AUTO_DEALERSHIP_SERVICES',
        'CLEANTECH_SOLAR_RENEWABLE',
        'HYBRID_MARKETPLACE_PLATFORM',
      ],
      default: 'B2B_SAAS_SUBSCRIPTION',
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
