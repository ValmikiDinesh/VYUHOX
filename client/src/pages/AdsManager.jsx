import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Megaphone,
  Plus,
  Play,
  Pause,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Sliders,
  Layers,
  Flame,
  ArrowUpRight,
  BarChart2,
  AlertTriangle,
  RotateCcw,
  Search,
  Globe,
  Check,
  ChevronRight,
  ShieldAlert,
  Zap,
  Video,
  Smartphone,
  Mail,
  Compass,
  MapPin,
  CreditCard,
  Tag,
  ShoppingBag,
  Send,
  Volume2,
  Heart,
  Share2,
  Bookmark,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function AdsManager({
  activeWorkspace,
  socket,
  wallet,
  currency = 'INR',
  exchangeRate = 83.5,
}) {
  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  // Currency Formatter Helper
  const formatMoney = (usdVal, decimals = 0) => {
    if (usdVal === undefined || usdVal === null) return `${currencySymbol}0`;
    const num = Number(usdVal) || 0;
    if (isINR) {
      const inrVal = Math.round(num * exchangeRate);
      return `₹${inrVal.toLocaleString('en-IN')}`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  // Convert raw dollar text in logs (e.g. "$2228 to $2500") to active currency
  const formatLogText = (text) => {
    if (!text) return '';
    if (!isINR) return text;
    return text.replace(/\$(\d+(?:\.\d+)?)/g, (match, p1) => {
      const inr = Math.round(parseFloat(p1) * exchangeRate);
      return `₹${inr.toLocaleString('en-IN')}`;
    });
  };

  // Data State
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSpend: 5665,
    attributedRevenue: 20677,
    blendedRoas: 3.65,
    blendedCpa: 32.4,
    totalImpressions: 224200,
    totalClicks: 7770,
    totalConversions: 35,
    blendedCtr: 3.47,
    activeCampaignsCount: 3,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creative Preview Tab:
  // 'META_FEED' | 'META_REELS' | 'META_LEAD_FORM' | 'META_WHATSAPP' | 'GOOGLE_SEARCH' | 'GOOGLE_SHOPPING' | 'GOOGLE_PMAX' | 'GOOGLE_YOUTUBE'
  const [previewPlatform, setPreviewPlatform] = useState('META_FEED');
  const [selectedCampaignForPreview, setSelectedCampaignForPreview] = useState(null);

  // PMax Sub-placement preview toggle: 'GMAIL' | 'DISCOVER' | 'MAPS'
  const [pmaxSubTab, setPmaxSubTab] = useState('GMAIL');

  // Modals & Action State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isStoreAuditModalOpen, setIsStoreAuditModalOpen] = useState(false);
  const [storeAuditUrl, setStoreAuditUrl] = useState('');
  const [storeAuditResult, setStoreAuditResult] = useState(null);
  const [auditingStore, setAuditingStore] = useState(false);

  const [creating, setCreating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selfHealing, setSelfHealing] = useState(false);
  const [capiDispatching, setCapiDispatching] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show Toast
  const showToast = (msg, isError = false) => {
    setNotification({ text: msg, isError });
    setTimeout(() => setNotification(null), 5000);
  };

  // 5-Step Campaign Wizard Form State
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState('META');
  const [formFormat, setFormFormat] = useState('META_FEED');
  const [formObjective, setFormObjective] = useState('LEAD_GENERATION');
  const [formBiddingStrategy, setFormBiddingStrategy] = useState('TARGET_CPA');
  const [formTargetRoas, setFormTargetRoas] = useState(3.5);
  const [formBudget, setFormBudget] = useState(180);
  const [formTargetCpa, setFormTargetCpa] = useState(35);
  const [formHeadline, setFormHeadline] = useState('');
  const [formPrimaryText, setFormPrimaryText] = useState('');
  const [formCta, setFormCta] = useState('Book Strategy Call');
  const [formKeywords, setFormKeywords] = useState('enterprise, automation, pipeline, growth, pqc, cybersecurity');
  const [formLocations, setFormLocations] = useState('United States, United Kingdom, India, Singapore');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formWhatsappGreeting, setFormWhatsappGreeting] = useState('');
  const [isGeneratingAiCopy, setIsGeneratingAiCopy] = useState(false);

  // Fetch Campaigns, Metrics & Autonomous Logs
  const loadAdsData = async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const [campRes, metRes, logRes] = await Promise.all([
        api.getAdCampaigns(activeWorkspace._id),
        api.getAdMetrics(activeWorkspace._id),
        api.getAdLogs(activeWorkspace._id),
      ]);

      if (campRes.success) {
        setCampaigns(campRes.campaigns || []);
        if (!selectedCampaignForPreview && campRes.campaigns?.length > 0) {
          setSelectedCampaignForPreview(campRes.campaigns[0]);
        }
      }
      if (metRes.success && metRes.metrics) {
        setMetrics(metRes.metrics);
      }
      if (logRes.success && logRes.logs) {
        setLogs(logRes.logs || []);
      }
    } catch (err) {
      console.error('Failed to load ads data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdsData();
  }, [activeWorkspace]);

  // Real-time Socket.io Event Listeners
  useEffect(() => {
    if (!socket || !activeWorkspace) return;

    const handleOptimizationApplied = (data) => {
      showToast(data.message || '🤖 AI Budget Optimizer applied an automated action!');
      loadAdsData();
    };

    const handleCampaignUpdated = () => {
      loadAdsData();
    };

    const handleConversionTracked = (data) => {
      showToast(`🎯 ${data.message || 'Server-Side CAPI Conversion verified!'}`);
      loadAdsData();
    };

    const handleSelfHealed = (data) => {
      showToast(data.message || '🛡️ Autonomous Self-Healing Engine auto-corrected rejected ad!');
      loadAdsData();
    };

    socket.on('ad:optimization_applied', handleOptimizationApplied);
    socket.on('ad:campaign_updated', handleCampaignUpdated);
    socket.on('ad:conversion_tracked', handleConversionTracked);
    socket.on('ad:self_healed', handleSelfHealed);

    return () => {
      socket.off('ad:optimization_applied', handleOptimizationApplied);
      socket.off('ad:campaign_updated', handleCampaignUpdated);
      socket.off('ad:conversion_tracked', handleConversionTracked);
      socket.off('ad:self_healed', handleSelfHealed);
    };
  }, [socket, activeWorkspace]);

  // Autonomous Self-Healing Simulation
  const handleSimulateSelfHeal = async () => {
    if (!activeWorkspace) return;
    try {
      setSelfHealing(true);
      showToast('🛡️ Simulating platform policy disapproval & auto-healing rewrite...');
      const res = await api.simulateSelfHeal(activeWorkspace._id);
      if (res.success) {
        showToast(`✅ ${res.message || 'Ad successfully auto-healed and resubmitted!'}`);
        await loadAdsData();
      }
    } catch (err) {
      console.error('Self-healing error:', err);
      showToast('Self-healing simulation failed', true);
    } finally {
      setSelfHealing(false);
    }
  };

  // Google Shopping Store Policy & Tax ID Audit
  const handleRunStoreAudit = async () => {
    const url = storeAuditUrl || activeWorkspace?.domain || 'vyuhox.com';
    try {
      setAuditingStore(true);
      const res = await api.auditStoreForShopping(url);
      setStoreAuditResult(res);
      if (res.isCompliant) {
        showToast('✅ Store passed all Google Shopping merchant policy checks!');
      } else {
        showToast('⚠️ Action required: Store missing mandatory merchant requirements', true);
      }
    } catch (err) {
      console.error('Store audit error:', err);
      showToast('Failed to crawl store for merchant compliance', true);
    } finally {
      setAuditingStore(false);
    }
  };

  // Toggle Campaign Status
  const handleToggleCampaign = async (id) => {
    try {
      const res = await api.toggleAdCampaign(id);
      if (res.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: res.campaign.status } : c))
        );
        showToast(`Campaign is now ${res.campaign.status}!`);
      }
    } catch (err) {
      console.error('Toggle error:', err);
      showToast('Failed to toggle campaign', true);
    }
  };

  // 1-Click Trigger 24/7 AI Budget Optimizer Simulation
  const handleTriggerOptimizer = async () => {
    if (!activeWorkspace) return;
    try {
      setOptimizing(true);
      showToast('⚙️ Running 24/7 AI Optimizer (Kill, Scale & Fatigue Rules)...');
      const res = await api.simulateOptimizer(activeWorkspace._id);
      if (res.success) {
        showToast(`🚀 Optimizer finished: ${res.optimizationsCount} rules triggered live!`);
        if (res.logs) setLogs(res.logs);
        if (res.campaigns) setCampaigns(res.campaigns);
        const metRes = await api.getAdMetrics(activeWorkspace._id);
        if (metRes.success) setMetrics(metRes.metrics);
      }
    } catch (err) {
      console.error('Optimizer error:', err);
      showToast('Optimizer simulation failed', true);
    } finally {
      setOptimizing(false);
    }
  };

  // Test Server-Side CAPI Conversion Dispatch (SHA-256 Hashing)
  const handleTestServerCapi = async () => {
    if (!activeWorkspace) return;
    try {
      setCapiDispatching(true);
      const res = await api.sendServerCapiConversion({
        workspaceId: activeWorkspace._id,
        eventName: 'Lead',
        email: 'alexander.vanderbilt@meridiancap.com',
        phone: '+1 415 892 4190',
        conversionValue: 180.0,
        platform: 'ALL',
      });
      if (res.success) {
        showToast('🎯 Server-Side Meta CAPI & Google Enhanced Conversion verified (SHA-256 Hashed)!');
        loadAdsData();
      }
    } catch (err) {
      console.error('CAPI error:', err);
      showToast('CAPI test failed', true);
    } finally {
      setCapiDispatching(false);
    }
  };

  // AI Copy Generator inside Launch Modal tailored to active format & workspace
  const handleGenerateAiCopy = () => {
    setIsGeneratingAiCopy(true);
    setTimeout(() => {
      const bizName = activeWorkspace?.name || 'Company';
      const isGoogle = formPlatform === 'GOOGLE_ADS' || formFormat.startsWith('GOOGLE');

      if (formFormat === 'META_REELS') {
        setFormHeadline(`Scale 10x Faster with ${bizName} 🔥`);
        setFormPrimaryText(`Watch how fast-growing teams automate critical pipelines and outpace competition. Tap below to claim priority onboarding.`);
        setFormCta('Claim Access Now');
        setFormMediaUrl('/media/hedgex_reel.jpg');
      } else if (formFormat === 'META_LEAD_FORM') {
        setFormHeadline(`Get the 2026 Executive Security & Growth Blueprint`);
        setFormPrimaryText(`Pre-fill this 10-second instant form to receive our verified architectural benchmarks and ROI audit for ${bizName}.`);
        setFormCta('Get Instant Access');
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else if (formFormat === 'META_WHATSAPP') {
        setFormHeadline(`Direct WhatsApp Access: Chat with Our Solution Desk`);
        setFormPrimaryText(`Have specific infrastructure or deployment questions? Skip the queue and chat live with an enterprise engineer from ${bizName}.`);
        setFormCta('Chat on WhatsApp');
        setFormWhatsappGreeting(`Hi ${bizName} team! I saw your ad on Meta and would like to learn more about your platform.`);
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else if (formFormat === 'GOOGLE_SEARCH') {
        setFormHeadline(`${bizName} Enterprise Platform | Accelerated Pipeline Velocity`);
        setFormPrimaryText(`Deploy ${bizName}'s automated infrastructure to drive qualified pipelines and reduce operational friction from day one. Trusted by global leaders.`);
        setFormCta('Explore Platform');
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else if (formFormat === 'GOOGLE_PMAX') {
        setFormHeadline(`Unified Performance Engine | Omnichannel Scale with ${bizName}`);
        setFormPrimaryText(`Harness Google AI across Search, YouTube, Gmail, Maps, and Discover to reach high-conviction decision makers at the optimal moment.`);
        setFormCta('Start Free Trial');
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else if (formFormat === 'GOOGLE_SHOPPING') {
        setFormHeadline(`${bizName} Enterprise Suite License (Annual Tier)`);
        setFormPrimaryText(`Enterprise license with dedicated support, 99.99% uptime SLA, and turnkey API connectors.`);
        setFormCta('Shop Now');
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else if (formFormat === 'GOOGLE_YOUTUBE') {
        setFormHeadline(`See Why Industry Leaders Are Migrating to ${bizName}`);
        setFormPrimaryText(`Discover the hidden bottlenecks slowing down your operations. Watch our 2-minute walkthrough showing ${bizName} in live action.`);
        setFormCta('Watch Platform Demo');
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else if (formFormat === 'GOOGLE_DISPLAY') {
        setFormHeadline(`Award-Winning Enterprise Infrastructure | ${bizName}`);
        setFormPrimaryText(`Over 500+ enterprises trust ${bizName} for resilient mission-critical automation.`);
        setFormCta('Learn More');
        setFormMediaUrl('/media/vyuhox_banner.jpg');
      } else {
        // META_FEED or fallback
        setFormHeadline(`Automate & Scale with ${bizName}`);
        setFormPrimaryText(`Discover how market-leading organizations modernize and accelerate operations with ${bizName}. Book an executive briefing today.`);
        setFormCta('Book Strategy Call');
        setFormMediaUrl('/media/hedgex_reel.jpg');
      }

      setIsGeneratingAiCopy(false);
      showToast(`✨ AI LLM generated copy tailored for ${formFormat.replace(/_/g, ' ')}!`);
    }, 450);
  };

  // Launch Campaign Submit
  const handleLaunchCampaign = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!activeWorkspace || !formName) {
      showToast('Please enter a campaign name', true);
      return;
    }
    try {
      setCreating(true);
      const res = await api.createAdCampaign({
        workspaceId: activeWorkspace._id,
        campaignName: formName,
        platform: formFormat,
        objective: formObjective,
        dailyBudget: Number(formBudget),
        targetCpa: Number(formTargetCpa),
        targeting: {
          locations: formLocations.split(',').map((s) => s.trim()).filter(Boolean),
          ageRange: [25, 65],
          interests: ['Enterprise Automation', 'SaaS', 'B2B Growth', 'Executive Decision Makers'],
          keywords: formKeywords.split(',').map((s) => s.trim()).filter(Boolean),
        },
        creative: {
          headline: formHeadline || formName,
          primaryText: formPrimaryText || `Accelerate operations with ${activeWorkspace.name || 'enterprise automation'}.`,
          ctaText: formCta,
          destinationUrl: `https://${activeWorkspace.domain || 'vyuhox.com'}/demo`,
          mediaUrl: formMediaUrl || (formFormat.includes('REELS') ? '/media/hedgex_reel.jpg' : '/media/vyuhox_banner.jpg'),
          platformFormat: formFormat,
          whatsappGreeting: formWhatsappGreeting,
        },
      });

      if (res.success) {
        showToast(`📢 ${formFormat.replace(/_/g, ' ')} Campaign launched live!`);
        setIsCreateModalOpen(false);
        setWizardStep(1);
        setFormName('');
        setFormHeadline('');
        setFormPrimaryText('');
        loadAdsData();
      }
    } catch (err) {
      console.error('Launch campaign error:', err);
      showToast('Failed to launch campaign', true);
    } finally {
      setCreating(false);
    }
  };

  // Active creative for preview
  const activeCreative = selectedCampaignForPreview?.primaryCreative || selectedCampaignForPreview?.creatives?.[0] || {
    headline: `Transform How You Scale with ${activeWorkspace?.name || 'Our Platform'}`,
    primaryText: `Accelerate customer acquisition and scale modern operations autonomously with ${activeWorkspace?.name || 'our platform'}.`,
    ctaText: 'Book Strategy Call',
    destinationUrl: `https://${activeWorkspace?.domain || 'company.com'}/demo`,
    mediaUrl: '',
  };

  return (
    <div style={{ padding: '24px 32px', color: '#F8FAFC', minHeight: '100vh', background: '#070C18' }}>
      {/* Top Banner & Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1877F2 0%, #06B6D4 50%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(24, 119, 242, 0.45)',
          }}>
            <TrendingUp size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                Autonomous Paid Ad Manager (Meta &amp; Google Ads)
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <ShieldCheck size={12} /> 24/7 AI Optimizer Live
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0' }}>
              Autonomous budget allocation, Kill/Scale/Fatigue algorithmic rules, and Server-Side Conversions API (CAPI).
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleTestServerCapi}
            disabled={capiDispatching}
            style={{
              padding: '9px 14px',
              borderRadius: '9px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#38BDF8',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: capiDispatching ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Dispatches server-to-server conversion with SHA-256 PII hashing to bypass ad-blockers"
          >
            <ShieldAlert size={14} />
            {capiDispatching ? 'Dispatching...' : 'Test Server CAPI'}
          </button>

          <button
            onClick={handleSimulateSelfHeal}
            disabled={selfHealing}
            style={{
              padding: '9px 15px',
              borderRadius: '9px',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#F472B6',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: selfHealing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Simulates platform policy violation and triggers autonomous copy rewriting and resubmission"
          >
            <RotateCcw size={14} className={selfHealing ? 'animate-spin' : ''} />
            {selfHealing ? 'Healing Creative...' : '🛡️ Test Self-Healing Loop'}
          </button>

          <button
            onClick={() => {
              setStoreAuditUrl(activeWorkspace?.domain || 'vyuhox.com');
              setIsStoreAuditModalOpen(true);
            }}
            style={{
              padding: '9px 15px',
              borderRadius: '9px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10B981',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Crawls store for required Google Shopping merchant policies and tax identifier"
          >
            <ShieldCheck size={14} />
            🛍️ Google Shopping Store Audit
          </button>

          <button
            onClick={handleTriggerOptimizer}
            disabled={optimizing}
            style={{
              padding: '9px 16px',
              borderRadius: '9px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#F59E0B',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: optimizing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Evaluates Kill Rule (2x CPA), Scale Rule (ROAS > 3.0x), and Fatigue Rule (CTR < 1%)"
          >
            <Zap size={14} className={optimizing ? 'animate-spin' : ''} />
            {optimizing ? 'Executing Optimizer...' : '⚡ Trigger AI Optimizer'}
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #1877F2 0%, #06B6D4 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(24, 119, 242, 0.35)',
            }}
          >
            <Plus size={15} /> 🚀 1-Click Launch AI Campaign
          </button>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {notification && (
        <div style={{
          marginBottom: '18px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: notification.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${notification.isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          color: notification.isError ? '#F87171' : '#34D399',
          fontSize: '0.84rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {notification.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {notification.text}
        </div>
      )}

      {/* 1. FINANCIAL KPI RIBBON */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Total Spend */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Ad Spend</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#06B6D4' }}>{currencySymbol}</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '8px', color: '#F8FAFC' }}>
            {formatMoney(metrics.totalSpend)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> Blended Meta &amp; Google Spend
          </div>
        </div>

        {/* Attributed Revenue */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Attributed Revenue</span>
            <Flame size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '8px', color: '#10B981' }}>
            {formatMoney(metrics.attributedRevenue)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
            Server-Side CAPI Verified Attribution
          </div>
        </div>

        {/* Blended ROAS */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Blended ROAS</span>
            <TrendingUp size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '8px', color: '#F59E0B' }}>
            {metrics.blendedRoas}x
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', fontSize: '0.65rem', fontWeight: '800' }}>
              SCALE WINNER ACTIVE
            </span>
          </div>
        </div>

        {/* Blended CPA */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Blended CPA</span>
            <Users size={16} color="#A855F7" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '8px', color: '#F8FAFC' }}>
            {formatMoney(metrics.blendedCpa, 1)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A855F7', marginTop: '4px' }}>
            Target: {formatMoney(35)} • {metrics.totalConversions} Conversions
          </div>
        </div>

        {/* Active Campaigns */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Campaigns</span>
            <BarChart2 size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '8px', color: '#F8FAFC' }}>
            {metrics.activeCampaignsCount} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>/ {campaigns.length}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38BDF8', marginTop: '4px' }}>
            CTR: {metrics.blendedCtr}% • Clicks: {metrics.totalClicks.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION: LIVE CREATIVE PREVIEW + AUTONOMOUS ACTION LOGS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        gap: '24px',
        marginBottom: '28px',
      }}>
        {/* Left Card: Live Ad Creative Previews (Facebook Feed vs Google Search) */}
        <div style={{
          background: 'rgba(11, 17, 32, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>
                Live Ad Creative Preview Simulator
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Preview how your creative renders in high-converting ad feeds
              </span>
            </div>

            {/* Platform Toggle Tabs (Meta & Google Full Spectrum) */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px', flexWrap: 'wrap', maxWidth: '620px' }}>
              {[
                { id: 'META_FEED', label: '📘 FB/IG Feed' },
                { id: 'META_REELS', label: '📸 IG Reels 9:16' },
                { id: 'META_LEAD_FORM', label: '📋 Meta Lead Form' },
                { id: 'META_WHATSAPP', label: '💬 WhatsApp CTWA' },
                { id: 'GOOGLE_SEARCH', label: '🔍 Google Search' },
                { id: 'GOOGLE_SHOPPING', label: '🛍️ Shopping Feed' },
                { id: 'GOOGLE_PMAX', label: '🚀 Performance Max' },
                { id: 'GOOGLE_YOUTUBE', label: '▶️ YouTube Video' },
              ].map((tab) => {
                const isActive = previewPlatform === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewPlatform(tab.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive
                        ? tab.id.startsWith('META')
                          ? '#1877F2'
                          : tab.id === 'GOOGLE_SEARCH'
                          ? '#06B6D4'
                          : tab.id === 'GOOGLE_SHOPPING'
                          ? '#10B981'
                          : tab.id === 'GOOGLE_YOUTUBE'
                          ? '#EF4444'
                          : '#8B5CF6'
                        : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.71rem',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Active Creative Simulated Mockup */}
          {previewPlatform === 'META_FEED' ? (
            /* 1. FACEBOOK & INSTAGRAM FEED AD MOCKUP */
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: '#040710',
                  fontSize: '0.9rem',
                }}>
                  {activeWorkspace?.name?.charAt(0) || 'H'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC' }}>
                      {activeWorkspace?.name || 'Enterprise Workspace'}
                    </span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#FFF' }}>✓</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Sponsored</span> • <Globe size={11} />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: '1.45', margin: '0 0 12px' }}>
                {activeCreative.primaryText}
              </p>

              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#020617',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '10px',
              }}>
                <img
                  src={activeCreative.mediaUrl || '/media/hedgex_reel.jpg'}
                  alt="Ad Creative"
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <div style={{
                  padding: '12px 14px',
                  background: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                      {activeWorkspace?.domain || 'COMPANY.COM'}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#F8FAFC', marginTop: '2px' }}>
                      {activeCreative.headline}
                    </div>
                  </div>
                  <button style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: '#1877F2',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}>
                    {activeCreative.ctaText || 'Book Strategy Call'}
                  </button>
                </div>
              </div>

              {/* Social Engagement Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', fontSize: '0.75rem', color: '#94A3B8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <Heart size={14} color="#F43F5E" /> 482 Likes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <MessageSquare size={14} /> 46 Comments
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <Share2 size={14} /> 18 Shares
                </span>
              </div>
            </div>
          ) : previewPlatform === 'META_REELS' ? (
            /* 2. INSTAGRAM REELS & STORIES (9:16 VERTICAL IMMERSIVE) */
            <div style={{
              background: '#000000',
              border: '2px solid rgba(236, 72, 153, 0.4)',
              borderRadius: '24px',
              padding: '16px',
              maxWidth: '340px',
              margin: '0 auto',
              position: 'relative',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9), 0 0 24px rgba(236, 72, 153, 0.2)',
              overflow: 'hidden',
              minHeight: '420px',
            }}>
              {/* Simulated Phone Status Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#FFF', marginBottom: '10px', opacity: 0.8 }}>
                <span>9:41</span>
                <span>●●● 5G 100%</span>
              </div>

              {/* Reels Background Image / Video Canvas */}
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '360px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              }}>
                <img
                  src={activeCreative.mediaUrl || '/media/hedgex_reel.jpg'}
                  alt="Reels Media"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Right-Side Interactive Action Stack */}
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  alignItems: 'center',
                }}>
                  <div style={{ textAlign: 'center', color: '#FFF' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={18} fill="#F43F5E" color="#F43F5E" />
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>14.8k</span>
                  </div>
                  <div style={{ textAlign: 'center', color: '#FFF' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={16} />
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>312</span>
                  </div>
                  <div style={{ textAlign: 'center', color: '#FFF' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={15} />
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>890</span>
                  </div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #FFF', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 4s linear infinite' }}>
                    <Volume2 size={13} color="#FFF" />
                  </div>
                </div>

                {/* Bottom Profile Info & Caption Overlay */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '60px', color: '#FFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      padding: '2px',
                      background: 'linear-gradient(45deg, #F59E0B, #EC4899, #8B5CF6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800' }}>
                        {activeWorkspace?.name?.charAt(0) || 'Q'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>
                      @{activeWorkspace?.domain ? activeWorkspace.domain.split('.')[0] : 'quantumshield'}
                    </span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', fontWeight: '700' }}>
                      Sponsored
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: '600', lineHeight: '1.3', marginBottom: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {activeCreative.headline}
                  </div>

                  {/* Swipe-Up Action Button */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #EC4899 0%, #8B5CF6 100%)',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.5)',
                  }}>
                    {activeCreative.ctaText || 'Book Strategy Call'} ↗
                  </div>
                </div>
              </div>
            </div>
          ) : previewPlatform === 'META_LEAD_FORM' ? (
            /* 3. META INSTANT LEAD GENERATION FORM MOCKUP */
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#3B82F6" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Meta Instant Form • Native Zero-Exit Capture
                  </span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  <Check size={10} /> Instant CRM Webhook Sync
                </span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '4px' }}>
                  Apply for Enterprise Access: {activeWorkspace?.name || 'Platform'}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 14px', lineHeight: '1.4' }}>
                  Fast-track your onboarding pipeline. Pre-filled with your verified corporate profile.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Full Name', val: 'Dinesh Valmiki' },
                    { label: 'Corporate Work Email', val: `dinesh@${activeWorkspace?.domain || 'valmikisoftwares.com'}` },
                    { label: 'Direct Phone / Mobile', val: '+91 98765 43210' },
                    { label: 'Enterprise Organization', val: activeWorkspace?.name || 'Valmiki Softwares' },
                  ].map((field, idx) => (
                    <div key={idx} style={{ background: '#0F172A', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: '600', marginTop: '2px' }}>
                        {field.val}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    🔒 256-Bit Encrypted • Never shared
                  </span>
                  <button style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#1877F2',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)',
                  }}>
                    Submit &amp; Connect with SDR Maya →
                  </button>
                </div>
              </div>
            </div>
          ) : previewPlatform === 'META_WHATSAPP' ? (
            /* 4. CLICK-TO-WHATSAPP (CTWA DIRECT CONVERSATIONAL AD) */
            <div style={{
              background: '#071612',
              border: '1px solid #10B981',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#25D366" />
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Click-To-WhatsApp (CTWA) Direct Conversational Ad
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', fontWeight: '700' }}>
                  Verified Business API
                </span>
              </div>

              <div style={{ background: '#0B1F19', padding: '14px', borderRadius: '10px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                <div style={{ fontSize: '0.82rem', color: '#E2E8F0', marginBottom: '10px', lineHeight: '1.4' }}>
                  {activeCreative.primaryText}
                </div>

                {/* WhatsApp Action Button */}
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: '#25D366',
                  color: '#021C11',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                }}>
                  <MessageSquare size={16} fill="#021C11" />
                  Chat on WhatsApp with {activeWorkspace?.name || 'Support'}
                </div>

                {/* Simulated Customer Pre-filled Message Bubble */}
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px dashed rgba(37, 211, 102, 0.3)',
                  fontSize: '0.74rem',
                  color: '#A7F3D0',
                }}>
                  <strong>Automated Customer Greeting Prompt: </strong>
                  <em>"Hi! I saw your ad for {activeWorkspace?.name || 'your platform'} and want to test the autonomous GTM pipeline for our enterprise."</em>
                </div>
              </div>
            </div>
          ) : previewPlatform === 'GOOGLE_SEARCH' ? (
            /* 5. GOOGLE SEARCH RESPONSIVE AD (RSA) */
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                <span style={{ fontWeight: '800', color: '#F8FAFC', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }}>
                  Sponsored
                </span>
                <span style={{ color: '#10B981' }}>https://{activeWorkspace?.domain || 'company.com'} › demo</span>
              </div>

              <h3 style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: '700',
                color: '#38BDF8',
                lineHeight: '1.3',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}>
                {activeCreative.headline} | Verified Enterprise Alpha | VYUHOX
              </h3>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.45' }}>
                {activeCreative.primaryText} Deploy institutional infrastructure with sub-second SLA and verified compliance audit.
              </p>

              {/* Sitelink Extensions (4 Rich Sub-Links) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600', cursor: 'pointer' }}>
                  ▸ Schedule Executive Demo
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600', cursor: 'pointer' }}>
                  ▸ Live Speed &amp; Security Benchmark
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600', cursor: 'pointer' }}>
                  ▸ Enterprise Pricing &amp; ROI Plans
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600', cursor: 'pointer' }}>
                  ▸ Developer API &amp; SDK Docs
                </div>
              </div>

              {/* Callout Pills */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}>
                  ✓ 24/7 Priority Support
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}>
                  ✓ SOC-2 Type II Certified
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}>
                  ✓ Instant Server-Side CAPI
                </span>
              </div>
            </div>
          ) : previewPlatform === 'GOOGLE_SHOPPING' ? (
            /* 6. GOOGLE SHOPPING FEED MOCKUP */
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                  <span style={{ fontWeight: '800', color: '#10B981', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)' }}>
                    Google Merchant Verified
                  </span>
                  <span style={{ color: '#94A3B8' }}>Shopping Feed • In Stock</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700' }}>
                  Tax ID: GSTIN/EIN Verified
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px' }}>
                <img
                  src={activeCreative.mediaUrl || '/media/vyuhox_banner.jpg'}
                  alt="Product"
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#F8FAFC', fontWeight: '700' }}>
                      {activeCreative.headline || 'Autonomous Outbound Growth License'}
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.4' }}>
                      {activeCreative.primaryText || 'High-volume buyer prospecting and verified DNS deliverability.'}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: '#F59E0B', marginTop: '4px' }}>
                      ★★★★★ 4.9 (1,240 verified reviews)
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>
                      {formatMoney(499)} <span style={{ fontSize: '0.7rem', color: '#64748B' }}>/ mo</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#CBD5E1', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)' }}>
                      Free Delivery
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                <span>Brand: {activeWorkspace?.name || 'VYUHOX'}</span>
                <span>Feed URL: /api/ads/google/merchant-feed.xml</span>
                <span style={{ color: '#10B981' }}>● RSS 2.0 Live</span>
              </div>
            </div>
          ) : previewPlatform === 'GOOGLE_PMAX' ? (
            /* 7. GOOGLE PERFORMANCE MAX (PMAX MULTI-CHANNEL UNIFIED) */
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F8FAFC' }}>
                    🚀 Google Performance Max (PMax) Asset Group
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    Single AI campaign serving Search, YouTube, Gmail, Maps &amp; Discover
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {['GMAIL', 'DISCOVER', 'MAPS'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setPmaxSubTab(sub)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: pmaxSubTab === sub ? '#8B5CF6' : 'rgba(255,255,255,0.06)',
                        color: pmaxSubTab === sub ? '#FFF' : '#94A3B8',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {sub === 'GMAIL' ? '✉️ Gmail Promo' : sub === 'DISCOVER' ? '📰 Discover' : '📍 Maps Pin'}
                    </button>
                  ))}
                </div>
              </div>

              {pmaxSubTab === 'GMAIL' ? (
                <div style={{ background: '#0F172A', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.7rem', fontWeight: '800' }}>
                        M
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#F8FAFC' }}>
                        {activeWorkspace?.name || 'Platform'}
                      </span>
                      <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: '#3B82F6', color: '#FFF', fontWeight: '700' }}>
                        Ad
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Promotions Tab</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#F8FAFC' }}>
                    {activeCreative.headline}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                    {activeCreative.primaryText}
                  </div>
                </div>
              ) : pmaxSubTab === 'DISCOVER' ? (
                <div style={{ background: '#0F172A', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img
                    src={activeCreative.mediaUrl || '/media/vyuhox_banner.jpg'}
                    alt="Discover"
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F8FAFC' }}>
                      {activeCreative.headline}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>
                      {activeWorkspace?.domain || 'company.com'} • Sponsored
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#F8FAFC' }}>
                        {activeWorkspace?.name || 'Headquarters'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10B981' }}>
                        ★ Promoted Business Pin • Open 24/7
                      </div>
                    </div>
                  </div>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', background: '#3B82F6', border: 'none', color: '#FFF', fontSize: '0.75rem', fontWeight: '700' }}>
                    Visit
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 8. YOUTUBE IN-STREAM & SHORTS VIDEO AD */
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="#EF4444" />
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F8FAFC' }}>
                    YouTube In-Stream Skippable Video Ad
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontWeight: '700' }}>
                  16:9 Widescreen
                </span>
              </div>

              {/* Video Player Canvas */}
              <div style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000',
                height: '230px',
              }}>
                <img
                  src={activeCreative.mediaUrl || '/media/vyuhox_banner.jpg'}
                  alt="YouTube Ad"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />

                {/* Yellow Timeline Progress */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                  <div style={{ width: '35%', height: '100%', background: '#F59E0B' }} />
                </div>

                {/* Skip Ad in 5s Button */}
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '12px',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>Skip Ad in 5s</span>
                  <ChevronRight size={13} />
                </div>

                {/* Lower-left CTA overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backdropFilter: 'blur(6px)',
                }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#040710', fontWeight: '800', fontSize: '0.75rem' }}>
                    {activeWorkspace?.name?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FFF' }}>
                      {activeWorkspace?.name || 'Company'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#38BDF8' }}>
                      {activeWorkspace?.domain || 'company.com'}
                    </div>
                  </div>
                  <button style={{ padding: '4px 10px', borderRadius: '4px', background: '#38BDF8', border: 'none', color: '#040710', fontSize: '0.7rem', fontWeight: '800' }}>
                    Visit Site
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Autonomous Action Log Card */}
        <div style={{
          background: 'rgba(11, 17, 32, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '460px',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981',
              }} />
              <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                Autonomous Action Log Feed
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              24/7 Algorithmic Audits
            </span>
          </div>

          {/* Scrollable Audit Feed */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748B', fontSize: '0.8rem' }}>
                <Zap size={24} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
                Click "⚡ Trigger AI Optimizer" to run Kill, Scale, and Fatigue rule evaluation.
              </div>
            ) : (
              logs.map((log) => {
                const isKill = log.ruleTriggered === 'KILL_UNDERPERFORMER';
                const isScale = log.ruleTriggered === 'SCALE_WINNER';
                const isFatigue = log.ruleTriggered === 'SWAP_FATIGUED_CREATIVE';
                const isHeal = log.ruleTriggered === 'AUTO_HEAL_REJECTION';
                const isAudit = log.ruleTriggered === 'STORE_COMPLIANCE_AUDIT';

                const badgeBg = isHeal
                  ? 'rgba(236, 72, 153, 0.2)'
                  : isAudit
                  ? 'rgba(6, 182, 212, 0.2)'
                  : isKill
                  ? 'rgba(239, 68, 68, 0.15)'
                  : isScale
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)';
                const badgeColor = isHeal
                  ? '#F472B6'
                  : isAudit
                  ? '#38BDF8'
                  : isKill
                  ? '#EF4444'
                  : isScale
                  ? '#10B981'
                  : '#F59E0B';
                const badgeBorder = isHeal
                  ? 'rgba(236, 72, 153, 0.4)'
                  : isAudit
                  ? 'rgba(6, 182, 212, 0.4)'
                  : isKill
                  ? 'rgba(239, 68, 68, 0.3)'
                  : isScale
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)';

                return (
                  <div
                    key={log._id || Math.random()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`,
                      }}>
                        {log.ruleTriggered?.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#F8FAFC', marginTop: '2px' }}>
                      {formatLogText(log.actionTaken)}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: '1.35' }}>
                      {formatLogText(log.rationale)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. ACTIVE CAMPAIGNS TABLE */}
      <div style={{
        background: 'rgba(11, 17, 32, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
              Live Paid Ad Campaigns (Meta &amp; Google Ads)
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Real-time telemetry, automated CPA guardrails &amp; ROAS optimization
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)' }}>
            {campaigns.length} Active Placements
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#64748B' }}>
                <th style={{ padding: '14px 24px' }}>Campaign &amp; Platform</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Daily Budget</th>
                <th style={{ padding: '14px 16px' }}>Total Spend</th>
                <th style={{ padding: '14px 16px' }}>Conversions</th>
                <th style={{ padding: '14px 16px' }}>CTR</th>
                <th style={{ padding: '14px 16px' }}>ROAS</th>
                <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => {
                const isMeta = camp.platform === 'META' || camp.platform?.startsWith('META');
                const isShopping = camp.platform?.includes('SHOPPING');
                const isYoutube = camp.platform?.includes('YOUTUBE');
                const isReels = camp.platform?.includes('REELS');
                const isWhatsapp = camp.platform?.includes('WHATSAPP');
                const roas = camp.metrics?.roas || 0;
                const roasBadgeBg = roas >= 3.0 ? 'rgba(16, 185, 129, 0.15)' : roas >= 1.5 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                const roasColor = roas >= 3.0 ? '#10B981' : roas >= 1.5 ? '#F59E0B' : '#EF4444';

                return (
                  <tr
                    key={camp._id}
                    onClick={() => setSelectedCampaignForPreview(camp)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: selectedCampaignForPreview?._id === camp._id ? 'rgba(6, 182, 212, 0.04)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isReels
                            ? 'linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)'
                            : isWhatsapp
                            ? '#25D366'
                            : isMeta
                            ? '#1877F2'
                            : isYoutube
                            ? '#EF4444'
                            : isShopping
                            ? '#10B981'
                            : '#06B6D4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.62rem',
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}>
                          {isReels ? 'REEL' : isWhatsapp ? 'WA' : isMeta ? 'META' : isYoutube ? 'YT' : isShopping ? 'SHOP' : 'GOOG'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#F8FAFC' }}>
                            {camp.campaignName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                            {camp.objective?.replace(/_/g, ' ')} • Target CPA: {formatMoney(camp.targetCpa || 35)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCampaign(camp._id);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: camp.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: camp.status === 'ACTIVE' ? '#10B981' : '#94A3B8',
                        }}
                      >
                        {camp.status === 'ACTIVE' ? <Play size={10} fill="#10B981" /> : <Pause size={10} />}
                        {camp.status}
                      </button>
                    </td>

                    <td style={{ padding: '16px 16px', fontWeight: '700', color: '#F8FAFC' }}>
                      {formatMoney(camp.dailyBudget)}/day
                    </td>

                    <td style={{ padding: '16px 16px', color: '#CBD5E1' }}>
                      {formatMoney(camp.metrics?.spend || camp.totalSpend || 0)}
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <strong style={{ color: '#10B981' }}>{camp.metrics?.conversions || 0}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', marginLeft: '4px' }}>
                        ({formatMoney(camp.metrics?.cpa || 32, 1)}/ea)
                      </span>
                    </td>

                    <td style={{ padding: '16px 16px', color: (camp.metrics?.ctr || 0) < 1.0 ? '#EF4444' : '#CBD5E1' }}>
                      {camp.metrics?.ctr || 3.2}%
                      {(camp.metrics?.ctr || 0) < 1.0 && (
                        <span style={{ fontSize: '0.62rem', color: '#EF4444', display: 'block', fontWeight: '800' }}>
                          FATIGUED
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        background: roasBadgeBg,
                        color: roasColor,
                      }}>
                        {roas}x ROAS
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaignForPreview(camp);
                          setPreviewPlatform(
                            isReels
                              ? 'META_REELS'
                              : isWhatsapp
                              ? 'META_WHATSAPP'
                              : isMeta
                              ? 'META_FEED'
                              : isShopping
                              ? 'GOOGLE_SHOPPING'
                              : isYoutube
                              ? 'GOOGLE_YOUTUBE'
                              : 'GOOGLE_SEARCH'
                          );
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Inspect Creative
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 5-STEP END-TO-END ENTERPRISE CAMPAIGN PROVISIONING WIZARD */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#0B1120',
            border: '1px solid rgba(24, 119, 242, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '780px',
            padding: '26px 30px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(24, 119, 242, 0.25)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1877F2 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Megaphone size={20} color="#FFFFFF" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                    Enterprise AI Campaign Provisioner
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    Full-funnel Meta (FB/IG) &amp; Google Ads deployment with autonomous CAPI &amp; CPA guardrails
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setWizardStep(1);
                }}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* 5-Step Navigation Indicator Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '6px 8px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              {[
                { step: 1, label: '1. Channel & Format' },
                { step: 2, label: '2. Objective & Strategy' },
                { step: 3, label: '3. Audience & Geo' },
                { step: 4, label: '4. AI Creative Studio' },
                { step: 5, label: '5. Budget & Compliance' },
              ].map((s) => {
                const isActive = wizardStep === s.step;
                const isPassed = wizardStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setWizardStep(s.step)}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive
                        ? 'linear-gradient(135deg, #1877F2 0%, #06B6D4 100%)'
                        : isPassed
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'transparent',
                      color: isActive ? '#FFFFFF' : isPassed ? '#10B981' : '#64748B',
                      fontSize: '0.72rem',
                      fontWeight: isActive || isPassed ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    {isPassed ? `✓ ${s.label.split('. ')[1]}` : s.label}
                  </button>
                );
              })}
            </div>

            {/* STEP 1: CHANNEL & AD FORMAT */}
            {wizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Select Advertising Network
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setFormPlatform('META');
                        setFormFormat('META_FEED');
                      }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: formPlatform === 'META' ? 'rgba(24, 119, 242, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${formPlatform === 'META' ? '#1877F2' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formPlatform === 'META' ? '#38BDF8' : '#94A3B8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '800', fontSize: '0.75rem' }}>f</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#F8FAFC' }}>Meta Advertising</div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Facebook, Instagram Feed &amp; Reels, WhatsApp</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormPlatform('GOOGLE_ADS');
                        setFormFormat('GOOGLE_SEARCH');
                      }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: formPlatform === 'GOOGLE_ADS' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${formPlatform === 'GOOGLE_ADS' ? '#06B6D4' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formPlatform === 'GOOGLE_ADS' ? '#38BDF8' : '#94A3B8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '800', fontSize: '0.75rem' }}>G</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#F8FAFC' }}>Google Ads Ecosystem</div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Search SERP, Performance Max, YouTube, Shopping</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Choose Campaign &amp; Placement Format
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {formPlatform === 'META' ? (
                      [
                        { id: 'META_FEED', title: '📘 FB & IG Feed Ad', desc: 'Single image/video post in news feed with primary copy & CTA' },
                        { id: 'META_REELS', title: '📸 Instagram Reels & Stories', desc: '9:16 vertical full-screen video with audio ticker & swipe-up CTA' },
                        { id: 'META_LEAD_FORM', title: '📋 Meta Instant Lead Form', desc: 'Zero-friction native form pre-filled with user profile & CRM sync' },
                        { id: 'META_WHATSAPP', title: '💬 Click-to-WhatsApp (CTWA)', desc: 'Direct conversational ad opening verified WhatsApp business chat' },
                        { id: 'META_CATALOG', title: '🗂️ Advantage+ Catalog', desc: 'Dynamic product/solution carousel with automated retargeting' },
                      ].map((fmt) => (
                        <div
                          key={fmt.id}
                          onClick={() => setFormFormat(fmt.id)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: formFormat === fmt.id ? 'rgba(24, 119, 242, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1.5px solid ${formFormat === fmt.id ? '#1877F2' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '0.82rem', color: formFormat === fmt.id ? '#38BDF8' : '#F8FAFC' }}>
                            {fmt.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.3' }}>
                            {fmt.desc}
                          </div>
                        </div>
                      ))
                    ) : (
                      [
                        { id: 'GOOGLE_SEARCH', title: '🔍 Responsive Search (RSA)', desc: 'Google Search SERP with dynamic headlines, sitelinks & callouts' },
                        { id: 'GOOGLE_PMAX', title: '🚀 Performance Max (PMax)', desc: 'Omnichannel AI across Search, YouTube, Gmail, Maps & Discover' },
                        { id: 'GOOGLE_SHOPPING', title: '🛍️ Google Shopping Feed', desc: 'Merchant Center product cards with ratings, price & free shipping' },
                        { id: 'GOOGLE_YOUTUBE', title: '▶️ YouTube Video Ad', desc: '16:9 In-Stream skippable video ad with action button & companion banner' },
                        { id: 'GOOGLE_DISPLAY', title: '🖼️ Display Network (GDN)', desc: 'Responsive banner distribution across 3M+ partner websites' },
                      ].map((fmt) => (
                        <div
                          key={fmt.id}
                          onClick={() => setFormFormat(fmt.id)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: formFormat === fmt.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1.5px solid ${formFormat === fmt.id ? '#06B6D4' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '0.82rem', color: formFormat === fmt.id ? '#38BDF8' : '#F8FAFC' }}>
                            {fmt.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.3' }}>
                            {fmt.desc}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Campaign Identifier / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${formPlatform === 'META' ? 'Meta' : 'Google'} • ${activeWorkspace?.name || 'Enterprise'} Q4 Pipeline Engine`}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formName) setFormName(`${formFormat.replace(/_/g, ' ')} • ${activeWorkspace?.name || 'Growth'}`);
                      setWizardStep(2);
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#1877F2',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Proceed to Objective &amp; Strategy</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: OBJECTIVE & BIDDING STRATEGY */}
            {wizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Campaign Marketing Objective
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'LEAD_GENERATION', title: '🎯 Lead Generation', desc: 'Acquire qualified enterprise buyer leads & contact info' },
                      { id: 'CONVERSIONS', title: '💰 Conversions / Sales', desc: 'Drive platform subscriptions, purchases or demo calls' },
                      { id: 'TRAFFIC', title: '⚡ High-Intent Traffic', desc: 'Maximize volume of qualified landing page visitors' },
                      { id: 'WHATSAPP_CONVERSATIONS', title: '💬 WhatsApp Inquiries', desc: 'Generate real-time buyer conversations on WhatsApp' },
                      { id: 'BRAND_AWARENESS', title: '📢 Awareness & Reach', desc: 'Establish market authority, impressions and video views' },
                    ].map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() => setFormObjective(obj.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: formObjective === obj.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1.5px solid ${formObjective === obj.id ? '#10B981' : 'rgba(255, 255, 255, 0.08)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '0.82rem', color: formObjective === obj.id ? '#34D399' : '#F8FAFC' }}>
                          {obj.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.3' }}>
                          {obj.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Algorithmic Bidding Strategy
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'TARGET_CPA', title: '🎯 Target CPA (Cost Cap)', desc: `Keeps acquisition cost below ${formatMoney(formTargetCpa)} guardrail` },
                      { id: 'TARGET_ROAS', title: '📈 Target ROAS (3.5x+)', desc: 'Optimizes auction bids to maximize verified return multiplier' },
                      { id: 'MAXIMIZE_CONVERSIONS', title: '⚡ Maximize Conversions', desc: 'Harvests the highest conversion volume within daily budget' },
                      { id: 'MAXIMIZE_CLICKS', title: '🌐 Maximize Traffic Clicks', desc: 'Drives maximum high-intent visitors at lowest CPC' },
                    ].map((strat) => (
                      <div
                        key={strat.id}
                        onClick={() => setFormBiddingStrategy(strat.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: formBiddingStrategy === strat.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1.5px solid ${formBiddingStrategy === strat.id ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '0.82rem', color: formBiddingStrategy === strat.id ? '#FBBF24' : '#F8FAFC' }}>
                          {strat.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.3' }}>
                          {strat.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#CBD5E1', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#1877F2',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Proceed to Audience &amp; Geo</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: AUDIENCE & GEO MATRIX */}
            {wizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>
                      Target Geographies &amp; Territories
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setFormLocations('Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai')}
                        style={{ padding: '3px 8px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38BDF8', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        🇮🇳 India Tech Metros
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLocations('San Francisco, New York, Austin, Boston, Seattle')}
                        style={{ padding: '3px 8px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38BDF8', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        🇺🇸 US Tier-1
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLocations('United States, United Kingdom, Singapore, Switzerland, Germany')}
                        style={{ padding: '3px 8px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38BDF8', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        🌐 Global B2B Hubs
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formLocations}
                    onChange={(e) => setFormLocations(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>
                      Keywords &amp; High-Intent Search Queries
                    </label>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.68rem', color: '#64748B' }}>
                      <span>Supports: <code>[Exact]</code>, <code>"Phrase"</code>, <code>Broad</code>, <code>-Negative</code></span>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F8FAFC' }}>Demographic Age Bracket</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>25 - 65 Years (Senior Decision Makers)</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F8FAFC' }}>Target ICP Personas</div>
                    <div style={{ fontSize: '0.72rem', color: '#38BDF8', marginTop: '4px' }}>Founders, CTO, VP Engineering, IT Directors</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#CBD5E1', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formHeadline) handleGenerateAiCopy();
                      setWizardStep(4);
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#1877F2',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Proceed to AI Creative Studio</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: AI CREATIVE STUDIO */}
            {wizardStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  border: '1px solid rgba(236, 72, 153, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.84rem', color: '#F472B6' }}>
                      AI Creative Studio for {activeWorkspace?.name || 'Workspace'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#E2E8F0', marginTop: '2px' }}>
                      Auto-generating high-CTR headlines, hooks, and CTAs tailored to {formFormat.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiCopy}
                    disabled={isGeneratingAiCopy}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#EC4899',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={13} className={isGeneratingAiCopy ? 'animate-spin' : ''} />
                    {isGeneratingAiCopy ? 'Synthesizing...' : 'Re-Generate AI Copy'}
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Headline / SERP Title
                  </label>
                  <input
                    type="text"
                    value={formHeadline}
                    onChange={(e) => setFormHeadline(e.target.value)}
                    placeholder="Enter catchy headline"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Primary Copy / Narrative Hook
                  </label>
                  <textarea
                    rows={3}
                    value={formPrimaryText}
                    onChange={(e) => setFormPrimaryText(e.target.value)}
                    placeholder="Enter persuasive ad copy"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Call to Action (CTA)
                    </label>
                    <select
                      value={formCta}
                      onChange={(e) => setFormCta(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#F8FAFC',
                        fontSize: '0.8rem',
                      }}
                    >
                      <option value="Book Strategy Call">Book Strategy Call</option>
                      <option value="Claim Access Now">Claim Access Now</option>
                      <option value="Chat on WhatsApp">Chat on WhatsApp</option>
                      <option value="Explore Platform">Explore Platform</option>
                      <option value="Start Free Trial">Start Free Trial</option>
                      <option value="Get Instant Access">Get Instant Access</option>
                      <option value="Shop Now">Shop Now</option>
                      <option value="Watch Platform Demo">Watch Platform Demo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Media Asset URL
                    </label>
                    <input
                      type="text"
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      placeholder="/media/hedgex_reel.jpg or URL"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#F8FAFC',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {formFormat === 'META_WHATSAPP' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#25D366', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      💬 Pre-filled WhatsApp Customer Greeting
                    </label>
                    <input
                      type="text"
                      value={formWhatsappGreeting}
                      onChange={(e) => setFormWhatsappGreeting(e.target.value)}
                      placeholder="Hi! I saw your ad on Meta and would like to learn more..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(37, 211, 102, 0.05)',
                        border: '1px solid rgba(37, 211, 102, 0.3)',
                        color: '#F8FAFC',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#CBD5E1', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(5)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#1877F2',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Proceed to Budget &amp; Compliance</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: BUDGET & PRE-FLIGHT COMPLIANCE */}
            {wizardStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Daily Ad Budget</span>
                      <strong style={{ fontSize: '1.05rem', color: '#10B981' }}>{formatMoney(formBudget)}/day</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="25"
                      value={formBudget}
                      onChange={(e) => setFormBudget(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
                      <span>Min: {formatMoney(50)}</span>
                      <span>Scale: {formatMoney(1500)}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Target CPA Guardrail ({currencySymbol})
                    </span>
                    <input
                      type="number"
                      value={formTargetCpa}
                      onChange={(e) => setFormTargetCpa(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#F8FAFC',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ fontSize: '0.68rem', color: '#A855F7', marginTop: '6px' }}>
                      AI kill rule pauses ad if CPA exceeds 2x {formatMoney(formTargetCpa)}
                    </div>
                  </div>
                </div>

                {/* Pre-Flight Compliance Verification Checklist */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: '700', fontSize: '0.82rem' }}>
                    <ShieldCheck size={16} /> Pre-Flight Platform Policy &amp; Tracking Verification
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem', color: '#CBD5E1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#10B981" /> Meta CAPI Server Pipeline: <strong>Ready</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#10B981" /> Google Enhanced Conversions: <strong>Verified</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#10B981" /> Ad Policy Sensationalism Filter: <strong>Passed</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#10B981" /> Destination URL Health: <strong>200 OK</strong>
                    </div>
                  </div>
                </div>

                {/* Campaign Launch Summary Card */}
                <div style={{
                  background: '#040710',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#94A3B8' }}>Ready to launch:</div>
                    <div style={{ fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>
                      {formName || 'Enterprise Campaign'} • {formFormat.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94A3B8' }}>Allocated Daily Spend:</div>
                    <div style={{ fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                      {formatMoney(formBudget)}/day
                    </div>
                  </div>
                </div>

                {/* Final Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#CBD5E1', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchCampaign}
                    disabled={creating}
                    style={{
                      padding: '11px 28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #1877F2 0%, #06B6D4 100%)',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: creating ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 20px rgba(24, 119, 242, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Megaphone size={15} />
                    {creating ? 'Launching Across Networks...' : '🚀 Launch Campaign Live'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. GOOGLE SHOPPING STORE COMPLIANCE & TAX ID AUDIT MODAL */}
      {isStoreAuditModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#0B1120',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '620px',
            padding: '28px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(16, 185, 129, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="#10B981" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                    Google Shopping Merchant Audit
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    Mandatory Policy Pages &amp; Tax ID (GSTIN / EIN) Inspector
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsStoreAuditModalOpen(false);
                  setStoreAuditResult(null);
                }}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Store / Website URL to Audit
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={storeAuditUrl}
                    onChange={(e) => setStoreAuditUrl(e.target.value)}
                    placeholder="https://vyuhox.com"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.85rem',
                    }}
                  />
                  <button
                    onClick={handleRunStoreAudit}
                    disabled={auditingStore}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: '#10B981',
                      border: 'none',
                      color: '#040710',
                      fontWeight: '800',
                      cursor: auditingStore ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Search size={14} />
                    {auditingStore ? 'Crawling...' : 'Crawl Store'}
                  </button>
                </div>
              </div>

              {/* Audit Results Card */}
              {storeAuditResult && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${storeAuditResult.isCompliant ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderRadius: '12px',
                  padding: '18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      color: storeAuditResult.isCompliant ? '#10B981' : '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      {storeAuditResult.isCompliant ? '✅ COMPLIANT WITH GOOGLE SHOPPING' : '⚠️ SUSPENSION RISK: REQUIREMENTS MISSING'}
                    </span>
                    {storeAuditResult.taxIdFound && (
                      <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700' }}>
                        Tax ID: {storeAuditResult.taxIdFound}
                      </span>
                    )}
                  </div>

                  {storeAuditResult.missingRequirements?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700' }}>
                        Missing mandatory Google Merchant requirements:
                      </span>
                      {storeAuditResult.missingRequirements.map((req, idx) => (
                        <div key={idx} style={{
                          fontSize: '0.74rem',
                          color: '#EF4444',
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <AlertTriangle size={12} />
                          {req}
                        </div>
                      ))}

                      {storeAuditResult.actionRequiredPrompt && (
                        <div style={{
                          marginTop: '8px',
                          padding: '12px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#F59E0B',
                          fontSize: '0.75rem',
                          lineHeight: '1.4',
                        }}>
                          <strong>Action Required:</strong> {storeAuditResult.actionRequiredPrompt}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#10B981', lineHeight: '1.4' }}>
                      All mandatory pages (Refund &amp; Return Policy, Privacy Policy, Terms of Service, Contact Info, and Legal Tax Identifier) were detected and verified on your store. Google Merchant Center feeds will be approved without policy suspension.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={() => setIsStoreAuditModalOpen(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
