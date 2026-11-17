/**
 * VideoRenderer.js
 * Programmatic Video Compositor for 1080x1920 (9:16) Vertical Reels & Shorts
 * Coordinates B-roll background footage, word-by-word karaoke captions,
 * brand watermark, and audio voiceover.
 */

export class VideoRenderer {
  /**
   * Industry-adaptive vertical B-roll presets (100% neutral and commercial-grade)
   */
  static B_ROLL_PRESETS = [
    {
      id: 'modern_commercial_cinematic',
      name: 'Modern Commercial & Brand Spotlight',
      videoUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1080&h=1920&q=85',
      fallbackGradient: 'linear-gradient(180deg, #090D16 0%, #1E293B 50%, #030712 100%)',
      accentColor: '#38BDF8',
    },
    {
      id: 'luxury_wedding_event',
      name: 'Luxury Wedding, Stationery & Celebration',
      videoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1080&h=1920&q=85',
      fallbackGradient: 'linear-gradient(180deg, #180512 0%, #4A0E2E 50%, #0D0208 100%)',
      accentColor: '#F59E0B',
    },
    {
      id: 'retail_fashion_lifestyle',
      name: 'Retail, Fashion & Lifestyle Studio',
      videoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1080&h=1920&q=85',
      fallbackGradient: 'linear-gradient(180deg, #0F172A 0%, #312E81 50%, #020617 100%)',
      accentColor: '#EC4899',
    },
    {
      id: 'growth_tech_saas',
      name: 'Technology, Enterprise & Innovation',
      videoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&h=1920&q=85',
      fallbackGradient: 'linear-gradient(180deg, #020617 0%, #0F766E 50%, #020617 100%)',
      accentColor: '#10B981',
    },
  ];

  /**
   * Resolves the best matching B-roll preset based on workspace industry and brand DNA
   */
  static resolvePreset(industry = '', brandName = '') {
    const text = `${industry} ${brandName}`.toLowerCase();
    if (/wedding|invite|invitation|stationery|matrimony|bridal|event/i.test(text)) {
      return this.B_ROLL_PRESETS.find(p => p.id === 'luxury_wedding_event') || this.B_ROLL_PRESETS[1];
    }
    if (/fashion|apparel|jewelry|luxury|boutique|sunglass|eyewear/i.test(text)) {
      return this.B_ROLL_PRESETS.find(p => p.id === 'retail_fashion_lifestyle') || this.B_ROLL_PRESETS[2];
    }
    if (/tech|software|saas|ai|cloud|data|platform/i.test(text)) {
      return this.B_ROLL_PRESETS.find(p => p.id === 'growth_tech_saas') || this.B_ROLL_PRESETS[3];
    }
    return this.B_ROLL_PRESETS[0];
  }

  /**
   * Compiles video reel configuration with animated subtitle tracks and assets
   */
  static async composeReel({
    title,
    scriptHook,
    scriptBody,
    scriptCta,
    timedCaptions = [],
    audioUrl = null,
    brandName = 'VYUHOX',
    theme = 'modern_commercial_cinematic',
  }) {
    // Gracefully map any legacy crypto theme requests to modern commercial
    const cleanTheme = (theme === 'cyber_crypto_matrix' || theme === 'abstract_ai_cube')
      ? 'modern_commercial_cinematic'
      : theme;

    const preset =
      this.B_ROLL_PRESETS.find((p) => p.id === cleanTheme) || this.B_ROLL_PRESETS[0];

    // Compute total duration
    const totalDuration =
      timedCaptions.length > 0
        ? timedCaptions[timedCaptions.length - 1].end + 1
        : 30;

    const reelConfig = {
      format: 'VERTICAL_9_16',
      resolution: { width: 1080, height: 1920 },
      aspectRatio: '9:16',
      durationSeconds: Math.ceil(totalDuration),
      bRollPreset: preset,
      backgroundVideoUrl: preset.videoUrl,
      fallbackGradient: preset.fallbackGradient,
      audioUrl: audioUrl || null,
      watermark: {
        text: `${brandName.toUpperCase()} • OFFICIAL SHOWCASE`,
        position: 'top-left',
        glowColor: preset.accentColor,
      },
      timedCaptions,
      subtitleStyle: {
        fontFamily: 'Montserrat, Inter, sans-serif',
        fontSize: '28px',
        fontWeight: '900',
        textTransform: 'uppercase',
        activeWordColor: '#FACC15', // Vibrant neon yellow-gold
        activeWordBg: 'rgba(0, 0, 0, 0.75)',
        normalWordColor: '#FFFFFF',
        textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 0 20px rgba(6,182,212,0.6)',
      },
      renderedAt: new Date(),
      status: 'COMPOSED_PREVIEW_READY',
    };

    return reelConfig;
  }
}

export default VideoRenderer;
