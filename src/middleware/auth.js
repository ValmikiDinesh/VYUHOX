import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vyuhox_super_secret_jwt_key_2026_gtm_autonomous');
    let user = null;

    if (decoded.userId === 'usr_superadmin') {
      user = {
        _id: 'usr_superadmin',
        name: 'Super Admin',
        email: 'admin@vyuhox.ai',
        role: 'superadmin',
      };
    } else {
      user = await User.findById(decoded.userId).select('-passwordHash').lean();
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session expired.' });
    }

    req.user = user;

    // Strict Multi-Tenant Isolation Enforcement:
    const requestedWsId = req.headers['x-workspace-id'];
    const userWsId = user.workspaceId ? user.workspaceId.toString() : null;

    if (requestedWsId && requestedWsId !== userWsId) {
      if (user.role === 'superadmin') {
        // Superadmin has omniscient administrative oversight to inspect or act on any workspace
        req.workspaceId = requestedWsId;
      } else {
        // Regular clients (workspace_owner, member) are STRICTLY locked to their own workspace
        req.workspaceId = userWsId;
      }
    } else {
      req.workspaceId = userWsId || (user.role === 'superadmin' ? requestedWsId : null);
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

/**
 * verifyWorkspaceAccess
 * Multi-Tenant Data Leakage Prevention Barrier:
 * Ensures non-superadmin clients can NEVER access, query, or mutate another tenant's data.
 * Super Admin can access or act on any specified tenant without mixing data.
 */
export const verifyWorkspaceAccess = (paramKey = 'workspaceId') => {
  return (req, res, next) => {
    const targetWsId =
      req.params?.[paramKey] ||
      req.body?.[paramKey] ||
      req.query?.[paramKey] ||
      req.headers?.['x-workspace-id'];

    // Superadmin has master oversight across all tenant accounts
    if (req.user?.role === 'superadmin') {
      if (targetWsId) {
        req.workspaceId = targetWsId.toString();
      }
      return next();
    }

    // Non-superadmin clients must have an active workspace bound to their user account
    if (!req.workspaceId) {
      return res.status(403).json({
        success: false,
        message: 'Security & Privacy Policy Violation: No authenticated workspace bound to session.',
      });
    }

    // If client attempts to query or inject another client's workspace ID, block immediately
    if (targetWsId && targetWsId.toString() !== req.workspaceId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security & Privacy Policy Violation: Cross-tenant data access is strictly forbidden.',
      });
    }

    // Force downstream queries, params, and bodies to use the verified authenticated workspace ID
    if (req.workspaceId) {
      if (req.params && req.params[paramKey]) req.params[paramKey] = req.workspaceId;
      if (req.body && req.body[paramKey]) req.body[paramKey] = req.workspaceId;
      if (req.query && req.query[paramKey]) req.query[paramKey] = req.workspaceId;
    }

    next();
  };
};
