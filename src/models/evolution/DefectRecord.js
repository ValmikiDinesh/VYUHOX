import mongoose from 'mongoose';

const defectRecordSchema = new mongoose.Schema(
  {
    defectId: {
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
    violatedRequirementId: {
      type: String,
      required: true,
      index: true,
    },
    responsibleModule: {
      type: String,
      required: true,
    },
    assignedDeveloper: {
      type: String,
      enum: ['FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER', 'DATABASE_SPECIALIST', 'INTEGRATION_ENGINEER'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    discoveredByAgent: {
      type: String,
      enum: ['QA_EXECUTION_ENGINEER', 'INDEPENDENT_SECURITY_AUDITOR', 'PERFORMANCE_ENGINEER', 'PRODUCT_ACCEPTANCE_AUDITOR'],
      default: 'QA_EXECUTION_ENGINEER',
    },
    evidence: {
      testSuiteName: String,
      failingAssertion: String,
      actualOutput: String,
      expectedOutput: String,
      stackTrace: String,
      screenshotUrl: String,
    },
    rootCauseAnalysis: {
      type: String,
      default: '',
    },
    correctionPatch: {
      patchDescription: String,
      filesChanged: [String],
      gitCommitHash: String,
      appliedAt: Date,
    },
    codeReviewSignoff: {
      reviewedBy: { type: String, default: 'CODE_REVIEWER' },
      approved: Boolean,
      reviewNotes: String,
      reviewedAt: Date,
    },
    retestExecution: {
      testPassed: Boolean,
      executionDurationMs: Number,
      logs: String,
      verifiedAt: Date,
    },
    regressionSuitePassed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_REMEDIATION', 'IN_CODE_REVIEW', 'RETEST_FAILED', 'VERIFIED_FIXED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
  },
  { timestamps: true }
);

export const DefectRecord = mongoose.model('DefectRecord', defectRecordSchema);
export default DefectRecord;
