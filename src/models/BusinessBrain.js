import mongoose from 'mongoose';

const qaLedgerSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    leadName: {
      type: String,
      default: 'Anonymous Prospect',
    },
    channel: {
      type: String,
      default: 'OMNICHANNEL',
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    exactAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    sourceRound: {
      type: Number,
      default: 1,
    },
    sourceLevel: {
      type: String,
      default: 'L3_OMNICHANNEL',
    },
    confidenceScore: {
      type: Number,
      default: 0.95,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const roundHistorySchema = new mongoose.Schema(
  {
    roundNumber: {
      type: Number,
      required: true,
    },
    accumulatedKnowledgeSummary: {
      type: String,
      default: '',
    },
    learnedFaqs: [
      {
        question: String,
        answer: String,
        sourceLevel: String,
        dateLearned: { type: Date, default: Date.now },
      },
    ],
    resolvedObjections: [
      {
        objection: String,
        counterScript: String,
        conversionRate: { type: Number, default: 0.8 },
      },
    ],
    marketInsights: [String],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const businessBrainSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    currentRound: {
      type: Number,
      default: 1,
    },
    // Multi-Stage Real-Time Compounding Snapshots
    evolutionStages: {
      L1_dna: { type: mongoose.Schema.Types.Mixed, default: {} },
      L2_prospecting: { type: mongoose.Schema.Types.Mixed, default: {} },
      L3_omnichannel: { type: mongoose.Schema.Types.Mixed, default: {} },
      L4_mayaVoice: { type: mongoose.Schema.Types.Mixed, default: {} },
      L5_socialAds: { type: mongoose.Schema.Types.Mixed, default: {} },
      L6_growthDemos: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    // Historical Knowledge Preserved Across All Rounds (R1, R2, R3...)
    roundsHistory: [roundHistorySchema],
    // Immutable Q&A Ledger: Every question ever asked by any lead and the exact business answer provided
    qaLedger: [qaLedgerSchema],
    // Global Compressed Persistent Memory string (combining all past rounds R1..Rn + active round levels)
    cumulativeMemoryText: {
      type: String,
      default: '',
    },
    totalLearnedFacts: {
      type: Number,
      default: 0,
    },
    totalQuestionsAnswered: {
      type: Number,
      default: 0,
    },
    accuracyScore: {
      type: Number,
      default: 98.5,
    },
    lastEvolvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const BusinessBrain = mongoose.model('BusinessBrain', businessBrainSchema);
export default BusinessBrain;
