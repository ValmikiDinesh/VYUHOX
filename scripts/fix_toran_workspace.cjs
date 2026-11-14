const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';

async function updateToran() {
  await mongoose.connect(MONGODB_URI);
  const Workspace = mongoose.model('Workspace', new mongoose.Schema({}, { strict: false }));
  const GtmStrategy = mongoose.model('GtmStrategy', new mongoose.Schema({}, { strict: false }));
  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));

  const wsId = new mongoose.Types.ObjectId('6ae1f5d0880ed8a2eb96e282');
  
  // 1. Update Workspace
  await Workspace.updateOne(
    { _id: wsId },
    {
      $set: {
        industry: 'Digital Wedding Invitations & Event Stationery',
        businessCategory: 'Wedding Invitations & Event Media',
        businessModelDescription: 'Customized multilingual digital invitation videos and personalized event websites for weddings, engagements, and family ceremonies.',
        targetUrl: 'https://toraninvites.com'
      }
    }
  );
  console.log('Workspace updated!');

  // 2. Update GtmStrategy
  await GtmStrategy.updateMany(
    { workspaceId: wsId },
    {
      $set: {
        category: 'Digital Wedding Invitations & Event Stationery',
        'idealCustomerProfile.primaryPersona': 'Wedding Planners, Event Management Agencies & Luxury Wedding Photographers',
        'idealCustomerProfile.decisionMakers': [
          'Wedding Planner & Event Coordinator',
          'Managing Director - Event Agency',
          'Luxury Wedding Photographer',
          'Banquet & Wedding Venue Sales Head'
        ],
        'analysisResult.targetAudience.primaryPersona': 'Wedding Planners, Event Management Agencies & Luxury Wedding Photographers',
        'analysisResult.targetAudience.decisionMakers': [
          'Wedding Planner & Event Coordinator',
          'Managing Director - Event Agency',
          'Luxury Wedding Photographer',
          'Banquet & Wedding Venue Sales Head'
        ],
        'analysisResult.leadDiscoveryCriteria.buyerSearchKeywords': [
          'wedding planners',
          'event management companies',
          'wedding event organizers',
          'luxury wedding photographers',
          'wedding venue coordinators'
        ],
        'analysisResult.leadDiscoveryCriteria.buyerPersonas': [
          'Wedding Planner & Event Coordinator',
          'Event Operations Director',
          'Lead Wedding Coordinator',
          'Banquet Sales Manager'
        ],
        'analysisResult.leadDiscoveryCriteria.targetCompanyTypes': [
          'Wedding Planning Agencies',
          'Event Management Companies',
          'Wedding Photography Studios',
          'Banquet & Luxury Venues'
        ]
      }
    }
  );
  console.log('GtmStrategy updated!');

  // 3. Clean up invalid/synthetic leads in Toran Invites
  const deadDomains = [
    'theweddingdesigncompany.com',
    'sparkleevents.com',
    'grandeurevents.com'
  ];
  const deleteRes = await Lead.deleteMany({
    workspaceId: wsId,
    $or: [
      { website: { $in: deadDomains.map(d => 'https://' + d) } },
      { phone: /12345/ },
      { phone: /98765/ },
      { phone: /00000/ }
    ]
  });
  console.log('Deleted broken/fake leads:', deleteRes.deletedCount);

  // Check remaining leads in Toran
  const remaining = await Lead.find({ workspaceId: wsId });
  console.log('Remaining clean leads in Toran:', remaining.length);

  process.exit(0);
}
updateToran();
