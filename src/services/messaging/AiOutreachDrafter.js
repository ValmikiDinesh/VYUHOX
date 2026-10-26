/**
 * AiOutreachDrafter.js
 * Autonomous AI Omnichannel Outreach & Deep Cross-Analysis Engine
 * 
 * CORE ARCHITECTURE:
 * 1. Deep Contact Analysis: Analyzes contact's name, role/title, seniority, company, industry, location,
 *    business model, requirements, trade details, and notes.
 * 2. Dashboard Owner Alignment: Cross-references against the owner's authentic business profile,
 *    core value proposition, differentiators, and services/product offerings catalog.
 * 3. Deeply Customized Synthesis: Synthesizes bespoke, consultative scripts matching the prospect's exact
 *    responsibilities and challenges with our specific offerings and measurable value.
 * 4. Human-in-the-Loop & Approval: Newly scraped leads are drafted and stored as AWAITING_APPROVAL.
 *    Messages are NOT dispatched automatically and are NOT fetched into Omnichannel automatically.
 * 5. Flexible Execution: Clients can review/edit/approve individually or execute 1-Click "Send All".
 * 6. Omnichannel Handshake: When approved & sent, OR when an inbound reply arrives, OR when dashboard
 *    owner clicks to chat with a lead, the lead is seamlessly brought into Omnichannel.
 */

import { Lead } from '../../models/Lead.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { GtmStrategy } from '../../models/GtmStrategy.js';
import { Workspace } from '../../models/Workspace.js';
import { BusinessBrain } from '../../models/BusinessBrain.js';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { WhatsAppService } from './WhatsAppService.js';
import { TelegramService } from './TelegramService.js';
import { SMSService } from './SMSService.js';
import { EmailSequenceService } from './EmailSequenceService.js';
import { dncComplianceService } from '../compliance/DNCComplianceService.js';

export class AiOutreachDrafter {
  /**
   * Extract Dashboard Owner's complete business intelligence & service catalog
   */
  static async extractOwnerCatalog(workspaceId) {
    let workspace = null;
    let strategy = null;
    let brain = null;

    try {
      workspace = await Workspace.findById(workspaceId).lean();
    } catch {}

    try {
      strategy = await GtmStrategy.findOne({ workspaceId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean();
      if (!strategy) {
        strategy = await GtmStrategy.findOne({ workspaceId }).sort({ createdAt: -1 }).lean();
      }
    } catch {}

    try {
      brain = await BusinessBrain.findOne({ workspaceId }).lean();
    } catch {}

    const rawExt = strategy?.rawExtractedData || {};
    const analysis = strategy?.analysisResult || {};

    const businessName = strategy?.businessName || workspace?.name || 'Our Company';
    const category = strategy?.category || workspace?.industry || 'B2B Enterprise Solutions';
    const websiteUrl = strategy?.targetUrl || (workspace?.domain ? `https://${workspace.domain}` : 'https://vyuhox.com');
    const bookingLink = `${websiteUrl}/contact`;

    // Extract all services and product offerings
    const serviceList = [];

    // From analysisResult.coreOfferings or whatWeSell
    if (Array.isArray(analysis?.coreOfferings) && analysis.coreOfferings.length > 0) {
      serviceList.push(...analysis.coreOfferings);
    } else if (Array.isArray(analysis?.whatWeSell) && analysis.whatWeSell.length > 0) {
      serviceList.push(...analysis.whatWeSell);
    } else if (Array.isArray(analysis?.services) && analysis.services.length > 0) {
      serviceList.push(...analysis.services);
    }

    // From rawExtractedData
    if (Array.isArray(rawExt?.offerings) && rawExt.offerings.length > 0) {
      rawExt.offerings.forEach((item) => {
        const title = typeof item === 'string' ? item : item?.title || item?.name;
        if (title && !serviceList.includes(title)) serviceList.push(title);
      });
    }

    // Default high-value offerings if none crawled yet
    if (serviceList.length === 0) {
      serviceList.push(
        'Autonomous Pipeline & Lead Acquisition Architecture',
        'Sub-800ms AI Voice Closer & Speed-to-Lead Automation',
        'Omnichannel WhatsApp & SMS Recovery Sequences',
        'B2B Enterprise Growth & Conversion Optimization',
        'Custom Web & AI Application Engineering'
      );
    }

    const valueProp =
      analysis?.positioning?.coreValueProp ||
      analysis?.summary ||
      rawExt?.metaDescription ||
      `Delivering specialized ${category} engineered to eliminate manual operational drag, accelerate pipeline velocity, and scale revenue predictability.`;

    const differentiators =
      analysis?.positioning?.differentiators ||
      'Proven ROI execution, sub-48h turnaround, AI-driven targeting, and enterprise-grade reliability.';

    const painPointsSolved =
      Array.isArray(analysis?.targetAudience?.painPoints) && analysis.targetAudience.painPoints.length > 0
        ? analysis.targetAudience.painPoints.join('; ')
        : 'High customer acquisition costs, slow lead response times, and manual prospecting friction.';

    return {
      businessName,
      category,
      websiteUrl,
      bookingLink,
      services: serviceList,
      valueProp,
      differentiators,
      painPointsSolved,
    };
  }

  /**
   * Drafts multi-channel copy for a single lead by deeply cross-examining:
   * - Prospect's exact role, title, seniority, business requirements, company, industry, and notes.
   * - Our company profile, core value proposition, differentiators, and matched service catalog.
   */
  static async draftForLead({ lead, catalog, customGoal = '' }) {
    const leadName = lead.name || 'Decision Maker';
    const firstName = leadName.split(' ')[0] || 'there';
    const company = lead.company || 'your organization';
    const title = lead.title || 'Executive Leader';
    const industry = lead.industry || 'Enterprise';
    const city = lead.city || lead.territory || lead.location || '';
    const notes = lead.notes || '';
    const tradeProducts = Array.isArray(lead.tradeDetails?.products) ? lead.tradeDetails.products.join(', ') : '';
    const entityRole = lead.entityRole || 'DECISION_MAKER';

    const bizName = catalog.businessName;
    const servicesStr = catalog.services.slice(0, 8).join(', ');
    const valueProp = catalog.valueProp;
    const painPoints = catalog.painPointsSolved;
    const calLink = catalog.bookingLink;

    // AI LLM Synthesis with rich contextual cross-examination
    try {
      const prompt = `You are the Senior Enterprise Strategic Partner representing ${bizName}.
YOUR COMPANY (DASHBOARD OWNER) PROFILE:
- Business Name: ${bizName}
- Industry/Domain: ${catalog.category}
- Full Services & Products Catalog: ${servicesStr}
- Core Value Proposition: "${valueProp}"
- Proven Differentiators: "${catalog.differentiators}"
- Common Pain Points Solved: "${painPoints}"

PROSPECT (CONTACT DATA):
- Full Name: ${leadName} (First Name: ${firstName})
- Exact Role / Job Title: ${title}
- Target Company: ${company}
- Vertical / Industry: ${industry}
${city ? `- Location / Region: ${city}` : ''}
${entityRole && entityRole !== 'UNSPECIFIED' ? `- Trade / Business Role: ${entityRole}` : ''}
${tradeProducts ? `- Specific Products / Requirements: ${tradeProducts}` : ''}
${notes ? `- Context / Intelligence Notes: ${notes}` : ''}
${customGoal ? `CAMPAIGN GOAL / SPECIAL OFFER: "${customGoal}"` : ''}

CRITICAL RULES:
1. DO NOT write generic templates like "I hope this finds you well" or just insert their name into a boilerplate message.
2. The entire message MUST be customized based on their specific role (${title}), what their company does (${company}), and how our specific services (${servicesStr}) solve their day-to-day operational or revenue challenges.
3. If they are in Engineering/Tech (CTO, VP Eng, CISO), highlight technical velocity, architecture, security, and scalability.
4. If they are Executive/Founder/CEO, highlight unit economics, CAC reduction, and pipeline predictability.
5. If they are Sales/Marketing (CRO, CMO, VP Sales), highlight speed-to-lead, conversions, and pipeline throughput.
6. If they are Procurement/Buyer, highlight delivery speed, supply reliability, and volume margins.
7. Include our specific services by name and propose a crisp, low-friction next step (e.g. 10-minute briefing or calendar sync).

Output STRICT JSON only:
{
  "emailSubject": "Compelling subject line (< 7 words) specifically linking ${company}'s ${title} priorities with our solution",
  "emailBody": "3-paragraph consultative outbound email: Paragraph 1 connects with ${leadName}'s specific responsibilities as ${title} at ${company}. Paragraph 2 explains in detail how our specific offerings (${servicesStr}) solve their exact bottlenecks. Paragraph 3 proposes a low-friction 10-min briefing.",
  "whatsapp": "High-converting, friendly WhatsApp message (< 70 words) with professional emojis, referencing ${company}, ${title}, our matching services, and a direct link to sync.",
  "telegram": "Crisp executive Telegram brief (< 55 words) highlighting concrete ROI and tailored services for ${company}.",
  "sms": "Concise mobile SMS (< 155 chars) with direct value hook and quick reply request."
}`;

      const llmRes = await LlmGatewayService.execute({
        prompt,
        systemInstruction: `You are an elite enterprise B2B sales strategist for ${bizName}. Every message you draft must be deeply tailored to the recipient's role, company, and our exact service capabilities. Respond with valid JSON only.`,
        jsonResponse: true,
        timeoutMs: 4500,
      });

      if (llmRes && llmRes.data) {
        let parsed = null;
        try {
          parsed = typeof llmRes.data === 'string' ? JSON.parse(llmRes.data) : llmRes.data;
        } catch {}

        if (parsed && (parsed.emailBody || parsed.whatsapp)) {
          return {
            EMAIL: {
              subject: parsed.emailSubject || `Accelerating ${company}'s Growth with ${catalog.services[0] || 'Tailored Strategy'}`,
              body: parsed.emailBody,
            },
            WHATSAPP: {
              body: parsed.whatsapp,
            },
            TELEGRAM: {
              body: parsed.telegram || `Hi ${firstName}, reaching out from ${bizName}. We deliver specialized ${servicesStr.slice(0, 60)} engineered for teams like ${company}. Would love to share our execution framework: ${calLink}`,
            },
            SMS: {
              body: parsed.sms || `Hi ${firstName}, ${bizName} delivers ${catalog.services[0] || 'growth solutions'} tailored for ${company}. Worth a brief sync? ${calLink}`,
            },
          };
        }
      }
    } catch (llmErr) {
      console.warn('[AiOutreachDrafter] LLM cascade note:', llmErr.message);
    }

    // Role-Aware, Deeply Customized Fallback Synthesis
    const topService1 = catalog.services[0] || 'Autonomous Pipeline Engineering';
    const topService2 = catalog.services[1] || 'Conversational Closer Automation';
    const topService3 = catalog.services[2] || 'Full-Funnel Omnichannel Execution';

    const lowerTitle = title.toLowerCase();
    const isTech = /cto|tech|engineer|architect|ciso|developer|infra|cloud/i.test(lowerTitle);
    const isExec = /ceo|founder|owner|managing director|president|partner/i.test(lowerTitle);
    const isSales = /sales|cro|revenue|marketing|cmo|growth|business development|bdr|sdr/i.test(lowerTitle);
    const isBuyer = /buyer|procurement|supply|sourcing|merchandise|logistics/i.test(lowerTitle);

    let roleHook = `accelerating strategic expansion and driving revenue efficiency at ${company}`;
    let roleFocus = `streamline operations, eliminate manual bottlenecks, and scale output`;

    if (isTech) {
      roleHook = `architecting high-reliability systems and optimizing technical infrastructure at ${company}`;
      roleFocus = `automate pipeline workflows, ensure enterprise-grade uptime, and accelerate delivery velocity`;
    } else if (isExec) {
      roleHook = `scaling ${company}'s enterprise valuation, reducing customer acquisition costs, and establishing predictable growth`;
      roleFocus = `unlock measurable revenue throughput while keeping headcount lean and overhead controlled`;
    } else if (isSales) {
      roleHook = `driving pipeline velocity, elevating lead-to-opportunity conversion rates, and scaling sales outreach at ${company}`;
      roleFocus = `engage target accounts with sub-minute responsiveness and consistently book high-intent meetings`;
    } else if (isBuyer) {
      roleHook = `optimizing vendor sourcing, procurement cycles, and supply chain margins for ${company}`;
      roleFocus = `ensure guaranteed fulfillment quality, transparent pricing benchmarks, and frictionless procurement`;
    }

    return {
      EMAIL: {
        subject: `${company}: Strategic ${topService1} Framework for ${title}`,
        body: `Hi ${firstName},\n\nI have been closely following ${company}'s footprint in ${industry} and noticed your strategic focus as ${title} on ${roleHook}${city ? ` in ${city}` : ''}.\n\nAt ${bizName}, we deliver end-to-end ${catalog.category}, specifically specializing in ${topService1}, ${topService2}, and ${topService3}. Rather than generic outreach, we architect custom solutions designed to ${roleFocus}, directly mitigating ${painPoints.toLowerCase()}.\n\nWe recently mapped out how deploying our tailored ${topService1} framework at ${company} can generate immediate operational leverage and scale predictable outcomes. Would you be open to a 10-minute briefing this week to review our custom benchmarks?\n\nBest regards,\nGrowth Strategy Team • ${bizName}\nSchedule directly: ${calLink}`,
      },
      WHATSAPP: {
        body: `Hi ${firstName}! 👋 Reaching out from ${bizName}.\n\nWe noticed your leadership as ${title} at ${company}. We specialize in ${topService1} and ${topService2} for ${industry} teams looking to ${roleFocus}. 🚀\n\nOur clients see measurable pipeline acceleration while cutting manual overhead. Would you be open to a quick 5-minute sync this week on what we can build for ${company}?\n\nDirect slot: ${calLink}`,
      },
      TELEGRAM: {
        body: `Hey ${firstName}, reaching out from ${bizName}. We've structured a specialized ${topService1} framework tailored for your role as ${title} at ${company} to ${roleFocus}.\n\nReview our live capabilities here: ${calLink} — let me know if you would like a direct walkthrough!`,
      },
      SMS: {
        body: `Hi ${firstName}, ${bizName} structured a custom ${topService1.slice(0, 25)} model for ${company} to ${roleFocus.slice(0, 45)}. Quick 5-min sync? ${calLink}`,
      },
    };
  }

  /**
   * Drafts customized scripts for a batch of leads (or all un-drafted leads in a workspace).
   * NOTE: Does NOT send messages automatically.
   * NOTE: Does NOT create Conversation threads in Omnichannel automatically.
   * Stores the bespoke scripts in lead.metadata.outreachDrafts with status 'AWAITING_APPROVAL'.
   */
  static async draftScriptsForLeads(workspaceId, { leadIds = [], io = null } = {}) {
    if (!workspaceId) return { success: false, message: 'workspaceId is required' };

    const catalog = await this.extractOwnerCatalog(workspaceId);

    const query = { workspaceId };
    if (Array.isArray(leadIds) && leadIds.length > 0) {
      query._id = { $in: leadIds };
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    if (!leads || leads.length === 0) {
      return { success: true, count: 0, message: 'No leads found to draft scripts for' };
    }

    let draftedCount = 0;
    const draftedLeads = [];

    for (const lead of leads) {
      try {
        const drafts = await this.draftForLead({ lead, catalog });

        lead.metadata = {
          ...(lead.metadata || {}),
          outreachDrafts: drafts,
          outreachStatus: lead.stage === 'Contacted' ? 'SENT' : 'AWAITING_APPROVAL',
          draftedAt: new Date(),
          matchedServices: catalog.services.slice(0, 3),
        };

        // Keep stage as Prospect unless already Contacted/Qualified
        if (!lead.stage || lead.stage === 'Prospect') {
          lead.stage = 'Prospect';
        }

        await lead.save();
        draftedCount++;
        draftedLeads.push({ id: lead._id, name: lead.name, company: lead.company });
      } catch (leadErr) {
        console.warn(`[AiOutreachDrafter] Error drafting script for lead ${lead._id}:`, leadErr.message);
      }
    }

    if (io) {
      io.to(workspaceId.toString()).emit('leads:scripts_drafted', {
        workspaceId,
        count: draftedCount,
        leads: draftedLeads,
      });
    }

    return {
      success: true,
      count: draftedCount,
      message: `Created specialized, customized scripts for ${draftedCount} lead(s). Awaiting client review and approval.`,
    };
  }

  /**
   * Approves and sends an individual lead's customized message.
   * At this exact moment:
   * 1. The message is dispatched through the selected channel gateway.
   * 2. The Omnichannel Conversation thread is created/retrieved and fetched into Omnichannel.
   * 3. An outbound Message record is saved.
   * 4. The lead stage is updated to 'Contacted'.
   */
  static async approveAndSendLead({
    workspaceId,
    leadId,
    channel = 'AUTO',
    customText = '',
    subject = '',
    senderName = '',
    io = null,
  }) {
    if (!workspaceId || !leadId) throw new Error('workspaceId and leadId are required');

    const lead = await Lead.findOne({ _id: leadId, workspaceId });
    if (!lead) throw new Error('Lead not found');

    const catalog = await this.extractOwnerCatalog(workspaceId);

    // Resolve drafts or generate if missing
    let drafts = lead.metadata?.outreachDrafts;
    if (!drafts || !drafts.EMAIL) {
      drafts = await this.draftForLead({ lead, catalog });
      lead.metadata = { ...(lead.metadata || {}), outreachDrafts: drafts };
    }

    // Determine target channel
    let targetChannel = (channel || 'AUTO').toUpperCase();
    if (targetChannel === 'AUTO') {
      if (lead.channels?.whatsapp || (lead.phone && !lead.phone.includes('@'))) {
        targetChannel = 'WHATSAPP';
      } else if (lead.email) {
        targetChannel = 'EMAIL';
      } else if (lead.channels?.telegram) {
        targetChannel = 'TELEGRAM';
      } else {
        targetChannel = 'WHATSAPP';
      }
    }

    // Determine message text and email subject
    let textToSend = customText ? customText.trim() : '';
    let emailSubject = subject || drafts.EMAIL?.subject || `Partnership with ${lead.company || 'your team'}`;

    if (!textToSend) {
      if (targetChannel === 'EMAIL') {
        textToSend = drafts.EMAIL?.body || drafts.WHATSAPP?.body || '';
      } else if (targetChannel === 'WHATSAPP') {
        textToSend = drafts.WHATSAPP?.body || drafts.EMAIL?.body || '';
      } else if (targetChannel === 'TELEGRAM') {
        textToSend = drafts.TELEGRAM?.body || drafts.WHATSAPP?.body || '';
      } else {
        textToSend = drafts.SMS?.body || drafts.WHATSAPP?.body || '';
      }
    }

    // DNC compliance check
    const dncCheck = await dncComplianceService.isBlacklisted({
      workspaceId,
      phone: lead.phone,
      email: lead.email,
    });
    if (dncCheck.blacklisted) {
      throw new Error(`Outbound message blocked: Contact is on the Universal DNC Registry (${dncCheck.reason})`);
    }

    // 1. Dispatch through appropriate gateway
    let dispatchResult = null;
    switch (targetChannel) {
      case 'WHATSAPP':
        dispatchResult = await WhatsAppService.sendMessage({
          to: lead.phone || '+1 (555) 019-2831',
          content: textToSend,
        });
        break;

      case 'TELEGRAM':
        dispatchResult = await TelegramService.sendMessage({
          chatId: lead.channels?.telegram || `@${(lead.name || 'lead').toLowerCase().replace(/\s+/g, '_')}`,
          content: textToSend,
        });
        break;

      case 'SMS':
        dispatchResult = await SMSService.sendMessage({
          to: lead.phone || '+1 (555) 019-2831',
          content: textToSend,
        });
        break;

      case 'EMAIL':
        dispatchResult = await EmailSequenceService.sendEmail({
          to: lead.email || 'contact@prospect.com',
          subject: emailSubject,
          bodyHtml: `<p>${textToSend.replace(/\n/g, '<br/>')}</p>`,
        });
        break;

      default:
        dispatchResult = { success: true, status: 'SENT', channel: targetChannel };
    }

    // 2. Fetch/Create Conversation thread into Omnichannel at send time
    let conv = await Conversation.findOne({ workspaceId, leadId: lead._id });
    const snippet = targetChannel === 'EMAIL' ? `Subject: ${emailSubject} — ${textToSend}` : textToSend;

    if (!conv) {
      conv = await Conversation.create({
        workspaceId,
        leadId: lead._id,
        activeChannel: targetChannel,
        lastMessageSnippet: snippet.substring(0, 100),
        lastMessageAt: new Date(),
        unreadCount: 0,
        sentiment: 'NEUTRAL',
        aiSummary: `Tailored outreach sent to ${lead.name} (${lead.title || 'Decision Maker'}) at ${lead.company}`,
        aiDrafts: drafts,
      });
    } else {
      conv.activeChannel = targetChannel;
      conv.lastMessageSnippet = snippet.substring(0, 100);
      conv.lastMessageAt = new Date();
      conv.aiDrafts = drafts;
      await conv.save();
    }

    // 3. Save Outbound Message
    const sentMsg = await Message.create({
      conversationId: conv._id,
      workspaceId,
      leadId: lead._id,
      direction: 'OUTBOUND',
      channel: targetChannel,
      senderName: senderName || `${catalog.businessName} Representative`,
      content: targetChannel === 'EMAIL' ? `Subject: ${emailSubject}\n\n${textToSend}` : textToSend,
      status: dispatchResult?.status || 'DELIVERED',
      metadata: {
        clientApproved: true,
        matchedServices: catalog.services.slice(0, 3),
        provider: dispatchResult?.provider || 'GATEWAY',
      },
    });

    // 4. Update Lead Pipeline Stage
    lead.stage = 'Contacted';
    lead.status = 'CONTACTED';
    lead.lastContactedAt = new Date();
    lead.metadata = {
      ...(lead.metadata || {}),
      outreachStatus: 'SENT',
      lastSentChannel: targetChannel,
      lastSentAt: new Date(),
    };
    await lead.save();

    // 5. Real-time Socket.io Notification
    if (io) {
      const populatedConv = await Conversation.findById(conv._id).populate('leadId').lean();
      io.to(workspaceId.toString()).emit('message:sent', {
        message: sentMsg,
        conversation: populatedConv,
      });
      io.to(workspaceId.toString()).emit('conversation:updated', {
        conversation: populatedConv,
      });
      io.to(workspaceId.toString()).emit('leadStageChanged', {
        leadId: lead._id,
        stage: 'Contacted',
        score: lead.score,
      });
    }

    return {
      success: true,
      lead,
      conversation: conv,
      message: sentMsg,
      dispatchResult,
    };
  }

  /**
   * 1-Click Approve and Send All pending/selected leads at once.
   * Dispatches customized scripts, updates leads to Contacted, and brings them into Omnichannel.
   */
  static async approveAndSendAllLeads({
    workspaceId,
    leadIds = [],
    channel = 'AUTO',
    io = null,
  }) {
    if (!workspaceId) throw new Error('workspaceId is required');

    const query = { workspaceId };
    if (Array.isArray(leadIds) && leadIds.length > 0) {
      query._id = { $in: leadIds };
    } else {
      // Send to all prospects awaiting approval
      query.stage = { $in: ['Prospect', 'Contacted'] };
      query['metadata.outreachStatus'] = { $ne: 'SENT' };
    }

    const leads = await Lead.find(query);
    if (!leads || leads.length === 0) {
      return { success: true, count: 0, message: 'No pending leads awaiting approval to send' };
    }

    let sentCount = 0;
    const errors = [];
    const sentList = [];

    for (const lead of leads) {
      try {
        const res = await this.approveAndSendLead({
          workspaceId,
          leadId: lead._id,
          channel,
          io,
        });
        if (res.success) {
          sentCount++;
          sentList.push({ leadId: lead._id, name: lead.name, company: lead.company });
        }
      } catch (err) {
        errors.push({ leadId: lead._id, name: lead.name, error: err.message });
      }
    }

    return {
      success: true,
      sentCount,
      totalTargeted: leads.length,
      errorsCount: errors.length,
      sentList,
      errors,
      message: `Successfully approved and dispatched customized messages to ${sentCount} lead(s) in one click.`,
    };
  }

  /**
   * Backwards-compatible bulk dispatch method
   */
  static async bulkDispatchToLeads({ workspaceId, leadIds = [], channel = 'AUTO', customPrompt = '', io = null }) {
    return this.approveAndSendAllLeads({ workspaceId, leadIds, channel, io });
  }

  /**
   * Backwards-compatible sync method - now aliases to non-auto-dispatch drafting
   */
  static async syncAndDraftAllLeads(workspaceId, { autoDispatch = false, io = null } = {}) {
    if (autoDispatch) {
      // If caller requested autoDispatch, use approveAndSendAllLeads
      return this.approveAndSendAllLeads({ workspaceId, io });
    }
    return this.draftScriptsForLeads(workspaceId, { io });
  }
}
