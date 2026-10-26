import pptxgen from 'pptxgenjs';
import { MultiProviderVisualGateway } from './MultiProviderVisualGateway.js';

/**
 * VisualAiService.js
 * Visual Representation & Autonomous Presentation Engine for VYUHOX:
 * - Free / Best AI Image Generation (Rotating Multi-Engine Gateway: Banana, Google Flow, Flux, DALL-E)
 * - Microsoft PowerPoint (.pptx) Generator from Crawled Business Strategy Data
 * - Executive In-Dashboard Slide Presentation Viewer
 * - Interactive GTM Funnel Flowchart synthesis
 */

export class VisualAiService {
  /**
   * Generate high-quality marketing visual / ad creative image
   * Uses MultiProviderVisualGateway with rotating providers and zero-failure fallbacks
   */
  static async generateImage({
    prompt,
    width = 1024,
    height = 1024,
    model = 'flux',
    seed = null,
    apiKey = null,
    preferredProvider = null,
    platform = 'DESKTOP_BANNER',
    headline = '',
    subtext = '',
    brandName = 'VYUHOX',
  }) {
    const providerMap = {
      banana: 'NANO_BANANA_GPU',
      'google-flow': 'GOOGLE_FLOW_IMAGEN',
      'google-imagen': 'GOOGLE_FLOW_IMAGEN',
      flux: 'POLLINATIONS_FLUX',
      'flux-pro': 'HUGGINGFACE_FLUX',
      fal: 'REPLICATE_FAL_FLUX',
      'dall-e-3': 'OPENAI_DALLE_3',
    };

    const mappedProvider = preferredProvider || providerMap[model] || null;

    const result = await MultiProviderVisualGateway.generateImage({
      prompt,
      width,
      height,
      preferredProvider: mappedProvider,
      style: 'cinematic',
      platform,
      headline,
      subtext,
      brandName,
      apiKey,
    });

    return {
      success: true,
      imageUrl: result.imageUrl,
      provider: result.provider,
      providerName: result.providerName,
      prompt,
      dimensions: { width: result.width || width, height: result.height || height },
      rotationLogs: result.rotationLogs || [],
    };
  }

  /**
   * Generates a tailored business visual representation image for the strategy cover
   */
  static generateBusinessCoverImage(businessName, category, valueProp = '') {
    const prompt = `Futuristic enterprise software interface, modern digital dashboard, abstract geometric cyber elements, theme representing ${category} and ${businessName}, ${valueProp}, sleek dark obsidian UI with neon cyan and violet luminescence, 8k, professional executive presentation banner`;
    const encoded = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&model=flux&nologo=true&seed=42`;
  }

  /**
   * Generate an executive 6-slide GTM Pitch Deck for business presentation
   */
  static generatePitchDeck(strategy = {}) {
    const a = strategy?.analysisResult || {};
    const d = strategy?.businessPlanDocument || {};
    const name = strategy?.businessName || a.businessName || 'Your Business';
    const category = strategy?.category || a.category || 'B2B Enterprise SaaS';
    const visualCover = a.visualCoverUrl || this.generateBusinessCoverImage(name, category, a.positioning?.coreValueProp || '');

    const slides = [
      {
        slideNumber: 1,
        title: 'Executive Vision & Market Mandate',
        subtitle: `${name} • Autonomous GTM Strategy 2026`,
        tagline: a.positioning?.coreValueProp || a.summary || 'Transforming Industry Performance Through Autonomous Scale',
        badge: category,
        coverImage: visualCover,
        points: [
          `Target Domain: ${strategy?.targetUrl || 'Verified Enterprise Platform'}`,
          `Classification: ${category}`,
          `Strategic Mandate: Deploy 24/7 multi-agent autonomous outreach and accelerate pipeline velocity`,
        ],
        type: 'HERO',
      },
      {
        slideNumber: 2,
        title: 'Target Audience & Ideal Customer Profile (ICP)',
        subtitle: 'Precision Buying Committee Matrix',
        badge: 'Audience Matrix',
        primaryPersona: a.targetAudience?.primaryPersona || 'Executive Decision Makers & Department Heads',
        decisionMakers: (a.targetAudience?.decisionMakers || ['CEO', 'VP of Operations', 'Director of Growth']).join(', '),
        budgetTier: a.targetAudience?.estimatedBudgetTier || '$5,000 – $25,000 / month',
        estimatedACV: a.targetAudience?.estimatedACV || '$25,000 – $75,000',
        points: (a.targetAudience?.painPoints || [
          'High customer acquisition costs eroding operating margins',
          'Manual outbound prospecting consuming expensive rep bandwidth',
          'Fragmented communication channels resulting in lead drop-offs',
        ]).map((p) => `Pain Point: ${p}`),
        type: 'ICP',
      },
      {
        slideNumber: 3,
        title: 'Strategic Edge & Unfair Advantage',
        subtitle: 'Defensible Market Differentiation',
        badge: 'Positioning',
        coreValueProp: a.positioning?.coreValueProp || 'Accelerated pipeline velocity through automated multi-channel touchpoints',
        unfairAdvantage: a.positioning?.unfairAdvantage || 'Proprietary automated speed-to-lead and turnkey multi-channel execution',
        points: (a.positioning?.keyDifferentiators || [
          'Sub-second voice AI qualification with instant human live takeover',
          'Waterfall lead enrichment across directories and verified registries',
          'Dynamic autonomous ad budget optimization halting budget waste',
        ]).map((d) => `Differentiator: ${d}`),
        type: 'POSITIONING',
      },
      {
        slideNumber: 4,
        title: 'Omnichannel Acquisition Switchboard',
        subtitle: 'High-Converting Outreach Angles & Routing',
        badge: 'Channel Strategy',
        channels: (a.recommendedChannels || []).slice(0, 4),
        adAngles: (a.adAngles || []).slice(0, 3).map((ad) => `"${ad.hook}" (${ad.angle})`),
        type: 'CHANNELS',
      },
      {
        slideNumber: 5,
        title: 'Dedicated Multi-Agent AI C-Suite Team',
        subtitle: '24/7 Autonomous Workforce Deployment',
        badge: 'Autonomous Team',
        roiTarget: a.recommendedAITeam?.estimatedMonthlyROI || '6.4x Pipeline ROI',
        plan: a.recommendedAITeam?.recommendedPlan || 'AI Company Mode',
        roles: a.recommendedAITeam?.roles || [
          'AI SDR Sarah: Multi-Channel Email & WhatsApp Intro Sequences',
          'AI Voice Closer Maya: Sub-45s Inbound & Outbound Calling',
          'AI CMO Sophia: 24/7 Social Ads Creative Testing & ROAS Scale',
          'AI CFO Julian: Unit Economics Guard & CAC/LTV Margins',
        ],
        type: 'AI_TEAM',
      },
      {
        slideNumber: 6,
        title: '30-Day Step-by-Step Launch Blueprint',
        subtitle: 'From Day 1 Warmup to Compounded Closed Revenue',
        badge: 'Launch Roadmap',
        phases: [
          'Phase 1 (Days 1–3): Domain SPF/DKIM Warmup & Voice Studio Setup',
          'Phase 2 (Days 4–8): Waterfall Lead Prospecting & MX Validation',
          'Phase 3 (Days 9–18): Sarah SDR Omnichannel Email/WhatsApp Outbound',
          'Phase 4 (Days 19–25): Maya Voice AE Speed-to-Lead Live Dialing',
          'Phase 5 (Days 26–30): Flywheel Ad Scale & Closed Revenue Multiples',
        ],
        type: 'ROADMAP',
      },
    ];

    return {
      success: true,
      businessName: name,
      category,
      totalSlides: slides.length,
      slides,
      visualCoverUrl: visualCover,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates an actual Microsoft PowerPoint (.pptx) file buffer
   * using pptxgenjs, pre-populated with all crawled strategy & business plan intelligence.
   */
  static async generatePptxBuffer(strategy = {}) {
    const a = strategy?.analysisResult || {};
    const d = strategy?.businessPlanDocument || {};
    const name = strategy?.businessName || a.businessName || 'Business';
    const category = strategy?.category || a.category || 'B2B Enterprise SaaS';
    const targetUrl = strategy?.targetUrl || 'Verified Enterprise Platform';

    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches
    pres.author = 'VYUHOX Autonomous GTM SaaS';
    pres.company = name;
    pres.title = `${name} - Executive GTM Strategy & Pitch Deck`;

    // SLIDE 1: HERO / COVER
    const s1 = pres.addSlide();
    s1.background = { color: '0B1120' };

    s1.addText(category.toUpperCase() + ' • AUTONOMOUS GTM STRATEGY', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.4,
      fontSize: 11, bold: true, color: '06B6D4', fontFace: 'Calibri'
    });

    s1.addText(name, {
      x: 0.8, y: 1.3, w: 11.5, h: 1.2,
      fontSize: 38, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    const valueProp = a.positioning?.coreValueProp || a.summary || 'Transforming Enterprise Pipeline Through Autonomous GTM Execution';
    s1.addText(valueProp, {
      x: 0.8, y: 2.6, w: 11.5, h: 0.9,
      fontSize: 17, color: '94A3B8', fontFace: 'Calibri'
    });

    s1.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 4.1, w: 11.7, h: 2.4,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });

    s1.addText([
      { text: 'Target Domain: ', options: { bold: true, color: '06B6D4' } },
      { text: targetUrl + '\n', options: { color: 'CBD5E1' } },
      { text: 'Platform Engine: ', options: { bold: true, color: '10B981' } },
      { text: 'VYUHOX Autonomous Multi-Agent GTM SaaS Platform\n', options: { color: 'CBD5E1' } },
      { text: 'Deployment Mode: ', options: { bold: true, color: 'A78BFA' } },
      { text: (a.recommendedAITeam?.recommendedPlan || 'Autonomous AI Company Mode') + '\n', options: { color: 'CBD5E1' } },
      { text: 'Strategic Mandate: ', options: { bold: true, color: 'FBBF24' } },
      { text: 'Automate speed-to-lead outbound prospecting, AI voice closer live transfers, and pipeline ROI.', options: { color: 'CBD5E1' } }
    ], {
      x: 1.1, y: 4.3, w: 11.1, h: 2.0,
      fontSize: 12, fontFace: 'Calibri', lineSpacing: 22
    });

    // SLIDE 2: TARGET AUDIENCE & ICP
    const s2 = pres.addSlide();
    s2.background = { color: '0B1120' };
    s2.addText('TARGET AUDIENCE & IDEAL CUSTOMER PROFILE (ICP)', {
      x: 0.8, y: 0.6, w: 11.5, h: 0.4,
      fontSize: 11, bold: true, color: '06B6D4', fontFace: 'Calibri'
    });
    s2.addText('Precision Buying Committee Matrix', {
      x: 0.8, y: 1.0, w: 11.5, h: 0.7,
      fontSize: 26, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    s2.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.9, w: 5.6, h: 4.8,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    s2.addText('PRIMARY BUYING PERSONA', {
      x: 1.1, y: 2.1, w: 5.0, h: 0.3,
      fontSize: 11, bold: true, color: '38BDF8', fontFace: 'Calibri'
    });
    s2.addText(a.targetAudience?.primaryPersona || 'Enterprise Decision Makers', {
      x: 1.1, y: 2.5, w: 5.0, h: 0.6,
      fontSize: 16, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });
    s2.addText([
      { text: 'Key Decision Makers:\n', options: { bold: true, color: '94A3B8' } },
      { text: (a.targetAudience?.decisionMakers || ['CEO', 'VP of Growth', 'Director of Operations']).join(', ') + '\n\n', options: { color: 'CBD5E1' } },
      { text: 'Estimated Budget Tier:\n', options: { bold: true, color: '94A3B8' } },
      { text: (a.targetAudience?.estimatedBudgetTier || '$5,000 - $25,000 / month') + '\n\n', options: { color: 'CBD5E1' } },
      { text: 'Estimated Deal Size (ACV):\n', options: { bold: true, color: '94A3B8' } },
      { text: (a.targetAudience?.estimatedACV || '$25,000 - $75,000') + '\n', options: { color: 'CBD5E1' } },
    ], {
      x: 1.1, y: 3.2, w: 5.0, h: 3.2,
      fontSize: 12, fontFace: 'Calibri'
    });

    s2.addShape(pres.ShapeType.rect, {
      x: 6.8, y: 1.9, w: 5.7, h: 4.8,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    s2.addText('CRITICAL BUYER PAIN POINTS', {
      x: 7.1, y: 2.1, w: 5.1, h: 0.3,
      fontSize: 11, bold: true, color: 'F87171', fontFace: 'Calibri'
    });
    const painPoints = a.targetAudience?.painPoints || [
      'High customer acquisition costs eroding operating margins',
      'Manual outbound prospecting consuming expensive rep bandwidth',
      'Fragmented communication channels resulting in lead drop-offs'
    ];
    s2.addText(painPoints.map(p => `• ${p}`).join('\n\n'), {
      x: 7.1, y: 2.6, w: 5.1, h: 3.8,
      fontSize: 12, color: 'CBD5E1', fontFace: 'Calibri', lineSpacing: 20
    });

    // SLIDE 3: STRATEGIC POSITIONING & UNFAIR ADVANTAGE
    const s3 = pres.addSlide();
    s3.background = { color: '0B1120' };
    s3.addText('STRATEGIC POSITIONING & DIFFERENTIATION', {
      x: 0.8, y: 0.6, w: 11.5, h: 0.4,
      fontSize: 11, bold: true, color: '06B6D4', fontFace: 'Calibri'
    });
    s3.addText('Unfair Advantage & Competitive Moat', {
      x: 0.8, y: 1.0, w: 11.5, h: 0.7,
      fontSize: 26, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    s3.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.9, w: 11.7, h: 1.4,
      fill: { color: '1E293B' },
      line: { color: '06B6D4', width: 1 }
    });
    s3.addText('CORE VALUE PROPOSITION', {
      x: 1.1, y: 2.05, w: 11.1, h: 0.3,
      fontSize: 10, bold: true, color: '38BDF8', fontFace: 'Calibri'
    });
    s3.addText(`"${a.positioning?.coreValueProp || valueProp}"`, {
      x: 1.1, y: 2.4, w: 11.1, h: 0.8,
      fontSize: 15, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    s3.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 3.6, w: 11.7, h: 3.1,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    s3.addText('KEY DIFFERENTIATORS & DEFENSIBLE ADVANTAGE', {
      x: 1.1, y: 3.8, w: 11.1, h: 0.3,
      fontSize: 11, bold: true, color: '10B981', fontFace: 'Calibri'
    });
    const diffs = a.positioning?.keyDifferentiators || [
      'Sub-800ms AI conversational voice closer speed-to-lead execution',
      'Waterfall multi-directory enrichment with zero deliverability degradation',
      'Integrated autonomous multi-agent C-Suite coordinating outbound 24/7'
    ];
    s3.addText(
      (a.positioning?.unfairAdvantage ? `Unfair Advantage: ${a.positioning.unfairAdvantage}\n\n` : '') +
      diffs.map(d => `• ${d}`).join('\n\n'),
      {
        x: 1.1, y: 4.2, w: 11.1, h: 2.3,
        fontSize: 12, color: 'CBD5E1', fontFace: 'Calibri', lineSpacing: 20
      }
    );

    // SLIDE 4: MULTI-TOUCH ACQUISITION SWITCHBOARD
    const s4 = pres.addSlide();
    s4.background = { color: '0B1120' };
    s4.addText('MULTI-TOUCH ACQUISITION SWITCHBOARD', {
      x: 0.8, y: 0.6, w: 11.5, h: 0.4,
      fontSize: 11, bold: true, color: '06B6D4', fontFace: 'Calibri'
    });
    s4.addText('High-Converting Outreach Channels & Hooks', {
      x: 0.8, y: 1.0, w: 11.5, h: 0.7,
      fontSize: 26, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    s4.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.9, w: 5.6, h: 4.8,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    s4.addText('RECOMMENDED ACQUISITION CHANNELS', {
      x: 1.1, y: 2.1, w: 5.0, h: 0.3,
      fontSize: 11, bold: true, color: '38BDF8', fontFace: 'Calibri'
    });
    const channels = (a.recommendedChannels || []).slice(0, 4);
    const channelText = channels.map(c => `• ${c.channel} (Fit: ${c.fitScore}%, Priority: ${c.priority})\n  ${c.rationale}`).join('\n\n');
    s4.addText(channelText || '• Email Sequences (Cold Outbound)\n• WhatsApp Direct Pipeline\n• Voice Closer Live Inbound\n• Targeted Paid Ads', {
      x: 1.1, y: 2.5, w: 5.0, h: 4.0,
      fontSize: 11, color: 'CBD5E1', fontFace: 'Calibri'
    });

    s4.addShape(pres.ShapeType.rect, {
      x: 6.8, y: 1.9, w: 5.7, h: 4.8,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    s4.addText('PROVEN AD & OUTREACH ANGLES', {
      x: 7.1, y: 2.1, w: 5.1, h: 0.3,
      fontSize: 11, bold: true, color: 'FBBF24', fontFace: 'Calibri'
    });
    const hooks = (a.adAngles || []).slice(0, 4);
    const hookText = hooks.map((h, i) => `${i + 1}. "${h.hook}"\n   Angle: ${h.angle}`).join('\n\n');
    s4.addText(hookText || '1. Speed-to-lead direct booking angle\n2. ROI multiplication and cost reduction angle', {
      x: 7.1, y: 2.5, w: 5.1, h: 4.0,
      fontSize: 11, color: 'CBD5E1', fontFace: 'Calibri'
    });

    // SLIDE 5: MULTI-AGENT AUTONOMOUS TEAM
    const s5 = pres.addSlide();
    s5.background = { color: '0B1120' };
    s5.addText('MULTI-AGENT AUTONOMOUS TEAM ROSTER', {
      x: 0.8, y: 0.6, w: 11.5, h: 0.4,
      fontSize: 11, bold: true, color: '06B6D4', fontFace: 'Calibri'
    });
    s5.addText('24/7 AI C-Suite Workforce Deployment', {
      x: 0.8, y: 1.0, w: 11.5, h: 0.7,
      fontSize: 26, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    s5.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.9, w: 11.7, h: 1.2,
      fill: { color: '10B981', transparency: 85 },
      line: { color: '10B981', width: 1 }
    });
    s5.addText([
      { text: 'Deployment Mode: ', options: { bold: true, color: '94A3B8' } },
      { text: (a.recommendedAITeam?.recommendedPlan || 'Autonomous AI Company Mode') + '   |   ', options: { color: 'F8FAFC', bold: true } },
      { text: 'Projected Monthly Pipeline ROI: ', options: { bold: true, color: '94A3B8' } },
      { text: (a.recommendedAITeam?.estimatedMonthlyROI || '6.2x Pipeline ROI'), options: { color: '10B981', bold: true } },
    ], {
      x: 1.1, y: 2.2, w: 11.1, h: 0.6,
      fontSize: 14, fontFace: 'Calibri'
    });

    s5.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 3.4, w: 11.7, h: 3.3,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    const roles = a.recommendedAITeam?.roles || [
      'Sarah (AI SDR): Multi-channel email & WhatsApp introduction sequences and cold lead qualification',
      'Maya (AI Voice Closer): Sub-45s inbound speed-to-lead phone calling and appointment setting',
      'Sophia (AI CMO): Autonomous ad creative testing, social post scheduling, and budget reallocation',
      'Julian (AI CFO): Real-time unit economics protection, CAC-to-LTV guardrails, and usage accounting'
    ];
    s5.addText(roles.map(r => `• ${r}`).join('\n\n'), {
      x: 1.1, y: 3.7, w: 11.1, h: 2.8,
      fontSize: 12, color: 'CBD5E1', fontFace: 'Calibri', lineSpacing: 20
    });

    // SLIDE 6: 30-DAY LAUNCH BLUEPRINT
    const s6 = pres.addSlide();
    s6.background = { color: '0B1120' };
    s6.addText('30-DAY STEP-BY-STEP LAUNCH BLUEPRINT', {
      x: 0.8, y: 0.6, w: 11.5, h: 0.4,
      fontSize: 11, bold: true, color: '06B6D4', fontFace: 'Calibri'
    });
    s6.addText('From Infrastructure Warmup to Compounded Closed Deals', {
      x: 0.8, y: 1.0, w: 11.5, h: 0.7,
      fontSize: 26, bold: true, color: 'F8FAFC', fontFace: 'Calibri'
    });

    s6.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.9, w: 11.7, h: 4.8,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 }
    });
    const roadmapPhases = strategy?.stepByStepRoadmap || d.stepByStepLaunchRoadmap || [
      { phase: 'Phase 1 (Days 1–3): Technical Infrastructure & Mailbox Warmup', objectives: ['Configure SPF, DKIM, DMARC on secondary domains', 'Connect Bland.ai WebRTC voice number pool'] },
      { phase: 'Phase 2 (Days 4–8): Deep Prospecting & Waterfall Verification', objectives: ['Scrape verified decision-makers matching ICP', 'Validate deliverability with 100% MX check'] },
      { phase: 'Phase 3 (Days 9–18): Sarah AI SDR Outbound Launch', objectives: ['Deploy personalized 4-step sequence', 'Engage positive replies over WhatsApp'] },
      { phase: 'Phase 4 (Days 19–25): Maya Voice Closer Live Dialing', objectives: ['Trigger sub-45s outbound calls on high-intent signals', 'Secure calendar demos on Google/Outlook'] },
      { phase: 'Phase 5 (Days 26–30): Flywheel Optimization & Revenue Scale', objectives: ['Scale high-converting outreach angles', 'Review closed revenue and compounding pipeline ROI'] },
    ];

    const phaseLines = roadmapPhases.map(p => {
      const objs = (p.objectives || []).slice(0, 2).map(o => `   - ${o}`).join('\n');
      return `▶ ${p.phase || p.days}:\n${objs}`;
    }).join('\n\n');

    s6.addText(phaseLines, {
      x: 1.1, y: 2.2, w: 11.1, h: 4.2,
      fontSize: 11, color: 'CBD5E1', fontFace: 'Calibri', lineSpacing: 18
    });

    const buffer = await pres.write({ outputType: 'nodebuffer' });
    return buffer;
  }

  /**
   * Generates interactive funnel nodes for visual flowchart representation
   */
  static generateFunnelFlow(strategy = {}) {
    return {
      nodes: [
        {
          id: 'step_1',
          label: '1. Traffic & Intent Signals',
          type: 'input',
          desc: 'Website Visitors, Google Directory Signals, Scraped Domain Employees',
          tool: 'VYUHOX Waterfall Scraper',
          color: '#06B6D4',
        },
        {
          id: 'step_2',
          label: '2. Real-Time MX & HLR Verification',
          type: 'process',
          desc: '100% Verified Business Inboxes & Direct Phone Numbers',
          tool: 'MX Mailbox Verifier',
          color: '#3B82F6',
        },
        {
          id: 'step_3',
          label: '3. AI SDR Sarah (Omnichannel)',
          type: 'process',
          desc: 'Hyper-Personalized Cold Emails & 98% Open Rate WhatsApp',
          tool: 'Sarah SDR Engine',
          color: '#8B5CF6',
        },
        {
          id: 'step_4',
          label: '4. Maya Voice Closer (<45s)',
          type: 'process',
          desc: 'Sub-800ms Voice Call upon Positive Reply / Form-Fill',
          tool: 'Bland.ai Voice Bridge',
          color: '#10B981',
        },
        {
          id: 'step_5',
          label: '5. Confirmed Calendar Booking',
          type: 'output',
          desc: 'Qualified Demo Slotted on Google / Outlook Calendar',
          tool: 'Calendar Watchdog',
          color: '#F59E0B',
        },
      ],
      connections: [
        { from: 'step_1', to: 'step_2', label: 'Verified Contacts' },
        { from: 'step_2', to: 'step_3', label: 'Outbound Trigger' },
        { from: 'step_3', to: 'step_4', label: 'Positive Response / Click' },
        { from: 'step_4', to: 'step_5', label: 'Qualified Budget & Time' },
      ],
    };
  }
}
