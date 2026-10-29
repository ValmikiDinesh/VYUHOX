import * as cheerio from 'cheerio';
import { LlmGatewayService } from './ai/LlmGatewayService.js';
import { BusinessTaxonomyBrain } from './ai/BusinessTaxonomyBrain.js';
import { EmployeeRoleBrain } from './ai/EmployeeRoleBrain.js';

/**
 * Service to deep-crawl websites end-to-end and synthesize authentic,
 * bespoke AI Go-To-Market strategies and complete Business Plan Documents.
 */
export class ScannerService {
  /**
   * Deep multi-page crawler discovering internal pages (/pricing, /about, /features, /solutions, etc.)
   */
  static async scanWebsite(rawUrl, onProgress = null) {
    let url = String(typeof rawUrl === 'object' && rawUrl !== null ? (rawUrl.url || '') : (rawUrl || '')).trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      // 0. Handle Google Maps / Business Profile / Search Links
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
        if (onProgress) onProgress(20, 'Resolving Google Maps short link...');
        try {
          const resolved = await fetch(url, { method: 'GET', redirect: 'follow' });
          if (resolved.url && !resolved.url.includes('maps.app.goo.gl')) {
            url = resolved.url;
          }
        } catch (e) {}
      }

      const isGoogleMaps = /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|maps\.google\.)/i.test(url);
      if (isGoogleMaps) {
        if (onProgress) onProgress(35, 'Detected Google Maps Business Profile Link. Extracting entity details...');
        let businessName = '';
        const placeMatch = url.match(/\/place\/([^/@?]+)/i);
        if (placeMatch && placeMatch[1]) {
          businessName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
        }
        if (!businessName) {
          const qMatch = url.match(/[?&]q=([^&]+)/i) || url.match(/\/search\/([^/@?]+)/i);
          if (qMatch && qMatch[1]) {
            businessName = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim();
          }
        }
        if (!businessName || businessName === 'maps') {
          businessName = 'Local Enterprise';
        }

        if (onProgress) onProgress(70, `Synthesizing bespoke intelligence for ${businessName}...`);
        return this.generateGoogleMapsBusinessIntelligence(url, businessName);
      }

      const urlObj = new URL(url);
      const domainName = urlObj.hostname.replace(/^www\./, '');
      const origin = urlObj.origin;

      // 1. Fetch Root Page
      if (onProgress) onProgress(15, `Connecting to root domain ${domainName}...`);
      let rootPageData = await this.fetchAndParsePage(url, 'HOME');

      // Check alternate www / non-www URL if root has no valid title or failed
      if (!rootPageData.ok || !rootPageData.title || rootPageData.title.length < 3) {
        const altUrl = urlObj.hostname.startsWith('www.')
          ? `https://${domainName}`
          : `https://www.${domainName}`;
        try {
          const altPageData = await this.fetchAndParsePage(altUrl, 'HOME');
          if (altPageData.ok && altPageData.title && altPageData.title.length >= 3) {
            rootPageData = altPageData;
          }
        } catch (e) {}
      }

      if (!rootPageData.ok) {
        console.warn(`[Scanner] Root fetch failed (${rootPageData.status}), attempting fallback synthesizer.`);
        return this.generateResilientDomainIntelligence(url, domainName);
      }

      // 2. Discover High-Priority Internal Links
      if (onProgress) onProgress(30, `Discovering sitemap & core internal pages...`);
      const discoveredLinks = this.filterAndPrioritizeInternalLinks(rootPageData.links, origin, domainName);

      // 3. Concurrently crawl top 4 high-value internal pages
      const pagesToCrawl = discoveredLinks.slice(0, 4);
      if (onProgress) onProgress(45, `Deep crawling ${pagesToCrawl.length + 1} pages across ${domainName}...`);

      const crawlPromises = pagesToCrawl.map(async (item) => {
        try {
          const pageResult = await this.fetchAndParsePage(item.url, item.type, 5000);
          return pageResult.ok ? pageResult : null;
        } catch (e) {
          return null;
        }
      });

      const crawledSubPages = (await Promise.allSettled(crawlPromises))
        .filter((r) => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value);

      const allPages = [rootPageData, ...crawledSubPages];

      // 4. Consolidate DOM Intelligence
      if (onProgress) onProgress(65, `Analyzing extracted DOM copy, pricing models & offerings...`);
      const consolidated = this.aggregateCrawledData(url, domainName, allPages);

      return consolidated;
    } catch (err) {
      console.warn(`[Scanner] Deep crawl error for ${url}: ${err.message}. Engaging intelligent domain reconstruction.`);
      const domainName = url.replace(/https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      return this.generateResilientDomainIntelligence(url, domainName);
    }
  }

  /**
   * Fetch a single page and extract structured HTML elements using Cheerio.
   * Deeply inspects each and every text block, tab, page route, image with alt text, product offering, and link.
   * For Single Page Applications (SPAs / CSR), automatically discovers and parses client-side JavaScript bundles.
   */
  static async fetchAndParsePage(pageUrl, pageType = 'GENERAL', timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(pageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (compatible; VYUHOX/2.0; +https://vyuhox.ai/bot)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Connection: 'close',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { ok: false, status: response.status, url: pageUrl };
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      let title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text().trim() ||
        '';

      let metaDescription =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      let siteName = $('meta[property="og:site_name"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content') || '';

      // Parse JSON-LD schema if present
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const raw = $(el).html();
          if (raw) {
            const parsed = JSON.parse(raw);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
              if (item.name && !title) title = item.name;
              if (item.description && !metaDescription) metaDescription = item.description;
              if (item.brand?.name && !siteName) siteName = item.brand.name;
            }
          }
        } catch (e) {}
      });

      // 1. EXTRACT NAVIGATION TABS & MENU ITEMS (before cleaning DOM)
      const tabs = [];
      $('nav, header, [role="navigation"], [role="tablist"], [role="tab"], .navbar, .nav, .menu, .menu-item, .tabs').each((_, container) => {
        $(container).find('a, button, [role="tab"], span').each((_, el) => {
          const text = $(el).text().replace(/\s+/g, ' ').trim();
          if (
            text &&
            text.length >= 2 &&
            text.length <= 40 &&
            !tabs.includes(text) &&
            !/^(sign in|log in|register|get started|demo)$/i.test(text)
          ) {
            tabs.push(text);
          }
        });
      });

      // 2. EXTRACT IMAGES & VISUAL ASSETS (with alt text & titles)
      const images = [];
      const seenImgSources = new Set();
      $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || '';
        const alt = ($(el).attr('alt') || $(el).attr('title') || '').trim();
        if (src && !seenImgSources.has(src)) {
          seenImgSources.add(src);
          images.push({
            src: src.startsWith('http') ? src : (src.startsWith('/') ? `${new URL(pageUrl).origin}${src}` : src),
            alt: alt || 'Product visual asset',
          });
        }
      });

      // 3. EXTRACT PRODUCT & SERVICE CARDS
      const products = [];
      $('[class*="product"], [class*="service"], [class*="solution"], [class*="plan"], [class*="tier"], [class*="card"], [class*="feature"]').each((_, el) => {
        const titleEl = $(el).find('h2, h3, h4, h5, strong, .title, [class*="title"]').first();
        const text = titleEl.text().replace(/\s+/g, ' ').trim();
        if (text && text.length >= 3 && text.length <= 60 && !products.includes(text)) {
          products.push(text);
        }
      });

      // 4. EXTRACT INTERNAL, PRODUCT & SOCIAL LINKS
      const links = [];
      const socialLinks = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        if (/(twitter\.com|x\.com|linkedin\.com|github\.com|t\.me|telegram\.org|youtube\.com|instagram\.com|discord\.(gg|com))/i.test(href)) {
          if (!socialLinks.includes(href) && socialLinks.length < 8) {
            socialLinks.push(href);
          }
        } else if (href.startsWith('/') || href.startsWith('http')) {
          links.push(href);
        }
      });

      // 5. DISCOVER SCRIPT BUNDLES (for SPA / CSR detection)
      const scriptSources = [];
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (
          src &&
          !src.includes('google-analytics') &&
          !src.includes('googletagmanager') &&
          !src.includes('facebook') &&
          !src.includes('clarity')
        ) {
          try {
            const absoluteScriptUrl = src.startsWith('http')
              ? src
              : new URL(src, pageUrl).href;
            scriptSources.push(absoluteScriptUrl);
          } catch (e) {}
        }
      });

      const isSpaDom = $('div#root, div#app, div#__next, div#__nuxt').length > 0;

      // Clean unwanted elements for direct HTML text extraction
      $('style, noscript, svg, iframe, footer').remove();

      // Extract Headings
      const h1List = [];
      $('h1').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length > 3 && text.length < 200 && !h1List.includes(text)) {
          h1List.push(text);
        }
      });

      const h2List = [];
      $('h2').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length > 5 && text.length < 200 && !h2List.includes(text)) {
          h2List.push(text);
        }
      });

      const h3List = [];
      $('h3').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length > 5 && text.length < 150 && !h3List.includes(text)) {
          h3List.push(text);
        }
      });

      // Extract key list items (features, bullet points)
      const bullets = [];
      $('li').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length > 10 && text.length < 180 && !bullets.includes(text)) {
          bullets.push(text);
        }
      });

      // Extract paragraphs with substance
      const paragraphs = [];
      $('p').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length > 35 && text.length < 350) {
          paragraphs.push(text);
        }
      });

      // Extract CTAs
      const ctas = [];
      $('a, button').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (
          text &&
          text.length > 2 &&
          text.length < 35 &&
          /get started|start free|try|book|demo|sign up|join|buy|explore|contact|schedule|pricing|launch/i.test(text)
        ) {
          if (!ctas.includes(text) && ctas.length < 8) ctas.push(text);
        }
      });

      // Detect pricing patterns in text
      const fullText = $('body').text().replace(/\s+/g, ' ');
      const pricingMatches = fullText.match(/(\$\s*\d+([,.]\d{2})?(\s*\/\s*(mo|month|year|yr|user|seat))?|free\s+trial|custom\s+pricing|contact\s+sales|tier|starter|pro|enterprise)/gi) || [];

      // Detect tech indicators
      const detectedTech = [];
      if (/shopify/i.test(html)) detectedTech.push('Shopify');
      if (/wordpress|wp-content/i.test(html)) detectedTech.push('WordPress');
      if (/next\.js|__NEXT_DATA__/i.test(html)) detectedTech.push('Next.js');
      if (/react/i.test(html) || isSpaDom) detectedTech.push('React');
      if (/vite/i.test(html)) detectedTech.push('Vite');
      if (/stripe/i.test(html)) detectedTech.push('Stripe');
      if (/intercom/i.test(html)) detectedTech.push('Intercom');
      if (/hubspot/i.test(html)) detectedTech.push('HubSpot');
      if (/webflow/i.test(html)) detectedTech.push('Webflow');

      // 6. SPA / CSR DEEP EXTRACTION ENGINE
      // If Cheerio found minimal body text (< 3 paragraphs and 0 H1s) and scripts exist,
      // fetch and inspect client-side JS bundles to extract all text, routes, tabs, and products!
      let isSpa = false;
      if ((paragraphs.length < 3 || h1List.length === 0) && (isSpaDom || scriptSources.length > 0)) {
        isSpa = true;
        // Prioritize application bundles (e.g. index-*, app-*, main-*, bundle-*)
        const appScripts = scriptSources
          .filter((s) => /assets|app|main|index|bundle|static/i.test(s))
          .concat(scriptSources)
          .slice(0, 3);

        for (const scriptUrl of appScripts) {
          try {
            const scriptCtrl = new AbortController();
            const sTimeout = setTimeout(() => scriptCtrl.abort(), 6000);
            const scriptRes = await fetch(scriptUrl, {
              signal: scriptCtrl.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; VYUHOX/2.0; +https://vyuhox.ai/bot)',
                Connection: 'close',
              },
            });
            clearTimeout(sTimeout);

            if (scriptRes.ok) {
              const js = await scriptRes.text();

              // Extract internal routes: path:"/..." or to:"/..."
              const routeRegex = /(?:path|to|href):\s*["'](\/[a-zA-Z0-9_\-\/]*)["']/g;
              let rm;
              while ((rm = routeRegex.exec(js)) !== null) {
                const route = rm[1];
                if (
                  route &&
                  route.length > 1 &&
                  !route.startsWith('/api') &&
                  !route.endsWith('.js') &&
                  !route.endsWith('.css') &&
                  !links.includes(route)
                ) {
                  links.push(route);
                  const cleanTab = route.replace(/^\//, '').replace(/[-_]/g, ' ');
                  if (cleanTab && cleanTab.length < 25 && !tabs.includes(cleanTab)) {
                    tabs.push(cleanTab.charAt(0).toUpperCase() + cleanTab.slice(1));
                  }
                }
              }

              // Extract user-facing string literals
              const strRegex = /"([^"\\]{15,250})"|'([^'\\]{15,250})'|`([^`\\]{15,250})`/g;
              let sm;
              // Ironclad Code Junk & Technical Error Sanitizer
              const isCodeJunk = (str) => {
                if (!str || typeof str !== 'string') return true;
                const trimmed = str.trim();
                // Reject too short or overly long strings
                if (trimmed.length < 12 || trimmed.length > 250) return true;
                // Reject technical code punctuation & syntax
                if (/[{}<>()\[\];=]/.test(trimmed)) return true;
                if (trimmed.includes('=>') || trimmed.includes('===') || trimmed.includes('!==') || trimmed.includes('||') || trimmed.includes('&&')) return true;
                // Reject CSS class attribute strings (Tailwind / Bootstrap / CSS utilities)
                if (/\b(bg-|text-|border-|flex|grid|p-|m-|px-|py-|mx-|my-|rounded|hover:|focus:|items-|justify-|shadow-|font-|w-|h-|space-|transition-|inline-flex|col-|sm:|md:|lg:|xl:)\b/i.test(trimmed)) {
                  const cssMatches = trimmed.match(/\b(bg-|text-|border-|flex|grid|p-|m-|px-|py-|mx-|my-|rounded|hover:|focus:|items-|justify-|shadow-|font-|w-|h-|space-|transition-|inline-flex)[a-z0-9\-]+/gi) || [];
                  if (cssMatches.length >= 2) return true;
                }
                // Reject JS runtime errors, framework internal strings and URL protocols
                if (/^(javascript:|Warning:|Error:|TypeError|ReferenceError|EvalError)/i.test(trimmed)) return true;
                if (/(\bthrow new\b|\bdelete\b|stopPropagation|preventDefault|window\[|\bbreak\b|\bcase\b|minified|webpack|node_modules|linear-gradient|rgba\(|var\(--)/i.test(trimmed)) return true;
                if (/(ReadonlyURLSearchParams|TemporaryReferenceSet|Server Function|Client Function|Next\.js|React\.Children|suppressHydrationWarning|dangerouslySetInnerHTML|defaultChecked|defaultValue|className)/i.test(trimmed)) return true;
                if (/(pattern\. To get rid of this warning|must start with the combined path|parent routes|pattern\.)/i.test(trimmed)) return true;
                if (/(verification code dispatched|session has expired|please sign in|scan failed|ensure archive contains|invalid credentials|password reset link|check your email)/i.test(trimmed)) return true;
                if (/(terms of service|audit disclaimer|all rights reserved|privacy policy|terms & conditions|cookie policy)/i.test(trimmed)) return true;
                if (trimmed.endsWith('?') || /^(does|is|are|can|will|should|how|what|why|who)\b/i.test(trimmed)) return true;
                if (/^(spent nearly|these locks rely|regular computers)/i.test(trimmed) && !/[.!?]$/.test(trimmed)) return true;
                if (/\b(function|class|return|const|let|var|import|export|typeof|instanceof|innerHTML)\b/i.test(trimmed)) return true;
                if (/\b(mousedown|mouseup|touchstart|touchend|keydown|keypress|durationchange|timeupdate|animationend|animationstart|animationiteration|canplay|seeked|focusin|focusout|selectionchange)\b/i.test(trimmed)) return true;
                if (/http[s]?:\/\/[^\s]+/i.test(trimmed)) return true; // URLs are not commercial offering titles
                // Must have human sentence-like word structure (at least 3 genuine English/human words)
                const words = trimmed.split(/\s+/).filter((w) => /^[a-zA-Z0-9'’–—\-]+$/.test(w));
                if (words.length < 3) return true;
                // If words look like minified JS identifiers (e.g. n5, tQ, nG)
                if (words.some((w) => w.length <= 2 && !/^(in|on|at|to|for|of|by|and|or|the|a|an|up|is|we|our|all|top|new|men|buy)$/i.test(w))) return true;
                return false;
              };

              const validStrings = [];
              while ((sm = strRegex.exec(js)) !== null) {
                const s = (sm[1] || sm[2] || sm[3] || '').trim();
                if (!isCodeJunk(s)) {
                  validStrings.push(s);
                }
              }

              // Prioritize substantive commercial phrases (products, collections, benefits, quality)
              validStrings.sort((a, b) => {
                const aCommercial = /product|watch|luxury|collection|brand|delivery|warranty|quality|service|solution|platform|craftsmanship|guarantee/i.test(a);
                const bCommercial = /product|watch|luxury|collection|brand|delivery|warranty|quality|service|solution|platform|craftsmanship|guarantee/i.test(b);
                if (aCommercial && !bCommercial) return -1;
                if (!aCommercial && bCommercial) return 1;
                return b.length - a.length;
              });

              for (const s of validStrings) {
                // Classify substantive domain strings
                if (s.length < 65 && !h1List.includes(s) && !h2List.includes(s)) {
                  if (h1List.length < 6) h1List.push(s);
                  else if (h2List.length < 15) h2List.push(s);
                } else if (s.length >= 65 && !paragraphs.includes(s)) {
                  if (bullets.length < 20) bullets.push(s);
                  if (paragraphs.length < 15) paragraphs.push(s);
                }

                // Discover pricing signals inside script
                const pMatch = s.match(/(\$\s*\d+|₹\s*[\d,]+|free\s+trial|custom\s+pricing|tier|starter|pro|enterprise)/gi);
                if (pMatch) {
                  for (const pm of pMatch) {
                    if (!pricingMatches.includes(pm)) pricingMatches.push(pm);
                  }
                }
              }
            }
          } catch (e) {
            // Script bundle fetch ignored on timeout/error
          }
        }
      }

      // If alt text exists on images, incorporate them into features and domain signals
      images.forEach((img) => {
        if (img.alt && img.alt.length > 15 && !bullets.includes(img.alt)) {
          bullets.push(img.alt);
        }
      });

      return {
        ok: true,
        url: pageUrl,
        pageType,
        title,
        siteName,
        metaDescription,
        ogImage,
        h1List: h1List.slice(0, 8),
        h2List: h2List.slice(0, 15),
        h3List: h3List.slice(0, 12),
        bullets: bullets.slice(0, 25),
        paragraphs: paragraphs.slice(0, 15),
        ctas,
        links,
        socialLinks,
        tabs: tabs.slice(0, 15),
        images: images.slice(0, 20),
        products: products.slice(0, 12),
        pricingSignals: [...new Set(pricingMatches)].slice(0, 8),
        detectedTech,
        isSpa,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return { ok: false, status: 500, error: err.message, url: pageUrl };
    }
  }

  /**
   * Filter and prioritize internal links by their strategic value
   */
  static filterAndPrioritizeInternalLinks(links, origin, domainName) {
    const scoredLinks = new Map();

    for (const raw of links) {
      try {
        let normalized = raw;
        if (normalized.startsWith('/')) {
          normalized = `${origin}${normalized}`;
        }
        const u = new URL(normalized);

        // Keep strictly on same root domain
        if (!u.hostname.endsWith(domainName)) continue;

        // Skip anchors, query spam, media
        if (u.pathname === '/' || u.pathname === '') continue;
        if (/\.(png|jpg|jpeg|gif|svg|pdf|css|js|woff|ico)$/i.test(u.pathname)) continue;

        const path = u.pathname.toLowerCase();
        let type = 'GENERAL';
        let priority = 10;

        if (/(pricing|plans|cost|subscription)/i.test(path)) {
          type = 'PRICING';
          priority = 100;
        } else if (/(features|product|solutions|platform|capabilities|how-it-works|use-cases)/i.test(path)) {
          type = 'PRODUCT_FEATURES';
          priority = 90;
        } else if (/(about|company|story|team|mission)/i.test(path)) {
          type = 'ABOUT';
          priority = 80;
        } else if (/(customers|case-studies|testimonials|clients|reviews|wall-of-love)/i.test(path)) {
          type = 'CUSTOMERS';
          priority = 70;
        } else if (/(contact|demo|sales|talk-to-us)/i.test(path)) {
          type = 'CONTACT';
          priority = 60;
        }

        const cleanUrl = `${u.origin}${u.pathname}`;
        if (!scoredLinks.has(cleanUrl) || scoredLinks.get(cleanUrl).priority < priority) {
          scoredLinks.set(cleanUrl, { url: cleanUrl, type, priority, path: u.pathname });
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }

    return Array.from(scoredLinks.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Consolidate multi-page crawled data into a rich company profile.
   * Compiles all text, tabs, pages, images with alt text, products, and links.
   */
  static aggregateCrawledData(url, domainName, pages) {
    const root = pages[0] || {};
    const subPages = pages.slice(1);

    // Clean and derive authentic business name
    let businessName = root.siteName;
    if (!businessName && root.title) {
      // Strip trailing company/tagline suffixes like "| Valmiki Softwares", "| Home", etc.
      const cleanTitle = root.title.replace(/\s*\|\s*(valmiki softwares|home|official site|welcome|landing).*$/i, '');
      // Split strictly on em-dash —, en-dash –, pipe |, colon :, bullet •, or space-hyphen-space " - "
      // Do NOT split on solitary mid-word hyphens like "Post-Quantum" or "AI-Powered"
      const parts = cleanTitle.split(/\s+[—–|:•]\s+|\s+-\s+/);
      if (parts.length > 0 && parts[0].trim().length >= 2) {
        businessName = parts[0].trim();
      } else {
        businessName = cleanTitle.trim();
      }
    }
    if (!businessName || businessName.length < 2 || businessName.length > 40) {
      businessName = domainName.split('.')[0];
      businessName = businessName.charAt(0).toUpperCase() + businessName.slice(1);
    }

    // Aggregate headings, bullets, paragraphs, tabs, images, products, and links
    const allH1 = [];
    const allH2 = [];
    const allFeatures = [];
    const allParagraphs = [];
    const allCtas = [];
    const allSocials = [];
    const allPricingSignals = [];
    const allTabs = [];
    const allImages = [];
    const allProducts = [];
    const allLinks = [];
    const allTech = new Set();
    let anySpa = false;

    for (const p of pages) {
      if (!p || !p.ok) continue;
      if (p.isSpa) anySpa = true;
      if (p.h1List) allH1.push(...p.h1List);
      if (p.h2List) allH2.push(...p.h2List);
      if (p.bullets) allFeatures.push(...p.bullets);
      if (p.paragraphs) allParagraphs.push(...p.paragraphs);
      if (p.ctas) allCtas.push(...p.ctas);
      if (p.socialLinks) allSocials.push(...p.socialLinks);
      if (p.pricingSignals) allPricingSignals.push(...p.pricingSignals);
      if (p.tabs) allTabs.push(...p.tabs);
      if (p.images) allImages.push(...p.images);
      if (p.products) allProducts.push(...p.products);
      if (p.links) allLinks.push(...p.links);
      if (p.detectedTech) p.detectedTech.forEach((t) => allTech.add(t));
    }

    // Deduplicate
    const uniqueH1 = [...new Set(allH1)].slice(0, 10);
    const uniqueH2 = [...new Set(allH2)].slice(0, 18);
    const uniqueFeatures = [...new Set(allFeatures)].filter((f) => f.length > 15 && f.length < 220).slice(0, 25);
    const uniqueParagraphs = [...new Set(allParagraphs)].slice(0, 15);
    const uniqueCtas = [...new Set(allCtas)].slice(0, 8);
    const uniqueSocials = [...new Set(allSocials)].slice(0, 8);
    const uniquePricing = [...new Set(allPricingSignals)].slice(0, 10);
    const uniqueTabs = [...new Set(allTabs)].slice(0, 20);
    const uniqueProducts = [...new Set(allProducts)].slice(0, 15);
    const uniqueLinks = [...new Set(allLinks)].slice(0, 30);

    const seenImg = new Set();
    const uniqueImages = [];
    for (const img of allImages) {
      const key = img.src || img.alt;
      if (key && !seenImg.has(key)) {
        seenImg.add(key);
        uniqueImages.push(img);
      }
    }

    return {
      url,
      domainName,
      businessName,
      title: root.title || `${businessName} Platform`,
      metaDescription: root.metaDescription || uniqueParagraphs[0] || '',
      ogImage: root.ogImage || (uniqueImages[0]?.src || ''),
      h1List: uniqueH1.length > 0 ? uniqueH1 : [root.title || businessName],
      h2List: uniqueH2,
      detectedFeatures: uniqueFeatures,
      detectedPricing: uniquePricing,
      keyParagraphs: uniqueParagraphs,
      ctas: uniqueCtas.length > 0 ? uniqueCtas : ['Get Started', 'Book a Demo'],
      socialLinks: uniqueSocials,
      scannedTabs: uniqueTabs,
      scannedImages: uniqueImages.slice(0, 25),
      scannedProducts: uniqueProducts,
      scannedLinks: uniqueLinks,
      detectedTech: Array.from(allTech),
      pagesCrawled: pages.map((p) => ({ url: p.url, type: p.pageType || 'PAGE' })),
      extractedAt: new Date().toISOString(),
      isLiveCrawl: true,
      isSpa: anySpa,
    };
  }

  /**
   * Synthesize genuine entity intelligence from Google Maps / Local business profile
   */
  static generateGoogleMapsBusinessIntelligence(url, businessName) {
    const archetype = BusinessTaxonomyBrain.identifyArchetype(businessName, url);
    const category = archetype.categoryName;
    const detectedFeatures = archetype.offeringsTemplate(businessName);
    const detectedPricing = [archetype.targetAudience?.typicalACV || 'Custom Quotation Based on Scope'];

    return {
      url,
      domainName: `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.local`,
      businessName,
      title: `${businessName} • Verified ${category} & Services`,
      metaDescription: `${businessName} provides premier ${category} solutions and verified customer services.`,
      ogImage: '',
      h1List: [`Welcome to ${businessName}`],
      h2List: ['Services & Offerings', 'Customer Trust & Testimonials', 'Contact & Location'],
      detectedFeatures,
      detectedPricing,
      keyParagraphs: [
        `${businessName} is a verified business offering premier ${category} solutions designed to serve clients with utmost trust and transparency.`,
      ],
      ctas: ['Call Now', 'Visit Business', 'Schedule Consultation'],
      socialLinks: [],
      scannedTabs: ['Overview', 'Services', 'Reviews', 'About'],
      scannedImages: [],
      scannedProducts: detectedFeatures,
      scannedLinks: [],
      detectedTech: ['Google Maps Business Profile'],
      pagesCrawled: [{ url, type: 'GOOGLE_MAPS_PROFILE' }],
      extractedAt: new Date().toISOString(),
      isLiveCrawl: true,
      inferredCategory: category,
      archetype,
    };
  }

  /**
   * Resilient fallback synthesizer for domain names if server is unreachable
   */
  static generateResilientDomainIntelligence(url, domainName) {
    const cleanName = domainName
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const archetype = BusinessTaxonomyBrain.identifyArchetype(domainName, url);
    const detectedFeatures = archetype.offeringsTemplate(cleanName);

    return {
      url,
      domainName,
      businessName: cleanName,
      title: `${cleanName} — ${archetype.categoryName}`,
      metaDescription: `Accelerate revenue, customer acquisition, and scale operations with ${cleanName}.`,
      ogImage: '',
      h1List: [`Transform How Your Industry Scales with ${cleanName}`],
      h2List: [
        'Enterprise Reliability & Rapid Customer Value',
        'Built for Modern High-Growth Organizations',
        'End-to-End Operational Excellence',
      ],
      detectedFeatures,
      detectedPricing: [archetype.targetAudience?.typicalACV || 'Free Trial Available / Contact Team'],
      keyParagraphs: [`${cleanName} delivers high-performance ${archetype.categoryName} engineered to drive market adoption and customer success.`],
      ctas: ['Start Free Trial', 'Book Demo', 'Contact Team'],
      socialLinks: [`https://linkedin.com/company/${cleanName.toLowerCase()}`],
      detectedTech: [],
      pagesCrawled: [{ url, type: 'FALLBACK_SYNTHESIS' }],
      extractedAt: new Date().toISOString(),
      isLiveCrawl: false,
      inferredCategory: archetype.categoryName,
      archetype,
    };
  }

  /**
   * Synthesize full GTM Intelligence Strategy and Complete Business Plan Document.
   * Leverages live OpenAI or Gemini API if available, otherwise executes Deep Semantic Analytical NLP.
   */
  static async synthesizeStrategy(extractedData, workspaceContext = {}) {
    // 0. Master Universal Multi-LLM Gateway (Gemini 1.5 / OpenAI / Groq / DeepSeek)
    try {
      const clientBizName = workspaceContext.workspaceName || extractedData.businessName || 'Enterprise';
      const clientCategory = workspaceContext.businessCategory || workspaceContext.industry || '';
      const clientDesc = workspaceContext.businessModelDescription || '';
      const clientTagline = workspaceContext.tagLine || '';
      const clientOfferingType = workspaceContext.offeringType || 'UNSPECIFIED';

      const gtmPrompt = `You are a world-class Chief Strategy Officer and Growth Agency Partner (combining McKinsey, Ogilvy, and Y Combinator).
Analyze the following crawled business website data and client inputs to synthesize an authentic, 100% bespoke, production-ready Go-To-Market blueprint.

CLIENT BUSINESS INPUTS:
- Business Name: ${clientBizName}
- Offering Type: ${clientOfferingType} (Product, Service, or Both)
- Business Category / Niche: ${clientCategory || 'Deduce from website'}
- Business Tagline: ${clientTagline || 'N/A'}
- Business Model & Description: ${clientDesc || 'Deduce from website'}

CRAWLED WEBSITE DATA:
- Target URL: ${extractedData.url}
- Title: ${extractedData.title}
- Meta Description: ${extractedData.metaDescription}
- Headings: ${(extractedData.h1List || []).concat(extractedData.h2List || []).slice(0, 10).join(' | ')}
- Discovered Features/Offerings: ${(extractedData.detectedFeatures || []).slice(0, 10).join('; ')}
- Discovered Paragraphs: ${(extractedData.keyParagraphs || []).slice(0, 5).join(' ')}
- Detected Pricing: ${(extractedData.detectedPricing || []).join(', ')}

TASK:
Accurately identify this company's exact industry and formulate their genuine GTM strategy aligned with whether it is a ${clientOfferingType !== 'UNSPECIFIED' ? clientOfferingType : 'Product or Service'}.
CRITICAL RULES:
1. NEVER output generic enterprise software / SaaS templates unless the site is genuinely B2B software.
2. Align the growth engine, funnels, target buyer personas, ACV/AOV, and decision-maker roles strictly to whether the crawled data represents B2B enterprise, D2C consumer e-commerce, local walk-in retail/clinic, or specialized commercial services.
3. Every single section must be 100% tailored to THIS specific business.
4. Output strictly valid JSON matching this schema:

{
  "businessName": "${clientBizName}",
  "category": "Exact industry vertical / business category",
  "businessModel": "Exact business model (e.g. D2C_LUXURY_COMMERCE, LOCAL_HEALTHCARE, B2B_SAAS, COMMERCIAL_SERVICES)",
  "growthEngine": "'PAID_ADS_D2C' | 'OUTBOUND_B2B' | 'LOCAL_SEO_MAPS' | 'HYBRID'",
  "summary": "2-sentence executive summary of what this specific company actually does and sells",
  "whatTheySell": "Comprehensive 3-sentence breakdown of their exact physical products, bespoke services, or software features",
  "coreOfferings": ["5 to 7 authentic offerings or products discovered from their website"],
  "positioning": {
    "coreValueProp": "Their genuine value proposition for their customers",
    "unfairAdvantage": "Their unique moat or craftsmanship advantage",
    "keyDifferentiators": ["3 specific differentiators"]
  },
  "targetAudience": {
    "primaryPersona": "Exact target buyer persona",
    "decisionMakers": ["3 to 4 specific decision maker titles/roles who actually buy this"],
    "painPoints": ["3 to 4 genuine customer pain points this business solves"],
    "buyingTriggers": ["3 to 4 key buying triggers"],
    "estimatedACV": "Typical transaction value or order range"
  },
  "swotAnalysis": {
    "strengths": ["4 authentic strengths based on this specific business"],
    "weaknesses": ["4 honest operational or scale challenges"],
    "opportunities": ["4 genuine market growth opportunities"],
    "threats": ["4 external market risks"]
  },
  "googleAdsCampaigns": {
    "searchAds": [
      {
        "headlines": ["3 compelling 30-char headlines for Google Search"],
        "descriptions": ["2 90-char descriptions"],
        "keywords": ["5 high-intent keywords"],
        "negativeKeywords": ["3 negative keywords"]
      }
    ],
    "pMax": {
      "assetGroupName": "High-Intent Audience",
      "headlines": ["3 headlines"],
      "longHeadline": "1 long headline",
      "description": "1 compelling description",
      "callToAction": "ORDER_NOW"
    },
    "displayAds": {
      "angle": "High-performing visual hook",
      "visualSpecs": "Visual specifications",
      "placements": ["3 niche websites/blogs where buyers hang out"]
    },
    "youtubeAds": {
      "hook": "Attention-grabbing 5-second video hook",
      "scriptBreakdown": "Step-by-step 30s video outline"
    }
  },
  "metaAdsCampaigns": {
    "facebookFeed": {
      "headline": "Scroll-stopping headline",
      "primaryText": "Engaging direct-response copy",
      "visualDirective": "Visual concept description",
      "cta": "LEARN_MORE"
    },
    "instagramReels": {
      "hook": "First 3-second hook for Reel/TikTok",
      "script": "Voiceover script for 15-30s video",
      "audioVibe": "Audio tone/style",
      "visualDirective": "Visual scenes description",
      "cta": "ORDER_NOW"
    },
    "carouselAds": [
      { "card": 1, "title": "Card 1 title", "copy": "Card 1 copy" },
      { "card": 2, "title": "Card 2 title", "copy": "Card 2 copy" },
      { "card": 3, "title": "Card 3 title", "copy": "Card 3 copy" },
      { "card": 4, "title": "Card 4 title", "copy": "Card 4 copy" }
    ],
    "storiesAds": {
      "hook": "Vertical story hook",
      "benefitPoints": ["3 quick bullet points"],
      "ctaText": "Swipe Up CTA"
    }
  },
  "seoStrategy": {
    "technicalChecklist": ["4 technical SEO items"],
    "primaryKeywords": ["6 to 8 exact primary keywords"],
    "contentPillars": ["3 to 4 content pillars"],
    "schemaType": "Recommended JSON-LD schema (e.g. LocalBusiness, Product, Organization)"
  },
  "aeoStrategy": {
    "aiEngineOptimization": "Directive on how ChatGPT, Perplexity and Google Gemini should cite and recommend this brand",
    "qaAuthorityPairs": [
      { "question": "Customer question 1", "answer": "Authoritative brand answer 1" },
      { "question": "Customer question 2", "answer": "Authoritative brand answer 2" }
    ]
  },
  "leadDiscoveryCriteria": {
    "buyerSearchKeywords": ["5 exact search queries to discover real prospective buyers in any city"],
    "buyerPersonas": ["4 exact job titles or roles who buy this"],
    "targetCompanyTypes": ["3 types of businesses, agencies, or individuals who purchase this"]
  },
  "recommendedAITeam": {
    "coreBottleneckSolved": "The single primary operational or growth bottleneck this AI workforce eliminates for this business",
    "estimatedMonthlyROI": "Projected ROI multiple or revenue impact metric",
    "recommendedPlan": "Enterprise Autonomous Growth & Operations Mode",
    "teamMembers": [
      {
        "role": "Specific AI Agent Title tailored to this business",
        "purpose": "Exact operational workflow this agent executes for this company",
        "monthlyEquivalentValue": "$3,500/mo Human Equivalent Value"
      }
    ]
  }
}`;

      const llmResult = await LlmGatewayService.execute({
        prompt: gtmPrompt,
        systemInstruction: 'You are an elite Autonomous Chief Revenue Officer and Agency Partner. Output strictly valid JSON.',
        jsonResponse: true,
        temperature: 0.2,
        timeoutMs: 30000,
      });

      if (llmResult?.parsedJson && llmResult.parsedJson.category) {
        console.log(`[ScannerService] Successfully synthesized bespoke GTM strategy using LLM (${llmResult.provider}/${llmResult.model}) for ${extractedData.businessName}`);
        return this.enrichLlmStrategyWithBlueprint(llmResult.parsedJson, extractedData, workspaceContext);
      }

      const failMsg = llmResult?.error || 'AI did not return structured strategy data';
      throw new Error(`AI Service Unavailable: Unable to synthesize Go-To-Market strategy for "${clientBizName}". Reason: ${failMsg}. Please check your Gemini API key or quota.`);
    } catch (llmErr) {
      console.error('[ScannerService] AI Strategy Synthesis Error:', llmErr.message);
      throw new Error(llmErr.message.startsWith('AI Service Unavailable')
        ? llmErr.message
        : `AI Service Unavailable: Failed to synthesize strategy with AI. Reason: ${llmErr.message}. Please check your Gemini API key or quota.`);
    }
  }

  /**
   * Enriches structured LLM response with complete multi-channel GTM blueprint
   */
  static enrichLlmStrategyWithBlueprint(llmResult, extractedData, workspaceContext = {}) {
    const name = llmResult.businessName || extractedData.businessName || 'Enterprise';
    const domain = extractedData.domainName || '';
    const category = llmResult.category || 'Specialized Enterprise';
    const summary = llmResult.summary || `${name} specialized commercial offerings.`;
    const whatTheySell = llmResult.whatTheySell || summary;
    const coreOfferings = Array.isArray(llmResult.coreOfferings) && llmResult.coreOfferings.length > 0
      ? llmResult.coreOfferings
      : (extractedData.detectedFeatures || []).slice(0, 6);

    const positioning = {
      whatTheySell,
      coreOfferings,
      coreValueProp: llmResult.positioning?.coreValueProp || summary,
      unfairAdvantage: llmResult.positioning?.unfairAdvantage || `Proprietary ${category} delivery model.`,
      keyDifferentiators: llmResult.positioning?.keyDifferentiators || coreOfferings.slice(0, 3),
    };

    const targetAudience = {
      primaryPersona: llmResult.targetAudience?.primaryPersona || 'Direct Decision Makers & Buyers',
      decisionMakers: llmResult.targetAudience?.decisionMakers || ['Owner', 'Decision Maker'],
      painPoints: llmResult.targetAudience?.painPoints || ['Operational friction', 'High acquisition cost'],
      buyingTriggers: llmResult.targetAudience?.buyingTriggers || ['Seasonal demand surge', 'Immediate requirement'],
      estimatedACV: llmResult.targetAudience?.estimatedACV || 'Tailored to customer scale',
      pricingSummary: (extractedData.detectedPricing || [])[0] || llmResult.targetAudience?.estimatedACV || 'Direct Quote / Flexible Schedule',
    };

    const industryProfile = {
      category,
      primaryPersona: targetAudience.primaryPersona,
      decisionMakers: targetAudience.decisionMakers,
      painPoints: targetAudience.painPoints,
      buyingTriggers: targetAudience.buyingTriggers,
    };

    const recommendedChannels = this.buildTailoredChannels(category);
    const adAngles = this.buildBespokeAdAngles(name, industryProfile, extractedData);
    const recommendedAITeam = (llmResult.recommendedAITeam?.teamMembers?.length > 0)
      ? {
          roles: llmResult.recommendedAITeam.teamMembers.map((m) => `${m.role}: ${m.purpose}`),
          teamMembers: llmResult.recommendedAITeam.teamMembers,
          estimatedMonthlyROI: llmResult.recommendedAITeam.estimatedMonthlyROI || '5.8x – 10.4x Qualified Pipeline ROI',
          recommendedPlan: llmResult.recommendedAITeam.recommendedPlan || 'Enterprise Autonomous Growth Mode',
          coreBottleneckSolved: llmResult.recommendedAITeam.coreBottleneckSolved || `Accelerating revenue growth and operational velocity for ${name}`,
        }
      : this.buildAITeamArchitecture(category, name, extractedData);
    const stepByStepRoadmap = this.buildStepByStepRoadmap(name, industryProfile, targetAudience);

    const businessPlanDocument = this.buildFullBusinessPlanDocument({
      name,
      url: extractedData.url,
      domain,
      category,
      summary,
      targetAudience,
      positioning,
      recommendedChannels,
      adAngles,
      recommendedAITeam,
      stepByStepRoadmap,
      features: coreOfferings,
      techStack: extractedData.detectedTech || [],
      pagesCrawledCount: (extractedData.pagesCrawled || []).length,
    });

    const bespokeTaxonomy = BusinessTaxonomyBrain.generateBespokeIntelligence(extractedData);

    const identifiedServices = (coreOfferings || []).map((item) => {
      const isObj = typeof item === 'object' && item !== null;
      const nameStr = isObj ? item.name || 'Core Solution' : item;
      return {
        name: nameStr,
        description: isObj && item.description ? item.description : `Verified ${nameStr} engineered specifically for target buyer operational requirements.`,
        category: isObj && item.category ? item.category : 'Primary Offering',
        deliverable: isObj && item.deliverable ? item.deliverable : 'Complete end-to-end execution',
      };
    });

    const buyerTargeting = {
      whoWillBuy: targetAudience.primaryPersona || 'Target buyers with active budget and pressing need',
      whoCanBuy: `${category} clients with verified purchasing authority and active budget`,
      toWhomToSell: targetAudience.decisionMakers && targetAudience.decisionMakers.length > 0
        ? targetAudience.decisionMakers
        : [targetAudience.primaryPersona || 'Direct Buyer'],
      whoWillBeInterested: `${category} buyers, enthusiasts, and planning teams`,
      buyingTriggers: targetAudience.buyingTriggers && targetAudience.buyingTriggers.length > 0
        ? targetAudience.buyingTriggers
        : ['Immediate need', 'Quality upgrade', 'Special milestone requirement'],
    };

    let growthEngine = llmResult.growthEngine;
    if (!growthEngine || !['OUTBOUND_B2B', 'PAID_ADS_D2C', 'HYBRID', 'LOCAL_SEO_MAPS'].includes(growthEngine)) {
      const categoryLower = (category || '').toLowerCase();
      const isConsumerCommerce = /ecommerce|retail|store|consumer|d2c/i.test(categoryLower) ||
                                /d2c|ecommerce/i.test(llmResult.businessModel || '');
      growthEngine = isConsumerCommerce ? 'PAID_ADS_D2C' : 'OUTBOUND_B2B';
    }

    const swotAnalysis = (llmResult.swotAnalysis && llmResult.swotAnalysis.strengths?.length > 0)
      ? llmResult.swotAnalysis
      : bespokeTaxonomy.swotAnalysis;

    const googleAdsCampaigns = (llmResult.googleAdsCampaigns && llmResult.googleAdsCampaigns.searchAds?.length > 0)
      ? llmResult.googleAdsCampaigns
      : bespokeTaxonomy.googleAdsCampaigns;

    const metaAdsCampaigns = (llmResult.metaAdsCampaigns && llmResult.metaAdsCampaigns.facebookFeed)
      ? llmResult.metaAdsCampaigns
      : bespokeTaxonomy.metaAdsCampaigns;

    const seoStrategy = (llmResult.seoStrategy && llmResult.seoStrategy.primaryKeywords?.length > 0)
      ? llmResult.seoStrategy
      : bespokeTaxonomy.seoStrategy;

    const aeoStrategy = (llmResult.aeoStrategy && llmResult.aeoStrategy.qaAuthorityPairs?.length > 0)
      ? llmResult.aeoStrategy
      : bespokeTaxonomy.aeoStrategy;

    const leadDiscoveryCriteria = llmResult.leadDiscoveryCriteria || {
      buyerSearchKeywords: (targetAudience.decisionMakers || []).map((d) => `${d} in [Location]`),
      buyerPersonas: targetAudience.decisionMakers || ['Key Decision Maker'],
      targetCompanyTypes: [category],
    };

    return {
      businessName: name,
      websiteUrl: extractedData.url,
      category,
      growthEngine,
      categoryKey: bespokeTaxonomy.categoryKey,
      businessModel: llmResult.businessModel || bespokeTaxonomy.businessModel,
      businessModelType: bespokeTaxonomy.businessModelType || 'ONLINE',
      summary,
      whatTheySell,
      coreOfferings,
      identifiedServices,
      buyerTargeting,
      positioning,
      targetAudience,
      swotAnalysis,
      leadDiscoveryCriteria,
      companyCreationStrategy: bespokeTaxonomy.companyCreationStrategy,
      companyManagementStrategy: bespokeTaxonomy.companyManagementStrategy,
      offlineStrategy: bespokeTaxonomy.offlineStrategy,
      onlineStrategy: bespokeTaxonomy.onlineStrategy,
      businessWorkflow: bespokeTaxonomy.businessWorkflow,
      businessRequiredTeam: bespokeTaxonomy.businessRequiredTeam,
      businessTargets: bespokeTaxonomy.businessTargets,
      googleAdsCampaigns,
      metaAdsCampaigns,
      seoStrategy,
      aeoStrategy,
      socialPostingPerPlatform: bespokeTaxonomy.socialPostingPerPlatform,
      creativeAdStrategies: bespokeTaxonomy.creativeAdStrategies || [],
      recommendedChannels,
      adAngles,
      recommendedAITeam,
      businessPlanDocument,
      rawExtractedData: {
        featuresCount: coreOfferings.length,
        pricingSignals: extractedData.detectedPricing || [],
        pagesCrawled: extractedData.pagesCrawled || [],
        detectedTech: extractedData.detectedTech || [],
        scannedTabs: extractedData.scannedTabs || [],
        scannedImages: extractedData.scannedImages || [],
        scannedProducts: extractedData.scannedProducts || [],
        scannedLinks: extractedData.scannedLinks || [],
        isSpa: !!extractedData.isSpa,
        isLiveCrawl: extractedData.isLiveCrawl !== false,
      },
    };
  }

  /**
   * Deep Semantic Analytical NLP Engine: Analyzes actual crawled text, headings,
   * pricing, and features to build a genuine, 100% bespoke GTM Blueprint and Business Plan Document.
   */
  static generateDeepSemanticStrategy(data, workspaceContext = {}) {
    throw new Error('AI Service Unavailable: Hardcoded fallback strategy generation is permanently disabled. Go-To-Market strategies must be synthesized directly via Gemini AI or loaded from MongoDB.');
  }

  static classifyIndustryVertical(text, data) {
    throw new Error('AI Service Unavailable: Hardcoded industry vertical classification is permanently disabled. Market classifications must be fetched from MongoDB or synthesized via Gemini AI.');
  }

  static buildTailoredChannels(category = '') {
    const catLower = (category || '').toLowerCase();
    const isD2C = /d2c|ecommerce|retail|store|consumer/i.test(catLower);
    const isTech = /software|saas|developer|cloud|security|devops/i.test(catLower);
    const isWeb3 = /web3|crypto|fintech|blockchain/i.test(catLower);

    return [
      {
        channel: 'Cold Email Sequences (Sarah SDR)',
        priority: 1,
        fitScore: isD2C ? 74 : 98,
        rationale: 'Direct targeted inbox penetration with personalized decision-maker research and domain warmup protection.',
        enabled: !isD2C,
      },
      {
        channel: 'Sub-Second AI Voice Calling (Maya AE)',
        priority: 2,
        fitScore: isD2C ? 78 : 95,
        rationale: 'Instant phone qualification within 45 seconds of inbound demo request or high-intent signal detection.',
        enabled: true,
      },
      {
        channel: 'WhatsApp & Telegram Outbound Engine',
        priority: 3,
        fitScore: isWeb3 ? 99 : isD2C ? 96 : 89,
        rationale: '98% open rate conversational outreach with interactive calendar scheduling and rich media collateral.',
        enabled: true,
      },
      {
        channel: 'Autonomous Paid Ads (Meta / Google CAPI)',
        priority: 4,
        fitScore: isD2C ? 98 : isTech ? 82 : 86,
        rationale: '24/7 autonomous budget reallocation scaling winning ad sets and halting budget burn automatically.',
        enabled: true,
      },
      {
        channel: 'Social Reels & Short-Form Video Studio',
        priority: 5,
        fitScore: isD2C ? 97 : isTech ? 76 : 84,
        rationale: 'AI-generated viral hooks and founder-led video thought leadership deployed across LinkedIn, YouTube, and X.',
        enabled: isD2C || category.includes('Agency'),
      },
    ];
  }

  /**
   * Synthesize real, high-converting ad angles tailored to the company's product
   */
  static buildBespokeAdAngles(name, profile, data) {
    const primaryFeature = (data.detectedFeatures && data.detectedFeatures[0]) || `${name}'s core platform`;
    const pain0 = profile.painPoints[0] || 'manual operational bottlenecks';
    const pain1 = profile.painPoints[1] || 'high customer acquisition costs';

    return [
      {
        hook: `Why leading ${profile.decisionMakers[0]}s are replacing legacy workflows with ${name}.`,
        angle: 'Executive Category Disruption',
        targetPainPoint: pain0,
      },
      {
        hook: `Still losing deals to ${pain1}? Here is how ${name} solves it in minutes.`,
        angle: 'Direct Pain & Immediate Relief',
        targetPainPoint: pain1,
      },
      {
        hook: `How ${name}'s ${primaryFeature.toLowerCase()} cuts time-to-value by 68%.`,
        angle: 'Feature-Driven Quantified Metric',
        targetPainPoint: 'Slow implementation & delayed ROI',
      },
      {
        hook: `We stress-tested ${name} against traditional industry benchmarks. Here are the audited results.`,
        angle: 'Curiosity & Peer Proof Benchmark',
        targetPainPoint: 'Skepticism and fear of unvetted software',
      },
      {
        hook: `The complete 2026 blueprint to automating your ${profile.category} operations with ${name}.`,
        angle: 'Executive Actionable Blueprint',
        targetPainPoint: 'Lack of unified operational architecture',
      },
    ];
  }

  /**
   * Recommend authentic AI Workforce Team structure dynamically allocated to the company
   */
  static buildAITeamArchitecture(category, name, crawledData = {}) {
    const dynamicAllocation = EmployeeRoleBrain.allocateDynamicTeam(category, null, crawledData, name);
    return {
      roles: dynamicAllocation.roles,
      teamMembers: dynamicAllocation.teamMembers.map((m) => ({
        role: m.title,
        purpose: m.purpose,
        monthlyEquivalentValue: m.monthlyEquivalentValue,
      })),
      estimatedMonthlyROI: dynamicAllocation.projectedMonthlyRoi,
      recommendedPlan: dynamicAllocation.vyuhoxAutonomousPlan,
      coreBottleneckSolved: dynamicAllocation.coreBottleneckSolved,
      monthlyHumanEquivalentCost: dynamicAllocation.monthlyHumanEquivalentCost,
    };
  }

  /**
   * Construct 30-Day Step-by-Step Launch Blueprint with VYUHOX
   */
  static buildStepByStepRoadmap(name, profile, targetAudience) {
    return [
      {
        phase: 'Phase 1: Foundation & Account Setup',
        days: 'Days 1 – 3',
        status: 'READY',
        objectives: [
          `Connect ${name}'s primary domain and configure SPF, DKIM, DMARC for 99%+ inbox deliverability.`,
          'Integrate calendar booking link (Google / Outlook) for automated meeting scheduling.',
          'Provision dedicated local phone number in VYUHOX Voice Studio for Maya Voice AI.',
        ],
        tools: ['VYUHOX Domain Warmup', 'Calendar Integrations', 'Voice Studio'],
      },
      {
        phase: 'Phase 2: ICP Discovery & Waterfall Prospecting',
        days: 'Days 4 – 8',
        status: 'PENDING',
        objectives: [
          `Target verified decision makers matching ICP: ${targetAudience.primaryPersona}.`,
          'Run VYUHOX Waterfall Lead Scraper across Google directories and company employee registries.',
          'Perform real-time MX mailbox verification and phone number HLR validation to eliminate bounces.',
        ],
        tools: ['VYUHOX Lead Finder', 'Waterfall Scraper', 'MX Verifier'],
      },
      {
        phase: 'Phase 3: Omnichannel Outbound Launch',
        days: 'Days 9 – 18',
        status: 'PENDING',
        objectives: [
          'Deploy Sarah SDR with 4-step hyper-personalized cold email and WhatsApp introduction sequences.',
          'Inject synthesized ad hooks and pain point angles tailored to decision maker objections.',
          'Enable AI sentiment classifier to immediately triage replies into Interested, Objection, or Referral.',
        ],
        tools: ['AI SDR Sarah', 'Omnichannel Inbox', 'WhatsApp Engine'],
      },
      {
        phase: 'Phase 4: Sub-Second AI Voice Speed-to-Lead Activation',
        days: 'Days 19 – 25',
        status: 'PENDING',
        objectives: [
          'Program Maya Voice AE with custom objection handlers and qualification criteria.',
          'Trigger outbound voice calls within 45 seconds of inbound demo form fills or positive email replies.',
          'Automatically qualify budget, authority, and book confirmed demo slots directly onto executive calendars.',
        ],
        tools: ['Maya Voice Closer', 'Speech Synthesis Engine', 'Live Call Takeover'],
      },
      {
        phase: 'Phase 5: Autonomous Ad Scale & Pipeline Flywheel',
        days: 'Days 26 – 30',
        status: 'PENDING',
        objectives: [
          'Launch targeted Meta & Google ad campaigns utilizing synthesized high-converting copy angles.',
          'Activate 24/7 Autonomous Ad Optimizer to rebalance budget toward highest ROAS cohorts.',
          'Review Julian AI CFO dashboard for pipeline CAC, LTV multiples, and net revenue booked.',
        ],
        tools: ['Ad Manager CAPI', 'AI CFO RevOps', 'Flywheel Intelligence'],
      },
    ];
  }

  /**
   * Build Complete Executive Business Plan Document (McKinsey / BCG Grade Dossier)
   */
  static buildFullBusinessPlanDocument(data) {
    return {
      documentTitle: `VYUHOX Autonomous Go-To-Market & Business Plan: ${data.name}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      version: '2.4 Production',
      executiveSummary: {
        companyName: data.name,
        targetUrl: data.url,
        industryVertical: data.category,
        coreMission: data.summary,
        keyFindings: `Through deep multi-page DOM parsing of ${data.domain} across ${data.pagesCrawledCount} pages, VYUHOX extracted ${data.features.length} unique feature capabilities. The business possesses significant market differentiation in ${data.category}, ready for autonomous outbound scaling.`,
      },
      companyOverview: {
        businessName: data.name,
        domain: data.domain,
        detectedTechnologyStack: data.techStack.length > 0 ? data.techStack.join(', ') : 'Modern Web Architecture (SSL, CDN, Responsive HTML5)',
        coreCapabilities: data.features.slice(0, 8),
        pricingStructure: data.targetAudience.pricingSummary,
      },
      marketAndCompetitorAnalysis: {
        categoryLandscape: `The ${data.category} vertical is experiencing rapid modernization. Traditional manual sales motions are suffering from diminishing reply rates and escalating customer acquisition costs (CAC).`,
        competitiveAdvantage: data.positioning.unfairAdvantage,
        keyDifferentiators: data.positioning.keyDifferentiators,
      },
      idealCustomerProfile: {
        primaryPersona: data.targetAudience.primaryPersona,
        decisionMakers: data.targetAudience.decisionMakers,
        criticalPainPoints: data.targetAudience.painPoints,
        buyingTriggers: data.targetAudience.buyingTriggers,
        estimatedBudgetTier: data.targetAudience.estimatedBudgetTier,
        estimatedDealSize: data.targetAudience.estimatedACV,
      },
      acquisitionStrategy: {
        overview: 'Multi-touch autonomous acquisition combining cold outreach, immediate conversational response, and continuous paid ad optimization.',
        channels: data.recommendedChannels,
        messagingAngles: data.adAngles,
      },
      aiTeamStructure: {
        deploymentModel: data.recommendedAITeam.recommendedPlan,
        projectedROI: data.recommendedAITeam.estimatedMonthlyROI,
        teamRoster: data.recommendedAITeam.teamMembers,
      },
      stepByStepLaunchRoadmap: data.stepByStepRoadmap,
      financialAndPipelineProjections: {
        projectedMonthlyQualifiedLeads: '65 – 140 Qualified Accounts',
        projectedDemoShowRate: '82% (Driven by sub-45s Voice AI Speed-to-Lead)',
        targetCustomerAcquisitionCost: 'Reduced by 45% compared to manual SDR headcount',
        estimatedGrossROI: data.recommendedAITeam.estimatedMonthlyROI,
      },
      clientEditableNotes: '',
    };
  }

  /**
   * OpenAI API Call implementation with strict JSON schema parsing.
   */
  static async callOpenAI(extractedData, workspaceContext, apiKey) {
    const systemPrompt = `You are VYUHOX AI GTM Strategist, the world's most sophisticated autonomous B2B and D2C Go-To-Market architect.
Analyze the target business metadata extracted from multi-page crawling and return ONLY a valid JSON object matching the requested schema.`;

    const userPrompt = `Analyze this target business metadata crawled end-to-end:
Business Name: ${extractedData.businessName}
URL: ${extractedData.url}
Domain: ${extractedData.domainName}
Title: ${extractedData.title}
Meta Description: ${extractedData.metaDescription}
Headings: ${(extractedData.h1List || []).join(' | ')}
Subheadings: ${(extractedData.h2List || []).slice(0, 10).join(' | ')}
Detected Features: ${(extractedData.detectedFeatures || []).slice(0, 12).join('; ')}
Pricing Signals: ${(extractedData.detectedPricing || []).join(', ')}
Technologies: ${(extractedData.detectedTech || []).join(', ')}

Generate a bespoke, deeply customized GTM strategy and comprehensive Business Plan document tailored specifically to this business. Return strictly JSON.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    const json = await res.json();
    const content = json.choices[0].message.content;
    const parsed = JSON.parse(content);
    // Ensure all critical structures exist
    if (!parsed.businessPlanDocument) {
      throw new Error('AI Service Unavailable: OpenAI response was incomplete. Please check your API key or model.');
    }
    return parsed;
  }

  /**
   * Google Gemini API Call implementation
   */
  static async callGemini(extractedData, workspaceContext, apiKey) {
    const prompt = `You are VYUHOX AI GTM Strategist. Analyze this crawled company and return a valid JSON object with GTM Strategy, ICP, AI Team, and 30-Day Launch Roadmap.
Company: ${extractedData.businessName} (${extractedData.url})
Title: ${extractedData.title}
Description: ${extractedData.metaDescription}
Headings: ${(extractedData.h1List || []).join(' | ')}
Features: ${(extractedData.detectedFeatures || []).slice(0, 10).join('; ')}
Pricing: ${(extractedData.detectedPricing || []).join(', ')}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    const json = await res.json();
    const text = json.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);
    if (!parsed.businessPlanDocument) {
      throw new Error('AI Service Unavailable: Gemini response was incomplete. Please check your API key or model.');
    }
    return parsed;
  }
}
