import mongoose from 'mongoose';

const evolutionTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
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
    epicId: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    requirementIds: {
      type: [String],
      required: true,
      default: [],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedAgent: {
      type: String,
      enum: [
        'PROJECT_DELIVERY_MANAGER',
        'FRONTEND_DEVELOPER',
        'BACKEND_DEVELOPER',
        'DATABASE_SPECIALIST',
        'INTEGRATION_ENGINEER',
        'CODE_REVIEWER',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    dependencies: [String],
    acceptanceCriteria: [
      {
        criterionId: String,
        description: String,
        verified: { type: Boolean, default: false },
      },
    ],
    featureBranch: {
      type: String,
      default: '',
    },
    affectedFiles: [String],
    codePatchDiff: {
      type: String,
      default: '',
    },
    gitCommits: [
      {
        commitHash: String,
        message: String,
        author: String,
        timestamp: { type: Date, default: Date.now },
        filesChanged: [String],
      },
    ],
    codeReview: {
      reviewerAgent: { type: String, default: 'CODE_REVIEWER' },
      status: { type: String, enum: ['PENDING', 'APPROVED', 'CHANGES_REQUESTED'], default: 'PENDING' },
      architectureCompliance: Boolean,
      securityCheckPassed: Boolean,
      qualityScore: Number,
      comments: String,
      reviewedAt: Date,
    },
    status: {
      type: String,
      enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED'],
      default: 'TODO',
      index: true,
    },
  },
  { timestamps: true }
);

export const EvolutionTask = mongoose.model('EvolutionTask', evolutionTaskSchema);
export default EvolutionTask;

