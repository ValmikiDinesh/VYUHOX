/**
 * briefingRoutes.js
 * Endpoints for Autonomous Daily Executive Briefings & 1-Click Action Cards (Phase 5)
 */

import express from 'express';
import { AiBriefing } from '../models/AiBriefing.js';
import { DailyBriefingJob } from '../cron/dailyBriefingJob.js';

const router = express.Router();

/**
 * GET /api/briefings/latest/:workspaceId
 * Returns the most recent daily executive briefing for a client workspace
 */
router.get('/latest/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    let briefing = await AiBriefing.findOne({ workspaceId, briefingScope: 'CLIENT_WORKSPACE' })
      .sort({ generatedAt: -1, createdAt: -1 });

    if (!briefing) {
      const io = req.app.get('io');
      briefing = await DailyBriefingJob.generateWorkspaceBriefing(workspaceId, io);
    }

    return res.json({
      success: true,
      briefing,
    });
  } catch (error) {
    console.error('[BriefingRoutes] Fetch latest error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/briefings/generate
 * On-demand generation or refresh of morning briefing
 */
router.post('/generate', async (req, res) => {
  try {
    const { workspaceId, scope = 'CLIENT_WORKSPACE' } = req.body;
    const io = req.app.get('io');

    let briefing = null;
    if (scope === 'SUPERADMIN_GLOBAL') {
      briefing = await DailyBriefingJob.generateSuperAdminGlobalBriefing(io);
    } else {
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'workspaceId is required' });
      }
      briefing = await DailyBriefingJob.generateWorkspaceBriefing(workspaceId, io);
    }

    return res.json({
      success: true,
      message: 'Autonomous briefing synthesized successfully!',
      briefing,
    });
  } catch (error) {
    console.error('[BriefingRoutes] Generate error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/briefings/global
 * Fetches the Super Admin Global Platform Intelligence Feed
 */
router.get('/global', async (req, res) => {
  try {
    let globalBriefing = await AiBriefing.findOne({ briefingScope: 'SUPERADMIN_GLOBAL' })
      .sort({ generatedAt: -1, createdAt: -1 });

    if (!globalBriefing) {
      const io = req.app.get('io');
      globalBriefing = await DailyBriefingJob.generateSuperAdminGlobalBriefing(io);
    }

    return res.json({
      success: true,
      globalBriefing,
    });
  } catch (error) {
    console.error('[BriefingRoutes] Global fetch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/briefings/actions/execute
 * 1-Click Action Card Execution Handler
 */
router.post('/actions/execute', async (req, res) => {
  try {
    const { briefingId, actionId, workspaceId } = req.body;

    if (!briefingId || !actionId) {
      return res.status(400).json({ success: false, message: 'briefingId and actionId are required' });
    }

    const io = req.app.get('io');
    const result = await DailyBriefingJob.executeActionCard({
      briefingId,
      actionId,
      workspaceId,
      io,
    });

    return res.json(result);
  } catch (error) {
    console.error('[BriefingRoutes] Action execution error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const briefingRoutes = router;
export default briefingRoutes;
