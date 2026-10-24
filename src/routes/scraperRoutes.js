import express from 'express';
import { LeadScraperService, scraperJobs } from '../services/LeadScraperService.js';
import { authMiddleware } from '../middleware/auth.js';
import { Wallet } from '../models/Wallet.js';
import { PlatformConfig } from '../models/PlatformConfig.js';

const router = express.Router();

// GET /api/scraper/pricing - Get current lead scraping rate
router.get('/pricing', authMiddleware, async (req, res) => {
  try {
    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();
    const rateUSD = config?.usageRates?.scrapingPerLeadUSD || 0.15;
    const rateINR = config?.usageRates?.scrapingPerLeadINR || 12.50;
    return res.json({
      success: true,
      rateUSD,
      rateINR,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/scraper/start - Launch AI multi-source lead scraper job with wallet deduction
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const {
      workspaceId: bodyWsId,
      location = '',
      limit = 10,
    } = req.body;

    const workspaceId = bodyWsId || req.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace ID is required' });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Please specify a target location (e.g. Austin, Texas or Mumbai, India)' });
    }

    const requestedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    // Fetch platform pricing rate per single lead
    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();
    const ratePerLeadUSD = config?.usageRates?.scrapingPerLeadUSD || 0.15;
    const ratePerLeadINR = config?.usageRates?.scrapingPerLeadINR || 12.50;

    // Verify wallet has balance for at least 1 lead
    let wallet = await Wallet.findOne({ workspaceId });
    if (!wallet) {
      wallet = await Wallet.create({
        workspaceId,
        balanceUSD: 50.0,
        transactions: [
          {
            type: 'BONUS',
            amountUSD: 50.0,
            description: 'Complimentary Starter Credit',
            referenceId: `START_${Date.now()}`,
          },
        ],
      });
    }

    if (wallet.balanceUSD < ratePerLeadUSD) {
      return res.status(402).json({
        success: false,
        message: `Insufficient wallet balance ($${wallet.balanceUSD.toFixed(2)}). Each genuine lead costs $${ratePerLeadUSD.toFixed(2)} (₹${ratePerLeadINR.toFixed(2)}). Please add funds to proceed.`,
      });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const io = req.app.get('io');

    // Kick off asynchronously with wallet deduction enforcement
    LeadScraperService.executeWaterfallScrape({
      jobId,
      workspaceId,
      location: location.trim(),
      limit: requestedLimit,
      ratePerLeadUSD,
      ratePerLeadINR,
      io,
    }).catch((err) => console.error(`[Scraper Job ${jobId} failed]:`, err.message));

    return res.status(202).json({
      success: true,
      jobId,
      message: 'Autonomous AI Multi-Source Lead Scraper launched',
      params: { location: location.trim(), limit: requestedLimit, ratePerLeadUSD, ratePerLeadINR },
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
