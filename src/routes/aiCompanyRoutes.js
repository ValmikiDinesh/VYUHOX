import express from 'express';
import { aiCEO } from '../services/agents/AICEO.js';
import { aiCMO } from '../services/agents/AICMO.js';
import { aiSDR } from '../services/agents/AISDR.js';
import { aiVoiceCloser } from '../services/agents/AIVoiceCloser.js';
import { aiCFO } from '../services/agents/AICFO.js';
import { aiCustomerSuccess } from '../services/agents/AICustomerSuccess.js';
import { agentEventBus } from '../services/agents/AgentEventBus.js';
import { AgentActivityLog } from '../models/AgentActivityLog.js';
import { CeoBriefing } from '../models/CeoBriefing.js';

const router = express.Router();

/**
 * GET /api/ai-company/status
 * Returns organizational chart and live telemetry for all 6 specialized agents
 */
router.get('/status', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const [ceo, cmo, sdr, closer, cfo, cs] = await Promise.all([
      aiCEO.getStatus(workspaceId),
      aiCMO.getStatus(workspaceId),
      aiSDR.getStatus(workspaceId),
      aiVoiceCloser.getStatus(workspaceId),
      aiCFO.getStatus(workspaceId),
      aiCustomerSuccess.getStatus(workspaceId),
    ]);

    return res.json({
      success: true,
      orgHierarchy: {
        leader: ceo,
        executiveTeam: [cmo, sdr, closer, cfo, cs],
      },
    });
  } catch (error) {
    console.error('[AICompanyRoutes] Error fetching agent status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/ai-company/activities
 * Live multi-agent activity terminal stream
 */
router.get('/activities', async (req, res) => {
  try {
    const { workspaceId, agentRole, limit = 50 } = req.query;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const query = { workspaceId };
    if (agentRole && agentRole !== 'ALL') {
      query.agentRole = agentRole;
    }

    const activities = await AgentActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('[AICompanyRoutes] Error fetching activities:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/ai-company/briefings
 * List daily CEO briefings and actionable proposals
 */
router.get('/briefings', async (req, res) => {
  try {
    const { workspaceId, limit = 10 } = req.query;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    let briefings = await CeoBriefing.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // If none exist, auto-generate initial morning brief
    if (briefings.length === 0) {
      const generated = await aiCEO.generateDailyBriefing({ workspaceId });
      briefings = [generated.briefing];
    }

    return res.json({
      success: true,
      count: briefings.length,
      briefings,
    });
  } catch (error) {
    console.error('[AICompanyRoutes] Error fetching briefings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai-company/briefings/generate
 * Trigger instant synthesis of CEO 9:00 AM briefing
 */
router.post('/briefings/generate', async (req, res) => {
  try {
    const { workspaceId, ownerPhone, deliveryChannel } = req.body;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const result = await aiCEO.generateDailyBriefing({
      workspaceId,
      ownerPhone,
      deliveryChannel: deliveryChannel || 'WHATSAPP',
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('[AICompanyRoutes] Error generating briefing:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai-company/proposals/decision
 * 1-Click Approve / Reject for CEO proposed strategic actions
 */
router.post('/proposals/decision', async (req, res) => {
  try {
    const { workspaceId, briefingId, actionId, decision, reason } = req.body;
    if (!workspaceId || !briefingId || !actionId || !decision) {
      return res.status(400).json({
        success: false,
        message: 'workspaceId, briefingId, actionId, and decision are required',
      });
    }

    const result = await aiCEO.handleProposalDecision({
      workspaceId,
      briefingId,
      actionId,
      decision,
      reason,
    });

    return res.json(result);
  } catch (error) {
    console.error('[AICompanyRoutes] Error recording proposal decision:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai-company/simulate-objection
 * Interactive demonstration of Cross-Agent Feedback Loop:
 * Voice Closer detects objection ("Do you support Bybit?") -> Signals AI CMO -> Auto-updates Ad Creative & Scraper Targeting!
 */
router.post('/simulate-objection', async (req, res) => {
  try {
    const { workspaceId, objection = 'Do you support Bybit?', leadName = 'Marcus Vance (Vance Capital)' } = req.body;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const result = await aiVoiceCloser.reportObjectionDetected({
      workspaceId,
      objection,
      leadName,
      context: 'Inbound high-intent discovery call regarding algorithmic liquidity router',
    });

    return res.json(result);
  } catch (error) {
    console.error('[AICompanyRoutes] Error running cross-agent objection simulation:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
