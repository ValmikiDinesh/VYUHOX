import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { SupportTicket } from '../models/SupportTicket.js';
import { Wallet } from '../models/Wallet.js';
import { AuditLog } from '../models/AuditLog.js';
import { PlatformConfig } from '../models/PlatformConfig.js';
import { Workspace } from '../models/Workspace.js';
import { authMiddleware } from '../middleware/auth.js';
import { AssetDeliveryService } from '../services/media/AssetDeliveryService.js';

const router = express.Router();

// Supported MIME types and extensions for strict support attachment validation
const ALLOWED_SUPPORT_EXT = /^(jpe?g|png|webp|gif|pdf|txt|log)$/i;
const ALLOWED_SUPPORT_MIME = /^(image\/(jpeg|png|webp|gif)|application\/pdf|text\/plain)$/i;

// Multer Storage for Support Attachments: Stored in private support directory (outside client/public)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AssetDeliveryService.getSupportDir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `support_${cleanBase}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB strict limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isExtAllowed = ALLOWED_SUPPORT_EXT.test(ext);
    const isMimeAllowed = ALLOWED_SUPPORT_MIME.test(file.mimetype);

    // Strict validation: Require BOTH file extension and MIME type to match allowed support types
    if (isExtAllowed && isMimeAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Invalid support upload: Only images (JPEG, PNG, WebP, GIF), PDFs, or plain text logs under 5MB are permitted. Both extension and MIME type must match.'));
    }
  },
});

// In-memory sliding-window rate limiter for support uploads
// Prevents resource exhaustion without external infrastructure dependencies
const uploadRateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const maxUploadsPerWindow = 10;
const supportUploadTracker = new Map(); // key: userId/ip -> array of timestamps

export const supportUploadRateLimiter = (req, res, next) => {
  const identifier = req.user?._id?.toString() || req.user?.id?.toString() || req.ip;
  const now = Date.now();
  const windowStart = now - uploadRateLimitWindowMs;

  const timestamps = (supportUploadTracker.get(identifier) || []).filter((t) => t > windowStart);

  if (timestamps.length >= maxUploadsPerWindow) {
    const oldestTimestamp = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + uploadRateLimitWindowMs - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    res.setHeader('X-RateLimit-Limit', maxUploadsPerWindow);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', Math.ceil((oldestTimestamp + uploadRateLimitWindowMs) / 1000));
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Upload rate limit exceeded. You may only upload up to ${maxUploadsPerWindow} support attachments every 15 minutes. Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfterSeconds,
    });
  }

  timestamps.push(now);
  supportUploadTracker.set(identifier, timestamps);

  res.setHeader('X-RateLimit-Limit', maxUploadsPerWindow);
  res.setHeader('X-RateLimit-Remaining', maxUploadsPerWindow - timestamps.length);

  // Periodic pruning of stale tracker keys (every 50 requests)
  if (Math.random() < 0.02) {
    for (const [key, times] of supportUploadTracker.entries()) {
      const active = times.filter((t) => t > windowStart);
      if (active.length === 0) supportUploadTracker.delete(key);
      else supportUploadTracker.set(key, active);
    }
  }

  next();
};

/**
 * POST /api/support/upload
 * Authenticated support upload: client error screenshots & super admin resolution receipts
 * Enforces authentication, per-user rate limit (10 per 15 min), magic-byte inspection, strict MIME whitelist, and private storage.
 */
router.post('/upload', authMiddleware, supportUploadRateLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    // Deep content inspection: verify file magic bytes match declared extension and MIME type
    const isValid = AssetDeliveryService.verifyMediaMagicBytes(req.file.path, ext, req.file.mimetype);
    if (!isValid) {
      if (fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Security validation failed: File content does not match allowed format or contains active scripts.',
      });
    }

    // Persist via StorageAdapter abstraction (Local or Cloudflare R2)
    await AssetDeliveryService.saveSupportAttachment(
      req.file.filename,
      req.file.path,
      req.file.mimetype
    );

    // If cloud storage, unlink local staging file
    if (AssetDeliveryService.storageAdapter.isCloudStorage && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    const fileUrl = `/api/support/attachment/${req.file.filename}`;
    return res.json({
      success: true,
      file: {
        fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSizeKb: Math.round(req.file.size / 1024),
      },
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    console.error('[SupportRoutes] Upload error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/support/attachment/:filename
 * Secure authenticated retrieval of support attachments
 * Scoped to superadmins and authorized ticket holders.
 */
router.get('/attachment/:filename', authMiddleware, async (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const supportDir = AssetDeliveryService.getSupportDir();
    const filePath = path.resolve(supportDir, safeFilename);

    if (!filePath.startsWith(supportDir)) {
      return res.status(403).json({ success: false, message: 'Access denied: Path traversal detected.' });
    }

    const isSuperAdmin = req.user?.role === 'superadmin';
    const userEmail = req.user?.email;
    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;

    // Authorization check: Superadmin has global access; regular users can view attachments on their tickets or workspace
    if (!isSuperAdmin) {
      const authorizedTicket = await SupportTicket.findOne({
        $or: [
          { workspaceId: userWsId },
          { userEmail },
        ],
        'attachments.fileUrl': new RegExp(safeFilename),
      });

      if (!authorizedTicket && req.user?.role !== 'workspace_owner') {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not have authorization to view this support attachment.' });
      }
    }

    const mediaRes = await AssetDeliveryService.resolveSupportAttachmentStream(safeFilename);
    if (!mediaRes) {
      return res.status(404).json({ success: false, message: 'Attachment not found.' });
    }

    const ext = path.extname(safeFilename).toLowerCase().replace('.', '');
    const mimeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      pdf: 'application/pdf',
      txt: 'text/plain',
      log: 'text/plain',
    };
    const mimeType = mimeMap[ext] || mediaRes.mimeType || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    if (mediaRes.size) {
      res.setHeader('Content-Length', mediaRes.size);
    }

    return AssetDeliveryService.pipeMediaStream(mediaRes, res, req);
  } catch (error) {
    console.error('[SupportRoutes] Attachment retrieval error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve support attachment.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * GET /api/support/announcement
 * Client fetch: Active global maintenance / incident announcement
 */
router.get('/announcement', async (req, res) => {
  try {
    const config = await PlatformConfig.findOne({ configKey: 'GLOBAL_CONFIG' }).lean();
    const announcement = config?.globalAnnouncement || { active: false, message: '', severity: 'INFO' };
    return res.json({ success: true, announcement });
  } catch (error) {
    console.error('[SupportRoutes] Error fetching announcement:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/support/ticket
 * Client endpoint: Submit a support ticket with auto-attached technical diagnostics
 */
router.post('/ticket', async (req, res) => {
  try {
    const io = req.app.get('io');
    const {
      workspaceId,
      workspaceName,
      userId,
      userEmail,
      userName,
      subject,
      message,
      priority = 'MEDIUM',
      diagnosticsSnapshot = {},
      attachments = [],
    } = req.body;

    if (!workspaceId || !userEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'workspaceId, userEmail, subject, and message are required',
      });
    }

    // Generate clean sequential ticket number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TICK-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Enrich diagnostics with current wallet balance if available
    let enrichedDiagnostics = { ...diagnosticsSnapshot };
    try {
      const wallet = await Wallet.findOne({ workspaceId }).lean();
      if (wallet) {
        enrichedDiagnostics.walletBalanceUSD = wallet.balanceUSD;
      }
    } catch (e) {
      // Continue if wallet lookup fails
    }

    const ticket = await SupportTicket.create({
      ticketNumber,
      workspaceId,
      workspaceName: workspaceName || 'Workspace',
      userId: userId || null,
      userEmail,
      userName: userName || 'Client User',
      subject,
      message,
      priority,
      diagnosticsSnapshot: enrichedDiagnostics,
      attachments: Array.isArray(attachments) ? attachments : [],
      status: 'OPEN',
    });

    if (io) {
      io.emit('support:ticket_created', { ticket });
    }

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our engineering and GTM support team is reviewing your diagnostics.',
      ticket,
    });
  } catch (error) {
    console.error('[SupportRoutes] Error submitting support ticket:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/support/tickets
 * Super Admin or Client: List tickets
 */
router.get('/tickets', async (req, res) => {
  try {
    const { workspaceId, status, priority, limit = 100 } = req.query;
    const filter = {};

    if (workspaceId) filter.workspaceId = workspaceId;
    if (status && status !== 'ALL') filter.status = status;
    if (priority && priority !== 'ALL') filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    console.error('[SupportRoutes] Error listing tickets:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/support/tickets/:id
 * Super Admin: Update ticket status, resolution notes, and optionally inject wallet credit
 */
router.put('/tickets/:id', async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id } = req.params;
    const {
      status,
      adminNotes,
      creditAmountUSD = 0,
      adminEmail = 'founder@vyuhox.ai',
      adminName = 'Super Admin',
      attachments = [],
    } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (adminNotes !== undefined) ticket.adminNotes = adminNotes;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      ticket.attachments = ticket.attachments || [];
      ticket.attachments.push(...attachments);
    }

    let credited = 0;
    let updatedWalletBalance = null;

    // Credit injection directly from support ticket resolution
    if (creditAmountUSD && Number(creditAmountUSD) > 0) {
      credited = Number(creditAmountUSD);
      ticket.creditedAmountUSD = (ticket.creditedAmountUSD || 0) + credited;

      let wallet = await Wallet.findOne({ workspaceId: ticket.workspaceId });
      if (!wallet) {
        wallet = new Wallet({ workspaceId: ticket.workspaceId, balanceUSD: 0 });
      }

      wallet.balanceUSD = Math.round((wallet.balanceUSD + credited) * 100) / 100;
      wallet.transactions.push({
        type: 'CREDIT',
        amountUSD: credited,
        description: `Support Resolution Credit (Ticket #${ticket.ticketNumber}): ${adminNotes || 'Platform Compensation'}`,
        timestamp: new Date(),
        referenceId: ticket.ticketNumber,
      });

      await wallet.save();
      updatedWalletBalance = wallet.balanceUSD;

      // Audit log entry for credit injection
      await AuditLog.create({
        adminEmail,
        adminName,
        actionType: 'WALLET_CREDITED',
        targetWorkspaceId: ticket.workspaceId,
        targetWorkspaceName: ticket.workspaceName,
        details: `Injected $${credited.toFixed(2)} USD via Support Ticket #${ticket.ticketNumber}`,
        metadata: { ticketNumber: ticket.ticketNumber, previousBalance: wallet.balanceUSD - credited, newBalance: wallet.balanceUSD },
      });

      if (io) {
        io.to(ticket.workspaceId.toString()).emit('wallet:balance_updated', {
          balanceUSD: wallet.balanceUSD,
          creditedAmount: credited,
          ticketNumber: ticket.ticketNumber,
        });
      }
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      ticket.resolvedBy = adminEmail;
      ticket.resolvedAt = new Date();

      await AuditLog.create({
        adminEmail,
        adminName,
        actionType: 'SUPPORT_TICKET_RESOLVED',
        targetWorkspaceId: ticket.workspaceId,
        targetWorkspaceName: ticket.workspaceName,
        details: `Ticket #${ticket.ticketNumber} marked as ${status}. Notes: ${adminNotes || 'None'}`,
        metadata: { ticketNumber: ticket.ticketNumber, status, creditedAmountUSD: credited },
      });
    }

    await ticket.save();

    if (io) {
      io.emit('support:ticket_updated', { ticket, updatedWalletBalance });
    }

    return res.json({
      success: true,
      message: `Ticket #${ticket.ticketNumber} updated successfully`,
      ticket,
      updatedWalletBalance,
    });
  } catch (error) {
    console.error('[SupportRoutes] Error updating ticket:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

