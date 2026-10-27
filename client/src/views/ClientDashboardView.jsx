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


      {/* VYUHOX TRAINED BUSINESS BRAIN INTELLIGENCE & EXECUTION HUB */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            }}>
              <Brain size={26} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="live-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '0.725rem', fontWeight: '800', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  VYUHOX Multi-Intelligence Master Brain: Supplying Bespoke Intelligence
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.675rem' }}>
                  {brainStatus?.category || activeStrategy?.category || 'B2B Enterprise SaaS'}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                  Model: {brainStatus?.operatingModelType === 'OFFLINE' ? '🏢 Local Offline Store' : brainStatus?.operatingModelType === 'HYBRID' ? '🌐 Hybrid (Store + Digital)' : brainStatus?.operatingModelType === 'B2B_SERVICES' ? '🤝 B2B Professional Services' : '💻 Online Digital / SaaS'}
                </span>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: '800', margin: '4px 0 0', color: '#F8FAFC' }}>
                {activeStrategy?.businessName || activeWorkspace?.name || 'Your Enterprise'} Business Brain
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowBrainTuneModal(true)}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sliders size={14} color="#38BDF8" />
              <span>Tune / Retrain AI Brain</span>
            </button>
            <button
              onClick={() => onNavigateTab('strategy')}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Full Strategy Hub</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Noise-Free Assurance Banner: Proves unwanted models were purged by VYUHOX */}
        {brainStatus?.filteredNoiseList && brainStatus.filteredNoiseList.length > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#34D399',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span><strong>VYUHOX Tailored Intelligence:</strong> Client brain contains strictly your business operations.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', fontSize: '0.72rem' }}>
              <span style={{ color: '#F59E0B', fontWeight: '700' }}>⚡ Unwanted Clutter Filtered Out:</span>
              <span>{brainStatus.filteredNoiseList.slice(0, 2).map(n => n.replace('(Suppressed)', '').trim()).join(' • ')}</span>
            </div>
          </div>
        )}

        {/* 4-Pillar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {/* Pillar 1: Offerings & ICP */}
          <div style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={16} color="#06B6D4" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>
                Trained Services &amp; Target ICP
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#E2E8F0', marginBottom: '6px' }}>
              <strong>Target Persona:</strong> {brainStatus?.brain?.trainedProfile?.targetAudience?.primaryPersona || activeStrategy?.analysisResult?.targetAudience?.primaryPersona || 'Key Decision Makers & Commercial Buyers'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {(brainStatus?.brain?.trainedProfile?.coreOfferings || activeStrategy?.analysisResult?.coreOfferings || ['Enterprise Platform', 'Autonomous Closer', 'Omnichannel Ingestion']).slice(0, 4).map((off, i) => (
                <span key={i} style={{ fontSize: '0.675rem', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#38BDF8', padding: '3px 8px', borderRadius: '6px' }}>
                  ✓ {typeof off === 'string' ? off.slice(0, 32) : 'Service'}
                </span>
              ))}
            </div>
          </div>

          {/* Pillar 2: 30/60/90 Day Quantitative Targets */}
          <div style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <TrendingUp size={16} color="#10B981" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34D399', textTransform: 'uppercase' }}>
                Business Targets &amp; Milestones
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: '#94A3B8' }}>30-Day Milestone:</span>
              <strong style={{ color: '#10B981' }}>{brainStatus?.targets?.day30?.targetRevenue || activeStrategy?.analysisResult?.businessTargets?.day30?.targetRevenue || '$15,000 Revenue'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: '#94A3B8' }}>60-Day Scaling:</span>
              <strong style={{ color: '#38BDF8' }}>{brainStatus?.targets?.day60?.targetRevenue || activeStrategy?.analysisResult?.businessTargets?.day60?.targetRevenue || '$35,000 Revenue'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: '#94A3B8' }}>90-Day ARR Scale:</span>
              <strong style={{ color: '#A78BFA' }}>{brainStatus?.targets?.day90?.targetRevenue || activeStrategy?.analysisResult?.businessTargets?.day90?.targetRevenue || '$85,000 Revenue'}</strong>
            </div>
          </div>

          {/* Pillar 3: Company Life-Cycle SOPs */}
          <div style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Briefcase size={16} color="#8B5CF6" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#A78BFA', textTransform: 'uppercase' }}>
                Company Creation vs Management SOPs
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginBottom: '6px' }}>
              <strong style={{ color: '#CBD5E1' }}>Creation &amp; Launch:</strong> {activeStrategy?.analysisResult?.companyCreationStrategy?.entityType || 'Registered Commercial Entity'} (Compliance &amp; Initial 50 Customers)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.4' }}>
              <strong style={{ color: '#CBD5E1' }}>Daily Operations:</strong> {activeStrategy?.analysisResult?.companyManagementStrategy?.dailyOperations?.slice(0, 100) || 'Morning pipeline review, customer ticket triage, cashflow review & autonomous execution.'}...
            </div>
          </div>

          {/* Pillar 4: Tailored Playbook (Filtered based on Operating Model) */}
          <div style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            {(() => {
              const model = brainStatus?.operatingModelType || activeStrategy?.analysisResult?.businessModelType || 'ONLINE';
              if (model === 'OFFLINE') {
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Store size={16} color="#F59E0B" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FBBF24', textTransform: 'uppercase' }}>
                        Local Store &amp; Footfall Playbook
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginBottom: '4px' }}>
                      <strong style={{ color: '#FBBF24' }}>Local Storefront:</strong> {activeStrategy?.analysisResult?.offlineStrategy?.summary?.slice(0, 100) || 'Local Google Map Pack dominance, walk-in consultation, and community authority.'}...
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '6px' }}>
                      ⚡ Filtered by VYUHOX: Suppressed SaaS PLG &amp; developer API clutter
                    </div>
                  </>
                );
              } else if (model === 'HYBRID') {
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Store size={16} color="#10B981" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34D399', textTransform: 'uppercase' }}>
                        Omnichannel Store + Online Bridge
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginBottom: '4px' }}>
                      <strong style={{ color: '#34D399' }}>Omnichannel Engine:</strong> Digital showroom driving scheduled in-store VIP consultations and click-and-collect fulfillment.
                    </div>
                  </>
                );
              } else if (model === 'B2B_SERVICES') {
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Briefcase size={16} color="#A78BFA" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C084FC', textTransform: 'uppercase' }}>
                        B2B Enterprise Authority Engine
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginBottom: '4px' }}>
                      <strong style={{ color: '#C084FC' }}>Corporate Execution:</strong> LinkedIn executive outreach, high-ticket retainer proposals, and C-level discovery calls.
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '6px' }}>
                      ⚡ Filtered by VYUHOX: Suppressed mass retail consumer flash sales
                    </div>
                  </>
                );
              } else {
                // ONLINE MODEL
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Globe size={16} color="#06B6D4" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>
                        Online Digital Funnel Playbook
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginBottom: '4px' }}>
                      <strong style={{ color: '#38BDF8' }}>Online Funnel:</strong> {activeStrategy?.analysisResult?.onlineStrategy?.summary?.slice(0, 100) || 'Full-funnel digital pipeline, sub-45s AI voice speed-to-lead, and multi-channel retargeting.'}...
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '6px' }}>
                      ⚡ Filtered by VYUHOX: Suppressed offline store footfall &amp; POS clutter
                    </div>
                  </>
                );
              }
            })()}
          </div>
        </div>

        {/* Save Notice */}
        {saveNotice && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: '#34D399',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* SECTION 1: EXACT IDENTIFIED SERVICES & PRODUCTS (EDITABLE) */}
        <div style={{
          background: 'rgba(11, 17, 32, 0.85)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}>
                <Layers size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Identified Client Services &amp; Products
                  </h3>
                  <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                    {servicesList.length} Active Services
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  Exact offerings discovered by VYUHOX Crawler. If anything is missing or changed, edit or add services below to calibrate your AI closer &amp; ads.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddService}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>+ Add Missing Service</span>
            </button>
          </div>

          {/* Services Grid */}
          {servicesList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {servicesList.map((srv, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                        {srv.category || 'SERVICE'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditService(srv, idx)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '5px',
                            color: '#38BDF8',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            cursor: 'pointer',
                          }}
                          title="Edit Service"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(idx)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '5px',
                            color: '#F87171',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            cursor: 'pointer',
                          }}
                          title="Delete Service"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '4px' }}>
                      {srv.name}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 8px', lineHeight: '1.4' }}>
                      {srv.description || 'Verified commercial solution delivered to client requirements.'}
                    </p>
                  </div>

                  {srv.deliverable && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#34D399',
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}>
                      ⚡ <strong>Deliverable:</strong> {srv.deliverable}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
            }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#94A3B8' }}>
                No custom services saved yet. Click below to add the exact services your business provides.
              </p>
              <button
                type="button"
                onClick={handleOpenAddService}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
              >
                + Add First Service
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: HIGH-PRECISION BUYER TARGETING MATRIX */}
        <div style={{
          background: 'rgba(11, 17, 32, 0.85)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A78BFA',
              }}>
                <Target size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    High-Precision Buyer Targeting Matrix
                  </h3>
                  <span className="badge badge-purple" style={{ fontSize: '0.675rem' }}>
                    Synthesized from Offerings
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  Derived from your business services: answers who will buy, who can buy, to whom you must sell, who is interested, and critical buying triggers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTargetingForm(targetingState || {
                  whoWillBuy: 'Enterprise organizations with immediate operational needs and allocated budget.',
                  whoCanBuy: 'Managing Directors, CISOs, Procurement Heads, and Authorized Signatories.',
                  toWhomToSell: 'Mid-Market to Enterprise accounts (50-5000 headcount) facing transition deadlines.',
                  whoWillBeInterested: 'Technical leads, department heads, and operational managers evaluating solutions.',
                  buyingTriggers: 'Compliance audits, contract renewals, revenue leaks, and competitor modernization.',
                });
                setTargetingModalOpen(true);
              }}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
            >
              <span>Edit Targeting Matrix</span>
            </button>
          </div>

          {/* 5-Quadrant Matrix Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {/* 1. Who Will Buy */}
            <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>🎯</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>
                  Who Will Buy (High Urgency)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', margin: 0, lineHeight: '1.45' }}>
                {targetingState?.whoWillBuy || 'Clients experiencing active pain points, upcoming audit deadlines, or acute operational bottlenecks with immediately authorized budget.'}
              </p>
            </div>

            {/* 2. Who Can Buy */}
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>💼</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34D399', textTransform: 'uppercase' }}>
                  Who Can Buy (Budget Authority)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', margin: 0, lineHeight: '1.45' }}>
                {targetingState?.whoCanBuy || 'Designated economic buyers: Managing Directors, Chief Information Officers, Procurement Leads, or Business Owners who control purchase orders.'}
              </p>
            </div>

            {/* 3. To Whom You Have to Sell */}
            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>🚀</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#A78BFA', textTransform: 'uppercase' }}>
                  To Whom to Sell (Primary ICP)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', margin: 0, lineHeight: '1.45' }}>
                {targetingState?.toWhomToSell || 'Tier-1 commercial accounts in regulated industries (Fintech, Telecom, Defense, Healthcare, Manufacturing) with >$5M ARR.'}
              </p>
            </div>

            {/* 4. Who Will Be Interested */}
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>💡</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FBBF24', textTransform: 'uppercase' }}>
                  Who Will Be Interested (Influencers)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', margin: 0, lineHeight: '1.45' }}>
                {targetingState?.whoWillBeInterested || 'Security engineers, technical architects, and department operators who evaluate feature specs, trial demos, and recommend solutions to leadership.'}
              </p>
            </div>

            {/* 5. Buying Triggers & Objections */}
            <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>⚡</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#F472B6', textTransform: 'uppercase' }}>
                  Buying Triggers &amp; Catalysts
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', margin: 0, lineHeight: '1.45' }}>
                {targetingState?.buyingTriggers || 'Mandatory regulatory compliance deadlines, annual vendor contract renewals, painful legacy downtime, or high competitor pricing.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Pills for the 8 Pillars */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
            Explore Synthesized Modules:
          </span>
          <button
            onClick={() => onNavigateTab('strategy')}
            style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#38BDF8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
          >
            📄 Business Plan
          </button>
          <button
            onClick={() => onNavigateTab('strategy')}
            style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34D399', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
          >
            🎯 SWOT Analysis
          </button>
          <button
            onClick={() => onNavigateTab('strategy')}
            style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#A78BFA', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
          >
            ⚙️ Workflows &amp; Team
          </button>
          <button
            onClick={() => onNavigateTab('strategy')}
            style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#FBBF24', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
          >
            📊 Targets &amp; Milestones
          </button>
          <button
            onClick={() => onNavigateTab('ads')}
            style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', color: '#F472B6', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
          >
            📢 Google &amp; Meta Ads
          </button>
          <button
            onClick={() => onNavigateTab('seo-aeo')}
            style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#7DD3FC', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
          >
            🤖 SEO &amp; AEO Engine
          </button>
        </div>
      </div>

      {/* STEP 1: INTERACTIVE WEBSITE SCANNER & DYNAMIC AI STRATEGY HUB */}
      {hasStrategy && activeStrategy ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.45)',
              }}>
                <Globe size={22} color="#030712" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="live-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  <span style={{ fontSize: '0.725rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Live AI DOM Strategy Active
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.675rem' }}>
                    Step 1 Completed ✓
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '0.675rem' }}>
                    {activeStrategy.category || 'Enterprise B2B'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                    {activeStrategy.businessName || activeWorkspace?.name}
                  </h2>
                  {activeStrategy.websiteUrl && (
                    <a
                      href={activeStrategy.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.75rem',
                        color: '#38BDF8',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                      }}
                    >
                      <span>{activeStrategy.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigateTab('strategy')}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View Full Strategy Blueprint</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigateTab('leads')}
                className="btn btn-emerald"
                style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Users size={14} />
                <span>Launch Prospecting (Step 2)</span>
              </button>
              <span className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} />
                <span>1 Business Locked</span>
              </span>
            </div>
          </div>

          {/* Value Prop & Dynamic Proof Badges */}
          <div style={{
            background: 'rgba(11, 17, 32, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '14px',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
              Synthesized Positioning &amp; Value Proposition
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.5' }}>
              {activeStrategy.analysisResult?.positioning?.coreValueProp || activeStrategy.analysisResult?.summary || activeStrategy.summary || 'Enterprise autonomous revenue pipeline configured.'}
            </p>
          </div>

          {/* Dynamic Proofs & Industry Compliance Signals */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              Live AI Proofs:
            </div>
            {(() => {
              const cat = (activeStrategy.category || '').toLowerCase();
              const bName = (activeStrategy.businessName || '').toLowerCase();
              const isChitFund = cat.includes('chit fund') || cat.includes('chit scheme') || bName.includes('chit fund');
              const isFinance = cat.includes('financial') || cat.includes('fintech') || cat.includes('invest');
              const isPqc = cat.includes('quantum') || cat.includes('pqc') || cat.includes('cryptograph');
              const isEcom = cat.includes('ecommerce') || cat.includes('retail');

              if (isChitFund) {
                return (
                  <>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      🏛️ State Regulated Chit Savings Scheme
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      💰 Monthly e-Auctions &amp; Liquidity
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      📱 Automated WhatsApp Digital Passbook
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                      🎯 Target: Local Merchants &amp; Savers
                    </span>
                  </>
                );
              } else if (isPqc) {
                return (
                  <>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      🛡️ NIST FIPS 203/204/205 Standards Verified
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      🔒 CNSA 2.0 Compliance Architecture
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      ⚡ Automated AST Cryptographic Discovery
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                      🎯 Target: CISOs, CTOs &amp; AppSec Architects
                    </span>
                  </>
                );
              } else if (isEcom) {
                return (
                  <>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      🛍️ Multi-Channel Product Matrix Crawled
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      💬 Sub-45s Cart Abandonment Recovery
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      📈 Algorithmic Meta/Google Ad Scaling
                    </span>
                  </>
                );
              } else if (isFinance) {
                return (
                  <>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      💳 Secure Financial Advisory Rail
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ⚡ Sub-45s Inbound Speed-to-Lead SLA
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      📈 High-Trust Client Acquisition
                    </span>
                  </>
                );
              } else {
                return (
                  <>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      🏢 Decision-Maker Multi-Threading
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ⚡ Sub-45s Inbound Speed-to-Lead SLA
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      📊 Automated Revenue Pipeline Model
                    </span>
                  </>
                );
              }
            })()}
          </div>
        </div>
      ) : (
        /* ONE-TIME ONBOARDING SETUP BANNER (DASHBOARD) */
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              flexShrink: 0,
            }}>
              <Globe size={24} color="#030712" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  ⚡ One-Time Setup • Tour
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  🔒 1 User = 1 Dashboard = 1 Business
                </span>
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                Configure Your Dedicated Business Profile
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
                Enter your verified business URL &amp; details to synthesize an autonomous GTM strategy and lock your workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.875rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} />
            <span>Open Setup Dialog</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Real-time Save / Update Notification */}
      {saveNotice && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34D399',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <CheckCircle2 size={18} />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* SIMPLE 2-STEP CLIENT JOURNEY FLOW */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: '800', color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              VYUHOX Autonomous Operating Architecture
            </span>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: '3px 0 0', color: '#F8FAFC' }}>
              Simple 2-Step Client Journey
            </h3>
          </div>
          <span className={`badge ${hasStrategy ? 'badge-emerald' : 'badge-amber'}`}>
            {hasStrategy ? '✓ Step 1 Complete • Step 2 Unlocked' : '⚡ Step 1 Pending Crawl'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {/* Step 1 Card */}
          <div style={{
            padding: '18px',
            borderRadius: '12px',
            background: hasStrategy ? 'rgba(16, 185, 129, 0.05)' : 'rgba(6, 182, 212, 0.08)',
            border: hasStrategy ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 182, 212, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', fontWeight: '800', color: hasStrategy ? '#34D399' : '#38BDF8' }}>
                STEP 1: WEBSITE &amp; SOCIAL INGESTION
              </span>
              {hasStrategy ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.725rem', color: '#34D399', fontWeight: '700' }}>
                  <CheckCircle2 size={13} /> Active &amp; Partitioned
                </span>
              ) : (
                <span style={{ fontSize: '0.725rem', color: '#38BDF8', fontWeight: '700' }}>Action Required</span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 12px', lineHeight: '1.4' }}>
              Crawl your website, Instagram, or voice brief. VYUHOX extracts exact offerings and automatically partitions data into Ads Manager, SEO &amp; AEO Studio, and Maya Voice AE.
            </p>
            <button
              onClick={() => {
                if (!hasStrategy) {
                  setShowOnboardingModal(true);
                } else {
                  onNavigateTab('strategy');
                }
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#38BDF8',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Globe size={13} />
              <span>{hasStrategy ? 'Review Crawl & Strategy Engine →' : 'Configure Business Profile →'}</span>
            </button>
          </div>

          {/* Step 2 Card */}
          <div style={{
            padding: '18px',
            borderRadius: '12px',
            background: hasStrategy ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: hasStrategy ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
            opacity: hasStrategy ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', fontWeight: '800', color: hasStrategy ? '#C4B5FD' : '#64748B' }}>
                STEP 2: FULL AUTONOMOUS REVENUE SUITE UNLOCKED
              </span>
              <span style={{ fontSize: '0.725rem', color: hasStrategy ? '#A78BFA' : '#64748B', fontWeight: '700' }}>
                {hasStrategy ? 'Ready for Execution' : 'Locked until Step 1'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 12px', lineHeight: '1.4' }}>
              Direct 1-click execution across all revenue engines configured specifically with your verified services and buyer ICP:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => onNavigateTab('leads')}
                disabled={!hasStrategy}
                style={{ padding: '5px 10px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#38BDF8', fontSize: '0.725rem', fontWeight: '700', cursor: hasStrategy ? 'pointer' : 'not-allowed' }}
              >
                🎯 Lead Scraping
              </button>
              <button
                onClick={() => onNavigateTab('ads')}
                disabled={!hasStrategy}
                style={{ padding: '5px 10px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#F472B6', fontSize: '0.725rem', fontWeight: '700', cursor: hasStrategy ? 'pointer' : 'not-allowed' }}
              >
                📢 Ads Manager (FB, IG &amp; Google)
              </button>
              <button
                onClick={() => onNavigateTab('seo-aeo')}
                disabled={!hasStrategy}
                style={{ padding: '5px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', fontSize: '0.725rem', fontWeight: '700', cursor: hasStrategy ? 'pointer' : 'not-allowed' }}
              >
                🤖 SEO &amp; AEO (24/7 Auto-Pilot)
              </button>
              <button
                onClick={() => onNavigateTab('voice')}
                disabled={!hasStrategy}
                style={{ padding: '5px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#FBBF24', fontSize: '0.725rem', fontWeight: '700', cursor: hasStrategy ? 'pointer' : 'not-allowed' }}
              >
                📞 Maya Voice Closer (&lt;45s)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* IDENTIFIED CLIENT SERVICES & PRODUCTS (EDITABLE) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#06B6D4" />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                Verified Client Business Offerings &amp; Services ({servicesList.length})
              </h3>
              <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                🧠 AI Brain Synced
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
              The exact products and services extracted from your business. Missing anything? Edit or add services below so your AI sales agents represent your exact catalog.
            </p>
          </div>

          <button
            onClick={handleOpenAddService}
            className="btn btn-primary"
            style={{ padding: '7px 16px', fontSize: '0.775rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Add Service / Product</span>
          </button>
        </div>

        {servicesList.length === 0 ? (
          <div style={{
            padding: '28px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#94A3B8' }}>
              No individual services parsed yet. Crawl your website or click below to define what your business offers.
            </p>
            <button
              onClick={handleOpenAddService}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.8rem', fontWeight: '700' }}
            >
              + Add First Service
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}>
            {servicesList.map((service, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: 'rgba(11, 17, 32, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.675rem',
                      fontWeight: '700',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38BDF8',
                      textTransform: 'uppercase',
                    }}>
                      {service.category || 'CORE_SERVICE'}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEditService(service, idx)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#CBD5E1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                        }}
                        title="Edit Service"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#F87171',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                        }}
                        title="Delete Service"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 6px' }}>
                    {service.name}
                  </h4>

                  <p style={{ margin: '0 0 8px', fontSize: '0.775rem', color: '#94A3B8', lineHeight: '1.45' }}>
                    {service.description || 'Full solution deliverable mapped to client pain points.'}
                  </p>
                </div>

                {service.deliverable && (
                  <div style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.725rem',
                    color: '#CBD5E1',
                  }}>
                    <strong style={{ color: '#10B981' }}>Deliverable:</strong> {service.deliverable}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HIGH-PRECISION BUYER TARGETING ARCHITECTURE (5 QUADRANTS) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="#A78BFA" />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                High-Precision Buyer Targeting Matrix
              </h3>
              <span className="badge badge-purple" style={{ fontSize: '0.675rem' }}>
                🎯 Verified Buying Persona
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
              Synthesized directly from your offerings: Who will buy, who can buy, to whom you must sell, who is interested, and compelling buying triggers.
            </p>
          </div>

          <button
            onClick={() => {
              setTargetingForm({
                whoWillBuy: targetingState?.whoWillBuy || '',
                whoCanBuy: targetingState?.whoCanBuy || '',
                toWhomToSell: targetingState?.toWhomToSell || '',
                whoWillBeInterested: targetingState?.whoWillBeInterested || '',
                buyingTriggers: targetingState?.buyingTriggers || '',
              });
              setTargetingModalOpen(true);
            }}
            className="btn btn-secondary"
            style={{ padding: '7px 16px', fontSize: '0.775rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit2 size={13} />
            <span>Fine-Tune Buyer Targeting</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
        }}>
          {/* 1. Who Will Buy */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(11, 17, 32, 0.75)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800' }}>
              <Target size={14} />
              <span>1. WHO WILL BUY (ICP NEED)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.45' }}>
              {targetingState?.whoWillBuy || (activeStrategy?.analysisResult?.targetAudience?.primaryPersona ? `Enterprises & clients matching: ${activeStrategy.analysisResult.targetAudience.primaryPersona}` : 'Organizations seeking immediate performance optimization and verified enterprise deliverables.')}
            </p>
          </div>

          {/* 2. Who Can Buy */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(11, 17, 32, 0.75)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#34D399', fontSize: '0.75rem', fontWeight: '800' }}>
              <DollarSign size={14} />
              <span>2. WHO CAN BUY (FINANCIAL POWER)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.45' }}>
              {targetingState?.whoCanBuy || (activeStrategy?.targetAudience?.estimatedBudgetTier ? `Budget Tier: ${activeStrategy.targetAudience.estimatedBudgetTier} (ACV: ${activeStrategy.targetAudience?.estimatedACV || 'Mid-Market / Enterprise'})` : 'Funded businesses and growing mid-market accounts with dedicated annual operational budgets.')}
            </p>
          </div>

          {/* 3. To Whom To Sell */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(11, 17, 32, 0.75)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#C4B5FD', fontSize: '0.75rem', fontWeight: '800' }}>
              <Users size={14} />
              <span>3. TO WHOM TO SELL (DECISION MAKERS)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.45' }}>
              {targetingState?.toWhomToSell || (activeStrategy?.targetAudience?.decisionMakers && activeStrategy.targetAudience.decisionMakers.length > 0 ? activeStrategy.targetAudience.decisionMakers.join(', ') : 'Founders, Chief Executive Officers, CISOs, CTOs, and VP of Operations.')}
            </p>
          </div>

          {/* 4. Who Will Be Interested */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(11, 17, 32, 0.75)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#FBBF24', fontSize: '0.75rem', fontWeight: '800' }}>
              <Sparkles size={14} />
              <span>4. WHO WILL BE INTERESTED (CHAMPIONS)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.45' }}>
              {targetingState?.whoWillBeInterested || 'Department heads, senior engineers, and growth strategists championing modern automated solutions internally.'}
            </p>
          </div>

          {/* 5. Compelling Buying Triggers */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(11, 17, 32, 0.75)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#F472B6', fontSize: '0.75rem', fontWeight: '800' }}>
              <Zap size={14} />
              <span>5. COMPELLING BUYING TRIGGERS</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.45' }}>
              {targetingState?.buyingTriggers || (activeStrategy?.targetAudience?.buyingTriggers && activeStrategy.targetAudience.buyingTriggers.length > 0 ? activeStrategy.targetAudience.buyingTriggers.join('; ') : 'Regulatory compliance deadlines, quarterly budget expiration, failed manual processes, urgent scaling mandates.')}
            </p>
          </div>
        </div>
      </div>

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

      {/* 5-STEP AUTONOMOUS PROGRESSION FLOW (STREAMLINED & DYNAMIC) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: '0 0 2px', color: '#F8FAFC' }}>
              Your 5-Step Autonomous Growth Workflow
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
              Track the full progression from website DOM crawl to booked client meetings.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>
              {hasStrategy ? (leads.length > 0 ? 'Step 2 Complete' : 'Step 1 Complete • Step 2 Ready') : 'Step 1 Ready'}
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}>
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = (idx === 0 && !hasStrategy) || (idx === 1 && hasStrategy && leads.length === 0) || (idx === 2 && leads.length > 0);
            return (
              <div
                key={step.step}
                onClick={() => {
                  if (step.step === '01' && !hasStrategy) {
                    setShowOnboardingModal(true);
                  } else if (onNavigateTab) {
                    onNavigateTab(step.tab);
                  }
                }}
                style={{
                  padding: '16px',
                  background: isCurrent ? 'rgba(6, 182, 212, 0.08)' : '#0D1527',
                  border: isCurrent ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${step.color}20`,
                      border: `1px solid ${step.color}45`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={16} color={step.color} />
                    </div>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: '800', color: isCurrent ? step.color : '#64748B' }}>
                      STEP {step.step}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.925rem', fontWeight: '700', color: '#F8FAFC', margin: '0 0 4px' }}>
                    {step.title}
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: step.isCompleted ? '#34D399' : '#94A3B8', fontWeight: '600', marginBottom: '12px' }}>
                    {step.isCompleted ? '✓ ' + step.badge : step.badge}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: step.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>{step.actionText}</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE AI C-SUITE WORKFORCE */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
              Your Hired AI Employees (Working 24/7)
            </h2>
            <p style={{ margin: 0, fontSize: '0.825rem', color: '#94A3B8' }}>
              Autonomous digital workers managing outreach, inbound phone calls, and marketing on your behalf.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('agent-store')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={13} color="#38BDF8" />
            <span>AI Employee Store</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {activeAiEmployees.map((agent) => (
            <div
              key={agent.name}
              className="card"
              style={{
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: `${agent.color}22`,
                border: `1px solid ${agent.color}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.9rem',
                color: agent.color,
                flexShrink: 0,
              }}>
                {agent.avatar}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                    {agent.name}
                  </h4>
                  <span style={{ fontSize: '0.675rem', color: '#10B981', fontWeight: '700' }}>
                    {agent.liveDials}
                  </span>
                </div>

                <div style={{ fontSize: '0.725rem', color: agent.color, fontWeight: '600', marginBottom: '6px' }}>
                  {agent.role}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 10px', lineHeight: '1.4' }}>
                  {agent.specialty}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#34D399' }}>
                  <span className="live-dot" style={{ background: '#10B981', width: '6px', height: '6px' }} />
                  <span>{agent.status}</span>
                </div>
              </div>
            </div>
          ))}
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

      {/* INTERACTIVE MODAL: TUNE / RETRAIN VYUHOX BUSINESS BRAIN */}
      {showBrainTuneModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            maxWidth: '620px',
            width: '100%',
            padding: '24px 28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Brain size={24} color="#06B6D4" />
                <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#F8FAFC' }}>
                  Tune &amp; Retrain VYUHOX Business Brain
                </h3>
              </div>
              <button
                onClick={() => setShowBrainTuneModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#94A3B8' }}>
              Customize your business model, services catalog, monthly targets, and AI instructions. All AI agents (Maya Voice Closer, Sarah SDR, Ethan CMO) instantly adapt to these parameters.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!activeWorkspace?._id) return;
              setIsTuningBrain(true);
              try {
                const servicesArray = brainTuneForm.customServices.split(',').map((s) => s.trim()).filter(Boolean);
                const res = await api.trainBrain(activeWorkspace._id, {
                  operatingModelType: brainTuneForm.operatingModelType,
                  customServices: servicesArray,
                  targetAudience: { primaryPersona: brainTuneForm.targetAudience },
                  businessTargets: {
                    day30: { targetRevenue: brainTuneForm.target30Day, focus: 'Accelerate Core Customer Acquisition' },
                  },
                  customGuidelines: brainTuneForm.customGuidelines,
                });
                if (res.success) {
                  await loadBrainStatus();
                  setShowBrainTuneModal(false);
                  alert('🧠 VYUHOX Business Brain successfully retrained and tuned!');
                } else {
                  alert(res.message || 'Brain tuning failed');
                }
              } catch (err) {
                alert('Brain tuning failed: ' + err.message);
              } finally {
                setIsTuningBrain(false);
              }
            }}>
              {/* Operating Model Type */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Business Operating Model Type
                </label>
                <select
                  value={brainTuneForm.operatingModelType}
                  onChange={(e) => setBrainTuneForm({ ...brainTuneForm, operatingModelType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="ONLINE">💻 Online Business (SaaS / D2C / Digital Funnel)</option>
                  <option value="OFFLINE">🏢 Offline Physical Business (Retail Store / Showroom / Clinic)</option>
                  <option value="HYBRID">🌐 Hybrid Model (Physical Location + Online Acquisition)</option>
                  <option value="B2B_SERVICES">🤝 B2B Professional Services / Agency / Exim</option>
                </select>
              </div>

              {/* Services & Products */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Services / Products Catalog (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={brainTuneForm.customServices}
                  onChange={(e) => setBrainTuneForm({ ...brainTuneForm, customServices: e.target.value })}
                  placeholder="e.g. 3D Dental Implants, Invisalign Clear Aligners, Emergency Walk-in Care"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Target Customer ICP */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Primary Target Customer / Decision Maker Persona
                </label>
                <input
                  type="text"
                  value={brainTuneForm.targetAudience}
                  onChange={(e) => setBrainTuneForm({ ...brainTuneForm, targetAudience: e.target.value })}
                  placeholder="e.g. Local Families, Working Mothers & Self-Care Adults (25-55)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              {/* 30-Day Target Goal */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  30-Day Quantitative Milestone Goal
                </label>
                <input
                  type="text"
                  value={brainTuneForm.target30Day}
                  onChange={(e) => setBrainTuneForm({ ...brainTuneForm, target30Day: e.target.value })}
                  placeholder="e.g. ₹15,00,000 / $25,000 Monthly Revenue"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              {/* Custom Guidelines */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Custom Business Directives &amp; Tone Instructions for AI
                </label>
                <textarea
                  rows={3}
                  value={brainTuneForm.customGuidelines}
                  onChange={(e) => setBrainTuneForm({ ...brainTuneForm, customGuidelines: e.target.value })}
                  placeholder="e.g. Always emphasize our 100% money-back guarantee, highlight 0% EMI financing, and mention free parking."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBrainTuneModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTuningBrain}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isTuningBrain ? 'Retraining Brain...' : '⚡ Save & Retrain AI Brain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT IDENTIFIED SERVICE */}
      {serviceModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px 28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={22} color="#06B6D4" />
                <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', color: '#F8FAFC' }}>
                  {serviceEditForm.index !== null ? 'Edit Business Service / Product' : 'Add New Service / Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#94A3B8' }}>
              Ensure your business offerings are 100% accurate. AI Outreach, Maya Voice Closer, and Meta/Google ad copies are generated directly from these deliverables.
            </p>

            <form onSubmit={handleSaveServiceItem}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Service / Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceEditForm.name}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, name: e.target.value })}
                  placeholder="e.g. Post-Quantum Cryptography Migration Audit"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Offering Category
                </label>
                <select
                  value={serviceEditForm.category}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="CORE_SERVICE">Core Service / Main Offering</option>
                  <option value="CONSULTING">Advisory / Consultation</option>
                  <option value="PACKAGE">Turnkey Package / Bundle</option>
                  <option value="RETAINER">Ongoing Retainer / Subscription</option>
                  <option value="PRODUCT">Physical / Digital Product</option>
                  <option value="CUSTOM">Bespoke Custom Solution</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Description &amp; Problem Solved
                </label>
                <textarea
                  rows={3}
                  value={serviceEditForm.description}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, description: e.target.value })}
                  placeholder="What does this service accomplish and what critical pain point does it eliminate for your client?"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  Key Deliverable / Scope
                </label>
                <input
                  type="text"
                  value={serviceEditForm.deliverable}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, deliverable: e.target.value })}
                  placeholder="e.g. NIST FIPS 203 Cryptographic Remediation Roadmap + Executive Report"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingServices}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.8rem', fontWeight: '700' }}
                >
                  {savingServices ? 'Saving Offering...' : '✓ Save Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FINE-TUNE HIGH-PRECISION BUYER TARGETING */}
      {targetingModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '1px solid rgba(139, 92, 246, 0.45)',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            padding: '24px 28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={22} color="#A78BFA" />
                <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#F8FAFC' }}>
                  Fine-Tune High-Precision Buyer Targeting
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetingModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#94A3B8' }}>
              VYUHOX engine uses these 5 buyer dimensions to filter leads in Lead Finder, construct Meta FB/IG custom audiences, and guide Maya closer phone conversations.
            </p>

            <form onSubmit={handleSaveTargeting}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  🎯 1. Who Will Buy (Immediate Need / ICP Profile)
                </label>
                <textarea
                  rows={2}
                  value={targetingForm.whoWillBuy}
                  onChange={(e) => setTargetingForm({ ...targetingForm, whoWillBuy: e.target.value })}
                  placeholder="e.g. Enterprises preparing for quantum decryption threats, fintechs, government defense contractors."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  💳 2. Who Can Buy (Financial / Purchasing Power)
                </label>
                <textarea
                  rows={2}
                  value={targetingForm.whoCanBuy}
                  onChange={(e) => setTargetingForm({ ...targetingForm, whoCanBuy: e.target.value })}
                  placeholder="e.g. Companies with $10M+ ARR, dedicated annual cybersecurity budget of $50k+, or compliance mandate."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  🏢 3. To Whom You Have To Sell (Exact Decision Makers &amp; Job Titles)
                </label>
                <textarea
                  rows={2}
                  value={targetingForm.toWhomToSell}
                  onChange={(e) => setTargetingForm({ ...targetingForm, toWhomToSell: e.target.value })}
                  placeholder="e.g. Chief Information Security Officer (CISO), Chief Technology Officer (CTO), Head of Security Architecture."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  💡 4. Who Will Be Interested (Aspirants, Innovators &amp; Champions)
                </label>
                <textarea
                  rows={2}
                  value={targetingForm.whoWillBeInterested}
                  onChange={(e) => setTargetingForm({ ...targetingForm, whoWillBeInterested: e.target.value })}
                  placeholder="e.g. Lead Cryptographers, DevOps Engineers, Enterprise Architects evaluating post-quantum algorithms."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', marginBottom: '6px' }}>
                  ⚡ 5. Compelling Buying Triggers (Catalysts for Fast Closing)
                </label>
                <textarea
                  rows={2}
                  value={targetingForm.buyingTriggers}
                  onChange={(e) => setTargetingForm({ ...targetingForm, buyingTriggers: e.target.value })}
                  placeholder="e.g. NIST CNSA 2.0 regulatory deadlines, failed audit findings, quarterly budget cycle expiries."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTargetingModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingServices}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.8rem', fontWeight: '700' }}
                >
                  {savingServices ? 'Calibrating Targeting...' : '⚡ Save & Calibrate Targeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
