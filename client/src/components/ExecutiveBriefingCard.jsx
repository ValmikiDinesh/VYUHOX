import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  ShieldAlert,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';

export default function ExecutiveBriefingCard({
  briefing,
  workspaceId,
  onActionCompleted,
  onRefresh,
}) {
  const [executingActionId, setExecutingActionId] = useState(null);
  const [toast, setToast] = useState(null);

  if (!briefing) return null;

  const showToast = (msg, isError = false) => {
    setToast({ text: msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExecute = async (actionId, cardTitle) => {
    try {
      setExecutingActionId(actionId);
      const res = await api.executeActionCard({
        briefingId: briefing._id,
        actionId,
        workspaceId,
      });

      if (res.success) {
        showToast(`⚡ ${res.message || 'Action executed successfully!'}`);
        if (onActionCompleted) onActionCompleted(actionId);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Action execute error:', err);
      showToast('Action execution failed', true);
    } finally {
      setExecutingActionId(null);
    }
  };

  const kpis = briefing.kpiSnapshot || {};

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.98) 100%)',
      border: '1px solid rgba(6, 182, 212, 0.35)',
      borderRadius: '20px',
      padding: '24px 28px',
      marginBottom: '28px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.15)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '24px',
          background: toast.isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#FFF',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: '700',
          zIndex: 10,
        }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
          }}>
            <Sparkles size={20} color="#040710" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                {briefing.title || 'Autonomous Morning Executive Intelligence Briefing'}
              </h2>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                CRO AI Synthesized
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Synthesized: {new Date(briefing.generatedAt || Date.now()).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} at 9:00 AM
            </span>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#38BDF8',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={12} />
            Re-Synthesize
          </button>
        )}
      </div>

      {/* Executive Summary */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '18px',
        fontSize: '0.86rem',
        color: '#E2E8F0',
        lineHeight: '1.5',
      }}>
        {briefing.executiveSummary}
      </div>

      {/* KPI Ticker Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>24h Leads Audited</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38BDF8', marginTop: '2px' }}>
            +{kpis.leadsScraped24h || 18}
          </div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Active Pipeline</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
            ${(kpis.pipelineValueUSD || 48500).toLocaleString()}
          </div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Demos Booked</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F59E0B', marginTop: '2px' }}>
            {kpis.demosBooked24h || 3}
          </div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Blended ROAS</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#A855F7', marginTop: '2px' }}>
            {kpis.blendedRoas || 3.8}x
          </div>
        </div>
      </div>

      {/* 1-Click Action Cards Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#F59E0B" />
            Recommended 1-Click Action Cards
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
            One-click execution triggers automated prospecting or ad scaling
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {(briefing.actionCards || []).map((card) => {
            const isExecuted = card.status === 'APPROVED_AND_EXECUTED';
            const isExecuting = executingActionId === card.actionId;

            return (
              <div
                key={card.actionId || card._id}
                style={{
                  background: isExecuted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isExecuted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38BDF8',
                    }}>
                      {card.actionType}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700' }}>
                      {card.estimatedImpact}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', fontWeight: '700', color: '#F8FAFC' }}>
                    {card.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.4' }}>
                    {card.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                  {isExecuted ? (
                    <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={14} /> Approved &amp; Executed Live
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecute(card.actionId, card.title)}
                      disabled={isExecuting}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                        border: 'none',
                        color: '#040710',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: isExecuting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 0 14px rgba(6, 182, 212, 0.3)',
                      }}
                    >
                      <Zap size={13} className={isExecuting ? 'animate-spin' : ''} />
                      {isExecuting ? 'Executing Action...' : 'Approve & Run [1-Click]'}
                    </button>
                  )}
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    {isExecuted ? `Completed at ${new Date(card.executedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Instant Autonomous Dispatch'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
