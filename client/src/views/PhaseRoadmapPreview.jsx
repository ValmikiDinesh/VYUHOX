import React from 'react';
import {
  Target,
  MessageSquare,
  Mic,
  Video,
  TrendingUp,
  Calendar,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function PhaseRoadmapPreview({ phaseId, activeWorkspace, onActivatePhase }) {
  const phaseDetails = {
    strategy: {
      phase: 2,
      title: 'AI GTM Strategist & Real-Time Business Scanner',
      subtitle: 'Autonomous market intelligence, competitor teardown & ICP synthesis',
      icon: Target,
      color: '#06B6D4',
      features: [
        'Real-time deep crawling of company website and products',
        'Competitor analysis & differentiation angle extraction',
        'Autonomous ICP (Ideal Customer Profile) persona generation',
        'Strategic outreach playbooks tailored to industry verticals',
      ],
      nextAction: 'Ready for Phase 2 Implementation',
    },
    inbox: {
      phase: 4,
      title: 'Omnichannel Communications Hub',
      subtitle: 'Unified inbox for WhatsApp, Telegram, SMS & Cold Email Sequences',
      icon: MessageSquare,
      color: '#10B981',
      features: [
        'Interactive 2-way WhatsApp Cloud API & Webhooks',
        'Telegram Bot Integration for rapid deal engagement',
        'High-deliverability dynamic email warmup sequences',
        'Unified conversation timeline per lead with AI auto-replies',
      ],
      nextAction: 'Scheduled for Phase 4',
    },
    voice: {
      phase: 5,
      title: 'Sub-Second Voice AI Engine with Live Call Takeover',
      subtitle: 'Ultra-low latency phone conversation with WebRTC human barge-in',
      icon: Mic,
      color: '#8B5CF6',
      features: [
        'Sub-800ms latency voice response via Bland.ai / Twilio WebRTC',
        'Dynamic conversational objection handling & demo qualification',
        'Live audio spectrum visualizer with 1-click human audio takeover',
        'Automatic call recording transcription and CRM stage update',
      ],
      nextAction: 'Scheduled for Phase 5',
    },
    social: {
      phase: 6,
      title: 'Social Media Studio & Automated Reels / Shorts Pipeline',
      subtitle: 'Autonomous video generation, TTS narration & viral social distribution',
      icon: Video,
      color: '#EC4899',
      features: [
        'Programmatic scriptwriting with viral hook formulas',
        'TTS Voice synthesis with emotional cadence',
        'Remotion / Canvas video composition with captions',
        'Multi-platform scheduled auto-publishing (TikTok, YouTube, Reels)',
      ],
      nextAction: 'Scheduled for Phase 6',
    },
    ads: {
      phase: 7,
      title: 'Autonomous Paid Ad Manager',
      subtitle: 'Meta & Google Ads with 24/7 Budget Optimizer & Creative A/B Testing',
      icon: TrendingUp,
      color: '#F59E0B',
      features: [
        'Automatic Meta Conversions API (CAPI) & Google Ads sync',
        'Autonomous budget reallocation to highest ROAS ad sets',
        'Creative generation & copy variant testing engine',
        'Autonomous stop-loss guardrails when CPA exceeds thresholds',
      ],
      nextAction: 'Scheduled for Phase 7',
    },
    calendar: {
      phase: 8,
      title: 'Calendar Sync & Telecom/Email Deliverability Safeguards',
      subtitle: 'Cal.com/Google sync, A2P 10DLC verification & DNC registry scrub',
      icon: Calendar,
      color: '#3B82F6',
      features: [
        'Automated real-time calendar round-robin demo booking',
        'Telecom A2P 10DLC campaign compliance verification',
        'National and workspace-level Do-Not-Call (DNC) list filtering',
        'Automated inbox bounce monitoring & spam trap detection',
      ],
      nextAction: 'Scheduled for Phase 8',
    },
    'ai-company': {
      phase: 9,
      title: 'The Autonomous AI Company & Multi-Agent C-Suite',
      subtitle: 'AI CMO, AI SDR, AI Closer, AI CFO collaborating autonomously',
      icon: Bot,
      color: '#10B981',
      features: [
        'AI CMO: High-level market positioning & marketing campaign director',
        'AI SDR: Relentless 24/7 lead discovery, scoring & multi-touch outbound',
        'AI Closer: Sub-second voice negotiation & objection resolution',
        'AI CFO: Budget allocation, ROAS protection & burn rate watchdog',
      ],
      nextAction: 'Scheduled for Phase 9',
    },
  };

  const details = phaseDetails[phaseId] || phaseDetails.strategy;
  const Icon = details.icon;

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{
        padding: '36px',
        background: `radial-gradient(circle at 10% 20%, ${details.color}15 0%, rgba(15, 23, 42, 0.9) 100%)`,
        border: `1px solid ${details.color}35`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${details.color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={26} color={details.color} />
          </div>
          <div>
            <span className="badge" style={{
              background: `${details.color}18`,
              color: details.color,
              border: `1px solid ${details.color}40`,
            }}>
              ROADMAP PHASE {details.phase}
            </span>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '800', marginTop: '4px' }}>
              {details.title}
            </h2>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '28px' }}>
          {details.subtitle} for <strong>{activeWorkspace?.name || 'Active Workspace'}</strong>. This module will integrate with the Phase 1 Foundation API gateway, workspace models, and wallet ledger.
        </p>

        {/* Feature Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {details.features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <CheckCircle size={18} color={details.color} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.85rem', color: '#F8FAFC', lineHeight: '1.4' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#10B981" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Phase 1 Core API Gateway & Schema Connected
            </span>
          </div>

          <span className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            {details.nextAction}
          </span>
        </div>
      </div>
    </div>
  );
}
