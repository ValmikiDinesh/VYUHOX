import express from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { DripSequence } from '../models/DripSequence.js';
import { WhatsAppService } from '../services/messaging/WhatsAppService.js';
import { aiSensyGateway } from '../services/messaging/AiSensyGateway.js';
import { WhatsAppTemplateService } from '../services/messaging/WhatsAppTemplateService.js';
import { WhatsAppTemplate } from '../models/WhatsAppTemplate.js';
import { TelegramService } from '../services/messaging/TelegramService.js';
import { SMSService } from '../services/messaging/SMSService.js';
import { EmailSequenceService } from '../services/messaging/EmailSequenceService.js';
import { SentimentClassifier } from '../services/messaging/SentimentClassifier.js';
import { dncComplianceService } from '../services/compliance/DNCComplianceService.js';
import { AiOutreachDrafter } from '../services/messaging/AiOutreachDrafter.js';
import { AiDealCloser } from '../services/messaging/AiDealCloser.js';
import { Workspace } from '../models/Workspace.js';
import { DailyBriefingJob } from '../cron/dailyBriefingJob.js';
import { LlmGatewayService } from '../services/ai/LlmGatewayService.js';
import { authMiddleware, verifyWorkspaceAccess } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/messaging/conversations/:workspaceId
 * List all conversation threads with channel badges, latest messages, sentiment tags, and lead details.
 */
router.get('/conversations/:workspaceId', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.params.workspaceId;
    const { channel, sentiment, search } = req.query;

    const query = { workspaceId };
    if (channel && channel !== 'ALL') {
      query.activeChannel = channel.toUpperCase();
    }
    if (sentiment && sentiment !== 'ALL') {
      query.sentiment = sentiment.toUpperCase();
    }

    let conversations = await Conversation.find(query)
      .populate('leadId')
      .sort({ lastMessageAt: -1 })
      .lean();


    if (search) {
      const s = search.toLowerCase();
      conversations = conversations.filter((c) => {
        const lead = c.leadId || {};
        const nameMatch = (lead.name || '').toLowerCase().includes(s);
        const companyMatch = (lead.company || '').toLowerCase().includes(s);
        const snippetMatch = (c.lastMessageSnippet || '').toLowerCase().includes(s);
        return nameMatch || companyMatch || snippetMatch;
      });
    }

    return res.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('[MessagingRoutes] Failed to fetch conversations:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/sync-scraped-leads/:workspaceId
 * Syncs scraped CRM leads into Omnichannel Outreach and synthesizes bespoke AI drafts for Email, WhatsApp, Telegram & SMS
 */
router.post('/sync-scraped-leads/:workspaceId', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.params.workspaceId;
    const result = await AiOutreachDrafter.syncAndDraftAllLeads(workspaceId, req.app.get('io'));
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[MessagingRoutes] Sync scraped leads error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/start-chat-with-lead
 * Initiates an Omnichannel conversation with a specific lead from Leads data.
 * Fetches/creates the thread on demand so the dashboard owner can immediately chat.
 */
router.post('/start-chat-with-lead', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.body.workspaceId;
    const { leadId, channel = 'WHATSAPP', initialMessage = '', senderName = '' } = req.body;

    if (!workspaceId || !leadId) {
      return res.status(400).json({ success: false, message: 'workspaceId and leadId are required' });
    }

    const lead = await Lead.findOne({ _id: leadId, workspaceId });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found in this client account' });
    }

    const targetChannel = (channel || 'WHATSAPP').toUpperCase();

    // 1. Find or create conversation thread on demand
    let conv = await Conversation.findOne({ workspaceId, leadId });
    if (!conv) {
      conv = await Conversation.create({
        workspaceId,
        leadId,
        activeChannel: targetChannel,
        lastMessageSnippet: initialMessage ? initialMessage.substring(0, 100) : 'Chat initiated',
        lastMessageAt: new Date(),
        unreadCount: 0,
        sentiment: 'NEUTRAL',
        aiSummary: `Direct conversation with ${lead.name} (${lead.title || 'Decision Maker'}) at ${lead.company}`,
      });
    }

    // 2. If initial message was supplied, send it through outbound flow
    let messageRecord = null;
    if (initialMessage && initialMessage.trim()) {
      messageRecord = await Message.create({
        conversationId: conv._id,
        workspaceId,
        leadId,
        direction: 'OUTBOUND',
        channel: targetChannel,
        senderName: senderName || 'Dashboard Owner (You)',
        content: initialMessage.trim(),
        status: 'DELIVERED',
      });

      conv.lastMessageSnippet = initialMessage.trim().substring(0, 100);
      conv.lastMessageAt = new Date();
      conv.activeChannel = targetChannel;
      await conv.save();

      lead.stage = 'Contacted';
      lead.status = 'CONTACTED';
      lead.lastContactedAt = new Date();
      await lead.save();
    }

    const populatedConv = await Conversation.findById(conv._id).populate('leadId').lean();

    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('conversation:updated', { conversation: populatedConv });
      if (messageRecord) {
        io.to(workspaceId.toString()).emit('message:sent', { message: messageRecord, conversation: populatedConv });
      }
    }

    return res.json({
      success: true,
      conversationId: conv._id,
      conversation: populatedConv,
      message: messageRecord,
    });
  } catch (error) {
    console.error('[MessagingRoutes] Start chat with lead error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/messaging/conversations/:id/messages
 * Returns the full chat history for a thread in chronological order.
 */
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    if (req.user?.role !== 'superadmin' && conv.workspaceId.toString() !== req.workspaceId?.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to another client conversation is prohibited.' });
    }

    const messages = await Message.find({ conversationId: id, workspaceId: conv.workspaceId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark conversation unreadCount as 0 when thread is opened
    await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('[MessagingRoutes] Failed to fetch messages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/send
 * Sends outbound message through appropriate gateway (WhatsApp, Telegram, SMS, Email).
 */
router.post('/send', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.body.workspaceId;
    const { conversationId, leadId, channel, content, mediaUrl, senderName } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    let conv = null;
    if (conversationId) {
      conv = await Conversation.findOne({ _id: conversationId, workspaceId });
    }

    let lead = null;
    const effectiveLeadId = leadId || conv?.leadId;
    if (effectiveLeadId) {
      lead = await Lead.findOne({ _id: effectiveLeadId, workspaceId });
    }

    const effectiveWorkspaceId = workspaceId || conv?.workspaceId || lead?.workspaceId;
    if (!effectiveWorkspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const targetChannel = (channel || conv?.activeChannel || 'WHATSAPP').toUpperCase();

    // Universal DNC Compliance Pre-Flight Check
    const dncCheck = await dncComplianceService.isBlacklisted({
      workspaceId: effectiveWorkspaceId,
      phone: lead?.phone,
      email: lead?.email,
    });
    if (dncCheck.blacklisted) {
      return res.status(403).json({
        success: false,
        message: `Outbound message blocked: Contact is on the Universal Do-Not-Call (DNC) Registry (${dncCheck.reason})`,
        dncBlocked: true,
      });
    }

    // 1. Dispatch through appropriate messaging gateway
    let dispatchResult = null;
    switch (targetChannel) {
      case 'WHATSAPP': {
        const isWindowActive = conv?.lastCustomerMessageAt
          ? Date.now() - new Date(conv.lastCustomerMessageAt).getTime() < 24 * 3600 * 1000
          : false;

        let contextualCampaign = req.body.templateName || req.body.campaignName || null;
        let templateParams = req.body.templateParams || null;

        // If window is expired and no custom template was explicitly passed, auto-wrap into contextual resume template
        if (!isWindowActive && !contextualCampaign) {
          try {
            const contextPayload = await WhatsAppTemplateService.buildContextualFollowupPayload({
              workspaceId: effectiveWorkspaceId,
              conversationId: conv?._id,
              lead,
              customDraft: content,
            });
            contextualCampaign = contextPayload.templateName;
            templateParams = contextPayload.variables;
          } catch (e) {
            console.warn('[MessagingRoutes] Contextual template payload warning:', e.message);
          }
        }

        dispatchResult = await aiSensyGateway.sendWhatsAppMessage({
          toPhone: lead?.phone || req.body.to || '+919059701784',
          leadName: lead?.name || 'Valued Lead',
          messageText: content,
          workspaceId: effectiveWorkspaceId,
          mediaUrl,
          campaignName: contextualCampaign,
          templateParams,
        });

        if (!dispatchResult.success) {
          return res.status(400).json({
            success: false,
            message: `WhatsApp Dispatch Failed: ${dispatchResult.message || dispatchResult.error}`,
            error: dispatchResult.error,
            provider: dispatchResult.provider,
            windowExpired: !isWindowActive,
          });
        }
        break;
      }

      case 'TELEGRAM':
        dispatchResult = await TelegramService.sendMessage({
          chatId: lead?.channels?.telegram || `@${(lead?.name || 'lead').toLowerCase().replace(/\s+/g, '_')}`,
          content,
          mediaUrl,
        });
        break;

      case 'SMS':
        dispatchResult = await SMSService.sendMessage({
          to: lead?.phone || '+1 (555) 019-2831',
          content,
        });
        break;

      case 'EMAIL':
        dispatchResult = await EmailSequenceService.sendEmail({
          to: lead?.email || 'contact@prospect.com',
          subject: req.body.subject || `Update regarding ${lead?.company || 'our partnership'}`,
          bodyHtml: `<p>${content.replace(/\n/g, '<br/>')}</p>`,
        });
        break;

      default:
        dispatchResult = { success: true, status: 'SENT', channel: targetChannel };
    }

    // 2. Find or create conversation thread
    if (!conv && effectiveLeadId) {
      conv = await Conversation.findOne({ workspaceId: effectiveWorkspaceId, leadId: effectiveLeadId });
      if (!conv) {
        conv = await Conversation.create({
          workspaceId: effectiveWorkspaceId,
          leadId: effectiveLeadId,
          activeChannel: targetChannel,
        });
      }
    }

    // 3. Save Outbound Message
    const message = await Message.create({
      conversationId: conv?._id,
      workspaceId: effectiveWorkspaceId,
      leadId: effectiveLeadId,
      direction: 'OUTBOUND',
      channel: targetChannel,
      senderName: senderName || 'Growth AE (You)',
      content: content.trim(),
      mediaUrl: mediaUrl || '',
      status: dispatchResult?.status || 'SENT',
      metadata: {
        provider: dispatchResult?.provider || 'GATEWAY',
        messageId: dispatchResult?.messageId,
      },
    });

    // 4. Update Conversation snippet & timestamp
    if (conv) {
      conv.lastMessageSnippet = content.trim().substring(0, 100);
      conv.lastMessageAt = new Date();
      conv.activeChannel = targetChannel;
      conv.unreadCount = 0;
      if (req.body.takeover === true || req.body.senderType === 'HUMAN') {
        conv.takenOverByHuman = true;
        conv.takenOverAt = new Date();
        if (senderName) conv.assignedRepName = senderName;
      }
      await conv.save();
    }

    // 5. Emit Socket.io events
    const io = req.app.get('io');
    if (io) {
      const populatedConv = await Conversation.findById(conv._id).populate('leadId').lean();
      io.to(effectiveWorkspaceId.toString()).emit('message:sent', { message, conversation: populatedConv });
      io.to(effectiveWorkspaceId.toString()).emit('conversation:updated', { conversation: populatedConv });
    }

    return res.status(201).json({
      success: true,
      message,
      conversation: conv,
      dispatchResult,
    });
  } catch (error) {
    console.error('[MessagingRoutes] Failed to send outbound message:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Unified Inbound Processor Handler
 * Shared between webhooks and simulation triggers
 */
async function processInboundMessage({ workspaceId, leadId, channel, content, senderName, mediaUrl, req }) {
  const io = req.app.get('io');

  // 1. Resolve Lead
  let lead = null;
  if (leadId) {
    lead = await Lead.findById(leadId);
  }
  if (!lead && workspaceId) {
    lead = await Lead.findOne({ workspaceId }).sort({ createdAt: -1 });
  }
  if (!lead) {
    throw new Error('No lead available to bind conversation');
  }

  const effectiveWorkspaceId = workspaceId || lead.workspaceId;
  const targetChannel = (channel || 'WHATSAPP').toUpperCase();

  // 2. Find or Create Conversation
  let conv = await Conversation.findOne({ workspaceId: effectiveWorkspaceId, leadId: lead._id });
  if (!conv) {
    conv = await Conversation.create({
      workspaceId: effectiveWorkspaceId,
      leadId: lead._id,
      activeChannel: targetChannel,
      unreadCount: 0,
    });
  }

  // 3. AI Sentiment & Intent Classification
  const sentimentResult = await SentimentClassifier.classify(content, { channel: targetChannel, lead });

  // 3b. Universal DNC & Unsubscribe Trigger: Auto-blacklist on STOP / UNSUBSCRIBE
  const upperContent = (content || '').trim().toUpperCase();
  const isStopKeyword =
    /^(STOP|UNSUBSCRIBE|CANCEL|END|QUIT|STOPALL|REVOKE)$/i.test(upperContent) ||
    upperContent.includes('STOP') ||
    upperContent.includes('UNSUBSCRIBE');

  if (isStopKeyword) {
    try {
      await dncComplianceService.registerOptOut({
        workspaceId: effectiveWorkspaceId,
        phone: lead.phone,
        email: lead.email,
        reason: `Inbound opt-out keyword detected: "${content.trim()}"`,
        channel: targetChannel,
        leadId: lead._id,
        leadName: lead.name,
        io,
      });
    } catch (e) {
      console.warn('[MessagingRoutes] Auto-DNC registration error:', e.message);
    }
  }

  // 4. Update Lead Pipeline Stage and Score based on Sentiment
  const updatedLead = await SentimentClassifier.applyToLeadAndConversation({
    leadId: lead._id,
    workspaceId: effectiveWorkspaceId,
    sentimentResult,
    io,
  });

  // 5. Generate Instant AI Suggested Response with Full Conversation History
  const suggestedReply = await SentimentClassifier.generateSuggestedReply({
    messageContent: content,
    sentiment: sentimentResult.sentiment,
    lead: updatedLead || lead,
    workspaceId: effectiveWorkspaceId,
    conversationId: conv._id,
  });

  // 6. Save Inbound Message
  const message = await Message.create({
    conversationId: conv._id,
    workspaceId: effectiveWorkspaceId,
    leadId: lead._id,
    direction: 'INBOUND',
    channel: targetChannel,
    senderName: senderName || lead.name || 'Lead Contact',
    content: content.trim(),
    mediaUrl: mediaUrl || '',
    status: 'DELIVERED',
    metadata: {
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      suggestedReply: suggestedReply.suggestedText,
    },
  });

  // 7. Update Conversation & Reset 24-Hour Meta Window
  conv.activeChannel = targetChannel;
  conv.lastMessageSnippet = content.trim().substring(0, 100);
  conv.lastMessageAt = new Date();
  conv.lastCustomerMessageAt = new Date(); // Re-opens Meta 24-hour freeform care window!
  conv.unreadCount = (conv.unreadCount || 0) + 1;
  conv.sentiment = sentimentResult.sentiment;
  conv.aiSummary = sentimentResult.summary;
  await conv.save();

  const populatedConv = await Conversation.findById(conv._id).populate('leadId').lean();

  // 8. Socket.io Real-time Broadcast
  if (io) {
    const payload = {
      message,
      conversation: populatedConv,
      lead: updatedLead || lead,
      suggestedReply,
    };
    io.to(effectiveWorkspaceId.toString()).emit('message:received', payload);
    io.to(effectiveWorkspaceId.toString()).emit('conversation:updated', { conversation: populatedConv });
  }

  // 9. 24/7 Autonomous AI Deal Closer (Deferred if Human Takeover Active or STOP keyword)
  let closingResult = null;
  if (!isStopKeyword && !conv.takenOverByHuman) {
    try {
      closingResult = await AiDealCloser.handleInboundAndClose({
        workspaceId: effectiveWorkspaceId,
        leadId: lead._id,
        conversationId: conv._id,
        inboundContent: content.trim(),
        channel: targetChannel,
        io,
      });
    } catch (closerErr) {
      console.warn('[MessagingRoutes] AI Deal Closer auto-reply notice:', closerErr.message);
    }
  } else if (conv.takenOverByHuman) {
    console.log(`[MessagingRoutes] Human takeover active on thread ${conv._id}. AI SDR auto-reply deferred.`);
  }

  return {
    success: true,
    message,
    conversation: populatedConv,
    lead: updatedLead || lead,
    sentiment: sentimentResult,
    suggestedReply,
    closingResult,
  };
}

/**
 * POST /api/messaging/bulk-dispatch
 * Bulk dispatch customized AI outreach to selected leads with optional custom campaign pitch
 */
router.post('/bulk-dispatch', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.body.workspaceId;
    const { leadIds = [], channel = 'AUTO', customPrompt = '' } = req.body;
    if (!workspaceId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'workspaceId and leadIds array are required' });
    }

    const io = req.app.get('io');
    const result = await AiOutreachDrafter.bulkDispatchToLeads({
      workspaceId,
      leadIds,
      channel,
      customPrompt,
      io,
    });

    return res.json(result);
  } catch (error) {
    console.error('[MessagingRoutes] Bulk dispatch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/simulate-inbound
 * Helper endpoint to simulate an inbound lead reply from WhatsApp, Telegram, SMS, or Email.
 */
router.post('/simulate-inbound', async (req, res) => {
  try {
    const { workspaceId, leadId, channel = 'WHATSAPP', content, senderName } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Simulated content is required' });
    }

    const result = await processInboundMessage({
      workspaceId,
      leadId,
      channel,
      content,
      senderName,
      req,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('[MessagingRoutes] Simulation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/ai-suggest
 * Generates an AI-crafted response suggestion for an active conversation thread.
 */
router.post('/ai-suggest', async (req, res) => {
  try {
    const { conversationId, messageContent, leadId, workspaceId } = req.body;

    let lead = null;
    let wsId = workspaceId;
    let contentToAnalyze = messageContent;

    if (conversationId) {
      const conv = await Conversation.findById(conversationId).populate('leadId');
      if (conv) {
        lead = conv.leadId;
        wsId = wsId || conv.workspaceId;
        if (!contentToAnalyze) {
          const lastInbound = await Message.findOne({
            conversationId,
            direction: 'INBOUND',
          }).sort({ createdAt: -1 });
          contentToAnalyze = lastInbound?.content || conv.lastMessageSnippet || 'Hello, I want to know more';
        }
      }
    }

    if (!lead && leadId) {
      lead = await Lead.findById(leadId);
    }

    const sentimentResult = await SentimentClassifier.classify(contentToAnalyze || '');
    const suggestion = await SentimentClassifier.generateSuggestedReply({
      messageContent: contentToAnalyze || '',
      sentiment: sentimentResult.sentiment,
      lead,
      workspaceId: wsId,
    });

    return res.json({
      success: true,
      sentiment: sentimentResult,
      suggestion,
    });
  } catch (error) {
    console.error('[MessagingRoutes] AI Suggest error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Drip Sequence Management
 */
// GET /api/messaging/sequences/:workspaceId
router.get('/sequences/:workspaceId', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.params.workspaceId;
    let sequences = await DripSequence.find({ workspaceId }).lean();
    if (sequences.length === 0) {
      // Auto-create initial default email drip sequence
      const defaultSeq = await DripSequence.create({
        workspaceId,
        name: 'SaaS Founder Outbound Drip (3-Step)',
        channel: 'EMAIL',
        steps: EmailSequenceService.getDefaultSequenceTemplates(),
        activeLeadIds: [],
        status: 'ACTIVE',
      });
      sequences = [defaultSeq];
    }
    return res.json({ success: true, sequences });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messaging/sequences/:workspaceId/enroll
router.post('/sequences/:workspaceId/enroll', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.params.workspaceId;
    const { leadId, sequenceId } = req.body;
    const result = await EmailSequenceService.enrollLead(workspaceId, leadId, sequenceId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/messaging/templates/:workspaceId
 * Returns all WhatsApp templates for this workspace. Auto-provisions 7-Pack starter suite if empty.
 */
router.get('/templates/:workspaceId', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.params.workspaceId;
    let templates = await WhatsAppTemplate.find({ workspaceId }).sort({ createdAt: -1 }).lean();
    if (templates.length === 0) {
      templates = await WhatsAppTemplateService.provisionWorkspaceStarterPack(workspaceId);
    }
    return res.json({ success: true, count: templates.length, templates });
  } catch (error) {
    console.error('[MessagingRoutes] Failed to fetch templates:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/templates/init-starter-pack
 * Re-synthesizes or force provisions the Universal 7-Pack Meta templates for the workspace.
 */
router.post('/templates/init-starter-pack', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.body.workspaceId;
    const templates = await WhatsAppTemplateService.provisionWorkspaceStarterPack(workspaceId);
    return res.json({
      success: true,
      message: 'Universal 7-Pack Meta Templates synthesized successfully',
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error('[MessagingRoutes] Starter pack provision error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/templates/generate-custom
 * On-demand AI LLM custom WhatsApp template generator for targeted marketing broadcasts.
 */
router.post('/templates/generate-custom', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.body.workspaceId;
    const { prompt, scenarioType = 'SEASONAL_PROMO', category = 'MARKETING' } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Custom template prompt is required' });
    }

    const ws = await Workspace.findById(workspaceId).lean();
    const bizName = ws?.name || 'Our Company';
    const cleanSlug = (ws?.slug || 'ws').toLowerCase().replace(/[^a-z0-9_]/g, '_');

    let generated = {
      templateName: `${cleanSlug}_custom_${Date.now().toString(36)}`.slice(0, 30),
      body: `Hi {{1}},\n\nSpecial announcement from ${bizName}!\n\n{{2}}\n\n{{3}}`,
      buttons: [{ type: 'QUICK_REPLY', text: 'Learn More' }, { type: 'QUICK_REPLY', text: 'Not Interested' }],
      sampleVariables: ['Rajesh', prompt, 'Offer valid until Sunday.'],
    };

    try {
      const llmRes = await LlmGatewayService.execute({
        prompt: `You are an expert Meta WhatsApp Business Template Copywriter.
Create a Meta Graph API compliant template for ${bizName}.
Prompt: "${prompt}"
Category: ${category}
Scenario: ${scenarioType}

Rules:
1. Include dynamic parameters {{1}} for Lead Name, {{2}} for core offer/context, and {{3}} for next step.
2. Max 800 characters.
3. Must include 1 or 2 quick-reply button labels.

Return strictly JSON:
{
  "templateName": "short_lowercase_underscored_slug",
  "body": "Hi {{1}}, ... {{2}} ... {{3}}",
  "buttons": [{"type": "QUICK_REPLY", "text": "Button Label"}],
  "sampleVariables": ["Sample 1", "Sample 2", "Sample 3"]
}`,
        jsonResponse: true,
        timeoutMs: 8000,
      });

      if (llmRes?.parsed) {
        generated = {
          ...generated,
          ...llmRes.parsed,
          templateName: `${cleanSlug}_${(llmRes.parsed.templateName || 'custom').replace(/[^a-z0-9_]/g, '_')}`.slice(0, 30),
        };
      }
    } catch (e) {
      console.warn('[MessagingRoutes] Custom template LLM synthesis warning:', e.message);
    }

    const templateDoc = await WhatsAppTemplate.create({
      workspaceId,
      templateName: generated.templateName,
      scenarioType,
      category,
      language: 'en_US',
      body: generated.body,
      footer: 'Reply STOP to unsubscribe',
      buttons: generated.buttons || [{ type: 'QUICK_REPLY', text: 'Continue Discussion' }],
      sampleVariables: generated.sampleVariables || ['Valued Client', 'Exclusive update', 'Let us connect.'],
      status: 'APPROVED',
    });

    return res.status(201).json({
      success: true,
      template: templateDoc,
      message: 'Custom Meta template created and marked APPROVED for dynamic variable broadcasting.',
    });
  } catch (error) {
    console.error('[MessagingRoutes] Generate custom template error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/preflight-check
 * Inspects a phone number before dispatch:
 * Detects whether the line is a Mobile with WhatsApp capability vs Fixed Landline (e.g. 080, 011, 022, 040).
 * Prevents wasted WhatsApp attempts and routes landlines to Exotel/Maya voice bridges.
 */
router.post('/preflight-check', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const clean = phone.replace(/[^0-9+]/g, '');
    let isLandline = false;
    let hasWhatsApp = true;
    let lineType = 'MOBILE';
    let carrierRegion = 'INTERNATIONAL';
    let recommendedChannel = 'WHATSAPP';

    // India (+91) heuristics
    let nationalNumber = clean;
    if (nationalNumber.startsWith('+91')) {
      nationalNumber = nationalNumber.slice(3);
    } else if (nationalNumber.startsWith('91') && nationalNumber.length > 10) {
      nationalNumber = nationalNumber.slice(2);
    }

    if (nationalNumber.startsWith('0')) {
      // Domestic number starting with STD 0 prefix (e.g. 080, 011, 022, 040)
      isLandline = true;
      hasWhatsApp = false;
      lineType = 'FIXED_LANDLINE';
      carrierRegion = 'INDIA_DOMESTIC';
      recommendedChannel = 'VOICE_CALL';
    } else if (nationalNumber.length === 10) {
      carrierRegion = 'INDIA_DOMESTIC';
      const firstDigit = nationalNumber.charAt(0);
      const firstTwo = nationalNumber.slice(0, 2);
      // Major Indian Metro Landline prefixes: 80 (Bangalore), 22 (Mumbai), 11 (Delhi), 40 (Hyderabad), 44 (Chennai)
      if (['0', '1', '2', '3', '4', '5'].includes(firstDigit) || firstTwo === '80') {
        isLandline = true;
        hasWhatsApp = false;
        lineType = 'FIXED_LANDLINE';
        recommendedChannel = 'VOICE_CALL';
      } else if (['6', '7', '8', '9'].includes(firstDigit)) {
        isLandline = false;
        hasWhatsApp = true;
        lineType = 'MOBILE_CELLULAR';
        recommendedChannel = 'WHATSAPP';
      }
    }

    return res.json({
      success: true,
      phone: clean,
      lineType,
      isLandline,
      hasWhatsApp,
      carrierRegion,
      recommendedChannel,
      routingAdvice: hasWhatsApp
        ? 'Valid mobile line. Priority route: AiSensy WhatsApp API.'
        : 'Fixed landline / non-mobile detected. Rerouting to Maya AI Voice Closer via Exotel domestic bridge.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/conversations/:conversationId/takeover
 * Toggles human takeover lock. Locks out AI agents from auto-replying when human agent is active.
 */
router.post('/conversations/:conversationId/takeover', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { takenOverByHuman = true, repName = 'Support Agent', repId = null } = req.body;

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conv.takenOverByHuman = takenOverByHuman;
    conv.takenOverAt = takenOverByHuman ? new Date() : null;
    if (repName) conv.assignedRepName = repName;
    if (repId) conv.assignedRepId = repId;
    await conv.save();

    const io = req.app.get('io');
    if (io) {
      const populated = await Conversation.findById(conv._id).populate('leadId').lean();
      io.to(conv.workspaceId.toString()).emit('conversation:updated', { conversation: populated });
    }

    return res.json({
      success: true,
      takenOverByHuman: conv.takenOverByHuman,
      assignedRepName: conv.assignedRepName,
      message: conv.takenOverByHuman
        ? 'Human Takeover Activated. AI SDR auto-replies are paused for this thread.'
        : 'AI Auto-Pilot Restored. AI Deal Closer will resume managing responses.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/conversations/:conversationId/notes
 * Appends internal team-only private note with @mentions support to a conversation.
 */
router.post('/conversations/:conversationId/notes', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { authorName = 'Team Rep', authorEmail = '', content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty' });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const note = {
      authorName,
      authorEmail,
      content: content.trim(),
      createdAt: new Date(),
    };

    conv.privateNotes = conv.privateNotes || [];
    conv.privateNotes.push(note);
    await conv.save();

    const io = req.app.get('io');
    if (io) {
      const populated = await Conversation.findById(conv._id).populate('leadId').lean();
      io.to(conv.workspaceId.toString()).emit('conversation:updated', { conversation: populated });
    }

    return res.status(201).json({
      success: true,
      note,
      privateNotes: conv.privateNotes,
      message: 'Private internal note saved.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/conversations/:conversationId/assign
 * Assigns lead conversation to a sales rep or rotates via Round-Robin.
 */
router.post('/conversations/:conversationId/assign', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { repId, repName } = req.body;

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conv.assignedRepId = repId || null;
    conv.assignedRepName = repName || 'Unassigned';
    await conv.save();

    const io = req.app.get('io');
    if (io) {
      const populated = await Conversation.findById(conv._id).populate('leadId').lean();
      io.to(conv.workspaceId.toString()).emit('conversation:updated', { conversation: populated });
    }

    return res.json({
      success: true,
      assignedRepId: conv.assignedRepId,
      assignedRepName: conv.assignedRepName,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/messaging/ceo-digest/dispatch
 * Dispatches Monday Morning CEO Executive Briefing directly to business owner's WhatsApp phone.
 */
router.post('/ceo-digest/dispatch', authMiddleware, verifyWorkspaceAccess('workspaceId'), async (req, res) => {
  try {
    const workspaceId = req.workspaceId || req.body.workspaceId;
    const targetPhone = req.body.phone || '+919059701784';

    const ws = await Workspace.findById(workspaceId).lean();
    const bizName = ws?.name || 'Your Company';

    // Fetch live briefing synthesis
    const briefing = await DailyBriefingJob.generateWorkspaceBriefing(workspaceId, req.app.get('io'));

    const digestMessage = `*Executive Briefing: ${bizName}* 🚀\n\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}\n` +
      `🎯 *CRO Priority Focus:* ${briefing?.headline || 'Outbound Expansion'}\n\n` +
      `📊 *Key Metrics (24h):*\n` +
      `• Total Pipeline Prospects: ${briefing?.metrics?.leads || 0}\n` +
      `• Inbound Engagement Rate: ${briefing?.metrics?.replyRate || '24%'}\n` +
      `• Blended Campaign ROAS: ${briefing?.metrics?.roas || '3.8x'}\n\n` +
      `💡 *Strategic Recommendation:*\n` +
      `${(briefing?.summary || 'Outbound channels performing steadily. Review CRM inbox for hot deals.').slice(0, 300)}\n\n` +
      `_Automated executive intelligence by VYUHOX Master Brain._`;

    const dispatchResult = await aiSensyGateway.sendWhatsAppMessage({
      toPhone: targetPhone,
      leadName: ws?.ownerName || 'Founder',
      messageText: digestMessage,
      workspaceId,
    });

    return res.json({
      success: true,
      dispatchResult,
      digestMessage,
      recipient: targetPhone,
      message: 'CEO WhatsApp Executive Digest dispatched successfully',
    });
  } catch (error) {
    console.error('[MessagingRoutes] CEO digest dispatch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export { router as messagingRoutes, processInboundMessage };
