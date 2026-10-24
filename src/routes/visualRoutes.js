import express from 'express';
import { VisualAiService } from '../services/visual/VisualAiService.js';
import { GtmStrategy } from '../models/GtmStrategy.js';
import { PlatformConfig } from '../models/PlatformConfig.js';

const router = express.Router();

/**
 * POST /api/visual/generate-image
 * Generate marketing visual / ad creative using Pollinations FLUX.1 (Free) or DALL-E 3
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, width = 1024, height = 1024, model = 'flux', seed } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Image prompt is required' });
    }

    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();
    const dalleApiKey = config?.dalleVisualAi?.apiKey || process.env.OPENAI_API_KEY;

    const result = await VisualAiService.generateImage({
      prompt,
      width: Number(width),
      height: Number(height),
      model,
      seed,
      apiKey: dalleApiKey,
    });

    return res.json(result);
  } catch (error) {
    console.error('[VisualRoutes] Image generation failed:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/visual/generate-deck
 * Generate an executive 6-slide Pitch Deck for GTM Strategy
 */
router.post('/generate-deck', async (req, res) => {
  try {
    const { strategyId, strategy: directStrategy } = req.body;
    let strategyData = directStrategy;

    if (!strategyData && strategyId) {
      strategyData = await GtmStrategy.findById(strategyId).lean();
    }

    const deck = VisualAiService.generatePitchDeck(strategyData);
    return res.json(deck);
  } catch (error) {
    console.error('[VisualRoutes] Deck generation failed:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/visual/download-pptx
 * Generates and downloads a real Microsoft PowerPoint (.pptx) presentation
 * from the crawled strategy, ICP, positioning, and 30-day roadmap.
 */
router.post('/download-pptx', async (req, res) => {
  try {
    const { strategyId, strategy: directStrategy } = req.body;
    let strategyData = directStrategy;

    if (!strategyData && strategyId) {
      strategyData = await GtmStrategy.findById(strategyId).lean();
    }

    const buffer = await VisualAiService.generatePptxBuffer(strategyData);
    const cleanName = (strategyData?.businessName || 'Business').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_GTM_Strategy_Pitch_Deck.pptx"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error('[VisualRoutes] PPTX generation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/visual/download-pptx
 * Supports direct download links with ?strategyId=...
 */
router.get('/download-pptx', async (req, res) => {
  try {
    const { strategyId } = req.query;
    let strategyData = null;

    if (strategyId) {
      strategyData = await GtmStrategy.findById(strategyId).lean();
    }

    const buffer = await VisualAiService.generatePptxBuffer(strategyData);
    const cleanName = (strategyData?.businessName || 'Business').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_GTM_Strategy_Pitch_Deck.pptx"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error('[VisualRoutes] PPTX download error:', error);
    return res.status(500).send('Failed to generate presentation');
  }
});

/**
 * POST /api/visual/funnel-flow
 * Generate interactive GTM funnel flowchart
 */
router.post('/funnel-flow', async (req, res) => {
  try {
    const { strategyId, strategy: directStrategy } = req.body;
    let strategyData = directStrategy;

    if (!strategyData && strategyId) {
      strategyData = await GtmStrategy.findById(strategyId).lean();
    }

    const flow = VisualAiService.generateFunnelFlow(strategyData);
    return res.json({ success: true, flow });
  } catch (error) {
    console.error('[VisualRoutes] Funnel flow generation failed:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/visual/tools-status
 * Check configuration and operational status of all visual representation tools
 */
router.get('/tools-status', async (req, res) => {
  try {
    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();

    const tools = [
      {
        id: 'pptx_engine',
        name: 'Autonomous PowerPoint (.PPTX) Presentation Engine',
        category: 'GTM Pitch Deck & PPT Builder',
        status: 'ACTIVE',
        cost: 'Included / Autonomous Compiler',
        capabilities: [
          'Direct .PPTX File Download',
          '6-Slide Executive Strategy Blueprint',
          'Full-Screen In-Dashboard Presenter',
          'Automated ICP, Channels & Team Mapping',
        ],
      },
      {
        id: 'pollinations_flux',
        name: 'Pollinations AI (FLUX.1 Visual Engine)',
        category: 'Ad Creatives, Visual Assets & Strategy Covers',
        status: config?.pollinationsVisualAi?.isActive !== false ? 'ACTIVE' : 'DISABLED',
        cost: '100% Free / Unlimited',
        capabilities: [
          'Ad Creatives (1:1, 16:9, 9:16)',
          'High-Resolution 8K Rendering',
          'Commercial Visuals for Marketing',
          'Automated Strategy Visual Covers',
        ],
        model: config?.pollinationsVisualAi?.defaultModel || 'flux',
      },
      {
        id: 'short_video_engine',
        name: 'Vertical Short Video Compositor',
        category: 'Reels, Shorts & Video Ads',
        status: config?.shortVideoEngine?.isActive !== false ? 'ACTIVE' : 'DISABLED',
        cost: 'Included / Canvas Engine',
        capabilities: ['1080x1920 9:16 Video Ads', 'Kinetic Captions', 'B-Roll Presets'],
      },
      {
        id: 'google_flow_slides',
        name: 'Google Flow / Workspace Document Integration',
        category: 'Cloud Document & Slide Sync',
        status: config?.googleFlowWorkspace?.apiKey ? 'CONFIGURED' : 'READY',
        cost: 'Free Tier Google Workspace',
        capabilities: ['Cloud Presentation Sync', 'Executive PDF Handouts'],
        apiKeyConfigured: Boolean(config?.googleFlowWorkspace?.apiKey),
      },
    ];

    return res.json({ success: true, tools });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
