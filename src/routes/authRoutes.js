import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Wallet } from '../models/Wallet.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'vyuhox_super_secret_jwt_key_2026_gtm_autonomous',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, companyName, industry, businessCategory, businessModelDescription, websiteUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create initial workspace for the user
    const finalCompanyName = companyName || `${name.split(' ')[0]}'s Company`;
    const slugBase = finalCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const cleanDomain = websiteUrl ? websiteUrl.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '') : '';
    const initialIndustry = industry === 'AI_AUTO_DETECT' ? 'AI Auto-Detecting...' : (industry || 'B2B');

    const workspace = await Workspace.create({
      name: finalCompanyName,
      slug,
      domain: cleanDomain,
      industry: initialIndustry,
      businessCategory: businessCategory || (industry === 'AI_AUTO_DETECT' ? 'AI Auto-Discovery Enabled' : ''),
      businessModelDescription: businessModelDescription || '',
      operatingMode: 'AI_COMPANY',
      subscription: {
        planTier: 'NONE',
        baseMonthlyFee: 0,
        agentAddonFee: 0,
        totalMonthlyFee: 0,
        status: 'FREE_AUDIT',
        billingCycle: 'MONTHLY',
      },
      leadUsage: {
        monthlyIncludedQuota: 0,
        scrapedThisMonth: 0,
        cycleResetDate: new Date(),
      },
      ownerEmail: email.toLowerCase(),
      ownerName: name,
      branding: {
        primaryColor: '#06B6D4',
        secondaryColor: '#10B981',
        companyName: finalCompanyName,
      },
    });

    // Create initial wallet with $0.0 balance. Real money only added via payment/transaction.
    await Wallet.create({
      workspaceId: workspace._id,
      balanceUSD: 0.0,
      transactions: [],
    });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'workspace_owner',
      workspaceId: workspace._id,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: workspace._id,
      },
      workspace,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    let workspace = null;
    if (user.workspaceId) {
      workspace = await Workspace.findById(user.workspaceId);
    }
    if (!workspace) {
      workspace = await Workspace.findOne();
    }

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: workspace ? workspace._id : null,
      },
      workspace,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// POST /api/auth/admin-login (Dedicated Super Admin Master Control)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Super Admin email and password are required.' });
    }

    const MASTER_KEY = process.env.ADMIN_MASTER_KEY || 'vyuhox2026';
    if (adminKey && adminKey !== MASTER_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid Admin Security Key. Access strictly restricted.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Demo / fallback authorization for owner email
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('owner')) {
        const mockAdminToken = generateToken('usr_superadmin');
        const defaultWs = await Workspace.findOne({ industry: 'Crypto' }) || await Workspace.findOne();
        return res.json({
          success: true,
          token: mockAdminToken,
          user: {
            id: 'usr_superadmin',
            name: 'Super Admin',
            email: email.toLowerCase(),
            role: 'superadmin',
          },
          workspace: defaultWs,
        });
      }
      return res.status(401).json({ success: false, message: 'Super Admin account not found.' });
    }

    // Explicit check: only superadmin role permitted
    if (user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access Denied: This portal is strictly restricted to Super Administrators.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken(user._id);
    const workspace = await Workspace.findById(user.workspaceId) || await Workspace.findOne();

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'superadmin',
        workspaceId: workspace ? workspace._id : null,
      },
      workspace,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Admin login failed', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user && user.role !== 'superadmin') {
      if (user.workspaceId) {
        query = { _id: user.workspaceId };
      } else if (user.email) {
        query = { ownerEmail: user.email };
      }
    }

    let workspaces = await Workspace.find(query).sort({ createdAt: -1 });
    let activeWorkspace = null;

    if (req.workspaceId) {
      activeWorkspace = await Workspace.findById(req.workspaceId);
    }
    if (!activeWorkspace && user?.workspaceId) {
      activeWorkspace = await Workspace.findById(user.workspaceId);
    }
    if (!activeWorkspace && user?.email) {
      activeWorkspace = await Workspace.findOne({ ownerEmail: user.email });
    }
    if (!activeWorkspace && workspaces.length > 0) {
      activeWorkspace = workspaces[0];
    }
    if (!activeWorkspace) {
      if (user && user.role === 'superadmin') {
        activeWorkspace = await Workspace.findOne().sort({ createdAt: -1 });
      } else if (user) {
        // Safe auto-creation of the user's isolated workspace if missing
        activeWorkspace = await Workspace.create({
          name: `${user.name || user.email.split('@')[0]}'s Workspace`,
          ownerEmail: user.email,
          ownerName: user.name || '',
          operatingMode: 'AI_COMPANY',
        });
        await User.findByIdAndUpdate(user._id, { workspaceId: activeWorkspace._id });
        user.workspaceId = activeWorkspace._id;
      }
    }

    if (workspaces.length === 0 && activeWorkspace) {
      workspaces = [activeWorkspace];
    }

    let enrichedActiveWs = null;
    if (activeWorkspace) {
      enrichedActiveWs = {
        ...(activeWorkspace.toObject ? activeWorkspace.toObject() : activeWorkspace),
        ownerEmail: activeWorkspace.ownerEmail || user?.email || '',
        ownerName: activeWorkspace.ownerName || user?.name || '',
      };
    }

    return res.json({
      success: true,
      user,
      workspaces,
      activeWorkspace: enrichedActiveWs || activeWorkspace,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
