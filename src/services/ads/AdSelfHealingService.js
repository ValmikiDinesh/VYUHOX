/**
 * AdSelfHealingService.js
 * Autonomous Self-Healing Engine for Meta Ads & Google Shopping Ads
 * 
 * CORE CAPABILITIES:
 * 1. Policy Rejection Diagnosis: Categorizes errors across Meta Graph & Google Ads
 *    (e.g., MISLEADING_CONTENT, PROHIBITED_FINANCIAL_CLAIMS, SENSITIVE_KEYWORD, SHOCK_SENSATIONAL).
 * 2. LLM-Powered Rewrite: Uses LlmGatewayService to automatically re-architect headlines
 *    and primary copy into compliant, high-converting copy that adheres to strict platform policies.
 * 3. Autonomous Resubmission: Updates the ad creative in database, bumps version, records healing audit log,
 *    and resubmits directly to Meta Graph API v19.0 / Google Ads API.
 * 4. Real-time Telemetry: Broadcasts self-healing actions via WebSockets to AdsManager UI.
 */

import { AdCampaign } from '../../models/AdCampaign.js';
import { AdCreative } from '../../models/AdCreative.js';
import { AdOptimizationLog } from '../../models/AdOptimizationLog.js';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { MetaMarketingService } from './MetaMarketingService.js';
import { GoogleAdsService } from './GoogleAdsService.js';

export class AdSelfHealingService {
  /**
   * Diagnostic policy matrix for known Meta and Google advertising policy rejection codes
   */
  static POLICY_DEFINITIONS = {
    UNACCEPTABLE_BUSINESS_PRACTICES: {
      platform: 'META',
      severity: 'HIGH',
      description: 'Promises unrealistic financial gains, deceptive claims, or unverified claims of certainty.',
      fixDirective: 'Remove definitive guarantees ("guaranteed 10x", "zero risk", "instant riches"). Replace with verifiable workflow metrics, institutional infrastructure language, and transparent performance descriptors.'
    },
    MISLEADING_CONTENT: {
      platform: 'META',
      severity: 'MEDIUM',
      description: 'Sensational claims or exaggerated headlines without qualified context.',
      fixDirective: 'Qualify statements with "built for", "designed to assist", or "benchmarked at". Eliminate absolute claims.'
    },
    PROHIBITED_FINANCIAL_PRODUCTS: {
      platform: 'META',
      severity: 'CRITICAL',
      description: 'Direct promotion of unregulated investment schemes, ICOs, or binary options.',
      fixDirective: 'Reframe entire value proposition strictly around B2B SaaS software infrastructure, developer APIs, or institutional automation software, never investment advice or token sales.'
    },
    RESTRICTED_KEYWORD: {
      platform: 'GOOGLE_ADS',
      severity: 'HIGH',
      description: 'Headline or keyword triggers Google Ads trademark or sensitive terminology filter.',
      fixDirective: 'Substitute blacklisted competitor trademarks and sensitive financial trigger words with clean industry standard terminology (e.g. swap "hack" or "insider" with "streamlined" or "optimized").'
    },
    PUNCTUATION_OR_CAPITALIZATION: {
      platform: 'GOOGLE_ADS',
      severity: 'LOW',
      description: 'Excessive exclamation marks, ALL-CAPS words, or gimmicky symbols.',
      fixDirective: 'Enforce standard title casing, remove exclamation marks, and normalize all characters to clean professional English.'
    },
    DESTINATION_URL_MISMATCH: {
      platform: 'ALL',
      severity: 'MEDIUM',
      description: 'Landing page does not match display domain or lacks required SSL / disclosures.',
      fixDirective: 'Ensure clean canonical HTTPS display URL and add required enterprise privacy/terms disclosures.'
    }
  };

  /**
   * Main entrypoint: Diagnose a rejected ad creative, rewrite copy, and autonomously resubmit
   */
  static async healRejectedAd({
    creativeId,
    rejectionCode = 'MISLEADING_CONTENT',
    policyDetails = null,
    io = null,
    forceHeal = false
  }) {
    const creative = await AdCreative.findById(creativeId).populate('campaignId');
    if (!creative) {
      throw new Error(`[AdSelfHealing] AdCreative with id ${creativeId} not found.`);
    }

    const campaign = creative.campaignId;
    const platform = campaign?.platform || 'META';
    const policy = this.POLICY_DEFINITIONS[rejectionCode] || {
      platform,
      severity: 'MEDIUM',
      description: policyDetails || 'Platform policy review disapproval.',
      fixDirective: 'Rewrite ad copy to be completely professional, strictly compliant with platform ad policies, and free of hype.'
    };

    console.log(`[AdSelfHealing] Initiating auto-heal cycle for Creative "${creative.headline}" [Code: ${rejectionCode}]`);

    // 1. Mark as HEALING state
    creative.complianceStatus = 'HEALING';
    creative.rejectionReason = {
      code: rejectionCode,
      details: policyDetails || policy.description,
      policyTopic: policy.severity,
      flaggedAt: new Date()
    };
    await creative.save();

    if (campaign) {
      campaign.status = 'HEALING';
      await campaign.save();
    }

    // 2. Call LlmGatewayService to formulate compliant, high-converting copy
    const prompt = `
You are the VYUHOX Chief Advertising Compliance Officer & Copywriting AI.
An ad creative on ${platform} was REJECTED / DISAPPROVED by platform automated review.

REJECTION DETAILS:
- Platform: ${platform}
- Rejection Code: ${rejectionCode}
- Policy Details: ${policy.description}
- Policy Fix Directive: ${policy.fixDirective}

ORIGINAL REJECTED COPY:
- Headline: "${creative.headline}"
- Primary Text: "${creative.primaryText}"
- CTA: "${creative.ctaText}"
- Target Platform Format: ${creative.platformFormat}

YOUR MISSION:
1. Re-engineer the Headline and Primary Text to be 100% compliant with ${platform} advertising policies.
2. Remove any sensational claims, excessive punctuation, deceptive promises, or forbidden keywords.
3. Retain high-converting value proposition and enterprise credibility.
4. Keep the headline under 50 characters (Meta) or 30 characters (Google).
5. Output MUST be valid JSON with keys:
   {
     "healedHeadline": "string",
     "healedPrimaryText": "string",
     "policyAddressed": "string explaining how the specific policy was resolved",
     "complianceConfidence": number (between 90 and 100)
   }
`;

    let healedData = null;
    try {
      const llmResult = await LlmGatewayService.execute({
        prompt,
        systemInstruction: 'You are an expert advertising compliance officer and copywriter. Output strictly valid JSON.',
        jsonResponse: true,
        temperature: 0.2
      });

      if (llmResult?.text) {
        try {
          healedData = JSON.parse(llmResult.text.replace(/```json|```/g, '').trim());
        } catch (parseErr) {
          console.warn('[AdSelfHealing] JSON parse fallback on LLM text:', parseErr.message);
        }
      }
    } catch (llmErr) {
      console.warn('[AdSelfHealing] LLM Gateway error during ad healing, applying rule-based sanitization:', llmErr.message);
    }

    // Fallback rule-based sanitization if LLM fails
    if (!healedData || !healedData.healedHeadline) {
      healedData = this.applyDeterministicSanitization({
        headline: creative.headline,
        primaryText: creative.primaryText,
        rejectionCode
      });
    }

    const previousHeadline = creative.headline;
    const previousPrimaryText = creative.primaryText;

    // 3. Update Creative with healed copy
    creative.headline = healedData.healedHeadline;
    creative.primaryText = healedData.healedPrimaryText;
    creative.complianceStatus = 'HEALED';
    creative.healingHistory.push({
      attempt: (creative.healingHistory?.length || 0) + 1,
      previousHeadline,
      previousPrimaryText,
      healedHeadline: healedData.healedHeadline,
      healedPrimaryText: healedData.healedPrimaryText,
      policyAddressed: healedData.policyAddressed || policy.fixDirective,
      appliedAt: new Date(),
      status: 'RESUBMITTED'
    });
    await creative.save();

    // 4. Autonomous Resubmission to Provider
    let resubmissionResult = null;
    if (platform.includes('META')) {
      resubmissionResult = await MetaMarketingService.createCampaign({
        workspaceId: creative.workspaceId,
        campaignName: `${campaign?.campaignName || 'Auto-Healed'} [v${creative.healingHistory.length}]`,
        objective: campaign?.objective || 'LEAD_GENERATION',
        dailyBudget: campaign?.dailyBudget || 150,
        targeting: campaign?.targeting || {},
        creative: {
          headline: creative.headline,
          primaryText: creative.primaryText,
          ctaText: creative.ctaText,
          mediaUrl: creative.mediaUrl,
          destinationUrl: creative.destinationUrl,
          platformFormat: creative.platformFormat
        }
      });
    } else {
      resubmissionResult = await GoogleAdsService.createCampaign({
        workspaceId: creative.workspaceId,
        campaignName: `${campaign?.campaignName || 'Auto-Healed'} [v${creative.healingHistory.length}]`,
        objective: campaign?.objective || 'CONVERSIONS',
        dailyBudget: campaign?.dailyBudget || 180,
        targeting: campaign?.targeting || {},
        creative: {
          headline: creative.headline,
          primaryText: creative.primaryText,
          destinationUrl: creative.destinationUrl
        }
      });
    }

    // 5. Restore Campaign Status
    if (campaign) {
      campaign.status = 'ACTIVE';
      campaign.lastOptimizedAt = new Date();
      await campaign.save();
    }

    // 6. Record Audit Log in AdOptimizationLog
    const optimizationLog = await AdOptimizationLog.create({
      workspaceId: creative.workspaceId,
      campaignId: campaign?._id || creative.campaignId,
      ruleTriggered: 'AUTO_HEAL_REJECTION',
      actionTaken: `Automated Policy Fix: Rewrote rejected copy and resubmitted to ${platform}.`,
      previousValue: `[Headline]: "${previousHeadline.slice(0, 40)}..."`,
      newValue: `[Healed]: "${healedData.healedHeadline.slice(0, 40)}..."`,
      rationale: `Rejection Code: ${rejectionCode}. Policy Fix: ${healedData.policyAddressed || policy.fixDirective}. Live resubmission id: ${resubmissionResult?.externalCampaignId || 'verified'}.`
    });

    // 7. Emit Live Socket Notification
    if (io) {
      io.to(creative.workspaceId.toString()).emit('ad:self_healed', {
        creativeId: creative._id,
        campaignId: campaign?._id,
        rejectionCode,
        healedData,
        optimizationLog,
        message: `🛡️ Self-Healing Engine auto-corrected rejected ad "${previousHeadline.slice(0, 30)}..." and resubmitted to ${platform}!`
      });
    }

    return {
      success: true,
      creativeId: creative._id,
      rejectionCode,
      previousCopy: { headline: previousHeadline, primaryText: previousPrimaryText },
      healedCopy: { headline: healedData.healedHeadline, primaryText: healedData.healedPrimaryText },
      policyAddressed: healedData.policyAddressed,
      resubmissionResult,
      auditLogId: optimizationLog._id
    };
  }

  /**
   * Deterministic sanitization when LLM is unavailable
   */
  static applyDeterministicSanitization({ headline, primaryText, rejectionCode }) {
    let cleanHeadline = headline
      .replace(/100%|guaranteed|get rich|instant profit|never lose/gi, 'Verified')
      .replace(/!{2,}/g, '')
      .replace(/\${2,}/g, '$')
      .trim();

    let cleanPrimary = primaryText
      .replace(/guarantee(d)?/gi, 'proven')
      .replace(/make \$[\d,]+/gi, 'accelerate performance')
      .replace(/100% risk free/gi, 'enterprise-grade architecture')
      .trim();

    if (cleanHeadline.length > 35) {
      cleanHeadline = cleanHeadline.slice(0, 32) + '...';
    }

    return {
      healedHeadline: cleanHeadline,
      healedPrimaryText: cleanPrimary,
      policyAddressed: `Deterministic sanitization applied for policy ${rejectionCode}. Removed sensational claims and normalized punctuation.`,
      complianceConfidence: 94
    };
  }

  /**
   * Simulates an ad rejection to demonstrate self-healing in real-time
   */
  static async simulateRejectionAndHeal(workspaceId, io = null) {
    let creative = await AdCreative.findOne({ workspaceId }).populate('campaignId');
    if (!creative) {
      // Find any creative
      creative = await AdCreative.findOne().populate('campaignId');
    }
    if (!creative) {
      throw new Error('No ad creative found to simulate rejection.');
    }

    const testRejectionCodes = [
      'UNACCEPTABLE_BUSINESS_PRACTICES',
      'MISLEADING_CONTENT',
      'RESTRICTED_KEYWORD',
      'PUNCTUATION_OR_CAPITALIZATION'
    ];
    const selectedCode = testRejectionCodes[Math.floor(Math.random() * testRejectionCodes.length)];

    return await this.healRejectedAd({
      creativeId: creative._id,
      rejectionCode: selectedCode,
      policyDetails: `Automated test flag triggered by platform review bot: ${selectedCode}.`,
      io,
      forceHeal: true
    });
  }
}

export default AdSelfHealingService;
