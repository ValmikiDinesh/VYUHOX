import express from 'express';
import { processInboundMessage } from './messagingRoutes.js';
import { Lead } from '../models/Lead.js';
import { Workspace } from '../models/Workspace.js';
import { WhatsAppTemplate } from '../models/WhatsAppTemplate.js';

const router = express.Router();

/**
 * POST /api/webhooks/incoming
 * Unified webhook endpoint for incoming WhatsApp, Telegram, SMS, and Email events.
 * Accepts both normalized JSON and native provider webhooks (Twilio, Telegram, Resend).
 */
router.post('/incoming', async (req, res) => {
  try {
    const body = req.body || {};
    let channel = 'WHATSAPP';
    let content = '';
    let from = '';
    let senderName = '';
    let leadId = body.leadId;
    let workspaceId = body.workspaceId || req.headers['x-workspace-id'];

    // 1. Detect Provider Format
    // Format A0: AiSensy WhatsApp Inbound & Quick-Reply Button Tap
    if (body.type === 'quick_reply' || body.button_reply || body.event === 'incoming_message' || (body.mobile && (body.text || body.button))) {
      channel = 'WHATSAPP';
      from = body.mobile || body.from || body.sender || '';
      content = body.button_reply?.title || body.button?.text || body.text?.body || body.content || body.message || 'Continue Discussion';
      senderName = body.userName || body.name || from;
    }
    // Format A: Twilio Webhook (SMS or WhatsApp)
    else if (body.MessageSid || body.From) {
      from = body.From || '';
      content = body.Body || '';
      if (from.startsWith('whatsapp:')) {
        channel = 'WHATSAPP';
        from = from.replace('whatsapp:', '');
      } else {
        channel = 'SMS';
      }
      senderName = body.ProfileName || from;
    }
    // Format B: Telegram Bot Webhook
    else if (body.update_id && body.message) {
      channel = 'TELEGRAM';
      content = body.message.text || body.message.caption || '';
      const user = body.message.from || {};
      senderName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Telegram User';
      from = user.username ? `@${user.username}` : user.id?.toString();
    }
    // Format C: Resend / Email Inbound Webhook
    else if (body.type === 'email.delivered' || body.email || body.html || body.subject) {
      channel = 'EMAIL';
      from = body.from || body.email?.from || '';
      content = body.text || body.subject || body.email?.text || 'Email received';
      senderName = from.split('@')[0];
    }
    // Format D: Unified JSON format
    else {
      channel = (body.channel || 'WHATSAPP').toUpperCase();
      content = body.content || body.message || body.text || '';
      from = body.from || body.phone || body.email || '';
      senderName = body.senderName || body.name || '';
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'No message content detected in webhook payload' });
    }

    // 2. Resolve Workspace & Lead
    if (!workspaceId) {
      const firstWs = await Workspace.findOne().lean();
      workspaceId = firstWs?._id;
    }

    if (!leadId) {
      // Attempt to find lead by phone or email
      const leadQuery = { workspaceId };
      if (from.includes('@') && !from.startsWith('@')) {
        leadQuery.email = from.toLowerCase();
      } else if (from.startsWith('@')) {
        leadQuery['channels.telegram'] = from;
      } else if (from) {
        leadQuery.phone = from;
      }

      let foundLead = await Lead.findOne(leadQuery);
      if (!foundLead) {
        // Find newest lead or create one
        foundLead = await Lead.findOne({ workspaceId }).sort({ createdAt: -1 });
      }
      leadId = foundLead?._id;
    }

    // 3. Delegate to Unified Inbound Processor
    const result = await processInboundMessage({
      workspaceId,
      leadId,
      channel,
      content,
      senderName,
      req,
    });

    return res.status(200).json({
      success: true,
      processed: true,
      channel,
      messageId: result.message._id,
      conversationId: result.conversation._id,
      sentiment: result.sentiment.sentiment,
      stageUpdatedTo: result.lead?.stage,
      suggestedReply: result.suggestedReply?.suggestedText,
    });
  } catch (error) {
    console.error('[Webhook] Inbound webhook processing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/webhooks/whatsapp/templates
 * Receives Meta Graph API / AiSensy template review callbacks (APPROVED / REJECTED)
 */
router.post('/whatsapp/templates', async (req, res) => {
  try {
    const { template_name, templateName, status, reason, rejection_reason } = req.body || {};
    const targetName = template_name || templateName;
    const targetStatus = (status || '').toUpperCase();

    if (!targetName) {
      return res.status(400).json({ success: false, message: 'template_name is required' });
    }

    const template = await WhatsAppTemplate.findOne({ templateName: targetName });
    if (template) {
      template.status = targetStatus === 'APPROVED' ? 'APPROVED' : (targetStatus === 'REJECTED' ? 'REJECTED' : 'PENDING_REVIEW');
      if (reason || rejection_reason) {
        template.rejectionReason = reason || rejection_reason;
      }
      await template.save();

      const io = req.app.get('io');
      if (io && template.workspaceId) {
        io.to(template.workspaceId.toString()).emit('template:status_updated', {
          templateId: template._id,
          templateName: template.templateName,
          status: template.status,
          rejectionReason: template.rejectionReason,
        });
      }
    }

    return res.json({ success: true, templateName: targetName, status: targetStatus });
  } catch (error) {
    console.error('[Webhook] Template review webhook error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export { router as webhookRoutes };
