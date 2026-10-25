/**
 * geoPersonalization.js
 * Ultra-Fast (<5ms) Geo-IP & Visitor Intent Personalization Middleware
 * 
 * CORE GUARANTEES:
 * 1. Zero Latency: Evaluates headers (CF-IPCountry, X-Forwarded-For, Accept-Language, utm_*)
 *    using pre-compiled static matrices without calling external LLM APIs on page requests.
 * 2. Immutable Core Rules: Base prices, plans, and business logic NEVER change.
 *    Only localized currency, geographic social proof, and campaign intent adapt dynamically.
 * 3. Fallback Safety: Gracefully defaults to India/Global matrices if IP or headers are unresolvable.
 */

// Pre-compiled contextual matrix by geographic region
const GEO_MATRIX = {
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    badgeText: '🇮🇳 Trusted by 1,200+ Fast-Growing Indian Startups & Exporters',
    heroTag: 'Zero-Latency Autonomous AI Sales Force for Indian Businesses',
    sampleCity: 'Bengaluru / Mumbai / Hyderabad',
    testimonialName: 'Rohan Deshmukh',
    testimonialRole: 'Founder, Apex Trade Logistics',
    testimonialLocation: 'Bengaluru, India',
    testimonialQuote: 'VYUHOX automated our entire B2B pipeline across Dubai and Europe. Maya closed our first export agreement on WhatsApp within 4 days.',
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    badgeText: '🇺🇸 Backed by Silicon Valley & New York Growth Engines',
    heroTag: 'Autonomous B2B Outbound Acquisition & Institutional Lead Machine',
    sampleCity: 'San Francisco / New York / Austin',
    testimonialName: 'Alexander Hayes',
    testimonialRole: 'Managing Partner, Meridian Capital',
    testimonialLocation: 'New York, USA',
    testimonialQuote: 'Maya Vance dials our inbound leads in 14 seconds. Our demo booking conversion doubled while our CAC dropped by 58%.',
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currency: 'USD',
    currencySymbol: '$',
    badgeText: '🇬🇧 Powering High-Growth London Fintech & Enterprise SaaS',
    heroTag: 'Autonomous Sales Infrastructure Compliant with UK & EU Standards',
    sampleCity: 'London / Manchester',
    testimonialName: 'Claire Beaumont',
    testimonialRole: 'VP of Growth, QuantScale UK',
    testimonialLocation: 'London, United Kingdom',
    testimonialQuote: 'Having multi-LLM failover and instant 1-click channel connections gave our sales team true 24/7 autonomous momentum.',
  },
  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    currency: 'USD',
    currencySymbol: '$',
    badgeText: '🇦🇪 Leading Dubai & GCC Global Trade Automation',
    heroTag: 'Two-Sided Cross-Border Trade & Automated B2B Deal Closing',
    sampleCity: 'Dubai / Abu Dhabi',
    testimonialName: 'Tariq Al-Mansoor',
    testimonialRole: 'Director, Gulf Commodities Exchange',
    testimonialLocation: 'Dubai, UAE',
    testimonialQuote: 'We run both factory sourcing and buyer distribution through VYUHOX simultaneously. The speed-to-lead execution is unmatched.',
  },
  DEFAULT: {
    countryCode: 'GLOBAL',
    countryName: 'Global',
    currency: 'USD',
    currencySymbol: '$',
    badgeText: '🌍 The World\'s First Fully Autonomous Go-To-Market Operating System',
    heroTag: 'Strategy, Leads, Voice AI, Omnichannel Comms & Paid Ads in One Platform',
    sampleCity: 'Global Tier 1 Hubs',
    testimonialName: 'Sarah Sterling',
    testimonialRole: 'Co-Founder, Synthetix AI',
    testimonialLocation: 'San Francisco, USA',
    testimonialQuote: 'Replace fragmented sales tools with a unified AI C-Suite that prospects, dials, and executes deals autonomously.',
  },
};

// Campaign intent matrix by UTM source/campaign
const INTENT_MATRIX = {
  voice: {
    intentKey: 'voice',
    headlineHook: 'Convert Inbound Leads in 14 Seconds with Maya Vance Voice AI',
    subHeadline: 'Sub-600ms conversational phone closer with live objection handling and direct calendar integration.',
  },
  ads: {
    intentKey: 'ads',
    headlineHook: 'Self-Healing Meta & Google Shopping Campaigns That Auto-Fix Rejections',
    subHeadline: 'Automated policy compliance, 24/7 AI budget scaling, and server-side CAPI attribution.',
  },
  trade: {
    intentKey: 'trade',
    headlineHook: 'Automate Import/Export Trade Pipelines and Factory Sourcing',
    subHeadline: 'Two-sided supplier and buyer prospecting with verified telephone and trade registry auditing.',
  },
  DEFAULT: {
    intentKey: 'general',
    headlineHook: 'Strategy, Leads, Voice AI, Omnichannel Comms & Paid Ads in One Platform.',
    subHeadline: 'Replace fragmented sales teams and disconnected point solutions. VYUHOX deploys an autonomous AI C-Suite that prospects, dials, and executes deals 24/7.',
  },
};

export const resolveGeoIntent = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  // 1. Resolve Country Code from Cloudflare, Cloudfront, or client headers
  const cfCountry = req.headers['cf-ipcountry'];
  const xGeoCountry = req.headers['x-geo-country'];
  const clientHint = req.headers['x-client-country'];
  const acceptLang = req.headers['accept-language'] || '';

  let detectedCountry = 'DEFAULT';

  if (cfCountry && GEO_MATRIX[cfCountry.toUpperCase()]) {
    detectedCountry = cfCountry.toUpperCase();
  } else if (xGeoCountry && GEO_MATRIX[xGeoCountry.toUpperCase()]) {
    detectedCountry = xGeoCountry.toUpperCase();
  } else if (clientHint && GEO_MATRIX[clientHint.toUpperCase()]) {
    detectedCountry = clientHint.toUpperCase();
  } else if (acceptLang.includes('en-IN') || acceptLang.includes('hi')) {
    detectedCountry = 'IN';
  }

  const geoProfile = GEO_MATRIX[detectedCountry] || GEO_MATRIX.DEFAULT;

  // 2. Resolve Visitor Intent from query params or headers
  const utmCampaign = (req.query.utm_campaign || req.query.campaign || '').toLowerCase();
  const utmSource = (req.query.utm_source || req.query.ref || '').toLowerCase();

  let detectedIntent = 'DEFAULT';
  if (utmCampaign.includes('voice') || utmSource.includes('bland') || utmCampaign.includes('calling')) {
    detectedIntent = 'voice';
  } else if (utmCampaign.includes('ads') || utmCampaign.includes('meta') || utmCampaign.includes('shopping')) {
    detectedIntent = 'ads';
  } else if (utmCampaign.includes('trade') || utmCampaign.includes('export') || utmCampaign.includes('import')) {
    detectedIntent = 'trade';
  }

  const intentProfile = INTENT_MATRIX[detectedIntent] || INTENT_MATRIX.DEFAULT;

  const endTime = process.hrtime.bigint();
  const latencyMs = Number(endTime - startTime) / 1000000;

  // Attach resolved profile to req
  req.geoIntent = {
    geo: geoProfile,
    intent: intentProfile,
    resolverLatencyMs: parseFloat(latencyMs.toFixed(3)),
  };

  next();
};

export default resolveGeoIntent;
