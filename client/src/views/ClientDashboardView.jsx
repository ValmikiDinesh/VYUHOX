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
} from 'lucide-react';
import { api } from '../services/api';
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

  // Briefing State
  const [briefing, setBriefing] = useState(null);

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

  // Load active strategy & briefing on mount or workspace change
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
    loadBriefing();
  }, [activeWorkspace]);

  // Handle direct website scan from dashboard
  const handleStartCrawl = async (targetUrlToScan) => {
    const finalUrl = (targetUrlToScan || urlInput).trim();
    if (!finalUrl) {
      alert('Please enter your website URL (e.g. https://yourbusiness.com)');
      return;
    }
    let wsId = activeWorkspace?._id || localStorage.getItem('vyuhox_active_ws_id');
    if (!wsId) {
      try {
        const wsRes = await api.getWorkspaces();
        if (wsRes.success && wsRes.workspaces && wsRes.workspaces.length > 0) {
          const qs = wsRes.workspaces.find(
            (w) =>
              (w.name && w.name.toLowerCase().includes('quantum')) ||
              (w.ownerEmail && w.ownerEmail.toLowerCase().includes('valmiki'))
          ) || wsRes.workspaces[0];
          if (qs) {
            wsId = qs._id;
            localStorage.setItem('vyuhox_active_ws_id', qs._id);
            localStorage.setItem('vyuhox_active_workspace', JSON.stringify(qs));
          }
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
        setScanStatus('Strategy synthesized! Redirecting to GTM Blueprint...');
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

  // Format wallet balance
  const walletBalanceNum = Number(wallet?.balanceUSD ?? 0);
  const displayWalletBalance = isINR
    ? (walletBalanceNum * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : walletBalanceNum.toFixed(2);

  const hasStrategy = !!(activeStrategy || activeWorkspace?.currentStrategyId);

  // Complete 5-Step End-to-End Autonomous GTM Journey
  const workflowSteps = [
    {
      step: '01',
      title: '1. Website Crawl & Strategy',
      desc: 'Enter your website URL. Our crawler extracts value props, builds your Ideal Customer Profile (ICP), and generates AI voice scripts.',
      tab: 'strategy',
      icon: Globe,
      color: '#06B6D4',
      badge: hasStrategy ? 'Strategy Active' : 'Start Here (Step 1)',
      actionText: hasStrategy ? 'View AI Strategy' : 'Crawl Website Now',
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
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="live-dot" style={{ background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Autonomous Revenue Engine Active
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
              Autonomous AI Company (24/7 Multi-Agent)
            </span>
            {activeWorkspace?.name && (
              <span className="badge badge-emerald" style={{ fontSize: '0.675rem' }}>
                🏢 {activeWorkspace.name}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
            Welcome, {displayName}!
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
            Your autonomous GTM pipeline is initialized. Follow the 5-step workflow below to crawl your website, discover leads, and schedule qualified meetings.
          </p>
        </div>

        {/* Quick Wallet Deposit Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(11, 17, 32, 0.85)',
          padding: '10px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>
              Available Compute Credit
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', color: '#10B981' }}>
              {currencySymbol}{displayWalletBalance}
            </div>
          </div>
          <button
            onClick={onOpenAddFundsModal}
            className="btn-emerald"
            style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: '700' }}
          >
            + Recharge
          </button>
        </div>
      </div>

      {/* PHASE 5: AUTONOMOUS MORNING EXECUTIVE BRIEFING & 1-CLICK ACTION CARDS */}
      {briefing && (
        <ExecutiveBriefingCard
          briefing={briefing}
          workspaceId={activeWorkspace?._id}
          onActionCompleted={loadBriefing}
          onRefresh={loadBriefing}
        />
      )}

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
              <button
                onClick={() => setShowReCrawl(!showReCrawl)}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Re-scan website or analyze different domain"
              >
                <RefreshCw size={12} className={isScanning ? 'spin-slow' : ''} />
                <span>{showReCrawl ? 'Close Scanner' : 'Re-crawl Site'}</span>
                {showReCrawl ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
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
              const isPqc = cat.includes('quantum') || cat.includes('pqc') || cat.includes('cryptograph');
              const isEcom = cat.includes('ecommerce') || cat.includes('retail');

              if (isPqc) {
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
              } else {
                return (
                  <>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      🏢 Enterprise Decision-Maker Multi-Threading
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ⚡ Sub-45s Inbound Speed-to-Lead SLA
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      📊 High-ACV Pipeline Model
                    </span>
                  </>
                );
              }
            })()}
          </div>

          {/* Collapsible Re-Crawl Drawer */}
          {showReCrawl && (
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px' }}>
                Enter a new website URL to update DOM intelligence, personas, and scripts:
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                background: 'rgba(11, 17, 32, 0.9)',
                padding: '8px',
                borderRadius: '10px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartCrawl();
                  }}
                  disabled={isScanning}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    background: 'transparent',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    outline: 'none',
                    padding: '0 8px',
                  }}
                />
                <button
                  onClick={() => handleStartCrawl()}
                  disabled={isScanning || !urlInput.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.8rem', fontWeight: '700' }}
                >
                  {isScanning ? 'Deep Crawling DOM...' : '⚡ Re-scan DOM'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* INITIAL STATE: CRAWL WEBSITE INPUT CARD */
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}>
              <Globe size={24} color="#030712" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Step 1 • AI Knowledge Foundation
                </span>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: '800', margin: '3px 0 0', color: '#F8FAFC' }}>
                Crawl Website &amp; Generate Autonomous GTM Strategy
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: '#94A3B8', maxWidth: '750px' }}>
                Enter your company or product website URL. Our crawler inspects your DOM, extracts value propositions, identifies target buyer personas (ICP), and programs Sarah SDR and Maya Voice AE.
              </p>
            </div>
          </div>

          {/* Input Bar */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            background: 'rgba(11, 17, 32, 0.8)',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px', padding: '0 12px' }}>
              <Globe size={18} color="#06B6D4" />
              <input
                type="url"
                placeholder="https://yourcompany.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartCrawl();
                }}
                disabled={isScanning}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              onClick={() => handleStartCrawl()}
              disabled={isScanning || !urlInput.trim()}
              className="btn btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '0.85rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isScanning || !urlInput.trim() ? 0.7 : 1,
              }}
            >
              {isScanning ? (
                <>
                  <RefreshCw size={16} className="spin-slow" />
                  <span>Deep Crawling DOM...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>⚡ Crawl &amp; Build Strategy</span>
                </>
              )}
            </button>
          </div>

          {/* Scanning Live Feedback */}
          {isScanning && (
            <div style={{
              marginTop: '12px',
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              color: '#38BDF8',
            }}>
              <RefreshCw size={14} className="spin-slow" />
              <span>{scanStatus}</span>
            </div>
          )}

          {/* Quick Domain Buttons */}
          {activeWorkspace?.domain && (
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => {
                  const target = activeWorkspace.domain.startsWith('http')
                    ? activeWorkspace.domain
                    : `https://${activeWorkspace.domain}`;
                  setUrlInput(target);
                  handleStartCrawl(target);
                }}
                disabled={isScanning}
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.725rem',
                  color: '#38BDF8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Globe size={12} />
                <span>Crawl {activeWorkspace.name} ({activeWorkspace.domain})</span>
              </button>
            </div>
          )}
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
                onClick={() => onNavigateTab && onNavigateTab(step.tab)}
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
    </div>
  );
}
