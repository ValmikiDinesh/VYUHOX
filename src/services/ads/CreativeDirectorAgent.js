/**
 * CreativeDirectorAgent.js
 * World-Class Strategic AI Creative Director & Multi-Platform Ad Synthesizer
 * 
 * CORE CAPABILITIES:
 * 1. Deep Business Intelligence & Cross-Module Analysis:
 *    - Ingests universal DNA, product/services catalog, crawled assets, lead intelligence,
 *      past ROAS telemetry, and sales call objections via UniversalBusinessContext.
 * 2. Strategic Research & SWOT Analysis:
 *    - Generates executive SWOT (Strengths, Weaknesses, Opportunities, Threats), competitor
 *      differentiation angles, target persona triggers, and psychological hooks.
 * 3. Purpose & Platform-Calibrated Schemas:
 *    - Meta Ads (Feed 1:1, Story/Reel 9:16): Primary text, headline, description, CTA, WhatsApp greeting, Instant Lead Form.
 *    - Google Ads (Search/PMax/Display 1.91:1, 1:1): Responsive Headlines (1-15), Descriptions (1-4), Sitelinks, Callouts.
 *    - LinkedIn Ads (1.91:1, 1:1): Executive B2B Intro, Value Proposition Headline, Enterprise CTA.
 * 4. Multi-Provider Visual Generation:
 *    - Crafts hyper-specific, purpose-tailored visual prompts and calls MultiProviderVisualGateway
 *      with rotating providers (Banana, Google Flow, Pollinations FLUX, HuggingFace, Fal, DALL-E)
 *      and video generation engines with zero-failure fallbacks.
 * 5. Multi-Variation Drafting with Client Approval:
 *    - Generates 3-5 distinct strategic variations (Pain-Agitate-Solve, Social Proof, Risk-Reversal Offer, Contrarian Angle)
 *    - Preserves drafts in AWAITING_CLIENT_APPROVAL state until explicitly authorized by the client.
 */

import { UniversalBusinessContext } from '../ai/UniversalBusinessContext.js';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { MultiProviderVisualGateway } from '../visual/MultiProviderVisualGateway.js';
import { AdCampaign } from '../../models/AdCampaign.js';
import { AdCreative } from '../../models/AdCreative.js';

export class CreativeDirectorAgent {
  /**
   * Platform standard dimensions and visual specifications
   */
  static PLATFORM_SPECS = {
    META_FEED: {
      name: 'Meta Facebook & Instagram Feed',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      formatType: 'IMAGE',
      ctaOptions: ['LEARN_MORE', 'SIGN_UP', 'GET_OFFER', 'CONTACT_US', 'SEND_WHATSAPP_MESSAGE'],
      visualGuideline: 'High-contrast, scroll-stopping real-world focal point, vibrant lighting, emotional human reaction or product in action, zero generic stock look',
    },
    META_REEL: {
      name: 'Meta Instagram Reel & Stories',
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      formatType: 'VIDEO',
      ctaOptions: ['WATCH_MORE', 'APPLY_NOW', 'BOOK_DEMO', 'SEND_WHATSAPP_MESSAGE'],
      visualGuideline: 'Fast-paced dynamic vertical motion, eye-level cinematic shot, bold hook overlay zone in top-third, thumb-stopping first 1.5 seconds',
    },
    GOOGLE_DISPLAY: {
      name: 'Google Display Network & PMax',
      aspectRatio: '1.91:1',
      width: 1200,
      height: 628,
      formatType: 'IMAGE',
      ctaOptions: ['VISIT_SITE', 'GET_QUOTE', 'DOWNLOAD_GUIDE', 'SCHEDULE_CALL'],
      visualGuideline: 'Clean commercial photography, generous negative space on left/right for Google dynamic text overlays, pristine brand lighting',
    },
    GOOGLE_SEARCH: {
      name: 'Google Responsive Search Ad (RSA)',
      aspectRatio: 'NONE',
      width: 0,
      height: 0,
      formatType: 'TEXT_RSA',
      ctaOptions: ['VISIT_SITE', 'CALL_NOW', 'BOOK_NOW'],
      visualGuideline: 'Text-driven high-intent search ads with 15 headlines and 4 descriptions',
    },
    LINKEDIN_SPONSORED: {
      name: 'LinkedIn Sponsored Content',
      aspectRatio: '1.91:1',
      width: 1200,
      height: 627,
      formatType: 'IMAGE',
      ctaOptions: ['REQUEST_DEMO', 'DOWNLOAD_WHITEPAPER', 'JOIN_WAITLIST'],
      visualGuideline: 'Forbes/Bloomberg executive boardroom realism, clean data visualizations, sleek dark-mode tech aesthetic, authoritative leadership tone',
    },
  };

  /**
   * Main Strategic Engine: Researches, conducts SWOT, crafts multi-variation ads, and generates visual creatives
   */
  static async planAndDraftCampaign({
    workspaceId,
    platform = 'META_FEED',
    objective = 'LEAD_GENERATION', // 'BRAND_AWARENESS' | 'LEAD_GENERATION' | 'CONVERSIONS' | 'WHATSAPP_LEADS'
    productFocus = '',
    customGoal = '',
    numVariations = 3,
    preferredVisualProvider = null,
  }) {
    console.log(`[CreativeDirectorAgent] Initiating strategic ad campaign plan for workspace: ${workspaceId}, platform: ${platform}, objective: ${objective}`);

    // 1. Ingest 100% unified multi-dimensional business context
    const businessContext = await UniversalBusinessContext.getCompleteIntelligence(workspaceId);
    const contextPrompt = UniversalBusinessContext.formatIntelligenceForPrompt(businessContext, 'ADS_MANAGER');

    const platformSpec = this.PLATFORM_SPECS[platform] || this.PLATFORM_SPECS.META_FEED;

    // 2. Perform World-Class Strategic Research & SWOT Analysis via LLM Cascade
    const strategyPrompt = `
You are the world's most elite Chief Marketing Officer and Creative Director (ex-Ogilvy, ex-Wieden+Kennedy, ex-Performance Meta/Google Lead).
Analyze the business details below and produce a comprehensive, top-tier Advertising Strategy & SWOT Analysis before any creative is generated.

BUSINESS CONTEXT:
${contextPrompt}

CAMPAIGN PARAMETERS:
- Platform: ${platformSpec.name} (${platform})
- Campaign Objective: ${objective}
- Specific Product / Offer Focus: ${productFocus || 'Primary Core Business Offer'}
- Custom Goal / Directive: ${customGoal || 'Drive qualified, high-ticket leads with maximum ROAS'}
- Required Variations: ${numVariations}

TASK INSTRUCTIONS:
1. Conduct an in-depth SWOT Analysis tailored to paid acquisition:
   - Strengths (unbeatable features, social proof, unique tech, proprietary advantage)
   - Weaknesses (objections prospects have, skepticism, cost, unfamiliarity)
   - Opportunities (untapped audience segments, competitor gaps, high-converting angles)
   - Threats (ad fatigue, high CPCs, aggressive competitors, platform policy rejections)
2. Formulate 4 distinct Psychological Angles:
   - Angle A: Pain-Agitate-Solve (relentless focus on prospect friction & immediate relief)
   - Angle B: Proof & Case Study (concrete metrics, ROI claims, client outcomes)
   - Angle C: Irresistible Offer & Risk Reversal (guarantee, fast demo, free value, WhatsApp instant access)
   - Angle D: Contrarian Truth & Curiosity Hook (challenging conventional wisdom in this industry)
3. For each of the ${numVariations} requested variations, generate authentic platform-specific fields:
   - For Meta: primaryText (2-3 paragraphs with hook, bullet benefits, and CTA), headline (catchy, max 40 chars), description (subtext/urgency), callToAction (${platformSpec.ctaOptions.join(', ')}), whatsAppGreeting (if WhatsApp click-to-chat), instantFormQuestions (2-3 qualifying questions).
   - For Google: headlines (list of 5-10 headlines max 30 chars), descriptions (list of 3-4 descriptions max 90 chars), sitelinks (3-4 quick links), callouts (3-4 feature callouts).
   - For LinkedIn: introText (executive tone), headline, ctaText.
4. For each variation, write a hyper-detailed, purpose-built prompt for an AI Image/Video Generator:
   - The visual must match the purpose (e.g. Paid Ad vs Organic Post: Ads require clear visual focal point, contrasting focal elements, vibrant lighting, no cluttered background).
   - Must specify aspect ratio, photography style, lighting, depth of field, and exact visual metaphor representing the product/service.

Return STRICTLY a JSON object with this exact structure:
{
  "campaignName": "string",
  "swotAnalysis": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "competitiveMoat": "string",
  "targetAudienceSummary": "string",
  "psychologicalAngles": [
    { "name": "string", "coreTrigger": "string" }
  ],
  "variations": [
    {
      "variationIndex": 1,
      "strategicAngle": "PAIN_AGITATE_SOLVE",
      "headline": "string",
      "primaryText": "string",
      "description": "string",
      "callToAction": "string",
      "whatsAppGreeting": "string",
      "googleHeadlines": ["string"],
      "googleDescriptions": ["string"],
      "googleCallouts": ["string"],
      "instantFormQuestions": ["string"],
      "visualCreativeConcept": {
        "title": "string",
        "purpose": "PAID_AD_SCROLL_STOPPER",
        "detailedVisualPrompt": "string",
        "textOverlayHeadline": "string",
        "textOverlaySubtext": "string",
        "suggestedFormat": "${platformSpec.formatType}"
      }
    }
  ]
}
`;

    let strategyResult = null;
    try {
      const llmOutput = await LlmGatewayService.execute({
        prompt: strategyPrompt,
        systemInstruction: 'You are an elite CMO and Ad Creative Strategist. Always respond with valid JSON.',
        jsonResponse: true,
        temperature: 0.3,
      });

      strategyResult = typeof llmOutput.content === 'string' ? JSON.parse(llmOutput.content) : llmOutput.content;
    } catch (llmErr) {
      console.warn('[CreativeDirectorAgent] Primary LLM failed, using strategic template fallback:', llmErr.message);
      strategyResult = this.buildFallbackStrategy({
        businessName: businessContext.companyName,
        industry: businessContext.industry,
        productFocus,
        platform,
        objective,
      });
    }

    // 3. Generate Visual Assets (Images & Videos) for each variation using MultiProviderVisualGateway
    const variationsWithAssets = [];

    for (let i = 0; i < (strategyResult.variations || []).length; i++) {
      const variation = strategyResult.variations[i];
      const visualConcept = variation.visualCreativeConcept || {};

      console.log(`[CreativeDirectorAgent] Generating visual asset for Variation #${i + 1} (${platformSpec.aspectRatio}) via MultiProviderVisualGateway...`);

      let assetResult = null;

      if (platformSpec.formatType === 'VIDEO') {
        assetResult = await MultiProviderVisualGateway.generateVideo({
          prompt: `${businessContext.companyName} commercial: ${visualConcept.detailedVisualPrompt || variation.headline}`,
          aspectRatio: platformSpec.aspectRatio,
          durationSeconds: 15,
          headline: visualConcept.textOverlayHeadline || variation.headline,
          subtext: visualConcept.textOverlaySubtext || variation.description,
          brandName: businessContext.companyName,
        });
      } else {
        assetResult = await MultiProviderVisualGateway.generateImage({
          prompt: `${businessContext.companyName} ad: ${visualConcept.detailedVisualPrompt || variation.headline}`,
          width: platformSpec.width || 1080,
          height: platformSpec.height || 1080,
          preferredProvider: preferredVisualProvider,
          style: 'cinematic',
          platform,
          headline: visualConcept.textOverlayHeadline || variation.headline,
          subtext: visualConcept.textOverlaySubtext || variation.description,
          brandName: businessContext.companyName,
        });
      }

      variationsWithAssets.push({
        ...variation,
        visualAsset: {
          mediaType: platformSpec.formatType,
          mediaUrl: assetResult.mediaUrl || assetResult.imageUrl,
          thumbnailUrl: assetResult.thumbnailUrl || assetResult.imageUrl,
          provider: assetResult.provider,
          providerName: assetResult.providerName,
          aspectRatio: platformSpec.aspectRatio,
          width: assetResult.width || platformSpec.width,
          height: assetResult.height || platformSpec.height,
          rotationLogs: assetResult.rotationLogs || [],
        },
      });
    }

    // 4. Create and Save Draft Ad Campaign & Creatives in MongoDB (Status: AWAITING_CLIENT_APPROVAL)
    const campaignDoc = new AdCampaign({
      workspaceId,
      name: strategyResult.campaignName || `[AI Draft] ${businessContext.companyName} - ${platform} (${objective})`,
      platform: platform.startsWith('META') ? 'META' : platform.startsWith('GOOGLE') ? 'GOOGLE' : 'LINKEDIN',
      objective,
      status: 'DRAFT', // Client must approve before launch!
      reviewStatus: 'AWAITING_CLIENT_APPROVAL',
      dailyBudget: 25.0,
      totalSpend: 0,
      targetAudience: {
        summary: strategyResult.targetAudienceSummary || 'High-intent B2B decision makers & consumers',
        locations: ['US', 'IN', 'GB', 'CA', 'AE'],
        interests: [businessContext.industry || 'Technology', 'Business Growth'],
      },
      strategyBrief: {
        swotAnalysis: strategyResult.swotAnalysis,
        competitiveMoat: strategyResult.competitiveMoat,
        psychologicalAngles: strategyResult.psychologicalAngles,
        generatedAt: new Date(),
      },
      approvalDetails: {
        isApprovedByClient: false,
        requiresClientPermission: true,
        permissionNote: 'Awaiting client review of generated copy, strategy, and visual creatives before live ad spend activation.',
      },
    });

    await campaignDoc.save();

    // 5. Save all AdCreative variations linked to this campaign
    const creativeDocs = [];
    for (const varItem of variationsWithAssets) {
      const creative = new AdCreative({
        campaignId: campaignDoc._id,
        workspaceId,
        headline: varItem.headline,
        primaryText: varItem.primaryText || varItem.headline,
        bodyCopy: varItem.primaryText || varItem.headline,
        description: varItem.description,
        callToAction: varItem.callToAction || 'LEARN_MORE',
        mediaType: varItem.visualAsset.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mediaUrl: varItem.visualAsset.mediaUrl,
        thumbnailUrl: varItem.visualAsset.thumbnailUrl,
        aspectRatio: varItem.visualAsset.aspectRatio,
        platform,
        status: 'DRAFT',
        approvalStatus: 'PENDING_CLIENT_REVIEW',
        metadata: {
          strategicAngle: varItem.strategicAngle,
          whatsAppGreeting: varItem.whatsAppGreeting,
          googleHeadlines: varItem.googleHeadlines || [],
          googleDescriptions: varItem.googleDescriptions || [],
          instantFormQuestions: varItem.instantFormQuestions || [],
          providerUsed: varItem.visualAsset.providerName,
        },
      });

      await creative.save();
      creativeDocs.push(creative);
    }

    return {
      success: true,
      campaign: campaignDoc,
      creatives: creativeDocs,
      strategy: strategyResult,
      message: `Strategic campaign and ${creativeDocs.length} variations generated and drafted. Awaiting client review and permission before launch.`,
    };
  }

  /**
   * Client launches or approves the campaign & its creatives
   */
  static async approveAndLaunchCampaign({ campaignId, approvedCreativeIds = [], workspaceId }) {
    const campaign = await AdCampaign.findOne({ _id: campaignId, workspaceId });
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Update campaign status to ACTIVE
    campaign.status = 'ACTIVE';
    campaign.reviewStatus = 'APPROVED_BY_CLIENT';
    campaign.approvalDetails = {
      isApprovedByClient: true,
      approvedAt: new Date(),
      requiresClientPermission: false,
    };
    await campaign.save();

    // Activate approved creatives strictly scoped to workspace
    if (approvedCreativeIds.length > 0) {
      await AdCreative.updateMany(
        { _id: { $in: approvedCreativeIds }, campaignId, workspaceId },
        { status: 'ACTIVE', approvalStatus: 'CLIENT_APPROVED' }
      );
      // Pause or keep unapproved ones as draft
      await AdCreative.updateMany(
        { _id: { $nin: approvedCreativeIds }, campaignId, workspaceId },
        { status: 'PAUSED', approvalStatus: 'REJECTED_OR_SKIPPED' }
      );
    } else {
      // Approve all creatives by default if no subset specified
      await AdCreative.updateMany(
        { campaignId, workspaceId },
        { status: 'ACTIVE', approvalStatus: 'CLIENT_APPROVED' }
      );
    }

    console.log(`[CreativeDirectorAgent] Campaign ${campaignId} successfully approved by client and transitioned to ACTIVE status.`);

    return {
      success: true,
      campaign,
      message: 'Campaign authorized by client and live autonomous ad delivery activated.',
    };
  }

  /**
   * Fallback strategic plan generator if all external LLMs are unavailable
   */
  static buildFallbackStrategy({ businessName, industry, productFocus, platform, objective }) {
    const focus = productFocus || `${businessName} Premium Solutions`;
    return {
      campaignName: `[Strategic Launch] ${businessName} - High-Intent ${objective}`,
      swotAnalysis: {
        strengths: [
          `Proprietary ${industry || 'market'} workflow automation`,
          'Direct personalized client engagement with 24/7 autonomous closing',
          'Immediate measurable ROI with zero onboarding friction',
        ],
        weaknesses: [
          'Prospects may be accustomed to legacy manual service agencies',
          'High market noise requiring bold visual pattern interrupts',
        ],
        opportunities: [
          'High demand for automated efficiency and reduced operational overhead',
          'Untapped niche verticals seeking modern turn-key systems',
        ],
        threats: [
          'Increasing CPMs on generic audience targeting',
          'Skeptical buyers requiring instant social proof and risk reversal',
        ],
      },
      competitiveMoat: `Unique integration of multi-channel intelligence, instant response times, and guaranteed delivery benchmarks.`,
      targetAudienceSummary: `Growth-stage business owners, CTOs, marketing directors, and decision-makers seeking rapid scale with minimal overhead.`,
      psychologicalAngles: [
        { name: 'Pain-Agitate-Solve', coreTrigger: 'Eliminate wasted hours and missed revenue opportunities' },
        { name: 'Proof & Metrics', coreTrigger: 'Showcase 3.8x average performance boost within 14 days' },
        { name: 'Irresistible Offer', coreTrigger: '100% Risk-free live demo + custom execution blueprint' },
      ],
      variations: [
        {
          variationIndex: 1,
          strategicAngle: 'PAIN_AGITATE_SOLVE',
          headline: `Stop Losing Customers to Slower Competitors`,
          primaryText: `Are slow response times and outdated manual systems eating into your profit margins?\n\n${businessName} automates your core client acquisition and conversion pipeline end-to-end. Get notified the exact second a qualified lead engages.\n\nTap Learn More to see your customized implementation blueprint.`,
          description: `Deploy in less than 24 hours. Zero technical friction.`,
          callToAction: 'LEARN_MORE',
          whatsAppGreeting: `Hello! I saw your ad on ${platform} regarding ${focus} and want to claim my custom strategy blueprint.`,
          googleHeadlines: [
            `Top Rated ${industry || 'Solutions'}`,
            `Automate Your Growth 24/7`,
            `Get ${businessName} Today`,
            `Fast Implementation Guarantee`,
          ],
          googleDescriptions: [
            `Stop leaving qualified sales on the table. Discover how ${businessName} scales your revenue.`,
            `Autonomous AI-powered execution built for modern businesses. Book your free consultation.`,
          ],
          instantFormQuestions: ['What is your current monthly revenue goal?', 'What is your primary growth bottleneck?'],
          visualCreativeConcept: {
            title: 'High-Impact Pattern Interrupt',
            purpose: 'PAID_AD_SCROLL_STOPPER',
            detailedVisualPrompt: `Dramatic, high-contrast studio photograph of a modern tech executive workstation with illuminated holographic performance analytics dashboards, sleek dark glassmorphism, vibrant turquoise and violet accents, cinematic depth of field, 8k resolution`,
            textOverlayHeadline: `Stop Losing Revenue`,
            textOverlaySubtext: `Autonomous Growth for Modern Leaders`,
          },
        },
        {
          variationIndex: 2,
          strategicAngle: 'SOCIAL_PROOF_AND_METRICS',
          headline: `How Leading Brands Scale with ${businessName}`,
          primaryText: `When our clients deployed ${businessName}, they cut their acquisition cost by 42% while tripling qualified pipeline volume.\n\nNo guesswork. No bloated retainers. Just precision execution built for speed.\n\nSee how it works in our 3-minute interactive breakdown.`,
          description: `Rated 4.9/5 by industry leaders.`,
          callToAction: 'SIGN_UP',
          whatsAppGreeting: `Hi! I would like to see the case studies and proof metrics for ${businessName}.`,
          googleHeadlines: [
            `Cut Acquisition Costs 42%`,
            `Proven Performance Blueprint`,
            `See Real Client Results`,
          ],
          googleDescriptions: [
            `Verified case studies showing rapid scaling. Explore the full breakdown now.`,
          ],
          instantFormQuestions: ['What is your company size?', 'When are you looking to implement?'],
          visualCreativeConcept: {
            title: 'Executive Metric Showcase',
            purpose: 'PAID_AD_SCROLL_STOPPER',
            detailedVisualPrompt: `Editorial Forbes-style photograph of a confident business leader reviewing exponential growth graphs on a futuristic transparent tablet in an illuminated architectural glass office at dusk, warm interior glow with cool city twilight background`,
            textOverlayHeadline: `3.8x Average Pipeline Boost`,
            textOverlaySubtext: `Verified Client Results`,
          },
        },
        {
          variationIndex: 3,
          strategicAngle: 'IRRESISTIBLE_OFFER',
          headline: `Get Your Custom Growth Blueprint (100% Free)`,
          primaryText: `Ready to upgrade your business engine? For a limited time, get a complimentary, pin-to-pin growth audit and deployment strategy tailored specifically to your business.\n\nClaim your spot today before allocations fill up.`,
          description: `Limited to the next 15 verified businesses.`,
          callToAction: 'GET_OFFER',
          whatsAppGreeting: `Hello! I am claiming my free custom growth blueprint from ${businessName}.`,
          googleHeadlines: [
            `Free Growth Audit Blueprint`,
            `Claim Your Strategy Session`,
            `Zero-Risk Implementation`,
          ],
          googleDescriptions: [
            `Get a customized revenue expansion plan mapped pin-to-pin to your business needs.`,
          ],
          instantFormQuestions: ['What is your website URL?', 'What is your best contact phone number?'],
          visualCreativeConcept: {
            title: 'Golden Key Blueprint Graphic',
            purpose: 'PAID_AD_SCROLL_STOPPER',
            detailedVisualPrompt: `Minimalist, ultra-luxurious product packaging presentation of a glowing digital blueprint key with cybernetic circuitry patterns, soft ambient studio lighting, elegant dark obsidian stone pedestal, premium corporate aesthetic`,
            textOverlayHeadline: `Claim Your Custom Blueprint`,
            textOverlaySubtext: `Limited Availability`,
          },
        },
      ],
    };
  }
}
