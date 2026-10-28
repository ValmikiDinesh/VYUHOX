import express from 'express';
import { SanjayaVoiceCommander } from '../services/ai/SanjayaVoiceCommander.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/sanjaya/command
 * Spoken Voice Command Endpoint (Jarvis for Marketing)
 */
router.post('/command', authMiddleware, async (req, res) => {
  try {
    const { commandText, workspaceId: bodyWsId } = req.body;
    const workspaceId = bodyWsId || req.workspaceId;
    const userName = req.user?.name || 'Commander';
    const io = req.app.get('io');

    if (!commandText || !commandText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No voice command text provided.',
      });
    }

    const result = await SanjayaVoiceCommander.processCommand({
      commandText: commandText.trim(),
      workspaceId,
      userName,
      io,
    });

    // Broadcast to workspace room so all screens update in real-time
    if (io && workspaceId) {
      io.to(workspaceId.toString()).emit('sanjaya:executed', result);
    }

    return res.json(result);
  } catch (error) {
    console.error('[Sanjaya Route Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sanjaya encountered an execution obstacle.',
    });
  }
});

/**
 * GET /api/sanjaya/suggestions
 * Returns tailored voice commands based on current business context
 */
router.get('/suggestions', authMiddleware, async (req, res) => {
  const suggestions = [
    { label: 'Find 50 dental clinics in Texas', category: 'SCRAPE' },
    { label: 'Have Maya call our highest intent lead', category: 'CALL' },
    { label: 'Show my revenue and pipeline stats', category: 'METRICS' },
    { label: 'Dispatch WhatsApp outreach sequence', category: 'OUTREACH' },
    { label: 'Give me Alexander Rivers CEO briefing', category: 'BRIEFING' },
    { label: 'Switch to Autonomous AI Company mode', category: 'MODE' },
    { label: 'Open Google & Meta Ads Manager', category: 'NAVIGATE' },
    { label: 'Top up compute wallet with ₹2500', category: 'WALLET' },
  ];

  return res.json({
    success: true,
    agentName: 'SANJAYA (सञ्जय)',
    title: 'Autonomous Voice Commander & Strategist',
    origin: 'Indian Puranas • Divya-Drishti Celestial Vision',
    suggestions,
  });
});

export default router;
