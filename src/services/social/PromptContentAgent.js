/**
 * PromptContentAgent.js
 * Intelligent Content & Viral Script Engine
 * Transforms raw business owner prompts + business context into unique, high-converting social posts & reels.
 */

export class PromptContentAgent {
  /**
   * Generates custom, unique social post / video script based on owner's prompt and business intelligence.
   */
  static async generateFromPrompt({
    prompt,
    workspace,
    strategy,
    postType = 'REEL',
    voiceId = 'maya',
    language = 'en-US',
    tone = 'aggressive_challenger',
    platform = 'INSTAGRAM',
  }) {
    const companyName = workspace?.name || 'HedgeX Algorithmic Capital';
    const industry = workspace?.industry || strategy?.category || 'Crypto';
    const domain = workspace?.domain || 'growth.hedgex.io';
    
    // Extract real business context if available
    const valueProp = strategy?.analysisResult?.valueProposition || 
      (industry.toLowerCase().includes('crypto') 
        ? 'Sub-millisecond cross-exchange execution and zero slippage on high-frequency trades'
        : 'Autonomous AI sales dialer qualifying enterprise inbound leads in 42 seconds');

    const targetAudience = strategy?.analysisResult?.targetAudience || 
      (industry.toLowerCase().includes('crypto')
        ? 'Institutional allocators, quantitative fund managers, and family offices'
        : 'B2B Founders, revenue leaders, and enterprise sales teams');

    const cleanPrompt = (prompt || '').trim();

    // 1. Synthesize Unique Scripts & Structure based on Tone & Prompt
    const { hook, body, cta, title, hashtags, slides } = this._buildContentMatrix({
      prompt: cleanPrompt,
      companyName,
      industry,
      valueProp,
      targetAudience,
      tone,
      postType,
      language,
    });

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

    // 3. Dynamic Visual Styling & Themes
    const visualStyles = [
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
      businessContextUsed: {
        companyName,
        industry,
        valueProp,
        targetAudience,
      },
    };
  }

  static _buildContentMatrix({ prompt, companyName, industry, valueProp, targetAudience, tone, postType, language }) {
    const isCrypto = industry.toLowerCase().includes('crypto');
    const p = prompt ? prompt.toLowerCase() : '';

    // Language prefixes or translations
    const isSpanish = language.startsWith('es');
    const isFrench = language.startsWith('fr');
    const isGerman = language.startsWith('de');
    const isHindi = language.startsWith('hi');

    let hook = '';
    let body = '';
    let cta = '';
    let title = '';
    let hashtags = [];

    // TONE VARIATION LOGIC
    if (tone === 'institutional_authority') {
      if (prompt) {
        hook = `The mathematical standard for ${prompt}: why institutional allocators refuse legacy execution models.`;
        body = `In high-volume markets, execution latency directly erodes annual return benchmarks. At ${companyName}, our verified infrastructure delivers ${valueProp}, providing institutional compliance and auditable precision tailored for ${targetAudience}.`;
        cta = `Request the confidential Q4 institutional audit dossier via the link in our bio.`;
      } else {
        hook = `Why top-decile funds never accept more than 4 basis points of execution slippage.`;
        body = `When analyzing institutional order flow, timing is the ultimate differentiator. ${companyName} establishes a zero-compromise benchmark with sub-second automated routing, engineered specifically for ${targetAudience}.`;
        cta = `Access our verified execution benchmark report at ${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.io.`;
      }
      hashtags = ['#InstitutionalFinance', '#QuantAlpha', '#FinTechLeadership', '#AssetManagement', '#AUMGrowth'];
    } else if (tone === 'urgent_fomo') {
      if (prompt) {
        hook = `Warning: If you haven't automated ${prompt} yet, your competition just gained an unfair 10x edge.`;
        body = `The window to capitalize on manual inefficiencies is slamming shut. With ${companyName}'s ${valueProp}, early adopters are locking in record performance while legacy desks are caught flat-footed. Only 3 partner slots remain this month.`;
        cta = `Drop the word 'ACCESS' right now before institutional allocation caps are reached.`;
      } else {
        hook = `This is your last chance to secure priority access before our Q4 allocator books close.`;
        body = `While other funds hesitate, market leaders are deploying autonomous execution to capture yield in real time. ${companyName} provides ${valueProp} with zero infrastructure overhead.`;
        cta = `Comment 'SCALE' immediately to reserve one of the final 2 deployment slots.`;
      }
      hashtags = ['#HighFrequency', '#AlphaAlert', '#ExponentialGrowth', '#CryptoFunds', '#DisruptiveTech'];
    } else if (tone === 'educational_breakdown') {
      if (prompt) {
        hook = `The 3-step breakdown of how ${prompt} actually works behind the scenes.`;
        body = `Step 1: Ingest live order book telemetry in sub-millisecond windows. Step 2: Route directly through ${companyName}'s optimized algorithmic engine for ${valueProp}. Step 3: Eliminate human latency and lock in verified spreads before competitors react.`;
        cta = `Save this breakdown for your next quarterly strategy review and share with your team.`;
      } else {
        hook = `How autonomous systems replaced a 10-person trading & outbound desk in under 30 days.`;
        body = `Here's the exact architectural blueprint. By replacing manual lag with ${companyName}'s autonomous engine, we achieved ${valueProp}, slashing operational overhead by 78% for ${targetAudience}.`;
        cta = `Bookmark this post and follow for weekly deep-dives into autonomous infrastructure.`;
      }
      hashtags = ['#TechMasterclass', '#HowItWorks', '#SystemsEngineering', '#GTMBlueprint', '#LearnInPublic'];
    } else {
      // Default: aggressive_challenger
      if (prompt) {
        hook = `Stop wasting capital on slow execution. Here's why ${prompt} is changing the game forever.`;
        body = `While legacy teams are stuck with 5-minute lag times, ${companyName} delivers ${valueProp}. If you are in ${targetAudience}, relying on outdated workflows is practically lighting budget on fire.`;
        cta = `Comment 'EXECUTE' and we'll send the live benchmark data straight to your DMs.`;
      } else {
        hook = `If your business still relies on manual follow-ups, you're handing your market share to competitors.`;
        body = `Speed-to-lead is no longer optional. ${companyName} deploys sub-second autonomous intelligence that delivers ${valueProp}. The result? 3.8x higher conversion and zero human friction for ${targetAudience}.`;
        cta = `Comment 'SPEED' to see our live autonomous system in action.`;
      }
      hashtags = ['#SpeedToLead', '#AutonomousExecution', '#Disruption', '#GameChanger', '#ScaleFast'];
    }

    // MULTI-LANGUAGE TRANSLATION ADAPTATION
    if (isSpanish) {
      hook = `Atención: Deje de perder capital en ejecuciones lentas con ${prompt || companyName}.`;
      body = `En mercados de alta velocidad, la latencia destruye el rendimiento. Con ${companyName}, obtenga ${valueProp} sin demoras humanas para ${targetAudience}.`;
      cta = `Comente 'ALFA' abajo para recibir nuestro informe técnico exclusivo.`;
      hashtags = ['#InversionFintech', '#TradingAlgoritmico', '#CriptoFinanzas', '#Innovacion'];
    } else if (isFrench) {
      hook = `Arrêtez de gaspiller votre capital sur des exécutions lentes avec ${prompt || companyName}.`;
      body = `La vitesse d'exécution est la clé. Avec ${companyName}, profitez de ${valueProp} conçu pour ${targetAudience}.`;
      cta = `Commentez 'DIRECT' pour accéder à notre analyse technique complète.`;
      hashtags = ['#FinTechFrance', '#TradingQuantitatif', '#IntelligenceArtificielle'];
    } else if (isGerman) {
      hook = `Stoppen Sie Kapitalverluste durch langsame Ausführungszeiten bei ${prompt || companyName}.`;
      body = `Geschwindigkeit ist der ultimative Hebel. ${companyName} liefert ${valueProp} mit maximaler Präzision für ${targetAudience}.`;
      cta = `Kommentieren Sie 'ALPHA' für unseren verifizierten Leistungsbericht.`;
      hashtags = ['#FinanzTechnologie', '#QuantTrading', '#Automatisierung'];
    } else if (isHindi) {
      hook = `धीमी निष्पादन प्रक्रिया में अपनी पूँजी गंवाना बंद करें: पेश है ${prompt || companyName} का नया दौर।`;
      body = `आधुनिक बाज़ारों में गति ही सबसे बड़ी शक्ति है। ${companyName} की तकनीक से प्राप्त करें ${valueProp}, विशेषकर ${targetAudience} के लिए।`;
      cta = `फ्री डेमो और गाइड के लिए नीचे 'SCALE' कमेंट करें।`;
      hashtags = ['#FinTechIndia', '#AIStartup', '#QuantFinance'];
    }

    title = prompt ? `${prompt.slice(0, 48)}...` : `${companyName} • ${tone.replace(/_/g, ' ').toUpperCase()}`;

    // Slides for Carousel format
    const slides = [
      {
        slideNumber: 1,
        headline: hook,
        subtext: `How ${companyName} solves execution latency for ${targetAudience}.`,
        statCallout: '10x Faster',
        visualTheme: 'cyber-dark',
      },
      {
        slideNumber: 2,
        headline: 'The Hidden Latency Bleed',
        subtext: 'Legacy workflows waste up to 18 basis points on manual approvals and delayed routing.',
        statCallout: '-18 bps',
        visualTheme: 'cyber-dark',
      },
      {
        slideNumber: 3,
        headline: 'The Autonomous Engine',
        subtext: `${valueProp} operating 24/7 without human fatigue.`,
        statCallout: '< 600ms',
        visualTheme: 'cyber-dark',
      },
      {
        slideNumber: 4,
        headline: 'Verified Performance Benchmark',
        subtext: 'Proven 3.8x higher demo conversion and zero slippage on institutional block trades.',
        statCallout: '+380%',
        visualTheme: 'cyber-dark',
      },
      {
        slideNumber: 5,
        headline: cta,
        subtext: `Connect your accounts at ${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.io today.`,
        statCallout: 'ACT NOW',
        visualTheme: 'cyber-dark',
      },
    ];

    return { hook, body, cta, title, hashtags, slides };
  }
}

export default PromptContentAgent;
