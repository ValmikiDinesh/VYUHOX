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

async function purgeInvalidLeads() {
  await mongoose.connect(MONGODB_URI);
  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));

  const allLeads = await Lead.find({});
  console.log(`Auditing ${allLeads.length} total leads across all client workspaces...`);

  let deletedCount = 0;
  let phoneCleanedCount = 0;

  for (const lead of allLeads) {
    let shouldDelete = false;

    // 1. If website is present, check liveness
    if (lead.website) {
      const live = await checkWebsiteLiveness(lead.website);
      if (!live) {
        console.log(`[PURGE] Dead website lead: "${lead.company}" (${lead.website})`);
        shouldDelete = true;
      }
    }

    // 2. Check if phone is synthetic
    if (lead.phone && isSyntheticPhoneNumber(lead.phone)) {
      console.log(`[CLEAN PHONE] Synthetic phone: "${lead.name}" at "${lead.company}" (${lead.phone})`);
      lead.phone = '';
      if (lead.channels) {
        lead.channels.phone = '';
        lead.channels.whatsapp = '';
      }
      phoneCleanedCount++;
    }

    // 3. If lead now has NO website AND NO email AND NO phone, or if website was dead: delete it
    if (shouldDelete || (!lead.email && !lead.phone)) {
      await Lead.deleteOne({ _id: lead._id });
      deletedCount++;
    } else {
      await lead.save();
    }
  }

  console.log(`\nAudit Complete:`);
  console.log(`- Deleted invalid/dead leads: ${deletedCount}`);
  console.log(`- Cleaned synthetic phone numbers: ${phoneCleanedCount}`);
  const remaining = await Lead.countDocuments();
  console.log(`- Remaining authentic, verified leads in system: ${remaining}`);

  process.exit(0);
}

purgeInvalidLeads();

