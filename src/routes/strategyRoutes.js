import express from 'express';
import { GtmStrategy } from '../models/GtmStrategy.js';
import { Workspace } from '../models/Workspace.js';
import { ScannerService } from '../services/ScannerService.js';
import { VisualAiService } from '../services/visual/VisualAiService.js';
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

// POST /api/strategy/scan - Deep Crawl Website & Generate Complete GTM Intelligence
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

    // 1. Deep Multi-Page Crawl
    emitProgress(req, workspaceId, 'CRAWL_INIT', `Initiating deep end-to-end crawl for ${url}...`, 10);

    const extractedData = await ScannerService.scanWebsite(url, (percent, msg) => {
      emitProgress(req, workspaceId, 'CRAWLING', msg, percent);
    });

    // 2. Synthesizing Bespoke Strategy & Business Plan
    emitProgress(
      req,
      workspaceId,
      'AI_SYNTHESIS',
      `Synthesizing executive business plan, tailored ICP, AI agent team & 30-day launch roadmap...`,
      80
    );

    const strategyData = await ScannerService.synthesizeStrategy(extractedData, {
      workspaceName: workspace.name,
      industry: workspace.industry,
    });

    // 2.5 Generate visual cover image and executive presentation deck
    const businessName = strategyData.businessName || workspace.name;
    const category = strategyData.category || 'B2B Enterprise SaaS';
    const visualCoverUrl = VisualAiService.generateBusinessCoverImage(businessName, category, strategyData.positioning?.coreValueProp);
    strategyData.visualCoverUrl = visualCoverUrl;

    const presentationDeck = VisualAiService.generatePitchDeck({
      businessName,
      category,
      targetUrl: extractedData.url,
      analysisResult: strategyData,
      businessPlanDocument: strategyData.businessPlanDocument,
      stepByStepRoadmap: strategyData.stepByStepRoadmap,
    });

    // 3. Save to Database with full document and presentation deck
    const gtmStrategy = await GtmStrategy.create({
      workspaceId,
      targetUrl: extractedData.url,
      businessName,
      category,
      rawExtractedData: extractedData,
      analysisResult: strategyData,
      businessPlanDocument: strategyData.businessPlanDocument,
      presentationDeck,
      visualCoverUrl,
      stepByStepRoadmap: strategyData.stepByStepRoadmap,
      clientNotes: '',
      status: 'ACTIVE',
    });

    // Update workspace reference
    workspace.currentStrategyId = gtmStrategy._id;
    if (extractedData.url && !workspace.domain) {
      workspace.domain = extractedData.domainName;
    }
    await workspace.save();

    // 4. Broadcast Completion
    emitProgress(req, workspaceId, 'COMPLETE', 'GTM Strategy & Business Plan synthesized!', 100);

    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('scan:complete', {
        strategyId: gtmStrategy._id,
        businessName: gtmStrategy.businessName,
        category: gtmStrategy.category,
        strategy: gtmStrategy,
      });
    }

    return res.status(201).json({
      success: true,
      strategy: gtmStrategy,
      message: 'GTM Strategy & Business Plan Document created successfully',
    });
  } catch (error) {
    console.error('[Strategy Scan Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/strategy/:workspaceId - Retrieve active GTM strategy & business plan document
router.get('/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    let strategy = await GtmStrategy.findOne({ workspaceId, status: 'ACTIVE' }).sort({ createdAt: -1 });

    if (!strategy) {
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        const targetDomain = workspace.domain || `${workspace.slug || 'company'}.com`;
        const extracted = ScannerService.generateResilientDomainIntelligence(`https://${targetDomain}`, targetDomain);
        const synthesized = await ScannerService.synthesizeStrategy(extracted, {
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
          businessPlanDocument: synthesized.businessPlanDocument,
          stepByStepRoadmap: synthesized.stepByStepRoadmap,
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

// PUT /api/strategy/:strategyId - Edit and update Strategy, Business Plan, ICP, or Notes
router.put('/:strategyId', authMiddleware, async (req, res) => {
  try {
    const { strategyId } = req.params;
    const {
      businessName,
      category,
      analysisResult,
      businessPlanDocument,
      stepByStepRoadmap,
      clientNotes,
    } = req.body;

    const strategy = await GtmStrategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, message: 'Strategy not found' });
    }

    if (businessName) strategy.businessName = businessName;
    if (category) strategy.category = category;
    if (analysisResult) {
      strategy.analysisResult = { ...strategy.analysisResult, ...analysisResult };
      strategy.markModified('analysisResult');
    }
    if (businessPlanDocument) {
      strategy.businessPlanDocument = { ...strategy.businessPlanDocument, ...businessPlanDocument };
      strategy.markModified('businessPlanDocument');
    }
    if (stepByStepRoadmap) {
      strategy.stepByStepRoadmap = stepByStepRoadmap;
      strategy.markModified('stepByStepRoadmap');
    }
    if (clientNotes !== undefined) {
      strategy.clientNotes = clientNotes;
    }

    await strategy.save();

    // Broadcast update to workspace
    const io = req.app.get('io');
    if (io && strategy.workspaceId) {
      io.to(strategy.workspaceId.toString()).emit('strategy:updated', {
        strategyId: strategy._id,
        businessName: strategy.businessName,
      });
    }

    return res.json({
      success: true,
      strategy,
      message: 'Business Plan & GTM Strategy saved successfully',
    });
  } catch (error) {
    console.error('[Strategy Update Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/strategy/:strategyId/step - Update status of a launch roadmap phase
router.patch('/:strategyId/step', authMiddleware, async (req, res) => {
  try {
    const { strategyId } = req.params;
    const { phaseIndex, status } = req.body;

    const strategy = await GtmStrategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, message: 'Strategy not found' });
    }

    if (strategy.stepByStepRoadmap && strategy.stepByStepRoadmap[phaseIndex]) {
      strategy.stepByStepRoadmap[phaseIndex].status = status || 'COMPLETED';
      strategy.markModified('stepByStepRoadmap');

      // Sync into businessPlanDocument if present
      if (strategy.businessPlanDocument?.stepByStepLaunchRoadmap?.[phaseIndex]) {
        strategy.businessPlanDocument.stepByStepLaunchRoadmap[phaseIndex].status = status || 'COMPLETED';
        strategy.markModified('businessPlanDocument');
      }

      await strategy.save();
    }

    return res.json({
      success: true,
      stepByStepRoadmap: strategy.stepByStepRoadmap,
    });
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

      if (strategy.businessPlanDocument?.acquisitionStrategy?.channels) {
        strategy.businessPlanDocument.acquisitionStrategy.channels = strategy.analysisResult.recommendedChannels;
        strategy.markModified('businessPlanDocument');
      }

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

// POST /api/strategy/scan-public - Instant live deep scan for public landing page
router.post('/scan-public', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Website URL is required' });
    }

    const extractedData = await ScannerService.scanWebsite(url);
    const strategyData = await ScannerService.synthesizeStrategy(extractedData, {
      workspaceName: extractedData.businessName || 'Discovered Enterprise',
      industry: 'B2B',
    });

    const recommendedTeam = [
      { role: 'CMO', name: 'Sophia Sterling', monthlyFee: 49, purpose: 'Iterates high-performing Meta/Google hooks and optimizes ROAS 24/7.' },
      { role: 'SDR', name: 'Sarah Cole', monthlyFee: 39, purpose: 'Dispatches personalized multi-channel cold emails and WhatsApp introductions.' },
      { role: 'VOICE_CLOSER', name: 'Maya Vance', monthlyFee: 49, purpose: 'Dials inbound leads in under 45 seconds with sub-800ms speech synthesis.' },
      { role: 'CFO', name: 'Julian Vance', monthlyFee: 39, purpose: 'Tracks CAC/LTV unit economics and prevents budget leakage.' },
    ];

    return res.json({
      success: true,
      url: extractedData.url,
      domainName: extractedData.domainName,
      extractedData,
      strategy: strategyData,
      businessPlanDocument: strategyData.businessPlanDocument,
      stepByStepRoadmap: strategyData.stepByStepRoadmap,
      recommendedTeam,
      projectedRoiMultiple: '7.8x',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
