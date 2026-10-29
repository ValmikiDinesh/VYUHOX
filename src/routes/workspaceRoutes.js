import express from 'express';
import mongoose from 'mongoose';
import { Workspace } from '../models/Workspace.js';
import { Wallet } from '../models/Wallet.js';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { GtmStrategy } from '../models/GtmStrategy.js';
import { BusinessBrain } from '../models/BusinessBrain.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { CallLog } from '../models/CallLog.js';
import { AdCampaign } from '../models/AdCampaign.js';
import { AdCreative } from '../models/AdCreative.js';
import { AdOptimizationLog } from '../models/AdOptimizationLog.js';
import { AgentActivityLog } from '../models/AgentActivityLog.js';
import { AiBriefing } from '../models/AiBriefing.js';
import { CeoBriefing } from '../models/CeoBriefing.js';
import { Appointment } from '../models/Appointment.js';
import { CalendarConfig } from '../models/CalendarConfig.js';
import { DncRecord } from '../models/DncRecord.js';
import { DomainWarmup } from '../models/DomainWarmup.js';
import { DripSequence } from '../models/DripSequence.js';
import { IntegrationConfig } from '../models/IntegrationConfig.js';
import { JournalistPitch } from '../models/JournalistPitch.js';
import { SocialAccountConfig } from '../models/SocialAccountConfig.js';
import { SocialPost } from '../models/SocialPost.js';
import { VoiceAgentConfig } from '../models/VoiceAgentConfig.js';
import { A2PRegistration } from '../models/A2PRegistration.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/workspaces - List all workspaces enriched with metrics and actual features
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Multi-tenant isolation: Superadmin can inspect all, client owners can only see their own workspace
    let query = {};
    if (req.user && req.user.role !== 'superadmin') {
      query = { _id: req.user.workspaceId };
    }

    const rawWorkspaces = await Workspace.find(query).sort({ createdAt: -1 }).lean();

    const workspaces = await Promise.all(
      rawWorkspaces.map(async (ws) => {
        const [leadCount, scrapedLeadsCount, wallet, ownerUser] = await Promise.all([
          Lead.countDocuments({ workspaceId: ws._id }),
          Lead.countDocuments({ workspaceId: ws._id, source: 'Scraper' }),
          Wallet.findOne({ workspaceId: ws._id }).lean(),
          User.findOne({ workspaceId: ws._id }).lean(),
        ]);

        const hiredCount = ws.hiredAgents ? ws.hiredAgents.filter((a) => a.active).length : 0;
        const txs = wallet?.transactions || [];

        const totalPaidUSD = +txs
          .filter((t) => t.type === 'CREDIT' || t.type === 'BONUS')
          .reduce((acc, t) => acc + (t.amountUSD || 0), 0)
          .toFixed(2);

        const totalSpentUSD = +txs
          .filter((t) => t.type === 'DEBIT')
          .reduce((acc, t) => acc + (t.amountUSD || 0), 0)
          .toFixed(2);

        return {
          ...ws,
          ownerEmail: ws.ownerEmail || ownerUser?.email || '',
          ownerName: ws.ownerName || ownerUser?.name || '',
          leadCount: leadCount || 0,
          scrapedLeadsCount: scrapedLeadsCount || 0,
          walletBalanceUSD: wallet ? wallet.balanceUSD : 0,
          totalPaidUSD,
          totalSpentUSD,
          recentTransactions: txs.slice(-5).reverse(),
          hiredAgentsCount: hiredCount,
          features: {
            speedToLeadVoice: true,
            omnichannelComms: true,
            leadScraper: true,
            aiCSuite: ws.operatingMode === 'AI_COMPANY' || hiredCount > 0,
            socialStudio: ws.operatingMode === 'AI_COMPANY' || (ws.hiredAgents || []).some((a) => a.agentRole === 'CMO' && a.active),
            adOptimizer: ws.operatingMode === 'AI_COMPANY' || (ws.hiredAgents || []).some((a) => a.agentRole === 'CMO' && a.active),
            financialRevOps: ws.operatingMode === 'AI_COMPANY' || (ws.hiredAgents || []).some((a) => a.agentRole === 'CFO' && a.active),
          },
        };
      })
    );

    return res.json({ success: true, workspaces });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/workspaces/:id - Get single workspace
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    const [wallet, ownerUser] = await Promise.all([
      Wallet.findOne({ workspaceId: workspace._id }),
      User.findOne({ workspaceId: workspace._id }).lean(),
    ]);
    const enrichedWs = {
      ...workspace.toObject(),
      ownerEmail: workspace.ownerEmail || ownerUser?.email || '',
      ownerName: workspace.ownerName || ownerUser?.name || '',
    };
    return res.json({ success: true, workspace: enrichedWs, wallet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/workspaces - Create new workspace
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, industry, domain, operatingMode, branding, businessCategory, businessModelDescription } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name is required' });
    }

    const slugBase = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const workspace = await Workspace.create({
      name,
      domain: domain || '',
      slug,
      industry: industry || 'B2B',
      businessCategory: businessCategory || '',
      businessModelDescription: businessModelDescription || '',
      operatingMode: operatingMode || 'AI_COMPANY',
      ownerEmail: req.user ? req.user.email : '',
      ownerName: req.user ? req.user.name : '',
      branding: branding || {
        primaryColor: '#06B6D4',
        secondaryColor: '#10B981',
        companyName: name,
      },
    });

    // Initialize wallet
    const wallet = await Wallet.create({
      workspaceId: workspace._id,
      balanceUSD: 50.0,
      transactions: [
        {
          type: 'BONUS',
          amountUSD: 50.0,
          description: 'New Workspace Launch Credits',
          referenceId: `NEW_WS_${Date.now()}`,
        },
      ],
    });

    return res.status(201).json({ success: true, workspace, wallet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/workspaces/:id - Update workspace details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, industry, domain, operatingMode, branding, logo, businessCategory, businessModelDescription } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (industry) updateData.industry = industry;
    if (domain !== undefined) updateData.domain = domain;
    if (businessCategory !== undefined) updateData.businessCategory = businessCategory;
    if (businessModelDescription !== undefined) updateData.businessModelDescription = businessModelDescription;
    if (operatingMode) updateData.operatingMode = operatingMode;
    if (logo !== undefined) updateData.logo = logo;
    if (branding) updateData.branding = branding;

    const workspace = await Workspace.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    return res.json({ success: true, workspace });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/workspaces/:id/operating-mode - Toggle operating mode
router.patch('/:id/operating-mode', authMiddleware, async (req, res) => {
  try {
    const { operatingMode } = req.body;
    if (!['TOOL', 'AI_COMPANY'].includes(operatingMode)) {
      return res.status(400).json({ success: false, message: 'Invalid operatingMode. Must be TOOL or AI_COMPANY.' });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      { operatingMode },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Emit socket event if io is attached
    if (req.app.get('io')) {
      req.app.get('io').to(req.params.id).emit('operatingModeUpdated', {
        workspaceId: workspace._id,
        operatingMode: workspace.operatingMode,
      });
    }

    return res.json({ success: true, workspace });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/workspaces/:id/superadmin-manage - Master control for superadmin over workspace features
router.patch('/:id/superadmin-manage', authMiddleware, async (req, res) => {
  try {
    const { operatingMode, planTier, hiredAgents, addCreditsUSD } = req.body;
    const updateObj = {};

    if (operatingMode) updateObj.operatingMode = operatingMode;
    if (planTier) {
      updateObj['subscription.planTier'] = planTier;
    }
    if (hiredAgents && Array.isArray(hiredAgents)) {
      updateObj.hiredAgents = hiredAgents;
    }

    const workspace = await Workspace.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    let updatedWallet = null;
    if (addCreditsUSD && Number(addCreditsUSD) > 0) {
      updatedWallet = await Wallet.findOneAndUpdate(
        { workspaceId: workspace._id },
        {
          $inc: { balanceUSD: Number(addCreditsUSD) },
          $push: {
            transactions: {
              type: 'BONUS',
              amountUSD: Number(addCreditsUSD),
              description: 'Super Admin Courtesy Credit Grant',
              referenceId: `ADMIN_GRANT_${Date.now()}`,
              createdAt: new Date(),
            },
          },
        },
        { new: true, upsert: true }
      );
    }

    return res.json({ success: true, workspace, wallet: updatedWallet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/workspaces/:id/stats - Workspace dashboard metrics
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const [totalLeads, leadsByStage, wallet] = await Promise.all([
      Lead.countDocuments({ workspaceId }),
      Lead.aggregate([
        { $match: { workspaceId: new (await import('mongoose')).default.Types.ObjectId(workspaceId) } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
      Wallet.findOne({ workspaceId }),
    ]);

    const stageCounts = {
      Prospect: 0,
      Contacted: 0,
      Qualified: 0,
      Demo_Booked: 0,
      Won: 0,
      Lost: 0,
    };

    leadsByStage.forEach((item) => {
      if (item._id && stageCounts[item._id] !== undefined) {
        stageCounts[item._id] = item.count;
      }
    });

    const wonLeads = stageCounts.Won || 0;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
    const pipelineValue = (stageCounts.Qualified * 1200) + (stageCounts.Demo_Booked * 3500) + (stageCounts.Won * 8500);

    return res.json({
      success: true,
      stats: {
        totalLeads,
        stageCounts,
        conversionRate,
        pipelineValue,
        walletBalance: wallet ? wallet.balanceUSD : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/workspaces/:id/purge-account
 * Completely deletes all MongoDB documents related to a client workspace
 * (Workspaces, GTM Strategies, BusinessBrain, Leads, Conversations, Messages, CallLogs, Ads, Appointments, etc.)
 * Resets the account completely so it can be re-onboarded cleanly.
 */
router.delete('/:id/purge-account', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: 'Invalid workspaceId format' });
    }

    // Permission check: only superadmin or the workspace owner can purge
    if (req.user && req.user.role !== 'superadmin' && req.user.workspaceId?.toString() !== workspaceId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only purge your own workspace' });
    }

    const ws = await Workspace.findById(workspaceId);
    if (!ws) {
      return res.status(404).json({ success: false, message: 'Workspace not found in database' });
    }

    const wsName = ws.name;

    // Concurrently purge all linked collections in MongoDB Atlas
    const [
      delStrategy,
      delBrain,
      delLeads,
      delConv,
      delMessages,
      delCalls,
      delAds,
      delCreatives,
      delAdLogs,
      delAgentLogs,
      delBriefings,
      delCeoBriefings,
      delAppointments,
      delCalConfig,
      delDnc,
      delWarmup,
      delDrips,
      delIntegrations,
      delPitches,
      delSocialConfigs,
      delSocialPosts,
      delVoiceConfigs,
      delA2P,
      delWallet,
      delWorkspace,
    ] = await Promise.all([
      GtmStrategy.deleteMany({ workspaceId }),
      BusinessBrain.deleteMany({ workspaceId }),
      Lead.deleteMany({ workspaceId }),
      Conversation.deleteMany({ workspaceId }),
      Message.deleteMany({ workspaceId }),
      CallLog.deleteMany({ workspaceId }),
      AdCampaign.deleteMany({ workspaceId }),
      AdCreative.deleteMany({ workspaceId }),
      AdOptimizationLog.deleteMany({ workspaceId }),
      AgentActivityLog.deleteMany({ workspaceId }),
      AiBriefing.deleteMany({ workspaceId }),
      CeoBriefing.deleteMany({ workspaceId }),
      Appointment.deleteMany({ workspaceId }),
      CalendarConfig.deleteMany({ workspaceId }),
      DncRecord.deleteMany({ workspaceId }),
      DomainWarmup.deleteMany({ workspaceId }),
      DripSequence.deleteMany({ workspaceId }),
      IntegrationConfig.deleteMany({ workspaceId }),
      JournalistPitch.deleteMany({ workspaceId }),
      SocialAccountConfig.deleteMany({ workspaceId }),
      SocialPost.deleteMany({ workspaceId }),
      VoiceAgentConfig.deleteMany({ workspaceId }),
      A2PRegistration.deleteMany({ workspaceId }),
      Wallet.deleteMany({ workspaceId }),
      Workspace.deleteOne({ _id: workspaceId }),
    ]);

    // Unbind any linked non-superadmin User so they can be reassigned or re-onboard
    await User.updateMany(
      { workspaceId, role: { $ne: 'superadmin' } },
      { $set: { workspaceId: null, onboardingCompleted: false } }
    );

    console.log(`[WorkspaceRoutes] 🗑️ PURGED all MongoDB Atlas records for workspace "${wsName}" (${workspaceId})`);

    return res.json({
      success: true,
      message: `Successfully purged all MongoDB data for workspace "${wsName}". You can now re-onboard from scratch.`,
      purgedSummary: {
        workspaceName: wsName,
        workspaceId,
        strategies: delStrategy.deletedCount,
        businessBrain: delBrain.deletedCount,
        leads: delLeads.deletedCount,
        conversations: delConv.deletedCount,
        messages: delMessages.deletedCount,
        callLogs: delCalls.deletedCount,
        adCampaigns: delAds.deletedCount,
        adCreatives: delCreatives.deletedCount,
        adLogs: delAdLogs.deletedCount,
        agentLogs: delAgentLogs.deletedCount,
        briefings: delBriefings.deletedCount + delCeoBriefings.deletedCount,
        appointments: delAppointments.deletedCount,
        wallet: delWallet.deletedCount,
        workspace: delWorkspace.deletedCount,
      },
    });
  } catch (error) {
    console.error('[WorkspaceRoutes] Purge workspace error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/workspaces/:id/reset-onboarding
 * Resets the onboarding status and strategy while keeping the workspace structure
 * (Ideal for re-running URL crawling, strategy generation, and AI workforce setup)
 */
router.post('/:id/reset-onboarding', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: 'Invalid workspaceId format' });
    }

    if (req.user && req.user.role !== 'superadmin' && req.user.workspaceId?.toString() !== workspaceId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const ws = await Workspace.findById(workspaceId);
    if (!ws) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Delete active strategy and reset brain
    await Promise.all([
      GtmStrategy.deleteMany({ workspaceId }),
      BusinessBrain.deleteMany({ workspaceId }),
      Lead.deleteMany({ workspaceId }),
      Conversation.deleteMany({ workspaceId }),
      Message.deleteMany({ workspaceId }),
      CallLog.deleteMany({ workspaceId }),
    ]);

    // Reset workspace flags
    ws.onboardingCompleted = false;
    ws.currentStrategyId = null;
    ws.businessUrl = '';
    ws.industry = '';
    ws.businessCategory = '';
    ws.businessModelDescription = '';
    ws.tagLine = '';
    await ws.save();

    return res.json({
      success: true,
      message: `Workspace "${ws.name}" has been reset. Onboarding is unlocked for re-testing.`,
      workspace: ws,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
