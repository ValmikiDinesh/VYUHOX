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
      targetRole = 'BUYER',
      customKeywords = '',
    } = req.body;

    const workspaceId = bodyWsId || req.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace ID is required' });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Please specify a target location (e.g. Austin, Texas or Mumbai, India)' });
    }

    const requestedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 10000);

    // Fetch platform pricing rate per single lead
    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();
    const ratePerLeadUSD = config?.usageRates?.scrapingPerLeadUSD || 0.15;
    const ratePerLeadINR = config?.usageRates?.scrapingPerLeadINR || 12.50;

    // Fetch workspace to evaluate free monthly subscription quota
    const workspace = await Workspace.findById(workspaceId);
    const planTier = workspace?.subscription?.planTier || (workspace?.operatingMode === 'AI_COMPANY' ? 'AI_COMPANY_SCALE' : 'TOOL_MODE');

    let defaultQuota = 250;
    if (planTier === 'AI_COMPANY_SCALE' || workspace?.operatingMode === 'AI_COMPANY') defaultQuota = 5000;
    else if (planTier === 'AI_COMPANY_STARTER') defaultQuota = 1000;
    else if (planTier === 'CUSTOM' || planTier === 'ENTERPRISE') defaultQuota = 25000;

    const monthlyQuota = workspace?.leadUsage?.monthlyIncludedQuota || defaultQuota;
    const scrapedThisMonth = workspace?.leadUsage?.scrapedThisMonth || 0;
    const remainingFreeQuota = Math.max(0, monthlyQuota - scrapedThisMonth);

    // Calculate billable leads (only count over the plan quota)
    const billableLeadsRequested = Math.max(0, requestedLimit - remainingFreeQuota);

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

    // Only enforce wallet balance if the requested limit exceeds remaining free plan quota
    if (billableLeadsRequested > 0 && wallet.balanceUSD < ratePerLeadUSD) {
      return res.status(402).json({
        success: false,
        message: `Monthly plan quota reached (${scrapedThisMonth}/${monthlyQuota} leads used). Additional leads cost $${ratePerLeadUSD.toFixed(2)} (₹${ratePerLeadINR.toFixed(2)}) each. Please top up your compute credit wallet to continue.`,
      });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const io = req.app.get('io');

    // Kick off asynchronously with wallet deduction enforcement & AI intent auditor
    LeadScraperService.executeWaterfallScrape({
      jobId,
      workspaceId,
      location: location.trim(),
      limit: requestedLimit,
      targetRole,
      customKeywords: customKeywords.trim(),
      ratePerLeadUSD,
      ratePerLeadINR,
      io,
    }).catch((err) => console.error(`[Scraper Job ${jobId} failed]:`, err.message));

    return res.status(202).json({
      success: true,
      jobId,
      message: 'Autonomous AI Multi-Source Lead Scraper launched with AI Intent Auditor',
      params: { location: location.trim(), limit: requestedLimit, targetRole, customKeywords, ratePerLeadUSD, ratePerLeadINR },
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
