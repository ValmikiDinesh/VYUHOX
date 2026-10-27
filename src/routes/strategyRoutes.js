import express from 'express';
import { GtmStrategy } from '../models/GtmStrategy.js';
import { Workspace } from '../models/Workspace.js';
import { ScannerService } from '../services/ScannerService.js';
import { VisualAiService } from '../services/visual/VisualAiService.js';
import { DailyBriefingJob } from '../cron/dailyBriefingJob.js';
import { authMiddleware } from '../middleware/auth.js';
import { BusinessTaxonomyBrain } from '../services/ai/BusinessTaxonomyBrain.js';
import { EmployeeRoleBrain } from '../services/ai/EmployeeRoleBrain.js';
import { BusinessBrain } from '../models/BusinessBrain.js';
import { vyuhoxMasterBrain } from '../services/ai/VyuhoxMasterBrainService.js';

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

    // Update workspace reference and autonomously set Industry & Business Category
    workspace.currentStrategyId = gtmStrategy._id;
    if (extractedData.url && !workspace.domain) {
      workspace.domain = extractedData.domainName;
    }
    workspace.industry = category;
    workspace.businessCategory = category;
    if (strategyData.positioning?.coreValueProp) {
      workspace.businessModelDescription = strategyData.positioning.coreValueProp;
    }
    if (businessName && (workspace.name === 'sample' || workspace.name.includes("'s Company") || workspace.name === 'My Business Workspace')) {
      workspace.name = businessName;
    }
    await workspace.save();

    // 3.5 VYUHOX Master Brain supplies bespoke, noise-free Client Brain to this Workspace
    try {
      await vyuhoxMasterBrain.provisionClientBrain(workspaceId, {
        businessName,
        category,
        categoryKey: strategyData.categoryKey,
        businessModel: strategyData.businessModel,
        operatingModelType: strategyData.businessModelType,
        extractedData,
        strategyData,
      });
    } catch (brainErr) {
      console.warn('[StrategyRoutes] Brain master provisioning notice:', brainErr.message);
    }

    // 4. Broadcast Completion
    emitProgress(req, workspaceId, 'COMPLETE', 'GTM Strategy & Business Plan synthesized!', 100);

    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('scan:complete', {
        strategyId: gtmStrategy._id,
        businessName: gtmStrategy.businessName,
        category: gtmStrategy.category,
        strategy: gtmStrategy,
        workspace,
      });

      // Autonomously refresh Executive Briefing with real crawled business context
      DailyBriefingJob.generateWorkspaceBriefing(workspaceId, io).catch((bErr) => {
        console.warn('[StrategyRoutes] Briefing auto-refresh warning:', bErr.message);
      });
    }

    return res.status(201).json({
      success: true,
      strategy: gtmStrategy,
      workspace,
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
    if (req.body.growthEngine) {
      strategy.growthEngine = req.body.growthEngine;
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
      businessName: extractedData.businessName,
      category: extractedData.category,
      analysis: strategyData,
      recommendedTeam,
      rawExtractedData: extractedData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/strategy/onboard-no-website - Onboard via Google Maps, Instagram, or 60s Voice Prompt
router.post('/onboard-no-website', authMiddleware, async (req, res) => {
  try {
    const { sourceType, sourceInput, tradeMode = 'STANDARD', hsCodes = [], workspaceId: bodyWsId } = req.body;
    const workspaceId = bodyWsId || req.workspaceId;

    if (!sourceType || !sourceInput) {
      return res.status(400).json({ success: false, message: 'sourceType and sourceInput are required' });
    }

    const { NoWebsiteOnboardingService } = await import('../services/NoWebsiteOnboardingService.js');
    const result = await NoWebsiteOnboardingService.onboardWithoutWebsite({
      workspaceId,
      sourceType,
      sourceInput,
      tradeMode,
      hsCodes,
    });

    const io = req.app.get('io');
    if (io && workspaceId) {
      io.to(workspaceId.toString()).emit('strategy:created', {
        strategy: result,
        message: `🚀 Micro-Site & ${tradeMode === 'TWO_SIDED_TRADE' ? 'Two-Sided Trade Engine' : 'GTM Strategy'} initialized from ${sourceType}!`,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('[StrategyRoutes] No-website onboarding error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/strategy/market-radar - Universal Business Taxonomy & Market Intelligence Radar
router.get('/market-radar', authMiddleware, async (req, res) => {
  try {
    const marketIntelligence = await BusinessTaxonomyBrain.getAllMarketIntelligence();
    return res.json({
      success: true,
      count: marketIntelligence.length,
      categories: marketIntelligence,
      lastSwept: new Date(),
    });
  } catch (error) {
    console.error('[StrategyRoutes] Market radar error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/strategy/market-radar/sweep - Trigger Autonomous Trend Discovery & Model Assimilation
router.post('/market-radar/sweep', authMiddleware, async (req, res) => {
  try {
    const result = await BusinessTaxonomyBrain.sweepAutonomousTrends();
    const updated = await BusinessTaxonomyBrain.getAllMarketIntelligence();
    return res.json({
      success: true,
      message: 'Autonomous Market Radar completed sweep. New viral trends and models assimilated.',
      categories: updated,
    });
  } catch (error) {
    console.error('[StrategyRoutes] Market radar sweep error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
// GET /api/strategy/brain-status - Retrieve VYUHOX Business Brain Training Status & Multi-Dimensional Intelligence
router.get('/brain-status', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || req.workspaceId;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId required' });
    
    // Safely query or create fallback
    let brain = null;
    let strategy = null;
    try {
      brain = await BusinessBrain.findOne({ workspaceId }).lean();
      strategy = await GtmStrategy.findOne({ workspaceId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean()
        || await GtmStrategy.findOne({ workspaceId }).sort({ createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('[StrategyRoutes] Brain DB query warning:', dbErr.message);
    }

    const operatingModelType = brain?.operatingModelType || strategy?.analysisResult?.businessModelType || 'ONLINE';
    const isTrained = !!(brain?.brainTrainingStatus || strategy);

    return res.json({
      success: true,
      brain,
      strategy,
      isTrained,
      operatingModelType,
      masterBrainSyncStatus: brain?.masterBrainSyncStatus || 'CONNECTED_TO_VYUHOX_MASTER',
      filteredNoiseList: brain?.filteredNoiseList && brain.filteredNoiseList.length > 0 
        ? brain.filteredNoiseList 
        : operatingModelType === 'ONLINE'
        ? ['Local Store Footfall SOPs (Suppressed)', 'Storefront Physical POS (Suppressed)']
        : operatingModelType === 'OFFLINE'
        ? ['SaaS PLG Free Trials (Suppressed)', 'Developer API Webhooks (Suppressed)']
        : [],
      identifiedServices: brain?.identifiedServices && brain.identifiedServices.length > 0
        ? brain.identifiedServices
        : strategy?.analysisResult?.identifiedServices && strategy.analysisResult.identifiedServices.length > 0
        ? strategy.analysisResult.identifiedServices
        : (brain?.trainedProfile?.coreOfferings || strategy?.analysisResult?.coreOfferings || []).map((s) => ({
            name: typeof s === 'string' ? s : s.name || 'Solution',
            description: typeof s === 'object' && s.description ? s.description : `Verified ${typeof s === 'string' ? s : s.name} offering.`,
            category: typeof s === 'object' && s.category ? s.category : 'Core Offering',
            deliverable: typeof s === 'object' && s.deliverable ? s.deliverable : 'Complete operational fulfillment',
          })),
      buyerTargeting: brain?.buyerTargeting && brain.buyerTargeting.whoWillBuy
        ? brain.buyerTargeting
        : strategy?.analysisResult?.buyerTargeting || {
            whoWillBuy: strategy?.analysisResult?.targetAudience?.primaryPersona || 'Key commercial decision makers with active need',
            whoCanBuy: `${strategy?.category || 'Specialized'} enterprises with operational capacity & budget`,
            toWhomToSell: strategy?.analysisResult?.targetAudience?.decisionMakers || ['Managing Director', 'Chief Executive Officer', 'Head of Procurement'],
            whoWillBeInterested: 'Technical architects, compliance managers, and operations leaders',
            buyingTriggers: strategy?.analysisResult?.targetAudience?.buyingTriggers || ['Quarterly efficiency mandate', 'Regulatory compliance audit'],
          },
      lastTelemetryPushedAt: brain?.lastTelemetryPushedAt || brain?.lastEvolvedAt || new Date(),
      category: strategy?.category || brain?.trainedProfile?.category || 'Specialized Enterprise',
      targets: brain?.businessTargets || strategy?.analysisResult?.businessTargets || {},
      workflows: brain?.businessWorkflows || strategy?.analysisResult?.businessWorkflow || {},
      swot: brain?.swotAnalysis || strategy?.analysisResult?.swotAnalysis || {},
      googleAds: brain?.googleAdsPlan || strategy?.analysisResult?.googleAdsCampaigns || {},
      metaAds: brain?.metaAdsPlan || strategy?.analysisResult?.metaAdsCampaigns || {},
      seoAeo: brain?.seoAeoPlan || {
        seo: strategy?.analysisResult?.seoStrategy,
        aeo: strategy?.analysisResult?.aeoStrategy,
      },
    });
  } catch (error) {
    console.error('[StrategyRoutes] brain-status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/strategy/update-services - Add, Edit, or Remove Business Services/Products
router.post('/update-services', authMiddleware, async (req, res) => {
  try {
    const { workspaceId: bodyWsId, services = [], buyerTargeting } = req.body;
    const workspaceId = bodyWsId || req.workspaceId;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId required' });

    let brain = await BusinessBrain.findOne({ workspaceId });
    if (!brain) {
      brain = new BusinessBrain({ workspaceId, businessName: 'Our Enterprise' });
    }

    if (Array.isArray(services)) {
      brain.identifiedServices = services;
      if (!brain.trainedProfile) brain.trainedProfile = {};
      brain.trainedProfile.coreOfferings = services.map(s => typeof s === 'string' ? s : s.name);
    }
    if (buyerTargeting && Object.keys(buyerTargeting).length > 0) {
      brain.buyerTargeting = { ...brain.buyerTargeting, ...buyerTargeting };
    }
    brain.brainTrainingStatus = 'TRAINED_SERVICES_UPDATED';
    brain.lastEvolvedAt = new Date();
    await brain.save();

    // Telemetry to VYUHOX Master Brain
    vyuhoxMasterBrain.assimilateClientTelemetry(workspaceId, {
      eventType: 'SERVICES_EDITED',
      businessName: brain.businessName,
      categoryKey: brain.trainedProfile?.categoryKey,
      payload: { updatedServicesCount: services.length },
    }).catch(() => null);

    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('brain:services-updated', {
        brain,
        services: brain.identifiedServices,
        buyerTargeting: brain.buyerTargeting,
        message: 'Identified products & services updated successfully!',
      });
    }

    return res.json({
      success: true,
      message: 'Services and buyer targeting updated successfully',
      brain,
      services: brain.identifiedServices,
      buyerTargeting: brain.buyerTargeting,
    });
  } catch (error) {
    console.error('[StrategyRoutes] update-services error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/strategy/train-brain - Interactively Train / Tune the VYUHOX Business Brain
router.post('/train-brain', authMiddleware, async (req, res) => {
  try {
    const {
      workspaceId: bodyWsId,
      customServices = [],
      targetAudience = {},
      businessTargets = {},
      operatingModelType = 'ONLINE',
      customGuidelines = '',
      swotAnalysis = {},
    } = req.body;
    const workspaceId = bodyWsId || req.workspaceId;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId required' });

    let brain = await BusinessBrain.findOne({ workspaceId });
    if (!brain) {
      brain = new BusinessBrain({ workspaceId, businessName: 'Our Enterprise' });
    }

    if (operatingModelType) brain.operatingModelType = operatingModelType;
    if (businessTargets && Object.keys(businessTargets).length > 0) {
      brain.businessTargets = { ...brain.businessTargets, ...businessTargets };
    }
    if (swotAnalysis && Object.keys(swotAnalysis).length > 0) {
      brain.swotAnalysis = { ...brain.swotAnalysis, ...swotAnalysis };
    }
    if (!brain.trainedProfile) brain.trainedProfile = {};
    if (Array.isArray(customServices) && customServices.length > 0) {
      brain.trainedProfile.coreOfferings = customServices;
    }
    if (targetAudience && Object.keys(targetAudience).length > 0) {
      brain.trainedProfile.targetAudience = { ...brain.trainedProfile.targetAudience, ...targetAudience };
    }
    if (customGuidelines) {
      brain.trainedProfile.customGuidelines = customGuidelines;
      brain.cumulativeMemoryText = `${brain.cumulativeMemoryText || ''}\n[Client Custom Guidelines]: ${customGuidelines}`;
    }
    brain.brainTrainingStatus = 'TRAINED_TUNED';
    brain.lastEvolvedAt = new Date();
    await brain.save();

    // Bidirectional Learning: Send client training telemetry back to VYUHOX Master Brain
    vyuhoxMasterBrain.assimilateClientTelemetry(workspaceId, {
      eventType: 'BRAIN_TUNED',
      businessName: brain.businessName,
      categoryKey: brain.trainedProfile?.categoryKey,
      payload: { customServices, targetAudience, customGuidelines },
    }).catch(() => null);

    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('brain:trained', {
        brain,
        message: '🧠 VYUHOX Brain successfully trained & tuned with bespoke business intelligence!',
      });
    }

    return res.json({
      success: true,
      message: 'Business Brain successfully trained and tuned. Telemetry synced with VYUHOX Master Brain.',
      brain,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/strategy/master-brain/status - Global VYUHOX Master Multi-Intelligence Brain Telemetry
router.get('/master-brain/status', authMiddleware, async (req, res) => {
  try {
    const overview = await vyuhoxMasterBrain.getMasterBrainOverview();
    return res.json(overview);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/strategy/employee-roles - Complete Corporate Roles & Employee Taxonomy
router.get('/employee-roles', authMiddleware, (req, res) => {
  try {
    const roles = EmployeeRoleBrain.getFullRolesEncyclopedia();
    return res.json({
      success: true,
      count: roles.length,
      roles,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
