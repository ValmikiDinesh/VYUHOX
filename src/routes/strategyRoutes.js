import express from 'express';
import { GtmStrategy } from '../models/GtmStrategy.js';
import { Workspace } from '../models/Workspace.js';
import { ScannerService } from '../services/ScannerService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper to broadcast socket events to workspace room
const emitProgress = (req, workspaceId, step, message, progressPercent) => {
  const io = req.app.get('io');
  if (io && workspaceId) {
    io.to(workspaceId.toString()).emit('scan:progress', {
      step,
      message,
      progressPercent,
      timestamp: new Date().toISOString(),
    });
  }
};

// POST /api/strategy/scan - Scan website & generate AI GTM Strategy
router.post('/scan', authMiddleware, async (req, res) => {
  try {
    const { url, workspaceId: bodyWsId } = req.body;
    const workspaceId = bodyWsId || req.workspaceId;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Website URL is required' });
    }

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Progress 1: Initiating Crawl
    emitProgress(req, workspaceId, 'CRAWL_INIT', `Connecting to ${url}...`, 15);

    // Run Scanner Service
    const extractedData = await ScannerService.scanWebsite(url);

    // Progress 2: Metadata Extracted
    emitProgress(
      req,
      workspaceId,
      'METADATA_PARSED',
      `Parsed DOM, extracted ${extractedData.h1List.length + extractedData.h2List.length} headings & value propositions`,
      45
    );

    // Progress 3: Synthesizing GTM Personas & Value Props
    emitProgress(
      req,
      workspaceId,
      'AI_SYNTHESIS',
      `Synthesizing buyer personas, acquisition switchboard & ad hooks...`,
      75
    );

    const strategyData = await ScannerService.synthesizeStrategy(extractedData, {
      workspaceName: workspace.name,
      industry: workspace.industry,
    });

    // Save to Database
    const gtmStrategy = await GtmStrategy.create({
      workspaceId,
      targetUrl: extractedData.url,
      businessName: strategyData.businessName || workspace.name,
      category: strategyData.category,
      rawExtractedData: extractedData,
      analysisResult: strategyData,
      status: 'ACTIVE',
    });

    // Update workspace reference
    workspace.currentStrategyId = gtmStrategy._id;
    if (extractedData.url && !workspace.domain) {
      workspace.domain = extractedData.domainName;
    }
    await workspace.save();

    // Progress 4: Completed
    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('scan:complete', {
        strategyId: gtmStrategy._id,
        businessName: gtmStrategy.businessName,
        category: gtmStrategy.category,
      });
    }

    return res.status(201).json({
      success: true,
      strategy: gtmStrategy,
      message: 'GTM Strategy generated successfully',
    });
  } catch (error) {
    console.error('[Strategy Scan Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/strategy/:workspaceId - Retrieve active GTM strategy
router.get('/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    let strategy = await GtmStrategy.findOne({ workspaceId, status: 'ACTIVE' }).sort({ createdAt: -1 });

    if (!strategy) {
      // Auto-generate initial strategy for workspace if none exists
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        const targetDomain = workspace.domain || `${workspace.slug}.com`;
        const extracted = ScannerService.generateFallbackExtraction(`https://${targetDomain}`, targetDomain);
        const synthesized = ScannerService.generateHeuristicStrategy(extracted, {
          workspaceName: workspace.name,
          industry: workspace.industry,
        });

        strategy = await GtmStrategy.create({
          workspaceId,
          targetUrl: extracted.url,
          businessName: workspace.name,
          category: synthesized.category,
          rawExtractedData: extracted,
          analysisResult: synthesized,
          status: 'ACTIVE',
        });

        workspace.currentStrategyId = strategy._id;
        await workspace.save();
      }
    }

    return res.json({ success: true, strategy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/strategy/:strategyId/channels - Toggle acquisition channels
router.put('/:strategyId/channels', authMiddleware, async (req, res) => {
  try {
    const { strategyId } = req.params;
    const { channelName, enabled } = req.body;

    const strategy = await GtmStrategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, message: 'Strategy not found' });
    }

    if (strategy.analysisResult?.recommendedChannels) {
      strategy.analysisResult.recommendedChannels = strategy.analysisResult.recommendedChannels.map((ch) => {
        if (ch.channel === channelName) {
          return { ...ch, enabled: Boolean(enabled) };
        }
        return ch;
      });
      strategy.markModified('analysisResult');
      await strategy.save();
    }

    return res.json({
      success: true,
      recommendedChannels: strategy.analysisResult.recommendedChannels,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/strategy/scan-public - Instant live web scan without auth for landing page demo
router.post('/scan-public', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Website URL is required' });
    }

    const extractedData = await ScannerService.scanWebsite(url);
    const strategyData = await ScannerService.synthesizeStrategy(extractedData, {
      workspaceName: extractedData.domainName || 'Discovered Enterprise',
      industry: 'B2B',
    });

    const recommendedTeam = [
      { role: 'CMO', name: 'Sophia Sterling', monthlyFee: 49, purpose: 'Scrapes targeted agency/B2B directories and runs automated ad creative iteration.' },
      { role: 'SDR', name: 'Marcus Cole', monthlyFee: 39, purpose: 'Dispatches personalized multi-channel cold emails and WhatsApp introductions.' },
      { role: 'VOICE_CLOSER', name: 'Maya Vance', monthlyFee: 49, purpose: 'Dials inbound leads in under 30 seconds with sub-800ms Bland.ai voice bridge.' },
      { role: 'CFO', name: 'Julian Vance', monthlyFee: 39, purpose: 'Tracks CAC/LTV, prevents ad burn, and manages Stripe Connect re-billing margins.' },
    ];

    return res.json({
      success: true,
      url: extractedData.url,
      domainName: extractedData.domainName,
      extractedData,
      strategy: strategyData,
      recommendedTeam,
      projectedRoiMultiple: '7.8x',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
