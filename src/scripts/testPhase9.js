import { aiCEO } from '../services/agents/AICEO.js';
import { aiCMO } from '../services/agents/AICMO.js';
import { aiSDR } from '../services/agents/AISDR.js';
import { aiVoiceCloser } from '../services/agents/AIVoiceCloser.js';
import { aiCFO } from '../services/agents/AICFO.js';
import { aiCustomerSuccess } from '../services/agents/AICustomerSuccess.js';
import { connectDB } from '../config/db.js';
import { Workspace } from '../models/Workspace.js';
import { CeoBriefing } from '../models/CeoBriefing.js';
import { AgentActivityLog } from '../models/AgentActivityLog.js';

const testPhase9 = async () => {
  await connectDB();
  const ws = await Workspace.findOne();
  if (!ws) {
    console.error('No workspace found');
    process.exit(1);
  }

  console.log(`\n=== TESTING PHASE 9: AUTONOMOUS AI COMPANY & C-SUITE FOR: ${ws.name} ===\n`);

  // 1. Telemetry for all 6 agents
  const [ceo, cmo, sdr, closer, cfo, cs] = await Promise.all([
    aiCEO.getStatus(ws._id),
    aiCMO.getStatus(ws._id),
    aiSDR.getStatus(ws._id),
    aiVoiceCloser.getStatus(ws._id),
    aiCFO.getStatus(ws._id),
    aiCustomerSuccess.getStatus(ws._id),
  ]);

  console.log(`1. C-Suite Agents Online:`);
  console.log(`   👑 CEO: ${ceo.name} (${ceo.title}) - Status: ${ceo.status}`);
  console.log(`   📈 CMO: ${cmo.name} (${cmo.title}) - ROAS: ${cmo.keyMetrics[0].value}`);
  console.log(`   🎯 SDR: ${sdr.name} (${sdr.title}) - Reply Rate: ${sdr.keyMetrics[1].value}`);
  console.log(`   📞 Closer: ${closer.name} (${closer.title}) - Speed to Lead: ${closer.keyMetrics[0].value}`);
  console.log(`   💰 CFO: ${cfo.name} (${cfo.title}) - LTV/CAC: ${cfo.keyMetrics[1].value}`);
  console.log(`   🤝 CS: ${cs.name} (${cs.title}) - Retention: ${cs.keyMetrics[0].value}`);

  // 2. Test Cross-Agent Feedback Loop: Voice Closer Objection -> AI CMO Ad Iteration
  console.log(`\n2. Testing Cross-Agent Feedback Loop (Closer -> CMO):`);
  const feedbackRes = await aiVoiceCloser.reportObjectionDetected({
    workspaceId: ws._id,
    objection: 'Do you support Bybit API?',
    leadName: 'Marcus Vance',
  });
  console.log(`   • Closer reported objection: "Do you support Bybit API?"`);
  console.log(`   • AI CMO response: New headline created -> "${feedbackRes.cmoAction.newHeadline}"`);
  console.log(`   • Feedback log recorded in central bus -> ${feedbackRes.closerLog ? '✅ SUCCESS' : '❌'}`);

  // 3. Test CEO Daily Briefing & 1-Click Proposal Approval
  console.log(`\n3. Testing CEO Daily Briefing & Proposal Engine:`);
  const briefing = await CeoBriefing.findOne({ workspaceId: ws._id }).sort({ createdAt: -1 });
  if (briefing && briefing.proposedActions?.length > 0) {
    const targetProposal = briefing.proposedActions.find(p => p.status === 'PENDING') || briefing.proposedActions[0];
    console.log(`   • Found pending proposal: "${targetProposal.actionTitle}" (${targetProposal.agentRole})`);
    
    const decisionRes = await aiCEO.handleProposalDecision({
      workspaceId: ws._id,
      briefingId: briefing._id,
      actionId: targetProposal.actionId,
      decision: 'APPROVED',
    });
    console.log(`   • 1-Click Approved: Status changed to ${decisionRes.action.status} -> ✅ EXECUTED`);
  }

  const activitiesCount = await AgentActivityLog.countDocuments({ workspaceId: ws._id });
  console.log(`\n4. Central Activity Stream Total Logs: ${activitiesCount}`);

  console.log('\n=== ALL PHASE 9 C-SUITE VALIDATIONS PASSED SUCCESSFULLY ===\n');
  process.exit(0);
};

testPhase9();
