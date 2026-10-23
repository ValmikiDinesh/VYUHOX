/**
 * VideoRenderer.js
 * Programmatic Video Compositor for 1080x1920 (9:16) Vertical Reels & Shorts
 * Coordinates B-roll background footage, word-by-word karaoke captions,
 * brand watermark, and audio voiceover.
 */

export class VideoRenderer {
  /**
   * High-retention vertical B-roll video loops
   */
  static B_ROLL_PRESETS = [
    {
      id: 'cyber_crypto_matrix',
      name: 'Cybernetic HUD & Liquidity Depth',
      videoUrl: '/media/hedgex_reel.jpg',
      fallbackGradient: 'linear-gradient(180deg, #020617 0%, #064E3B 50%, #0F172A 100%)',
      accentColor: '#10B981',
    },
    {
      id: 'neon_data_stream',
      name: 'High-Velocity Algorithmic Tunnel',
      videoUrl: '/media/vyuhox_reel.jpg',
      fallbackGradient: 'linear-gradient(180deg, #090D16 0%, #0E7490 50%, #020617 100%)',
      accentColor: '#06B6D4',
    },
    {
      id: 'abstract_ai_cube',
      name: 'Neural Pipeline Architecture',
      videoUrl: '/media/hedgex_carousel.jpg',
      fallbackGradient: 'linear-gradient(180deg, #180928 0%, #7C3AED 50%, #020617 100%)',
      accentColor: '#A855F7',
    },
  ];

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
    theme = 'cyber_crypto_matrix',
  }) {
    const preset =
      this.B_ROLL_PRESETS.find((p) => p.id === theme) || this.B_ROLL_PRESETS[0];

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
      audioUrl: audioUrl || '/audio/call_harrison.wav',
      watermark: {
        text: `${brandName.toUpperCase()} • AUTONOMOUS GTM`,
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
