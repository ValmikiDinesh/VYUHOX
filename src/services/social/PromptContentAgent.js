/**
 * PromptContentAgent.js
 * Intelligent Content & Viral Script Engine
 * Transforms raw business owner prompts + business context into unique, high-converting social posts & reels.
 */

import { LlmGatewayService } from '../ai/LlmGatewayService.js';
import { CommercialVisualCatalog } from '../visual/CommercialVisualCatalog.js';

export class PromptContentAgent {
  /**
   * Generates custom, unique social post / video script based on owner's prompt and business intelligence.
   */
  static async generateFromPrompt({
    prompt,
    workspace,
    strategy,
    cumulativeContext = null,
    postType = 'REEL',
    voiceId = 'maya',
    language = 'en-US',
    tone = 'aggressive_challenger',
    platform = 'INSTAGRAM',
  }) {
    const companyName = cumulativeContext?.businessName || workspace?.name || strategy?.businessName || 'Our Business';
    const industry = workspace?.industry || strategy?.category || 'Commercial Services';
    const domain = workspace?.domain || 'vyuhox.com';

    // Extract real business context if available from cumulative AI flywheel
    const valueProp =
      cumulativeContext?.strategy?.positioning?.coreValueProp ||
      strategy?.analysisResult?.positioning?.coreValueProp ||
      strategy?.analysisResult?.positioning?.unfairAdvantage ||
      strategy?.analysisResult?.valueProposition ||
      'Premium custom solutions engineered for remarkable client satisfaction';

    const rawAudience =
      cumulativeContext?.strategy?.targetAudience || strategy?.analysisResult?.targetAudience;
    const targetAudience =
      typeof rawAudience === 'object' && rawAudience !== null
        ? rawAudience.primaryPersona || (rawAudience.decisionMakers && rawAudience.decisionMakers.join(', ')) || 'Discerning customers and clients'
        : typeof rawAudience === 'string'
        ? rawAudience
        : 'Discerning customers and clients';

    const cleanPrompt = (prompt || '').trim();

    // 1. Synthesize Unique Scripts & Structure using LLM Gateway
    let contentMatrix = null;
    try {
      const llmPrompt = `You are an award-winning Creative Director and Viral Social Content Strategist.
Create an authentic, high-converting social media creative for the following real business:

BUSINESS CONTEXT:
- Business Name: ${companyName}
- Industry / Category: ${industry}
- Core Value Proposition: ${valueProp}
- Target Audience: ${targetAudience}

USER DIRECTIVE / TOPIC:
"${cleanPrompt || `Highlight the unmatched quality, artistry, and client experience of ${companyName}`}"

PARAMETERS:
- Format: ${postType} (REEL, CAROUSEL, IMAGE, POST)
- Platform: ${platform}
- Tone: ${tone}
- Language: ${language}

STRICT INSTRUCTIONS:
1. Tailor all copy strictly to ${companyName}'s vertical (${industry}). NEVER mention crypto, hedge funds, or trading unless the business is in financial trading.
2. For wedding stationery / invitation businesses, focus on love stories, luxury aesthetics, emotional impact, and bespoke design.
3. For product businesses, focus on craftsmanship, utility, and irresistible benefits.
4. "title": Punchy, memorable title (max 50 chars).
5. "scriptHook": Captivating, thumb-stopping 1-sentence opening hook.
6. "scriptBody": 2-3 engaging sentences highlighting what makes ${companyName} extraordinary.
7. "scriptCta": Clear, urgent call-to-action (e.g. "Comment 'PREVIEW' or tap link in bio").
8. "hashtags": Array of 5-8 relevant hashtags matching this exact industry.
9. "carouselSlides": Array of 5 progressive slides for carousel post (each with slideNumber, headline, subtext, statCallout).
10. "visualImagePrompt": A detailed 8K commercial product/scene photography prompt tailored specifically to this business's products and aesthetics. NEVER include slogans, headlines, or text in the visual prompt. Describe physical product/scene materials, textures, lighting, and setting only.

Respond STRICTLY with valid JSON.`;

      const llmRes = await LlmGatewayService.execute({
        prompt: llmPrompt,
        systemInstruction: 'You are an elite creative director. Always return clean valid JSON.',
        jsonResponse: true,
        temperature: 0.35,
      });

      const parsed = llmRes.parsedJson || (typeof llmRes.text === 'string' ? JSON.parse(llmRes.text) : null);
      if (parsed && parsed.scriptHook && parsed.scriptBody) {
        const cleanVisualPrompt = (parsed.visualImagePrompt && parsed.visualImagePrompt.length > 25 && !/headline|click|buy now|guarantee/i.test(parsed.visualImagePrompt))
          ? parsed.visualImagePrompt
          : CommercialVisualCatalog.synthesizeProductVisualPrompt({
              companyName,
              industry,
              productFocus: cleanPrompt || companyName,
              variationIndex: 0,
              platform,
            });

        contentMatrix = {
          title: parsed.title || `${companyName} • Spotlight`,
          hook: parsed.scriptHook,
          body: parsed.scriptBody,
          cta: parsed.scriptCta || 'Tap the link in bio to learn more.',
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [`#${companyName.replace(/\s+/g, '')}`, `#${industry.replace(/\s+/g, '')}`],
          slides: Array.isArray(parsed.carouselSlides) && parsed.carouselSlides.length >= 3 ? parsed.carouselSlides : null,
          visualImagePrompt: cleanVisualPrompt,
        };
      }
    } catch (llmErr) {
      console.warn('[PromptContentAgent] LLM generation notice:', llmErr.message, 'Using industry-adaptive matrix.');
    }

    // Fallback if LLM unavailable
    if (!contentMatrix) {
      contentMatrix = this._buildAdaptiveContentMatrix({
        prompt: cleanPrompt,
        companyName,
        industry,
        valueProp,
        targetAudience,
        tone,
        postType,
        language,
      });
    }

    const { hook, body, cta, title, hashtags, slides, visualImagePrompt } = contentMatrix;

    // 2. Generate Timed Captions for Kinetic Subtitles (for Reels)
    const fullScript = `${hook} ${body} ${cta}`.trim();
    const words = fullScript.split(/\s+/).filter(Boolean);
    const wordDuration = tone === 'aggressive_challenger' || tone === 'urgent_fomo' ? 0.32 : 0.38;
    let currentTime = 0.3;

    const timedWords = words.map((w) => {
      const start = parseFloat(currentTime.toFixed(2));
      const end = parseFloat((currentTime + wordDuration).toFixed(2));
      currentTime += wordDuration;
      return { word: w, start, end };
    });

    const timedCaptions = [];
    const chunkSize = 4;
    for (let i = 0; i < timedWords.length; i += chunkSize) {
      const chunk = timedWords.slice(i, i + chunkSize);
      timedCaptions.push({
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
        text: chunk.map((c) => c.word).join(' '),
        words: chunk,
      });
    }

    // 3. Dynamic Visual Styling & Themes matching industry
    const isWeddingOrLuxury = /wedding|invite|stationery|event|jewelry|luxury|fashion/i.test(`${industry} ${companyName}`);
    const visualStyles = isWeddingOrLuxury
      ? [
          { id: 'luxury-gold', bg: 'linear-gradient(145deg, #1C120C 0%, #2D1D13 100%)', accent: '#F59E0B' },
          { id: 'rose-elegance', bg: 'linear-gradient(145deg, #1A0D15 0%, #2E1524 100%)', accent: '#EC4899' },
          { id: 'champagne-ivory', bg: 'linear-gradient(145deg, #181512 0%, #2A241F 100%)', accent: '#D97706' },
        ]
      : [
          { id: 'cyber-dark', bg: 'linear-gradient(145deg, #070C18 0%, #0F172A 100%)', accent: '#06B6D4' },
          { id: 'minimal-neon', bg: 'linear-gradient(145deg, #041014 0%, #064E3B 100%)', accent: '#10B981' },
          { id: 'terminal-amber', bg: 'linear-gradient(145deg, #0C0A09 0%, #1C1917 100%)', accent: '#F59E0B' },
          { id: 'fintech-indigo', bg: 'linear-gradient(145deg, #090A1A 0%, #1E1B4B 100%)', accent: '#818CF8' },
        ];
    const selectedStyle = visualStyles[Math.floor(Math.random() * visualStyles.length)];

    return {
      title,
      prompt: cleanPrompt,
      postType,
      platform,
      voiceId,
      language,
      tone,
      scriptHook: hook,
      scriptBody: body,
      scriptCta: cta,
      fullScript,
      timedCaptions,
      caption: `${hook}\n\n${body}\n\n👉 ${cta}\n\n${hashtags.join(' ')}`,
      hashtags,
      carouselSlides: slides,
      visualStyle: selectedStyle,
      visualImagePrompt: visualImagePrompt || `${companyName} ${title} luxury commercial photography`,
      businessContextUsed: {
        companyName,
        industry,
        valueProp,
        targetAudience,
      },
    };
  }

  /**
   * Industry-Adaptive Fallback Content Matrix (Zero hardcoded crypto or finance terms)
   */
  static _buildAdaptiveContentMatrix({ prompt, companyName, industry, valueProp, targetAudience, tone, postType, language }) {
    const isWeddingOrLuxury = /wedding|invite|stationery|event|jewelry|luxury|fashion/i.test(`${industry} ${companyName} ${prompt}`);

    let hook = '';
    let body = '';
    let cta = '';
    let title = prompt ? `${prompt.slice(0, 45)}...` : `${companyName} • Showcase`;
    let hashtags = [];

    if (isWeddingOrLuxury) {
      title = prompt || `${companyName} • Bespoke Creations`;
      hook = prompt
        ? `Your special celebration deserves more than ordinary: discover ${prompt} with ${companyName}.`
        : `Never settle for generic designs when your milestone deserves unforgettable artistry.`;
      body = `At ${companyName}, every detail is thoughtfully handcrafted to reflect your unique story. With ${valueProp}, we bring your vision to life with timeless sophistication tailored for ${targetAudience}.`;
      cta = `Tap the link in our bio to preview our exclusive collection or message us for a bespoke consultation.`;
      hashtags = ['#WeddingStationery', '#LuxuryInvitations', '#EventDesign', '#BespokeArtistry', `#${companyName.replace(/\s+/g, '')}`];
    } else {
      hook = prompt
        ? `Stop settling for outdated alternatives. Here is why ${prompt} by ${companyName} is setting a new benchmark.`
        : `If you are looking to elevate your experience in ${industry}, this is for you.`;
      body = `While conventional options fall short, ${companyName} delivers ${valueProp}. Designed specifically for ${targetAudience}, we deliver proven excellence without compromise.`;
      cta = `Tap the link in bio or message us today to get started.`;
      hashtags = [`#${industry.replace(/[^a-zA-Z0-9]/g, '')}`, '#QualityFirst', '#CustomerSuccess', `#${companyName.replace(/\s+/g, '')}`];
    }

    const slides = [
      {
        slideNumber: 1,
        headline: hook,
        subtext: `How ${companyName} redefines excellence for ${targetAudience}.`,
        statCallout: '100% Bespoke',
        visualTheme: isWeddingOrLuxury ? 'luxury-gold' : 'cyber-dark',
      },
      {
        slideNumber: 2,
        headline: 'Crafted Without Compromise',
        subtext: `Every creation is engineered to deliver ${valueProp}.`,
        statCallout: 'Top Rated',
        visualTheme: isWeddingOrLuxury ? 'luxury-gold' : 'cyber-dark',
      },
      {
        slideNumber: 3,
        headline: 'Tailored Exclusively For You',
        subtext: `Personalized touchpoints and dedicated attention to detail.`,
        statCallout: 'Premium Grade',
        visualTheme: isWeddingOrLuxury ? 'luxury-gold' : 'cyber-dark',
      },
      {
        slideNumber: 4,
        headline: 'Loved By Our Clients',
        subtext: `Unmatched satisfaction and memorable outcomes.`,
        statCallout: '5-Star Quality',
        visualTheme: isWeddingOrLuxury ? 'luxury-gold' : 'cyber-dark',
      },
      {
        slideNumber: 5,
        headline: cta,
        subtext: `Visit ${companyName} or message us today to begin.`,
        statCallout: 'Start Today',
        visualTheme: isWeddingOrLuxury ? 'luxury-gold' : 'cyber-dark',
      },
    ];

    const adaptiveVisualPrompt = CommercialVisualCatalog.synthesizeProductVisualPrompt({
      companyName,
      industry,
      productFocus: prompt || companyName,
      variationIndex: 0,
      platform,
    });

    return { hook, body, cta, title, hashtags, slides, visualImagePrompt: adaptiveVisualPrompt };
  }
}

export default PromptContentAgent;
