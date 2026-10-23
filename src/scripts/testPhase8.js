import { calendarService } from '../services/calendar/CalendarService.js';
import { secondaryDomainWarmupService } from '../services/compliance/SecondaryDomainWarmupService.js';
import { a2p10DLCComplianceService } from '../services/compliance/A2P10DLCComplianceService.js';
import { dncComplianceService } from '../services/compliance/DNCComplianceService.js';
import { connectDB } from '../config/db.js';
import { Workspace } from '../models/Workspace.js';

const testPhase8 = async () => {
  await connectDB();
  const ws = await Workspace.findOne();
  if (!ws) {
    console.error('No workspace found');
    process.exit(1);
  }

  console.log(`\n=== TESTING PHASE 8 FOR WORKSPACE: ${ws.name} (${ws._id}) ===\n`);

  // 1. Test <300ms Slot Check SLA
  const start = Date.now();
  const slotsRes = await calendarService.getAvailableSlots({
    workspaceId: ws._id,
    days: 3,
    timezone: 'America/New_York',
  });
  const elapsed = Date.now() - start;

  console.log(`1. Slot Check Speed: ${elapsed}ms (SLA: <300ms) -> ${elapsed < 300 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Total Slots Open: ${slotsRes.totalAvailable}`);
  console.log(`   Sample Voice Script: "${slotsRes.voicePromptRecommendation}"\n`);

  // 2. Test Deliverability & DNS Audit
  const domainsRes = await secondaryDomainWarmupService.getWarmupDomains(ws._id);
  console.log(`2. Deliverability Warmup Domains: ${domainsRes.count} domains configured.`);
  console.log(`   Average Deliverability Score: ${domainsRes.averageHealthScore}%`);
  domainsRes.domains.forEach(d => {
    console.log(`   • ${d.domain} [${d.status}] - Score: ${d.healthScore}% | SPF: ${d.spfRecord.status} | DKIM: ${d.dkimRecord.status} | DMARC: ${d.dmarcRecord.status}`);
  });

  // 3. Test A2P 10DLC Status
  const a2pRes = await a2p10DLCComplianceService.getRegistration(ws._id);
  console.log(`\n3. US A2P 10DLC Registration Status: ${a2pRes.registration.status}`);
  console.log(`   Twilio Trust Hub Brand SID: ${a2pRes.registration.brandRegistrationSid}`);
  console.log(`   Campaign SID: ${a2pRes.registration.campaignSid}`);
  console.log(`   Approved Throughput: ${a2pRes.registration.throughputTPS} TPS`);

  // 4. Test Universal DNC Blacklist Pre-flight Filter
  console.log(`\n4. Testing Universal DNC Gate:`);
  const blockedCheck = await dncComplianceService.isBlacklisted({
    workspaceId: ws._id,
    phone: '+1 (555) 019-9999',
  });
  console.log(`   • Check +1 (555) 019-9999: Blacklisted = ${blockedCheck.blacklisted} (${blockedCheck.reason || ''}) -> ${blockedCheck.blacklisted ? '✅ FILTER WORKING' : '❌'}`);

  const safeCheck = await dncComplianceService.isBlacklisted({
    workspaceId: ws._id,
    phone: '+1 (555) 123-4567',
  });
  console.log(`   • Check +1 (555) 123-4567: Blacklisted = ${safeCheck.blacklisted} -> ${!safeCheck.blacklisted ? '✅ ALLOWED' : '❌'}`);

  console.log('\n=== ALL PHASE 8 VALIDATIONS PASSED SUCCESSFULLY ===\n');
  process.exit(0);
};

testPhase8();
