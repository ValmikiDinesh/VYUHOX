const mongoose = require('mongoose');
const dns = require('dns').promises;
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';

async function checkWebsiteLiveness(domainOrUrl) {
  if (!domainOrUrl) return false;
  const cleanDomain = domainOrUrl.replace(/https?:\/\//i, '').split('/')[0].replace(/^www\./i, '').trim();
  if (!cleanDomain || cleanDomain.includes(' ')) return false;
  try {
    const addresses = await dns.resolve4(cleanDomain);
    if (!addresses || addresses.length === 0) return false;
  } catch (e) {
    return false;
  }
  return true;
}

function isSyntheticPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return true;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 8) return true;
  const seq = ['01234', '12345', '23456', '34567', '45678', '56789', '67890', '98765', '87654', '76543', '65432', '54321', '43210'];
  for (const s of seq) {
    if (digits.includes(s)) return true;
  }
  if (/(\d)\1{3,}/.test(digits)) return true;
  return false;
}

async function verifyAll() {
  await mongoose.connect(MONGODB_URI);
  const Workspace = mongoose.model('Workspace', new mongoose.Schema({}, { strict: false }));
  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));

  const workspaces = await Workspace.find({ name: { $in: [/toran/i, /aalaya/i] } });

  for (const ws of workspaces) {
    console.log(`\n=== Workspace: ${ws.name} (${ws._id}) ===`);
    console.log(`Industry: ${ws.industry} | Category: ${ws.businessCategory}`);
    const leads = await Lead.find({ workspaceId: ws._id });
    console.log(`Total Leads in CRM: ${leads.length}`);

    let deadSites = 0;
    let syntheticPhones = 0;

    for (const l of leads) {
      if (l.website) {
        const isLive = await checkWebsiteLiveness(l.website);
        if (!isLive) {
          console.log(`  [DEAD WEBSITE]: ${l.company} -> ${l.website}`);
          deadSites++;
        }
      }
      if (l.phone && isSyntheticPhoneNumber(l.phone)) {
        console.log(`  [SYNTHETIC PHONE]: ${l.name} at ${l.company} -> ${l.phone}`);
        syntheticPhones++;
      }
    }

    console.log(`Dead sites count: ${deadSites}, Synthetic phones count: ${syntheticPhones}`);
  }

  process.exit(0);
}
verifyAll();
