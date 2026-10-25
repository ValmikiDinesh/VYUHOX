/**
 * seoToolsRoutes.js
 * Endpoints powering:
 * 1. Free Public Link-Magnet Tools (Spam Checker, ICP Calculator, DNS Lookup)
 * 2. Autonomous Digital PR & Journalist Pitching Hub
 * 3. AEO Schema & Perplexity/ChatGPT Citation Engine
 */

import express from 'express';
import dns from 'dns/promises';
import { DigitalPrAgent } from '../services/seo/DigitalPrAgent.js';
import { AeoSchemaService } from '../services/seo/AeoSchemaService.js';
import { JournalistPitch } from '../models/JournalistPitch.js';
import { LlmGatewayService } from '../services/ai/LlmGatewayService.js';

const router = express.Router();

// Common spam trigger words for cold email analysis
const SPAM_TRIGGERS = [
  '100% free', '100% satisfied', 'act now', 'apply now', 'as seen on', 'bad credit',
  'bargain', 'be your own boss', 'best price', 'big bucks', 'billion dollars', 'bonus',
  'buy direct', 'call now', 'cancel at any time', 'cash bonus', 'cash prize', 'certified',
  'cheap', 'claims', 'clearance', 'click here', 'click now', 'compare rates', 'congratulations',
  'cost', 'credit card offers', 'cures', 'dear friend', 'direct email', 'discount',
  'double your income', 'earn extra cash', 'earn money', 'eliminate debt', 'exclusive deal',
  'expect to earn', 'extra income', 'fast cash', 'financial freedom', 'free consultation',
  'free gift', 'free info', 'free membership', 'free preview', 'free sample', 'free trial',
  'full refund', 'get out of debt', 'get paid', 'giveaway', 'guaranteed', 'hidden assets',
  'hidden charges', 'income from home', 'increase sales', 'increase traffic', 'instant',
  'investment', 'join millions', 'limited time', 'lowest price', 'make money', 'million dollars',
  'miracle', 'money back', 'mortgage rates', 'multi-level marketing', 'no catch', 'no cost',
  'no credit check', 'no experience', 'no fees', 'no gimmick', 'no hidden costs', 'no obligation',
  'no purchase necessary', 'no risk', 'no strings attached', 'not spam', 'obligation', 'once in a lifetime',
  'one time', 'online marketing', 'open immediately', 'opportunity', 'order now', 'passwords',
  'pennies a day', 'potential earnings', 'prize', 'promise you', 'pure profit', 'refund',
  'remove', 'reverses aging', 'risk free', 'save big', 'save money', 'score', 'search engine listings',
  'see for yourself', 'send $', 'special promotion', 'supplies are limited', 'take action now',
  'terms and conditions', 'the best rates', 'unlimited', 'unsecured credit', 'urgent', 'valuable',
  'viagra', 'vicodin', 'warranty', 'weight loss', 'while supplies last', 'win', 'winner', 'winning',
  'work from home', 'you have been selected', 'your income',
];

/**
 * 1. POST /api/seo-tools/spam-checker
 * Free Link Magnet: Cold Email Deliverability & Spam Score Analyzer
 */
router.post('/spam-checker', async (req, res) => {
  try {
    const { emailText, subject = '' } = req.body;
    if (!emailText || typeof emailText !== 'string') {
      return res.status(400).json({ success: false, message: 'emailText string is required' });
    }

    const fullContent = `${subject} ${emailText}`.toLowerCase();
    const foundTriggers = [];

    SPAM_TRIGGERS.forEach((phrase) => {
      if (fullContent.includes(phrase)) {
        foundTriggers.push(phrase);
      }
    });

    // Score deduction: starts at 100, drops by 8 points per trigger
    const deduction = foundTriggers.length * 8;
    const score = Math.max(10, 100 - deduction);

    let deliverabilityRating = 'EXCELLENT';
    if (score < 50) deliverabilityRating = 'HIGH_SPAM_RISK';
    else if (score < 75) deliverabilityRating = 'MODERATE_RISK';
    else if (score < 90) deliverabilityRating = 'GOOD';

    // Quick suggestions
    const suggestions = [];
    if (foundTriggers.length > 0) {
      suggestions.push(`Replace trigger words like "${foundTriggers.slice(0, 3).join('", "')}" with consultative business language.`);
    }
    if (subject.length > 60) {
      suggestions.push('Shorten subject line to under 50 characters to improve mobile inbox preview.');
    }
    if (!emailText.includes('?') && !emailText.toLowerCase().includes('time')) {
      suggestions.push('Add a soft, low-friction call-to-action (e.g. "Open to exploring this next Tuesday?").');
    }

    return res.json({
      success: true,
      deliverabilityScore: score,
      rating: deliverabilityRating,
      triggersFoundCount: foundTriggers.length,
      triggersFound: foundTriggers,
      wordCount: emailText.split(/\s+/).filter(Boolean).length,
      suggestions,
      poweredByCta: 'Automate high-deliverability cold email sequences with VYUHOX Caleb SDR',
    });
  } catch (error) {
    console.error('[SeoTools] Spam checker error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. POST /api/seo-tools/icp-calculator
 * Free Link Magnet: ICP Buyer Persona & Budget Calculator
 */
router.post('/icp-calculator', async (req, res) => {
  try {
    const { industry, productDescription = '' } = req.body;
    if (!industry) {
      return res.status(400).json({ success: false, message: 'industry keyword is required' });
    }

    const prompt = `
You are the VYUHOX Autonomous ICP Strategy Architect.
INDUSTRY: "${industry}"
PRODUCT: "${productDescription || industry}"

TASK:
Deduce exactly 3 high-probability Ideal Customer Profile (ICP) buyer personas who have budget and urgency to buy in this space.

OUTPUT STRICT JSON:
{
  "industry": "${industry}",
  "personas": [
    {
      "personaTitle": "e.g. VP of Engineering at Series B Fintechs",
      "painPoint": "Specific operational bottleneck",
      "urgencyLevel": "HIGH",
      "estimatedAcv": "$15,000 - $35,000 / yr",
      "decisionMakerJobTitles": ["CTO", "Head of Platform", "VP Engineering"],
      "recommendedOutreachChannel": "Email + Voice AI Speed-to-Lead"
    }
  ]
}
`;

    let resultJson = null;
    try {
      const llmRes = await LlmGatewayService.execute({
        prompt,
        systemInstruction: 'You are an elite B2B enterprise sales strategist. Output strictly valid JSON.',
        jsonResponse: true,
        temperature: 0.2,
      });
      if (llmRes?.text) {
        resultJson = JSON.parse(llmRes.text.replace(/```json|```/g, '').trim());
      }
    } catch (e) {
      console.warn('[SeoTools] ICP calculator fallback:', e.message);
    }

    if (!resultJson || !resultJson.personas) {
      resultJson = {
        industry,
        personas: [
          {
            personaTitle: `Mid-Market Operations Directors in ${industry}`,
            painPoint: 'Manual operational friction and high customer acquisition cost',
            urgencyLevel: 'HIGH',
            estimatedAcv: '$12,000 - $24,000 / yr',
            decisionMakerJobTitles: ['Chief Operating Officer', 'VP of Sales', 'Operations Director'],
            recommendedOutreachChannel: 'Omnichannel Email + Maya Vance Voice AI',
          },
          {
            personaTitle: `High-Growth Founders & Boutique Owners (${industry})`,
            painPoint: 'Lack of in-house enterprise sales reps to close inbound inquiries',
            urgencyLevel: 'CRITICAL',
            estimatedAcv: '$6,000 - $18,000 / yr',
            decisionMakerJobTitles: ['Founder & CEO', 'Managing Director'],
            recommendedOutreachChannel: 'Instant AI Micro-Site + WhatsApp Direct',
          },
          {
            personaTitle: `Enterprise Procurement & Category Managers in ${industry}`,
            painPoint: 'Inability to source verified supplier quotes with rapid delivery turnarounds',
            urgencyLevel: 'HIGH',
            estimatedAcv: '$40,000 - $120,000 / yr',
            decisionMakerJobTitles: ['Head of Procurement', 'Supply Chain Director'],
            recommendedOutreachChannel: 'Two-Sided Trade Engine + HS Code Prospecting',
          },
        ],
      };
    }

    return res.json({
      success: true,
      ...resultJson,
      poweredByCta: 'Prospect and close these exact ICP personas autonomously with VYUHOX',
    });
  } catch (error) {
    console.error('[SeoTools] ICP calculator error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. POST /api/seo-tools/dns-lookup
 * Free Link Magnet: Domain MX, SPF, DKIM & DMARC Deliverability Tester
 */
router.post('/dns-lookup', async (req, res) => {
  try {
    let { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ success: false, message: 'domain is required' });
    }

    // Clean domain
    domain = domain.replace(/https?:\/\//i, '').replace(/\/.*$/, '').trim();

    let mxRecords = [];
    let txtRecords = [];
    let hasSpf = false;
    let hasDmarc = false;

    try {
      mxRecords = await dns.resolveMx(domain);
    } catch (e) {
      console.warn(`[DnsTester] MX resolution error for ${domain}:`, e.message);
    }

    try {
      txtRecords = await dns.resolveTxt(domain);
      const flatTxt = txtRecords.flat().join(' ');
      hasSpf = flatTxt.toLowerCase().includes('v=spf1');
    } catch (e) {
      console.warn(`[DnsTester] TXT resolution error for ${domain}:`, e.message);
    }

    try {
      const dmarcTxt = await dns.resolveTxt(`_dmarc.${domain}`);
      const flatDmarc = dmarcTxt.flat().join(' ');
      hasDmarc = flatDmarc.toLowerCase().includes('v=dmarc1');
    } catch (e) {
      hasDmarc = false;
    }

    const hasMx = mxRecords.length > 0;
    let healthScore = 20;
    if (hasMx) healthScore += 30;
    if (hasSpf) healthScore += 25;
    if (hasDmarc) healthScore += 25;

    let status = 'HEALTHY';
    if (healthScore < 50) status = 'POOR_DELIVERABILITY';
    else if (healthScore < 80) status = 'NEEDS_OPTIMIZATION';

    return res.json({
      success: true,
      domain,
      healthScore,
      status,
      hasMx,
      mxCount: mxRecords.length,
      primaryMx: mxRecords[0]?.exchange || 'None detected',
      hasSpf,
      hasDmarc,
      recommendations: [
        !hasMx && 'Configure mail exchange (MX) records before sending cold outbound.',
        !hasSpf && 'Add a valid SPF record (v=spf1 include:...) to prevent email spoofing.',
        !hasDmarc && 'Publish a DMARC policy (_dmarc.domain) to comply with Google & Yahoo 2026 bulk sender guidelines.',
      ].filter(Boolean),
      poweredByCta: 'Protect your domain and scale cold outreach with VYUHOX Deliverability Guard',
    });
  } catch (error) {
    console.error('[SeoTools] DNS lookup error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 4. GET /api/seo-tools/aeo-pack/:workspaceId
 * Returns the complete AEO Optimization Pack for a client workspace
 */
router.get('/aeo-pack/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const aeoPack = await AeoSchemaService.generateClientAeoPack(workspaceId);
    return res.json({ success: true, aeoPack });
  } catch (error) {
    console.error('[SeoTools] AEO pack error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 5. GET /api/seo-tools/master-schema
 * Returns VYUHOX's Master JSON-LD Schema
 */
router.get('/master-schema', (req, res) => {
  const schema = AeoSchemaService.getMasterVyuhoxSchema();
  return res.json({ success: true, schema });
});

/**
 * 6. Digital PR Endpoints
 */
router.get('/digital-pr/pitches', async (req, res) => {
  try {
    await DigitalPrAgent.syncOpportunities();
    const pitches = await JournalistPitch.find().sort({ createdAt: -1 });
    return res.json({ success: true, pitches });
  } catch (error) {
    console.error('[SeoTools] Digital PR fetch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/digital-pr/generate-pitch', async (req, res) => {
  try {
    const { pitchId, founderInfo } = req.body;
    if (!pitchId) return res.status(400).json({ success: false, message: 'pitchId required' });
    const pitch = await DigitalPrAgent.generatePitchQuote(pitchId, founderInfo);
    return res.json({ success: true, pitch });
  } catch (error) {
    console.error('[SeoTools] Generate pitch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/digital-pr/submit', async (req, res) => {
  try {
    const { pitchId } = req.body;
    if (!pitchId) return res.status(400).json({ success: false, message: 'pitchId required' });
    const pitch = await DigitalPrAgent.submitPitch(pitchId);
    return res.json({ success: true, pitch });
  } catch (error) {
    console.error('[SeoTools] Submit pitch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/digital-pr/mark-accepted', async (req, res) => {
  try {
    const { pitchId, backlinkUrl } = req.body;
    if (!pitchId) return res.status(400).json({ success: false, message: 'pitchId required' });
    const pitch = await DigitalPrAgent.markAccepted(pitchId, backlinkUrl);
    return res.json({ success: true, pitch });
  } catch (error) {
    console.error('[SeoTools] Mark accepted error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const seoToolsRoutes = router;
export default seoToolsRoutes;
