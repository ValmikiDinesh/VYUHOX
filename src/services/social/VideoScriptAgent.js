/**
 * VideoScriptAgent.js
 * AI Script Architect for high-retention 30-45s Reels, TikToks & YouTube Shorts
 * Follows the 4-Phase Viral Architecture:
 * 1. 0-3s: Visceral Pattern Interrupt Hook
 * 2. 3-12s: Agitation & Problem Exposure
 * 3. 12-25s: Core Mechanism / Autonomous Solution
 * 4. 25-35s: Low-Friction Call-To-Action (CTA)
 */

export class VideoScriptAgent {
  /**
   * Generates a viral 30-45s vertical script tailored to the workspace's industry and brand
   */
  static async generateScript({ workspaceName, industry, topic, targetAudience, brandVoice }) {
    const isCrypto = (industry || '').toLowerCase().includes('crypto');
    const isEcommerce = (industry || '').toLowerCase().includes('ecom');

    // Default topics if none provided
    const defaultTopic = isCrypto
      ? 'Why 99% of algorithmic funds bleed alpha on execution latency'
      : isEcommerce
      ? 'The 45-second checkout recovery trick that prints 38% more revenue'
      : 'How AI agents replace a 10-person outbound SDR team';

    const selectedTopic = topic || defaultTopic;

    // Viral Script Templates tailored to industry
    const templates = isCrypto
      ? [
          {
            hook: "Stop manually checking order books. You're losing 18 basis points on every single cross-exchange trade.",
            body: "High-frequency arbitrage isn't about guessing direction—it's about execution velocity. While legacy funds wait for human traders to approve block orders, autonomous execution algorithms bridge Binance, OKX, and Bybit in sub-600 milliseconds with institutional Fireblocks custody. In Q2 alone, automated latency routing prevented over $4.2 million in slippage.",
            cta: "Drop the word 'ALPHA' below and I'll send you our institutional low-latency execution framework for free.",
            hashtags: ['#CryptoTrading', '#AlgorithmicFinance', '#QuantTrading', '#Web3Alpha', '#DeFiSpeed'],
          },
          {
            hook: "If your crypto fund doesn't have an AI agent taking sales calls in under 45 seconds, you're lighting LP capital on fire.",
            body: "When an institutional allocator requests an audit dossier at 2 AM, they don't wait for your London desk to wake up. An autonomous voice agent qualifies their AUM, verifies their multi-sig setup, and books them directly onto your calendar while your competition is asleep.",
            cta: "Comment 'SCALE' to see our live sub-second Bland AI dialer in action.",
            hashtags: ['#HedgeFund', '#CryptoInvesting', '#AIAutomation', '#GTMStrategy', '#FinTech'],
          },
        ]
      : [
          {
            hook: "Cold outbound isn't dead—your human reps are just too slow to convert high-intent inbound traffic.",
            body: "Harvard Business Review proved that responding within 5 minutes makes you 21 times more likely to close enterprise deals. With VYUHOX autonomous speed-to-lead, our conversational voice AI dials inbound prospects in 42 seconds, conducts a full technical discovery, and transfers them straight to your account executive's headset.",
            cta: "Save this reel and link your workspace today to automate your entire outbound GTM pipeline.",
            hashtags: ['#SaaSGrowth', '#B2BSales', '#ColdOutbound', '#AIEnterprise', '#FounderTips'],
          },
          {
            hook: "Here's the secret 3-channel stack scaling B2B SaaS to $100k MRR without hiring a single outbound SDR.",
            body: "First: Automated WhatsApp drip sequences with sentiment detection. Second: Sub-second voice AI phone calls that qualify leads within 45 seconds. Third: Programmatic Omnichannel orchestration that syncs Telegram, SMS, and Email in one unified inbox. The result? 3.8x higher demo booking rates at 80% lower cost.",
            cta: "Drop 'PIPELINE' in the comments and I'll send the full 30-day automation blueprint.",
            hashtags: ['#SaaSStartup', '#GrowthHacking', '#AIAutomation', '#LeadGen', '#StartupFounder'],
          },
        ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const hook = template.hook;
    const body = template.body;
    const cta = template.cta;

    // Generate Timed Captions with word-level timestamps for karaoke text animations
    const fullText = `${hook} ${body} ${cta}`;
    const words = fullText.split(/\s+/).filter(Boolean);

    // Approximate speech rate: ~2.8 words per second
    const wordDuration = 0.35;
    let currentTime = 0.4; // Initial 0.4s pause before hook delivers

    const timedWords = words.map((w) => {
      const start = parseFloat(currentTime.toFixed(2));
      const end = parseFloat((currentTime + wordDuration).toFixed(2));
      currentTime += wordDuration;
      return { word: w, start, end };
    });

    // Group words into bite-sized 3-5 word subtitle chunks for high readability
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

    const durationSeconds = Math.ceil(currentTime);

    return {
      title: `${selectedTopic.slice(0, 50)}...`,
      topic: selectedTopic,
      scriptHook: hook,
      scriptBody: body,
      scriptCta: cta,
      fullScript: fullText,
      timedCaptions,
      durationSeconds,
      caption: `🔥 ${hook}\n\n${body}\n\n👉 ${cta}\n\n${template.hashtags.join(' ')}`,
      hashtags: template.hashtags,
    };
  }

  /**
   * Generates a 30-day content calendar plan with varied post types and topics
   */
  static generate30DayStrategy({ workspaceName, industry }) {
    const days = [];
    const platforms = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE_SHORTS', 'TWITTER', 'LINKEDIN'];
    const types = ['REEL', 'CAROUSEL', 'STATIC_GRAPHIC', 'TEXT_THREAD'];

    const now = new Date();

    for (let day = 1; day <= 30; day++) {
      const scheduledDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      scheduledDate.setHours(10 + (day % 3) * 4, 30, 0, 0); // Alternate 10:30, 14:30, 18:30

      const platform = platforms[(day - 1) % platforms.length];
      const type = types[(day - 1) % types.length];

      days.push({
        dayNumber: day,
        scheduledAt: scheduledDate,
        platform,
        type,
        topic: `Day ${day}: Autonomous GTM Blueprint - Strategy #${(day % 7) + 1}`,
      });
    }

    return days;
  }
}

export default VideoScriptAgent;
