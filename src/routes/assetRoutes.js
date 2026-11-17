import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';
import { WorkspaceAsset } from '../models/WorkspaceAsset.js';
import { SocialPost } from '../models/SocialPost.js';
import { AdCreative } from '../models/AdCreative.js';
import { AdCampaign } from '../models/AdCampaign.js';
import { AssetDeliveryService } from '../services/media/AssetDeliveryService.js';

const router = express.Router();

/**
 * GET /api/assets/:id
 * Secure authenticated retrieval of private workspace media.
 * Scoped strictly to the caller's workspace (returns uniform 404 on missing or foreign assets to prevent enumeration).
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!isSuperAdmin && !userWsId) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    // Anti-enumeration query: only find asset if owned by this workspace (or superadmin)
    const query = isSuperAdmin ? { _id: id } : { _id: id, workspaceId: userWsId };
    const asset = await WorkspaceAsset.findOne(query);

    if (!asset) {
      // Uniform 404 response regardless of whether asset is nonexistent or belongs to another workspace
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    // Resolve private media stream with path traversal & tenant protection
    const mediaRes = await AssetDeliveryService.resolvePrivateMediaStream(asset.workspaceId, asset.filename);
    if (!mediaRes) {
      return res.status(404).json({ success: false, message: 'Media file not found on disk.' });
    }

    // Set secure response headers
    res.setHeader('Content-Type', asset.mimeType || mediaRes.mimeType || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    if (mediaRes.size) {
      res.setHeader('Content-Length', mediaRes.size);
    }

    return AssetDeliveryService.pipeMediaStream(mediaRes, res, req);
  } catch (error) {
    console.error('[AssetRoutes] Retrieval error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve media asset.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * GET /api/assets/:id/sign-url
 * Generates an asset-specific, short-lived (5 min) signed media URL for rendering.
 * Caller must be authenticated and authorized for this workspace asset.
 */
router.get('/:id/sign-url', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!isSuperAdmin && !userWsId) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const query = isSuperAdmin ? { _id: id } : { _id: id, workspaceId: userWsId };
    const asset = await WorkspaceAsset.findOne(query);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const signedToken = AssetDeliveryService.generateSignedMediaToken({
      assetId: asset._id,
      workspaceId: asset.workspaceId,
      expiresInSeconds: 300,
    });

    const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
    return res.json({
      success: true,
      signedUrl: `/api/assets/view/${signedToken}`,
      expiresAt,
    });
  } catch (error) {
    console.error('[AssetRoutes] Sign-url error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to generate signed URL.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * GET /api/assets/view/:signedToken
 * Dedicated endpoint for rendering signed media.
 * Verifies asset-specific HMAC token; strictly cannot authenticate any other API route.
 */
router.get('/view/:signedToken', async (req, res) => {
  try {
    const { signedToken } = req.params;
    const verification = AssetDeliveryService.verifySignedMediaToken(signedToken);

    if (!verification.valid) {
      if (verification.error === 'EXPIRED') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Media token has expired. Request a fresh signed URL.',
        });
      }
      return res.status(401).json({
        success: false,
        code: 'INVALID_SIGNATURE',
        message: 'Invalid or tampered media signature.',
      });
    }

    const { assetId, wsId } = verification.payload;
    const asset = await WorkspaceAsset.findOne({ _id: assetId, workspaceId: wsId });

    if (!asset || asset.status === 'ARCHIVED' || asset.status === 'DELETED') {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const mediaRes = await AssetDeliveryService.resolvePrivateMediaStream(asset.workspaceId, asset.filename);
    if (!mediaRes) {
      return res.status(404).json({ success: false, message: 'Media file not found on disk.' });
    }

    res.setHeader('Content-Type', asset.mimeType || mediaRes.mimeType || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=300');
    if (mediaRes.size) {
      res.setHeader('Content-Length', mediaRes.size);
    }

    return AssetDeliveryService.pipeMediaStream(mediaRes, res, req);
  } catch (error) {
    console.error('[AssetRoutes] View signed media error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to deliver signed media asset.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * GET /api/assets/meta/:id
 * Retrieve metadata for a specific private asset (Anti-enumeration: 404 for foreign assets)
 */
router.get('/meta/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!isSuperAdmin && !userWsId) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const query = isSuperAdmin ? { _id: id } : { _id: id, workspaceId: userWsId };
    const asset = await WorkspaceAsset.findOne(query);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    return res.json({ success: true, asset });
  } catch (error) {
    console.error('[AssetRoutes] Metadata error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve asset metadata.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * POST /api/assets/:id/publish
 * Explicitly publish an asset for external delivery.
 * Requires:
 * 1. Caller is superadmin or workspace_owner (members rejected with 403).
 * 2. Asset belongs to caller's workspace.
 * 3. Asset is associated with an approved social post or client-approved ad creative.
 */
router.post('/:id/publish', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!userWsId && !isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'No active workspace bound to session.' });
    }

    // Role check: Only workspace_owner and superadmin may publish assets
    if (!isSuperAdmin && req.user?.role !== 'workspace_owner') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only workspace owners and administrators can publish assets.',
      });
    }

    // Asset ownership check
    const query = isSuperAdmin ? { _id: id } : { _id: id, workspaceId: userWsId };
    const asset = await WorkspaceAsset.findOne(query);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    // Approval association check: verify asset is attached to an approved post or creative
    let isApprovedWorkflow = isSuperAdmin;

    if (!isApprovedWorkflow) {
      const targetWs = userWsId || asset.workspaceId.toString();

      // Check social post reference
      const postRef = await SocialPost.findOne({
        workspaceId: targetWs,
        status: { $in: ['PUBLISHED', 'SCHEDULED'] },
        $or: [
          { mediaUrl: asset.url },
          { mediaUrls: asset.url },
          { mediaUrl: new RegExp(asset.filename) },
          { mediaUrls: new RegExp(asset.filename) },
        ],
      });
      if (postRef) isApprovedWorkflow = true;

      if (!isApprovedWorkflow) {
        // Check ad creative reference with active approved parent campaign
        // An AdCreative alone must NOT authorize publishing without a verified active approved parent campaign
        const matchingCreatives = await AdCreative.find({
          workspaceId: targetWs,
          approvalStatus: 'CLIENT_APPROVED',
          status: 'ACTIVE',
          $or: [
            { mediaUrl: asset.url },
            { mediaUrl: new RegExp(asset.filename) },
          ],
        }).lean();

        for (const creative of matchingCreatives) {
          if (creative.campaignId) {
            const parentCampaign = await AdCampaign.findOne({
              _id: creative.campaignId,
              workspaceId: targetWs,
              status: 'ACTIVE',
              reviewStatus: { $in: ['APPROVED_BY_CLIENT', 'PUBLISHED'] },
            });
            if (parentCampaign) {
              isApprovedWorkflow = true;
              break;
            }
          }
        }
      }
    }

    if (!isApprovedWorkflow) {
      return res.status(403).json({
        success: false,
        message: 'Publishing forbidden: Asset must be associated with an approved campaign or scheduled social post before publication.',
      });
    }

    const result = await AssetDeliveryService.publishAsset(asset._id, asset.workspaceId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('[AssetRoutes] Publish error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to publish asset.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * POST /api/assets/:id/revoke
 * Safely unpublishes an asset and removes it from public delivery.
 * Checks whether media is still referenced by an active post or campaign before removal.
 */
router.post('/:id/revoke', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!userWsId && !isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'No active workspace bound to session.' });
    }

    // Role check: Only workspace_owner and superadmin may revoke assets
    if (!isSuperAdmin && req.user?.role !== 'workspace_owner') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only workspace owners and administrators can revoke assets.',
      });
    }

    const query = isSuperAdmin ? { _id: id } : { _id: id, workspaceId: userWsId };
    const asset = await WorkspaceAsset.findOne(query);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const result = await AssetDeliveryService.revokePublishedAsset(asset._id, asset.workspaceId, req.body?.options || {});

    if (!result.success) {
      if (result.conflict) {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('[AssetRoutes] Revoke error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to revoke asset.' });
    } else {
      res.destroy();
    }
  }
});

/**
 * GET /api/assets/raw/:workspaceId/:filename
 * Secure fallback retrieval by workspace ID and filename.
 * Anti-enumeration: returns 404 for foreign workspace requests.
 */
router.get('/raw/:workspaceId/:filename', authMiddleware, async (req, res) => {
  try {
    const { workspaceId, filename } = req.params;
    const userWsId = req.workspaceId ? req.workspaceId.toString() : null;
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!isSuperAdmin && (!userWsId || workspaceId.toString() !== userWsId)) {
      // Uniform 404 to prevent workspace enumeration
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
      });
    }

    const mediaRes = await AssetDeliveryService.resolvePrivateMediaStream(workspaceId, filename);
    if (!mediaRes) {
      return res.status(404).json({ success: false, message: 'Media file not found on disk.' });
    }

    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const mimeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
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
    console.error('[AssetRoutes] Raw retrieval error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve media asset.' });
    } else {
      res.destroy();
    }
  }
});

export default router;
export { router as assetRoutes };
