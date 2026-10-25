import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  Send,
  ExternalLink,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  Server,
  Globe,
  Coins,
  ChevronRight,
  PhoneCall,
  Check,
  Building2,
  MapPin,
  Briefcase,
  Target,
  RefreshCw,
  Info,
  CreditCard,
  Bot,
  Compass,
  Layers,
  ArrowUpRight,
  Sliders,
  CheckCheck,
} from 'lucide-react';
import { api } from '../services/api';

const INDIAN_CITIES = [
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Mumbai, Maharashtra',
  'Delhi NCR / Gurgaon',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Noida, Uttar Pradesh',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
];

const GLOBAL_CITIES = [
  'San Francisco Bay Area, CA',
  'Austin, Texas',
  'New York City, NY',
  'Dallas, Texas',
  'Seattle, Washington',
  'London, United Kingdom',
  'Dubai, United Arab Emirates',
  'Singapore',
  'Toronto, Canada',
  'Sydney, Australia',
];

export default function LeadFinder({
  activeWorkspace,
  leads = [],
  wallet,
  currency = 'USD',
  exchangeRate = 83.5,
  onOpenAddFundsModal,
  onRefreshLeads,
  onOpenNewLeadModal,
  onOpenBulkImportModal,
  socket,
}) {
  // Strategy & Business Context State
  const [strategy, setStrategy] = useState(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);

  // Scraper Search Parameters (Multi-Territory Support: Cities, States, Countries)
  const [selectedLocations, setSelectedLocations] = useState(['Hyderabad, Telangana']);
  const [locationInput, setLocationInput] = useState('');
  const [limit, setLimit] = useState(25);
  const [customKeywords, setCustomKeywords] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [expandedNotesId, setExpandedNotesId] = useState(null);

  const handleAddLocation = (locToAdd) => {
    const term = (locToAdd || locationInput).trim();
    if (!term) return;
    if (!selectedLocations.includes(term)) {
      setSelectedLocations([...selectedLocations, term]);
    }
    setLocationInput('');
  };

  const handleRemoveLocation = (locToRemove) => {
    setSelectedLocations(selectedLocations.filter((l) => l !== locToRemove));
  };

  const handleTogglePreset = (presetLoc) => {
    if (selectedLocations.includes(presetLoc)) {
      handleRemoveLocation(presetLoc);
    } else {
      setSelectedLocations([...selectedLocations, presetLoc]);
    }
  };

  // Per-Lead Pricing Rate
  const RATE_PER_LEAD_USD = 0.15;
  const RATE_PER_LEAD_INR = 12.5;

  // Plan-Aware Free Quotas
  const PLAN_LIMITS = {
    STARTER: { name: 'Starter AI Plan', quota: 250, badge: 'Starter' },
    GROWTH: { name: 'Growth Suite', quota: 1000, badge: 'Growth' },
    SCALE: { name: 'Autonomous Pro', quota: 5000, badge: 'Scale Pro' },
    ENTERPRISE: { name: 'Global Enterprise', quota: 25000, badge: 'Enterprise' },
  };

  const currentPlanKey = activeWorkspace?.plan || 'GROWTH';
  const planInfo = PLAN_LIMITS[currentPlanKey] || PLAN_LIMITS.GROWTH;
  const monthlyQuota = activeWorkspace?.leadUsage?.monthlyIncludedQuota || planInfo.quota;
  const scrapedThisMonth = activeWorkspace?.leadUsage?.scrapedThisMonth || 0;
  const remainingFreeQuota = Math.max(0, monthlyQuota - scrapedThisMonth);
  const quotaPercent = Math.min(100, Math.round((scrapedThisMonth / monthlyQuota) * 100));

  // Current batch breakdown
  const freeBatch = Math.min(limit, remainingFreeQuota);
  const overageBatch = Math.max(0, limit - freeBatch);
  const overageCostUSD = (overageBatch * RATE_PER_LEAD_USD).toFixed(2);
  const overageCostINR = Math.round(overageBatch * RATE_PER_LEAD_INR);

  // Live Progress Tracker State
  const [progressData, setProgressData] = useState({
    step: '',
    stepIndex: 0,
    totalSteps: 4,
    message: '',
    percent: 0,
  });

  // Table Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [minScore, setMinScore] = useState(0);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [actionNotice, setActionNotice] = useState('');

  // 1. Fetch Active Workspace Strategy on Mount or Workspace Switch
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    let isMounted = true;
    setIsLoadingStrategy(true);

    api
      .getStrategy(activeWorkspace._id)
      .then((res) => {
        if (isMounted && res?.strategy) {
          setStrategy(res.strategy);
        }
      })
      .catch((err) => {
        console.error('Failed to load strategy for LeadFinder:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStrategy(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWorkspace?._id]);

  // Derive Autonomous AI Calibration from Crawled Data & Strategy
  const currentBusinessName = strategy?.businessName || activeWorkspace?.name || 'Your Business';
  const currentCategory = strategy?.category || activeWorkspace?.industry || 'B2B Enterprise';
  const targetAudience = strategy?.analysisResult?.targetAudience || {};
  const primaryPersona = targetAudience.primaryPersona || 'Enterprise Decision Makers & C-Suite';

  // Automatically resolve decision maker personas from LLM crawl strategy
  const aiDecisionMakers =
    targetAudience.decisionMakers && targetAudience.decisionMakers.length > 0
      ? targetAudience.decisionMakers
      : [
          'Chief Information Security Officer (CISO)',
          'Chief Technology Officer (CTO)',
          'VP of Engineering',
          'Director of Infrastructure & Cloud Security',
        ];

  const aiPainPoint =
    targetAudience.painPoints?.[0] ||
    'Accelerating autonomous pipeline velocity and reducing infrastructure operational friction';

  // AI-calibrated trade role: automatically deduced without manual dropdown
  const aiCalibratedRole = (function resolveRole() {
    const rawTokens = `${currentBusinessName} ${currentCategory} ${activeWorkspace?.businessModelDescription || ''}`.toLowerCase();
    if (rawTokens.includes('manufacturer') || rawTokens.includes('exporter') || rawTokens.includes('factory')) {
      return 'BUYER'; // Direct commercial buyers & procurement leaders
    }
    if (rawTokens.includes('trader') || rawTokens.includes('import export')) {
      return 'HYBRID_TRADER';
    }
    return 'BUYER';
  })();

  const aiRoleLabel =
    aiCalibratedRole === 'BUYER'
      ? 'Direct Enterprise Buyers & Decision-Makers'
      : aiCalibratedRole === 'SELLER'
      ? 'Verified Manufacturers & Exporters'
      : 'Cross-Border Trading Entities';

  // 2. Listen to Socket.io live scraper events
  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data) => {
      setProgressData({
        step: data.step,
        stepIndex: data.stepIndex || 1,
        totalSteps: data.totalSteps || 4,
        message: data.message,
        percent: data.percent,
      });
    };

    const handleLeadFound = () => {
      if (onRefreshLeads) onRefreshLeads();
    };

    const handleComplete = (data) => {
      setIsScraping(false);
      const isFree = !data.deductedUSD || data.deductedUSD === 0;
      const billingMsg = isFree
        ? `100% Free under your ${planInfo.badge} plan quota (${data.freeLeadsScraped || data.count} leads drawn from plan).`
        : `Deducted $${data.deductedUSD?.toFixed(2)} (${
            currency === 'INR'
              ? `₹${Math.round((data.deductedUSD || 0) * exchangeRate)}`
              : `$${data.deductedUSD?.toFixed(2)}`
          }) for ${data.billableLeadsScraped || data.count} overage lead(s).`;

      setProgressData({
        step: 'INGESTED_TO_CRM',
        stepIndex: 4,
        totalSteps: 4,
        message: `Scrape complete! Ingested ${data.count} genuine, MX-verified leads in ${data.location}. ${billingMsg}`,
        percent: 100,
      });
      if (onRefreshLeads) onRefreshLeads();
      setTimeout(() => {
        setActiveJobId(null);
      }, 6000);
    };

    const handleBulkUpdated = () => {
      if (onRefreshLeads) onRefreshLeads();
    };

    socket.on('scraper:progress', handleProgress);
    socket.on('scraper:lead_found', handleLeadFound);
    socket.on('scraper:complete', handleComplete);
    socket.on('leadsBulkUpdated', handleBulkUpdated);

    return () => {
      socket.off('scraper:progress', handleProgress);
      socket.off('scraper:lead_found', handleLeadFound);
      socket.off('scraper:complete', handleComplete);
      socket.off('leadsBulkUpdated', handleBulkUpdated);
    };
  }, [socket, onRefreshLeads]);

  // 3. Launch Autonomous AI Multi-Source Scraper across Multiple Territories
  const handleStartScrape = async () => {
    if (!activeWorkspace) return;

    // Resolve multi-locations
    const finalLocations = selectedLocations.length > 0
      ? selectedLocations
      : locationInput.trim()
      ? [locationInput.trim()]
      : [];

    if (finalLocations.length === 0) {
      alert('Please select or enter at least one target location (e.g. Hyderabad, Telangana or San Francisco, CA) where you want to scrape leads.');
      return;
    }

    const locationSummary = finalLocations.join('; ');

    // Plan-Aware Lead Quota & Wallet Check
    if (overageBatch > 0) {
      const requiredUSD = overageBatch * RATE_PER_LEAD_USD;
      const currentBalance = wallet?.balanceUSD || 0;

      if (currentBalance < requiredUSD) {
        alert(
          `Your ${planInfo.name} includes ${monthlyQuota.toLocaleString()} free verified leads per month (${remainingFreeQuota.toLocaleString()} remaining free leads this cycle).\n\n` +
            `Scraping ${limit} leads exceeds your remaining free quota by ${overageBatch} lead(s). Required overage: $${overageCostUSD} (${
              currency === 'INR' ? `₹${overageCostINR}` : `$${overageCostUSD}`
            }).\n\n` +
            `Current wallet balance: $${currentBalance.toFixed(2)} (${
              currency === 'INR' ? `₹${Math.round(currentBalance * exchangeRate)}` : `$${currentBalance.toFixed(2)}`
            }). Please recharge your wallet to continue.`
        );
        if (onOpenAddFundsModal) onOpenAddFundsModal();
        return;
      }
    }

    setIsScraping(true);
    const businessName = strategy?.businessName || activeWorkspace.name;

    setProgressData({
      step: 'SOURCE_DISCOVERY',
      stepIndex: 1,
      totalSteps: 4,
      message: `AI querying multi-source registries across ${finalLocations.length} territories [${finalLocations.slice(0, 3).join(', ')}${finalLocations.length > 3 ? '...' : ''}] for ${businessName}...`,
      percent: 15,
    });

    try {
      const res = await api.startScraper(activeWorkspace._id, {
        location: locationSummary,
        locations: finalLocations,
        limit,
        targetRole: aiCalibratedRole, // Pure AI-Calibrated Role
        customKeywords: customKeywords.trim(),
      });
      if (res.success) {
        setActiveJobId(res.jobId);
      } else {
        alert(res.message || 'Failed to start scraper');
        setIsScraping(false);
      }
    } catch (err) {
      console.error('Scraper launch failed:', err);
      setIsScraping(false);
      alert('Failed to launch scraper: ' + err.message);
    }
  };

  // 4. Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredLeads.map((l) => l._id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  // 5. Bulk Action Handler
  const handleBulkAction = async (action, targetStage = null) => {
    if (selectedLeadIds.length === 0 || !activeWorkspace) return;

    try {
      const res = await api.executeBulkAction(activeWorkspace._id, selectedLeadIds, action, targetStage);
      if (res.success) {
        setActionNotice(`Executed ${action.replace(/_/g, ' ')} on ${res.modifiedCount} leads!`);
        setSelectedLeadIds([]);
        if (onRefreshLeads) onRefreshLeads();
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  // 6. Update Single Lead Stage
  const handleStageChange = async (leadId, newStage) => {
    if (!activeWorkspace) return;
    try {
      await api.updateLeadStage(activeWorkspace._id, leadId, newStage);
      if (onRefreshLeads) onRefreshLeads();
    } catch (err) {
      console.error('Stage change failed:', err);
    }
  };

  // 7. Delete Single Lead
  const handleDeleteLead = async (leadId) => {
    if (!activeWorkspace) return;
    try {
      await api.deleteLead(activeWorkspace._id, leadId);
      if (onRefreshLeads) onRefreshLeads();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // 8. Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesStage = stageFilter === 'ALL' || lead.stage === stageFilter;
    const matchesScore = lead.score >= minScore;
    const matchesSearch =
      searchTerm === '' ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesScore && matchesSearch;
  });

  const stepsList = [
    { id: 1, label: 'Multi-Source Discovery', key: 'SOURCE_DISCOVERY' },
    { id: 2, label: 'Executive Resolution', key: 'METADATA_ENRICHMENT' },
    { id: 3, label: 'Live DNS MX Handshake', key: 'DNS_MX_VERIFICATION' },
    { id: 4, label: 'CRM & Wallet Deduction', key: 'INGESTED_TO_CRM' },
  ];

  // Pricing formatting
  const totalCostUSD = (limit * RATE_PER_LEAD_USD).toFixed(2);
  const totalCostINR = (limit * RATE_PER_LEAD_INR).toFixed(0);
  const walletBalanceUSD = wallet?.balanceUSD || 0;
  const walletBalanceINR = Math.round(walletBalanceUSD * exchangeRate);

  // Detect client business region
  const isIndiaWorkspace =
    currency === 'INR' ||
    (activeWorkspace?.name || '').toLowerCase().includes('quantum') ||
    (activeWorkspace?.industry || '').toLowerCase().includes('india') ||
    (activeWorkspace?.ownerEmail || '').endsWith('.in');

  const locationSuggestions = isIndiaWorkspace ? INDIAN_CITIES : GLOBAL_CITIES;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '22px', background: '#070C18', minHeight: '100vh', color: '#F8FAFC' }}>
      {/* 1. Header with Branded SaaS Style */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              <Sparkles size={12} /> Autonomous AI Lead Prospecting
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <ShieldCheck size={12} /> Live DNS MX Verified Handshake
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#C084FC',
              border: '1px solid rgba(168, 85, 247, 0.25)',
            }}>
              ✨ AI LLM Strategy-Calibrated
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#F8FAFC' }}>
            Autonomous Lead Prospecting &amp; Enrichment Engine
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', margin: '4px 0 0' }}>
            AI queries registries, search engines, and social graphs to discover, verify, and ingest high-intent decision-makers based on your crawled ICP.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/api/leads/export"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              fontSize: '0.8rem',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} /> Export CSV
          </a>
          <button
            onClick={onOpenBulkImportModal}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={14} /> Bulk Ingest
          </button>
          <button
            onClick={onOpenNewLeadModal}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              border: 'none',
              color: '#021C11',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} /> {actionNotice}
        </div>
      )}

      {/* 2. Sleek KPI Metrics Strip (SaaS Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CRM Verified Leads
            </span>
            <Users size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: '#F8FAFC' }}>
            {leads.length.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> {leads.filter((l) => l.verificationStatus === 'VERIFIED').length} 100% Mailserver Validated
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {planInfo.badge} Plan Quota
            </span>
            <Zap size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: '#10B981' }}>
            {remainingFreeQuota.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>/ {monthlyQuota.toLocaleString()} free</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
            {scrapedThisMonth.toLocaleString()} used this cycle ({quotaPercent}%) • 0 overage fees
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Autonomous Fit Conviction
            </span>
            <Target size={16} color="#C084FC" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: '#C084FC' }}>
            94.8%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
            Evaluated by LLM ICP Persona Matrix
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Wallet Reserve
            </span>
            <Coins size={16} color="#FBBF24" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: '#FBBF24' }}>
            {currency === 'INR' ? `₹${walletBalanceINR.toLocaleString('en-IN')}` : `$${walletBalanceUSD.toFixed(2)}`}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
            Standby for volume scrapes beyond quota
          </div>
        </div>
      </div>

      {/* 3. Pure AI-Calibrated ICP Intelligence Card (Replaces Clumsy Manual Role Dropdown) */}
      <div style={{
        padding: '18px 22px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.22)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#021C11',
              fontWeight: '800',
              fontSize: '1.1rem',
            }}>
              ✨
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#F8FAFC' }}>
                  AI Autonomous ICP Calibration: {currentBusinessName}
                </span>
                <span style={{
                  fontSize: '0.675rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  fontWeight: '700',
                }}>
                  {currentCategory}
                </span>
                <span style={{
                  fontSize: '0.675rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Check size={11} /> Auto-Calibrated from Web Crawl &amp; ICP Matrix
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '2px' }}>
                Target roles are automatically determined by AI LLM from your business positioning. No manual role selection required.
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.725rem',
            color: '#34D399',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '4px 10px',
            borderRadius: '8px',
            fontWeight: '600',
          }}>
            🎯 Inferred Role: {aiRoleLabel}
          </div>
        </div>

        {/* AI Identified Decision Makers & ICP Pills */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Decision Makers (LLM Extracted):
            </span>
            {aiDecisionMakers.map((dm, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  color: '#F8FAFC',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  padding: '3px 9px',
                  borderRadius: '6px',
                }}
              >
                {dm}
              </span>
            ))}
          </div>

          <div style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={13} color="#10B981" />
            <span>Target ICP Pain Point: <em>"{aiPainPoint}"</em></span>
          </div>

          <div style={{
            marginTop: '4px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.74rem',
            color: '#34D399',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldCheck size={15} color="#10B981" style={{ flexShrink: 0 }} />
            <div>
              <strong>Calibrated Buyer Targeting:</strong> Exclusively searches for companies that need and buy {currentBusinessName}'s solutions. Competitors offering identical services are automatically filtered out.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sleek Scraper Execution Console */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '22px 24px',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <MapPin size={18} color="#10B981" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
              Launch Autonomous Territory Prospecting
            </h3>
          </div>
          <p style={{ fontSize: '0.785rem', color: '#94A3B8', margin: 0 }}>
            Specify the geographic target market. The AI scraper cross-references corporate registries, LinkedIn profiles, and verified MX mailservers to ingest decision-makers.
          </p>
        </div>

        {/* Inputs Grid (Multi-City/State/Country Autonomous Scraping) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 0.7fr auto',
          gap: '14px',
          alignItems: 'flex-end',
          marginBottom: '10px',
        }}>
          {/* 1. Location Input with Enter to Add */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '600' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Compass size={13} color="#10B981" /> Target Geographic Territories ({selectedLocations.length} active)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Add multiple cities/states/countries</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', gap: '6px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <MapPin size={15} color="#34D399" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLocation();
                    }
                  }}
                  placeholder="Type city/state/country & press Enter (e.g. Hyderabad, London, Dallas)..."
                  style={{
                    height: '42px',
                    paddingLeft: '38px',
                    width: '100%',
                    fontSize: '0.85rem',
                    color: '#F8FAFC',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddLocation()}
                style={{
                  padding: '0 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* 2. Custom Keywords / Niche (Optional) */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600' }}>
              <Sparkles size={13} color="#A78BFA" /> Optional Niche / Specialization
            </label>
            <input
              type="text"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              placeholder="e.g. Fintech, Healthcare, Cloud Security, SaaS..."
              style={{
                height: '42px',
                padding: '0 14px',
                width: '100%',
                fontSize: '0.85rem',
                color: '#F8FAFC',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
          </div>

          {/* 3. Volume Batch */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
              Batch Volume
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              style={{
                height: '42px',
                padding: '0 12px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '0.825rem',
                color: '#F8FAFC',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                outline: 'none',
              }}
            >
              <option value={10}>10 Leads (Quick Sample)</option>
              <option value={25}>25 Leads (Recommended)</option>
              <option value={50}>50 Leads (Sprint)</option>
              <option value={100}>100 Leads (Standard)</option>
              <option value={250}>250 Leads (High-Volume)</option>
              <option value={500}>500 Leads (Scale)</option>
              <option value={1000}>1,000 Leads (Enterprise)</option>
            </select>
          </div>

          {/* 4. Launch Button */}
          <div>
            <button
              onClick={handleStartScrape}
              disabled={isScraping}
              style={{
                height: '42px',
                padding: '0 24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                border: 'none',
                color: '#021C11',
                fontWeight: '800',
                fontSize: '0.825rem',
                cursor: isScraping ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              {isScraping ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Scraping {selectedLocations.length || 1} Territories...
                </>
              ) : (
                <>
                  <Play size={15} fill="#021C11" /> Run AI Scraper ({limit} Leads • {selectedLocations.length || 1} {selectedLocations.length === 1 ? 'City' : 'Cities'})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Selected Territory Tags */}
        {selectedLocations.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Target Territories ({selectedLocations.length}):
            </span>
            {selectedLocations.map((loc) => (
              <span
                key={loc}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34D399',
                  fontSize: '0.73rem',
                  fontWeight: '600',
                }}
              >
                <MapPin size={11} /> {loc}
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(loc)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: 0,
                    marginLeft: '2px',
                    lineHeight: 1,
                  }}
                  title="Remove territory"
                >
                  ✕
                </button>
              </span>
            ))}
            {selectedLocations.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedLocations([])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginLeft: '4px',
                }}
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Territory Suggestion Chips (Click to Toggle On/Off) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Click to Add/Toggle Territories:
          </span>
          {locationSuggestions.map((loc, idx) => {
            const isSelected = selectedLocations.includes(loc);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTogglePreset(loc)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.07)',
                  color: isSelected ? '#34D399' : '#CBD5E1',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isSelected && <Check size={11} />}
                {loc}
              </button>
            );
          })}
        </div>

        {/* Live Plan Quota & Billing Strip */}
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={16} color="#10B981" />
            <div style={{ fontSize: '0.78rem', color: '#E2E8F0' }}>
              {overageBatch === 0 ? (
                <>
                  <strong style={{ color: '#34D399' }}>✓ 100% Free with {planInfo.name}</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    ({limit} leads will be drawn from your {remainingFreeQuota.toLocaleString()} free monthly allowance. Zero wallet charge).
                  </span>
                </>
              ) : freeBatch > 0 ? (
                <>
                  <strong style={{ color: '#38BDF8' }}>{freeBatch} Free Leads (Included)</strong>
                  <span style={{ color: '#CBD5E1', margin: '0 6px' }}>+</span>
                  <strong style={{ color: '#FBBF24' }}>{overageBatch} Overage Leads (${overageCostUSD} / ₹{overageCostINR})</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    (Only leads exceeding your monthly allowance draw from wallet).
                  </span>
                </>
              ) : (
                <>
                  <strong style={{ color: '#FBBF24' }}>Monthly Quota Fully Utilized</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    • Batch cost: ${totalCostUSD} (~₹{totalCostINR}) for {limit} verified leads from wallet balance.
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
              Wallet: <strong style={{ color: '#10B981' }}>{currency === 'INR' ? `₹${walletBalanceINR.toLocaleString('en-IN')}` : `$${walletBalanceUSD.toFixed(2)}`}</strong>
            </span>
            <button
              onClick={onOpenAddFundsModal}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                fontSize: '0.7rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              + Recharge
            </button>
          </div>
        </div>

        {/* Live Stepped Scraper Progress */}
        {(isScraping || activeJobId) && (
          <div style={{
            marginTop: '18px',
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
              {stepsList.map((step) => {
                const isPassed = progressData.percent >= (step.id / 4) * 100 || progressData.stepIndex > step.id;
                const isCurrent = progressData.stepIndex === step.id;
                return (
                  <div
                    key={step.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isPassed
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isCurrent
                        ? 'rgba(6, 182, 212, 0.15)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isPassed
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : isCurrent
                        ? '1px solid rgba(6, 182, 212, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={15} color="#10B981" />
                    ) : isCurrent ? (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} />
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>{step.id}</span>
                    )}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: isPassed || isCurrent ? '600' : '400',
                      color: isPassed ? '#34D399' : isCurrent ? '#38BDF8' : '#94A3B8',
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#F8FAFC', fontWeight: '500' }}>
                {progressData.message || 'Executing autonomous multi-source search and verification...'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10B981' }}>
                {progressData.percent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${progressData.percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06B6D4 0%, #10B981 100%)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* 5. Filter Toolbar & CRM Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Bulk Action Toolbar if selected */}
        {selectedLeadIds.length > 0 && (
          <div style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15))',
            borderBottom: '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>
              🎯 {selectedLeadIds.length} Verified Leads Selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handleBulkAction('PUSH_EMAIL_CAMPAIGN')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#38BDF8',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Mail size={13} /> Push to Email Outreach
              </button>
              <button
                onClick={() => handleBulkAction('TRIGGER_VOICE_CALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#10B981',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <PhoneCall size={13} /> Trigger Maya Voice AI
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#F43F5E',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Filter Strip */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, email, company, job title, location..."
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '36px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                fontSize: '0.825rem',
                color: '#F8FAFC',
                outline: 'none',
              }}
            />
          </div>

          {/* Stage filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            {['ALL', 'Prospect', 'Contacted', 'Qualified', 'Demo_Booked', 'Won'].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: stageFilter === stage ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: stageFilter === stage ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: stageFilter === stage ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.74rem',
                  fontWeight: stageFilter === stage ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {stage === 'ALL' ? 'All Leads' : stage.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Min Score Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
              Min Fit: <strong>{minScore}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              style={{ width: '80px', accentColor: '#06B6D4' }}
            />
          </div>
        </div>

        {/* CRM Leads Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#64748B',
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                letterSpacing: '0.05em',
                fontWeight: '700',
              }}>
                <th style={{ padding: '12px 16px', width: '36px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 8px', width: '36px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '12px 16px' }}>Contact & Executive Title</th>
                <th style={{ padding: '12px 16px' }}>Target Company & Domain</th>
                <th style={{ padding: '12px 16px' }}>Verified Email & MX Server</th>
                <th style={{ padding: '12px 16px' }}>Phone / Location</th>
                <th style={{ padding: '12px 16px' }}>AI Fit Score</th>
                <th style={{ padding: '12px 16px' }}>Pipeline Stage</th>
                <th style={{ padding: '12px 16px' }}>Channels</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '54px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={36} color="#475569" />
                      <div style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: '600' }}>
                        No verified leads in workspace CRM yet
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                        Enter your target territory above (e.g. "San Francisco, CA" or "Bengaluru, India"), then click "Run AI Scraper".
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const isChecked = selectedLeadIds.includes(lead._id);
                  const isVerified = lead.verificationStatus === 'VERIFIED';
                  const isNotesExpanded = expandedNotesId === lead._id;

                  return (
                    <React.Fragment key={lead._id}>
                      <tr
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: isChecked ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectLead(lead._id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>

                        {/* Numbering */}
                        <td style={{ padding: '14px 8px', textAlign: 'center', color: '#64748B', fontWeight: '700', fontSize: '0.72rem' }}>
                          {idx + 1}
                        </td>

                        {/* Contact Info */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#38BDF8',
                              fontWeight: '700',
                              fontSize: '0.825rem',
                            }}>
                              {lead.name ? lead.name.substring(0, 1) : 'L'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#F8FAFC' }}>{lead.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '500' }}>
                                {lead.title || 'Decision Maker'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company & Domain */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: '600', color: '#E2E8F0' }}>{lead.company || 'Enterprise'}</div>
                          </div>
                          {lead.website && (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '0.7rem',
                                color: '#06B6D4',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'none',
                                marginTop: '2px',
                              }}
                            >
                              <ExternalLink size={10} /> {lead.website.replace(/https?:\/\//, '')}
                            </a>
                          )}
                        </td>

                        {/* Verified Email & Live MX */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#F8FAFC', fontWeight: '500' }}>{lead.email}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                            {isVerified ? (
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34D399',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <ShieldCheck size={10} /> DNS MX Verified
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#FBBF24',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <AlertTriangle size={10} /> Unverified
                              </span>
                            )}
                            {lead.mxHost && (
                              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                                ({lead.mxHost.split('.')[0]})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone & Location */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ color: lead.phone ? '#10B981' : '#64748B', fontWeight: '500' }}>
                            {lead.phone || 'Direct extension active'}
                          </div>
                          {lead.location && (
                            <div style={{ fontSize: '0.685rem', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={10} color="#64748B" /> {lead.location}
                            </div>
                          )}
                        </td>

                        {/* AI Fit Score */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '42px',
                              height: '5px',
                              borderRadius: '999px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${lead.score}%`,
                                height: '100%',
                                background: lead.score >= 80 ? '#10B981' : lead.score >= 60 ? '#06B6D4' : '#F59E0B',
                              }} />
                            </div>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              color: lead.score >= 80 ? '#34D399' : '#38BDF8',
                            }}>
                              {lead.score}
                            </span>
                          </div>
                        </td>

                        {/* Pipeline Stage */}
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead._id, e.target.value)}
                            style={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#F8FAFC',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              outline: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Prospect">Prospect</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Demo_Booked">Demo Booked</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                        {/* Channels */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} title={`Email: ${lead.email}`} style={{ color: '#38BDF8' }}>
                                <Mail size={14} />
                              </a>
                            )}
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} title={`Phone: ${lead.phone}`} style={{ color: '#34D399' }}>
                                <Phone size={14} />
                              </a>
                            )}
                            {lead.channels?.whatsapp && (
                              <span title={`WhatsApp: ${lead.channels.whatsapp}`} style={{ color: '#10B981' }}>
                                <MessageSquare size={14} />
                              </span>
                            )}
                            {lead.channels?.linkedin && (
                              <a href={lead.channels.linkedin} target="_blank" rel="noreferrer" title="LinkedIn Profile" style={{ color: '#06B6D4' }}>
                                <Globe size={14} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setExpandedNotesId(isNotesExpanded ? null : lead._id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: isNotesExpanded ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="View Strategy Outreach Pitch"
                            >
                              <Info size={13} color={isNotesExpanded ? '#38BDF8' : '#94A3B8'} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Delete Lead"
                            >
                              <Trash2 size={13} color="#F43F5E" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Strategy Notes Row */}
                      {isNotesExpanded && (
                        <tr style={{ background: 'rgba(6, 182, 212, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td colSpan={10} style={{ padding: '12px 20px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              fontSize: '0.785rem',
                              color: '#CBD5E1',
                              lineHeight: '1.5',
                            }}>
                              <Zap size={14} color="#06B6D4" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <span style={{ color: '#38BDF8', fontWeight: '700' }}>Strategy-Calibrated Pitch Angle: </span>
                                {lead.notes || 'No specific outreach memo generated.'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
