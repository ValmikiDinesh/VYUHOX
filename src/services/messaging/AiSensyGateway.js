import dotenv from 'dotenv';
import { PlatformConfig } from '../../models/PlatformConfig.js';
import { IntegrationConfig } from '../../models/IntegrationConfig.js';

dotenv.config();

/**
 * AiSensy WhatsApp Business API Gateway
 * Official Meta Business Solution Provider (Gurugram, India).
 * Delivers verified WhatsApp business messaging in Indian Rupees (INR) with 98% open rates.
 */
class AiSensyGateway {
  /**
   * Resolve AiSensy credentials from Workspace BYOC or Global Platform Config
   */
  async getCredentials(workspaceId) {
    if (workspaceId) {
      const customConfig = await IntegrationConfig.findOne({
        workspaceId,
        serviceName: 'aisensy',
      }).lean();

      if (customConfig && customConfig.credentials?.apiKey) {
        return {
          apiKey: customConfig.credentials.apiKey,
          campaignName: customConfig.credentials.campaignName || 'vyuhox_leads',
          isByoc: true,
        };
      }
    }

    const platform = await PlatformConfig.findOne().lean();
    return {
      apiKey: platform?.integrations?.aisensy?.apiKey || process.env.AISENSY_API_KEY || '',
      campaignName: platform?.integrations?.aisensy?.campaignName || process.env.AISENSY_CAMPAIGN_NAME || 'vyuhox_general',
      isByoc: false,
    };
  }

  /**
   * Send WhatsApp Template or Freeform Outreach Message via AiSensy
   * 
   * @param {Object} params
   * @param {string} params.toPhone - Lead mobile number (e.g. +91 98765 43210)
   * @param {string} params.leadName - Contact name
   * @param {string} params.messageText - Message body or template parameters
   * @param {string} params.workspaceId - Workspace ID
   */
  async sendWhatsAppMessage({ toPhone, leadName, messageText, workspaceId, mediaUrl = null, campaignName = null, templateParams = null }) {
    const creds = await this.getCredentials(workspaceId);
    let cleanTo = (toPhone || '').replace(/[^\d]/g, ''); // AiSensy expects pure digits without '+'
    if (cleanTo.length === 10) {
      // Default to India +91 if 10 digits provided
      cleanTo = `91${cleanTo}`;
    }

    // Pre-flight normalizer: sanitize line breaks and enforce safe character limits
    const sanitizedText = (messageText || '')
      .replace(/\n{3,}/g, '\n\n')
      .slice(0, 850);

    const effectiveCampaign = campaignName || creds.campaignName || 'vyuhox_leads';
    const effectiveParams = templateParams || [leadName || 'Partner', sanitizedText];

    console.log(`[AiSensyGateway] Dispatching WhatsApp Message to ${cleanTo} (${leadName}) via campaign: ${effectiveCampaign}`);

    if (creds.apiKey) {
      try {
        const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: creds.apiKey,
            campaignName: effectiveCampaign,
            destination: cleanTo,
            userName: leadName || 'Valued Lead',
            templateParams: effectiveParams,
            media: mediaUrl ? { url: mediaUrl, filename: 'presentation.pdf' } : undefined,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && (data.success || data.status === 'success')) {
          return {
            success: true,
            provider: 'AISENSY_WHATSAPP',
            messageId: data?.data?.messageId || data?.messageId || `waba_${Date.now()}`,
            status: 'SENT',
            isByoc: creds.isByoc,
          };
        }

        const errMsg = data?.message || data?.errorMessage || `AiSensy returned HTTP ${response.status}`;
        console.warn('[AiSensyGateway] Live API rejection:', errMsg);
        return {
          success: false,
          provider: 'AISENSY_WHATSAPP',
          status: 'FAILED',
          error: errMsg,
          message: errMsg,
          isByoc: creds.isByoc,
        };
      } catch (err) {
        console.warn('[AiSensyGateway] Network dispatch error:', err.message);
        return {
          success: false,
          provider: 'AISENSY_WHATSAPP',
          status: 'FAILED',
          error: err.message,
          message: `Network error connecting to AiSensy: ${err.message}`,
        };
      }
    }

    return {
      success: false,
      provider: 'AISENSY_WHATSAPP',
      status: 'FAILED',
      error: 'NO_API_KEY',
      message: 'No AiSensy API Key configured in Super Admin.',
    };
  }
}

export const aiSensyGateway = new AiSensyGateway();
export default aiSensyGateway;

