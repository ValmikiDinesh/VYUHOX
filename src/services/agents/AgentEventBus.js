import { EventEmitter } from 'events';
import { AgentActivityLog } from '../../models/AgentActivityLog.js';

class AgentEventBus extends EventEmitter {
  constructor() {
    super();
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Publish an autonomous agent action across the company
   * Persists log in MongoDB and broadcasts to frontend live activity stream
   */
  async recordActivity({
    workspaceId,
    agentRole,
    actionTitle,
    description,
    category,
    status = 'COMPLETED',
    impactScore = 85,
    metadata = {},
    latencyMs = 210,
  }) {
    try {
      const log = await AgentActivityLog.create({
        workspaceId,
        agentRole,
        actionTitle,
        description,
        category,
        status,
        impactScore,
        metadata,
        latencyMs,
      });

      // Broadcast live event to workspace room
      if (this.io && workspaceId) {
        this.io.to(workspaceId.toString()).emit('ai_company:activity', {
          log,
          timestamp: new Date(),
        });
      }

      // Also trigger internal event listeners
      this.emit(`activity:${agentRole}`, log);
      this.emit('activity:all', log);

      return log;
    } catch (err) {
      console.warn('[AgentEventBus] Failed to record activity log:', err.message);
      return null;
    }
  }

  /**
   * Broadcast Cross-Agent Feedback Loop event
   * e.g. Voice Closer Objection -> AI CMO Strategy Shift
   */
  async dispatchFeedbackLoop({ workspaceId, sourceAgent, targetAgent, eventType, payload, description }) {
    console.log(`[AgentEventBus] ⚡ CROSS-AGENT FEEDBACK: ${sourceAgent} -> ${targetAgent} | ${eventType}`);

    const log = await this.recordActivity({
      workspaceId,
      agentRole: sourceAgent,
      actionTitle: `Cross-Agent Signal: ${eventType}`,
      description: description || `Signaling ${targetAgent} to adapt operational parameters based on live customer response.`,
      category: 'CROSS_FEEDBACK',
      impactScore: 95,
      metadata: { targetAgent, eventType, payload },
    });

    if (this.io && workspaceId) {
      this.io.to(workspaceId.toString()).emit('ai_company:cross_feedback', {
        sourceAgent,
        targetAgent,
        eventType,
        payload,
        log,
      });
    }

    this.emit(`feedback:${targetAgent}`, { sourceAgent, eventType, payload, workspaceId });
    return log;
  }
}

export const agentEventBus = new AgentEventBus();
