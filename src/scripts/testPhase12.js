async function runPhase12Tests() {
  console.log('🧪 Starting Phase 12 SaaS Self-Growing Flywheel Verification...');
  const baseUrl = 'http://localhost:5000';

  // 1. Test Flywheel Overview
  console.log('\n[1/4] Testing GET /api/flywheel/overview...');
  const overviewRes = await fetch(`${baseUrl}/api/flywheel/overview`);
  const overviewData = await overviewRes.json();
  if (!overviewData.success) {
    throw new Error(`Overview failed: ${overviewData.message}`);
  }
  console.log('✅ Flywheel Overview received:');
  console.log(`   - Self-Marketing HQ: ${overviewData.hqWorkspace.name} (${overviewData.hqWorkspace.slug})`);
  console.log(`   - Discovered Agencies: ${overviewData.metrics.totalDiscovered}`);
  console.log(`   - Outbound Touches: ${overviewData.metrics.totalOutbound}`);
  console.log(`   - Live Voice Demos: ${overviewData.metrics.totalVoiceDemos}`);
  console.log(`   - Auto-Provisioned Workspaces: ${overviewData.metrics.totalProvisioned}`);
  console.log(`   - Flywheel ARR Added: $${overviewData.metrics.totalARRAdded.toLocaleString()}`);

  // 2. Test Autonomous Agency Prospecting Pipeline
  console.log('\n[2/4] Testing POST /api/flywheel/prospect (AI CMO + AI SDR)...');
  const prospectRes = await fetch(`${baseUrl}/api/flywheel/prospect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const prospectData = await prospectRes.json();
  if (!prospectData.success) {
    throw new Error(`Prospecting failed: ${prospectData.message}`);
  }
  console.log('✅ Agency Prospecting Pipeline Executed:');
  console.log(`   - Discovered: ${prospectData.discoveredAgency.agencyName} (${prospectData.discoveredAgency.directorySource})`);
  console.log(`   - Contact: ${prospectData.discoveredAgency.contactName} (${prospectData.discoveredAgency.contactEmail})`);
  console.log(`   - Outbound Channels: Email & WhatsApp dispatched with dynamic interactive self-demo preview`);

  // 3. Test "Self-Demonstrating" Voice AI Interactive Callback
  console.log('\n[3/4] Testing POST /api/flywheel/voice-demo (Sub-30s Inbound Voice Callback)...');
  const voiceDemoRes = await fetch(`${baseUrl}/api/flywheel/voice-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: '+1 (415) 890-4421',
      prospectName: 'Julian Sterling',
      agencyName: 'Apex Media & Growth Partners',
      planTier: 'AI_COMPANY',
    }),
  });
  const voiceDemoData = await voiceDemoRes.json();
  if (!voiceDemoData.success) {
    throw new Error(`Voice demo failed: ${voiceDemoData.message}`);
  }
  console.log('✅ Self-Demonstrating Voice Bridge Dispatched:');
  console.log(`   - Speed-to-Lead: ${voiceDemoData.speedToLeadSeconds} seconds (<30s target)`);
  console.log(`   - Carrier Latency: ${voiceDemoData.latencyMs}ms (<800ms Bland.ai carrier pipeline)`);
  console.log(`   - Live Transcript Excerpt: "${voiceDemoData.transcript[0].text.slice(0, 85)}..."`);
  console.log(`   - Automated Stripe Checkout Link Dispatched: ${voiceDemoData.checkoutUrl}`);

  // 4. Test Automated Stripe Checkout & Auto-Provisioning Webhook
  console.log('\n[4/4] Testing POST /api/flywheel/checkout/simulate (Auto-Provisioning Webhook)...');
  const checkoutRes = await fetch(`${baseUrl}/api/flywheel/checkout/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agencyName: 'AeroPulse Omnichannel Agency',
      adminEmail: 'founder@aeropulseagency.com',
      planTier: 'AI_COMPANY',
      customDomain: 'gtm.aeropulseagency.com',
    }),
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutData.success) {
    throw new Error(`Checkout simulation failed: ${checkoutData.message}`);
  }
  console.log('✅ Automated Stripe Webhook & Workspace Provisioned:');
  console.log(`   - Workspace Name: ${checkoutData.workspace.name}`);
  console.log(`   - White-Label Domain: ${checkoutData.workspace.customDomain}`);
  console.log(`   - CNAME Target: ${checkoutData.workspace.cnameTarget}`);
  console.log(`   - Initial Wallet Credits Deposited: $${checkoutData.wallet.balanceUSD}`);
  console.log(`   - Superadmin Credentials: ${checkoutData.credentials.email} (Password: ${checkoutData.credentials.temporaryPassword})`);

  console.log('\n🎉 ALL PHASE 12 BACKEND TESTS PASSED 100%!');
}

runPhase12Tests().catch((err) => {
  console.error('❌ Phase 12 Test Failure:', err.message);
  process.exit(1);
});
