import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Zap,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  MessageSquare,
  Play,
  CheckCircle2,
  ExternalLink,
  Users,
  Globe,
  Headphones,
  Award,
} from 'lucide-react';
import { api } from '../services/api';

export default function FlywheelHub({ activeWorkspace, socket }) {
  const [loading, setLoading] = useState(true);
  const [flywheelData, setFlywheelData] = useState(null);
  const [activeStage, setActiveStage] = useState('VOICE_DEMO');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Live Voice Demo Simulator Modal
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    phoneNumber: '+1 (415) 890-4421',
    prospectName: 'Julian Sterling',
    agencyName: 'Apex Global Ventures',
    planTier: 'AI_COMPANY',
  });
  const [isCalling, setIsCalling] = useState(false);
  const [callSession, setCallSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Prospecting Cycle Loading State
  const [runningProspecting, setRunningProspecting] = useState(false);

  // Checkout Simulation Loading State
  const [simulatingCheckout, setSimulatingCheckout] = useState(false);
  const [provisionedSuccess, setProvisionedSuccess] = useState(null);

  // Fetch Flywheel Overview
  const fetchFlywheel = async () => {
    try {
      setLoading(true);
      const res = await api.getFlywheelOverview();
      if (res.success) {
        setFlywheelData(res);
      }
    } catch (err) {
      console.error('Failed to load flywheel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlywheel();
  }, []);

  // Timer for active call simulation
  useEffect(() => {
    let interval = null;
    if (isCalling) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // Handle Trigger Voice Demo
  const handleTriggerVoiceDemo = async (e) => {
    e.preventDefault();
    try {
      setIsCalling(true);
      setCallSession(null);
      setProvisionedSuccess(null);

      const res = await api.triggerSelfDemoVoice(demoForm);
      if (res.success) {
        setCallSession(res);
        setFeedbackMsg(`Live Voice Proof-of-Concept connected in ${res.speedToLeadSeconds}s!`);
        fetchFlywheel();
      }
    } catch (err) {
      alert(`Voice Demo Trigger error: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  // Handle Run Autonomous Agency Prospecting Cycle
  const handleRunProspecting = async () => {
    try {
      setRunningProspecting(true);
      const res = await api.runFlywheelProspecting();
      if (res.success) {
        setFeedbackMsg(`AI CMO discovered ${res.discoveredAgency.agencyName}. AI SDR dispatched multi-touch preview!`);
        fetchFlywheel();
      }
    } catch (err) {
      alert(`Prospecting cycle error: ${err.message}`);
    } finally {
      setRunningProspecting(false);
    }
  };

  // Handle Simulate Checkout & Auto-Provision
  const handleSimulateCheckout = async (agencyName, planTier) => {
    try {
      setSimulatingCheckout(true);
      const res = await api.simulateFlywheelCheckout({
        agencyName: agencyName || demoForm.agencyName,
        adminEmail: `founder@${(agencyName || demoForm.agencyName).toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
        planTier: planTier || demoForm.planTier,
      });
      if (res.success) {
        setProvisionedSuccess(res);
        setFeedbackMsg(res.message);
        fetchFlywheel();
      }
    } catch (err) {
      alert(`Checkout simulation error: ${err.message}`);
    } finally {
      setSimulatingCheckout(false);
    }
  };

  const metrics = flywheelData?.metrics || {
    totalDiscovered: 14,
    totalOutbound: 12,
    totalVoiceDemos: 8,
    totalConversions: 4,
    totalProvisioned: 4,
    conversionRatePercent: 50,
    totalMRRAdded: 996,
    totalARRAdded: 11952,
    avgSpeedToLeadSeconds: 14,
    avgVoiceLatencyMs: 680,
  };

  // Flywheel Stages Data
  const stages = [
    {
      id: 'DISCOVERY',
      label: '1. Acquire Agencies',
      agent: 'Sophia Sterling (AI CMO)',
      icon: Users,
      color: '#38BDF8',
      desc: 'Continuously scrapes Clutch.co, Google Maps, and LinkedIn to identify growth, SEO, and Web3 agencies.',
      stats: `${metrics.totalDiscovered} Discovered`,
    },
    {
      id: 'OUTBOUND',
      label: '2. Multi-Touch Intro',
      agent: 'Marcus Cole (AI SDR)',
      icon: Mail,
      color: '#A78BFA',
      desc: 'Dispatches personalized email sequences and WhatsApp introductions featuring personalized interactive demo previews.',
      stats: `${metrics.totalOutbound} Dispatched`,
    },
    {
      id: 'VOICE_DEMO',
      label: '3. 30s Voice Self-Demo',
      agent: 'Maya Vance (AI Voice Closer)',
      icon: PhoneCall,
      color: '#F43F5E',
      desc: 'Prospect enters phone on landing page. Voice AI dials back in <30s, proving sub-800ms conversational power live.',
      stats: `${metrics.avgSpeedToLeadSeconds}s Avg Latency`,
    },
    {
      id: 'CHECKOUT',
      label: '4. Instant Pay Link',
      agent: 'Julian Vance (AI CFO)',
      icon: DollarSign,
      color: '#F59E0B',
      desc: 'Maya dispatches a pre-configured Stripe Checkout link with selected plan tier directly to their phone.',
      stats: `${metrics.conversionRatePercent}% Conversion`,
    },
    {
      id: 'PROVISION',
      label: '5. Auto-Provision Workspace',
      agent: 'Central Flywheel Engine',
      icon: ShieldCheck,
      color: '#10B981',
      desc: 'Webhook triggers instant autonomous workspace deployment, client account creation, and $100 credit deposit.',
      stats: `${metrics.totalProvisioned} Workspaces Live`,
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* Top Notification Banner */}
      {feedbackMsg && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#34D399',
          fontSize: '0.9rem',
          fontWeight: '500',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            style={{ background: 'transparent', border: 'none', color: '#34D399', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Flywheel Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.45)',
          }}>
            <RefreshCw size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>
                The Self-Growing SaaS Flywheel
              </h1>
              <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} /> GTM Sells Itself
              </span>
              <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} /> 100% Autonomous
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
              VYUHOX uses its own C-Suite agents to continuously acquire business clients, deliver sub-30s self-demonstrating voice demos, and auto-provision autonomous GTM workspaces.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleRunProspecting}
            disabled={runningProspecting}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <RefreshCw size={16} className={runningProspecting ? 'spin' : ''} />
            <span>{runningProspecting ? 'Prospecting...' : 'Run Prospecting Cycle'}</span>
          </button>

          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: '700',
              fontSize: '0.85rem',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            }}
          >
            <PhoneCall size={16} />
            <span>Trigger Live Voice Self-Demo</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {/* Flywheel ARR Added */}
        <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>
              Flywheel ARR Added
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#34D399" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
            ${metrics.totalARRAdded.toLocaleString()}<span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>/yr</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#10B981' }}>
            +${metrics.totalMRRAdded.toLocaleString()}/mo recurring revenue
          </div>
        </div>

        {/* Speed to Lead */}
        <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>
              Speed-to-Lead Callback
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#38BDF8" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#38BDF8', fontFamily: 'Outfit, sans-serif' }}>
            {metrics.avgSpeedToLeadSeconds}s
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#06B6D4' }}>
            Target: &lt; 30s instant voice bridge
          </div>
        </div>

        {/* Voice Demos Executed */}
        <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>
              Self-Demos Executed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall size={16} color="#FB7185" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
            {metrics.totalVoiceDemos}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#FB7185' }}>
            Carrier latency: {metrics.avgVoiceLatencyMs}ms
          </div>
        </div>

        {/* Demo-to-Pay Conversion */}
        <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>
              Demo-to-Pay Rate
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#FBBF24" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#FBBF24', fontFamily: 'Outfit, sans-serif' }}>
            {metrics.conversionRatePercent}%
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#F59E0B' }}>
            Proof-of-concept converts on call
          </div>
        </div>

        {/* Auto-Provisioned Workspaces */}
        <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>
              Auto-Provisioned
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} color="#A78BFA" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#C4B5FD', fontFamily: 'Outfit, sans-serif' }}>
            {metrics.totalProvisioned}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#A78BFA' }}>
            Zero human intervention required
          </div>
        </div>
      </div>

      {/* Flywheel Interactive Circular Architecture Pipeline */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px', background: 'rgba(11, 17, 32, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} color="#06B6D4" /> Continuous Self-Sustaining Flywheel Pipeline
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
              Each cycle autonomously prospects businesses, dispatches speed-to-lead voice calls, and converts sign-ups into active paying workspaces.
            </p>
          </div>
          <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Active 24/7 Loop
          </span>
        </div>

        {/* 5 Stage Horizontal Process Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          position: 'relative',
        }}>
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${stage.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 0 20px ${stage.color}33` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${stage.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={16} color={stage.color} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: stage.color, background: `${stage.color}15`, padding: '2px 6px', borderRadius: '6px' }}>
                    {stage.stats}
                  </span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#F8FAFC', marginBottom: '4px' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px', fontWeight: '500' }}>
                  {stage.agent}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4' }}>
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Live Flywheel Conversion Feed & Interactive Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Left: Live Conversion Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#10B981" /> Live Autonomous Conversion Feed
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time event stream</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '560px', overflowY: 'auto' }}>
            {(flywheelData?.feed || []).map((ev) => {
              const isPayment = ev.eventType === 'PAYMENT_CONVERTED';
              const isProvision = ev.eventType === 'WORKSPACE_AUTOPROVISIONED';
              const isVoice = ev.eventType === 'VOICE_DEMO_TRIGGERED';
              const isOutbound = ev.eventType === 'OUTBOUND_DISPATCHED';

              return (
                <div
                  key={ev._id || ev.timestamp}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: isPayment
                      ? 'rgba(16, 185, 129, 0.08)'
                      : isVoice
                      ? 'rgba(244, 63, 94, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isPayment
                      ? '1px solid rgba(16, 185, 129, 0.25)'
                      : isVoice
                      ? '1px solid rgba(244, 63, 94, 0.25)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${
                        isPayment ? 'badge-emerald' :
                        isProvision ? 'badge-purple' :
                        isVoice ? 'badge-rose' :
                        isOutbound ? 'badge-cyan' : 'badge-gray'
                      }`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {ev.eventType.replace(/_/g, ' ')}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#F8FAFC' }}>{ev.agencyName}</strong>
                    </div>
                    {ev.revenueUSD > 0 && (
                      <span style={{ fontWeight: '800', color: '#34D399', fontSize: '0.85rem' }}>
                        +${ev.revenueUSD}/mo
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>
                    Contact: <strong style={{ color: '#F8FAFC' }}>{ev.contactName}</strong> {ev.contactEmail ? `(${ev.contactEmail})` : ''}
                  </div>

                  {ev.details && (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {ev.details.speedToLeadSeconds && (
                        <span>Speed-to-Lead: <strong style={{ color: '#38BDF8' }}>{ev.details.speedToLeadSeconds}s</strong></span>
                      )}
                      {ev.details.latencyMs && (
                        <span>Carrier: <strong style={{ color: '#FB7185' }}>{ev.details.latencyMs}ms</strong></span>
                      )}
                      {ev.details.businessDomain && (
                        <span>Domain: <strong style={{ color: '#A78BFA' }}>{ev.details.businessDomain}</strong></span>
                      )}
                      {ev.details.source && (
                        <span>Source: <strong style={{ color: '#94A3B8' }}>{ev.details.source}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Self-Demonstrating Trigger Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneCall size={20} color="#06B6D4" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Interactive Voice Self-Demo</h3>
                <span style={{ fontSize: '0.75rem', color: '#06B6D4' }}>Sub-30s speed-to-lead proof-of-concept</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px' }}>
              Experience the exact proof-of-concept agency prospects hear. Maya Vance dials within 15 seconds, proving our conversational latency live on the phone.
            </p>

            <form onSubmit={handleTriggerVoiceDemo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
                  Target Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={demoForm.phoneNumber}
                  onChange={(e) => setDemoForm({ ...demoForm, phoneNumber: e.target.value })}
                  placeholder="+1 (415) 890-4421"
                  className="input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
                    Prospect Name
                  </label>
                  <input
                    type="text"
                    required
                    value={demoForm.prospectName}
                    onChange={(e) => setDemoForm({ ...demoForm, prospectName: e.target.value })}
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
                    Company / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={demoForm.agencyName}
                    onChange={(e) => setDemoForm({ ...demoForm, agencyName: e.target.value })}
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalling}
                className="btn btn-primary"
                style={{ padding: '12px', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isCalling ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Bridging Outbound Call ({elapsedSeconds}s)...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall size={16} />
                    <span>Dial & Conduct Live Voice Demo</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Call Dialogue & Transcript */}
            {callSession && (
              <div style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    Connected in {callSession.speedToLeadSeconds}s ({callSession.latencyMs}ms carrier)
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>High Intent</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', fontSize: '0.75rem' }}>
                  {(callSession.transcript || []).map((t, idx) => (
                    <div key={idx} style={{ padding: '6px 8px', borderRadius: '4px', background: t.speaker.startsWith('AI') ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
                      <strong style={{ color: t.speaker.startsWith('AI') ? '#38BDF8' : '#F8FAFC' }}>{t.speaker}: </strong>
                      <span style={{ color: '#E2E8F0' }}>{t.text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                  <button
                    onClick={() => handleSimulateCheckout(demoForm.agencyName, demoForm.planTier)}
                    disabled={simulatingCheckout}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} color="#34D399" />
                    <span>{simulatingCheckout ? 'Auto-Provisioning...' : 'Simulate Stripe Checkout ($249/mo)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Auto-Provisioned Credentials Card */}
            {provisionedSuccess && (
              <div style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                fontSize: '0.8rem',
              }}>
                <div style={{ fontWeight: '700', color: '#34D399', marginBottom: '4px' }}>
                  🎉 Workspace Auto-Provisioned!
                </div>
                <div style={{ color: '#E2E8F0', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  <div>Domain: {provisionedSuccess.credentials.loginUrl}</div>
                  <div>Admin: {provisionedSuccess.credentials.email}</div>
                  <div>Password: {provisionedSuccess.credentials.temporaryPassword}</div>
                </div>
              </div>
            )}
          </div>

          {/* Platform Self-Marketing Workspace Card */}
          <div className="card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="#A78BFA" /> VYUHOX Platform Flagship (Workspace #1)
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 10px' }}>
              The platform itself runs on the exact same Autonomous AI Company infrastructure sold to clients. Zero bespoke sales headcount required.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#C4B5FD' }}>
              <span>Status: Autonomous 24/7</span>
              <span>Treasury: $5,000 Credits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
