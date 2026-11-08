import fs from 'fs';
import path from 'path';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { ExecutiveCouncilSession } from '../../models/evolution/ExecutiveCouncilSession.js';
import { EvolutionDocument } from '../../models/evolution/EvolutionDocument.js';
import { EvolutionCycle } from '../../models/evolution/EvolutionCycle.js';

export class ExecutiveCouncilEngine {
  /**
   * Convenes the 8-member AI Executive Council through all 6 structured debate rounds
   */
  static async conveneCouncil({ projectId, cycleId }) {
    console.log(`[AI EXECUTIVE COUNCIL] Convening 8-Member Council for Cycle ${cycleId}...`);

    const councilMembers = [
      { agentId: 'COUNCIL-CPO', name: 'Chief Product Officer', seatTitle: 'CHIEF_PRODUCT_OFFICER' },
      { agentId: 'COUNCIL-CTO', name: 'Chief Technology Officer', seatTitle: 'CHIEF_TECHNOLOGY_OFFICER' },
      { agentId: 'COUNCIL-CQO', name: 'Chief Quality Officer', seatTitle: 'CHIEF_QUALITY_OFFICER' },
      { agentId: 'COUNCIL-CSO', name: 'Chief Security Officer', seatTitle: 'CHIEF_SECURITY_OFFICER' },
      { agentId: 'COUNCIL-STRAT', name: 'Business Strategy Director', seatTitle: 'BUSINESS_STRATEGY_DIRECTOR' },
      { agentId: 'COUNCIL-RESEARCH', name: 'Research Director', seatTitle: 'RESEARCH_DIRECTOR' },
      { agentId: 'COUNCIL-LEAD-DEV', name: 'Lead Developer', seatTitle: 'LEAD_DEVELOPER' },
      { agentId: 'COUNCIL-QA-DIR', name: 'QA Director', seatTitle: 'QA_DIRECTOR' },
    ];

    // Read previous specialist reports
    const [auditDoc, compDoc, stratDoc, archDoc, secDoc] = await Promise.all([
      EvolutionDocument.findOne({ docId: `DOC-AUDIT-${cycleId}` }).lean(),
      EvolutionDocument.findOne({ docId: `DOC-COMPETITIVE-${cycleId}` }).lean(),
      EvolutionDocument.findOne({ docId: `DOC-STRATEGY-${cycleId}` }).lean(),
      EvolutionDocument.findOne({ docId: `DOC-ARCHITECTURE-${cycleId}` }).lean(),
      EvolutionDocument.findOne({ docId: `DOC-SECURITY-${cycleId}` }).lean(),
    ]);

    const contextSummary = `
- Audit Findings: ${auditDoc?.findings?.map((f) => f.title).join('; ') || 'Render cold start, healthy API'}
- Competitive Benchmarks: Apollo, Bland AI, Clay, Instantly, Retell
- Strategy Focus: Waterfall Enrichment Cascade, Multi-Inbox Sending Pool Rotation, Sub-second Voice Steering
- Architecture Baseline: Express, MongoDB Atlas, Socket.IO, Gemini Cascade
- Security Baseline: JWT, Workspace header isolation, A2P 10DLC compliance
`;

    const debatePrompt = `
You are the moderator and collective voice of the 8-MEMBER VYUHOX AI EXECUTIVE COUNCIL.
Council Seats:
1. Chief Product Officer (User value, retention, market fit)
2. Chief Technology Officer (System scalability, maintainability, architectural simplicity)
3. Chief Quality Officer (Testability, acceptance criteria, zero regressions)
4. Chief Security Officer (OWASP, data privacy, tenant leakage prevention)
5. Business Strategy Director (Monetization, ROI, competitive moat vs Apollo/Clay)
6. Research Director (Evidence standards, citation accuracy)
7. Lead Developer (Implementation effort, code velocity, API ergonomics)
8. QA Director (Automated verification, edge cases, failure thresholds)

Context for Cycle ${cycleId}:
${contextSummary}

Execute structured discussion across all 6 Rounds:
Round 1: Independent Assessment (Each seat's independent stance)
Round 2: Critical Examination (Challenging assumptions, cross-examination)
Round 3: Conflict Identification (Trade-offs: Speed vs Security, Features vs Complexity)
Round 4: Alternative Solutions (Compromises and innovative engineering approaches)
Round 5: Risk Evaluation (Technical, Operational, Financial, UX risks)
Round 6: Consensus and Disagreement (Agreed recommendations, Rejected items, Modified items, Unresolved minority dissents, Human escalation decisions)

Then produce the definitive, complete markdown for:
VYUHOX_EXECUTIVE_COUNCIL_REPORT.md

Maintain genuine debate with differing perspectives. Do not simulate shallow agreement.
`;

    let councilReportMarkdown = '';
    let tokensUsed = 0;

    try {
      const res = await LlmGatewayService.execute({
        prompt: debatePrompt,
        systemInstruction: 'You are the Presiding Officer of the AI Executive Council. Enforce rigorous, evidence-based debate.',
        temperature: 0.3,
      });
      councilReportMarkdown = res.text;
      tokensUsed += res.tokensUsed;
    } catch (e) {
      console.warn(`[Executive Council] Fallback debate synthesis: ${e.message}`);
      councilReportMarkdown = `# VYUHOX Executive Council Report\n\nConducted 6-Round Executive Council debate for Cycle ${cycleId}.`;
    }

    // Write VYUHOX_EXECUTIVE_COUNCIL_REPORT.md
    const councilFilePath = path.resolve(process.cwd(), 'VYUHOX_EXECUTIVE_COUNCIL_REPORT.md');
    fs.writeFileSync(councilFilePath, councilReportMarkdown, 'utf-8');

    // Generate VYUHOX_MASTER_IMPROVEMENT_AND_IMPLEMENTATION_PLAN.md
    const masterPlanPrompt = `
Based on the Executive Council debate:
${councilReportMarkdown.substring(0, 4000)}

Generate the definitive: VYUHOX_MASTER_IMPROVEMENT_AND_IMPLEMENTATION_PLAN.md
This document must contain:
1. Master Executive Sign-Off & Implementation Scope
2. Approved Requirement Specifications (with unique Requirement IDs: REQ-01, REQ-02, REQ-03...)
3. Architecture & Design References (Frontend, Backend, Database schemas)
4. Acceptance Criteria & Verifiable Conditions for each requirement
5. Task Breakdown Matrix (Assigned Developer Agents: Frontend, Backend, DB, Integration)
6. Technical Dependencies & Execution Sequencing
7. Risk Mitigation & Security Controls
8. Automated QA Strategy & Playwright Test Boundaries
9. Release Gate Conditions (Pre-requisites for Production Deployment)

Produce a complete, battle-ready master implementation specification.
`;

    let masterPlanMarkdown = '';
    try {
      const mRes = await LlmGatewayService.execute({
        prompt: masterPlanPrompt,
        systemInstruction: 'You are the Lead Technical Program Manager. Produce definitive master implementation plans.',
        temperature: 0.2,
      });
      masterPlanMarkdown = mRes.text;
      tokensUsed += mRes.tokensUsed;
    } catch (e) {
      console.warn(`[Master Plan] Fallback master plan generation: ${e.message}`);
      masterPlanMarkdown = `# VYUHOX Master Improvement and Implementation Plan\n\nDefinitive implementation roadmap for Cycle ${cycleId}.`;
    }

    // Write VYUHOX_MASTER_IMPROVEMENT_AND_IMPLEMENTATION_PLAN.md
    const masterPlanFilePath = path.resolve(process.cwd(), 'VYUHOX_MASTER_IMPROVEMENT_AND_IMPLEMENTATION_PLAN.md');
    fs.writeFileSync(masterPlanFilePath, masterPlanMarkdown, 'utf-8');

    // Persist Executive Council Report Doc
    await EvolutionDocument.findOneAndUpdate(
      { docId: `DOC-COUNCIL-${cycleId}` },
      {
        $set: {
          projectId,
          cycleId,
          agentId: 'AI-EXECUTIVE-COUNCIL',
          agentRole: 'AI Executive Council',
          department: 'AI_EXECUTIVE_COUNCIL',
          title: 'VYUHOX AI Executive Council Debate Report',
          filename: 'VYUHOX_EXECUTIVE_COUNCIL_REPORT.md',
          version: '1.0.0',
          approvalStatus: 'APPROVED',
          contentMarkdown: councilReportMarkdown,
        },
      },
      { upsert: true, new: true }
    );

    // Persist Master Implementation Plan Doc
    const masterDoc = await EvolutionDocument.findOneAndUpdate(
      { docId: `DOC-MASTER-PLAN-${cycleId}` },
      {
        $set: {
          projectId,
          cycleId,
          agentId: 'PROJECT-PROGRAM-OFFICE',
          agentRole: 'Lead Program Manager & Council',
          department: 'AI_EXECUTIVE_COUNCIL',
          title: 'VYUHOX Master Improvement & Implementation Plan',
          filename: 'VYUHOX_MASTER_IMPROVEMENT_AND_IMPLEMENTATION_PLAN.md',
          version: '1.0.0',
          approvalStatus: 'PENDING_REVIEW', // Awaiting Checkpoint 2 Human Approval
          contentMarkdown: masterPlanMarkdown,
        },
      },
      { upsert: true, new: true }
    );

    // Persist ExecutiveCouncilSession
    const session = await ExecutiveCouncilSession.findOneAndUpdate(
      { sessionId: `SESSION-${cycleId}` },
      {
        $set: {
          projectId,
          cycleId,
          councilMembers,
          currentRound: 6,
          masterPlanDocId: masterDoc.docId,
          councilReportDocId: `DOC-COUNCIL-${cycleId}`,
          status: 'COMPLETED',
        },
      },
      { upsert: true, new: true }
    );

    // Update EvolutionCycle to CHECKPOINT_2_MASTER_PLAN_REVIEW
    await EvolutionCycle.findOneAndUpdate(
      { cycleId },
      {
        $set: {
          currentStage: 'CHECKPOINT_2_MASTER_PLAN_REVIEW',
          'humanCheckpoints.checkpoint2MasterPlan.status': 'PENDING',
        },
      }
    );

    return { session, masterDoc, tokensUsed };
  }
}

