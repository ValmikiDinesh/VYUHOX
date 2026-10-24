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
  Sliders,
  PhoneCall,
  Check,
  Layers,
  Building2,
  MapPin,
  Briefcase,
  Target,
  FileText,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../services/api';

const GEO_LOCATIONS = [
  'United States (National / Multi-Region)',
  'San Francisco Bay Area / Silicon Valley, CA',
  'New York City Metro Area, NY',
  'Washington DC / Northern Virginia (Federal & Defense)',
  'London & Greater London, United Kingdom',
  'European Financial Hubs (Frankfurt, Zurich, Paris)',
  'Singapore & APAC Financial Center',
  'Toronto & Waterloo Tech Corridor, Canada',
  'Bengaluru & Hyderabad Tech Hub, India',
  'Global / Distributed Remote',
];

const COMPANY_TIERS = [
  'Fortune 500 / Global Enterprise (10,000+ employees)',
  'Enterprise (1,000 – 9,999 employees)',
  'Mid-Market (100 – 999 employees)',
  'High-Growth Scaleups (25 – 99 employees)',
];

export default function LeadFinder({
  activeWorkspace,
  leads = [],
  onRefreshLeads,
  onOpenNewLeadModal,
  onOpenBulkImportModal,
  socket,
}) {
  // Strategy & Business Context State
  const [strategy, setStrategy] = useState(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);

  // Scraper Controls
  const [searchType, setSearchType] = useState('directory'); // directory | domain | registry
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('United States (National / Multi-Region)');
  const [targetPersona, setTargetPersona] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  const [companyTier, setCompanyTier] = useState('Enterprise (1,000 – 9,999 employees)');
  const [limit, setLimit] = useState(10);
  const [isScraping, setIsScraping] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [expandedNotesId, setExpandedNotesId] = useState(null);

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
          const strat = res.strategy;
          setStrategy(strat);

          const icp = strat.analysisResult?.targetAudience || {};
          const dMakers = icp.decisionMakers || [];

          if (dMakers.length > 0) {
            setTargetPersona(dMakers[0]);
          } else if (icp.primaryPersona) {
            setTargetPersona(icp.primaryPersona.split(',')[0].trim());
          } else {
            setTargetPersona('Chief Information Security Officer (CISO)');
          }

          if (strat.category) {
            setQuery(strat.category);
          }
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
      setProgressData({
        step: 'INGESTED_TO_CRM',
        stepIndex: 4,
        totalSteps: 4,
        message: `Waterfall scrape complete! ${data.count} genuine, MX-verified leads saved to CRM.`,
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

  // 3. Launch Waterfall Scraper with Calibrated Strategy Data
  const handleStartScrape = async () => {
    if (!activeWorkspace) return;
    setIsScraping(true);

    const personaToUse = targetPersona === 'CUSTOM' ? customPersona : targetPersona;
    const businessName = strategy?.businessName || activeWorkspace.name;

    setProgressData({
      step: 'SOURCE_DISCOVERY',
      stepIndex: 1,
      totalSteps: 4,
      message: `Calibrating scraper for ${businessName}. Discovering live corporate accounts in ${location}...`,
      percent: 15,
    });

    try {
      const res = await api.startScraper(activeWorkspace._id, {
        searchType,
        query: query || strategy?.category || 'Enterprise B2B',
        location,
        targetPersona: personaToUse,
        limit,
        companyTier,
      });
      if (res.success) {
        setActiveJobId(res.jobId);
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
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesScore && matchesSearch;
  });

  const stepsList = [
    { id: 1, label: 'Account Discovery', key: 'SOURCE_DISCOVERY' },
    { id: 2, label: 'Executive Resolution', key: 'METADATA_ENRICHMENT' },
    { id: 3, label: 'Live DNS MX Handshake', key: 'DNS_MX_VERIFICATION' },
    { id: 4, label: 'CRM Ingestion', key: 'INGESTED_TO_CRM' },
  ];

  const strategyDecisionMakers = strategy?.analysisResult?.targetAudience?.decisionMakers || [
    'Chief Information Security Officer (CISO)',
    'Chief Technology Officer (CTO)',
    'Head of Application Security (AppSec)',
    'Principal Cryptographer & Enterprise Architect',
  ];

  const currentBusinessName = strategy?.businessName || activeWorkspace?.name || 'Your Business';
  const currentCategory = strategy?.category || activeWorkspace?.industry || 'B2B Enterprise';

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald">
              <Sparkles size={13} />
              GENUINE REAL-TIME LEAD SCRAPER
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Live DNS MX Mailserver Handshake
            </span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800' }}>
            Real-Time Lead Scraping & Verification Engine
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Scrape genuine enterprise decision makers with validated DNS mailserver routing, direct extensions, and custom outreach pitches. Zero dummy data.
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

      {/* GTM Synchronized Intelligence Banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#021C11',
            fontWeight: '800',
            fontSize: '1.1rem',
          }}>
            🎯
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F8FAFC' }}>
                Calibrated to: {currentBusinessName}
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                {currentCategory}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Targeting: {strategy?.analysisResult?.targetAudience?.primaryPersona || 'Key Decision Makers & Architects'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94A3B8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34D399' }}>
            <Check size={14} /> DNS MX Verified
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38BDF8' }}>
            <Check size={14} /> RFC 5322 Syntax
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A78BFA' }}>
            <Check size={14} /> Multi-Channel CRM Ready
          </span>
        </div>
      </div>

      {/* Discovery Control Bar */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Source Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
            Discovery Engine:
          </span>
          {[
            { id: 'directory', label: 'Enterprise Decision Makers & B2B Executives', icon: Globe },
            { id: 'domain', label: 'Target Account Domain Crawl', icon: Layers },
            { id: 'registry', label: 'High-Assurance Corporate Registry', icon: Building2 },
          ].map((src) => {
            const Icon = src.icon;
            const isSelected = searchType === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setSearchType(src.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isSelected ? '#38BDF8' : '#94A3B8'} />
                <span>{src.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Parameters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          {/* Target Persona Dropdown from Crawled Strategy */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Briefcase size={13} color="#06B6D4" /> Target Decision Maker (Persona)
            </label>
            <select
              value={targetPersona}
              onChange={(e) => setTargetPersona(e.target.value)}
              className="input-glass"
              style={{ height: '42px', cursor: 'pointer', width: '100%' }}
            >
              {strategyDecisionMakers.map((role, idx) => (
                <option key={idx} value={role} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  {role}
                </option>
              ))}
              <option value="CUSTOM" style={{ background: '#0F172A', color: '#38BDF8' }}>
                + Custom Decision Maker Title...
              </option>
            </select>
            {targetPersona === 'CUSTOM' && (
              <input
                type="text"
                value={customPersona}
                onChange={(e) => setCustomPersona(e.target.value)}
                placeholder="e.g. Chief Security Architect or VP Infrastructure"
                className="input-glass"
                style={{ height: '36px', marginTop: '6px', width: '100%' }}
              />
            )}
          </div>

          {/* Geographic Location Hub */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <MapPin size={13} color="#10B981" /> Target Geographic Hub
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-glass"
              style={{ height: '42px', cursor: 'pointer', width: '100%' }}
            >
              {GEO_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={loc} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Company Scale / Tier */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Building2 size={13} color="#A78BFA" /> Target Company Scale
            </label>
            <select
              value={companyTier}
              onChange={(e) => setCompanyTier(e.target.value)}
              className="input-glass"
              style={{ height: '42px', cursor: 'pointer', width: '100%' }}
            >
              {COMPANY_TIERS.map((tier, idx) => (
                <option key={idx} value={tier} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  {tier}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query / Niche Focus */}
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Target size={13} color="#F59E0B" />
              {searchType === 'domain' ? 'Target Domain URL' : 'Industry / Niche Focus'}
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'domain' ? 'e.g. crowdstrike.com or stripe.com' : 'e.g. Cybersecurity, PQC & AST'}
              className="input-glass"
              style={{ height: '42px', width: '100%' }}
            />
          </div>

          {/* Batch Limit */}
          <div style={{ maxWidth: '140px' }}>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Batch Limit
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="input-glass"
              style={{ height: '42px', cursor: 'pointer', width: '100%' }}
            >
              <option value={5} style={{ background: '#0F172A' }}>5 Verified Leads</option>
              <option value={10} style={{ background: '#0F172A' }}>10 Verified Leads</option>
              <option value={25} style={{ background: '#0F172A' }}>25 Verified Leads</option>
              <option value={50} style={{ background: '#0F172A' }}>50 Verified Leads</option>
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Quick Strategy Focus Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
              Strategy Targeting Shortcuts:
            </span>
            {strategyDecisionMakers.slice(0, 3).map((dm, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTargetPersona(dm)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: targetPersona === dm ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: targetPersona === dm ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: targetPersona === dm ? '#38BDF8' : '#CBD5E1',
                  fontSize: '0.725rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{dm.split('(')[0].trim()}</span>
                <ChevronRight size={11} color="#64748B" />
              </button>
            ))}
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStartScrape}
            disabled={isScraping}
            className="btn-emerald"
            style={{
              height: '44px',
              padding: '0 24px',
              whiteSpace: 'nowrap',
              fontWeight: '700',
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            {isScraping ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Scraping & Verifying DNS...
              </>
            ) : (
              <>
                <Play size={16} fill="#021C11" /> Scrape Verified Leads for {currentBusinessName}
              </>
            )}
          </button>
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
                {progressData.message || 'Executing live DNS waterfall enrichment sequence...'}
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
              placeholder="Search leads by name, corporate email, target domain, job title, or pitch..."
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

      {/* Leads Table */}
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
                <th style={{ padding: '14px 16px' }}>Contact & Executive Title</th>
                <th style={{ padding: '14px 16px' }}>Company & Domain</th>
                <th style={{ padding: '14px 16px' }}>Verified Email & MX Server</th>
                <th style={{ padding: '14px 16px' }}>Phone / Direct Ext</th>
                <th style={{ padding: '14px 16px' }}>AI Fit Score</th>
                <th style={{ padding: '14px 16px' }}>Pipeline Stage</th>
                <th style={{ padding: '14px 16px' }}>Channels</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={32} color="#64748B" />
                      <div style={{ fontSize: '0.875rem', color: '#E2E8F0', fontWeight: '600' }}>
                        No verified leads in workspace yet
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Configure your target decision maker and location above, then click "Scrape Verified Leads for {currentBusinessName}".
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
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
                          <div style={{ fontWeight: '600', color: '#E2E8F0' }}>{lead.company || 'Enterprise'}</div>
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

                        {/* Phone / Voice */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ color: lead.phone ? '#10B981' : 'var(--text-dim)', fontWeight: '500' }}>
                            {lead.phone || 'No direct phone'}
                          </div>
                          {lead.location && (
                            <div style={{ fontSize: '0.685rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {lead.location}
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
                            {lead.channels?.telegram && (
                              <span title={`Telegram: ${lead.channels.telegram}`} style={{ color: '#38BDF8' }}>
                                <Send size={15} />
                              </span>
                            )}
                            {lead.channels?.linkedin && (
                              <a
                                href={lead.channels.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                title="LinkedIn Profile Search"
                                style={{ color: '#60A5FA', display: 'flex', alignItems: 'center' }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                  <rect x="2" y="9" width="4" height="12"/>
                                  <circle cx="4" cy="4" r="2"/>
                                </svg>
                              </a>
                            )}
                            {lead.notes && (
                              <button
                                onClick={() => setExpandedNotesId(isNotesExpanded ? null : lead._id)}
                                title="View Strategy Outreach Pitch"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  color: isNotesExpanded ? '#38BDF8' : '#64748B',
                                }}
                              >
                                <FileText size={15} />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Row Action */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="btn-icon"
                            style={{ width: '28px', height: '28px' }}
                            title="Delete Lead"
                          >
                            <Trash2 size={13} color="#F43F5E" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Strategy Outreach Pitch Row */}
                      {isNotesExpanded && (
                        <tr style={{ background: 'rgba(6, 182, 212, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td colSpan={9} style={{ padding: '12px 18px 14px 50px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              fontSize: '0.75rem',
                              color: '#E2E8F0',
                              background: 'rgba(0, 0, 0, 0.25)',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(6, 182, 212, 0.2)',
                            }}>
                              <Sparkles size={14} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <span style={{ fontWeight: '700', color: '#38BDF8' }}>
                                  Strategy Outreach Pitch & Pitch Angle:
                                </span>{' '}
                                <span>{lead.notes}</span>
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
