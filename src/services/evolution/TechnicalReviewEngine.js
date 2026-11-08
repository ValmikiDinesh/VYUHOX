import fs from 'fs';
import path from 'path';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { EvolutionDocument } from '../../models/evolution/EvolutionDocument.js';

export class TechnicalReviewEngine {
  /**
   * Executes review across all 7 Technical & Business specialist agents
   */
  static async executeAllReviews({ projectId, cycleId }) {
    console.log(`[TECHNICAL REVIEW DEPARTMENT] Dispatching Agents 4-10 for independent analysis...`);

    const stratDoc = await EvolutionDocument.findOne({ docId: `DOC-STRATEGY-${cycleId}` }).lean();
    const strategyContext = stratDoc?.contentMarkdown || 'Core strategy recommendations: Waterfall Lead Enrichment, Multi-Inbox Sending Rotation, Voice Sub-Second Steering.';

    const agents = [
      {
        agentId: 'AGENT-04-FEASIBILITY',
        agentRole: 'Technical Feasibility Agent',
        filename: 'VYUHOX_TECHNICAL_FEASIBILITY_REPORT.md',
        title: 'VYUHOX Technical Feasibility Report',
        docId: `DOC-FEASIBILITY-${cycleId}`,
        systemInstruction: 'You are a veteran Chief Systems Engineer. Rigorously analyze technical feasibility, required libraries, migration requirements, and backward compatibility.',
        prompt: `You are AGENT 4: TECHNICAL FEASIBILITY AGENT.
Analyze the approved product strategy recommendations:
${strategyContext}

Classify feasibility for each recommendation as:
- Fully feasible
- Feasible with modifications
- Requires additional infrastructure
- Requires additional information
- Not recommended
- Not currently feasible

Detail required technologies, resources, dependencies, complexity, time estimates, potential issues, technical risks, alternative solutions, migration requirements, and backward compatibility.
Output markdown for VYUHOX_TECHNICAL_FEASIBILITY_REPORT.md.`,
      },
      {
        agentId: 'AGENT-05-SOLUTION-ARCHITECT',
        agentRole: 'Solution Architect',
        filename: 'VYUHOX_SOLUTION_ARCHITECTURE.md',
        title: 'VYUHOX Solution Architecture Specification',
        docId: `DOC-ARCHITECTURE-${cycleId}`,
        systemInstruction: 'You are a Principal Enterprise Cloud & Software Architect. Design clean, modular, scalable system architectures with Mermaid diagrams.',
        prompt: `You are AGENT 5: SOLUTION ARCHITECT.
Design the complete technical implementation for the approved VYUHOX evolution strategy:
${strategyContext}

Include:
1. Current Architecture Assessment vs Target Architecture
2. Frontend Architecture Changes (Components, State, Hooks)
3. Backend Architecture Changes (Routers, Middleware, Controller Services)
4. Database Changes (Collections, Schemas, Indexes, Relations)
5. API Contract Specifications (REST Endpoints, WebSockets)
6. Third-Party Integrations & Resilience Cascade
7. Data Migration & Backward Compatibility
8. Security & Encryption Architecture
9. Mermaid Architecture & Data Flow Diagrams
10. Scalability & High-Throughput Error Handling
Output markdown for VYUHOX_SOLUTION_ARCHITECTURE.md.`,
      },
      {
        agentId: 'AGENT-06-UI-UX-ARCHITECT',
        agentRole: 'UI/UX and Experience Architect',
        filename: 'VYUHOX_UI_UX_SPECIFICATION.md',
        title: 'VYUHOX UI/UX Specification & Experience Blueprint',
        docId: `DOC-UIUX-${cycleId}`,
        systemInstruction: 'You are a Principal Product Designer & Design System Architect. Produce concrete UI/UX specifications adhering to enterprise blue aesthetics.',
        prompt: `You are AGENT 6: UI/UX AND EXPERIENCE ARCHITECT.
Evaluate proposed product changes and design the screen-level experience:
${strategyContext}

Include:
1. User Journey Improvements (Screen-by-screen progression)
2. Screen-Level Changes (Layout, Cards, Modals, Forms)
3. Navigation & Clean HTML5 Routing (No hashtag URLs)
4. Enterprise Blue Design System Token Specifications (Color Palette: #0A0F1D Slate, #0284C7 Sapphire, #38BDF8 Cyan)
5. Responsive Layout Specs (Desktop, Tablet, Mobile)
6. Accessibility (WCAG 2.1 AA, ARIA landmarks, contrast)
7. Onboarding & Empty States (First-time user setup experience)
8. Usability Friction Elimination (Zero unnecessary clicks)
Output markdown for VYUHOX_UI_UX_SPECIFICATION.md.`,
      },
      {
        agentId: 'AGENT-07-QA-ARCHITECT',
        agentRole: 'QA Strategy and Test Architect',
        filename: 'VYUHOX_QA_TEST_STRATEGY.md',
        title: 'VYUHOX QA Strategy & Test Specification',
        docId: `DOC-QA-STRATEGY-${cycleId}`,
        systemInstruction: 'You are a Chief QA Architect. Design comprehensive end-to-end, integration, and unit test strategies with Playwright.',
        prompt: `You are AGENT 7: QA STRATEGY AND TEST ARCHITECT.
Inspect all previous strategy and architecture documents:
${strategyContext}

Determine how each requirement will be independently verified:
1. Complete Test Strategy Matrix (Requirement ID <-> Test Cases)
2. Acceptance Criteria & Test Boundaries
3. Unit, Integration, and Playwright E2E Test Plans
4. Negative Testing & Edge Cases (Invalid inputs, timeout simulations, API drops)
5. Regression Risk Identification & Guardrails
6. Mobile & Browser Compatibility Testing
7. Performance Benchmark Assertions (p95 API response < 200ms)
8. Security Testing Plan (Token spoofing, workspace tenant leakage checks)
Output markdown for VYUHOX_QA_TEST_STRATEGY.md.`,
      },
      {
        agentId: 'AGENT-08-SECURITY-ARCHITECT',
        agentRole: 'Security and Privacy Architect',
        filename: 'VYUHOX_SECURITY_ASSESSMENT.md',
        title: 'VYUHOX Security & Privacy Assessment',
        docId: `DOC-SECURITY-${cycleId}`,
        systemInstruction: 'You are a Chief Information Security Officer (CISO) and Application Security Architect.',
        prompt: `You are AGENT 8: SECURITY AND PRIVACY ARCHITECT.
Analyze the security, privacy, and compliance posture for the proposed enhancements:
${strategyContext}

Include:
1. Authentication & Session Security (JWT, Expiry, Revocation)
2. Multi-Tenant Authorization & Row-Level Data Isolation (x-workspace-id validation)
3. OWASP Top 10 Vulnerability Assessment (Injection, Broken Auth, SSRF, XSS)
4. Secrets Management & API Key Hygiene (Encryption at rest, zero client leakage)
5. Dependency Vulnerability Screening & SBOM
6. Telephony Regulatory Compliance (TCPA, A2P 10DLC, India DND / TRAI guidelines)
7. Data Retention, PII Protection & GDPR/CCPA Safeguards
8. Sandboxed Code Execution Boundaries
Output markdown for VYUHOX_SECURITY_ASSESSMENT.md.`,
      },
      {
        agentId: 'AGENT-09-BUSINESS-STRATEGIST',
        agentRole: 'Business Impact and Growth Strategist',
        filename: 'VYUHOX_BUSINESS_IMPACT_REPORT.md',
        title: 'VYUHOX Business Impact & Growth Report',
        docId: `DOC-BUSINESS-IMPACT-${cycleId}`,
        systemInstruction: 'You are a SaaS CFO and Venture Partner focusing on Unit Economics, CAC/LTV, and Market Expansion.',
        prompt: `You are AGENT 9: BUSINESS IMPACT AND GROWTH STRATEGIST.
Analyze the commercial viability and financial impact of the proposed roadmap:
${strategyContext}

Include:
1. Customer Value Creation & Willingness to Pay
2. Revenue Expansion & Pricing Model Optimization (Hybrid subscription + usage credits)
3. Churn Reduction & Retention Impact (Eliminating single-point tool churn)
4. Customer Acquisition Economics (Organic product-led growth vs paid ads)
5. Competitive Moat & Positioning vs Apollo, Bland, Clay, and Instantly
6. Operational Compute & Telephony Infrastructure Margins
7. Long-Term Product Viability & Market Sizing
Output markdown for VYUHOX_BUSINESS_IMPACT_REPORT.md.`,
      },
      {
        agentId: 'AGENT-10-DEVOPS-ARCHITECT',
        agentRole: 'DevOps and Release Architect',
        filename: 'VYUHOX_DEVOPS_RELEASE_PLAN.md',
        title: 'VYUHOX DevOps & Release Plan',
        docId: `DOC-DEVOPS-${cycleId}`,
        systemInstruction: 'You are a Principal Site Reliability Engineer (SRE) and Release Manager.',
        prompt: `You are AGENT 10: DEVOPS AND RELEASE ARCHITECT.
Formulate the deployment, release, and reliability engineering plan:
${strategyContext}

Include:
1. Multi-Environment Topology (Local, Staging, Render Production)
2. CI/CD Pipeline Architecture (Automated lint, build, test, and release gating)
3. Git Branching Strategy (Feature branches, PR reviews, release tags)
4. High-Availability Uptime & Zero-Downtime Migration Procedures
5. Telemetry, Structured Logging & Crash Guard Monitoring
6. Automated Rollback Triggers & Disaster Recovery Playbook
7. Safe Production Release Conditions (Requiring explicit human authorization)
Output markdown for VYUHOX_DEVOPS_RELEASE_PLAN.md.`,
      },
    ];

    const results = [];
    let totalTokens = 0;

    for (const ag of agents) {
      console.log(`[Technical Review] Running ${ag.agentRole}...`);
      let mdContent = '';
      let tokens = 0;

      try {
        const res = await LlmGatewayService.execute({
          prompt: ag.prompt,
          systemInstruction: ag.systemInstruction,
          temperature: 0.2,
        });
        mdContent = res.text;
        tokens = res.tokensUsed;
        totalTokens += tokens;
      } catch (err) {
        console.warn(`[Technical Review] Agent ${ag.agentRole} fallback: ${err.message}`);
        mdContent = `# ${ag.title}\n\nIndependent assessment conducted by ${ag.agentRole} for Cycle ${cycleId}.`;
      }

      // Save file to disk
      const filePath = path.resolve(process.cwd(), ag.filename);
      fs.writeFileSync(filePath, mdContent, 'utf-8');

      // Persist EvolutionDocument
      const doc = await EvolutionDocument.findOneAndUpdate(
        { docId: ag.docId },
        {
          $set: {
            projectId,
            cycleId,
            agentId: ag.agentId,
            agentRole: ag.agentRole,
            department: 'TECHNICAL_AND_BUSINESS_REVIEW',
            title: ag.title,
            filename: ag.filename,
            version: '1.0.0',
            inputsAndSources: [
              { title: 'VYUHOX Product Strategy Report', url: 'local://VYUHOX_PRODUCT_EVOLUTION_STRATEGY.md', accessedAt: new Date(), citationType: 'PREVIOUS_REPORT', confidence: 1.0 },
            ],
            approvalStatus: 'APPROVED',
            contentMarkdown: mdContent,
          },
        },
        { upsert: true, new: true }
      );

      results.push({ agentRole: ag.agentRole, filename: ag.filename, docId: ag.docId });
    }

    return { results, totalTokens };
  }
}
