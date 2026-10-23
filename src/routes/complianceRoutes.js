import express from 'express';
import { secondaryDomainWarmupService } from '../services/compliance/SecondaryDomainWarmupService.js';
import { a2p10DLCComplianceService } from '../services/compliance/A2P10DLCComplianceService.js';
import { dncComplianceService } from '../services/compliance/DNCComplianceService.js';

const router = express.Router();

/* ==========================================================================
   1. DELIVERABILITY & SECONDARY DOMAIN WARMUP
   ========================================================================== */

/**
 * GET /api/compliance/warmup/domains
 */
router.get('/warmup/domains', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const result = await secondaryDomainWarmupService.getWarmupDomains(workspaceId);
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error fetching warmup domains:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/warmup/domains
 */
router.post('/warmup/domains', async (req, res) => {
  try {
    const { workspaceId, domain, senderEmail, provider, dailyTargetLimit } = req.body;
    if (!workspaceId || !domain) {
      return res.status(400).json({ success: false, message: 'workspaceId and domain are required' });
    }

    const newDomain = await secondaryDomainWarmupService.addDomain({
      workspaceId,
      domain,
      senderEmail,
      provider,
      dailyTargetLimit,
    });

    return res.status(201).json({ success: true, domain: newDomain });
  } catch (error) {
    console.error('[ComplianceRoutes] Error adding domain:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/warmup/audit/:id
 * Instant DNS re-check
 */
router.post('/warmup/audit/:id', async (req, res) => {
  try {
    const result = await secondaryDomainWarmupService.auditDomain(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error auditing domain:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/warmup/simulate-step/:id
 */
router.post('/warmup/simulate-step/:id', async (req, res) => {
  try {
    const result = await secondaryDomainWarmupService.progressWarmupRamp(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error progressing warmup:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/compliance/warmup/domains/:id
 */
router.delete('/warmup/domains/:id', async (req, res) => {
  try {
    const result = await secondaryDomainWarmupService.removeDomain(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error removing domain:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   2. US A2P 10DLC COMPLIANCE & TWILIO TRUST HUB
   ========================================================================== */

/**
 * GET /api/compliance/a2p
 */
router.get('/a2p', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const result = await a2p10DLCComplianceService.getRegistration(workspaceId);
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error fetching A2P registration:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/a2p/submit
 */
router.post('/a2p/submit', async (req, res) => {
  try {
    const { workspaceId, registrationData } = req.body;
    if (!workspaceId || !registrationData) {
      return res.status(400).json({ success: false, message: 'workspaceId and registrationData are required' });
    }

    const result = await a2p10DLCComplianceService.submitRegistration({
      workspaceId,
      registrationData,
    });

    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error submitting A2P registration:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   3. UNIVERSAL DO-NOT-CALL (DNC) & UNSUBSCRIBE REGISTRY
   ========================================================================== */

/**
 * GET /api/compliance/dnc
 */
router.get('/dnc', async (req, res) => {
  try {
    const { workspaceId, search, page, limit } = req.query;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const result = await dncComplianceService.getDncList({
      workspaceId,
      search,
      page,
      limit,
    });

    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error fetching DNC list:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/dnc/add
 * Manually register DNC opt-out
 */
router.post('/dnc/add', async (req, res) => {
  try {
    const io = req.app.get('io');
    const { workspaceId, phone, email, reason, channel, leadName } = req.body;

    if (!workspaceId || (!phone && !email)) {
      return res.status(400).json({ success: false, message: 'workspaceId and phone or email are required' });
    }

    const result = await dncComplianceService.registerOptOut({
      workspaceId,
      phone,
      email,
      reason: reason || 'Manual blacklist entry by compliance administrator',
      channel: channel || 'MANUAL',
      leadName: leadName || '',
      io,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error adding to DNC:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/dnc/check
 * Instant pre-flight gate check
 */
router.post('/dnc/check', async (req, res) => {
  try {
    const { workspaceId, phone, email } = req.body;
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId is required' });

    const result = await dncComplianceService.isBlacklisted({ workspaceId, phone, email });
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[ComplianceRoutes] Error checking DNC status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/dnc/scrub
 * Batch scrub list of prospective leads
 */
router.post('/dnc/scrub', async (req, res) => {
  try {
    const { workspaceId, contacts } = req.body;
    if (!workspaceId || !Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: 'workspaceId and array of contacts are required' });
    }

    const result = await dncComplianceService.scrubBatch({ workspaceId, contacts });
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error scrubbing contacts:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/compliance/dnc/:id
 * Remove / unblock contact
 */
router.delete('/dnc/:id', async (req, res) => {
  try {
    const io = req.app.get('io');
    const result = await dncComplianceService.removeDncEntry(req.params.id, io);
    return res.json(result);
  } catch (error) {
    console.error('[ComplianceRoutes] Error removing from DNC:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
