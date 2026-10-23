
async function runPhase11Tests() {
  console.log('🧪 Starting Phase 11 White-Labeling & Agency Reseller Automated Verification...');
  const baseUrl = 'http://localhost:5000';

  // 1. Test Agency Overview
  console.log('\n[1/5] Testing GET /api/agency/overview...');
  const overviewRes = await fetch(`${baseUrl}/api/agency/overview`);
  const overviewData = await overviewRes.json();
  if (!overviewData.success) {
    throw new Error(`Overview failed: ${overviewData.message}`);
  }
  console.log('✅ Agency Overview received:');
  console.log(`   - Agency: ${overviewData.agency.name} (${overviewData.agency.customDomain})`);
  console.log(`   - Total Sub-Clients: ${overviewData.metrics.totalSubClients}`);
  console.log(`   - Agency MRR: $${overviewData.metrics.totalAgencyMRR}/mo`);
  console.log(`   - Net Monthly Profit: $${overviewData.metrics.netAgencyTotalProfitUSD}/mo (Margin: ${overviewData.metrics.marginPercent}%)`);
  console.log(`   - Usage Markup: ${overviewData.metrics.markupPercent}% (Passive Margin: $${overviewData.metrics.passiveUsageMarginUSD})`);

  const agencyId = overviewData.agency.id;

  // 2. Test 1-Click Sub-Client Provisioning
  console.log('\n[2/5] Testing POST /api/agency/clients (1-Click Sub-Client Provisioning)...');
  const provisionRes = await fetch(`${baseUrl}/api/agency/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agencyWorkspaceId: agencyId,
      name: 'Vortex Global SaaS',
      industry: 'B2B',
      operatingMode: 'AI_COMPANY',
      adminEmail: 'founder@vortexsaas.ai',
      password: 'VortexSecure2026!',
      startingBalanceUSD: 100,
    }),
  });
  const provisionData = await provisionRes.json();
  if (!provisionData.success) {
    throw new Error(`Provisioning failed: ${provisionData.message}`);
  }
  console.log('✅ Sub-Client Workspace Provisioned:');
  console.log(`   - Client Name: ${provisionData.workspace.name}`);
  console.log(`   - Operating Mode: ${provisionData.workspace.operatingMode}`);
  console.log(`   - Admin User: ${provisionData.credentials.email}`);
  console.log(`   - Initial GTM Credits: $${provisionData.wallet.balanceUSD}`);

  // 3. Test Re-Billing & Markup Engine
  console.log('\n[3/5] Testing PUT /api/agency/rebilling (Markup Engine)...');
  const rebillRes = await fetch(`${baseUrl}/api/agency/rebilling`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agencyWorkspaceId: agencyId,
      usageMarkupPercent: 40,
      toolModeRetailPrice: 119,
      aiCompanyRetailPrice: 549,
      agentAddonRetailPrice: 89,
    }),
  });
  const rebillData = await rebillRes.json();
  if (!rebillData.success) {
    throw new Error(`Rebilling update failed: ${rebillData.message}`);
  }
  console.log('✅ Agency Re-Billing Engine Updated:');
  console.log(`   - Tool Retail: $${rebillData.resellerConfig.toolModeRetailPrice}/mo (Wholesale: $49/mo)`);
  console.log(`   - AI Company Retail: $${rebillData.resellerConfig.aiCompanyRetailPrice}/mo (Wholesale: $249/mo)`);
  console.log(`   - Surcharge Margin: ${rebillData.resellerConfig.usageMarkupPercent}%`);

  // 4. Test Cloudflare for SaaS Domain Verification
  console.log('\n[4/5] Testing POST /api/agency/domain/verify (Cloudflare for SaaS CNAME & SSL)...');
  const verifyRes = await fetch(`${baseUrl}/api/agency/domain/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: agencyId,
      domain: 'gtm.growthaccelerator.io',
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    throw new Error(`Domain verification failed: ${verifyData.message}`);
  }
  console.log('✅ Custom Hostname & SSL Verified:');
  console.log(`   - Custom Domain: ${verifyData.domain}`);
  console.log(`   - CNAME Target: ${verifyData.cloudflareHost.cnameTarget}`);
  console.log(`   - SSL Status: ${verifyData.sslStatus} (${verifyData.cloudflareHost.ssl.issuer})`);
  console.log(`   - Proxy Protection: ${verifyData.cloudflareHost.edgeRouting.ddosProtection}`);

  // 5. Test Dynamic White-Label Header and Config Resolution
  console.log('\n[5/5] Testing Dynamic White-Label Resolution via Host Header / Config...');
  const wlConfigRes = await fetch(`${baseUrl}/api/whitelabel/whitelabel-config?previewDomain=gtm.growthaccelerator.io`);
  const wlData = await wlConfigRes.json();
  if (!wlData.success || !wlData.branding) {
    throw new Error(`White-label resolution failed.`);
  }
  console.log('✅ White-label config resolved:');
  console.log(`   - Company Name: ${wlData.branding.companyName}`);
  console.log(`   - Primary Color: ${wlData.branding.primaryColor}`);
  console.log(`   - Custom Domain: ${wlData.branding.customDomain}`);
  console.log(`   - SSL Status: ${wlData.branding.sslStatus}`);

  console.log('\n🎉 ALL PHASE 11 BACKEND TESTS PASSED 100%!');
}

runPhase11Tests().catch((err) => {
  console.error('❌ Phase 11 Test Failure:', err.message);
  process.exit(1);
});
