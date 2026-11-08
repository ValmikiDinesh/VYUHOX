import mongoose from 'mongoose';

const executiveCouncilSessionSchema = new mongoose.Schema(
  {
    sessionId: {
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
    councilMembers: [
      {
        agentId: String,
        name: String,
        seatTitle: {
          type: String,
          enum: [
            'CHIEF_PRODUCT_OFFICER',
            'CHIEF_TECHNOLOGY_OFFICER',
            'CHIEF_QUALITY_OFFICER',
            'CHIEF_SECURITY_OFFICER',
            'BUSINESS_STRATEGY_DIRECTOR',
            'RESEARCH_DIRECTOR',
            'LEAD_DEVELOPER',
            'QA_DIRECTOR',
          ],
        },
      },
    ],
    currentRound: {
      type: Number,
      default: 1,
      min: 1,
      max: 6,
    },
    rounds: {
      round1_independentAssessment: [
        {
          agentSeat: String,
          summary: String,
          keyFindings: [String],
          primaryRecommendation: String,
        },
      ],
      round2_criticalExamination: [
        {
          challengerSeat: String,
          targetSeat: String,
          challengeStatement: String,
          counterArgument: String,
        },
      ],
      round3_conflictIdentification: [
        {
          conflictId: String,
          topic: String,
          contendingParties: [String],
          natureOfConflict: String,
          underlyingAssumption: String,
        },
      ],
      round4_alternativeSolutions: [
        {
          proposedBySeat: String,
          alternativeTopic: String,
          originalProposal: String,
          novelSolution: String,
          expectedAdvantage: String,
        },
      ],
      round5_riskEvaluation: [
        {
          assessedBySeat: String,
          riskCategory: { type: String, enum: ['TECHNICAL', 'OPERATIONAL', 'SECURITY', 'FINANCIAL', 'USER_EXPERIENCE'] },
          description: String,
          likelihood: String,
          severity: String,
          recommendedGuardrail: String,
        },
      ],
      round6_consensusAndDisagreement: {
        agreedRecommendations: [
          {
            recId: String,
            title: String,
            rationale: String,
            assignedDepartment: String,
          },
        ],
        rejectedRecommendations: [
          {
            recId: String,
            title: String,
            rejectionReason: String,
          },
        ],
        modifiedRecommendations: [
          {
            recId: String,
            originalTitle: String,
            modifiedTitle: String,
            amendmentNotes: String,
          },
        ],
        unresolvedDisagreements: [
          {
            topic: String,
            majorityView: String,
            minorityView: String,
            supportingEvidence: String,
          },
        ],
        escalatedToHumanDecisions: [
          {
            decisionId: String,
            question: String,
            options: [String],
            recommendationFromCouncil: String,
          },
        ],
      },
    },
    masterPlanDocId: {
      type: String,
      default: '',
    },
    councilReportDocId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['IN_SESSION', 'COMPLETED', 'ESCALATED_TO_HUMAN'],
      default: 'IN_SESSION',
    },
  },
  { timestamps: true }
);

export const ExecutiveCouncilSession = mongoose.model('ExecutiveCouncilSession', executiveCouncilSessionSchema);
export default ExecutiveCouncilSession;
