import mongoose from 'mongoose';

const agentMemoryRecordSchema = new mongoose.Schema(
  {
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
    category: {
      type: String,
      enum: [
        'PREVIOUS_DECISION',
        'APPROVED_REQUIREMENT',
        'REJECTED_RECOMMENDATION',
        'HUMAN_FEEDBACK',
        'ARCHITECTURE_DECISION',
        'KNOWN_BUG',
        'PREVIOUS_TEST_FAILURE',
        'COMPLETED_IMPROVEMENT',
        'OUTSTANDING_RISK',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    originatingAgent: {
      type: String,
      required: true,
    },
    relatedDocId: String,
    relatedRequirementId: String,
    confidenceLevel: {
      type: String,
      default: 'VERIFIED_FACT',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AgentMemoryRecord = mongoose.model('AgentMemoryRecord', agentMemoryRecordSchema);
export default AgentMemoryRecord;

