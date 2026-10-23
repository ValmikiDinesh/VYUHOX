import express from 'express';
import { Lead } from '../models/Lead.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leads - Filtered list of leads for active workspace
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { stage, source, search, sort = '-createdAt', limit = 100, page = 1 } = req.query;
    const workspaceId = req.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace required' });
    }

    const query = { workspaceId };

    if (stage && stage !== 'ALL') {
      query.stage = stage;
    }
    if (source && source !== 'ALL') {
      query.source = source;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Lead.countDocuments(query),
    ]);

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      leads,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leads/:id - Get single lead
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    return res.json({ success: true, lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads - Create new lead
router.post('/', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace required' });
    }

    const { name, email, phone, company, title, stage, score, source, channels, notes, tags } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Lead name is required' });
    }

    const lead = await Lead.create({
      workspaceId,
      name,
      email: email || '',
      phone: phone || '',
      company: company || '',
      title: title || '',
      stage: stage || 'Prospect',
      score: score !== undefined ? score : 65,
      source: source || 'Inbound',
      channels: channels || { whatsapp: '', telegram: '', email: email || '', phone: phone || '' },
      notes: notes || '',
      tags: tags || [],
    });

    if (req.app.get('io')) {
      req.app.get('io').to(workspaceId.toString()).emit('leadCreated', lead);
    }

    return res.status(201).json({ success: true, lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/leads/:id - Update lead details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      req.body,
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (req.app.get('io')) {
      req.app.get('io').to(req.workspaceId.toString()).emit('leadUpdated', lead);
    }

    return res.json({ success: true, lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/leads/:id/stage - Update lead pipeline stage
router.patch('/:id/stage', authMiddleware, async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['Prospect', 'Contacted', 'Qualified', 'Demo_Booked', 'Won', 'Lost'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage value' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      { stage, lastContactedAt: new Date() },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (req.app.get('io')) {
      req.app.get('io').to(req.workspaceId.toString()).emit('leadStageChanged', {
        leadId: lead._id,
        stage: lead.stage,
        lead,
      });
    }

    return res.json({ success: true, lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, workspaceId: req.workspaceId });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (req.app.get('io')) {
      req.app.get('io').to(req.workspaceId.toString()).emit('leadDeleted', { leadId: req.params.id });
    }

    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads/bulk-import - Bulk import leads
router.post('/bulk-import', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    const { leads = [] } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid array of leads is required' });
    }

    const preparedLeads = leads.map((item) => ({
      workspaceId,
      name: item.name || 'Unknown Contact',
      email: item.email || '',
      phone: item.phone || '',
      company: item.company || '',
      title: item.title || '',
      stage: item.stage || 'Prospect',
      score: item.score || 50,
      source: item.source || 'Scraper',
      channels: item.channels || { whatsapp: '', telegram: '', email: item.email || '', phone: item.phone || '' },
      notes: item.notes || '',
      tags: item.tags || [],
    }));

    const inserted = await Lead.insertMany(preparedLeads);
    return res.status(201).json({ success: true, count: inserted.length, leads: inserted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads/import - Alias for bulk import
router.post('/import', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    const { leads = [] } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid array of leads is required' });
    }

    const preparedLeads = leads.map((item) => ({
      workspaceId,
      name: item.name || 'Unknown Contact',
      email: item.email || '',
      phone: item.phone || '',
      company: item.company || '',
      website: item.website || '',
      title: item.title || '',
      location: item.location || '',
      verificationStatus: item.verificationStatus || (item.email?.includes('@') ? 'VERIFIED' : 'UNVERIFIED'),
      stage: item.stage || 'Prospect',
      score: item.score || 65,
      source: item.source || 'Scraper',
      channels: item.channels || { whatsapp: item.phone || '', telegram: '', email: item.email || '', phone: item.phone || '' },
      notes: item.notes || '',
      tags: item.tags || ['Imported'],
    }));

    const inserted = await Lead.insertMany(preparedLeads);
    return res.status(201).json({ success: true, count: inserted.length, leads: inserted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads/bulk-action - Execute bulk operation on selected leads
router.post('/bulk-action', authMiddleware, async (req, res) => {
  try {
    const { leadIds = [], action, targetStage } = req.body;
    const workspaceId = req.workspaceId;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'leadIds array is required' });
    }

    let modifiedCount = 0;

    if (action === 'UPDATE_STAGE' && targetStage) {
      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, workspaceId },
        { stage: targetStage, lastContactedAt: new Date() }
      );
      modifiedCount = result.modifiedCount;
    } else if (action === 'DELETE') {
      const result = await Lead.deleteMany({ _id: { $in: leadIds }, workspaceId });
      modifiedCount = result.deletedCount;
    } else if (action === 'TRIGGER_VOICE_CALL') {
      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, workspaceId },
        { stage: 'Contacted', lastContactedAt: new Date() }
      );
      modifiedCount = result.modifiedCount;
    } else if (action === 'PUSH_EMAIL_CAMPAIGN') {
      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, workspaceId },
        { stage: 'Contacted', lastContactedAt: new Date() }
      );
      modifiedCount = result.modifiedCount;
    } else if (action === 'SEND_WHATSAPP') {
      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, workspaceId },
        { stage: 'Contacted', lastContactedAt: new Date() }
      );
      modifiedCount = result.modifiedCount;
    }

    if (req.app.get('io')) {
      req.app.get('io').to(workspaceId.toString()).emit('leadsBulkUpdated', {
        action,
        count: modifiedCount,
        leadIds,
      });
    }

    return res.json({ success: true, action, modifiedCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leads/export (and /export/csv) - Full enriched CSV export
const handleCsvExport = async (req, res) => {
  try {
    const leads = await Lead.find({ workspaceId: req.workspaceId }).sort('-createdAt').lean();

    const header = 'Name,Company,Website,Title,Email,VerificationStatus,MXHost,Phone,Stage,Score,Source,CreatedAt\n';
    const rows = leads
      .map((l) =>
        `"${l.name}","${l.company || ''}","${l.website || ''}","${l.title || ''}","${l.email || ''}","${l.verificationStatus || 'UNVERIFIED'}","${l.mxHost || ''}","${l.phone || ''}","${l.stage}","${l.score}","${l.source}","${new Date(l.createdAt).toISOString()}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vyuhox_waterfall_leads.csv"');
    return res.send(header + rows);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/export', authMiddleware, handleCsvExport);
router.get('/export/csv', authMiddleware, handleCsvExport);

export default router;
