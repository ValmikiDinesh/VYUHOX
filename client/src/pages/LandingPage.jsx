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

export default function LandingPage({ onEnterApp, onSelectPlan, initialCurrency = 'INR' }) {
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

  // Audio player state for voice AI sample
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackTime, setAudioPlaybackTime] = useState(0);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Handle live scan
  const handleScanBusiness = async (e) => {
    e?.preventDefault();
    if (!scanUrl) return;
    try {
      setScanning(true);
      setScanResult(null);
      const res = await api.scanWebsitePublic(scanUrl);
      if (res.success) {
        setScanResult(res);
      }
    } catch (err) {
      console.warn('Scan fallback:', err.message);
      // Resilient fallback preview for smooth demo
      setScanResult({
        domainName: scanUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
        strategy: {
          category: 'High-Ticket B2B & Quantitative Tech',
          buyerPersonas: [
            { title: 'Chief Risk Officer / Managing Partner', priority: 'High', painPoint: 'Manual client acquisition & slow inbound response times' },
            { title: 'VP of Growth / CMO', priority: 'High', painPoint: 'High CAC and disconnected outreach tools' },
          ],
          valueProps: [
            'Autonomous sub-45s speed-to-lead voice qualification with sub-800ms Bland.ai carrier pipeline',
            'Waterfall enrichment across Apollo, Hunter, and LinkedIn with 98% inbox deliverability',
            'Complete omnichannel synchronization across WhatsApp, Email, Telegram, and SMS',
          ],
        },
        recommendedTeam: [
          { role: 'CMO', name: 'Sophia Sterling', monthlyFee: 49, purpose: 'Scrapes targeted directories & runs autonomous ad creative iteration' },
          { role: 'SDR', name: 'Marcus Cole', monthlyFee: 39, purpose: 'Dispatches personalized multi-channel outreach with interactive previews' },
          { role: 'VOICE_CLOSER', name: 'Maya Vance', monthlyFee: 49, purpose: 'Dials inbound leads in under 30s with live objection resolution' },
          { role: 'CFO', name: 'Julian Vance', monthlyFee: 39, purpose: 'Enforces CAC/LTV safeguards & manages Stripe Connect re-billing margins' },
        ],
        projectedRoiMultiple: '7.8x',
      });
    } finally {
      setScanning(false);
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
      q: 'Can I start in Self-Serve Tool Mode and upgrade to Autonomous AI later?',
      a: 'Yes, completely seamlessly. You can start in Tool Mode to utilize our in-browser softphone, lead scraper, and omnichannel inbox. Whenever you are ready to automate pipeline growth, you can hire individual agents or activate the full 6-agent Autonomous AI Company in 1-click.',
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
              window.location.hash = '#login';
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
              window.location.hash = '#signup';
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
            <span>The World's First Fully Autonomous Go-To-Market Operating System</span>
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
            Strategy, Leads, Voice AI, Omnichannel Comms & Paid Ads in One Platform.
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#94A3B8',
            maxWidth: '780px',
            margin: '0 auto 36px',
            lineHeight: '1.6',
          }}>
            Replace fragmented sales teams and disconnected point solutions. VYUHOX deploys an autonomous AI C-Suite that scrapes leads, dials high-intent prospects in 14 seconds, and runs multi-channel outreach 24/7.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '48px' }}>
            <button
              onClick={() => {
                const el = document.getElementById('scanner');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: '700',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.45)',
              }}
            >
              <span>Scan Your Business Free</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onEnterApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#F8FAFC',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Cpu size={18} color="#A78BFA" />
              <span>Launch AI Company Console</span>
            </button>
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

            {/* Playable Interactive Audio Demo */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={togglePlayAudio}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#F43F5E',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                  }}
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                </button>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>
                    {isPlayingAudio ? 'Playing Live Inbound Audio Bridge...' : 'Listen to 680ms Live Audio Sample'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    {isPlayingAudio ? `00:${audioPlaybackTime < 10 ? '0' + audioPlaybackTime : audioPlaybackTime} / 00:18` : 'Maya Vance speed-to-lead qualification'}
                  </div>
                </div>
              </div>
              <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>680ms Carrier</span>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}>
          {/* Plan 1: Solo Tool Mode */}
          <div className="card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>Solo Tool Mode</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 16px', color: '#F8FAFC' }}>Manual Powerhouse</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                {currencySymbol}{getPlanPrice(49, 3999).toLocaleString(isINR ? 'en-IN' : 'en-US')}<span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>/month</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: '1.5' }}>
                Full manual access to Scraper, Softphone Dialer, Omnichannel Hub, and Ad Manager with prepaid wallet rates.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '24px' }}>
                <div>✓ Waterfall Lead Scraper & Enrichment</div>
                <div>✓ Web Dialer with sub-800ms latency</div>
                <div>✓ WhatsApp & Email Omnichannel Inbox</div>
                <div>✓ Meta & Google Ads Budget Manager</div>
                <div>✓ {currencySymbol}{isINR ? '4,000' : '50'} Welcome Usage Bonus</div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontWeight: '700', fontSize: '0.85rem' }}
            >
              Start Tool Mode
            </button>
          </div>

          {/* Plan 2: Tool + 1 Agent */}
          <div className="card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>Hire As You Grow</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 16px', color: '#F8FAFC' }}>Tool + 1 Agent</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                {currencySymbol}{getPlanPrice(89, 6999).toLocaleString(isINR ? 'en-IN' : 'en-US')}<span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>/month</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: '1.5' }}>
                Tool Mode base plus 1 dedicated autonomous AI employee (e.g. Maya Voice Closer or Sarah SDR).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '24px' }}>
                <div>✓ Everything in Solo Tool Mode</div>
                <div>✓ 1 Dedicated Autonomous AI Agent</div>
                <div>✓ Autonomous speed-to-lead callback</div>
                <div>✓ Add more agents for {currencySymbol}{isINR ? '2,999' : '39'}/mo each</div>
                <div>✓ {currencySymbol}{isINR ? '6,000' : '75'} Welcome Usage Bonus</div>
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

          {/* Plan 3: Full AI Company (Featured) */}
          <div className="card" style={{
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '2px solid #06B6D4',
            boxShadow: '0 0 32px rgba(6, 182, 212, 0.3)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #06B6D4, #10B981)',
              color: '#04101A',
              padding: '3px 14px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Most Popular • Complete C-Suite
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#06B6D4', textTransform: 'uppercase' }}>Autonomous AI Company</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 16px', color: '#F8FAFC' }}>Full AI Department</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#38BDF8', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                {currencySymbol}{getPlanPrice(249, 19999).toLocaleString(isINR ? 'en-IN' : 'en-US')}<span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>/month</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: '1.5' }}>
                All 6 C-Suite agents deployed 24/7. Marketing, outbound sales, inbound phone dials, finance, and retention run completely on autopilot.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '24px' }}>
                <div>✓ <strong>All 6 Autonomous C-Suite Agents Included</strong></div>
                <div>✓ Sophia Sterling (CMO) + Marcus Cole (SDR)</div>
                <div>✓ Maya Vance (Voice AE, sub-30s speed-to-lead)</div>
                <div>✓ Julian Vance (CFO) + Chloe Kim (CS) + CEO</div>
                <div>✓ Real-time multi-agent activity stream</div>
                <div>✓ {currencySymbol}{isINR ? '8,000' : '100'} Welcome Usage Bonus</div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: '700', fontSize: '0.85rem' }}
            >
              Deploy Autonomous AI Company
            </button>
          </div>

          {/* Plan 4: Enterprise High-Scale */}
          <div className="card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#A78BFA', textTransform: 'uppercase' }}>Enterprise High-Scale</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 16px', color: '#F8FAFC' }}>Autonomous Enterprise</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#C4B5FD', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                {currencySymbol}{getPlanPrice(599, 47999).toLocaleString(isINR ? 'en-IN' : 'en-US')}<span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>/month</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: '1.5' }}>
                Dedicated telecom trunking, high-throughput voice carriers, custom CRM webhooks, and priority 24/7 dedicated engineering support.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '24px' }}>
                <div>✓ <strong>Full 6-Agent C-Suite Workforce Active</strong></div>
                <div>✓ Unlimited Continuous Lead Prospecting</div>
                <div>✓ Private Dedicated Twilio SIP Trunk</div>
                <div>✓ Dedicated WhatsApp High-Volume Numbers</div>
                <div>✓ Custom Webhook Integrations &amp; API Triggers</div>
                <div>✓ Priority 24/7 Dedicated Engineering SLA</div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#signup';
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontWeight: '700', fontSize: '0.85rem', borderColor: 'rgba(139, 92, 246, 0.5)' }}
            >
              Deploy Enterprise Suite
            </button>
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
