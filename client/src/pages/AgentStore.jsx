import React, { useState, useEffect } from 'react';
import {
  Users,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Check,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  DollarSign,
  TrendingUp,
  Sliders,
  ShieldCheck,
  PhoneCall,
  Megaphone,
  Headphones,
  ShoppingBag,
  ArrowRight,
  Calculator,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function AgentStore({ activeWorkspace, socket, onOpenModeModal }) {
  const [billingSummary, setBillingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Business Complexity Scanner State
  const [scannerInputs, setScannerInputs] = useState({
    monthlyLeads: 500,
    adBudgetUSD: 2000,
    targetDealSize: 3500,
    industry: activeWorkspace?.industry || 'B2B',
  });
  const [teamRecommendation, setTeamRecommendation] = useState(null);
  const [calculatingTeam, setCalculatingTeam] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    loadBillingSummary();
    runTeamScanner(scannerInputs);
  }, [activeWorkspace]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on('workspace:mode_updated', (data) => {
      loadBillingSummary();
    });

    socket.on('workspace:agents_updated', (data) => {
      loadBillingSummary();
    });

    return () => {
      socket.off('workspace:mode_updated');
      socket.off('workspace:agents_updated');
    };
  }, [socket]);

  const loadBillingSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getBillingSummary(activeWorkspace._id);
      if (res.success) {
        setBillingSummary(res);
      }
    } catch (err) {
      console.error('Failed to load billing summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const runTeamScanner = async (inputs) => {
    setCalculatingTeam(true);
    try {
      const res = await api.estimateTeamSizing(inputs);
      if (res.success) {
        setTeamRecommendation(res);
      }
    } catch (err) {
      console.error('Team scanner error:', err);
    } finally {
      setCalculatingTeam(false);
    }
  };

  // 1-Click Hire / Pause Agent
  const handleToggleAgent = async (agentRole, currentActive) => {
    const action = currentActive ? 'RELEASE' : 'HIRE';
    setActionLoading(agentRole);
    try {
      const res = await api.hireAgent({
        workspaceId: activeWorkspace._id,
        agentRole,
        action,
      });
      if (res.success) {
        loadBillingSummary();
      }
    } catch (err) {
      alert('Failed to update agent: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 1-Click Apply Recommended Team
  const handleApplyRecommendedTeam = async () => {
    if (!teamRecommendation) return;

    if (teamRecommendation.recommendBundle) {
      // Switch directly to AI Company full bundle ($249/mo)
      try {
        const res = await api.switchOperatingMode({
          workspaceId: activeWorkspace._id,
          targetMode: 'AI_COMPANY',
          planTier: 'AI_COMPANY_STARTER',
        });
        if (res.success) {
          alert('Upgraded to Autonomous AI Company ($249/mo) with full C-Suite active!');
          loadBillingSummary();
        }
      } catch (e) {
        alert('Upgrade failed: ' + e.message);
      }
    } else {
      // Hire the specific recommended agents
      try {
        for (const agent of teamRecommendation.recommendedAgents) {
          await api.hireAgent({
            workspaceId: activeWorkspace._id,
            agentRole: agent.role,
            action: 'HIRE',
          });
        }
        alert('Hired all recommended AI specialists for your volume!');
        loadBillingSummary();
      } catch (e) {
        alert('Hiring failed: ' + e.message);
      }
    }
  };

  const isAiCompanyMode = billingSummary?.operatingMode === 'AI_COMPANY';

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
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingBag size={22} color="#38BDF8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', color: '#F8FAFC' }}>
                  AI Employee Store & "Hire As You Grow" Switchboard
                </h1>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  Phase 10 Engine
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  Dynamic Pricing
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Scale your digital workforce on demand. Hire individual AI specialists for $39 - $49/mo or activate the full C-Suite.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenModeModal}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
        >
          <Sparkles size={15} color="#38BDF8" />
          <span>Autonomous AI Engine</span>
        </button>
      </div>

      {/* 2. Top Billing & Team Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
            Current Operating Mode
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: '800', color: '#10B981' }}>
              Autonomous AI Company
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {isAiCompanyMode ? 'All 5 C-Suite Agents Bundled' : 'Multi-Agent Autonomous AI Engine'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
            Active Hired AI Specialists
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '800', color: '#10B981' }}>
              {isAiCompanyMode ? '5' : billingSummary?.activeHiredCount || 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={13} /> of 5 Available
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Zero payroll overhead or benefits
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Monthly Subscription
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '800', color: '#F59E0B' }}>
              ${billingSummary?.totalMonthlyFee || 49}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>/mo</span>
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
              Billed Monthly
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Base ${billingSummary?.baseMonthlyFee || 49} + ${billingSummary?.agentAddonFee || 0} Addons
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
            Prepaid Usage Wallet
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '800', color: '#A855F7' }}>
              ${(billingSummary?.walletBalanceUSD ?? 0).toFixed(2)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#A855F7', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={13} /> Telephony Reserve
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Used for raw carrier minutes & SMS
          </div>
        </div>
      </div>

      {/* 3. Main Split View: AI Employee Store vs Business Complexity Scanner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '24px' }}>
        {/* Left: AI Employee Store Catalog ("Hire As You Grow") */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700', color: '#F8FAFC' }}>
                "Hire As You Grow" Modular Switchboard
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {isAiCompanyMode
                  ? 'All agents are currently active and included under your Autonomous AI Company plan ($249/mo).'
                  : 'Hire individual AI employees to automate specific GTM bottlenecks while keeping your base cost low ($49/mo).'}
              </p>
            </div>
          </div>

          {/* Employee Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            {billingSummary?.agentCatalog?.map((agent) => {
              const hiredRecord = billingSummary?.hiredAgents?.find((h) => h.agentRole === agent.role);
              const isHiredAndActive = isAiCompanyMode || (hiredRecord && hiredRecord.active);

              return (
                <div
                  key={agent.role}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    background: isHiredAndActive
                      ? 'rgba(16, 185, 129, 0.06)'
                      : 'rgba(15, 23, 42, 0.55)',
                    border: isHiredAndActive
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `${agent.badgeColor}22`,
                        border: `1px solid ${agent.badgeColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {agent.role === 'CMO' && <Megaphone size={22} color={agent.badgeColor} />}
                        {agent.role === 'SDR' && <Users size={22} color={agent.badgeColor} />}
                        {agent.role === 'VOICE_CLOSER' && <PhoneCall size={22} color={agent.badgeColor} />}
                        {agent.role === 'CFO' && <DollarSign size={22} color={agent.badgeColor} />}
                        {agent.role === 'CUSTOMER_SUCCESS' && <Headphones size={22} color={agent.badgeColor} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                            {agent.name}
                          </span>
                          <span style={{
                            fontSize: '0.675rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: `${agent.badgeColor}18`,
                            color: agent.badgeColor,
                            border: `1px solid ${agent.badgeColor}30`,
                          }}>
                            {agent.role}
                          </span>
                          <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                            • {agent.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                          {agent.title}
                        </div>
                      </div>
                    </div>

                    {/* Price Tag & 1-Click Hire / Release Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC' }}>
                          ${agent.monthlyCost}<span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '400' }}>/mo</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#10B981' }}>
                          Replaces {agent.humanSalaryEquivalent}
                        </div>
                      </div>

                      {!isAiCompanyMode ? (
                        <button
                          onClick={() => handleToggleAgent(agent.role, isHiredAndActive)}
                          disabled={actionLoading === agent.role}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: isHiredAndActive ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
                            background: isHiredAndActive
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'linear-gradient(135deg, #10B981, #059669)',
                            color: isHiredAndActive ? '#F87171' : '#FFFFFF',
                            fontSize: '0.775rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: '130px',
                            justifyContent: 'center',
                          }}
                        >
                          {actionLoading === agent.role ? (
                            'Updating...'
                          ) : isHiredAndActive ? (
                            <>
                              <Pause size={13} /> Pause Agent
                            </>
                          ) : (
                            <>
                              <Plus size={14} /> Hire (${agent.monthlyCost}/mo)
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '0.725rem', padding: '6px 12px' }}>
                          ✓ Active (Included in Bundle)
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                    {agent.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Business Complexity Scanner & Team Sizing Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Complexity Scanner Card */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="#06B6D4" />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                Business Complexity & Team Sizing Scanner
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Slide to match your operational targets. The engine calculates optimal AI employee allocation and estimated ROI.
            </p>

            {/* Interactive Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '18px' }}>
              {/* Monthly Leads Target */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#F8FAFC' }}>
                  <span>Monthly Lead Outbound Target</span>
                  <span style={{ color: '#38BDF8', fontWeight: '800' }}>{scannerInputs.monthlyLeads.toLocaleString()} Leads</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="100"
                  value={scannerInputs.monthlyLeads}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const newInputs = { ...scannerInputs, monthlyLeads: val };
                    setScannerInputs(newInputs);
                    runTeamScanner(newInputs);
                  }}
                  style={{ width: '100%', marginTop: '6px', accentColor: '#06B6D4' }}
                />
              </div>

              {/* Monthly Ad Budget */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#F8FAFC' }}>
                  <span>Monthly Paid Ad Budget</span>
                  <span style={{ color: '#10B981', fontWeight: '800' }}>${scannerInputs.adBudgetUSD.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={scannerInputs.adBudgetUSD}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const newInputs = { ...scannerInputs, adBudgetUSD: val };
                    setScannerInputs(newInputs);
                    runTeamScanner(newInputs);
                  }}
                  style={{ width: '100%', marginTop: '6px', accentColor: '#10B981' }}
                />
              </div>

              {/* Average Deal Size */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#F8FAFC' }}>
                  <span>Average Contract / ACV Deal Size</span>
                  <span style={{ color: '#F59E0B', fontWeight: '800' }}>${scannerInputs.targetDealSize.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={scannerInputs.targetDealSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const newInputs = { ...scannerInputs, targetDealSize: val };
                    setScannerInputs(newInputs);
                    runTeamScanner(newInputs);
                  }}
                  style={{ width: '100%', marginTop: '6px', accentColor: '#F59E0B' }}
                />
              </div>
            </div>

            {/* Recommendation Output Card */}
            {teamRecommendation && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.725rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase' }}>
                    Recommended Architecture
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                    {teamRecommendation.recommendBundle ? 'AI Company ($249/mo)' : `Modular ($${teamRecommendation.estimatedMonthlyCost}/mo)`}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {teamRecommendation.recommendedAgents?.map((a) => (
                    <span
                      key={a.role}
                      style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#F8FAFC',
                        fontWeight: '600',
                      }}
                    >
                      ✓ {a.name} ({a.role})
                    </span>
                  ))}
                </div>

                {/* Key Benefits Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '10px',
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Hours Saved / Mo</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38BDF8' }}>
                      ~{teamRecommendation.hoursSavedPerMonth} Hours
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Human Payroll Replaced</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10B981' }}>
                      {teamRecommendation.humanSalaryReplaced}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Demos Forecast</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC' }}>
                      {teamRecommendation.pipelineForecast?.estimatedDemos} Demos/Mo
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Estimated Pipeline</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F59E0B' }}>
                      {teamRecommendation.pipelineForecast?.estimatedPipelineUSD}
                    </div>
                  </div>
                </div>

                {/* 1-Click Apply Button */}
                <button
                  onClick={handleApplyRecommendedTeam}
                  className="btn-primary"
                  style={{
                    marginTop: '4px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} /> 1-Click Apply Recommended Team
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
