import { callingWindowGuard } from '../compliance/CallingWindowGuard.js';
import { exotelGateway } from './ExotelGateway.js';
import { telnyxGateway } from './TelnyxGateway.js';
import { aiSensyGateway } from '../messaging/AiSensyGateway.js';
import { BlandAIGateway } from './BlandAIGateway.js';
import { CallLog } from '../../models/CallLog.js';
import { Workspace } from '../../models/Workspace.js';
import { getCountryByPhone } from '../../config/GlobalCountryCompliance.js';

/**
 * Universal Dual-Rail Telecom Lead Router
 * Automatically determines optimal telecom carrier, legal calling window,
 * compliance rules (TRAI, TCPA, ACMA, GDPR), and AI personas for any lead worldwide.
 */
class TelecomRouter {
  /**
   * Route and execute an Outbound Voice Call (Human or AI Closer)
   */
  async routeCall({ lead, workspaceId, repPhone = null, callType = 'AI_CLOSER', customScript = null }) {
    if (!lead || !lead.phone) {
      throw new Error('Valid lead phone number is required to route call.');
    }

    const workspace = await Workspace.findById(workspaceId).lean();
    const destPhone = lead.phone.trim();
    const countryMeta = getCountryByPhone(destPhone);

    // 1. Timezone & Calling Window Verification
    const windowCheck = callingWindowGuard.evaluate(destPhone, countryMeta.iso);
    if (!windowCheck.allowed) {
      console.warn(`[TelecomRouter] Call blocked by compliance window: ${windowCheck.reason}`);

      // Log queued call in CallLog
      const queuedLog = await CallLog.create({
        workspaceId,
        leadId: lead._id,
        toNumber: destPhone,
        fromNumber: repPhone || 'AUTO_ROUTER',
        status: 'queued',
        summary: `[TIMEZONE GUARD] Call postponed: ${windowCheck.reason}. Scheduled for: ${windowCheck.queuedFor}`,
        callType,
        carrierProvider: countryMeta.carrierEngine,
      });

      return {
        success: false,
        blockedByGuard: true,
        status: windowCheck.status,
        reason: windowCheck.reason,
        queuedFor: windowCheck.queuedFor,
        callLogId: queuedLog._id,
        country: countryMeta.name,
        regulatoryBody: countryMeta.regulatoryBody,
      };
    }

    // 2. Route by Country & Call Type
    // Case A: Domestic India (+91)
    if (countryMeta.iso === 'IN') {
      if (callType === 'CLICK_TO_CALL' && repPhone) {
        // Bridge rep mobile and Indian lead mobile via Exotel
        const result = await exotelGateway.initiateClickToCall({
          fromPhone: repPhone,
          toPhone: destPhone,
          workspaceId,
        });

        await CallLog.create({
          workspaceId,
          leadId: lead._id,
          toNumber: destPhone,
          fromNumber: repPhone,
          status: 'in-progress',
          summary: `Exotel Domestic India Call Bridged: Rep (${repPhone}) <-> Lead (${destPhone})`,
          callType: 'CLICK_TO_CALL',
          carrierProvider: 'EXOTEL_INDIA',
        });

        return {
          ...result,
          carrier: 'EXOTEL_INDIA',
          regulatoryBody: 'TRAI (100% Domestic Compliant)',
        };
      } else {
        // AI Closer (Maya) with Indian Persona
        const aiResult = await BlandAIGateway.initiateCall({
          lead,
          workspaceId,
          voicePersona: 'maya_indian_english',
          customScript: customScript || `Hello, this is Maya calling on behalf of ${workspace?.name || 'our team'} regarding our business solutions.`,
        });

        return {
          ...aiResult,
          carrier: 'BLAND_AI_INDIAN_ACCENT',
          regulatoryBody: 'TRAI (Compliant Calling Window)',
        };
      }
    }

    // Case B: Global Route (North America, UK, Europe, Australia, etc.)
    if (callType === 'CLICK_TO_CALL' && repPhone) {
      const result = await telnyxGateway.initiateCall({
        toPhone: destPhone,
        fromPhone: repPhone,
        workspaceId,
      });

      await CallLog.create({
        workspaceId,
        leadId: lead._id,
        toNumber: destPhone,
        fromNumber: repPhone,
        status: 'in-progress',
        summary: `Telnyx Global Call: ${destPhone} via private fiber route`,
        callType: 'CLICK_TO_CALL',
        carrierProvider: 'TELNYX_GLOBAL',
      });

      return {
        ...result,
        carrier: 'TELNYX_GLOBAL',
        regulatoryBody: countryMeta.regulatoryBody,
      };
    } else {
      // AI Closer (Maya) with US / Regional Persona
      const persona = countryMeta.iso === 'GB' ? 'victoria_british' : countryMeta.iso === 'AU' ? 'liam_australian' : 'maya_us_neutral';
      const aiResult = await BlandAIGateway.initiateCall({
        lead,
        workspaceId,
        voicePersona: persona,
        customScript: customScript || `Hello, this is Maya calling from ${workspace?.name || 'our company'}.`,
      });

      return {
        ...aiResult,
        carrier: 'BLAND_AI_GLOBAL',
        regulatoryBody: countryMeta.regulatoryBody,
      };
    }
  }

  /**
   * Route and execute an Outbound Message (WhatsApp, SMS, or Email)
   */
  async routeMessage({ lead, workspaceId, messageText, mediaUrl = null }) {
    if (!lead || !lead.phone) {
      throw new Error('Valid lead phone number is required to route message.');
    }

    const destPhone = lead.phone.trim();
    const countryMeta = getCountryByPhone(destPhone);

    // If destination prioritizes WhatsApp (India, LatAm, Middle East)
    if (countryMeta.primaryChannel.includes('WHATSAPP') || countryMeta.iso === 'IN' || countryMeta.iso === 'AE' || countryMeta.iso === 'BR') {
      return aiSensyGateway.sendWhatsAppMessage({
        toPhone: destPhone,
        leadName: lead.name,
        messageText,
        workspaceId,
        mediaUrl,
      });
    }

    // Default to Telnyx SMS (USA, Canada, etc.)
    return telnyxGateway.sendSms({
      toPhone: destPhone,
      messageText,
      workspaceId,
    });
  }
}

export const telecomRouter = new TelecomRouter();
export default telecomRouter;
