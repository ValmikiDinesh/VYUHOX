import React, { useState } from 'react';
import {
  Sparkles,
  Wrench,
  Bot,
  CheckCircle2,
  Zap,
  ArrowRight,
  Shield,
  DollarSign,
  X,
  Users,
  Flame,
} from 'lucide-react';

export default function ModeSwitchModal({
  isOpen,
  onClose,
  currentMode,
  onSwitchMode,
  onOpenAgentStore,
}) {
  const [selectedMode, setSelectedMode] = useState(currentMode || 'TOOL');
  const [switching, setSwitching] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSwitch = async () => {
    if (selectedMode === currentMode) {
      onClose();
      return;
    }
    setSwitching(true);
    try {
      await onSwitchMode(selectedMode);
      onClose();
    } catch (err) {
      alert('Failed to switch mode: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div className="glass-panel" style={{
        width: '840px',
        maxWidth: '92vw',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.3)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                Phase 10 Engine
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                Dual-Mode Architecture
              </span>
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.45rem', fontWeight: '800', color: '#F8FAFC', marginTop: '6px' }}>
              Operating Mode & Autonomous Team Switchboard
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Select how your GTM platform operates. Toggle instantly between hands-on manual control and a 24/7 autonomous C-Suite.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Mode Selector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '24px 0' }}>
          {/* Option A: Self-Serve Tool Mode */}
          <div
            onClick={() => setSelectedMode('TOOL')}
            style={{
              padding: '24px',
              borderRadius: '14px',
              background: selectedMode === 'TOOL'
                ? 'rgba(6, 182, 212, 0.08)'
                : 'rgba(15, 23, 42, 0.6)',
              border: selectedMode === 'TOOL'
                ? '2px solid #06B6D4'
                : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Wrench size={20} color="#38BDF8" />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: '800', color: '#F8FAFC' }}>
                    $49<span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.675rem', color: '#38BDF8', fontWeight: '700' }}>+ Usage Wallet</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginTop: '12px' }}>
                Mode A: Self-Serve Tool Mode
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: '1.4' }}>
                You control the tools directly. Full access to Lead Scraper, in-browser WebRTC dialer, omnichannel sequences, and ad manager.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {[
                  'Manual Lead Finder & Waterfall Enrichment',
                  'In-browser WebRTC Phone Dialer',
                  'Omnichannel WhatsApp, Telegram & Email hub',
                  'Meta & Google Ads Campaign Manager',
                  'Modular "Hire As You Grow" Agent option ($39/mo)',
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.725rem', color: '#CBD5E1' }}>
                    <CheckCircle2 size={13} color="#06B6D4" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
            }}>
              {currentMode === 'TOOL' ? '● Currently Active Mode' : 'Click to select Tool Mode'}
            </div>
          </div>

          {/* Option B: Autonomous AI Company */}
          <div
            onClick={() => setSelectedMode('AI_COMPANY')}
            style={{
              padding: '24px',
              borderRadius: '14px',
              background: selectedMode === 'AI_COMPANY'
                ? 'rgba(16, 185, 129, 0.08)'
                : 'rgba(15, 23, 42, 0.6)',
              border: selectedMode === 'AI_COMPANY'
                ? '2px solid #10B981'
                : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={20} color="#10B981" />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: '800', color: '#10B981' }}>
                    $249<span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.675rem', color: '#10B981', fontWeight: '700' }}>Save $66/mo vs individual</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginTop: '12px' }}>
                Mode B: Autonomous AI Company
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: '1.4' }}>
                Hands-off autonomous execution. The full AI C-Suite (CEO, CMO, SDR, Closer, CFO, CS) coordinates 24/7.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {[
                  'All 5 AI Executives (CMO, SDR, Closer, CFO, CS) Active',
                  'Central AI CEO 9:00 AM WhatsApp Morning Briefing',
                  '1-Click Strategic Proposal Approvals',
                  'Sub-45s Speed-to-Lead Inbound Voice Dialing',
                  'Autonomous Cross-Agent Feedback Loop',
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.725rem', color: '#CBD5E1' }}>
                    <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
            }}>
              {currentMode === 'AI_COMPANY' ? '● Currently Active Mode' : 'Click to select AI Company Mode'}
            </div>
          </div>
        </div>

        {/* Footer: Modular Switchboard link & Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <button
            onClick={() => {
              onClose();
              if (onOpenAgentStore) onOpenAgentStore();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38BDF8',
              fontSize: '0.775rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Users size={14} /> Prefer to hire individual AI employees? Open AI Employee Store →
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              Cancel
            </button>
            <button
              onClick={handleConfirmSwitch}
              disabled={switching}
              className="btn-primary"
              style={{
                fontSize: '0.8rem',
                background: selectedMode === 'AI_COMPANY'
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
              }}
            >
              {switching
                ? 'Updating Mode...'
                : `Confirm Switch to ${selectedMode === 'AI_COMPANY' ? 'AI Company ($249/mo)' : 'Tool Mode ($49/mo)'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
