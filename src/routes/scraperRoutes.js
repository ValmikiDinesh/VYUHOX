import express from 'express';
import { LeadScraperService, scraperJobs } from '../services/LeadScraperService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/scraper/start - Launch waterfall scraper job
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const {
      workspaceId: bodyWsId,
      searchType = 'directory',
      query = '',
      location = 'United States',
      targetPersona = '',
      limit = 6,
      companyTier = 'Enterprise',
    } = req.body;

    const workspaceId = bodyWsId || req.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace ID is required' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const io = req.app.get('io');

    // Kick off asynchronously so HTTP returns immediately
    LeadScraperService.executeWaterfallScrape({
      jobId,
      workspaceId,
      searchType,
      query,
      location,
      targetPersona,
      limit: parseInt(limit) || 6,
      companyTier,
      io,
    }).catch((err) => console.error(`[Scraper Job ${jobId} failed]:`, err.message));

    return res.status(202).json({
      success: true,
      jobId,
      message: 'Waterfall lead scraper initiated successfully',
      params: { searchType, query, location, targetPersona, limit },
    });
  } catch (error) {
    console.error('Scraper start error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/scraper/status/:jobId - Poll job status
router.get('/status/:jobId', authMiddleware, (req, res) => {
  const { jobId } = req.params;
  const job = scraperJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found or expired' });
  }

  return res.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      step: job.step,
      progress: job.progress,
      count: job.leads?.length || 0,
      leads: job.leads || [],
      error: job.error,
    },
  });
});

export default router;
