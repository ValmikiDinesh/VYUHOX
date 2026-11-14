import express from 'express';
import { LeadScraperService, scraperJobs } from '../services/LeadScraperService.js';
import { authMiddleware } from '../middleware/auth.js';
import { Wallet } from '../models/Wallet.js';
import { Workspace } from '../models/Workspace.js';
import { PlatformConfig } from '../models/PlatformConfig.js';

const router = express.Router();

// GET /api/scraper/pricing - Get current lead scraping rate and channel tiers
router.get('/pricing', authMiddleware, async (req, res) => {
  try {
    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();
    const rateUSD = config?.usageRates?.scrapingPerLeadUSD || 0.25;
    const rateINR = config?.usageRates?.scrapingPerLeadINR || 20.00;
    return res.json({
      success: true,
      rateUSD,
      rateINR,
      tiers: {
        ALL: {
          rateUSD: 0.25,
          rateINR: 20.00,
          label: 'Omnichannel Bundle (Email + Mobile + WhatsApp + Social)',
          shortName: 'Omnichannel Bundle',
          description: 'Full profile enrichment with verified corporate email, direct mobile, WhatsApp, and social profiles.',
        },
        PHONE_WHATSAPP: {
          rateUSD: 0.20,
          rateINR: 16.00,
          label: 'Direct Mobile & WhatsApp Only',
          shortName: 'Mobile & WhatsApp Only',
          description: 'Direct mobile lines & WhatsApp active numbers, ready for Maya AI voice calling & messaging.',
        },
        EMAIL_ONLY: {
          rateUSD: 0.10,
          rateINR: 8.50,
          label: 'Verified Corporate Email Only',
          shortName: 'Email Only',
          description: '100% Live DNS MX & SMTP-verified corporate emails, bounce-proof for cold outreach campaigns.',
        },
      },
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
      locations: bodyLocations = [],
      limit = 10,
      targetRole = 'BUYER',
      customKeywords = '',
      enrichmentScope = 'ALL',
    } = req.body;

    const workspaceId = bodyWsId || req.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace ID is required' });
    }

    // Parse multi-locations (array or semicolon/comma-delimited string)
    let parsedLocations = [];
    if (Array.isArray(bodyLocations) && bodyLocations.length > 0) {
      parsedLocations = bodyLocations.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof location === 'string' && location.trim()) {
      if (location.includes(';')) {
        parsedLocations = location.split(';').map((s) => s.trim()).filter(Boolean);
      } else if (location.includes('|')) {
        parsedLocations = location.split('|').map((s) => s.trim()).filter(Boolean);
      } else {
        parsedLocations = [location.trim()];
      }
    }

    if (parsedLocations.length === 0) {
      return res.status(400).json({ success: false, message: 'Please specify at least one target location (e.g. Austin, Texas or Mumbai, India)' });
    }

    const requestedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 10000);

    // Dynamic pricing based on user-selected enrichment scope
    const ENRICHMENT_TIER_RATES = {
      ALL: { usd: 0.25, inr: 20.00 },
      PHONE_WHATSAPP: { usd: 0.20, inr: 16.00 },
      EMAIL_ONLY: { usd: 0.10, inr: 8.50 },
    };
    const tierKey = ENRICHMENT_TIER_RATES[enrichmentScope] ? enrichmentScope : 'ALL';
    const ratePerLeadUSD = ENRICHMENT_TIER_RATES[tierKey].usd;
    const ratePerLeadINR = ENRICHMENT_TIER_RATES[tierKey].inr;

    // Fetch workspace to evaluate free monthly subscription quota
    const workspace = await Workspace.findById(workspaceId);
    const planTier = workspace?.subscription?.planTier || 'NONE';

    let defaultQuota = 0;
    if (planTier === 'AI_COMPANY_SCALE') defaultQuota = 5000;
    else if (planTier === 'AI_COMPANY_STARTER') defaultQuota = 1000;
    else if (planTier === 'TOOL_MODE' || planTier === 'STARTER') defaultQuota = 250;
    else if (planTier === 'GROWTH') defaultQuota = 1000;
    else if (planTier === 'SCALE') defaultQuota = 5000;
    else if (planTier === 'CUSTOM' || planTier === 'ENTERPRISE') defaultQuota = 25000;
    else if (planTier === 'NONE') defaultQuota = 0;

    const monthlyQuota = (typeof workspace?.leadUsage?.monthlyIncludedQuota === 'number' && workspace.leadUsage.monthlyIncludedQuota > 0)
      ? workspace.leadUsage.monthlyIncludedQuota
      : defaultQuota;
    const scrapedThisMonth = workspace?.leadUsage?.scrapedThisMonth || 0;
    const remainingFreeQuota = Math.max(0, monthlyQuota - scrapedThisMonth);

    // Calculate billable leads (only count over the plan quota)
    const billableLeadsRequested = Math.max(0, requestedLimit - remainingFreeQuota);

    let wallet = await Wallet.findOne({ workspaceId });
    if (!wallet) {
      wallet = await Wallet.create({
        workspaceId,
        balanceUSD: 0.0,
        transactions: [],
      });
    }

    // Enforce required wallet balance if the requested limit exceeds remaining free plan quota
    const requiredUSD = +(billableLeadsRequested * ratePerLeadUSD).toFixed(2);
    if (billableLeadsRequested > 0 && wallet.balanceUSD < requiredUSD) {
      const planName = planTier === 'NONE' ? 'Free Audit (No Plan)' : `${planTier} Plan`;
      return res.status(402).json({
        success: false,
        message: `${planName}: ${remainingFreeQuota} free lead allowance remaining. Scraping ${requestedLimit} leads requires $${requiredUSD.toFixed(2)} (₹${(billableLeadsRequested * ratePerLeadINR).toFixed(2)}) for ${billableLeadsRequested} billable leads. Your wallet balance is $${wallet.balanceUSD.toFixed(2)}. Please recharge your wallet.`,
      });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const io = req.app.get('io');
    const locationDisplay = parsedLocations.join('; ');

    // Kick off asynchronously with wallet deduction enforcement & AI intent auditor
    LeadScraperService.executeWaterfallScrape({
      jobId,
      workspaceId,
      location: locationDisplay,
      locations: parsedLocations,
      limit: requestedLimit,
      targetRole,
      customKeywords: customKeywords.trim(),
      enrichmentScope: tierKey,
      ratePerLeadUSD,
      ratePerLeadINR,
      io,
    }).catch((err) => console.error(`[Scraper Job ${jobId} failed]:`, err.message));

    return res.status(202).json({
      success: true,
      jobId,
      message: `Autonomous AI Multi-Source Lead Scraper launched across ${parsedLocations.length} target territory(ies)`,
      params: { location: locationDisplay, locations: parsedLocations, limit: requestedLimit, targetRole, customKeywords, enrichmentScope: tierKey, ratePerLeadUSD, ratePerLeadINR },
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
