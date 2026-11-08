import express from 'express';
import { EvolutionProject } from '../models/evolution/EvolutionProject.js';
import { DigitalTwin } from '../models/evolution/DigitalTwin.js';
import { EvolutionCycle } from '../models/evolution/EvolutionCycle.js';
import { EvolutionDocument } from '../models/evolution/EvolutionDocument.js';
import { ExecutiveCouncilSession } from '../models/evolution/ExecutiveCouncilSession.js';
import { EvolutionTask } from '../models/evolution/EvolutionTask.js';
import { DefectRecord } from '../models/evolution/DefectRecord.js';
import { AgentMessage } from '../models/evolution/AgentMessage.js';
import { EvolutionOrchestrator } from '../services/evolution/EvolutionOrchestrator.js';
import { DigitalTwinService } from '../services/evolution/DigitalTwinService.js';

const router = express.Router();

// 1. Project Profile
router.get('/project', async (req, res) => {
  try {
    const project = await EvolutionOrchestrator.getOrInitProject();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/project', async (req, res) => {
  try {
    const project = await EvolutionProject.findOneAndUpdate(
      { slug: 'vyuhox' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Digital Twin
router.get('/digital-twin', async (req, res) => {
  try {
    const project = await EvolutionOrchestrator.getOrInitProject();
    let dt = await DigitalTwin.findOne({ projectId: project._id }).lean();
    if (!dt) {
      dt = await DigitalTwinService.syncDigitalTwin(project._id);
    }
    res.json({ success: true, digitalTwin: dt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/digital-twin/rescan', async (req, res) => {
  try {
    const project = await EvolutionOrchestrator.getOrInitProject();
    const dt = await DigitalTwinService.syncDigitalTwin(project._id);
    res.json({ success: true, digitalTwin: dt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Cycle Management
router.get('/cycle/:cycleId', async (req, res) => {
  try {
    const cycle = await EvolutionCycle.findOne({ cycleId: req.params.cycleId }).lean();
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle not found' });
    res.json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/cycle/start', async (req, res) => {
  try {
    const { cycleId, budgetUSD, objective } = req.body;
    const result = await EvolutionOrchestrator.startCycle({ cycleId, budgetUSD, objective });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Autonomous Stages Execution
router.post('/stage/research', async (req, res) => {
  try {
    const { cycleId } = req.body;
    const result = await EvolutionOrchestrator.runResearchAndProductIntelligence(cycleId || 'CYCLE-2026-001');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Checkpoints
router.post('/checkpoint/1/decide', async (req, res) => {
  try {
    const { cycleId, action, comments, userEdits, decidedBy } = req.body;
    const cycle = await EvolutionOrchestrator.handleCheckpoint1Decision({
      cycleId,
      action,
      comments,
      userEdits,
      decidedBy,
    });
    res.json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/checkpoint/2/decide', async (req, res) => {
  try {
    const { cycleId, action, comments, selectedFeatureIds, decidedBy } = req.body;
    const cycle = await EvolutionOrchestrator.handleCheckpoint2Decision({
      cycleId,
      action,
      comments,
      selectedFeatureIds,
      decidedBy,
    });
    res.json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/release-gate/authorize', async (req, res) => {
  try {
    const { cycleId, authorizedBy } = req.body;
    const cycle = await EvolutionOrchestrator.authorizeProductionRelease({ cycleId, authorizedBy });
    res.json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Documents
router.get('/documents', async (req, res) => {
  try {
    const { cycleId, department } = req.query;
    const filter = {};
    if (cycleId) filter.cycleId = cycleId;
    if (department) filter.department = department;

    const docs = await EvolutionDocument.find(filter)
      .select('docId title filename agentRole department version approvalStatus updatedAt')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/documents/:docId', async (req, res) => {
  try {
    const doc = await EvolutionDocument.findOne({ docId: req.params.docId }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/documents/:docId', async (req, res) => {
  try {
    const { contentMarkdown, changeSummary, modifiedBy } = req.body;
    const doc = await EvolutionDocument.findOne({ docId: req.params.docId });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.revisions.push({
      version: doc.version,
      modifiedAt: new Date(),
      modifiedBy: modifiedBy || 'User Editor',
      changeSummary: changeSummary || 'Manual document revision',
      previousContentMarkdown: doc.contentMarkdown,
    });

    const parts = doc.version.split('.');
    parts[parts.length - 1] = String(Number(parts[parts.length - 1]) + 1);
    doc.version = parts.join('.');
    doc.contentMarkdown = contentMarkdown;
    await doc.save();

    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Executive Council Sessions
router.get('/council-session/:cycleId', async (req, res) => {
  try {
    const session = await ExecutiveCouncilSession.findOne({ cycleId: req.params.cycleId }).lean();
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Tasks & Defects
router.get('/tasks/:cycleId', async (req, res) => {
  try {
    const tasks = await EvolutionTask.find({ cycleId: req.params.cycleId }).lean();
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/defects/:cycleId', async (req, res) => {
  try {
    const defects = await DefectRecord.find({ cycleId: req.params.cycleId }).lean();
    res.json({ success: true, defects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. 20-Agent Workforce Directory
router.get('/agents', async (req, res) => {
  try {
    const agents = [
      { id: 'AGENT-01', name: 'Live Product Audit Agent', department: 'Research & Product Intelligence', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_LIVE_PRODUCT_AUDIT.md' },
      { id: 'AGENT-02', name: 'Global Competitive Intelligence Agent', department: 'Research & Product Intelligence', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_GLOBAL_COMPETITIVE_INTELLIGENCE.md' },
      { id: 'AGENT-03', name: 'Product Strategy & Evolution Agent', department: 'Research & Product Intelligence', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_PRODUCT_EVOLUTION_STRATEGY.md' },
      { id: 'AGENT-04', name: 'Technical Feasibility Agent', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_TECHNICAL_FEASIBILITY_REPORT.md' },
      { id: 'AGENT-05', name: 'Solution Architect', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_SOLUTION_ARCHITECTURE.md' },
      { id: 'AGENT-06', name: 'UI/UX & Experience Architect', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_UI_UX_SPECIFICATION.md' },
      { id: 'AGENT-07', name: 'QA Strategy & Test Architect', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_QA_TEST_STRATEGY.md' },
      { id: 'AGENT-08', name: 'Security & Privacy Architect', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_SECURITY_ASSESSMENT.md' },
      { id: 'AGENT-09', name: 'Business Impact & Growth Strategist', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_BUSINESS_IMPACT_REPORT.md' },
      { id: 'AGENT-10', name: 'DevOps & Release Architect', department: 'Technical & Business Review', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_DEVOPS_RELEASE_PLAN.md' },
      { id: 'COUNCIL', name: 'AI Executive Council (8 Seats)', department: 'AI Executive Council', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 6, deliverable: 'VYUHOX_EXECUTIVE_COUNCIL_REPORT.md' },
      { id: 'AGENT-11', name: 'Project Delivery Manager', department: 'Development Department', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 4, deliverable: 'Epics & Task Hierarchy' },
      { id: 'AGENT-12', name: 'Frontend Developer', department: 'Development Department', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'React 19 Components' },
      { id: 'AGENT-13', name: 'Backend Developer', department: 'Development Department', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 2, deliverable: 'Express Routers & Services' },
      { id: 'AGENT-14', name: 'Database Specialist', department: 'Development Department', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'Mongoose Schemas & Indexes' },
      { id: 'AGENT-15', name: 'Integration Engineer', department: 'Development Department', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'Third-Party Cascades' },
      { id: 'AGENT-16', name: 'Code Reviewer', department: 'Development Department', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 4, deliverable: 'Code Review Signoffs' },
      { id: 'AGENT-17', name: 'QA Execution Engineer', department: 'Post-Dev Testing & Governance', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_QA_EXECUTION_REPORT.md' },
      { id: 'AGENT-18', name: 'Independent Security Auditor', department: 'Post-Dev Testing & Governance', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_FINAL_SECURITY_REPORT.md' },
      { id: 'AGENT-19', name: 'Performance & Reliability Engineer', department: 'Post-Dev Testing & Governance', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_PERFORMANCE_REPORT.md' },
      { id: 'AGENT-20', name: 'Product Acceptance Auditor', department: 'Post-Dev Testing & Governance', status: 'ONLINE', model: 'gemini-3.5-flash-lite', tasksCompleted: 1, deliverable: 'VYUHOX_FINAL_PRODUCT_ACCEPTANCE_REPORT.md' },
    ];
    res.json({ success: true, agents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Messages & Inter-Agent Feed
router.get('/messages/:cycleId', async (req, res) => {
  try {
    const messages = await AgentMessage.find({ cycleId: req.params.cycleId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

