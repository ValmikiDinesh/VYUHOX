import React from 'react';
import {
  Users,
  Target,
  DollarSign,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Bot,
  PhoneCall,
  Mail,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardView({
  activeWorkspace,
  operatingMode,
  stats,
  leads = [],
  wallet,
  onNavigateToLeads,
  onOpenAddFundsModal,
  onToggleOperatingMode,
}) {
  const isAiMode = operatingMode === 'AI_COMPANY';

  const kpis = [
    {
      label: 'Total Pipeline Leads',
      value: stats?.totalLeads || leads.length || 0,
      change: '+24% this week',
      isPositive: true,
      icon: Users,
      color: '#06B6D4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
    },
    {
      label: 'Conversion Rate',
      value: `${stats?.conversionRate || '14.2'}%`,
      change: '+3.8% vs benchmark',
      isPositive: true,
      icon: Target,
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
    },
    {
      label: 'Estimated Pipeline Value',
      value: `$${(stats?.pipelineValue || 18500).toLocaleString()}`,
      change: 'Active deal potential',
      isPositive: true,
      icon: DollarSign,
      color: '#8B5CF6',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
    },
    {
      label: 'Autonomous AI Actions',
      value: isAiMode ? '2,840' : '142',
      change: 'Autonomous Multi-Agent AI Active',
      isPositive: isAiMode,
      icon: Zap,
      color: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
    },
  ];

  const stageKeys = [
    { key: 'Prospect', label: 'Prospects', color: '#94A3B8' },
    { key: 'Contacted', label: 'Contacted', color: '#38BDF8' },
    { key: 'Qualified', label: 'Qualified', color: '#818CF8' },
    { key: 'Demo_Booked', label: 'Demo Booked', color: '#FBBF24' },
    { key: 'Won', label: 'Won / Closed', color: '#34D399' },
  ];

  const industryName = activeWorkspace?.industry || activeWorkspace?.businessCategory || 'Target Ecosystem';
  const companyName = activeWorkspace?.branding?.companyName || activeWorkspace?.name || 'Our Company';
  const isInvites = /invit(e|ation)|wedding|stationery|toran|gifting/i.test(`${industryName} ${companyName}`);

  const liveFeed = (leads && leads.length > 0)
    ? leads.slice(0, 4).map((l, idx) => ({
        id: l._id || idx,
        type: idx % 2 === 0 ? 'whatsapp' : 'voice',
        title: idx % 2 === 0 ? 'Omnichannel Outreach Delivered' : 'Voice AI Speed-to-Lead Follow-up',
        desc: `${l.name} (${l.company || industryName}) — Stage: ${l.stage || 'Prospect'}.`,
        time: `${(idx + 1) * 8} mins ago`,
        icon: idx % 2 === 0 ? MessageCircle : PhoneCall,
        color: idx % 2 === 0 ? '#10B981' : '#06B6D4',
      }))
    : [
        {
          id: 1,
          type: 'voice',
          title: 'Speed-to-Lead Call Scheduled',
          desc: isInvites
            ? 'Autonomous voice agent ready to pitch bridal lookbook to luxury wedding planners.'
            : `Autonomous agent connected with qualified decision makers for ${companyName}.`,
          time: '2 mins ago',
          icon: PhoneCall,
          color: '#06B6D4',
        },
        {
          id: 2,
          type: 'whatsapp',
          title: 'Omnichannel Lookbook Sequence Prepared',
          desc: isInvites
            ? 'Interactive WhatsApp lookbook sequence calibrated for couples and wedding coordinators.'
            : `Bespoke outreach sequence calibrated for ${industryName} decision makers.`,
          time: '14 mins ago',
          icon: MessageCircle,
          color: '#10B981',
        },
        {
          id: 3,
          type: 'scraper',
          title: 'Target Buyer Engine Calibrated',
          desc: isInvites
            ? 'Scraper pipeline hunting verified luxury wedding planners, banquet halls & event designers.'
            : `Waterfall lead scraper targeted on verified decision makers across ${industryName}.`,
          time: '38 mins ago',
          icon: Users,
          color: '#8B5CF6',
        },
        {
          id: 4,
          type: 'ad',
          title: 'Ad Budget Optimizer Active',
          desc: isInvites
            ? 'Visual Meta & Instagram Reels ad campaign calibrated for seasonal bridal traffic.'
            : 'Paid ads 24/7 optimizer monitoring blended acquisition CAC and ROAS targets.',
          time: '1 hour ago',
          icon: TrendingUp,
          color: '#F59E0B',
        },
      ];

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Operating Mode Hero Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        position: 'relative',
        overflow: 'hidden',
        background: isAiMode
          ? 'linear-gradient(135deg, rgba(11, 17, 32, 0.95) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(16, 185, 129, 0.12) 100%)'
          : 'linear-gradient(135deg, rgba(11, 17, 32, 0.95) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(6, 182, 212, 0.1) 100%)',
        border: isAiMode ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(6, 182, 212, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-emerald">
                <Sparkles size={12} />
                AUTONOMOUS AI GTM MULTI-AGENT ENGINE ACTIVE
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Targeting: {activeWorkspace?.industry || 'B2B'} Ecosystem
              </span>
            </div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.65rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              {isAiMode ? (
                <>Autonomous Multi-Agent C-Suite is <span className="gradient-text-emerald">Operating 24/7</span></>
              ) : (
                <>Autonomous GTM Engine Ready for <span className="gradient-text-cyan">{activeWorkspace?.name || 'Your Business'}</span></>
              )}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '640px' }}>
              Your AI CMO, SDR, Closer, and CFO agents are autonomously prospecting, running sub-second voice qualification, and optimizing ad spend.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onNavigateToLeads}
              className="btn-emerald"
              style={{ padding: '10px 20px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>⚡ View Leads Pipeline</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Multi-Agent Live Badges if in AI mode */}
        {isAiMode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            flexWrap: 'wrap',
          }}>
            {[
              { role: 'AI CMO', task: 'Ad ROAS & Creative Generation' },
              { role: 'AI SDR', task: 'Waterfall Lead Scraping & WhatsApp Outbound' },
              { role: 'AI Closer', task: 'Sub-Second Voice AI Dialing' },
              { role: 'AI CFO', task: 'Wallet & Budget Allocation Guardrails' },
            ].map((agent, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.75rem',
                }}
              >
                <span className="live-dot" style={{ background: '#10B981', width: '6px', height: '6px' }} />
                <strong style={{ color: '#F8FAFC' }}>{agent.role}:</strong>
                <span style={{ color: '#94A3B8' }}>{agent.task}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel-interactive" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {kpi.label}
                </span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: kpi.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} color={kpi.color} />
                </div>
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.85rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                marginBottom: '6px',
              }}>
                {kpi.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: kpi.isPositive ? '#34D399' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <TrendingUp size={13} /> {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Pipeline Funnel + Live Autonomous Activity Feed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '24px',
      }}>
        {/* Left: Pipeline Funnel & Recent Leads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Funnel Stage Distribution */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
                  Pipeline Stages & Deal Progression
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Active distribution across qualification stages
                </p>
              </div>
              <span className="badge badge-cyan">{leads.length} Leads Tracked</span>
            </div>

            {/* Stages Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              marginTop: '12px',
            }}>
              {stageKeys.map((stage) => {
                const count = stats?.stageCounts?.[stage.key] || leads.filter((l) => l.stage === stage.key).length;
                return (
                  <div
                    key={stage.key}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stage.label}</span>
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: '700', color: '#F8FAFC' }}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Leads Quick View */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
                  High-Priority Leads
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Enriched contacts ready for closing
                </p>
              </div>
              <button onClick={onNavigateToLeads} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Open Full CRM <ArrowUpRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leads.slice(0, 4).map((lead) => (
                <div
                  key={lead._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#06B6D4',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                    }}>
                      {lead.name.substring(0, 1)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F8FAFC' }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {lead.title ? `${lead.title} • ` : ''}{lead.company || 'Enterprise'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AI Lead Score</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: lead.score > 80 ? '#10B981' : '#F59E0B' }}>
                        {lead.score}/100
                      </div>
                    </div>
                    <span className={`badge ${
                      lead.stage === 'Won' ? 'badge-emerald' :
                      lead.stage === 'Demo_Booked' ? 'badge-amber' :
                      lead.stage === 'Qualified' ? 'badge-violet' : 'badge-cyan'
                    }`}>
                      {lead.stage.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Autonomous Activity Stream */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-dot" style={{ background: '#06B6D4' }} />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
                Autonomous Activity Feed
              </h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Socket 1.0</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {liveFeed.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${item.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={item.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F8FAFC' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>{item.time}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Wallet Action in Feed footer */}
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>GTM Credit Reserves</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10B981' }}>
                ${wallet?.balanceUSD?.toFixed(2) || '0.00'} Available
              </div>
            </div>
            <button
              onClick={onOpenAddFundsModal}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Recharge Reserves
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
