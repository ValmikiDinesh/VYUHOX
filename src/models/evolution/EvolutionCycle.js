import mongoose from 'mongoose';

const evolutionCycleSchema = new mongoose.Schema(
  {
    cycleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvolutionProject',
      required: true,
      index: true,
    },
    baselineVersion: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    targetVersion: {
      type: String,
      default: '1.1.0',
    },
    objective: {
      type: String,
      required: true,
      default: 'Autonomous end-to-end evolution cycle: Comprehensive audit, competitive benchmarking, strategic architecture, human approval, code generation, testing, and defect resolution.',
    },
    budgetUSD: {
      type: Number,
      required: true,
      default: 50.0,
    },
    costUSD: {
      type: Number,
      default: 0.0,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    currentStage: {
      type: String,
      enum: [
        'INITIALIZED',
        'RESEARCH_AND_AUDIT',
        'CHECKPOINT_1_PROPOSAL_REVIEW',
        'TECHNICAL_AND_BUSINESS_REVIEW',
        'AI_EXECUTIVE_COUNCIL',
        'CHECKPOINT_2_MASTER_PLAN_REVIEW',
        'DEVELOPMENT',
        'TESTING_AND_VERIFICATION',
        'DEFECT_CORRECTION',
        'PRODUCT_ACCEPTANCE',
        'RELEASE_GATE',
        'COMPLETED',
        'HALTED_BUDGET_EXCEEDED',
        'HALTED_ITERATION_LIMIT',
      ],
      default: 'INITIALIZED',
      index: true,
    },
    iterationCount: {
      type: Number,
      default: 0,
    },
    maxIterations: {
      type: Number,
      default: 5,
    },
    completionCriteria: {
      type: [String],
      default: [
        'Live Product Audit completed with confidence scores',
        'Global Competitive Intelligence report synthesized with verified citations',
        'Product Strategy delivered and Human Checkpoint 1 Approved',
        'All 7 Technical & Business specialist reports completed',
        '6-Round AI Executive Council consensus documented with dissenting views',
        'Master Implementation Plan approved at Human Checkpoint 2',
        'Developer tasks generated and code changes executed in dedicated feature branch',
        'Playwright automated test suite executed with zero unhandled critical defects',
        'Final Product Acceptance report signed off by Product Acceptance Auditor',
      ],
    },
    humanCheckpoints: {
      checkpoint1Proposal: {
        status: { type: String, enum: ['PENDING', 'APPROVED', 'EDITED', 'REJECTED'], default: 'PENDING' },
        decidedAt: Date,
        decidedBy: String,
        comments: String,
        userModifications: mongoose.Schema.Types.Mixed,
        revisionCount: { type: Number, default: 0 },
      },
      checkpoint2MasterPlan: {
        status: { type: String, enum: ['PENDING', 'APPROVED', 'EDITED', 'REJECTED'], default: 'PENDING' },
        decidedAt: Date,
        decidedBy: String,
        comments: String,
        selectedFeatureIds: [String],
        deferredFeatureIds: [String],
        userModifications: mongoose.Schema.Types.Mixed,
        revisionCount: { type: Number, default: 0 },
      },
      productionReleaseGate: {
        status: { type: String, enum: ['LOCKED', 'AUTHORIZED', 'REJECTED'], default: 'LOCKED' },
        authorizedAt: Date,
        authorizedBy: String,
      },
    },
    defectStats: {
      totalFound: { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
      regressionFailures: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'HALTED'],
      default: 'ACTIVE',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const EvolutionCycle = mongoose.model('EvolutionCycle', evolutionCycleSchema);
export default EvolutionCycle;
