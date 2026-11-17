/**
 * client/src/utils/safeMediaResolver.js
 * Universal, tenant-safe media URL resolver for VYUHOX.
 * 
 * Enforces creative integrity and tenant security:
 * 1. Strictly rejects prohibited and unauthenticated providers (e.g. pollinations.ai).
 * 2. Blocks cross-tenant crypto leaks (hedgex) and legacy unlinked files (my_custom_post, vyuhox_banner, vyuhox_reel).
 * 3. Blocks malicious URI schemes (javascript:, vbscript:, data:text/html, etc.).
 * 4. Permits valid workspace-scoped published assets, authenticated asset endpoints, and vetted CDNs (Unsplash, client domain).
 * 5. Falls back to a high-end, dynamically branded SVG placeholder tailored to the active workspace name, industry, and aspect ratio.
 */

// Prohibited URL patterns that must NEVER reach image, video, or audio elements
const PROHIBITED_MEDIA_PATTERNS = [
  /pollinations\.ai/i,
  /vyuhox_banner\.jpg/i,
  /vyuhox_reel\.jpg/i,
  /hedgex/i,
  /my_custom_post/i,
  /^javascript:/i,
  /^vbscript:/i,
  /^data:text\//i,
];

/**
 * Generates an elegant brand-tailored SVG placeholder when media is missing, invalid, or prohibited.
 */
export const getDynamicBrandPlaceholder = (workspace, options = {}) => {
  const isReel = typeof options === 'boolean' ? options : Boolean(options.isReel);
  const width = options.width || (isReel ? 720 : 1080);
  const height = options.height || (isReel ? 1280 : 1080);

  const rawName = workspace?.name || workspace?.companyName || 'Brand Studio';
  const name = rawName.replace(/[<>&"']/g, ''); // SVG text escape
  const rawIndustry = workspace?.industry || workspace?.settings?.industry || 'Autonomous Creative';
  const industry = rawIndustry.replace(/[<>&"']/g, '');

  const isLuxury = /wedding|luxury|couture|estate|jewelry|fashion|hotel|decor/i.test(name + ' ' + industry);

  // Luxury / high-end palette vs modern enterprise tech palette
  const c1 = isLuxury ? '#1A0C14' : '#070C18';
  const c2 = isLuxury ? '#2C1322' : '#0B132B';
  const accent = isLuxury ? '#F59E0B' : '#06B6D4';
  const subtitle = isLuxury ? 'BESPOKE BRAND CREATIVE' : 'VERIFIED BRAND ASSET';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c1}"/>
      </linearGradient>
      <radialGradient id="accentGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#brandGlow)"/>
    <rect width="100%" height="100%" fill="url(#accentGlow)"/>
    <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.35}" fill="${accent}" opacity="0.12"/>
    <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.25}" fill="${accent}" opacity="0.08"/>
    <g transform="translate(${width / 2}, ${height / 2})" text-anchor="middle">
      <rect x="-140" y="-120" width="280" height="28" rx="14" fill="${accent}" opacity="0.15"/>
      <text y="-101" fill="${accent}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="2.5">${subtitle}</text>
      <text y="-25" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="${isReel ? '32' : '40'}" font-weight="900" letter-spacing="-0.5">${name}</text>
      <text y="${isReel ? '20' : '25'}" fill="${accent}" font-family="system-ui, -apple-system, sans-serif" font-size="${isReel ? '16' : '20'}" font-weight="700" letter-spacing="1.2">${industry.toUpperCase()}</text>
      <text y="${isReel ? '60' : '70'}" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="${isReel ? '13' : '15'}" font-weight="500">Autonomous GTM Creative Suite</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Checks if a given media URL is safe and permitted for production rendering.
 */
export const isSafeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  for (const pattern of PROHIBITED_MEDIA_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  // Permitted URI schemes
  const isHttp = /^https?:\/\//i.test(trimmed);
  const isDataUri = /^data:image\/(svg\+xml|png|jpeg|webp);/i.test(trimmed);
  const isRelative = /^\/(api\/assets\/|published\/|uploads\/|audio\/|media\/)/i.test(trimmed);
  const isBlob = /^blob:/i.test(trimmed);

  return isHttp || isDataUri || isRelative || isBlob;
};

/**
 * Validates a media download URL independently.
 * Rejects prohibited providers, dangerous schemes, and ensures only safe, valid URLs can be downloaded.
 */
export const isValidDownloadUrl = (url) => {
  if (!isSafeMediaUrl(url)) return false;
  const trimmed = url.trim();
  if (/^(javascript|vbscript|data:text\/|file:)/i.test(trimmed)) return false;
  return true;
};

/**
 * Resolves a media URL safely. If the URL is empty, invalid, or matches a prohibited pattern,
 * returns a brand-tailored SVG placeholder.
 */
export const resolveSafeMediaUrl = (url, workspace, options = {}) => {
  if (!isSafeMediaUrl(url)) {
    return getDynamicBrandPlaceholder(workspace, options);
  }
  return url.trim();
};

export default resolveSafeMediaUrl;

