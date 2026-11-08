import { EvolutionProject } from '../../models/evolution/EvolutionProject.js';
import { EvolutionCycle } from '../../models/evolution/EvolutionCycle.js';
import { EvolutionDocument } from '../../models/evolution/EvolutionDocument.js';
import { DigitalTwinService } from './DigitalTwinService.js';
import { LiveProductAuditAgent } from './LiveProductAuditAgent.js';
import { GlobalCompetitiveIntelligenceAgent } from './GlobalCompetitiveIntelligenceAgent.js';
import { ProductStrategyAgent } from './ProductStrategyAgent.js';
import { TechnicalReviewEngine } from './TechnicalReviewEngine.js';
import { ExecutiveCouncilEngine } from './ExecutiveCouncilEngine.js';
import { DeveloperOrchestrator } from './DeveloperOrchestrator.js';
import { TestingAndDefectEngine } from './TestingAndDefectEngine.js';
import { AgentMessage } from '../../models/evolution/AgentMessage.js';
import { AgentMemoryRecord } from '../../models/evolution/AgentMemoryRecord.js';

export class EvolutionOrchestrator {
  static socketIO = null;

  static setSocketIO(io) {
    this.socketIO = io;
  }

  static emitEvent(event, data) {
    if (this.socketIO) {
      this.socketIO.emit(event, data);
      this.socketIO.emit('evolution:event', { event, data, timestamp: new Date() });
    }
  }

  /**
   * Initializes or fetches the primary VYUHOX project profile
   */
  static async getOrInitProject() {
    let project = await EvolutionProject.findOne({ slug: 'vyuhox' });
    if (!project) {
      project = await EvolutionProject.create({
        name: 'VYUHOX',
        slug: 'vyuhox',
        liveProductionUrl: 'https://vyuhox.onrender.com',
        stagingUrl: 'http://localhost:5000',
        githubRepo: 'https://github.com/ValmikiDinesh/VYUHOX.git',
        ownerEmail: 'valmikidineshoffcl@gmail.com',
      });
    }
    return project;
  }

  /**
   * Starts a new evolution cycle or fetches existing active cycle
   */
  static async startCycle({ cycleId = 'CYCLE-2026-001', budgetUSD = 50.0, objective } = {}) {
    const project = await this.getOrInitProject();
    let cycle = await EvolutionCycle.findOne({ cycleId });

    if (!cycle) {
      cycle = await EvolutionCycle.create({
        cycleId,
        projectId: project._id,
        baselineVersion: '1.0.0',
        targetVersion: '1.1.0',
        budgetUSD,
        objective: objective || 'Autonomous end-to-end evolution cycle: Comprehensive audit, competitive benchmarking, strategic architecture, human approval, code generation, testing, and defect resolution.',
        currentStage: 'INITIALIZED',
      });
      project.activeCycleId = cycle._id;
      await project.save();
    }

    this.emitEvent('cycle:started', { cycleId, currentStage: cycle.currentStage });
    return { project, cycle };
  }

  /**
   * Stage 1: Run Research and Product Intelligence (Agents 1, 2, 3)
   */
  static async runResearchAndProductIntelligence(cycleId = 'CYCLE-2026-001') {
    const project = await this.getOrInitProject();
    let cycle = await EvolutionCycle.findOne({ cycleId });
    if (!cycle) {
      const res = await this.startCycle({ cycleId });
      cycle = res.cycle;
    }

    // 0. Sync Digital Twin
    this.emitEvent('agent:activity', { agent: 'DIGITAL_TWIN', message: 'Rescanning codebase AST and database models...' });
    const digitalTwin = await DigitalTwinService.syncDigitalTwin(project._id);

    // 1. Agent 1: Live Product Audit
    this.emitEvent('agent:activity', { agent: 'AGENT-01-LIVE-AUDIT', message: 'Inspecting live production at https://vyuhox.onrender.com...' });
    const auditRes = await LiveProductAuditAgent.executeAudit({
      projectId: project._id,
      cycleId,
      liveUrl: project.liveProductionUrl || 'https://vyuhox.onrender.com',
      stagingUrl: project.stagingUrl || 'http://localhost:5000',
    });

    // 2. Agent 2: Global Competitive Intelligence
    this.emitEvent('agent:activity', { agent: 'AGENT-02-COMPETITIVE-INTEL', message: 'Researching global leaders (Apollo, Bland, Clay, Instantly, Retell)...' });
    const compRes = await GlobalCompetitiveIntelligenceAgent.executeResearch({
      projectId: project._id,
      cycleId,
    });

    // 3. Agent 3: Product Strategy & Evolution
    this.emitEvent('agent:activity', { agent: 'AGENT-03-PRODUCT-STRATEGY', message: 'Formulating strategic roadmap and Checkpoint 1 Proposal...' });
    const stratRes = await ProductStrategyAgent.executeStrategy({
      projectId: project._id,
      cycleId,
    });

    // Update tokens & cost
    const totalTokens = (auditRes.tokensUsed || 0) + (compRes.tokensUsed || 0) + (stratRes.tokensUsed || 0);
    cycle.tokensUsed += totalTokens;
    cycle.costUSD += +((totalTokens / 1000000) * 0.15).toFixed(4);
    cycle.currentStage = 'CHECKPOINT_1_PROPOSAL_REVIEW';
    await cycle.save();

    // Broadcast ready for human review
    this.emitEvent('checkpoint:reached', {
      checkpoint: 'CHECKPOINT_1_PROPOSAL_REVIEW',
      cycleId,
      proposalDocId: stratRes.doc.docId,
      recommendationsCount: stratRes.recommendations.length,
    });

    return {
      success: true,
      stage: 'CHECKPOINT_1_PROPOSAL_REVIEW',
      auditDoc: auditRes.doc,
      compDoc: compRes.doc,
      stratDoc: stratRes.doc,
      cycle,
    };
  }

  /**
   * Checkpoint 1 Action: APPROVE, EDIT, or REJECT
   */
  static async handleCheckpoint1Decision({ cycleId = 'CYCLE-2026-001', action, comments, userEdits, decidedBy = 'Valmiki Dinesh' }) {
    const cycle = await EvolutionCycle.findOne({ cycleId });
    if (!cycle) throw new Error(`Cycle ${cycleId} not found.`);

    if (action === 'APPROVE') {
      cycle.humanCheckpoints.checkpoint1Proposal = {
        status: 'APPROVED',
        decidedAt: new Date(),
        decidedBy,
        comments: comments || 'Strategic proposal approved without modifications.',
        revisionCount: (cycle.humanCheckpoints.checkpoint1Proposal.revisionCount || 0),
      };
      cycle.currentStage = 'TECHNICAL_AND_BUSINESS_REVIEW';
      await cycle.save();

      this.emitEvent('checkpoint:decided', { checkpoint: 1, action: 'APPROVED', cycleId });

      // Trigger Technical Reviews and AI Executive Council automatically
      await this.runTechnicalReviewsAndCouncil(cycleId);
    } else if (action === 'EDIT') {
      cycle.humanCheckpoints.checkpoint1Proposal = {
        status: 'EDITED',
        decidedAt: new Date(),
        decidedBy,
        comments: comments || 'Modifications provided by owner.',
        userModifications: userEdits,
        revisionCount: (cycle.humanCheckpoints.checkpoint1Proposal.revisionCount || 0) + 1,
      };

      // Update strategy doc with revision
      const stratDoc = await EvolutionDocument.findOne({ docId: `DOC-STRATEGY-${cycleId}` });
      if (stratDoc) {
        stratDoc.revisions.push({
          version: `1.${cycle.humanCheckpoints.checkpoint1Proposal.revisionCount}.0`,
          modifiedAt: new Date(),
          modifiedBy: decidedBy,
          changeSummary: comments || 'Owner requirements amendment',
          previousContentMarkdown: stratDoc.contentMarkdown,
        });
        if (userEdits?.customRequirements) {
          stratDoc.contentMarkdown += `\n\n### Owner Amendments (Checkpoint 1):\n${userEdits.customRequirements}\n`;
        }
        stratDoc.approvalStatus = 'APPROVED';
        await stratDoc.save();
      }

      cycle.currentStage = 'TECHNICAL_AND_BUSINESS_REVIEW';
      await cycle.save();

      this.emitEvent('checkpoint:decided', { checkpoint: 1, action: 'EDITED', cycleId });
      await this.runTechnicalReviewsAndCouncil(cycleId);
    } else if (action === 'REJECT') {
      cycle.humanCheckpoints.checkpoint1Proposal = {
        status: 'REJECTED',
        decidedAt: new Date(),
        decidedBy,
        comments: comments || 'Proposal rejected by owner.',
      };
      cycle.status = 'PAUSED';
      await cycle.save();
      this.emitEvent('checkpoint:decided', { checkpoint: 1, action: 'REJECTED', cycleId });
    }

    return cycle;
  }

  /**
   * Stage 2: Technical & Business Reviews (Agents 4-10) and AI Executive Council (Part 5)
   */
  static async runTechnicalReviewsAndCouncil(cycleId = 'CYCLE-2026-001') {
    const project = await this.getOrInitProject();
    const cycle = await EvolutionCycle.findOne({ cycleId });

    // 1. Run all 7 technical & business reviews
    this.emitEvent('agent:activity', { agent: 'TECHNICAL_REVIEW_DEPT', message: 'Agents 4-10 generating independent review reports...' });
    const techRes = await TechnicalReviewEngine.executeAllReviews({ projectId: project._id, cycleId });

    // 2. Convene AI Executive Council (6 debate rounds)
    this.emitEvent('agent:activity', { agent: 'AI_EXECUTIVE_COUNCIL', message: 'Convening 8-member Council for 6-round structured debate...' });
    const councilRes = await ExecutiveCouncilEngine.conveneCouncil({ projectId: project._id, cycleId });

    const totalTokens = (techRes.totalTokens || 0) + (councilRes.tokensUsed || 0);
    cycle.tokensUsed += totalTokens;
    cycle.costUSD += +((totalTokens / 1000000) * 0.15).toFixed(4);
    cycle.currentStage = 'CHECKPOINT_2_MASTER_PLAN_REVIEW';
    await cycle.save();

    this.emitEvent('checkpoint:reached', {
      checkpoint: 'CHECKPOINT_2_MASTER_PLAN_REVIEW',
      cycleId,
      masterDocId: councilRes.masterDoc.docId,
    });

    return { success: true, stage: 'CHECKPOINT_2_MASTER_PLAN_REVIEW', councilRes, cycle };
  }

  /**
   * Checkpoint 2 Action: APPROVE, EDIT, or REJECT
   */
  static async handleCheckpoint2Decision({ cycleId = 'CYCLE-2026-001', action, comments, selectedFeatureIds, decidedBy = 'Valmiki Dinesh' }) {
    const cycle = await EvolutionCycle.findOne({ cycleId });
    if (!cycle) throw new Error(`Cycle ${cycleId} not found.`);

    if (action === 'APPROVE') {
      cycle.humanCheckpoints.checkpoint2MasterPlan = {
        status: 'APPROVED',
        decidedAt: new Date(),
        decidedBy,
        comments: comments || 'Master implementation plan approved for development.',
        selectedFeatureIds: selectedFeatureIds || ['REQ-01', 'REQ-02', 'REQ-03', 'REQ-04'],
        revisionCount: (cycle.humanCheckpoints.checkpoint2MasterPlan.revisionCount || 0),
      };
      cycle.currentStage = 'DEVELOPMENT';
      await cycle.save();

      this.emitEvent('checkpoint:decided', { checkpoint: 2, action: 'APPROVED', cycleId });

      // Trigger Development, Testing, and Defect Remediation
      await this.runDevelopmentTestingAndCorrection(cycleId);
    } else if (action === 'REJECT') {
      cycle.humanCheckpoints.checkpoint2MasterPlan = {
        status: 'REJECTED',
        decidedAt: new Date(),
        decidedBy,
        comments: comments || 'Master plan rejected.',
      };
      cycle.status = 'PAUSED';
      await cycle.save();
      this.emitEvent('checkpoint:decided', { checkpoint: 2, action: 'REJECTED', cycleId });
    }

    return cycle;
  }

  /**
   * Stage 3: Development, Automated Testing & Autonomous Defect Correction Loop
   */
  static async runDevelopmentTestingAndCorrection(cycleId = 'CYCLE-2026-001') {
    const project = await this.getOrInitProject();
    const cycle = await EvolutionCycle.findOne({ cycleId });

    // 1. Development Department (Agents 11-16)
    this.emitEvent('agent:activity', { agent: 'DEV_DEPT', message: 'Project Delivery Manager creating Epics, Tasks, and Code Branches...' });
    const tasks = await DeveloperOrchestrator.planAndExecuteDevelopment({ projectId: project._id, cycleId });

    // 2. Testing Department & Autonomous Defect Correction Loop (Agents 17-20)
    this.emitEvent('agent:activity', { agent: 'TESTING_DEPT', message: 'Executing Playwright automated test suites and defect correction loop...' });
    const testRes = await TestingAndDefectEngine.runAutomatedTestingAndCorrection({ projectId: project._id, cycleId });

    cycle.tokensUsed += testRes.totalTokens || 0;
    cycle.costUSD += +(((testRes.totalTokens || 0) / 1000000) * 0.15).toFixed(4);
    cycle.currentStage = 'PRODUCT_ACCEPTANCE';
    await cycle.save();

    this.emitEvent('cycle:stage_changed', { cycleId, currentStage: 'PRODUCT_ACCEPTANCE', defectRemediated: testRes.defect.defectId });

    return { success: true, tasks, testRes, cycle };
  }

  /**
   * Stage 4: Authorize Production Release Gate
   */
  static async authorizeProductionRelease({ cycleId = 'CYCLE-2026-001', authorizedBy = 'Valmiki Dinesh' }) {
    const cycle = await EvolutionCycle.findOne({ cycleId });
    if (!cycle) throw new Error(`Cycle ${cycleId} not found.`);

    cycle.humanCheckpoints.productionReleaseGate = {
      status: 'AUTHORIZED',
      authorizedAt: new Date(),
      authorizedBy,
    };
    cycle.currentStage = 'COMPLETED';
    cycle.status = 'COMPLETED';
    cycle.completedAt = new Date();
    await cycle.save();

    this.emitEvent('cycle:completed', { cycleId, authorizedBy, completedAt: cycle.completedAt });
    return cycle;
  }
}
