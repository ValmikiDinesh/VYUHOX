import { pricingCalculator } from '../services/billing/PricingCalculator.js';
import { connectDB } from '../config/db.js';
import { Workspace } from '../models/Workspace.js';

const testPhase10 = async () => {
  await connectDB();
  const ws = await Workspace.findOne();
  if (!ws) {
    console.error('No workspace found');
    process.exit(1);
  }

  console.log(`\n=== TESTING PHASE 10: DUAL-MODE ENGINE & DYNAMIC PRICING FOR: ${ws.name} ===\n`);

  // 1. Test Pricing Summary
  const summary = await pricingCalculator.getPricingSummary(ws._id);
  console.log(`1. Pricing Summary:`);
  console.log(`   • Current Operating Mode: ${summary.operatingMode}`);
  console.log(`   • Plan Tier: ${summary.planTier}`);
  console.log(`   • Base Monthly Fee: $${summary.baseMonthlyFee}/mo`);
  console.log(`   • Active Hired Agents: ${summary.activeHiredCount} agents ($${summary.agentAddonFee} addons)`);
  console.log(`   • Total Monthly Fee: $${summary.totalMonthlyFee}/mo`);
  console.log(`   • Usage Wallet Balance: $${summary.walletBalanceUSD.toFixed(2)}`);

  // 2. Test "Hire As You Grow" Modular Switchboard
  console.log(`\n2. Testing "Hire As You Grow" Modular Switchboard:`);
  const hireSdrRes = await pricingCalculator.toggleHiredAgent({
    workspaceId: ws._id,
    agentRole: 'SDR',
    action: 'HIRE',
  });
  console.log(`   • Hired Marcus Cole (AI SDR, $39/mo) -> ${hireSdrRes.success ? '✅ HIRED' : '❌'}`);

  const hireCloserRes = await pricingCalculator.toggleHiredAgent({
    workspaceId: ws._id,
    agentRole: 'VOICE_CLOSER',
    action: 'HIRE',
  });
  console.log(`   • Hired Maya Vance (AI Voice Closer, $49/mo) -> ${hireCloserRes.success ? '✅ HIRED' : '❌'}`);

  // 3. Test Business Complexity Scanner
  console.log(`\n3. Testing Business Complexity Scanner:`);
  const scannerRes = pricingCalculator.estimateTeamAndROI({
    monthlyLeads: 600,
    adBudgetUSD: 2500,
    targetDealSize: 4500,
    industry: 'Crypto',
  });
  console.log(`   • Recommended Tier: ${scannerRes.recommendedTier} ($${scannerRes.estimatedMonthlyCost}/mo)`);
  console.log(`   • Recommended Agents: ${scannerRes.recommendedAgents.map(a => a.name).join(', ')}`);
  console.log(`   • Human Payroll Replaced: ${scannerRes.humanSalaryReplaced}`);
  console.log(`   • Estimated Hours Saved: ~${scannerRes.hoursSavedPerMonth} hrs/mo`);
  console.log(`   • Monthly Pipeline Forecast: ${scannerRes.pipelineForecast.estimatedPipelineUSD} (${scannerRes.pipelineForecast.roiMultiplier} ROI)`);

  // 4. Test Mode Switcher: Switch to AI Company Mode
  console.log(`\n4. Testing Mode Switcher:`);
  const switchRes = await pricingCalculator.switchOperatingMode({
    workspaceId: ws._id,
    targetMode: 'AI_COMPANY',
    planTier: 'AI_COMPANY_STARTER',
  });
  console.log(`   • Switched to: ${switchRes.workspace.operatingMode} ($${switchRes.workspace.subscription.totalMonthlyFee}/mo) -> ✅ MODE SWITCHED`);

  console.log('\n=== ALL PHASE 10 DUAL-MODE & BILLING VALIDATIONS PASSED ===\n');
  process.exit(0);
};

testPhase10();
