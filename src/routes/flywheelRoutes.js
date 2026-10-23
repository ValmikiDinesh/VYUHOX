import express from 'express';
import { FlywheelEngine } from '../services/flywheel/FlywheelEngine.js';

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
