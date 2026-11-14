const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';

async function testScrape() {
  await mongoose.connect(MONGODB_URI);
  const { LeadScraperService } = await import('../src/services/LeadScraperService.js');

  const wsId = '6ae1f5d0880ed8a2eb96e282'; // TORAN INVITES
  const jobId = 'test-toran-' + Date.now();

  console.log('Initiating test scrape for TORAN INVITES (5 leads)...');
  const result = await LeadScraperService.executeWaterfallScrape({
    jobId,
    workspaceId: wsId,
    domain: 'toraninvites.com',
    industry: 'Digital Wedding Invitations & Event Stationery',
    businessName: 'TORAN INVITES',
    location: 'Hyderabad, Telangana',
    locations: ['Hyderabad, Telangana'],
    limit: 5,
    targetRole: 'BUYER'
  });

  console.log('\n--- SCRAPE COMPLETED ---');
  console.log('Success:', result.success);
  console.log('Count:', result.count);
  console.log('Archetype:', result.archetype);

  // Print leads
  const Lead = mongoose.model('Lead');
  const leads = await Lead.find({ workspaceId: wsId }).sort({ createdAt: -1 }).limit(5);
  for (const l of leads) {
    console.log(`\nLead: ${l.name} | ${l.title}`);
    console.log(`Company: ${l.company} (${l.website})`);
    console.log(`Email: ${l.email} [${l.verificationStatus}]`);
    console.log(`Phone: ${l.phone || 'None'}`);
    console.log(`Tags: ${l.tags?.join(', ')}`);
  }

  process.exit(0);
}

testScrape().catch(err => {
  console.error('Test scrape failed:', err);
  process.exit(1);
});

