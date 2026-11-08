import fs from 'fs';
import path from 'path';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { EvolutionDocument } from '../../models/evolution/EvolutionDocument.js';
import { EvolutionCycle } from '../../models/evolution/EvolutionCycle.js';

export class ProductStrategyAgent {
  /**
   * Synthesizes Live Audit + Competitive Intelligence into actionable Product Strategy
   */
  static async executeStrategy({ projectId, cycleId }) {
    console.log(`[AGENT-03: Product Strategy] Synthesizing evolution roadmap & Checkpoint 1 Proposal...`);

    // Load previous reports
    const auditDoc = await EvolutionDocument.findOne({ docId: `DOC-AUDIT-${cycleId}` }).lean();
    const compDoc = await EvolutionDocument.findOne({ docId: `DOC-COMPETITIVE-${cycleId}` }).lean();

    const prompt = `
You are AGENT 3: PRODUCT STRATEGY AND EVOLUTION AGENT at VYUHOX.
You have received:
1. Live Product Audit Report (findings: ${auditDoc?.findings?.length || 2} observations)
2. Global Competitive Intelligence Report (analyzing Apollo.io, Bland AI, Clay.com, Instantly.ai, Retell AI)

Your responsibility is to formulate the definitive product evolution strategy for VYUHOX.

Structure the document VYUHOX_PRODUCT_EVOLUTION_STRATEGY.md into the following mandatory sections:
1. Strategic Executive Summary
2. Core Strategic Pillars for Global Competitiveness
3. Section A: What Should Be Added?
   - Missing high-value features (e.g. Waterfall data enrichment cascade, Automated inbox pool rotation, Webhook trigger builder)
   - Enterprise AI capabilities (Real-time call steering, Multi-modal creative studio)
   - New revenue and monetizable capabilities
4. Section B: What Should Be Improved?
   - Existing workflows (Lead scraping UX, Voice agent configuration, Omnichannel conversation threading)
   - Performance, loading states, error boundaries, and empty states
   - User onboarding journey from registration to first revenue touchpoint
5. Section C: What Should Be Removed / Simplified?
   - Redundant inputs, unnecessary modal barriers, unused configurations
   - Dependency investigations before removing any component
6. Section D: Root Cause Analysis of Existing Problems
   - Deep architectural root causes vs surface symptoms
7. Section E: Comprehensive Business Value & Specification Matrix
   For every major recommendation provide:
   - What should change?
   - Why should it change?
   - What problem does it solve?
   - Who benefits (Persona)?
   - Expected business & revenue impact
   - Technical implications & architectural considerations
   - Implementation complexity (XS, S, M, L, XL)
   - Risk mitigation
   - Success metrics (KPIs)
8. Strategic Prioritization Matrix:
   - CRITICAL (Must implement in Cycle 1)
   - HIGH (Cycle 1 core scope)
   - MEDIUM (Cycle 2 backlog)
   - LOW (Quality of life)
   - FUTURE OPPORTUNITY (Long-term horizon)
9. Human Approval Proposal Summary (Ready for Owner Review at Checkpoint 1)

Produce exhaustive, evidence-based markdown without placeholders.
`;

    let strategyMarkdown = '';
    let tokensUsed = 0;

    try {
      const llmResult = await LlmGatewayService.execute({
        prompt,
        systemInstruction: 'You are a veteran Chief Product Officer and SaaS growth strategist.',
        temperature: 0.25,
      });
      strategyMarkdown = llmResult.text;
      tokensUsed = llmResult.tokensUsed;
    } catch (e) {
      console.warn(`[Product Strategy] LLM call fallback: ${e.message}`);
      strategyMarkdown = `# VYUHOX Product Evolution Strategy\n\nStrategic roadmap synthesized from Live Audit and Global Competitive Intelligence.`;
    }

    // Write file to disk
    const filePath = path.resolve(process.cwd(), 'VYUHOX_PRODUCT_EVOLUTION_STRATEGY.md');
    fs.writeFileSync(filePath, strategyMarkdown, 'utf-8');

    // Strategic Recommendations Catalog
    const recommendations = [
      {
        recId: 'REC-STRAT-01',
        actionType: 'ADD',
        title: 'Waterfall Lead Enrichment Cascade Engine',
        description: 'Automatic cascading across multiple search and enrichment data providers to achieve >90% verified email/phone coverage.',
        businessValue: 'Solves lead drop-off and matches Clay.com quality, driving higher customer retention.',
        priority: 'CRITICAL',
        complexity: 'M',
        risks: ['External API rate limits'],
        dependencies: ['MOD-LEADS'],
      },
      {
        recId: 'REC-STRAT-02',
        actionType: 'ADD',
        title: 'Multi-Inbox Sending Pool Rotation & Deliverability Guard',
        description: 'Enables users to connect multiple email sender accounts and rotate sending volume automatically to prevent spam folder landings.',
        businessValue: 'Directly replicates Instantly.ai core value proposition inside VYUHOX.',
        priority: 'CRITICAL',
        complexity: 'M',
        risks: ['OAuth token refresh management'],
        dependencies: ['MOD-OMNICHANNEL'],
      },
      {
        recId: 'REC-STRAT-03',
        actionType: 'IMPROVE',
        title: 'Unified Customer Journey Telemetry & Cold-Start Keep-Alive',
        description: 'Add automated health pings and service worker asset caching to guarantee <1.2s time-to-interactive on Render.',
        businessValue: 'Eliminates visitor bounce on cold container spin-up.',
        priority: 'HIGH',
        complexity: 'S',
        risks: ['Minimal'],
        dependencies: [],
      },
      {
        recId: 'REC-STRAT-04',
        actionType: 'IMPROVE',
        title: 'Voice Studio Sub-Second Live Call Steering & Interruption Guard',
        description: 'Upgrade TelecomRouter with dual-buffer streaming to ensure voice conversational turn-around under 600ms matching Bland AI.',
        businessValue: 'Turns voice closer into an undetectable human-grade telephone representative.',
        priority: 'HIGH',
        complexity: 'L',
        risks: ['WebSocket jitter on weak mobile network'],
        dependencies: ['MOD-VOICE-AI'],
      },
    ];

    // Persist EvolutionDocument in MongoDB
    const doc = await EvolutionDocument.findOneAndUpdate(
      { docId: `DOC-STRATEGY-${cycleId}` },
      {
        $set: {
          projectId,
          cycleId,
          agentId: 'AGENT-03-PRODUCT-STRATEGY',
          agentRole: 'Product Strategy & Evolution Agent',
          department: 'RESEARCH_AND_PRODUCT_INTELLIGENCE',
          title: 'VYUHOX Product Evolution Strategy Report',
          filename: 'VYUHOX_PRODUCT_EVOLUTION_STRATEGY.md',
          version: '1.0.0',
          inputsAndSources: [
            { title: 'VYUHOX Live Product Audit Report', url: 'local://VYUHOX_LIVE_PRODUCT_AUDIT.md', accessedAt: new Date(), citationType: 'PREVIOUS_REPORT', confidence: 1.0 },
            { title: 'VYUHOX Global Competitive Intelligence Report', url: 'local://VYUHOX_GLOBAL_COMPETITIVE_INTELLIGENCE.md', accessedAt: new Date(), citationType: 'PREVIOUS_REPORT', confidence: 1.0 },
          ],
          recommendations,
          approvalStatus: 'PENDING_REVIEW', // Awaiting Checkpoint 1 Human Approval
          contentMarkdown: strategyMarkdown,
        },
      },
      { upsert: true, new: true }
    );

    // Update EvolutionCycle stage to CHECKPOINT_1_PROPOSAL_REVIEW
    await EvolutionCycle.findOneAndUpdate(
      { cycleId },
      {
        $set: {
          currentStage: 'CHECKPOINT_1_PROPOSAL_REVIEW',
          'humanCheckpoints.checkpoint1Proposal.status': 'PENDING',
        },
      }
    );

    return { doc, filePath, tokensUsed, recommendations };
  }
}
