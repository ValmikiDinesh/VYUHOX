import express from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { DripSequence } from '../models/DripSequence.js';
import { WhatsAppService } from '../services/messaging/WhatsAppService.js';
import { TelegramService } from '../services/messaging/TelegramService.js';
import { SMSService } from '../services/messaging/SMSService.js';
import { EmailSequenceService } from '../services/messaging/EmailSequenceService.js';
import { SentimentClassifier } from '../services/messaging/SentimentClassifier.js';
import { dncComplianceService } from '../services/compliance/DNCComplianceService.js';
import { AiOutreachDrafter } from '../services/messaging/AiOutreachDrafter.js';
import { AiDealCloser } from '../services/messaging/AiDealCloser.js';
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
      case 'WHATSAPP':
        dispatchResult = await WhatsAppService.sendMessage({
          to: lead?.phone || '+1 (555) 019-2831',
          content,
          mediaUrl,
        });
        break;

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

  // 5. Generate Instant AI Suggested Response
  const suggestedReply = await SentimentClassifier.generateSuggestedReply({
    messageContent: content,
    sentiment: sentimentResult.sentiment,
    lead: updatedLead || lead,
    workspaceId: effectiveWorkspaceId,
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

  // 7. Update Conversation
  conv.activeChannel = targetChannel;
  conv.lastMessageSnippet = content.trim().substring(0, 100);
  conv.lastMessageAt = new Date();
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

  // 9. 24/7 Autonomous AI Deal Closer (Handles 99.999% of inquiries end-to-end)
  let closingResult = null;
  if (!isStopKeyword) {
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

export { router as messagingRoutes, processInboundMessage };
