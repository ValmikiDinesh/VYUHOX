import express from 'express';
import { FlywheelEngine } from '../services/flywheel/FlywheelEngine.js';
import { CumulativeContextService } from '../services/ai/CumulativeContextService.js';

const router = express.Router();

// GET /api/flywheel/overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await FlywheelEngine.getFlywheelOverview();
    return res.json({ success: true, ...overview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/flywheel/brain/:workspaceId - Fetch business brain compounding evolution status
router.get('/brain/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const brain = await CumulativeContextService.getOrCreateBrain(workspaceId);
    const ctx = await CumulativeContextService.getLevel6Context(workspaceId);
    return res.json({
      success: true,
      brain,
      currentRound: brain.currentRound || 1,
      activeLevels: 'L1 + L2 + L3 + L4 + L5 + L6',
      summaryText: ctx.summaryText,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/flywheel/brain/:workspaceId/ask - Answer any question using business brain + LLM
router.post('/brain/:workspaceId/ask', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { question, leadId, channel } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'question is required' });
    }
    const result = await CumulativeContextService.answerLeadQuestion({
      workspaceId,
      leadId,
      question,
      channel: channel || 'OMNICHANNEL',
    });
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/flywheel/brain/:workspaceId/advance-round - Advance evolution from Round N to Round N+1
router.post('/brain/:workspaceId/advance-round', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { summaryNotes } = req.body;
    const result = await CumulativeContextService.advanceEvolutionRound(workspaceId, summaryNotes);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/flywheel/brain-superadmin/overview - Super admin platform-wide intelligence and evolution stats
router.get('/brain-superadmin/overview', async (req, res) => {
  try {
    const overview = await CumulativeContextService.getGlobalSuperAdminEvolutionOverview();
    return res.json(overview);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/flywheel/prospect - Trigger autonomous agency discovery cycle
router.post('/prospect', async (req, res) => {
  try {
    const result = await FlywheelEngine.runProspectingCycle();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/flywheel/voice-demo - Trigger "Self-Demonstrating" Voice AI interactive callback
router.post('/voice-demo', async (req, res) => {
  try {
    const { phoneNumber, prospectName, agencyName, planTier } = req.body;
    const result = await FlywheelEngine.triggerSelfDemoVoiceCall({
      phoneNumber,
      prospectName,
      agencyName,
      planTier,
    });
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/flywheel/webhook/payment-success - Stripe Checkout webhook handler
router.post('/webhook/payment-success', async (req, res) => {
  try {
    const { agencyName, adminEmail, planTier, stripeSessionId, amountUSD } = req.body;
    const result = await FlywheelEngine.handlePaymentSuccess({
      agencyName,
      adminEmail,
      planTier,
      stripeSessionId,
      amountUSD,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/flywheel/checkout/simulate - Instant turn-key checkout simulation
router.post('/checkout/simulate', async (req, res) => {
  try {
    const { agencyName, adminEmail, planTier } = req.body;
    const result = await FlywheelEngine.handlePaymentSuccess({
      agencyName: agencyName || 'Quantum Growth Ventures',
      adminEmail: adminEmail || 'founder@quantumgrowth.io',
      planTier: planTier || 'AI_COMPANY',
      stripeSessionId: `cs_sim_${Date.now()}`,
      amountUSD: planTier === 'TOOL_MODE' ? 49 : 249,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
