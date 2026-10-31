import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { SupportTicket } from '../models/SupportTicket.js';
import { Wallet } from '../models/Wallet.js';
import { AuditLog } from '../models/AuditLog.js';
import { PlatformConfig } from '../models/PlatformConfig.js';
import { Workspace } from '../models/Workspace.js';

const router = express.Router();

// Ensure uploads/support directory exists
const uploadDir = path.resolve(process.cwd(), 'client', 'public', 'uploads', 'support');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `support-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|pdf|txt|log/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, or log files are permitted.'));
    }
  },
});

/**
 * POST /api/support/upload
 * Two-way upload endpoint: client error screenshots & super admin resolution receipts
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/support/${req.file.filename}`;
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
    console.error('[SupportRoutes] Upload error:', err);
    return res.status(500).json({ success: false, message: err.message });
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

