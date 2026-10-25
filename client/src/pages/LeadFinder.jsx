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
  'Jaipur, Rajasthan',
];

const GLOBAL_CITIES = [
  'Austin, Texas',
  'Dallas, Texas',
  'San Francisco Bay Area, CA',
  'New York City, NY',
  'Seattle, Washington',
  'London & Greater London, UK',
  'Dubai & Abu Dhabi, UAE',
  'Singapore',
  'Toronto, Canada',
  'Berlin & Frankfurt, Germany',
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

  // Client Location & Batch Control (Simplified & Non-Clumsy)
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(10);
  const [targetRole, setTargetRole] = useState('BUYER'); // 'BUYER' | 'SELLER' | 'HYBRID_TRADER' | 'DECISION_MAKER'
  const [customKeywords, setCustomKeywords] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [expandedNotesId, setExpandedNotesId] = useState(null);

  // Per-Lead Pricing Rate
  const RATE_PER_LEAD_USD = 0.15;
  const RATE_PER_LEAD_INR = 12.50;

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

    api.getStrategy(activeWorkspace._id)
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
        : `Deducted $${data.deductedUSD?.toFixed(2)} (${currency === 'INR' ? `₹${Math.round((data.deductedUSD || 0) * exchangeRate)}` : `$${data.deductedUSD?.toFixed(2)}`}) for ${data.billableLeadsScraped || data.count} overage lead(s).`;

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

  // 3. Launch Autonomous AI Multi-Source Scraper
  const handleStartScrape = async () => {
    if (!activeWorkspace) return;

    const targetLoc = (location || '').trim();
    if (!targetLoc) {
      alert('Please enter a target location (e.g. Dallas, Texas or Mumbai, India) where you want to scrape leads.');
      return;
    }

    // Plan-Aware Lead Quota & Wallet Check
    if (overageBatch > 0) {
      const requiredUSD = overageBatch * RATE_PER_LEAD_USD;
      const currentBalance = wallet?.balanceUSD || 0;

      if (currentBalance < requiredUSD) {
        alert(
          `Your ${planInfo.name} includes ${monthlyQuota.toLocaleString()} free verified leads per month (${remainingFreeQuota.toLocaleString()} remaining free leads this cycle).\n\n` +
          `Scraping ${limit} leads exceeds your remaining free quota by ${overageBatch} lead(s). Required overage: $${overageCostUSD} (${currency === 'INR' ? `₹${overageCostINR}` : `$${overageCostUSD}`}).\n\n` +
          `Current wallet balance: $${currentBalance.toFixed(2)} (${currency === 'INR' ? `₹${Math.round(currentBalance * exchangeRate)}` : `$${currentBalance.toFixed(2)}`}). Please recharge your wallet to continue.`
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
      message: `AI querying search engines, registries & social tools across "${targetLoc}" for ${businessName}...`,
      percent: 15,
    });

    try {
      const res = await api.startScraper(activeWorkspace._id, {
        location: targetLoc,
        limit,
        targetRole,
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

  const currentBusinessName = strategy?.businessName || activeWorkspace?.name || 'Your Business';
  const currentCategory = strategy?.category || activeWorkspace?.industry || 'B2B Enterprise';
  const targetAudience = strategy?.analysisResult?.targetAudience || {};
  const primaryPersona = targetAudience.primaryPersona || 'Enterprise Decision Makers & C-Suite';
  const decisionMakers = targetAudience.decisionMakers || [
    'Chief Information Security Officer (CISO)',
    'Chief Technology Officer (CTO)',
    'Head of Application Security',
    'Enterprise Infrastructure Architect',
  ];
  const firstPainPoint = targetAudience.painPoints?.[0] || 'Accelerating autonomous pipeline & operational security';

  // Cost calculation
  const totalCostUSD = (limit * RATE_PER_LEAD_USD).toFixed(2);
  const totalCostINR = (limit * RATE_PER_LEAD_INR).toFixed(0);

  const walletBalanceUSD = wallet?.balanceUSD || 0;
  const walletBalanceINR = Math.round(walletBalanceUSD * exchangeRate);

  // Detect client business home region to show relevant quick suggestions
  const isIndiaWorkspace =
    currency === 'INR' ||
    (activeWorkspace?.name || '').toLowerCase().includes('quantum') ||
    (activeWorkspace?.industry || '').toLowerCase().includes('india') ||
    (activeWorkspace?.ownerEmail || '').endsWith('.in');

  const locationSuggestions = isIndiaWorkspace ? INDIAN_CITIES : GLOBAL_CITIES;

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">
              <Sparkles size={13} />
              AI AUTONOMOUS MULTI-SOURCE SCRAPER
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> Total Leads: {leads.length} ({filteredLeads.length} matching)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Live DNS MX Mailserver Handshake
            </span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800' }}>
            Autonomous Lead Prospecting &amp; Scraping Engine
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Scrapes genuine, verified target leads across search engines, directories, registries, and social media based on your crawled strategy.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/api/leads/export"
            className="btn-secondary"
            style={{ padding: '8px 14px', textDecoration: 'none' }}
          >
            <Download size={15} /> Export CSV
          </a>
          <button onClick={onOpenBulkImportModal} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <Upload size={15} /> Bulk Ingest
          </button>
          <button onClick={onOpenNewLeadModal} className="btn-primary" style={{ padding: '8px 16px' }}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34D399',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle2 size={16} /> {actionNotice}
        </div>
      )}

      {/* 1. AI STRATEGY RESEARCH & TARGETING INTELLIGENCE CARD */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#021C11',
              fontWeight: '800',
              fontSize: '1.2rem',
              boxShadow: '0 0 14px rgba(6, 182, 212, 0.35)',
            }}>
              🤖
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.925rem', fontWeight: '800', color: '#F8FAFC' }}>
                  AI Target Calibration: {currentBusinessName}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {currentCategory}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.675rem' }}>
                  <Check size={11} /> Strategy Synchronized
                </span>
              </div>
              <div style={{ fontSize: '0.785rem', color: '#94A3B8', marginTop: '3px' }}>
                Based on your website crawl and business plan, our AI automatically determines who to target and what angles to pitch.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#CBD5E1' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Coins size={14} color="#10B981" />
              <span>Rate: <strong>${RATE_PER_LEAD_USD.toFixed(2)}</strong> (~₹{RATE_PER_LEAD_INR.toFixed(2)}) / verified lead</span>
            </div>
          </div>
        </div>

        {/* AI Identified Decision Makers & ICP Pills */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.725rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Decision Makers Researched by AI:
            </span>
            {decisionMakers.map((dm, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: '600',
                  color: '#F8FAFC',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                {dm}
              </span>
            ))}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={13} color="#10B981" />
            <span>Target ICP Pain Point: <em>"{firstPainPoint}"</em></span>
          </div>

          {/* Calibrated Buyer vs Competitor Notice */}
          <div style={{
            marginTop: '6px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.765rem',
            color: '#34D399',
          }}>
            <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0 }} />
            <div>
              <strong>Calibrated Buyer Targeting: </strong>
              Hunting companies that <em>need and buy</em> {currentBusinessName}'s services (e.g. Software, Fintech, SaaS and Engineering teams that write code and need security bug scanning). Competing security firms offering the same service are excluded.
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUBSCRIPTION LEAD PLAN QUOTA & CYCLE STATUS CARD */}
      <div style={{
        padding: '18px 24px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
            }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {planInfo.name} • Monthly Lead Prospecting Quota
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  <Check size={11} /> {planInfo.badge} Tier Active
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {remainingFreeQuota > 0 ? `${remainingFreeQuota.toLocaleString()} Free Leads Remaining` : 'Monthly Quota Fully Utilized'}
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '3px' }}>
                Your plan includes <strong>{monthlyQuota.toLocaleString()} genuine verified leads/mo</strong> at zero extra charge. Overage beyond quota is billed at $0.15 (~₹12.50)/lead from your wallet.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>
                Cycle Consumption
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: '800', color: '#34D399' }}>
                {scrapedThisMonth.toLocaleString()} / {monthlyQuota.toLocaleString()} leads ({quotaPercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div>
          <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{
              width: `${quotaPercent}%`,
              height: '100%',
              background: quotaPercent >= 90 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'linear-gradient(90deg, #06B6D4 0%, #10B981 100%)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>

      {/* 3. CLIENT ACCESS: TARGET LOCATION & SCRAPE EXECUTION BAR */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <MapPin size={18} color="#10B981" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>
              Select Target Scraping Location
            </h3>
          </div>
          <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: 0 }}>
            Enter any city, state, region, or country in the world. Our AI scraper will hunt genuine decision-maker leads exclusively from that location.
          </p>
        </div>

        {/* Input & Batch Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
          {/* 1. Free Location Input */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Compass size={13} color="#10B981" /> Target Geographic Location / Territory
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color="#34D399" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dallas, Texas or London, UK or Mumbai, India..."
                className="input-glass"
                style={{
                  height: '44px',
                  paddingLeft: '38px',
                  width: '100%',
                  fontSize: '0.875rem',
                  color: '#F8FAFC',
                }}
              />
            </div>
          </div>

          {/* 2. Target Commercial Entity & Trade Role */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Users size={13} color="#06B6D4" /> Target Entity &amp; Trade Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input-glass"
              style={{ height: '44px', cursor: 'pointer', width: '100%', fontSize: '0.85rem', fontWeight: '600', color: '#38BDF8' }}
            >
              <option value="BUYER" style={{ background: '#0F172A' }}>🛒 Verified Direct Buyers (Importers / Sourcing)</option>
              <option value="SELLER" style={{ background: '#0F172A' }}>🏭 Verified Manufacturers &amp; Sellers (Exporters)</option>
              <option value="HYBRID_TRADER" style={{ background: '#0F172A' }}>🌐 Both (Import/Export Trading Houses &amp; Brokers)</option>
              <option value="DECISION_MAKER" style={{ background: '#0F172A' }}>👔 Enterprise C-Suite (CEOs, Founders, Directors)</option>
            </select>
          </div>

          {/* 3. Product / HS-Code / Keywords */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Sparkles size={13} color="#A78BFA" /> Products, HS-Codes or Niche (Optional)
            </label>
            <input
              type="text"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              placeholder="e.g. Spices HS 0910, Textiles, Fintech API, Solar Panels..."
              className="input-glass"
              style={{
                height: '44px',
                width: '100%',
                fontSize: '0.85rem',
                color: '#F8FAFC',
              }}
            />
          </div>

          {/* 4. Quantity Selector */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Leads To Scrape (Up to 10k+)
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="input-glass"
              style={{ height: '44px', cursor: 'pointer', width: '100%', fontSize: '0.85rem' }}
            >
              <option value={5} style={{ background: '#0F172A' }}>5 Verified Leads (Sample)</option>
              <option value={10} style={{ background: '#0F172A' }}>10 Verified Leads (Starter)</option>
              <option value={25} style={{ background: '#0F172A' }}>25 Verified Leads</option>
              <option value={50} style={{ background: '#0F172A' }}>50 Verified Leads</option>
              <option value={100} style={{ background: '#0F172A' }}>100 Verified Leads (Batch)</option>
              <option value={250} style={{ background: '#0F172A' }}>250 Verified Leads</option>
              <option value={500} style={{ background: '#0F172A' }}>500 Verified Leads (Growth)</option>
              <option value={1000} style={{ background: '#0F172A' }}>1,000 High-Volume Leads</option>
              <option value={5000} style={{ background: '#0F172A' }}>5,000 High-Volume Leads</option>
              <option value={10000} style={{ background: '#0F172A' }}>10,000 Enterprise Scale</option>
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={handleStartScrape}
            disabled={isScraping}
            className="btn-emerald"
            style={{
              height: '46px',
              padding: '0 28px',
              whiteSpace: 'nowrap',
              fontWeight: '700',
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isScraping ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Scraping {location || 'Target'}...
              </>
            ) : overageBatch === 0 ? (
              <>
                <Play size={16} fill="#021C11" /> Scrape {limit} Genuine {targetRole === 'SELLER' ? 'Sellers' : targetRole === 'HYBRID_TRADER' ? 'Traders' : 'Buyers'} (100% Free • Included in Plan)
              </>
            ) : freeBatch > 0 ? (
              <>
                <Play size={16} fill="#021C11" /> Scrape {limit} Leads ({freeBatch} Free + {overageBatch} Overage: {currency === 'INR' ? `₹${overageCostINR}` : `$${overageCostUSD}`})
              </>
            ) : (
              <>
                <Play size={16} fill="#021C11" /> Scrape {limit} Leads ({currency === 'INR' ? `₹${totalCostINR}` : `$${totalCostUSD}`} from Wallet)
              </>
            )}
          </button>
        </div>

        {/* Location Suggestion Chips (Tailored to Client Region) */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
            Quick Suggestion Chips ({isIndiaWorkspace ? 'India' : 'Global'}):
          </span>
          {locationSuggestions.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLocation(loc)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: location === loc ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: location === loc ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                color: location === loc ? '#34D399' : '#CBD5E1',
                fontSize: '0.725rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Live Plan Quota & Transparent Billing Breakdown Notice */}
        <div style={{
          marginTop: '16px',
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={18} color="#10B981" />
            <div style={{ fontSize: '0.8125rem', color: '#E2E8F0' }}>
              {overageBatch === 0 ? (
                <>
                  <strong style={{ color: '#34D399' }}>✓ 100% Free with Your {planInfo.name}</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    ({limit} leads will be deducted from your {remainingFreeQuota.toLocaleString()} free leads balance. Zero wallet charge).
                  </span>
                </>
              ) : freeBatch > 0 ? (
                <>
                  <strong style={{ color: '#38BDF8' }}>{freeBatch} Free Leads (Included in Plan)</strong>
                  <span style={{ color: '#CBD5E1', margin: '0 6px' }}>+</span>
                  <strong style={{ color: '#FBBF24' }}>{overageBatch} Overage Leads (${overageCostUSD} / ₹{overageCostINR})</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    (Only overage beyond monthly quota is billed to wallet).
                  </span>
                </>
              ) : (
                <>
                  <strong style={{ color: '#FBBF24' }}>Monthly Plan Quota Exhausted</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    • Batch cost: ${totalCostUSD} (~₹{totalCostINR}) for {limit} verified leads from wallet.
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Wallet Balance: <strong style={{ color: '#10B981' }}>{currency === 'INR' ? `₹${walletBalanceINR.toLocaleString('en-IN')}` : `$${walletBalanceUSD.toFixed(2)}`}</strong>
            </span>
            <button
              onClick={onOpenAddFundsModal}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
            >
              + Recharge Wallet
            </button>
          </div>
        </div>

        {/* Live Waterfall Progress Tracker Card */}
        {(isScraping || activeJobId) && (
          <div style={{
            marginTop: '22px',
            padding: '18px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            {/* Step badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {stepsList.map((step) => {
                const isPassed = progressData.percent >= (step.id / 4) * 100 || progressData.stepIndex > step.id;
                const isCurrent = progressData.stepIndex === step.id;
                return (
                  <div
                    key={step.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isPassed
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isCurrent
                        ? 'rgba(6, 182, 212, 0.15)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isPassed
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : isCurrent
                        ? '1px solid rgba(6, 182, 212, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : isCurrent ? (
                      <div className="live-dot" style={{ background: '#06B6D4' }} />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700' }}>{step.id}</span>
                    )}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: isPassed || isCurrent ? '600' : '400',
                      color: isPassed ? '#34D399' : isCurrent ? '#38BDF8' : '#94A3B8',
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar & message */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: '#F8FAFC', fontWeight: '500' }}>
                {progressData.message || 'Executing multi-source search and verification sequence...'}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#10B981' }}>
                {progressData.percent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
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

      {/* Filter and Bulk Actions Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Bulk Action Toolbar if rows are selected */}
        {selectedLeadIds.length > 0 && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F8FAFC' }}>
              🎯 {selectedLeadIds.length} Verified Leads Selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handleBulkAction('PUSH_EMAIL_CAMPAIGN')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                <Mail size={13} color="#06B6D4" /> Push to Email Sequence
              </button>
              <button
                onClick={() => handleBulkAction('TRIGGER_VOICE_CALL')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                <PhoneCall size={13} color="#10B981" /> Trigger Voice AI
              </button>
              <button
                onClick={() => handleBulkAction('SEND_WHATSAPP')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                <MessageSquare size={13} color="#34D399" /> WhatsApp Outbound
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                className="btn-icon"
                style={{ width: '32px', height: '32px' }}
                title="Delete Selected"
              >
                <Trash2 size={14} color="#F43F5E" />
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, corporate email, target domain, job title, location, or pitch..."
              className="input-glass"
              style={{ paddingLeft: '36px', height: '38px' }}
            />
          </div>

          {/* Stage filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            {['ALL', 'Prospect', 'Contacted', 'Qualified', 'Demo_Booked', 'Won'].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: stageFilter === stage ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: stageFilter === stage ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: stageFilter === stage ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: stageFilter === stage ? '600' : '400',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {stage === 'ALL' ? 'All' : stage.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Score Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              Min Fit Score: <strong>{minScore}</strong>
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
      </div>

      {/* Leads CRM Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}>
                <th style={{ padding: '14px 16px', width: '36px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '14px 8px', width: '36px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '14px 16px' }}>Contact & Executive Title</th>
                <th style={{ padding: '14px 16px' }}>Company & Domain</th>
                <th style={{ padding: '14px 16px' }}>Verified Email & MX Server</th>
                <th style={{ padding: '14px 16px' }}>Phone / Location</th>
                <th style={{ padding: '14px 16px' }}>AI Fit Score</th>
                <th style={{ padding: '14px 16px' }}>Pipeline Stage</th>
                <th style={{ padding: '14px 16px' }}>Channels</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={32} color="#64748B" />
                      <div style={{ fontSize: '0.875rem', color: '#E2E8F0', fontWeight: '600' }}>
                        No verified leads in workspace yet
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Enter your target location above (e.g. "Dallas, Texas" or "London, UK"), then click "Scrape Genuine Leads".
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
                        <td style={{ padding: '14px 8px', textAlign: 'center', color: '#64748B', fontWeight: '700', fontSize: '0.75rem' }}>
                          {idx + 1}
                        </td>

                        {/* Contact Info */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#38BDF8',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                            }}>
                              {lead.name.substring(0, 1)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#F8FAFC' }}>{lead.name}</div>
                              <div style={{ fontSize: '0.725rem', color: '#38BDF8', fontWeight: '500' }}>
                                {lead.title || 'Decision Maker'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company & Website */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: '600', color: '#E2E8F0' }}>{lead.company || 'Enterprise'}</div>
                            {lead.entityRole && (
                              <span
                                style={{
                                  fontSize: '0.625rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '700',
                                  background:
                                    lead.entityRole === 'SELLER'
                                      ? 'rgba(245, 158, 11, 0.2)'
                                      : lead.entityRole === 'HYBRID_TRADER'
                                      ? 'rgba(139, 92, 246, 0.2)'
                                      : lead.entityRole === 'DECISION_MAKER'
                                      ? 'rgba(59, 130, 246, 0.2)'
                                      : 'rgba(6, 182, 212, 0.2)',
                                  color:
                                    lead.entityRole === 'SELLER'
                                      ? '#FBBF24'
                                      : lead.entityRole === 'HYBRID_TRADER'
                                      ? '#A78BFA'
                                      : lead.entityRole === 'DECISION_MAKER'
                                      ? '#60A5FA'
                                      : '#38BDF8',
                                  border:
                                    lead.entityRole === 'SELLER'
                                      ? '1px solid rgba(245, 158, 11, 0.4)'
                                      : lead.entityRole === 'HYBRID_TRADER'
                                      ? '1px solid rgba(139, 92, 246, 0.4)'
                                      : lead.entityRole === 'DECISION_MAKER'
                                      ? '1px solid rgba(59, 130, 246, 0.4)'
                                      : '1px solid rgba(6, 182, 212, 0.4)',
                                }}
                              >
                                {lead.entityRole === 'SELLER'
                                  ? '🏭 SELLER'
                                  : lead.entityRole === 'HYBRID_TRADER'
                                  ? '🌐 TRADER'
                                  : lead.entityRole === 'DECISION_MAKER'
                                  ? '👔 C-SUITE'
                                  : '🛒 BUYER'}
                              </span>
                            )}
                          </div>
                          {lead.tradeDetails?.verificationAudit && (
                            <div
                              style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px', lineHeight: '1.2' }}
                              title={lead.tradeDetails.verificationAudit}
                            >
                              {lead.tradeDetails.verificationAudit.length > 50
                                ? lead.tradeDetails.verificationAudit.substring(0, 50) + '...'
                                : lead.tradeDetails.verificationAudit}
                            </div>
                          )}
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

                        {/* Verified Email & Live MX Badge */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#F8FAFC', fontWeight: '500' }}>{lead.email}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                            {isVerified ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                <ShieldCheck size={10} /> DNS MX Verified
                              </span>
                            ) : (
                              <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                <AlertTriangle size={10} /> Unverified
                              </span>
                            )}
                            {lead.mxHost && (
                              <span style={{ fontSize: '0.65rem', color: '#94A3B8' }} title={`Mailserver Host: ${lead.mxHost}`}>
                                ({lead.mxHost.split('.')[0]})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone & Location */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ color: lead.phone ? '#10B981' : 'var(--text-dim)', fontWeight: '500' }}>
                            {lead.phone || 'Direct Extension active'}
                          </div>
                          {lead.location && (
                            <div style={{ fontSize: '0.685rem', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={10} color="#64748B" /> {lead.location}
                            </div>
                          )}
                        </td>

                        {/* AI Fit Score */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '42px',
                              height: '6px',
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
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: lead.score >= 80 ? '#34D399' : '#38BDF8',
                            }}>
                              {lead.score}
                            </span>
                          </div>
                        </td>

                        {/* Pipeline Stage Selector */}
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead._id, e.target.value)}
                            style={{
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#F8FAFC',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
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
                                <Mail size={15} />
                              </a>
                            )}
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} title={`Phone: ${lead.phone}`} style={{ color: '#34D399' }}>
                                <Phone size={15} />
                              </a>
                            )}
                            {lead.channels?.whatsapp && (
                              <span title={`WhatsApp: ${lead.channels.whatsapp}`} style={{ color: '#10B981' }}>
                                <MessageSquare size={15} />
                              </span>
                            )}
                            {lead.channels?.linkedin && (
                              <a href={lead.channels.linkedin} target="_blank" rel="noreferrer" title="LinkedIn Profile" style={{ color: '#06B6D4' }}>
                                <Globe size={15} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setExpandedNotesId(isNotesExpanded ? null : lead._id)}
                              className="btn-icon"
                              style={{ width: '28px', height: '28px' }}
                              title="View Strategy Outreach Pitch"
                            >
                              <Info size={13} color={isNotesExpanded ? '#38BDF8' : '#94A3B8'} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              className="btn-icon"
                              style={{ width: '28px', height: '28px' }}
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
