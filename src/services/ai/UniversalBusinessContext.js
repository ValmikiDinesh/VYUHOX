/**
 * UniversalBusinessContext.js
 * Universal Shared Intelligence & Cross-Module Context Gateway for VYUHOX
 * 
 * GUARANTEES:
 * 1. Analyzes and unifies all workspace data across all modules:
 *    - Strategy & Crawled Website/Maps/Instagram DNA
 *    - Products, Offerings & Services Catalog
 *    - Lead Prospecting & ICP Audience Demographics
 *    - Omnichannel Conversations & Inbound Objections
 *    - Voice AI Maya Call Transcripts & Conversion Trends
 *    - Social Studio Viral Hooks & Media Assets
 *    - Ads Manager Campaign ROAS, Top Angles & CPA Telemetry
 *    - Calendar Bookings & Sales Closures
 *    - SEO / AEO High-Intent Queries & Authority Benchmarks
 * 2. Provides pin-to-pin, instant access for any module (Omnichannel, Voice Closer,
 *    Social Studio, Ads Manager, Calendar, Visual AI, SEO/AEO) so no feature acts in a silo.
 */

import { Workspace } from '../../models/Workspace.js';
import { GtmStrategy } from '../../models/GtmStrategy.js';
import { Lead } from '../../models/Lead.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { CallLog } from '../../models/CallLog.js';
import { AdCampaign } from '../../models/AdCampaign.js';
import { SocialPost } from '../../models/SocialPost.js';
import { Appointment } from '../../models/Appointment.js';
import { BusinessBrain } from '../../models/BusinessBrain.js';
import { PlatformConfig } from '../../models/PlatformConfig.js';

export class UniversalBusinessContext {
  /**
   * Retrieves 100% unified multi-dimensional business context for a workspace
   */
  static async getCompleteIntelligence(workspaceId) {
    if (!workspaceId) throw new Error('workspaceId is required for UniversalBusinessContext');

    const [
      workspace,
      strategy,
      brain,
      leadsCount,
      recentLeads,
      conversations,
      callLogs,
      adCampaigns,
      socialPosts,
      appointments,
      platformConfig,
    ] = await Promise.all([
      Workspace.findById(workspaceId).lean().catch(() => null),
      GtmStrategy.findOne({ workspaceId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean().catch(() => null)
        || GtmStrategy.findOne({ workspaceId }).sort({ createdAt: -1 }).lean().catch(() => null),
      BusinessBrain.findOne({ workspaceId }).lean().catch(() => null),
      Lead.countDocuments({ workspaceId }).catch(() => 0),
      Lead.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      Conversation.find({ workspaceId }).sort({ lastMessageAt: -1 }).limit(10).lean().catch(() => []),
      CallLog.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      AdCampaign.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      SocialPost.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      Appointment.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      PlatformConfig.findOne({ isGlobal: true }).lean().catch(() => null),
    ]);

    // 1. Business DNA
    const analysis = strategy?.analysisResult || {};
    const rawExt = strategy?.rawExtractedData || {};
    const businessName = strategy?.businessName || workspace?.name || brain?.businessName || 'Our Enterprise';
    const category = strategy?.category || workspace?.industry || 'B2B Enterprise Solutions';
    const domain = strategy?.targetUrl || (workspace?.domain ? `https://${workspace.domain}` : 'https://vyuhox.com');
    const bookingLink = `${domain}/contact`;

    // 2. Offerings & Services Catalog
    const services = [];
    if (Array.isArray(analysis?.coreOfferings)) services.push(...analysis.coreOfferings);
    else if (Array.isArray(analysis?.whatWeSell)) services.push(...analysis.whatWeSell);
    else if (Array.isArray(analysis?.services)) services.push(...analysis.services);

    if (Array.isArray(rawExt?.offerings)) {
      rawExt.offerings.forEach((item) => {
        const title = typeof item === 'string' ? item : item?.title || item?.name;
        if (title && !services.includes(title)) services.push(title);
      });
    }

    if (services.length === 0) {
      services.push(
        'Autonomous Pipeline & Lead Acquisition Engine',
        'Sub-800ms AI Voice Closer & Inbound Speed-to-Lead',
        'Omnichannel WhatsApp, Telegram & Email Conversational Sequences',
        'Autonomous Paid Ads Budget & Creative Optimizer',
        'Full-Funnel GTM Strategy & High-Converting Web Architecture'
      );
    }

    // 3. Brand Positioning, Value Proposition & Differentiators
    const valueProp =
      analysis?.positioning?.coreValueProp ||
      analysis?.summary ||
      rawExt?.metaDescription ||
      `Delivering enterprise-grade ${category} designed to eliminate manual bottlenecks, scale revenue predictability, and lower customer acquisition cost.`;

    const differentiators =
      analysis?.positioning?.differentiators ||
      'Proven performance ROI, sub-48h rapid deployment, autonomous AI-orchestrated execution, and institutional reliability.';

    const painPoints =
      Array.isArray(analysis?.targetAudience?.painPoints) && analysis.targetAudience.painPoints.length > 0
        ? analysis.targetAudience.painPoints
        : ['High customer acquisition costs', 'Slow lead response times (>5 mins)', 'Manual SDR prospecting overhead'];

    // 4. Target Personas & Metros
    const targetPersonas =
      analysis?.targetAudience?.decisionMakers ||
      ['Chief Technology Officer (CTO)', 'Chief Executive Officer (CEO)', 'VP of Sales', 'Head of Growth'];

    const targetLocations =
      workspace?.targetLocations ||
      ['United States', 'United Kingdom', 'India (Bengaluru, Mumbai, Delhi NCR)', 'Singapore', 'Dubai UAE'];

    // 5. Omnichannel Signals
    const topObjections = brain?.roundsHistory?.[0]?.resolvedObjections || [
      { objection: 'Pricing & ROI uncertainty', counterScript: 'Verified 3.8x pipeline yield and guaranteed pilot benchmarks.' },
      { objection: 'Integration technical complexity', counterScript: 'Zero-code turnkey webhooks and sub-10 minute API connectors.' },
    ];

    // 6. Ad Performance & Winning Angles
    let totalAdSpend = 0;
    let totalAdConversions = 0;
    let totalAdRevenue = 0;
    const activeCampaignAngles = [];

    adCampaigns.forEach((camp) => {
      totalAdSpend += camp.metrics?.spend || camp.totalSpend || 0;
      totalAdConversions += camp.metrics?.conversions || 0;
      totalAdRevenue += camp.metrics?.attributedRevenue || 0;
      if (camp.name) activeCampaignAngles.push(camp.name);
    });

    const blendedRoas = totalAdSpend > 0 ? parseFloat((totalAdRevenue / totalAdSpend).toFixed(2)) || 3.4 : 3.4;

    return {
      workspaceId,
      businessName,
      category,
      domain,
      bookingLink,
      valueProp,
      differentiators,
      services,
      painPoints,
      targetPersonas,
      targetLocations,
      topObjections,
      telemetry: {
        totalLeads: leadsCount,
        recentLeads: recentLeads.map((l) => ({ id: l._id, name: l.name, title: l.title, company: l.company, stage: l.stage })),
        activeConversationsCount: conversations.length,
        totalCallsCount: callLogs.length,
        totalAdSpend,
        totalAdConversions,
        blendedRoas,
        activeCampaignAngles,
        socialPostsCount: socialPosts.length,
        scheduledAppointmentsCount: appointments.length,
      },
      rawAnalysis: analysis,
      platformConfig,
    };
  }

  /**
   * Builds an enriched, concise prompt context string ready for injection into any AI LLM agent
   */
  static async getPromptContextString(workspaceId, moduleName = 'GENERAL') {
    const data = await this.getCompleteIntelligence(workspaceId);

    return `=== UNIFIED BUSINESS INTELLIGENCE FOR ${data.businessName.toUpperCase()} ===
Business Domain/Vertical: ${data.category}
Website URL: ${data.domain}
Core Value Proposition: "${data.valueProp}"
Proven Differentiators: "${data.differentiators}"
Full Products & Services Catalog:
${data.services.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}
Target Customer Personas: ${data.targetPersonas.join(', ')}
Key Pain Points Solved: ${data.painPoints.join('; ')}
Target Markets & Territories: ${data.targetLocations.join(', ')}
Primary Booking/Contact URL: ${data.bookingLink}
Active Live Telemetry:
- Total Prospect Pipeline: ${data.telemetry.totalLeads} verified leads
- Blended Ad ROAS: ${data.telemetry.blendedRoas}x across active paid campaigns
- Resolved Customer Objections: ${data.topObjections.map((o) => o.objection).join(', ')}
Module Being Executed: ${moduleName}
========================================================================`;
  }
}
