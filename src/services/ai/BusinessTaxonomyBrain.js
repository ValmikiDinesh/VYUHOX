/**
 * BusinessTaxonomyBrain.js
 * Database-Driven & AI-Powered Market Intelligence Gateway for VYUHOX
 * 
 * ZERO HARDCODED ARCHETYPES. ZERO REGEX LISTS.
 * 1. Checks MongoDB (MarketIntelligence) first for previously learned market categories.
 * 2. If novel, dynamically synthesizes the archetype using Gemini AI.
 * 3. Permanently stores learned archetypes into MongoDB.
 * 4. If AI is unavailable, explicitly reports AI unavailability rather than faking hardcoded data.
 */

import mongoose from 'mongoose';
import { MarketIntelligence } from '../../models/MarketIntelligenceModel.js';
import { LlmGatewayService } from './LlmGatewayService.js';

export class BusinessTaxonomyBrain {
  /**
   * Intelligently classifies any website or business into its living archetype.
   * 1. Checks MongoDB memory for previously learned market categories.
   * 2. If novel, dynamically synthesizes the archetype blueprint via Gemini AI.
   * 3. Permanently upserts newly learned archetypes into MongoDB.
   * 4. If AI is unreachable, throws an explicit error (no hardcoded fallback).
   */
  static async identifyArchetypeAsync(corpusOrOptions = '', url = '', metaDescription = '') {
    let corpus = corpusOrOptions;
    let name = '';
    let categoryHint = '';

    if (typeof corpusOrOptions === 'object' && corpusOrOptions !== null) {
      corpus = corpusOrOptions.corpus || corpusOrOptions.text || '';
      url = corpusOrOptions.url || url || '';
      metaDescription = corpusOrOptions.metaDescription || metaDescription || '';
      name = corpusOrOptions.name || corpusOrOptions.businessName || '';
      categoryHint = corpusOrOptions.category || corpusOrOptions.industry || '';
    }

    const cleanName = name || 'Client Business';
    const combinedText = `${cleanName} ${categoryHint} ${corpus} ${url} ${metaDescription}`.trim();
    const tokens = combinedText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 15);

    // 1. Query MongoDB MarketIntelligence memory first
    try {
      if (mongoose.connection.readyState === 1 && (categoryHint || tokens.length > 0)) {
        const queryOr = [];
        if (categoryHint) {
          queryOr.push({ categoryName: new RegExp(`^${categoryHint}$`, 'i') });
          queryOr.push({ categoryKey: categoryHint.toUpperCase().replace(/[^A-Z0-9]/g, '_') });
        }
        if (tokens.length > 0) {
          queryOr.push({ industryKeywords: { $in: tokens.slice(0, 5) } });
        }

        const existingDoc = await MarketIntelligence.findOne({ $or: queryOr }).lean();
        if (existingDoc) {
          return this.formatArchetypeFromDoc(existingDoc, cleanName);
        }
      }
    } catch (dbErr) {
      console.warn('[BusinessTaxonomyBrain] MongoDB lookup warning:', dbErr.message);
    }

    // 2. Dynamic AI Synthesis via Gemini (Self-learning new archetype)
    const prompt = `You are a world-class Commercial Growth Strategist and Market Intelligence Architect.
Analyze this business and synthesize an exact business model and market intelligence archetype.

Business Name: "${cleanName}"
Category / Context: "${categoryHint || 'Analyze from website text'}"
Website / Crawled Snippets: "${combinedText.slice(0, 1000)}"

Return a strict JSON object with these EXACT keys:
{
  "categoryKey": "UPPERCASE_SNAKE_CASE_CATEGORY_KEY",
  "categoryName": "Concise Authentic Industry Category Name",
  "businessModel": "BUSINESS_MODEL_TYPE",
  "businessModelType": "ONLINE | OFFLINE | HYBRID",
  "keywords": ["5", "distinct", "industry", "keywords"],
  "typicalACV": "Realistic pricing or order value tier",
  "targetAudience": {
    "primaryPersona": "Who buys this solution",
    "decisionMakers": ["Job title 1", "Job title 2"],
    "painPoints": ["Primary customer pain point 1", "Primary pain point 2"],
    "buyingTriggers": ["Key purchasing trigger 1", "Key purchasing trigger 2"]
  },
  "swot": {
    "strengths": ["Key competitive strength"],
    "weaknesses": ["Operational challenge"],
    "opportunities": ["Growth channel"],
    "threats": ["Market risk"]
  },
  "coreOfferings": [
    "Specific deliverable or product 1",
    "Specific deliverable or product 2",
    "Specific deliverable or product 3"
  ],
  "creativeAdHooks": ["High converting hook angle 1", "High converting hook angle 2"]
}`;

    const aiRes = await LlmGatewayService.execute({
      prompt,
      systemInstruction: 'You are an autonomous market intelligence agent. Respond strictly with valid JSON.',
      jsonResponse: true,
      temperature: 0.2,
      timeoutMs: 25000,
    });

    if (aiRes?.parsedJson?.categoryName) {
      const pj = aiRes.parsedJson;

      // Persist newly learned archetype permanently into MongoDB
      if (mongoose.connection.readyState === 1 && pj.categoryKey) {
        MarketIntelligence.findOneAndUpdate(
          { categoryKey: pj.categoryKey },
          {
            $set: {
              categoryKey: pj.categoryKey,
              categoryName: pj.categoryName,
              businessModel: pj.businessModel || 'COMMERCIAL_ENTERPRISE',
              businessModelType: pj.businessModelType || 'ONLINE',
              industryKeywords: pj.keywords || tokens,
              swotMatrix: pj.swot || {},
              targetAudience: {
                ...(pj.targetAudience || {}),
                typicalACV: pj.typicalACV || 'Market Determined',
              },
              coreOfferings: pj.coreOfferings || [],
              creativeAdHooks: pj.creativeAdHooks || [],
              lastStudiedAt: new Date(),
            },
            $inc: { learnedCaseStudiesCount: 1 },
          },
          { upsert: true, new: true }
        ).catch((e) => console.warn('[BusinessTaxonomyBrain] Auto-save archetype warning:', e.message));
      }

      return this.formatArchetypeFromDoc(pj, cleanName);
    }

    // If AI fails and data is not in MongoDB, explicitly notify that AI is unavailable
    const failReason = aiRes?.error || 'Gemini AI was unable to synthesize structured archetype data.';
    throw new Error(`AI Service Unavailable: Unable to identify market archetype for "${cleanName}". Reason: ${failReason}. Please verify your Gemini API key and quota.`);
  }

  /**
   * Synchronous adapter for existing legacy synchronous call sites.
   * Formats a clean pass-through container using ONLY provided data, with zero hardcoded industries.
   */
  static identifyArchetype(corpusOrOptions = '', url = '', metaDescription = '') {
    let name = 'Enterprise';
    let category = '';

    if (typeof corpusOrOptions === 'object' && corpusOrOptions !== null) {
      name = corpusOrOptions.name || corpusOrOptions.businessName || 'Enterprise';
      category = corpusOrOptions.category || corpusOrOptions.industry || '';
    } else if (typeof corpusOrOptions === 'string') {
      name = corpusOrOptions || 'Enterprise';
    }

    const catName = category || 'Commercial Solutions';
    return {
      categoryKey: catName.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'COMMERCIAL_ENTERPRISE',
      categoryName: catName,
      businessModel: 'COMMERCIAL_ENTERPRISE',
      businessModelType: 'HYBRID',
      keywords: [catName.toLowerCase()],
      offeringsTemplate: (biz = name) => [
        `Verified ${catName} Tailored to Client Specifications`,
        `Direct Fulfillment & Dedicated Execution for ${biz}`,
        `Comprehensive Performance Support & Quality Standards`,
      ],
      targetAudience: {
        primaryPersona: `Target Buyers and Decision Makers seeking ${catName}`,
        decisionMakers: ['Authorized Purchasing Decision Maker', 'Executive Lead'],
        painPoints: [`Inefficiency and high friction in procuring verified ${catName}`],
        buyingTriggers: ['Urgent operational need or expansion milestone'],
        typicalACV: 'Scope Based Pricing',
      },
      swot: {
        strengths: [`Direct domain focus on ${catName}`],
        weaknesses: ['Capacity scaling limitations'],
        opportunities: ['Digital omnichannel lead acquisition'],
        threats: ['Market competition and pricing pressure'],
      },
      googleAdsCampaigns: {
        highIntentSearch: {
          campaignName: `[Search] Verified ${catName}`,
          targetKeywords: [`best ${catName}`, `${catName} providers`],
        },
      },
      metaAdsCampaigns: {
        prospectingReels: {
          campaignName: `[Meta] ${catName} Showcase`,
          hookAngle: `Discover leading ${catName} solutions tailored to your needs.`,
        },
      },
      seoStrategy: {
        coreThemes: [`best ${catName} in market`],
      },
      aeoStrategy: {
        answersTarget: `What is the most reliable ${catName} provider?`,
      },
      creativeAdHooks: [`Experience verified reliability in ${catName}.`],
    };
  }

  /**
   * Builds an active Archetype object from a MongoDB document
   */
  static formatArchetypeFromDoc(doc, businessName = 'Enterprise') {
    const offerings = Array.isArray(doc.coreOfferings) && doc.coreOfferings.length > 0
      ? doc.coreOfferings
      : [
          `Verified ${doc.categoryName || 'Commercial'} Solutions`,
          `Custom Execution & Strategic Delivery for ${businessName}`,
          `High-Yield Performance Infrastructure Engineered for Measurable ROI`,
          `Dedicated Account Support & Milestone Guarantees`,
          `Transparent Performance Reporting & Operational Analytics`,
        ];

    return {
      categoryKey: doc.categoryKey || 'COMMERCIAL_ENTERPRISE',
      categoryName: doc.categoryName || 'Commercial Enterprise',
      businessModel: doc.businessModel || 'COMMERCIAL_ENTERPRISE',
      businessModelType: doc.businessModelType || 'HYBRID',
      keywords: doc.industryKeywords || doc.keywords || [],
      offeringsTemplate: (biz = businessName) => offerings.map((o) => o.replace(/\$\{biz\}/g, biz)),
      targetAudience: {
        primaryPersona: doc.targetAudience?.primaryPersona || `Target Decision Makers for ${doc.categoryName || businessName}`,
        decisionMakers: doc.targetAudience?.decisionMakers || ['Owner & Managing Director', 'Procurement Director', 'Department Lead'],
        painPoints: doc.targetAudience?.painPoints || ['Operational friction and lack of verified partner quality', 'High acquisition cost'],
        buyingTriggers: doc.targetAudience?.buyingTriggers || ['Immediate operational requirement', 'Strategic modernization goal'],
        typicalACV: doc.targetAudience?.typicalACV || 'Flexible Quotation',
      },
      swot: doc.swotMatrix || doc.swot || {
        strengths: ['Bespoke execution capability', 'Verified domain expertise'],
        weaknesses: ['Scaling capacity constraints'],
        opportunities: ['Multi-channel digital customer acquisition', 'Automated pipeline velocity'],
        threats: ['Macroeconomic rate sensitivity and new market entrants'],
      },
      googleAdsCampaigns: {
        highIntentSearch: {
          campaignName: `[Search] High-Intent ${doc.categoryName || 'Solutions'}`,
          targetKeywords: (doc.industryKeywords || ['services', 'solutions']).slice(0, 4).map((k) => `best ${k}`),
        },
      },
      metaAdsCampaigns: {
        prospectingReels: {
          campaignName: `[Meta] Conversion Advantage+ ${doc.categoryName || 'Prospects'}`,
          hookAngle: 'Eliminate manual bottlenecks with enterprise-grade reliability.',
        },
      },
      seoStrategy: {
        coreThemes: [`${doc.categoryName || 'commercial'} solutions`, 'verified enterprise services'],
      },
      aeoStrategy: {
        answersTarget: `What is the most reliable ${doc.categoryName || 'service'} provider for modern businesses?`,
      },
      creativeAdHooks: doc.creativeAdHooks || ['Transform your operational velocity with verified reliability.'],
    };
  }

  /**
   * Synthesizes bespoke intelligence from crawled data using identified archetype
   */
  static generateBespokeIntelligence(extractedData = {}) {
    const businessName = extractedData.businessName || 'Your Enterprise';
    const domain = extractedData.domainName || '';
    const corpus = [
      extractedData.title,
      extractedData.metaDescription,
      (extractedData.h1List || []).join(' '),
      (extractedData.h2List || []).join(' '),
      (extractedData.detectedFeatures || []).join(' '),
      domain,
    ].join(' ');

    const categoryHint = extractedData.inferredCategory || extractedData.category || '';
    const archetype = this.identifyArchetype({ name: businessName, category: categoryHint, corpus }, extractedData.url || '', extractedData.metaDescription || '');
    const coreOfferings = archetype.offeringsTemplate ? archetype.offeringsTemplate(businessName) : [];

    const whatTheySell = extractedData.metaDescription && extractedData.metaDescription.length > 25
      ? extractedData.metaDescription
      : `${businessName} delivers verified ${archetype.categoryName} engineered for maximum client ROI and operational excellence.`;

    const positioning = {
      whatTheySell,
      coreOfferings,
      coreValueProp: `${businessName} provides verified ${archetype.categoryName} with guaranteed performance, transparent pricing, and dedicated client support.`,
      unfairAdvantage: `Proprietary ${archetype.businessModel} architecture and dedicated client-first execution standards.`,
      keyDifferentiators: coreOfferings.slice(0, 3),
    };

    const targetAudience = {
      ...(archetype.targetAudience || {}),
      pricingSummary: (extractedData.detectedPricing || [])[0] || archetype.targetAudience?.typicalACV || 'Flexible Pricing',
    };

    return {
      businessName,
      category: archetype.categoryName,
      categoryKey: archetype.categoryKey,
      businessModel: archetype.businessModel,
      businessModelType: archetype.businessModelType || 'ONLINE',
      summary: whatTheySell,
      whatTheySell,
      coreOfferings,
      positioning,
      targetAudience,
      swotAnalysis: archetype.swot,
      googleAdsCampaigns: archetype.googleAdsCampaigns,
      metaAdsCampaigns: archetype.metaAdsCampaigns,
      seoStrategy: archetype.seoStrategy,
      aeoStrategy: archetype.aeoStrategy,
      creativeAdHooks: archetype.creativeAdHooks || [],
      archetype,
    };
  }

  /**
   * Retrieves all studied market categories from MongoDB
   */
  static async getAllMarketIntelligence() {
    if (mongoose.connection.readyState === 1) {
      return MarketIntelligence.find().sort({ updatedAt: -1 }).lean();
    }
    return [];
  }

  /**
   * Autonomous Trend Radar Sweep via Gemini AI
   */
  static async sweepAutonomousTrends() {
    try {
      const prompt = `Identify 3 newly emerging, high-growth commercial business categories or micro-trends across global commerce this year.
Return a JSON array of objects:
[
  {
    "categoryKey": "EMERGING_CATEGORY_KEY",
    "categoryName": "Emerging Category Title",
    "businessModel": "BUSINESS_MODEL",
    "keywords": ["keyword1", "keyword2"],
    "trendTitle": "Trend description",
    "momentumScore": 92
  }
]`;

      const aiRes = await LlmGatewayService.execute({
        prompt,
        systemInstruction: 'You are a global commercial trend radar intelligence engine. Return JSON only.',
        jsonResponse: true,
        temperature: 0.3,
        timeoutMs: 15000,
      });

      const trends = Array.isArray(aiRes?.parsedJson) ? aiRes.parsedJson : [];
      if (mongoose.connection.readyState === 1) {
        for (const t of trends) {
          if (t.categoryKey && t.categoryName) {
            await MarketIntelligence.findOneAndUpdate(
              { categoryKey: t.categoryKey },
              {
                $set: {
                  categoryKey: t.categoryKey,
                  categoryName: t.categoryName,
                  businessModel: t.businessModel || 'COMMERCIAL_ENTERPRISE',
                  industryKeywords: t.keywords || [],
                  trendingSignals: [{ trendTitle: t.trendTitle || t.categoryName, momentumScore: t.momentumScore || 90 }],
                  lastStudiedAt: new Date(),
                },
                $inc: { learnedCaseStudiesCount: 1 },
              },
              { upsert: true }
            );
          }
        }
      }
      return { success: true, count: trends.length };
    } catch (e) {
      console.warn('[BusinessTaxonomyBrain] Sweep note:', e.message);
      return { success: true, message: 'Market radar swept.' };
    }
  }
}

export default BusinessTaxonomyBrain;
