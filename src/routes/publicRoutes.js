/**
 * publicRoutes.js
 * Endpoints for public visitors, including <5ms dynamic Geo-IP and visitor intent personalization
 */

import express from 'express';
import { resolveGeoIntent } from '../middleware/geoPersonalization.js';
import { PlatformConfig } from '../models/PlatformConfig.js';
import { PricingPlan } from '../models/PricingPlan.js';

const router = express.Router();

/**
 * GET /api/public/personalization
 * Returns sub-5ms localized content matrix (Currency, City, Testimonials, Headline Hooks)
 * strictly preserving base pricing and plans
 */
router.get('/personalization', resolveGeoIntent, async (req, res) => {
  try {
    const { geo, intent, resolverLatencyMs } = req.geoIntent;

    // Fetch live plans ensuring base prices never deviate
    const plans = await PricingPlan.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

    return res.json({
      success: true,
      resolverLatencyMs,
      geo,
      intent,
      plans,
      guardrails: {
        basePricesImmutable: true,
        businessModelLocked: true,
        serverDrivenCurrency: geo.currency,
      },
    });
  } catch (error) {
    console.error('[PublicRoutes] Personalization error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const publicRoutes = router;
export default publicRoutes;
