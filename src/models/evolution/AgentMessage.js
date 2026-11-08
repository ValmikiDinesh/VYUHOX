import mongoose from 'mongoose';

const agentMessageSchema = new mongoose.Schema(
  {
    messageId: {
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
    senderAgent: {
      type: String,
      required: true,
    },
    recipientAgent: {
      type: String, // Agent role or 'BROADCAST_ALL' or 'EXECUTIVE_COUNCIL'
      required: true,
    },
    messageType: {
      type: String,
      enum: ['WORKFLOW_EVENT', 'DEPENDENCY_HANDOFF', 'CHALLENGE_ARGUMENT', 'DEFECT_ALERT', 'HUMAN_DECISION_NOTICE', 'STATUS_REPORT'],
      default: 'WORKFLOW_EVENT',
    },
    taskId: {
      type: String,
      default: null,
    },
    relatedDocIds: [String],
    relatedRequirementIds: [String],
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'],
      default: 'NORMAL',
    },
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const AgentMessage = mongoose.model('AgentMessage', agentMessageSchema);
export default AgentMessage;

