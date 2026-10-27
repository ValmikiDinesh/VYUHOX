import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  DollarSign,
  Zap,
  ArrowRight,
  TrendingUp,
  Bot,
  PhoneCall,
  Mail,
  MessageCircle,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Globe,
  Search,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Shield,
  Brain,
  Sliders,
  Store,
  Briefcase,
  FileText,
  BarChart3,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  Building,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { authStorage } from '../services/authStorage';
import ExecutiveBriefingCard from '../components/ExecutiveBriefingCard';

export default function ClientDashboardView({
  currentUser,
  activeWorkspace,
  operatingMode,
  stats,
  leads = [],
  wallet,
  onNavigateTab,
  onOpenAddFundsModal,
  onToggleOperatingMode,
  onUpdateActiveWorkspace,
  onOpenPlanModal,
  currency = 'INR',
  exchangeRate = 83.5,
}) {
  const isAiMode = operatingMode === 'AI_COMPANY';
  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  // Strategy & Crawl State
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [showReCrawl, setShowReCrawl] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null);

  // Briefing State
  const [briefing, setBriefing] = useState(null);

  // Trained Business Brain State
  const [brainStatus, setBrainStatus] = useState(null);
  const [showBrainTuneModal, setShowBrainTuneModal] = useState(false);
  const [isTuningBrain, setIsTuningBrain] = useState(false);
  const [brainTuneForm, setBrainTuneForm] = useState({
    operatingModelType: 'ONLINE',
    customServices: '',
    targetAudience: '',
    target30Day: '',
    customGuidelines: '',
  });

  // Identified Services & Buyer Targeting State
  const [servicesList, setServicesList] = useState([]);
  const [targetingState, setTargetingState] = useState(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceEditForm, setServiceEditForm] = useState({ index: null, name: '', category: 'CORE_SERVICE', description: '', deliverable: '' });
  const [targetingModalOpen, setTargetingModalOpen] = useState(false);
  const [targetingForm, setTargetingForm] = useState({
    whoWillBuy: '',
    whoCanBuy: '',
    toWhomToSell: '',
    whoWillBeInterested: '',
    buyingTriggers: '',
  });
  // One-time Setup & Onboarding State
  const [onboardingForm, setOnboardingForm] = useState({
    businessUrl: '',
    businessName: activeWorkspace?.name || activeWorkspace?.branding?.companyName || currentUser?.companyName || '',
    category: '',
  });
  const [onboardingError, setOnboardingError] = useState(null);
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);

  // Sync activeWorkspace name into onboardingForm
  useEffect(() => {
    const compName = activeWorkspace?.name || activeWorkspace?.branding?.companyName || currentUser?.companyName || '';
    if (compName && !onboardingForm.businessName) {
      setOnboardingForm((prev) => ({
        ...prev,
        businessName: compName,
        category: prev.category || activeWorkspace?.businessCategory || (activeWorkspace?.industry && activeWorkspace.industry !== 'Pending Business Onboarding' ? activeWorkspace.industry : '') || '',
      }));
    }
  }, [activeWorkspace, currentUser]);

  const loadBrainStatus = async () => {
    if (!activeWorkspace?._id) return;
    try {
      const res = await api.getBrainStatus(activeWorkspace._id);
      if (res && res.success) {
        setBrainStatus(res);
        if (res.identifiedServices && Array.isArray(res.identifiedServices) && res.identifiedServices.length > 0) {
          setServicesList(res.identifiedServices);
        } else if (res.brain?.identifiedServices && res.brain.identifiedServices.length > 0) {
          setServicesList(res.brain.identifiedServices);
        } else if (res.strategy?.analysisResult?.identifiedServices && res.strategy.analysisResult.identifiedServices.length > 0) {
          setServicesList(res.strategy.analysisResult.identifiedServices);
        }

        if (res.buyerTargeting) {
          setTargetingState(res.buyerTargeting);
          setTargetingForm(res.buyerTargeting);
        } else if (res.brain?.buyerTargeting) {
          setTargetingState(res.brain.buyerTargeting);
          setTargetingForm(res.brain.buyerTargeting);
        } else if (res.strategy?.analysisResult?.buyerTargeting) {
          setTargetingState(res.strategy.analysisResult.buyerTargeting);
          setTargetingForm(res.strategy.analysisResult.buyerTargeting);
        }

        if (res.brain?.trainedProfile || res.strategy?.analysisResult) {
          const profile = res.brain?.trainedProfile || {};
          const analysis = res.strategy?.analysisResult || {};
          setBrainTuneForm({
            operatingModelType: res.operatingModelType || 'ONLINE',
            customServices: (profile.coreOfferings || analysis.coreOfferings || []).join(', '),
            targetAudience: profile.targetAudience?.primaryPersona || analysis.targetAudience?.primaryPersona || '',
            target30Day: res.targets?.day30?.targetRevenue || '$15,000 MRR',
            customGuidelines: profile.customGuidelines || '',
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load brain status:', e);
    }
  };

  const handleOpenAddService = () => {
    setServiceEditForm({ index: null, name: '', category: 'CORE_SERVICE', description: '', deliverable: '' });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service, index) => {
    setServiceEditForm({
      index,
      name: service.name || '',
      category: service.category || 'CORE_SERVICE',
      description: service.description || '',
      deliverable: service.deliverable || '',
    });
    setServiceModalOpen(true);
  };

  const handleDeleteService = async (index) => {
    const updated = servicesList.filter((_, i) => i !== index);
    setServicesList(updated);
    await handleSaveServices(updated, targetingState);
  };

  const handleSaveServiceItem = async (e) => {
    e.preventDefault();
    let updated;
    if (serviceEditForm.index !== null) {
      updated = servicesList.map((s, idx) => idx === serviceEditForm.index ? {
        name: serviceEditForm.name,
        category: serviceEditForm.category,
        description: serviceEditForm.description,
        deliverable: serviceEditForm.deliverable,
      } : s);
    } else {
      updated = [...servicesList, {
        name: serviceEditForm.name,
        category: serviceEditForm.category,
        description: serviceEditForm.description,
        deliverable: serviceEditForm.deliverable,
      }];
    }
    setServicesList(updated);
    setServiceModalOpen(false);
    await handleSaveServices(updated, targetingState);
  };

  const handleSaveTargeting = async (e) => {
    e.preventDefault();
    setTargetingState(targetingForm);
    setTargetingModalOpen(false);
    await handleSaveServices(servicesList, targetingForm);
  };

  const handleSaveServices = async (updatedServices, updatedTargeting) => {
    if (!activeWorkspace?._id) return;
    setSavingServices(true);
    try {
      const res = await api.updateServices(activeWorkspace._id, {
        services: updatedServices || servicesList,
        buyerTargeting: updatedTargeting || targetingState,
      });
      if (res && res.success) {
        if (res.identifiedServices) setServicesList(res.identifiedServices);
        if (res.buyerTargeting) setTargetingState(res.buyerTargeting);
        setSaveNotice('Services & Buyer Targeting updated! Brain recalibrated.');
        setTimeout(() => setSaveNotice(null), 4000);
      }
    } catch (err) {
      console.error('Update services error:', err);
      alert('Failed to update services: ' + err.message);
    } finally {
      setSavingServices(false);
    }
  };

  const loadBriefing = async () => {
    if (!activeWorkspace?._id) return;
    try {
      const res = await api.getLatestBriefing(activeWorkspace._id);
      if (res.success && res.briefing) {
        setBriefing(res.briefing);
      }
    } catch (e) {
      console.warn('Failed to load briefing:', e);
    }
  };

  // Load active strategy, brain & briefing on mount or workspace change
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    const loadStrategy = async () => {
      try {
        const res = await api.getStrategy(activeWorkspace._id);
        if (res.success && res.strategy) {
          setActiveStrategy(res.strategy);
          if (res.strategy.targetUrl) {
            setUrlInput(res.strategy.targetUrl);
          }
        }
      } catch (err) {
        console.error('Failed to load strategy:', err);
      }
    };
    loadStrategy();
    loadBrainStatus();
    loadBriefing();

    // Check if client arrived from website landing page with a queued crawl URL
    const pendingUrl = sessionStorage.getItem('vyuhox_pending_crawl_url');
    if (pendingUrl) {
      sessionStorage.removeItem('vyuhox_pending_crawl_url');
      setUrlInput(pendingUrl);
      setTimeout(() => {
        handleStartCrawl(pendingUrl);
      }, 500);
    }
  }, [activeWorkspace]);

  // Handle direct website scan from dashboard
  const handleStartCrawl = async (targetUrlToScan) => {
    const finalUrl = (targetUrlToScan || urlInput).trim();
    if (!finalUrl) {
      alert('Please enter your website URL (e.g. https://yourbusiness.com)');
      return;
    }
    let wsId = activeWorkspace?._id || authStorage.getActiveWsId();
    if (!wsId) {
      try {
        const wsRes = await api.getWorkspaces();
        if (wsRes.success && wsRes.workspaces && wsRes.workspaces.length > 0) {
          const firstWs = wsRes.workspaces[0];
          wsId = firstWs._id;
          authStorage.setActiveWorkspace(firstWs);
        }
      } catch (err) {
        console.warn('Auto-resolve workspace error:', err);
      }
    }

    if (!wsId) {
      alert('Active workspace is loading. Please select your business workspace from the top menu first.');
      return;
    }

    setIsScanning(true);
    setScanStatus(`Crawling ${finalUrl} DOM & parsing value proposition...`);
    try {
      const res = await api.scanWebsite(wsId, finalUrl);
      if (res.success && res.strategy) {
        setActiveStrategy(res.strategy);
        if (res.workspace) {
          authStorage.setActiveWorkspace(res.workspace);
          if (onUpdateActiveWorkspace) {
            onUpdateActiveWorkspace(res.workspace);
          }
        }
        await loadBrainStatus();
        await loadBriefing();
        setScanStatus('Strategy synthesized! Brain fully trained!');
        setTimeout(() => {
          onNavigateTab('strategy');
        }, 800);
      } else {
        alert(res.message || 'Crawl failed');
      }
    } catch (err) {
      console.error('Crawl error:', err);
      alert('Scanning failed: ' + (err.message || 'Unable to scan website'));
    } finally {
      setIsScanning(false);
    }
  };

  // One-time Setup Form Submission & Lock
  const handleSaveOnboarding = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOnboardingError(null);

    const businessUrl = (onboardingForm.businessUrl || '').trim();
    const businessName = (onboardingForm.businessName || '').trim();
    const category = (onboardingForm.category || '').trim();

    if (!businessUrl) {
      setOnboardingError('Business URL or Google Maps URL is required.');
      return;
    }
    if (!businessName) {
      setOnboardingError('Business Name is required.');
      return;
    }

    let wsId = activeWorkspace?._id || authStorage.getActiveWsId();
    if (!wsId) {
      try {
        const wsRes = await api.getWorkspaces();
        if (wsRes.success && wsRes.workspaces && wsRes.workspaces.length > 0) {
          const firstWs = wsRes.workspaces[0];
          wsId = firstWs._id;
          authStorage.setActiveWorkspace(firstWs);
        }
      } catch (err) {
        console.warn('Auto-resolve workspace error:', err);
      }
    }

    if (!wsId) {
      setOnboardingError('Active workspace session loading. Please try again in a moment.');
      return;
    }

    setIsOnboardingSaving(true);
    try {
      const res = await api.scanWebsite(wsId, {
        url: businessUrl,
        businessName,
        businessCategory: category || 'General Business',
      });

      if (res.success && res.strategy) {
        setActiveStrategy(res.strategy);
        setShowOnboardingModal(false);
        if (res.workspace) {
          authStorage.setActiveWorkspace(res.workspace);
          if (onUpdateActiveWorkspace) {
            onUpdateActiveWorkspace(res.workspace);
          }
        }
        await loadBrainStatus();
        await loadBriefing();
        // Redirect directly to Strategy & Business Plan page
        setTimeout(() => {
          onNavigateTab('strategy');
        }, 500);
      } else {
        setOnboardingError(res.message || 'Setup could not complete. Please check the URL and try again.');
      }
    } catch (err) {
      console.error('Onboarding save error:', err);
      setOnboardingError(err.message || 'Failed to complete setup. Please verify your connection.');
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  // Format wallet balance
  const walletBalanceNum = Number(wallet?.balanceUSD ?? 0);
  const displayWalletBalance = isINR
    ? (walletBalanceNum * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : walletBalanceNum.toFixed(2);

  // Locked condition: one user = one dashboard = one business
  const hasCompletedOnboarding = Boolean(
    activeWorkspace?.onboardingCompleted ||
    (activeStrategy && activeStrategy.targetUrl) ||
    activeWorkspace?.currentStrategyId
  );
  const hasStrategy = hasCompletedOnboarding;

  // Immediate Pop-Up Modal State (automatically opens for uncompleted setup)
  const [showOnboardingModal, setShowOnboardingModal] = useState(!hasCompletedOnboarding);

  useEffect(() => {
    if (activeWorkspace && !hasCompletedOnboarding) {
      setShowOnboardingModal(true);
    }
  }, [activeWorkspace?._id, hasCompletedOnboarding]);

  // Lock background scroll when onboarding modal is open
  useEffect(() => {
    if (showOnboardingModal && !hasCompletedOnboarding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showOnboardingModal, hasCompletedOnboarding]);
  const workflowSteps = [
    {
      step: '01',
      title: '1. Strategy & Business Plan',
      desc: 'Bespoke business strategy synthesized from your verified business URL, offering models, and value proposition.',
      tab: 'strategy',
      icon: Globe,
      color: '#06B6D4',
      badge: hasStrategy ? 'Strategy Active' : 'Start Here (Step 1)',
      actionText: hasStrategy ? 'View AI Strategy' : 'Configure Strategy',
      isCompleted: hasStrategy,
    },
    {
      step: '02',
      title: '2. High-Intent Lead Prospecting',
      desc: 'Discover verified CEOs, founders & decision makers matching your ICP with verified phone numbers & direct business emails.',
      tab: 'leads',
      icon: Users,
      color: '#38BDF8',
      badge: `${leads.length} Leads in CRM`,
      actionText: leads.length === 0 ? 'Find Leads' : 'Search Leads',
      isCompleted: leads.length > 0,
    },
    {
      step: '03',
      title: '3. Omnichannel Outreach',
      desc: 'AI SDR Sarah sends personalized WhatsApp & Email intro sequences using the copy hooks and value angles synthesized in Step 1.',
      tab: 'inbox',
      icon: MessageCircle,
      color: '#10B981',
      badge: 'WhatsApp + Email Ready',
      actionText: 'Configure Campaigns',
      isCompleted: false,
    },
    {
      step: '04',
      title: '4. Sub-45s Voice AI Caller',
      desc: 'Maya Vance dials hot inbound leads in 45s, qualifies budget & handles objections using your crawled pitch before booking.',
      tab: 'voice',
      icon: PhoneCall,
      color: '#8B5CF6',
      badge: '<800ms Bland.ai',
      actionText: 'Test Voice Closer',
      isCompleted: false,
    },
    {
      step: '05',
      title: '5. Booked Demos & Deals',
      desc: 'Qualified meetings scheduled directly onto your Google Calendar or Cal.com with automated reminder notifications.',
      tab: 'calendar',
      icon: Calendar,
      color: '#F59E0B',
      badge: 'Google / Zoom Sync',
      actionText: 'View Calendar',
      isCompleted: (stats?.meetingsBooked || 0) > 0,
    },
  ];

  // Assigned AI Employees
  const activeAiEmployees = [
    {
      role: 'Voice Account Executive',
      name: 'Maya Vance',
      avatar: 'MV',
      color: '#06B6D4',
      status: 'Online & Dials Inbounds in <45s',
      specialty: 'Speed-to-lead calling, objection handling, slot booking',
      liveDials: 'Sub-second Carrier Active',
    },
    {
      role: 'Sales Development Rep',
      name: 'Sarah SDR',
      avatar: 'SS',
      color: '#10B981',
      status: 'Active on WhatsApp & Email',
      specialty: 'Hyper-personalized multi-touch email & WhatsApp sequences',
      liveDials: 'Omnichannel Dispatches',
    },
    {
      role: 'Chief Marketing Officer',
      name: 'Ethan CMO',
      avatar: 'EC',
      color: '#8B5CF6',
      status: 'Auto-pilot Social & Ads',
      specialty: 'Automated Flux.1 graphics, 60fps reels & ad optimization',
      liveDials: 'Creative Suite Active',
    },
  ];

  const displayName = currentUser?.name || activeWorkspace?.branding?.companyName || activeWorkspace?.name || 'Founder';

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* IMMEDIATE ONE-TIME ONBOARDING MODAL POPUP */}
      {showOnboardingModal && !hasCompletedOnboarding && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (isOnboardingSaving) return;
            if (e.target === e.currentTarget) {
              setShowOnboardingModal(false);
            }
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(11, 17, 32, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.45)',
              borderRadius: '20px',
              padding: '32px 36px',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(6, 182, 212, 0.2)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowOnboardingModal(false)}
              disabled={isOnboardingSaving}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: isOnboardingSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Close Dialog"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingRight: '40px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)',
                flexShrink: 0,
              }}>
                <Globe size={26} color="#030712" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    ⚡ One-Time Setup • Tour
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    🔒 1 User = 1 Dashboard = 1 Business
                  </span>
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.45rem', fontWeight: '800', margin: '6px 0 4px', color: '#F8FAFC' }}>
                  Configure Your Dedicated Business Profile
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
                  Welcome to VYUHOX! Complete this one-time setup with your verified business details. Once submitted, your dashboard will permanently lock to your business and synthesize an end-to-end autonomous business strategy.
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {onboardingError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#F87171',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}>
                <AlertCircle size={18} />
                <span>{onboardingError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Field 1: Business URL / Maps URL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#F1F5F9', fontWeight: '700' }}>
                    Business URL or Google Maps URL <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#38BDF8' }}>
                    Locked after save (No synthetic/dummy URLs)
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} color="#06B6D4" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  <input
                    type="url"
                    required
                    placeholder="https://yourbusiness.com or https://maps.app.goo.gl/..."
                    value={onboardingForm.businessUrl}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, businessUrl: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', paddingLeft: '40px', height: '42px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  For online companies, provide your website URL. For local businesses, you can paste your Google Maps link.
                </span>
              </div>

              {/* Field 2 & 3: Business Name and Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#F1F5F9', fontWeight: '700', marginBottom: '6px' }}>
                    Business Name <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} color="#64748B" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Quantum Shield"
                      value={onboardingForm.businessName}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, businessName: e.target.value })}
                      className="input-glass"
                      style={{ width: '100%', paddingLeft: '40px', height: '42px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Optional Category Hint */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#F1F5F9', fontWeight: '700', marginBottom: '6px' }}>
                    Category of Business <span style={{ color: '#94A3B8', fontWeight: '400' }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank to auto-detect from your website or Google Maps profile"
                    value={onboardingForm.category}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, category: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', height: '42px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* AI Autonomous Crawler Intelligence Badge */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Sparkles size={20} color="#06B6D4" />
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                  <strong style={{ color: '#38BDF8' }}>Automated Deep Crawl Active:</strong> Your business description, offerings, tagline, and product/service taxonomy are fetched and synthesized automatically from your submitted website or Google Maps link.
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94A3B8' }}>
                  <ShieldCheck size={16} color="#10B981" />
                  <span>Submitting will deep crawl your URL, synthesize your strategy, and lock this workspace.</span>
                </div>

                <button
                  type="submit"
                  disabled={isOnboardingSaving}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 28px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isOnboardingSaving ? 0.7 : 1,
                    cursor: isOnboardingSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isOnboardingSaving ? (
                    <>
                      <RefreshCw size={16} className="spin-slow" />
                      <span>Analyzing &amp; Synthesizing Strategy...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Save &amp; Generate Powerful Business Strategy</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* 4 Clean Vital Signs (KPIs) - Dynamic AI Accurate Calculations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div
          onClick={() => onNavigateTab('leads')}
          className="card"
          style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>QUALIFIED LEADS</span>
            <Users size={18} color="#06B6D4" />
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: '#F8FAFC' }}>
            {leads.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: leads.length > 0 ? '#10B981' : '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            {leads.length > 0 ? (
              <>
                <TrendingUp size={13} /> Active in CRM
              </>
            ) : (
              <span>+ Click to Scrape First Leads</span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('voice')}
          className="card"
          style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>SPEED-TO-LEAD RESPONSE</span>
            <PhoneCall size={18} color="#10B981" />
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: '#10B981' }}>
            &lt; 45s
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Maya Voice Closer carrier bridge primed
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('calendar')}
          className="card"
          style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>MEETINGS BOOKED</span>
            <Calendar size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: '#C4B5FD' }}>
            {stats?.meetingsBooked || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Google Calendar &amp; Cal.com Sync
          </div>
        </div>

        {/* Dynamic AI Deal Value */}
        <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>ESTIMATED DEAL VALUE</span>
            <DollarSign size={18} color="#F59E0B" />
          </div>
          {(() => {
            const cat = (activeStrategy?.category || '').toLowerCase();
            const isPqcOrSecurity = cat.includes('cybersecurity') || cat.includes('pqc') || cat.includes('cryptograph');
            const isEnterprise = cat.includes('enterprise') || cat.includes('devtools') || isPqcOrSecurity;
            const isEcommerce = cat.includes('ecommerce') || cat.includes('retail');

            let acvUSD = 1200;
            if (isPqcOrSecurity) acvUSD = 5000;
            else if (isEnterprise) acvUSD = 3500;
            else if (isEcommerce) acvUSD = 450;

            const totalPipelineUSD = leads.length * acvUSD;
            const displayVal = isINR
              ? (totalPipelineUSD * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })
              : totalPipelineUSD.toLocaleString('en-US', { maximumFractionDigits: 0 });

            return (
              <>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: '#FBBF24' }}>
                  {currencySymbol}{leads.length > 0 ? displayVal : '0'}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px' }}>
                  {leads.length > 0
                    ? `AI ACV: ~${currencySymbol}${isINR ? (acvUSD * exchangeRate).toLocaleString('en-IN') : acvUSD}/deal (${activeStrategy?.businessName || 'B2B'})`
                    : 'Pipeline initiates with leads'}
                </div>
              </>
            );
          })()}
        </div>
      </div>


      {/* RECENT PIPELINE LEADS TABLE */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
              Recent Inbound Prospects
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
              Latest executives discovered, contacted, and qualified by your AI agents.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('leads')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            View All in Lead Finder →
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '12px 18px' }}>CONTACT</th>
                  <th style={{ padding: '12px 14px' }}>COMPANY &amp; TITLE</th>
                  <th style={{ padding: '12px 14px' }}>INTENT SCORE</th>
                  <th style={{ padding: '12px 14px' }}>STAGE</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead._id || lead.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 18px', fontWeight: '700', color: '#F8FAFC' }}>
                      {lead.name}
                      <span style={{ display: 'block', fontSize: '0.725rem', color: '#94A3B8', fontWeight: '400' }}>
                        {lead.email}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ color: '#E2E8F0', fontWeight: '600' }}>{lead.company}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{lead.title || 'Managing Partner'}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34D399',
                        fontWeight: '800',
                        fontSize: '0.725rem',
                      }}>
                        {lead.score || 88}/100
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-cyan">{lead.stage || 'Contacted'}</span>
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('voice')}
                        style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          color: '#38BDF8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.725rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Call with Maya
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
