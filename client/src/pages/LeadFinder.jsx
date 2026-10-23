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
} from 'lucide-react';
import { api } from '../services/api';

export default function LeadFinder({
  activeWorkspace,
  leads = [],
  onRefreshLeads,
  onOpenNewLeadModal,
  onOpenBulkImportModal,
  socket,
}) {
  // Scraper Controls
  const [searchType, setSearchType] = useState('directory'); // directory | domain | traders
  const [query, setQuery] = useState('B2B SaaS Founders');
  const [location, setLocation] = useState('San Francisco, CA');
  const [targetPersona, setTargetPersona] = useState('Founder & CEO');
  const [limit, setLimit] = useState(6);
  const [isScraping, setIsScraping] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);

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

  // Preset quick searches
  const presets = [
    {
      label: 'SaaS Seed Founders',
      type: 'directory',
      q: 'AI & SaaS Founders',
      loc: 'San Francisco, CA',
      persona: 'Founder & CEO',
    },
    {
      label: 'High-Volume Crypto Whales',
      type: 'traders',
      q: 'Liquid Trading & OTC Desks',
      loc: 'Global / Crypto Desks',
      persona: 'Managing Partner & CIO',
    },
    {
      label: 'D2C Apparel Brands',
      type: 'directory',
      q: 'D2C Consumer Brands',
      loc: 'New York, NY',
      persona: 'VP of Growth & CMO',
    },
    {
      label: 'Domain Team Crawl',
      type: 'domain',
      q: 'linear.app',
      loc: 'Remote',
      persona: 'Head of Product Marketing',
    },
  ];

  // 1. Listen to Socket.io live scraper events
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

    const handleLeadFound = (data) => {
      if (onRefreshLeads) onRefreshLeads();
    };

    const handleComplete = (data) => {
      setIsScraping(false);
      setProgressData({
        step: 'INGESTED_TO_CRM',
        stepIndex: 4,
        totalSteps: 4,
        message: `Waterfall scrape complete! ${data.count} verified leads added to CRM.`,
        percent: 100,
      });
      if (onRefreshLeads) onRefreshLeads();
      setTimeout(() => {
        setActiveJobId(null);
      }, 5000);
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

  // 2. Launch Waterfall Scraper
  const handleStartScrape = async () => {
    if (!activeWorkspace) return;
    setIsScraping(true);
    setProgressData({
      step: 'SOURCE_DISCOVERY',
      stepIndex: 1,
      totalSteps: 4,
      message: `Initiating ${searchType} discovery for "${query}"...`,
      percent: 15,
    });

    try {
      const res = await api.startScraper(activeWorkspace._id, {
        searchType,
        query,
        location,
        targetPersona,
        limit,
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

  // 3. Selection Handlers
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

  // 4. Bulk Action Handler
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

  // 5. Update Single Lead Stage
  const handleStageChange = async (leadId, newStage) => {
    if (!activeWorkspace) return;
    try {
      await api.updateLeadStage(activeWorkspace._id, leadId, newStage);
      if (onRefreshLeads) onRefreshLeads();
    } catch (err) {
      console.error('Stage change failed:', err);
    }
  };

  // 6. Delete Single Lead
  const handleDeleteLead = async (leadId) => {
    if (!activeWorkspace) return;
    try {
      await api.deleteLead(activeWorkspace._id, leadId);
      if (onRefreshLeads) onRefreshLeads();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // 7. Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesStage = stageFilter === 'ALL' || lead.stage === stageFilter;
    const matchesScore = lead.score >= minScore;
    const matchesSearch =
      searchTerm === '' ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesScore && matchesSearch;
  });

  const stepsList = [
    { id: 1, label: 'Source Scraping', key: 'SOURCE_DISCOVERY' },
    { id: 2, label: 'Metadata Enrichment', key: 'METADATA_ENRICHMENT' },
    { id: 3, label: 'DNS / MX Verification', key: 'DNS_MX_VERIFICATION' },
    { id: 4, label: 'CRM Ingestion', key: 'INGESTED_TO_CRM' },
  ];

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald">
              <Sparkles size={13} />
              WATERFALL LEAD SCRAPER & ENRICHMENT
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Apollo + Clay Layer Active
            </span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800' }}>
            Multi-Source Waterfall Discovery & DNS Enrichment
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Prospect across Google directories, domain employee crawls, and Web3 trader wallets with real-time MX verification.
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

      {/* Discovery Control Bar */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Source Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
            Discovery Engine:
          </span>
          {[
            { id: 'directory', label: 'Web & Local Directories', icon: Globe },
            { id: 'domain', label: 'Domain Crawl & Team Finder', icon: Layers },
            { id: 'traders', label: 'High-Volume Traders / Web3', icon: Coins },
          ].map((src) => {
            const Icon = src.icon;
            const isSelected = searchType === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setSearchType(src.id)}
                style={{
                  padding: '7px 14px',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 120px auto', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {searchType === 'domain' ? 'Target Website / Domain' : 'Keyword / Industry Niche'}
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'domain' ? 'e.g. linear.app or hedgex.io' : 'e.g. SaaS Founders or Crypto Funds'}
              className="input-glass"
              style={{ height: '40px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Geographic Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or London, UK"
              className="input-glass"
              style={{ height: '40px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Target Decision Maker
            </label>
            <input
              type="text"
              value={targetPersona}
              onChange={(e) => setTargetPersona(e.target.value)}
              placeholder="e.g. Founder & CEO or CRO"
              className="input-glass"
              style={{ height: '40px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Batch Limit
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="input-glass"
              style={{ height: '40px', cursor: 'pointer' }}
            >
              <option value={4}>4 Leads</option>
              <option value={6}>6 Leads</option>
              <option value={10}>10 Leads</option>
              <option value={20}>20 Leads</option>
            </select>
          </div>

          <button
            onClick={handleStartScrape}
            disabled={isScraping}
            className="btn-emerald"
            style={{ height: '40px', padding: '0 20px', whiteSpace: 'nowrap' }}
          >
            {isScraping ? (
              <>
                <span className="live-dot" style={{ background: '#021C11' }} /> Scraping...
              </>
            ) : (
              <>
                <Play size={15} fill="#021C11" /> Start Waterfall Scrape
              </>
            )}
          </button>
        </div>

        {/* 1-Click Preset Queries */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
            1-Click Test Scenarios:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchType(preset.type);
                setQuery(preset.q);
                setLocation(preset.loc);
                setTargetPersona(preset.persona);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#CBD5E1',
                fontSize: '0.725rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{preset.label}</span>
              <ChevronRight size={11} color="#64748B" />
            </button>
          ))}
        </div>

        {/* Live Waterfall Progress Tracker Card */}
        {(isScraping || activeJobId) && (
          <div style={{
            marginTop: '20px',
            padding: '18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)',
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
                const isCurrent = progressData.stepIndex === step.id || (isScraping && progressData.percent < (step.id / 4) * 100 && progressData.percent >= ((step.id - 1) / 4) * 100);
                return (
                  <div
                    key={step.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isPassed ? 'rgba(16, 185, 129, 0.15)' : isCurrent ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isPassed ? '1px solid rgba(16, 185, 129, 0.4)' : isCurrent ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : isCurrent ? (
                      <span className="live-dot" style={{ background: '#06B6D4' }} />
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
              <span style={{ fontSize: '0.8rem', color: '#F8FAFC', fontWeight: '500' }}>
                {progressData.message || 'Executing waterfall enrichment sequence...'}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10B981' }}>
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
              🎯 {selectedLeadIds.length} Leads Selected
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
              placeholder="Search by name, company, email, job title..."
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
              Min Score: <strong>{minScore}</strong>
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
                <th style={{ padding: '14px 16px' }}>Contact & Title</th>
                <th style={{ padding: '14px 16px' }}>Company & Web</th>
                <th style={{ padding: '14px 16px' }}>Verified Email</th>
                <th style={{ padding: '14px 16px' }}>Phone / Voice</th>
                <th style={{ padding: '14px 16px' }}>AI Fit Score</th>
                <th style={{ padding: '14px 16px' }}>Pipeline Stage</th>
                <th style={{ padding: '14px 16px' }}>Channels</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No leads found. Click "Start Waterfall Scrape" above to discover verified prospects.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isChecked = selectedLeadIds.includes(lead._id);
                  const isVerified = lead.verificationStatus === 'VERIFIED';
                  return (
                    <tr
                      key={lead._id}
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
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#38BDF8',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                          }}>
                            {lead.name.substring(0, 1)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#F8FAFC' }}>{lead.name}</div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>{lead.title || 'Decision Maker'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Company & Website */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '500', color: '#E2E8F0' }}>{lead.company || 'Enterprise'}</div>
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
                            }}
                          >
                            <ExternalLink size={10} /> {lead.website.replace(/https?:\/\//, '')}
                          </a>
                        )}
                      </td>

                      {/* Verified Email & MX Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#F8FAFC', fontWeight: '500' }}>{lead.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {isVerified ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                              <ShieldCheck size={10} /> MX Verified
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                              <AlertTriangle size={10} /> Unverified
                            </span>
                          )}
                          {lead.mxHost && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
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
                          <div style={{ fontSize: '0.685rem', color: 'var(--text-dim)' }}>
                            {lead.location}
                          </div>
                        )}
                      </td>

                      {/* AI Score */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '40px',
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
                            <a href={lead.channels.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: '#60A5FA', display: 'flex', alignItems: 'center' }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                <rect x="2" y="9" width="4" height="12"/>
                                <circle cx="4" cy="4" r="2"/>
                              </svg>
                            </a>
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
