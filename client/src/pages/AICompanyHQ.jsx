import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  PhoneCall,
  Megaphone,
  ShieldCheck,
  Headphones,
  Check,
  X,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Layers,
  Radio,
  Clock,
  Send,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';

export default function AICompanyHQ({ activeWorkspace, socket }) {
  const [orgData, setOrgData] = useState(null);
  const [briefings, setBriefings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('ALL');
  const [selectedAgentDetail, setSelectedAgentDetail] = useState(null);

  // Cross-Agent Feedback Loop Simulation State
  const [simulatingFeedback, setSimulatingFeedback] = useState(false);
  const [feedbackSuccessBanner, setFeedbackSuccessBanner] = useState(null);

  // Proposal Action Loading State
  const [actingProposalId, setActingProposalId] = useState(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    loadAllHQData();
  }, [activeWorkspace]);

  // Real-time Socket.IO Listeners for Multi-Agent Stream & Feedback
  useEffect(() => {
    if (!socket) return;

    socket.on('ai_company:activity', (data) => {
      setActivities((prev) => [data.log, ...prev]);
    });

    socket.on('ai_company:cross_feedback', (data) => {
      setFeedbackSuccessBanner({
        source: data.sourceAgent,
        target: data.targetAgent,
        event: data.eventType,
        description: data.log?.description || 'Cross-agent signal synchronized across executive team.',
      });
      setTimeout(() => setFeedbackSuccessBanner(null), 8000);
    });

    return () => {
      socket.off('ai_company:activity');
      socket.off('ai_company:cross_feedback');
    };
  }, [socket]);

  const loadAllHQData = async () => {
    setLoading(true);
    try {
      const [statusRes, briefRes, actRes] = await Promise.all([
        api.getAICompanyStatus(activeWorkspace._id),
        api.getCeoBriefings(activeWorkspace._id),
        api.getAICompanyActivities(activeWorkspace._id),
      ]);

      if (statusRes.success) setOrgData(statusRes.orgHierarchy);
      if (briefRes.success) setBriefings(briefRes.briefings || []);
      if (actRes.success) setActivities(actRes.activities || []);
    } catch (err) {
      console.error('Failed to load AI Company HQ data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Approve / Reject Proposal Decision
  const handleProposalDecision = async (briefingId, actionId, decision) => {
    setActingProposalId(actionId);
    try {
      const res = await api.decideCeoProposal({
        workspaceId: activeWorkspace._id,
        briefingId,
        actionId,
        decision,
      });

      if (res.success) {
        // Update local briefing state
        setBriefings((prev) =>
          prev.map((b) => {
            if (b._id === briefingId) {
              return {
                ...b,
                proposedActions: b.proposedActions.map((a) =>
                  a.actionId === actionId ? { ...a, status: decision } : a
                ),
              };
            }
            return b;
          })
        );
        // Refresh activity terminal
        const actRes = await api.getAICompanyActivities(activeWorkspace._id);
        if (actRes.success) setActivities(actRes.activities || []);
      }
    } catch (err) {
      alert('Failed to process proposal: ' + err.message);
    } finally {
      setActingProposalId(null);
    }
  };

  // Trigger Immediate Morning Briefing Synthesis
  const handleGenerateBriefing = async () => {
    setGeneratingBrief(true);
    try {
      const res = await api.generateCeoBriefing({
        workspaceId: activeWorkspace._id,
        deliveryChannel: 'WHATSAPP',
      });
      if (res.success) {
        setBriefings((prev) => [res.briefing, ...prev]);
      }
    } catch (err) {
      alert('Error generating briefing: ' + err.message);
    } finally {
      setGeneratingBrief(false);
    }
  };

  // Trigger Cross-Agent Feedback Loop: Voice Closer Objection -> AI CMO Ad Iteration
  const handleTriggerCrossFeedback = async () => {
    setSimulatingFeedback(true);
    try {
      const res = await api.simulateObjectionFeedback({
        workspaceId: activeWorkspace._id,
        objection: 'Do you support Bybit API?',
        leadName: 'Marcus Vance (Vance Capital)',
      });

      if (res.success) {
        setFeedbackSuccessBanner({
          source: 'VOICE_CLOSER',
          target: 'CMO',
          event: 'OBJECTION_DETECTED ("Do you support Bybit API?")',
          description: `Voice Closer detected friction on live call. AI CMO immediately spun up Bybit ad set headline: "${res.cmoAction?.newHeadline}" and adjusted Apollo scraper filters!`,
        });

        // Refresh activities
        const actRes = await api.getAICompanyActivities(activeWorkspace._id);
        if (actRes.success) setActivities(actRes.activities || []);

        setTimeout(() => setFeedbackSuccessBanner(null), 10000);
      }
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulatingFeedback(false);
    }
  };

  const latestBriefing = briefings[0] || null;

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (selectedAgentFilter === 'ALL') return true;
    return act.agentRole === selectedAgentFilter;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={24} color="#38BDF8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', color: '#F8FAFC' }}>
                  The Autonomous AI Company & C-Suite HQ
                </h1>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  Phase 9 Live
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  6 Active Agents
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Coordinated AI C-Suite: Chief of Staff, CMO, SDR, Voice Closer, CFO, and Customer Success collaborating 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleTriggerCrossFeedback}
            disabled={simulatingFeedback}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              borderColor: 'rgba(236, 72, 153, 0.4)',
              color: '#F472B6',
            }}
          >
            <Zap size={15} color="#EC4899" className={simulatingFeedback ? 'spin' : ''} />
            <span>{simulatingFeedback ? 'Propagating Signal...' : 'Simulate Voice Objection → CMO Signal'}</span>
          </button>

          <button
            onClick={handleGenerateBriefing}
            disabled={generatingBrief}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
          >
            <Sparkles size={15} />
            <span>{generatingBrief ? 'Synthesizing...' : 'Trigger 9:00 AM Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Cross-Agent Feedback Live Alert Banner */}
      {feedbackSuccessBanner && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15), rgba(99, 102, 241, 0.15))',
          border: '1px solid rgba(236, 72, 153, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(236, 72, 153, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={18} color="#F472B6" />
            </div>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#F8FAFC' }}>
                Cross-Agent Feedback Loop Executed ({feedbackSuccessBanner.source} ➔ {feedbackSuccessBanner.target})
              </div>
              <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginTop: '2px' }}>
                {feedbackSuccessBanner.description}
              </div>
            </div>
          </div>

          <button
            onClick={() => setFeedbackSuccessBanner(null)}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Interactive Organization Chart: Top CEO & Executive Team */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700', color: '#F8FAFC' }}>
            Autonomous Executive Hierarchy
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Click any agent to inspect operational prompt directives and telemetry
          </span>
        </div>

        {/* Level 1: Central CEO & Chief of Staff */}
        {orgData?.leader && (
          <div
            onClick={() => setSelectedAgentDetail(orgData.leader)}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              borderRadius: '14px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              background: 'radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.85) 100%)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: orgData.leader.avatarGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(56, 189, 248, 0.3)',
              }}>
                <Bot size={28} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC' }}>
                    {orgData.leader.name}
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                    {orgData.leader.role}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.675rem' }}>
                    100% Autonomous
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                  {orgData.leader.title} • {orgData.leader.currentTask}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '20px' }}>
              {orgData.leader.keyMetrics?.map((m, idx) => (
                <div key={idx} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38BDF8', fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 2: Specialized C-Suite Executives (CMO, SDR, Closer, CFO, CS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {orgData?.executiveTeam?.map((agent) => (
            <div
              key={agent.role}
              onClick={() => setSelectedAgentDetail(agent)}
              className="glass-panel"
              style={{
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: agent.avatarGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {agent.role === 'CMO' && <Megaphone size={18} color="#FFF" />}
                    {agent.role === 'SDR' && <Users size={18} color="#FFF" />}
                    {agent.role === 'VOICE_CLOSER' && <PhoneCall size={18} color="#FFF" />}
                    {agent.role === 'CFO' && <DollarSign size={18} color="#FFF" />}
                    {agent.role === 'CUSTOMER_SUCCESS' && <Headphones size={18} color="#FFF" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F8FAFC' }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {agent.role}
                    </div>
                  </div>
                </div>

                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  {agent.efficiencyScore}% Eff.
                </span>
              </div>

              <div style={{
                fontSize: '0.725rem',
                color: '#CBD5E1',
                lineHeight: '1.4',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '8px 10px',
                borderRadius: '8px',
                minHeight: '44px',
              }}>
                {agent.currentTask}
              </div>

              {/* Metrics Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '8px',
              }}>
                {agent.keyMetrics?.slice(0, 2).map((m, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{m.label}</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CEO Daily Briefing Log & 1-Click Action Proposals */}
      {latestBriefing && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MessageSquare size={20} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {latestBriefing.title}
                </h3>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                  Delivered to WhatsApp {latestBriefing.deliveredTo} • Status: {latestBriefing.deliveryStatus}
                </div>
              </div>
            </div>

            {/* Financial Health Ribbon */}
            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>MRR</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: '#10B981' }}>
                  ${(latestBriefing.metricsSnapshot?.mrr || 48500).toLocaleString()}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>CAC</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: '#38BDF8', fontVariantNumeric: 'tabular-nums' }}>
                  ${latestBriefing.metricsSnapshot?.cac || 215}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>LTV/CAC</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: '#A855F7' }}>
                  {latestBriefing.metricsSnapshot?.ltvCacRatio || 21.4}x
                </div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Blended ROAS</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: '#F59E0B' }}>
                  {latestBriefing.metricsSnapshot?.roas || 4.12}x
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary Paragraph */}
          <div style={{
            margin: '16px 0',
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.825rem',
            color: '#E2E8F0',
            lineHeight: '1.5',
          }}>
            {latestBriefing.executiveSummary}
          </div>

          {/* Action Proposals Grid with 1-Click Approve / Reject */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
              Strategic Actions Pending Founder Approval:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '12px' }}>
              {latestBriefing.proposedActions?.map((prop) => (
                <div
                  key={prop.actionId}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background:
                      prop.status === 'APPROVED'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : prop.status === 'REJECTED'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      prop.status === 'APPROVED'
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : prop.status === 'REJECTED'
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                        Agent: {prop.agentRole}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: '700' }}>
                        {prop.estimatedValue}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F8FAFC', marginTop: '6px' }}>
                      {prop.actionTitle}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: '1.4' }}>
                      {prop.description}
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '10px',
                  }}>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: '700',
                      color:
                        prop.status === 'APPROVED'
                          ? '#10B981'
                          : prop.status === 'REJECTED'
                          ? '#EF4444'
                          : '#F59E0B',
                    }}>
                      Status: {prop.status}
                    </span>

                    {prop.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleProposalDecision(latestBriefing._id, prop.actionId, 'REJECTED')}
                          disabled={actingProposalId === prop.actionId}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#F87171',
                            fontSize: '0.725rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={12} /> Reject
                        </button>

                        <button
                          onClick={() => handleProposalDecision(latestBriefing._id, prop.actionId, 'APPROVED')}
                          disabled={actingProposalId === prop.actionId}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '0.725rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={12} /> 1-Click Approve & Execute
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {prop.status === 'APPROVED' ? 'Executed Autonomously' : 'Archived'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Live Multi-Agent Activity Terminal Stream */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="#10B981" className="live-dot" />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                Multi-Agent Operational Activity Stream
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Real-time audit log of all decisions, outbound calls, scraper updates, and feedback signals
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px' }}>
            {['ALL', 'CEO', 'CMO', 'SDR', 'VOICE_CLOSER', 'CFO', 'CUSTOMER_SUCCESS'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedAgentFilter(filter)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedAgentFilter === filter ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: selectedAgentFilter === filter ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.7rem',
                  fontWeight: selectedAgentFilter === filter ? '700' : '500',
                  cursor: 'pointer',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
          {filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No activities found for the selected filter.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act._id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background:
                      act.agentRole === 'CEO'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : act.agentRole === 'CMO'
                        ? 'rgba(236, 72, 153, 0.15)'
                        : act.agentRole === 'SDR'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : act.agentRole === 'VOICE_CLOSER'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : act.agentRole === 'CFO'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(139, 92, 246, 0.15)',
                    color:
                      act.agentRole === 'CEO'
                        ? '#38BDF8'
                        : act.agentRole === 'CMO'
                        ? '#F472B6'
                        : act.agentRole === 'SDR'
                        ? '#60A5FA'
                        : act.agentRole === 'VOICE_CLOSER'
                        ? '#34D399'
                        : act.agentRole === 'CFO'
                        ? '#FBBF24'
                        : '#A78BFA',
                  }}>
                    {act.agentRole}
                  </span>

                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#F8FAFC' }}>
                      {act.actionTitle}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {act.description}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '600' }}>
                    {act.latencyMs}ms
                  </span>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: Agent Telemetry & Prompt Directive Detail */}
      {selectedAgentDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{ width: '560px', maxWidth: '90vw', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: selectedAgentDetail.avatarGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={22} color="#FFF" />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC' }}>
                    {selectedAgentDetail.name} ({selectedAgentDetail.role})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>
                    {selectedAgentDetail.title}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgentDetail(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '18px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  System Directive Prompt
                </label>
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  fontSize: '0.775rem',
                  lineHeight: '1.4',
                  marginTop: '4px',
                }}>
                  {selectedAgentDetail.systemDirective}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Active Telemetry & Efficiency
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Tasks Today</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>{selectedAgentDetail.tasksCompletedToday}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Efficiency Score</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#10B981' }}>{selectedAgentDetail.efficiencyScore}%</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Mode</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38BDF8', fontVariantNumeric: 'tabular-nums' }}>Autonomous</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button onClick={() => setSelectedAgentDetail(null)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
