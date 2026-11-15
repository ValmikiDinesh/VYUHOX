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
    const isWeddingOrLuxury = /wedding|invite|stationery|event|jewelry|luxury|fashion|bridal/i.test(`${industry} ${workspaceName} ${topic || ''}`);

    // Default topics if none provided
    const defaultTopic = isWeddingOrLuxury
      ? 'Why bespoke personalized digital invitations leave wedding guests speechless'
      : isCrypto
      ? 'Why 99% of algorithmic funds bleed alpha on execution latency'
      : isEcommerce
      ? 'The 45-second checkout recovery trick that prints 38% more revenue'
      : 'How AI agents replace a 10-person outbound SDR team';

    const selectedTopic = topic || defaultTopic;

    // Viral Script Templates tailored to industry
    let templates;
    if (isWeddingOrLuxury) {
      templates = [
        {
          hook: "If you are still sending static paper cards or generic PDFs for luxury weddings, your guests are missing the warmth they deserve.",
          body: `With ${workspaceName}, every guest receives an intimate, cinematic invitation film addressed directly to them in their family language—whether Telugu, Hindi, Tamil, or English. Plus, track RSVPs live and collect all celebration memories into one seamless digital keepsake.`,
          cta: "Comment 'PREVIEW' to test-drive a bespoke invitation with your family's names right now.",
          hashtags: ['#LuxuryWeddings', '#WeddingInvitations', '#BespokeStationery', '#EventTech', '#RoyalWeddings'],
        },
        {
          hook: "The number one reason wedding RSVPs get forgotten is cold, impersonal broadcast messages.",
          body: `When guests see an invitation addressed respectfully to 'Ravi Mamayya garu' or 'Meena Mausi ji', engagement triples. ${workspaceName} personalizes every single digital invite across thousands of guests within 48 hours.`,
          cta: "Tap the link in bio or message us today for your complimentary bespoke sample.",
          hashtags: ['#BespokeInvites', '#WeddingInspiration', '#WeddingPlanner', '#BridalTrends', '#LuxuryStationery'],
        },
      ];
    } else if (isCrypto) {
      templates = [
        {
          hook: "Stop manually checking order books. You're losing 18 basis points on every single cross-exchange trade.",
          body: "High-frequency arbitrage isn't about guessing direction—it's about execution velocity. While legacy funds wait for human traders to approve block orders, autonomous execution algorithms bridge exchanges in sub-600 milliseconds.",
          cta: "Comment 'SCALE' to see our low-latency execution framework.",
          hashtags: ['#CryptoTrading', '#AlgorithmicFinance', '#QuantTrading', '#Web3Alpha', '#DeFiSpeed'],
        },
      ];
    } else {
      templates = [
        {
          hook: "Cold outbound isn't dead—your human reps are just too slow to convert high-intent inbound traffic.",
          body: `Harvard Business Review proved that responding within 5 minutes makes you 21 times more likely to close enterprise deals. With ${workspaceName} autonomous speed-to-lead, our conversational AI dials inbound prospects in 42 seconds, conducts discovery, and schedules qualified demos directly.`,
          cta: "Save this reel and link your workspace today to automate your entire pipeline.",
          hashtags: ['#BusinessGrowth', '#SalesAutomation', '#LeadGen', '#EnterpriseAI', '#GTMStrategy'],
        },
        {
          hook: `Here is the secret 3-channel system scaling ${industry || 'modern brands'} to record growth without bloated overhead.`,
          body: `First: Automated WhatsApp touchpoints with sentiment detection. Second: Sub-second voice AI that qualifies inbound queries instantly. Third: Programmatic Omnichannel coordination that syncs all interactions in one place. The result? 3.8x higher conversions at 80% lower cost.`,
          cta: "Comment 'GROWTH' below and we will send the full blueprint straight to your inbox.",
          hashtags: ['#BusinessSuccess', '#GrowthHacking', '#AIAutomation', '#LeadGen', '#Founders'],
        },
      ];
    }

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
