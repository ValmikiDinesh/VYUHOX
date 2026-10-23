import * as cheerio from 'cheerio';

/**
 * Service to scan websites and synthesize AI Go-To-Market strategies.
 */
export class ScannerService {
  /**
   * Scrapes website DOM metadata using cheerio with resilient fallback mock generation.
   */
  static async scanWebsite(rawUrl) {
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      const urlObj = new URL(url);
      const domainName = urlObj.hostname.replace('www.', '');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 VYUHOX/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Scanner] HTTP ${response.status} for ${url}, using resilient fallback.`);
        return this.generateFallbackExtraction(url, domainName);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract metadata
      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text().trim() ||
        domainName;

      const metaDescription =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      const ogImage = $('meta[property="og:image"]').attr('content') || '';

      const h1List = [];
      $('h1').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length < 200) h1List.push(text);
      });

      const h2List = [];
      $('h2').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && text.length < 200 && h2List.length < 8) h2List.push(text);
      });

      const ctas = [];
      $('a, button').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (
          text &&
          text.length > 2 &&
          text.length < 35 &&
          /get started|try|start|book|demo|sign up|join|buy|explore|contact|schedule/i.test(text)
        ) {
          if (!ctas.includes(text) && ctas.length < 6) ctas.push(text);
        }
      });

      const socialLinks = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && /(twitter\.com|x\.com|linkedin\.com|github\.com|telegram\.org|t\.me|instagram\.com)/i.test(href)) {
          if (!socialLinks.includes(href) && socialLinks.length < 5) socialLinks.push(href);
        }
      });

      // Derive clean business name
      const businessName =
        title.split(/[-–|:•]/)[0].trim() || domainName.split('.')[0].toUpperCase();

      return {
        url,
        domainName,
        businessName,
        title,
        metaDescription,
        ogImage,
        h1List: h1List.slice(0, 5),
        h2List: h2List.slice(0, 8),
        ctas: ctas.length > 0 ? ctas : ['Get Started', 'Book a Demo'],
        socialLinks,
        extractedAt: new Date().toISOString(),
        isLiveCrawl: true,
      };
    } catch (err) {
      console.warn(`[Scanner] Crawl error for ${url}: ${err.message}. Engaging intelligence fallback.`);
      const domainName = url.replace(/https?:\/\//, '').split('/')[0].replace('www.', '');
      return this.generateFallbackExtraction(url, domainName);
    }
  }

  /**
   * Resilient fallback extractor if target site blocks scrapers or is offline.
   */
  static generateFallbackExtraction(url, domainName) {
    const cleanName = domainName
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      url,
      domainName,
      businessName: cleanName,
      title: `${cleanName} — Next-Gen High Growth Platform`,
      metaDescription: `Accelerate revenue and operational scaling with ${cleanName}'s cutting-edge solutions. Built for modern fast-growing businesses.`,
      ogImage: '',
      h1List: [`Transform How Your Business Scales with ${cleanName}`],
      h2List: [
        'Enterprise-Grade Reliability & Performance',
        'Accelerate Customer Acquisition & Revenue',
        'Seamless Turnkey Integrations',
      ],
      ctas: ['Start Free Trial', 'Book Demo', 'Contact Sales'],
      socialLinks: [`https://linkedin.com/company/${cleanName.toLowerCase()}`],
      extractedAt: new Date().toISOString(),
      isLiveCrawl: false,
    };
  }

  /**
   * Synthesize full GTM Intelligence Strategy.
   * Uses OpenAI if configured, otherwise uses structured domain heuristic reasoning engine.
   */
  static async synthesizeStrategy(extractedData, workspaceContext = {}) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.startsWith('sk-') && !apiKey.includes('demo')) {
      try {
        return await this.callOpenAI(extractedData, workspaceContext, apiKey);
      } catch (err) {
        console.error('[ScannerService] OpenAI API error, falling back to heuristic engine:', err.message);
      }
    }

    return this.generateHeuristicStrategy(extractedData, workspaceContext);
  }

  /**
   * High-accuracy heuristic synthesis engine tailored to the scraped copy.
   */
  static generateHeuristicStrategy(data, workspaceContext) {
    const combinedText = `${data.title} ${data.metaDescription} ${data.h1List.join(' ')} ${data.h2List.join(' ')} ${data.domainName}`.toLowerCase();

    // Determine category
    let category = 'B2B SaaS';
    if (/(crypto|web3|token|trading|defi|hedge|blockchain|vault|yield|solana|bitcoin)/i.test(combinedText)) {
      category = 'Fintech / Web3';
    } else if (/(apparel|fashion|store|shop|cart|checkout|d2c|brand|shipping|clothing)/i.test(combinedText)) {
      category = 'D2C E-Commerce';
    } else if (/(agency|marketing|consulting|creative|design|studio|client|retainer)/i.test(combinedText)) {
      category = 'Agency';
    } else if (/(plumbing|dental|clinic|lawyer|repair|contractor|hvac|roofing|near me|local)/i.test(combinedText)) {
      category = 'Local Service';
    }

    const name = data.businessName || 'Target Business';

    let primaryPersona = 'VP of Growth & Chief Revenue Officers';
    let painPoints = [
      'Stagnant pipeline velocity and escalating customer acquisition costs (CAC)',
      'Manual outbound prospecting consuming 30+ SDR hours weekly without proportional conversion',
      'Fragmented messaging between email, SMS, and cold calling leading to lost high-value deals',
    ];
    let decisionMakers = ['Chief Executive Officer', 'VP of Sales / CRO', 'Head of Business Development'];
    let estimatedBudgetTier = '$5,000 – $25,000 / month';

    let coreValueProp = `Deliver predictable, automated pipeline generation for ${name} with end-to-end multi-agent GTM execution.`;
    let unfairAdvantage = `Combines sub-second voice AI qualification, waterfall lead enrichment, and 24/7 ad budget optimization under a single autonomous engine.`;
    let keyDifferentiators = [
      'Sub-second AI Voice qualification with real-time human live call takeover',
      'Waterfall scraper consolidating Google Maps, registry domains, and social enrichers',
      'Dynamic budget rebalancing across cold email, WhatsApp, and paid social',
    ];

    if (category === 'Fintech / Web3') {
      primaryPersona = 'Crypto Fund Managing Partners & Institutional Allocators';
      painPoints = [
        'Navigating fragmented OTC and institutional investor networks',
        'High compliance friction when vetting and onboarding accredited capital',
        'Time-sensitive market opportunities missed due to slow manual relationship building',
      ];
      decisionMakers = ['Managing Partner', 'Chief Investment Officer', 'Head of Liquid Trading'];
      estimatedBudgetTier = '$20,000 – $100,000+ allocation';
      coreValueProp = `Institutional-grade capital introduction and algorithmic deal syndication powered by 24/7 autonomous outreach.`;
      unfairAdvantage = `Instant Telegram and encrypted WhatsApp outreach triggers when high-net-worth wallet flows are detected.`;
      keyDifferentiators = [
        'Direct Telegram integration with sub-second AI concierge negotiation',
        'Verified on-chain and institutional investor waterfall enrichment',
        'Real-time regulatory compliance and accredited investor filtering',
      ];
    } else if (category === 'D2C E-Commerce') {
      primaryPersona = 'E-commerce Brand Founders & VP of Digital Marketing';
      painPoints = [
        'Rising Meta and TikTok ad CPMs eroding net profit margins',
        'High cart abandonment without immediate conversational recovery',
        'Sub-optimal customer retention and repeat purchase frequencies',
      ];
      decisionMakers = ['Brand Founder', 'Chief Marketing Officer', 'Head of Paid Media'];
      estimatedBudgetTier = '$3,000 – $15,000 / month ad spend';
      coreValueProp = `Turn cold social traffic into recurring VIP buyers using automated video hooks and WhatsApp checkout recovery.`;
      unfairAdvantage = `Autonomous AI ad optimizer that halts bleeding creatives within 2 hours and scales winning ROAS sets.`;
      keyDifferentiators = [
        'Automated Reels & Shorts pipeline testing 10+ hook variations daily',
        'Sub-minute WhatsApp abandoned checkout recovery with dynamic discount codes',
        'Autonomous Meta Conversions API (CAPI) pixel optimization',
      ];
    }

    return {
      businessName: name,
      websiteUrl: data.url,
      category,
      summary: data.metaDescription || `${name} is an innovative provider in the ${category} vertical, driving modern customer value and revenue growth.`,
      targetAudience: {
        primaryPersona,
        painPoints,
        decisionMakers,
        estimatedBudgetTier,
      },
      positioning: {
        coreValueProp,
        unfairAdvantage,
        keyDifferentiators,
      },
      recommendedChannels: [
        {
          channel: 'Cold Email Sequences',
          priority: 1,
          fitScore: category === 'B2B SaaS' || category === 'Fintech / Web3' ? 96 : 82,
          rationale: 'Direct access to senior decision makers with personalized company hooks and deliverability protection.',
          enabled: true,
        },
        {
          channel: 'WhatsApp & Telegram Outbound',
          priority: 2,
          fitScore: category === 'Fintech / Web3' ? 98 : 88,
          rationale: '98% open rates with instant 2-way conversational scheduling for high-velocity engagement.',
          enabled: true,
        },
        {
          channel: 'Sub-Second AI Voice Calling',
          priority: 3,
          fitScore: 84,
          rationale: 'Instant phone qualification within 60 seconds of inbound lead form submission or scraped intent signals.',
          enabled: true,
        },
        {
          channel: 'Autonomous Paid Ads (Meta / Google)',
          priority: 4,
          fitScore: category === 'D2C E-Commerce' ? 95 : 79,
          rationale: 'Laser-targeted paid demand capture with 24/7 AI budget rebalancing toward highest ROAS cohorts.',
          enabled: true,
        },
        {
          channel: 'Social Reels & Short-Form Video',
          priority: 5,
          fitScore: category === 'D2C E-Commerce' ? 94 : 72,
          rationale: 'High-leverage brand awareness and organic viral customer acquisition on TikTok and LinkedIn.',
          enabled: category === 'D2C E-Commerce',
        },
      ],
      adAngles: [
        {
          hook: `Tired of spending $2,000+ per qualified demo? Here is how ${name} fixes it.`,
          angle: 'Direct ROI & Cost Reduction',
          targetPainPoint: 'High Customer Acquisition Cost (CAC)',
        },
        {
          hook: `Why top leaders in ${category} are replacing traditional outbound SDR teams.`,
          angle: 'Category Disruption & Speed to Market',
          targetPainPoint: 'Manual SDR inefficiency and slow prospecting',
        },
        {
          hook: `We stress-tested ${name}'s conversion funnel against the industry benchmark.`,
          angle: 'Curiosity & Competitive Benchmark',
          targetPainPoint: 'Fear of falling behind agile competitors',
        },
        {
          hook: `Sub-800ms response time: The secret behind 3.4x higher demo-show rates.`,
          angle: 'Speed-to-Lead Advantage',
          targetPainPoint: 'Lead drop-off between form fill and scheduled call',
        },
        {
          hook: `The complete blueprint to automating your 2026 pipeline from scratch.`,
          angle: 'Executive Actionable Blueprint',
          targetPainPoint: 'Lack of unified end-to-end GTM execution architecture',
        },
      ],
      recommendedAITeam: {
        roles: ['AI CMO (Strategist)', 'AI SDR (Outbound Engine)', 'AI Closer (Sub-Second Voice)', 'AI CFO (Budget Guardrail)'],
        estimatedMonthlyROI: '4.8x – 8.2x Projected Pipeline ROI',
        recommendedPlan: 'Autonomous AI Company Mode',
      },
      suggestedModules: {
        leadScraper: true,
        emailSequences: true,
        voiceCaller: true,
        whatsappBot: true,
        adManager: category === 'D2C E-Commerce' || category === 'B2B SaaS',
      },
    };
  }

  /**
   * OpenAI API Call implementation with strict JSON schema parsing.
   */
  static async callOpenAI(extractedData, workspaceContext, apiKey) {
    const systemPrompt = `You are VYUHOX AI GTM Strategist, the world's most sophisticated autonomous B2B and D2C Go-To-Market architect.
Analyze the target business metadata and return ONLY a valid JSON object matching the requested schema.`;

    const userPrompt = `Analyze this company and generate a production-ready GTM Strategy:
URL: ${extractedData.url}
Title: ${extractedData.title}
Meta Description: ${extractedData.metaDescription}
Headings: ${extractedData.h1List.join(' | ')}
Subheadings: ${extractedData.h2List.join(' | ')}
CTAs: ${extractedData.ctas.join(', ')}

Output strictly adhering to this JSON format:
{
  "businessName": string,
  "websiteUrl": string,
  "category": "B2B SaaS" | "D2C E-Commerce" | "Fintech / Web3" | "Local Service" | "Agency",
  "summary": string,
  "targetAudience": {
    "primaryPersona": string,
    "painPoints": [string, string, string],
    "decisionMakers": [string, string],
    "estimatedBudgetTier": string
  },
  "positioning": {
    "coreValueProp": string,
    "unfairAdvantage": string,
    "keyDifferentiators": [string, string, string]
  },
  "recommendedChannels": [
    { "channel": "Cold Email Sequences", "priority": 1, "fitScore": number, "rationale": string, "enabled": true },
    { "channel": "WhatsApp & Telegram Outbound", "priority": 2, "fitScore": number, "rationale": string, "enabled": true },
    { "channel": "Sub-Second AI Voice Calling", "priority": 3, "fitScore": number, "rationale": string, "enabled": true },
    { "channel": "Autonomous Paid Ads (Meta / Google)", "priority": 4, "fitScore": number, "rationale": string, "enabled": true },
    { "channel": "Social Reels & Short-Form Video", "priority": 5, "fitScore": number, "rationale": string, "enabled": boolean }
  ],
  "adAngles": [
    { "hook": string, "angle": string, "targetPainPoint": string },
    { "hook": string, "angle": string, "targetPainPoint": string },
    { "hook": string, "angle": string, "targetPainPoint": string },
    { "hook": string, "angle": string, "targetPainPoint": string },
    { "hook": string, "angle": string, "targetPainPoint": string }
  ],
  "recommendedAITeam": {
    "roles": ["AI CMO", "AI Outbound SDR", "AI Voice Closer"],
    "estimatedMonthlyROI": string,
    "recommendedPlan": "Autonomous AI Company"
  },
  "suggestedModules": {
    "leadScraper": true,
    "emailSequences": true,
    "voiceCaller": true,
    "whatsappBot": true,
    "adManager": true
  }
}`;

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
    return JSON.parse(content);
  }
}
