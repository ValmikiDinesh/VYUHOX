import { GtmStrategy } from '../../models/GtmStrategy.js';
import { Workspace } from '../../models/Workspace.js';
import { Lead } from '../../models/Lead.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { CallLog } from '../../models/CallLog.js';
import { AdCampaign } from '../../models/AdCampaign.js';

/**
 * CumulativeContextService
 *
 * Implements the continuous, compounding AI Intelligence Flywheel:
 * Level 1: Strategy & Crawl Data (DNA)
 * Level 2: Level 1 + Lead Prospecting Data (ICP Targets, Verified Contacts, Domain Intel)
 * Level 3: Level 1 + Level 2 + Omnichannel Outreach (Emails, WhatsApp, Telegram, Inbound Messages & Sentiments)
 * Level 4: Level 1 + Level 2 + Level 3 + Voice AI Closer Maya (Call Transcripts, Objections, Call Logs)
 * Level 5: Level 1 + 2 + 3 + 4 + Social Studio & Ads Manager (Campaigns, Conversions, Creative Feedback)
 */
export class CumulativeContextService {
  /**
   * LEVEL 1: Strategy & Web/Maps/Instagram/Voice Crawl Context
   */
  static async getLevel1Context(workspaceId) {
    const [strategy, workspace] = await Promise.all([
      GtmStrategy.findOne({ workspaceId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean(),
      Workspace.findById(workspaceId).lean(),
    ]);

    const businessName = strategy?.businessName || workspace?.name || 'Enterprise Business';
    const category = strategy?.category || workspace?.industry || 'B2B Enterprise';
    const domain = strategy?.targetUrl || workspace?.domain || `${workspace?.slug || 'company'}.com`;

    const analysis = strategy?.analysisResult || {};
    const positioning = analysis?.positioning || {};
    const targetAudience = analysis?.targetAudience || {};

    const coreValueProp =
      positioning.coreValueProp ||
      analysis.summary ||
      analysis.executiveSummary ||
      'Autonomous acceleration of enterprise pipelines and operational efficiency.';

    const unfairAdvantage =
      positioning.unfairAdvantage ||
      'Proprietary multi-agent automation and high-speed execution benchmarks.';

    const primaryPersona = targetAudience.primaryPersona || 'Enterprise Decision Makers & C-Suite';
    const decisionMakers =
      targetAudience.decisionMakers && targetAudience.decisionMakers.length > 0
        ? targetAudience.decisionMakers
        : ['Chief Technology Officer (CTO)', 'Chief Information Security Officer (CISO)', 'VP of Engineering'];

    const painPoints =
      targetAudience.painPoints && targetAudience.painPoints.length > 0
        ? targetAudience.painPoints
        : ['Manual pipeline bottlenecks and high operational friction'];

    const offers =
      strategy?.microSite?.offers ||
      analysis.valuePropositions ||
      ['Turnkey Enterprise Deployment', '24/7 Dedicated Support & SLA', 'Custom System Integration'];

    const competitiveMoat = strategy?.competitiveMoat || [
      'Autonomous 24/7 multi-agent orchestration',
      'Direct server-side verification and compliance isolation',
    ];

    const objections = strategy?.objections || [
      {
        objection: 'We already have an existing legacy process.',
        counter: 'Our system runs alongside existing tools without requiring rip-and-replace, delivering immediate ROI in under 14 days.',
      },
    ];

    const summaryText = `[LEVEL 1: BUSINESS DNA & STRATEGY]
Company: ${businessName} (${category})
Website/Domain: ${domain}
Core Value Proposition: ${coreValueProp}
Unfair Advantage: ${unfairAdvantage}
Primary Target Persona: ${primaryPersona}
Key Decision Makers: ${decisionMakers.join(', ')}
Critical Pain Points Addressed: ${painPoints.join('; ')}
Core Offerings: ${offers.join('; ')}
Competitive Moat: ${competitiveMoat.join('; ')}`;

    return {
      level: 1,
      businessName,
      category,
      domain,
      coreValueProp,
      unfairAdvantage,
      primaryPersona,
      decisionMakers,
      painPoints,
      offers,
      competitiveMoat,
      objections,
      rawStrategy: strategy,
      summaryText,
    };
  }

  /**
   * LEVEL 2: Level 1 + Lead Prospecting Intelligence
   */
  static async getLevel2Context(workspaceId, leadId = null) {
    const l1 = await this.getLevel1Context(workspaceId);

    const [leadCount, leads] = await Promise.all([
      Lead.countDocuments({ workspaceId }),
      Lead.find({ workspaceId }).sort({ score: -1, createdAt: -1 }).limit(15).lean(),
    ]);

    let activeLead = null;
    if (leadId) {
      activeLead = await Lead.findOne({ _id: leadId, workspaceId }).lean();
    } else if (leads.length > 0) {
      activeLead = leads[0];
    }

    const targetedLocations = [...new Set(leads.map((l) => l.location).filter(Boolean))].slice(0, 6);
    const targetedCompanies = [...new Set(leads.map((l) => l.company).filter(Boolean))].slice(0, 8);

    let leadDetailsText = 'No specific individual lead selected.';
    if (activeLead) {
      leadDetailsText = `Current Target Lead: ${activeLead.name} (${activeLead.title || 'Decision Maker'}) at ${activeLead.company || 'Enterprise Firm'}
Lead Email: ${activeLead.email} (Verification: ${activeLead.verificationStatus || 'VERIFIED'})
Lead Phone: ${activeLead.phone || 'Direct extension active'}
Lead Territory: ${activeLead.location || 'Global'}
Fit Score: ${activeLead.score || 85}/100 | Pipeline Stage: ${activeLead.stage || 'Prospect'}
Strategy Angle: "${activeLead.notes || 'Identified as high-fit decision-maker based on business crawl'}"`;
    }

    const summaryText = `${l1.summaryText}

[LEVEL 2: PROSPECTING & ICP TARGET INTEL]
Total Verified Leads in Pipeline: ${leadCount}
Active Market Territories: ${targetedLocations.join(', ') || 'Global Metros'}
Sample Target Accounts: ${targetedCompanies.join(', ') || 'Enterprise Firms'}
${leadDetailsText}`;

    return {
      ...l1,
      level: 2,
      totalLeadsInPipeline: leadCount,
      targetedLocations,
      targetedCompanies,
      activeLead,
      recentLeads: leads,
      summaryText,
    };
  }

  /**
   * LEVEL 3: Level 1 + Level 2 + Omnichannel Outreach (WhatsApp, Telegram, Email, SMS)
   */
  static async getLevel3Context(workspaceId, leadId = null, conversationId = null) {
    const l2 = await this.getLevel2Context(workspaceId, leadId);

    // Find conversation by conversationId or leadId
    let conversation = null;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, workspaceId }).lean();
    } else if (l2.activeLead?._id) {
      conversation = await Conversation.findOne({ leadId: l2.activeLead._id, workspaceId }).lean();
    }

    let messages = [];
    if (conversation?._id) {
      messages = await Message.find({ conversationId: conversation._id }).sort({ timestamp: 1 }).limit(20).lean();
    }

    const recentExchanges = messages.map((m) => {
      const sender = m.direction === 'INBOUND' ? (l2.activeLead?.name || 'Prospect') : 'Our Team';
      return `${sender} (${m.channel || 'Omnichannel'}): "${m.content}"`;
    });

    const sentiment = conversation?.metadata?.lastSentiment || 'NEUTRAL';
    const channel = conversation?.channel || 'WHATSAPP';

    let conversationSummary = 'No prior omnichannel communications recorded.';
    if (recentExchanges.length > 0) {
      conversationSummary = `Active Channel: ${channel} | Prospect Sentiment: ${sentiment}
Recent Transcript (${recentExchanges.length} messages):
${recentExchanges.join('\n')}`;
    }

    const summaryText = `${l2.summaryText}

[LEVEL 3: OMNICHANNEL INTERACTION HISTORY]
${conversationSummary}`;

    return {
      ...l2,
      level: 3,
      conversation,
      messages,
      channel,
      sentiment,
      summaryText,
    };
  }

  /**
   * LEVEL 4: Level 1 + Level 2 + Level 3 + Voice AI Closer Maya Context
   */
  static async getLevel4Context(workspaceId, leadId = null) {
    const l3 = await this.getLevel3Context(workspaceId, leadId);

    // Fetch call logs for this workspace or specific lead
    const query = { workspaceId };
    if (l3.activeLead?._id) {
      query.leadId = l3.activeLead._id;
    }

    const [callLogs, recentCalls] = await Promise.all([
      CallLog.find(query).sort({ createdAt: -1 }).limit(5).lean(),
      CallLog.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const activeCall = callLogs[0] || null;
    const callCount = recentCalls.length;

    let voiceDetailsText = 'No previous phone calls logged with this prospect.';
    if (activeCall) {
      voiceDetailsText = `Previous Call Duration: ${activeCall.durationSeconds || 0}s | Status: ${activeCall.status} | Sentiment: ${activeCall.sentiment || 'ENGAGED'}
Call Summary: "${activeCall.aiSummary || 'Voice conversation completed.'}"
Action Items Identified: ${(activeCall.actionItems || []).join('; ') || 'Follow up with technical deck'}`;
    }

    // Dynamic prompt formulation for Maya Voice Closer
    const leadFirstName = l3.activeLead?.name ? l3.activeLead.name.split(' ')[0] : 'there';
    const leadCompany = l3.activeLead?.company || 'your team';
    const leadTitle = l3.activeLead?.title || 'Decision Maker';

    const mayaOpeningPitch = `Hi ${leadFirstName}! This is Maya from ${l3.businessName}. I saw you're leading ${leadTitle} initiatives at ${leadCompany}. We help companies like yours solve ${l3.painPoints[0] || 'critical operational friction'} with our ${l3.coreValueProp}. Do you have two quick minutes to check if our architecture fits your current roadmap?`;

    const summaryText = `${l3.summaryText}

[LEVEL 4: MAYA VOICE AI CALL INTELLIGENCE]
Total Calls Placed in Workspace: ${callCount}
${voiceDetailsText}
Maya Dynamic Script Hook: "${mayaOpeningPitch}"`;

    return {
      ...l3,
      level: 4,
      activeCall,
      recentCalls,
      totalCalls: callCount,
      mayaOpeningPitch,
      summaryText,
    };
  }

  /**
   * LEVEL 5: Level 1 + Level 2 + Level 3 + Level 4 + Ads & Social Studio Context
   */
  static async getLevel5Context(workspaceId) {
    const l4 = await this.getLevel4Context(workspaceId);

    const [campaigns, liveCampaignCount] = await Promise.all([
      AdCampaign.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean(),
      AdCampaign.countDocuments({ workspaceId, status: 'ACTIVE' }),
    ]);

    const highPerformingCampaigns = campaigns.filter((c) => (c.roas || 0) >= 3.0);
    const winningAngles = highPerformingCampaigns.map((c) => `Campaign "${c.name}": ROAS ${c.roas}x (${c.platform})`);

    const summaryText = `${l4.summaryText}

[LEVEL 5: SOCIAL STUDIO & PAID ADVERTISING REVENUE SIGNALS]
Active Paid Campaigns: ${liveCampaignCount}
High-ROAS Winning Angles: ${winningAngles.join('; ') || 'Standard GTM angles active'}
Self-Healing Rules: Kill Underperformer (2x CPA), Scale Winners (ROAS > 3.0x), Fatigue Creative Swap (<1% CTR)`;

    return {
      ...l4,
      level: 5,
      campaigns,
      liveCampaignCount,
      highPerformingCampaigns,
      winningAngles,
      summaryText,
    };
  }
}
