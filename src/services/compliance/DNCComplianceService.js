import { DncRecord } from '../../models/DncRecord.js';
import { Lead } from '../../models/Lead.js';

class DNCComplianceService {
  /**
   * Helper to normalize telephone strings for collision matching
   * Strips all non-digit characters except leading plus
   */
  normalizePhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/[^\d+]/g, '');
    // Standardize US 10-digit to +1 format if missing
    if (digits.length === 10 && !digits.startsWith('+')) {
      return `+1${digits}`;
    }
    return digits;
  }

  /**
   * Check if a contact (phone or email) is on the Universal DNC blacklist
   * Execution time < 5ms for outbound call / SMS pre-flight gates
   */
  async isBlacklisted({ workspaceId, phone, email }) {
    const cleanPhone = this.normalizePhone(phone);
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!cleanPhone && !cleanEmail) {
      return { blacklisted: false };
    }

    const query = {
      workspaceId,
      active: true,
      $or: [],
    };

    if (cleanPhone) {
      query.$or.push({ phone: cleanPhone });
      // Also match non-normalized or trailing 10 digits
      const last10 = cleanPhone.slice(-10);
      if (last10.length === 10) {
        query.$or.push({ phone: { $regex: `${last10}$` } });
      }
    }

    if (cleanEmail) {
      query.$or.push({ email: cleanEmail });
    }

    if (query.$or.length === 0) {
      return { blacklisted: false };
    }

    const match = await DncRecord.findOne(query).lean();

    if (match) {
      return {
        blacklisted: true,
        reason: match.reason || 'Contact is on the Universal Do-Not-Call (DNC) Registry',
        matchedRecord: match,
        blockedChannel: match.channel,
      };
    }

    return { blacklisted: false };
  }

  /**
   * Register an Opt-Out / DNC entry
   * Triggered when an inbound message contains STOP, Unsubscribe, etc., or added manually.
   */
  async registerOptOut({ workspaceId, phone, email, reason = 'Inbound STOP reply keyword', channel = 'SMS', leadId, leadName = '', io }) {
    const cleanPhone = this.normalizePhone(phone);
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!cleanPhone && !cleanEmail) {
      throw new Error('Phone number or email is required to register DNC opt-out');
    }

    let type = 'PHONE';
    if (cleanPhone && cleanEmail) type = 'BOTH';
    else if (cleanEmail) type = 'EMAIL';

    // 1. Create or reactivate DNC Record
    const record = await DncRecord.findOneAndUpdate(
      {
        workspaceId,
        $or: [
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
      {
        $set: {
          type,
          phone: cleanPhone,
          email: cleanEmail,
          reason,
          channel,
          leadId: leadId || undefined,
          leadName,
          active: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // 2. Mark lead stage as Lost / Unsubscribed in CRM if linked or found
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, {
        stage: 'Lost',
        $set: { notes: `[DNC COMPLIANCE] Opted out via ${channel}: "${reason}"` },
      });
    } else {
      // Look up lead by phone or email
      await Lead.updateMany(
        {
          workspaceId,
          $or: [
            ...(cleanPhone ? [{ phone: cleanPhone }] : []),
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
        {
          stage: 'Lost',
          $set: { notes: `[DNC COMPLIANCE] Opted out via ${channel}: "${reason}"` },
        }
      );
    }

    // 3. Emit real-time compliance event via Socket.IO
    if (io) {
      io.to(workspaceId.toString()).emit('compliance:dnc_added', {
        record,
        contact: cleanPhone || cleanEmail,
        reason,
        channel,
      });
    }

    return {
      success: true,
      message: `Universal DNC opt-out registered for ${cleanPhone || cleanEmail}`,
      record,
    };
  }

  /**
   * Get paginated DNC Blacklist for workspace
   */
  async getDncList({ workspaceId, search = '', page = 1, limit = 50 }) {
    const query = { workspaceId, active: true };

    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { leadName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [total, records] = await Promise.all([
      DncRecord.countDocuments(query),
      DncRecord.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    ]);

    return {
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      records,
    };
  }

  /**
   * Remove or unblock a contact from the DNC list
   */
  async removeDncEntry(dncId, io) {
    const record = await DncRecord.findByIdAndDelete(dncId);
    if (record && io) {
      io.to(record.workspaceId.toString()).emit('compliance:dnc_removed', { dncId });
    }
    return { success: true, message: 'Contact successfully unblocked from DNC' };
  }

  /**
   * Batch scrub an array of prospective leads
   * Takes [{ phone, email, ... }] and filters out blacklisted leads, returning safe leads & dropped count
   */
  async scrubBatch({ workspaceId, contacts = [] }) {
    const activeDnc = await DncRecord.find({ workspaceId, active: true }).lean();
    const dncPhones = new Set();
    const dncEmails = new Set();

    activeDnc.forEach((r) => {
      if (r.phone) dncPhones.add(this.normalizePhone(r.phone));
      if (r.email) dncEmails.add(r.email.toLowerCase().trim());
    });

    const safeContacts = [];
    const scrubbedContacts = [];

    contacts.forEach((c) => {
      const normPhone = this.normalizePhone(c.phone);
      const normEmail = (c.email || '').toLowerCase().trim();

      const isBlocked = (normPhone && dncPhones.has(normPhone)) || (normEmail && dncEmails.has(normEmail));

      if (isBlocked) {
        scrubbedContacts.push({
          ...c,
          scrubReason: 'Matches active Universal DNC blacklist entry',
        });
      } else {
        safeContacts.push(c);
      }
    });

    return {
      success: true,
      totalSubmitted: contacts.length,
      safeCount: safeContacts.length,
      scrubbedCount: scrubbedContacts.length,
      safeContacts,
      scrubbedContacts,
    };
  }
}

export const dncComplianceService = new DNCComplianceService();
