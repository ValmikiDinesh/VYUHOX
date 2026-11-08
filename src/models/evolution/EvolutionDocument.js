import mongoose from 'mongoose';

const evolutionDocumentSchema = new mongoose.Schema(
  {
    docId: {
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
    cycleId: {
      type: String,
      required: true,
      index: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    agentRole: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        'RESEARCH_AND_PRODUCT_INTELLIGENCE',
        'TECHNICAL_AND_BUSINESS_REVIEW',
        'AI_EXECUTIVE_COUNCIL',
        'DEVELOPMENT',
        'TESTING_AND_GOVERNANCE',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    inputsAndSources: [
      {
        title: String,
        url: String,
        accessedAt: Date,
        citationType: { type: String, enum: ['LIVE_ENDPOINT', 'CODEBASE_AST', 'PUBLIC_WEB', 'DOCS', 'PREVIOUS_REPORT'], default: 'LIVE_ENDPOINT' },
        confidence: Number,
      },
    ],
    findings: [
      {
        findingId: String,
        category: String,
        title: String,
        description: String,
        evidence: String,
        severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'], default: 'MEDIUM' },
        confidenceLevel: { type: String, enum: ['VERIFIED_FACT', 'HIGH_CONFIDENCE', 'ESTIMATE', 'INFERENCE'], default: 'HIGH_CONFIDENCE' },
        impact: String,
      },
    ],
    recommendations: [
      {
        recId: String,
        actionType: { type: String, enum: ['ADD', 'IMPROVE', 'REMOVE', 'ARCHITECTURAL_CHANGE'], default: 'ADD' },
        title: String,
        description: String,
        businessValue: String,
        priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'FUTURE_OPPORTUNITY'], default: 'HIGH' },
        complexity: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL'], default: 'M' },
        risks: [String],
        dependencies: [String],
      },
    ],
    risks: [
      {
        riskId: String,
        title: String,
        description: String,
        severity: String,
        mitigation: String,
      },
    ],
    dependencies: [String],
    decisions: [String],
    openQuestions: [String],
    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'SUPERSEDED'],
      default: 'DRAFT',
      index: true,
    },
    approvedBy: String,
    approvedAt: Date,
    contentMarkdown: {
      type: String,
      required: true,
    },
    revisions: [
      {
        version: String,
        modifiedAt: { type: Date, default: Date.now },
        modifiedBy: String,
        changeSummary: String,
        previousContentMarkdown: String,
      },
    ],
    comments: [
      {
        commentId: String,
        author: String,
        authorRole: String,
        createdAt: { type: Date, default: Date.now },
        section: String,
        text: String,
        resolved: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export const EvolutionDocument = mongoose.model('EvolutionDocument', evolutionDocumentSchema);
export default EvolutionDocument;

