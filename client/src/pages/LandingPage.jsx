import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  PhoneCall,
  Users,
  MessageSquare,
  Video,
  TrendingUp,
  ShieldCheck,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Globe,
  Zap,
  Cpu,
  Layers,
  Star,
  RefreshCw,
  ExternalLink,
  Target,
  Clock,
  Mic,
  Lock,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { authStorage } from '../services/authStorage';

export default function LandingPage({ onEnterApp, onSelectPlan, onNavigateAuth, initialCurrency = 'INR' }) {
  // Automatic Indian Locale & Currency Detection (Defaults to INR ₹ in India, USD $ optional)
  const [currency, setCurrency] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const lang = navigator.language || '';
      if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India') || lang.includes('en-IN') || lang.includes('hi')) {
        return 'INR';
      }
    } catch (e) {}
    return initialCurrency || 'INR';
  });

  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  // Billing cycle toggle: 'monthly' | 'annual'
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Scanner state
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Geo-IP & Visitor Intent Personalization State (<5ms)
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    const fetchPersonalization = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(searchParams.entries());
        const res = await api.getGeoPersonalization(params);
        if (res.success && res.geo) {
          setGeoData(res);
          // Sync currency automatically with verified geo location
          if (res.geo.currency && (res.geo.currency === 'INR' || res.geo.currency === 'USD')) {
            setCurrency(res.geo.currency);
          }
        }
      } catch (err) {
        console.warn('[Personalization] Local fallback active:', err.message);
      }
    };
    fetchPersonalization();
  }, []);

  // Audio player state for voice AI sample
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackTime, setAudioPlaybackTime] = useState(0);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);
  const [acvValue, setAcvValue] = useState(3500);
  const [dealsTarget, setDealsTarget] = useState(8);
  const [isOrbActive, setIsOrbActive] = useState(false);

  // Handle live scan - saves pending URL and guides client through signup/signin to dashboard
  const handleScanBusiness = (e) => {
    e?.preventDefault();
    if (!scanUrl || !scanUrl.trim()) return;

    const trimmed = scanUrl.trim();
    const formattedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    sessionStorage.setItem('vyuhox_pending_crawl_url', formattedUrl);

    const token = authStorage.getToken();
    if (token) {
      window.location.hash = '#app';
    } else {
      window.location.hash = '#signup';
    }
  };

  // Simulated Voice Demo Playback
  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      let t = 0;
      const interval = setInterval(() => {
        t += 1;
        setAudioPlaybackTime(t);
        if (t >= 18) {
          clearInterval(interval);
          setIsPlayingAudio(false);
          setAudioPlaybackTime(0);
        }
      }, 1000);
    }
  };

  // Pricing multiplier for annual billing (20% discount)
  const isAnnual = billingCycle === 'annual';
  const getPlanPrice = (usdMonthly, inrMonthly) => {
    const base = isINR ? inrMonthly : usdMonthly;
    if (isAnnual) {
      return Math.round(base * 0.8);
    }
    return base;
  };

  // FAQ Items
  const faqItems = [
    {
      q: 'How does the Prepaid Usage Wallet work and what are the carrier rates?',
      a: 'VYUHOX operates on wholesale utility usage pricing with zero artificial markups: Outbound AI Voice calls are $0.012/min, WhatsApp business messages are $0.005/msg, verified email dispatches are $0.0008/msg, and waterfall contact enrichments are $0.02/lead. You deposit funds into your workspace wallet and can enable auto-recharge via Stripe so your autonomous agents never pause.',
    },
    {
      q: 'What is US A2P 10DLC compliance and how does VYUHOX safeguard deliverability?',
      a: 'We integrate directly with Twilio Trust Hub and the Campaign Registry (TCR). You fill out your business profile in 2 minutes, and our compliance engine registers your brand and use-case campaigns for 100% carrier pre-approval. Furthermore, our Universal DNC engine instantly suppresses any recipient who replies STOP or Unsubscribe across voice, SMS, and email queues.',
    },
    {
      q: 'How does the autonomous cross-agent collaboration work?',
      a: 'The 6 AI C-Suite employees (CMO, SDR, Voice Closer, CFO, CS, CEO) operate on a shared event bus. When the AI CMO identifies high-converting ICP segments, the AI SDR generates personalized outreach sequences, the Voice Closer bridges live inbound dials in under 30s, and the AI CFO tracks real-time CAC/LTV margins to prevent budget bleed.',
    },
    {
      q: 'How does the Autonomous AI GTM Engine operate?',
      a: 'Vyuhox operates as a fully autonomous AI multi-agent GTM engine. Our specialized AI digital workforce handles lead scraping, multi-channel enrichment, tailored outreach across Email, WhatsApp, Telegram, and SMS, and automated pipeline conversion without manual overhead.',
    },
    {
      q: 'How does the Voice AI achieve sub-800ms conversational response latency?',
      a: 'We utilize dedicated Bland.ai carrier pipelines paired with streaming neural text-to-speech models and low-latency LLM orchestration. This allows Maya Vance (our AI Voice Closer) to listen, process speech interruptions, handle objections, and speak back naturally within 680ms—completely indistinguishable from a top-performing human sales executive.',
    },
  ];

  return (
    <div style={{
      background: '#040810',
      color: '#F8FAFC',
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      overflowX: 'hidden',
    }}>
      {/* Top Notification Bar */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.15) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38BDF8' }}>
          <Zap size={14} color="#38BDF8" /> 6 AI C-Suite Executives Online
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
        <span style={{ color: '#34D399' }}>Sub-800ms Bland.ai Voice Bridge Live</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
        <span style={{ color: '#C4B5FD' }}>Autonomous Speed-to-Lead Engine Live</span>
      </div>

      {/* Main Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(4, 8, 16, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.45)',
          }}>
            <Cpu size={22} color="#04101A" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.35rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                background: 'linear-gradient(90deg, #F8FAFC, #38BDF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                VYUHOX
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: '700',
                padding: '2px 5px',
                borderRadius: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}>
                1.0 GA
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '0.9rem', fontWeight: '500' }}>
          <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
          <a href="#scanner" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Live Scanner</a>
          <a href="#voice-demo" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Voice AI Demo</a>
          <a href="#pricing" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</a>
          <a href="#faq" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</a>
        </div>

        {/* Right Nav: Currency Selector + Auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Currency Toggle (INR vs USD) */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2px',
          }}>
            <button
              onClick={() => setCurrency('INR')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: isINR ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: isINR ? '#FBBF24' : '#94A3B8',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              title="Show pricing in Indian Rupee (INR ₹) with UPI"
            >
              INR ₹
            </button>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: !isINR ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: !isINR ? '#38BDF8' : '#94A3B8',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              title="Show pricing in US Dollar (USD $) with Stripe"
            >
              USD $
            </button>
          </div>

          {/* App Dashboard Direct Jump */}
          <button
            onClick={() => {
              if (onEnterApp) onEnterApp();
              else {
                window.location.hash = '#app';
                window.location.reload();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#38BDF8',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title="Launch and enter the app dashboard"
          >
            <Cpu size={14} />
            <span>App Dashboard</span>
            <ArrowRight size={13} />
          </button>

          {/* Sign In Button (Dedicated Client Login URL) */}
          <button
            onClick={() => {
              if (onNavigateAuth) {
                onNavigateAuth('signin');
              } else {
                window.location.hash = '#login';
              }
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Sign In
          </button>

          {/* Get Started Free Button (Dedicated Client Signup URL) */}
          <button
            onClick={() => {
              if (onNavigateAuth) {
                onNavigateAuth('signup');
              } else {
                window.location.hash = '#signup';
              }
            }}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.8125rem',
              fontWeight: '700',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '90px 24px 60px',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Glow backdrop effect */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 80%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: '#38BDF8',
            marginBottom: '24px',
          }}>
            <Sparkles size={14} color="#38BDF8" />
            <span>
              {geoData?.geo?.badgeText || "The World's First Fully Autonomous Go-To-Market Operating System"}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '3.6rem',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '-0.02em',
            margin: '0 auto 24px',
            maxWidth: '1000px',
            background: 'linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {geoData?.intent?.headlineHook || 'Strategy, Leads, Voice AI, Omnichannel Comms & Paid Ads in One Platform.'}
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#94A3B8',
            maxWidth: '780px',
            margin: '0 auto 36px',
            lineHeight: '1.6',
          }}>
            {geoData?.intent?.subHeadline || 'Replace fragmented sales teams and disconnected point solutions. VYUHOX deploys an autonomous AI C-Suite that scrapes leads, dials high-intent prospects in 14 seconds, and runs multi-channel outreach 24/7.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const el = document.getElementById('scanner');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                fontSize: '0.95rem',
                fontWeight: '700',
                borderRadius: '10px',
              }}
            >
              <Sparkles size={18} />
              <span>Audit Your GTM Free (10s)</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onEnterApp}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '700',
              }}
            >
              <Cpu size={18} color="#38BDF8" />
              <span>Launch Autonomous Cockpit</span>
            </button>
          </div>

          {/* Living 3D Voice Orb Hero Simulator */}
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto 40px',
              background: 'rgba(14, 18, 28, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 40px rgba(0, 0, 0, 0.6)',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pulse-emerald" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>
                  Live Voice AE Simulator • Maya Vance
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  Sub-700ms Bland.ai
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Try without signing up</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(4, 6, 10, 0.6)', padding: '12px 18px', borderRadius: '12px', border: 'var(--border-hairline)' }}>
              <button
                onClick={togglePlayAudio}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isPlayingAudio ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isPlayingAudio ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(2, 132, 199, 0.5)',
                  flexShrink: 0,
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isPlayingAudio ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#FFFFFF' }}>
                  {isPlayingAudio ? '🔴 Maya Vance Handling Inbound Enterprise Objection...' : 'Listen to 680ms Live Objection Dial'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                  {isPlayingAudio ? `Streaming Live Telemetry: 00:${audioPlaybackTime < 10 ? '0' + audioPlaybackTime : audioPlaybackTime} / 00:18` : 'Click to test real-time speech response speed'}
                </div>
              </div>

              {/* Dynamic Sound Waveform */}
              {isPlayingAudio ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }}>
                  {[12, 22, 14, 28, 16, 26, 10, 24, 20, 15, 25, 18].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '3px',
                        height: `${h}px`,
                        background: '#38BDF8',
                        borderRadius: '2px',
                        animation: `pulse ${(i % 3) * 0.15 + 0.4}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  680ms Response
                </span>
              )}
            </div>
          </div>

          {/* Social Proof Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            fontSize: '0.85rem',
            color: '#64748B',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <strong style={{ color: '#F8FAFC' }}>4.9/5</strong> Rating from 450+ High-Growth Teams
            </div>
            <div>•</div>
            <div><strong style={{ color: '#F8FAFC' }}>&gt;2.4M</strong> Automated Voice AI Dials</div>
            <div>•</div>
            <div><strong style={{ color: '#F8FAFC' }}>100%</strong> Autonomous C-Suite Execution</div>
            <div>•</div>
            <div><strong style={{ color: '#F8FAFC' }}>A2P 10DLC</strong> Carrier Pre-Approved</div>
          </div>
        </div>
      </section>

      {/* Section 2: Live Interactive Business Scanner Demo */}
      <section id="scanner" style={{
        padding: '60px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div className="card" style={{
          padding: '40px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Live Web Scanner Demo</span>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: '800', margin: '8px 0' }}>
              See Your Autonomous GTM Strategy in 10 Seconds
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
              Enter your website URL. Our crawler analyzes your value proposition, extracts buyer personas, and provisions a custom AI C-Suite team.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleScanBusiness} style={{ display: 'flex', gap: '12px', maxWidth: '680px', margin: '0 auto 30px' }}>
            <input
              type="text"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              placeholder="Enter your website URL (e.g. https://yourcompany.com)"
              className="input"
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: '1rem',
                borderRadius: '10px',
              }}
            />
            <button
              type="submit"
              disabled={scanning}
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '0.95rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {scanning ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} />}
              <span>{scanning ? 'Scanning Web...' : 'Analyze GTM'}</span>
            </button>
          </form>

          {/* Quick 1-Click Test Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '-16px auto 26px', maxWidth: '680px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '600' }}>Instant 1-Click Tests:</span>
            {['https://stripe.com', 'https://linear.app', 'https://ramp.com', 'https://notion.so'].map((demoUrl) => (
              <button
                key={demoUrl}
                type="button"
                onClick={() => setScanUrl(demoUrl)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#38BDF8',
                  borderRadius: '9999px',
                  padding: '3px 11px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                  e.currentTarget.style.borderColor = '#38BDF8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {demoUrl.replace('https://', '')}
              </button>
            ))}
          </div>

          {/* Interactive Strategy Card Result */}
          {scanResult && (
            <div style={{
              background: 'rgba(4, 8, 16, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '24px',
              animation: 'fadeIn 0.3s ease-in',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#06B6D4', fontWeight: '700', textTransform: 'uppercase' }}>
                    Synthesis Complete • {scanResult.domainName}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '4px 0 0', color: '#F8FAFC' }}>
                    {scanResult.strategy?.category || 'B2B Enterprise Technology'}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                    Projected ROI: {scanResult.projectedRoiMultiple || '7.8x'}
                  </span>
                </div>
              </div>

              {/* Grid: ICP & Value Props */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38BDF8', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={16} /> Target Buyer Personas (ICP)
                  </h4>
                  {(scanResult.strategy?.buyerPersonas || []).map((p, idx) => (
                    <div key={idx} style={{ marginBottom: '8px', fontSize: '0.8rem' }}>
                      <strong style={{ color: '#F8FAFC' }}>{p.title}: </strong>
                      <span style={{ color: '#94A3B8' }}>{p.painPoint}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34D399', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Recommended Value Propositions
                  </h4>
                  {(scanResult.strategy?.valueProps || []).slice(0, 3).map((v, idx) => (
                    <div key={idx} style={{ marginBottom: '6px', fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ color: '#10B981' }}>✓</span> {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended AI Team */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#C4B5FD', margin: '0 0 12px' }}>
                  Recommended Autonomous AI Team Composition
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {(scanResult.recommendedTeam || []).map((agent) => (
                    <div key={agent.role} style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#F8FAFC' }}>{agent.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#A78BFA', fontWeight: '600' }}>{agent.role} (${agent.monthlyFee}/mo)</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.3' }}>{agent.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={onEnterApp}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  Deploy This AI Department in Workspace →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Comprehensive Feature Matrix */}
      <section id="features" style={{
        padding: '70px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '8px' }}>Autonomous Core Infrastructure</span>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: '800', margin: '8px 0' }}>
            Five Specialized Engines. Zero Human Overhead.
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
            Built from the ground up for modern B2B SaaS, Web3 funds, high-ticket agencies, and D2C brands.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}>
          {/* Feature 1: Sub-Second Voice AI */}
          <div id="voice-demo" className="card" style={{ padding: '30px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneCall size={22} color="#FB7185" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Sub-800ms Conversational Voice AI</h3>
                <span style={{ fontSize: '0.75rem', color: '#FB7185', fontWeight: '600' }}>Maya Vance • AI Voice AE</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px' }}>
              Dials inbound prospects within 14 seconds. Handles deep technical objections, qualifies high-intent enterprise accounts, and secures calendar bookings directly into Google Calendar.
            </p>

            {/* Playable Interactive Audio Demo with Reactive WebRTC Equalizer */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: '0 8px 24px rgba(244, 63, 94, 0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    onClick={togglePlayAudio}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      boxShadow: '0 0 16px rgba(244, 63, 94, 0.5)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {isPlayingAudio ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                  </button>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F8FAFC' }}>
                      {isPlayingAudio ? '🔴 Bland.ai WebRTC Carrier Streaming...' : 'Listen to 680ms Live Audio Sample'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {isPlayingAudio ? `00:${audioPlaybackTime < 10 ? '0' + audioPlaybackTime : audioPlaybackTime} / 00:18 • Neural TTS Stream` : 'Maya Vance enterprise objection qualification'}
                    </div>
                  </div>
                </div>
                <span className="badge badge-rose" style={{ fontSize: '0.72rem', fontWeight: '800' }}>680ms Carrier</span>
              </div>

              {/* Dynamic Equalizer Waveform */}
              {isPlayingAudio && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '26px', margin: '14px 0 6px' }}>
                  {[12, 22, 10, 26, 18, 30, 8, 24, 28, 14, 20, 16, 26, 12].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '3.5px',
                        height: `${h}px`,
                        background: 'linear-gradient(180deg, #FB7185 0%, #F43F5E 100%)',
                        borderRadius: '2px',
                        boxShadow: '0 0 6px rgba(244, 63, 94, 0.6)',
                        animation: `pulse ${(i % 3) * 0.15 + 0.4}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Real-Time Live Objection Handling Dialogue */}
              <div style={{
                marginTop: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.75rem',
                lineHeight: '1.45',
                color: '#CBD5E1',
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: '#94A3B8', fontWeight: '700', flexShrink: 0 }}>Prospect:</span>
                  <span style={{ fontStyle: 'italic' }}>"We already have an in-house SDR team and budget is tightly locked."</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#FB7185', fontWeight: '800', flexShrink: 0 }}>Maya Vance (680ms):</span>
                  <span>"Understood! Keep your human SDRs focused solely on warm demos while VYUHOX filters 2,000 cold leads automatically. Zero payroll risk. Can we test 50 leads this Thursday?"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Waterfall Lead Scraper */}
          <div className="card" style={{ padding: '30px', background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="#38BDF8" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Waterfall Lead Enrichment</h3>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600' }}>Apollo + Hunter + LinkedIn</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px' }}>
              Multi-provider verification queries Apollo, Hunter, BuiltWith, and LinkedIn simultaneously. Reconciles verified work emails, direct mobile numbers, and WhatsApp IDs at $0.02 per lead.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">98% Deliverability</span>
              <span className="badge badge-gray">SMTP Real-Time Ping</span>
              <span className="badge badge-gray">WhatsApp Verified</span>
            </div>
          </div>

          {/* Feature 3: Omnichannel Hub */}
          <div className="card" style={{ padding: '30px', background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={22} color="#34D399" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Unified Omnichannel Hub</h3>
                <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '600' }}>WhatsApp • Email • Telegram • SMS</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px' }}>
              All client interactions converge into a single thread. Marcus Cole (AI SDR) automatically executes drip sequences, answers inquiries, and flags high-intent hot deals for instant voice calls.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">Two-Way Live Sync</span>
              <span className="badge badge-gray">Sentiment Scoring</span>
              <span className="badge badge-gray">Instant Human Takeover</span>
            </div>
          </div>

          {/* Feature 4: Social Studio */}
          <div className="card" style={{ padding: '30px', background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={22} color="#C4B5FD" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Autonomous Video Reels & Posts</h3>
                <span style={{ fontSize: '0.75rem', color: '#C4B5FD', fontWeight: '600' }}>TikTok • Instagram • X • LinkedIn</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px' }}>
              Generates viral video scripts, neural voice narration, and branded social carousels on an automated 15-minute background cron. Keeps brand awareness compounding without copywriters.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-purple">ElevenLabs TTS</span>
              <span className="badge badge-gray">Direct Meta Graph API</span>
              <span className="badge badge-gray">Multi-Account Matrix</span>
            </div>
          </div>

          {/* Feature 5: Paid Ads Budget Optimizer */}
          <div className="card" style={{ padding: '30px', background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="#FBBF24" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>24/7 Paid Ads Optimizer</h3>
                <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '600' }}>Meta & Google Conversions API</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px' }}>
              Continuously adjusts ad spend every 10 minutes. Kills underperforming hooks, scales winning angles, and streams bottom-of-funnel closed-won sales back to ad algorithms for 3x ROAS.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-amber">Autonomous Spend Rules</span>
              <span className="badge badge-gray">CAPI Server Events</span>
              <span className="badge badge-gray">Zero Budget Bleed</span>
            </div>
          </div>

          {/* Feature 6: Autonomous RevOps & CAC Margin Guard */}
          <div className="card" style={{ padding: '30px', background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={22} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Autonomous RevOps &amp; CAC Guard</h3>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>AI CFO • Real-Time P&amp;L Protection</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px' }}>
              Marcus Vance (AI CFO) tracks real-time customer acquisition cost (CAC) against lifetime value (LTV). Automatically adjusts bid caps across campaigns and halts ad bleed before unprofitable spend occurs.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">CAC/LTV Telemetry</span>
              <span className="badge badge-gray">Auto Bid Caps</span>
              <span className="badge badge-gray">Real-Time P&amp;L Guard</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Transparent Public Pricing */}
      <section id="pricing" style={{
        padding: '80px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Clear, Transparent Investment</span>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.6rem', fontWeight: '800', margin: '8px 0' }}>
            Scale from Manual Tool to Autonomous AI Department
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 24px' }}>
            Choose the exact degree of autonomy you need. Upgrade or hire individual agents with 1 click anytime.
          </p>

          {/* Monthly / Annual Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                background: !isAnnual ? '#06B6D4' : 'transparent',
                color: !isAnnual ? '#04101A' : '#94A3B8',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                background: isAnnual ? '#06B6D4' : 'transparent',
                color: isAnnual ? '#04101A' : '#94A3B8',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <span>Annual Billing</span>
              <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#04101A', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Localized Payment Methods Strip */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '0.8rem',
          color: isINR ? '#FBBF24' : '#38BDF8',
          fontWeight: '600',
        }}>
          {isINR
            ? '⚡ Instant Activation via BHIM UPI (Google Pay, PhonePe, Paytm, CRED), Net Banking & RuPay Cards'
            : '⚡ Instant Activation via Stripe, Apple Pay, Google Pay & International Cards'}
        </div>

        {/* 4 Tier Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
          marginBottom: '32px',
        }}>
          {/* Plan 1: AI Growth Starter */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(11, 17, 32, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '32px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.2s',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-gray" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.04em' }}>
                  AI STARTER
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600' }}>Autonomous</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '4px 0 10px', color: '#F8FAFC' }}>
                AI Growth Engine
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: '1.45' }}>
                Autonomous AI Lead Scraper, Waterfall Enrichment, AI Omnichannel Drafter &amp; Smart CRM.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif', lineHeight: '1' }}>
                  {currencySymbol}{getPlanPrice(49, 3999).toLocaleString(isINR ? 'en-IN' : 'en-US')}
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '500' }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px' }}>
                  {isAnnual ? 'Billed annually ($470/yr)' : 'Flexible month-to-month'}
                </div>
              </div>

              {/* Highlighted Lead Quota Pill */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Zap size={14} color="#06B6D4" />
                <span style={{ fontSize: '0.775rem', fontWeight: '700', color: '#38BDF8' }}>
                  250 Verified Leads / month included
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Waterfall Lead Scraper &amp; Enrichment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Autonomous AI Drafts (Email, WhatsApp, Telegram, SMS)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Omnichannel Unified Outreach Inbox</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Meta &amp; Google Autonomous Ads Manager</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontWeight: '700', fontSize: '0.85rem' }}
            >
              Start AI Growth Engine
            </button>
          </div>

          {/* Plan 2: Tool + 1 Agent */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(11, 17, 32, 0.95) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '18px',
            padding: '32px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.2s',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.04em' }}>
                  MODULAR SCALING
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '600' }}>1 AI Employee</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '4px 0 10px', color: '#F8FAFC' }}>
                AI SDR Accelerator
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: '1.45' }}>
                AI Growth Engine plus 1 dedicated autonomous digital employee (e.g. Maya Voice Closer or Sarah SDR).
              </p>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif', lineHeight: '1' }}>
                  {currencySymbol}{getPlanPrice(99, 7999).toLocaleString(isINR ? 'en-IN' : 'en-US')}
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '500' }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px' }}>
                  {isAnnual ? 'Billed annually ($950/yr)' : 'Flexible month-to-month'}
                </div>
              </div>

              {/* Highlighted Lead Quota Pill */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Zap size={14} color="#38BDF8" />
                <span style={{ fontSize: '0.775rem', fontWeight: '700', color: '#38BDF8' }}>
                  1,000 Verified Leads / month included (FREE)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Everything in AI Growth Starter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span><strong>1 Dedicated AI Employee (Maya or Sarah)</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Sub-45s Inbound Speed-to-Lead Calling</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Add more agents for {currencySymbol}{isINR ? '2,999' : '39'}/mo each</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span style={{ color: '#FBBF24', fontWeight: '600' }}>{currencySymbol}{isINR ? '6,000' : '75'} Welcome Usage Bonus</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontWeight: '700', fontSize: '0.85rem' }}
            >
              Configure Modular Agent
            </button>
          </div>

          {/* Plan 3: Full AI Company (Featured - Most Popular) */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.14) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '2px solid #06B6D4',
            borderRadius: '18px',
            padding: '32px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 0 35px rgba(6, 182, 212, 0.35)',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              position: 'absolute',
              top: '-13px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #06B6D4, #10B981)',
              color: '#030712',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.675rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              boxShadow: '0 2px 10px rgba(6, 182, 212, 0.5)',
            }}>
              ★ Most Popular • Full C-Suite Workforce
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.04em' }}>
                  AUTONOMOUS GTM CO.
                </span>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700' }}>All 6 Agents Active</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '4px 0 10px', color: '#F8FAFC' }}>
                Autonomous AI Company
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: '1.45' }}>
                All 6 digital C-Suite employees deployed 24/7. Marketing, outreach, inbound calling, finance &amp; CRM run on complete autopilot.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: '900', color: '#38BDF8', fontFamily: 'Outfit, sans-serif', lineHeight: '1' }}>
                  {currencySymbol}{getPlanPrice(499, 39999).toLocaleString(isINR ? 'en-IN' : 'en-US')}
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '500' }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
                  Replaces ~$75,000/yr human SDR &amp; agency retainer costs
                </div>
              </div>

              {/* Highlighted Lead Quota Pill */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Zap size={14} color="#10B981" />
                <span style={{ fontSize: '0.775rem', fontWeight: '800', color: '#34D399' }}>
                  5,000 Verified Leads / month included (FREE)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span><strong>Complete 6-Agent AI C-Suite Included</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Ava CMO (Ads &amp; Social) + Sarah SDR (Outreach)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Maya Vance (Sub-45s Voice AI Telephone Closer)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Julian CFO (FinOps) + Chloe CS + Autonomous CEO</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span style={{ color: '#FBBF24', fontWeight: '600' }}>{currencySymbol}{isINR ? '8,000' : '100'} Welcome Usage Bonus</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: '800', fontSize: '0.875rem' }}
            >
              Deploy Autonomous AI Company
            </button>
          </div>

          {/* Plan 4: Enterprise High-Scale */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(11, 17, 32, 0.95) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '18px',
            padding: '32px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.2s',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.04em' }}>
                  ENTERPRISE SCALE
                </span>
                <span style={{ fontSize: '0.7rem', color: '#C4B5FD', fontWeight: '600' }}>Custom SIP &amp; SLAs</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '4px 0 10px', color: '#F8FAFC' }}>
                Autonomous Enterprise
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: '1.45' }}>
                Dedicated telecom trunking, high-throughput voice carriers, custom CRM webhooks, and 24/7 dedicated engineering SLA.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: '900', color: '#C4B5FD', fontFamily: 'Outfit, sans-serif', lineHeight: '1' }}>
                  {currencySymbol}{getPlanPrice(1499, 119999).toLocaleString(isINR ? 'en-IN' : 'en-US')}
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '500' }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#A78BFA', marginTop: '4px' }}>
                  Custom high-volume billing available
                </div>
              </div>

              {/* Highlighted Lead Quota Pill */}
              <div style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Zap size={14} color="#C4B5FD" />
                <span style={{ fontSize: '0.775rem', fontWeight: '700', color: '#C4B5FD' }}>
                  25,000 Verified Leads / month included (FREE)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span><strong>Full 6-Agent C-Suite Workforce Active</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Private Dedicated Twilio / Carrier SIP Trunk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>High-Volume Verified WhatsApp API Numbers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Custom Bi-directional Webhooks &amp; Salesforce Sync</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span>Priority 24/7 Dedicated Engineering Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontWeight: '700', fontSize: '0.85rem', borderColor: 'rgba(168, 85, 247, 0.45)' }}
            >
              Deploy Enterprise Suite
            </button>
          </div>
        </div>
      </section>

      {/* Section 4.5: Interactive GTM ROI & Payroll Replacement Engine */}
      <section style={{
        padding: '70px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
            Deterministic Financial Economics
          </span>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.4rem', fontWeight: '800', margin: '8px 0', color: '#FFFFFF' }}>
            Calculate Your Payroll Replacement &amp; Net ROI
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
            See how much capital you save by replacing human sales overhead with an autonomous AI C-Suite team.
          </p>
        </div>

        <div className="specular-glass" style={{ padding: '36px 40px', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px' }}>
            {/* Left Controls: Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '700', color: '#FFFFFF' }}>
                    Average Deal Value (ACV):
                  </label>
                  <span className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38BDF8' }}>
                    {isINR ? `₹${(acvValue * 83.5).toLocaleString('en-IN')}` : `${acvValue.toLocaleString()}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={acvValue}
                  onChange={(e) => setAcvValue(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284C7', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>
                  <span>$500</span>
                  <span>$25,000+</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '700', color: '#FFFFFF' }}>
                    Target Closed Deals / Month:
                  </label>
                  <span className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10B981' }}>
                    {dealsTarget} Deals
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={dealsTarget}
                  onChange={(e) => setDealsTarget(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>
                  <span>1 Deal</span>
                  <span>40 Deals</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '10px', border: 'var(--border-hairline)' }}>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.5' }}>
                  <strong style={{ color: '#F8FAFC' }}>What VYUHOX Replaces:</strong> 2 Human SDRs ($120k) + 1 Account Executive ($150k) + ZoomInfo/Apollo/Salesloft licenses ($25k) = <strong style={{ color: '#EF4444' }}>$295,000/year</strong> in legacy payroll overhead.
                </div>
              </div>
            </div>

            {/* Right Output: ROI & Savings Card */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(4, 6, 10, 0.7)', padding: '28px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Annual Capital Saved by Founder
              </div>
              <div className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: '900', color: '#10B981', margin: '6px 0 14px' }}>
                {isINR ? `₹${(290000 * 83.5).toLocaleString('en-IN')}` : '$290,000'}<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: '600' }}> / yr</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', borderTop: 'var(--border-hairline)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Generated Pipeline / Mo</div>
                  <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38BDF8' }}>
                    {isINR ? `₹${(acvValue * dealsTarget * 83.5).toLocaleString('en-IN')}` : `${(acvValue * dealsTarget).toLocaleString()}`}
                  </div>
                </div>
                <div style={{ borderLeft: 'var(--border-hairline)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Net ROI Multiple</div>
                  <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#A855F7' }}>
                    {Math.round(((acvValue * dealsTarget * 12) / 2988) * 10) / 10}x Annual
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterApp}
                className="btn-primary"
                style={{ marginTop: '20px', padding: '12px 20px', fontSize: '0.85rem' }}
              >
                <span>Deploy Autonomous Engine in Workspace</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Deep-Dive FAQ Accordion */}
      <section id="faq" style={{
        padding: '60px 24px 90px',
        maxWidth: '880px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-gray" style={{ marginBottom: '8px' }}>Frequently Asked Questions</span>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: '800', margin: '8px 0' }}>
            Everything You Need to Know Before Launching
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: '#F8FAFC',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={18} color="#06B6D4" /> : <ChevronDown size={18} color="#94A3B8" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 22px 18px', color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern High-Converting Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#02050A',
        padding: '50px 40px 30px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu size={18} color="#04101A" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>
              VYUHOX
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Autonomous GTM SaaS Platform</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: '#94A3B8' }}>
            <button onClick={onEnterApp} style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: '600' }}>
              Launch App Console →
            </button>
            <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>Features</a>
            <a href="#pricing" style={{ color: '#94A3B8', textDecoration: 'none' }}>Pricing</a>
            <a href="#faq" style={{ color: '#94A3B8', textDecoration: 'none' }}>Compliance & FAQ</a>
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748B',
        }}>
          <div>© 2026 VYUHOX Technologies Inc. All rights reserved. Sub-second carrier telephony, Twilio Trust Hub A2P 10DLC compliant.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>SOC2 Type II Ready</span>
            <span>GDPR Compliant</span>
            <span>Stripe Connect Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
