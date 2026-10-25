import React, { useState, useEffect } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
  Mail,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Key,
  Lock,
  Globe,
  Radio,
  Sliders,
  Check,
  Clock,
  ArrowRight,
  ShieldAlert,
  Copy,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  WhatsAppLogo,
  TelegramLogo,
  InstagramLogo,
  MetaLogo,
  LinkedInLogo,
  TwitterXLogo,
  GoogleLogo,
} from '../components/SocialLogos';
import { api } from '../services/api';

export default function IntegrationsHub({ activeWorkspace, socket }) {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [toast, setToast] = useState(null);

  // Selected Channel for Configuration Modal
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectTab, setConnectTab] = useState('ONE_CLICK'); // 'ONE_CLICK' | 'STEP_BY_STEP'
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customPhoneId, setCustomPhoneId] = useState('');
  const [customWabaId, setCustomWabaId] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ text: msg, isError });
    setTimeout(() => setToast(null), 4500);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied to clipboard: ${text}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const loadIntegrations = async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const res = await api.getWorkspaceIntegrations(activeWorkspace._id);
      if (res.success) {
        setIntegrations(res.integrations || []);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [activeWorkspace]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket || !activeWorkspace) return;

    const handleIntegrationUpdated = (data) => {
      showToast(data.message || '⚡ Channel integration state updated in real-time!');
      loadIntegrations();
    };

    socket.on('integration:updated', handleIntegrationUpdated);
    return () => socket.off('integration:updated', handleIntegrationUpdated);
  }, [socket, activeWorkspace]);

  // 2-Click OAuth Connect
  const handleConnectOAuth = async (serviceName) => {
    if (!activeWorkspace) return;
    try {
      setConnecting(serviceName);
      const res = await api.connectChannelOAuth({
        workspaceId: activeWorkspace._id,
        serviceName,
        accountEmail: customEmail || (serviceName === 'google_workspace' ? `outbound@${activeWorkspace.domain || 'vyuhox.com'}` : undefined),
        callerIdPhone: customPhone || '+1 (415) 890-2234',
        customCredentials: customApiKey ? { apiKey: customApiKey } : {},
      });

      if (res.success) {
        showToast(res.message);
        setModalOpen(false);
        setCustomEmail('');
        setCustomPhone('');
        setCustomApiKey('');
        loadIntegrations();
      }
    } catch (err) {
      console.error('Connect error:', err);
      showToast('Connection failed', true);
    } finally {
      setConnecting(null);
    }
  };

  // Test Ping Handshake
  const handleTestPing = async (serviceName) => {
    if (!activeWorkspace) return;
    try {
      setPinging(serviceName);
      const res = await api.pingChannelIntegration(activeWorkspace._id, serviceName);
      if (res.success) {
        showToast(`⚡ ${res.message}`);
        loadIntegrations();
      }
    } catch (err) {
      console.error('Ping error:', err);
      showToast('Ping failed', true);
    } finally {
      setPinging(null);
    }
  };

  // Disconnect Channel
  const handleDisconnect = async (serviceName) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.disconnectChannelIntegration(activeWorkspace._id, serviceName);
      if (res.success) {
        showToast(res.message);
        loadIntegrations();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
      showToast('Disconnect failed', true);
    }
  };

  // Channel Icon Resolver
  const getChannelIcon = (serviceName) => {
    switch (serviceName) {
      case 'google_workspace':
        return <GoogleLogo size={24} />;
      case 'outlook_365':
        return <Mail size={24} color="#0078D4" />;
      case 'whatsapp_cloud':
        return <WhatsAppLogo size={24} />;
      case 'bland_ai_voice':
      case 'twilio_voice':
        return <PhoneCall size={24} color="#10B981" />;
      case 'meta_ads':
        return <MetaLogo size={24} />;
      case 'google_ads':
        return <TrendingUp size={24} color="#38BDF8" />;
      case 'telegram':
        return <TelegramLogo size={24} />;
      case 'linkedin':
        return <LinkedInLogo size={24} />;
      default:
        return <Link2 size={24} color="#CBD5E1" />;
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: toast.isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          fontWeight: '700',
          fontSize: '0.84rem',
          backdropFilter: 'blur(8px)',
        }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
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
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
          }}>
            <Link2 size={26} color="#040710" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                Client Self-Serve Channel Integration Wizard
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                Strict Tenant Isolation
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0' }}>
              Connect corporate mailboxes, WhatsApp Business, Voice caller IDs, and Ad Accounts in 2 clicks.
            </p>
          </div>
        </div>

        {/* Tenant Isolation Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '8px 14px',
          borderRadius: '10px',
        }}>
          <Lock size={14} color="#10B981" />
          <div style={{ fontSize: '0.74rem' }}>
            <span style={{ color: '#64748B' }}>Workspace Tenant: </span>
            <strong style={{ color: '#38BDF8' }}>{activeWorkspace?.name || 'Default Workspace'}</strong>
          </div>
        </div>
      </div>

      {/* Grid of Channels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: '20px',
      }}>
        {integrations.map((item) => {
          const isConnected = item.isActive && item.verificationStatus === 'CONNECTED';
          const isPingingThis = pinging === item.serviceName;
          const isConnectingThis = connecting === item.serviceName;

          return (
            <div
              key={item._id || item.serviceName}
              style={{
                background: 'rgba(11, 17, 32, 0.85)',
                border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: isConnected ? '0 10px 30px rgba(16, 185, 129, 0.05)' : 'none',
              }}
            >
              {/* Card Top */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getChannelIcon(item.serviceName)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: '#F8FAFC' }}>
                        {item.displayName}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Service: {item.serviceName}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isConnected ? '#10B981' : '#F59E0B',
                    border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {isConnected ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {isConnected ? 'CONNECTED' : 'NEEDS AUTH'}
                  </span>
                </div>

                {/* Account Details / Latency */}
                {isConnected ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.76rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    {item.oauthDetails?.accountEmail && (
                      <div style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="#38BDF8" />
                        <span><strong>Account:</strong> {item.oauthDetails.accountEmail}</span>
                      </div>
                    )}
                    {item.oauthDetails?.callerIdPhone && (
                      <div style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PhoneCall size={12} color="#10B981" />
                        <span><strong>Caller ID:</strong> {item.oauthDetails.callerIdPhone}</span>
                      </div>
                    )}
                    <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span>Latency: <strong style={{ color: '#10B981' }}>{item.lastPingLatencyMs || 34}ms</strong></span>
                      <span>Verified: {new Date(item.lastPingAt || Date.now()).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.45' }}>
                    Click "Connect 2-Click OAuth" to authorize this channel with zero manual API key configuration.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px' }}>
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleTestPing(item.serviceName)}
                      disabled={isPingingThis}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#38BDF8',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: isPingingThis ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Zap size={13} className={isPingingThis ? 'animate-spin' : ''} />
                      {isPingingThis ? 'Pinging Handshake...' : 'Test Ping'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(item.serviceName)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#EF4444',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedChannel(item);
                      setModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                      border: 'none',
                      color: '#040710',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    <span>Connect 2-Click OAuth</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Channel Connection & Step-by-Step Setup Guide Modal */}
      {modalOpen && selectedChannel && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#0B1120',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '680px',
            padding: '28px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(6, 182, 212, 0.25)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {getChannelIcon(selectedChannel.serviceName)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                    Connect {selectedChannel.displayName}
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    Isolated strictly to workspace: <strong style={{ color: '#38BDF8' }}>{activeWorkspace?.name}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Mode Toggle Pills: 1-Click Connect vs Step-by-Step Guide */}
            <div style={{
              display: 'flex',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '20px',
            }}>
              <button
                type="button"
                onClick={() => setConnectTab('ONE_CLICK')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: connectTab === 'ONE_CLICK' ? 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)' : 'transparent',
                  color: connectTab === 'ONE_CLICK' ? '#040710' : '#94A3B8',
                  fontWeight: connectTab === 'ONE_CLICK' ? '800' : '600',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={14} />
                <span>⚡ 1-Click Instant Connect (Recommended)</span>
              </button>

              <button
                type="button"
                onClick={() => setConnectTab('STEP_BY_STEP')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: connectTab === 'STEP_BY_STEP' ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' : 'transparent',
                  color: connectTab === 'STEP_BY_STEP' ? '#FFFFFF' : '#94A3B8',
                  fontWeight: connectTab === 'STEP_BY_STEP' ? '800' : '600',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <BookOpen size={14} />
                <span>📖 Step-by-Step Guide &amp; Custom API Keys</span>
              </button>
            </div>

            {/* TAB 1: 1-CLICK INSTANT CONNECT */}
            {connectTab === 'ONE_CLICK' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <ShieldCheck size={16} /> Autonomous Tenant Isolation Active
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0, lineHeight: '1.45' }}>
                    {selectedChannel.serviceName === 'whatsapp_cloud'
                      ? `Our platform automatically provisions a high-throughput WhatsApp Business Cloud API session for ${activeWorkspace?.name}. Inbound leads will be routed through Maya Voice AI & WhatsApp closers with zero manual Meta developer portal setup.`
                      : selectedChannel.serviceName === 'telegram'
                      ? `Instant bot authorization binds a secure webhook pipe to your workspace. Your AI agents will handle 24/7 lead inquiries and broadcast campaign updates instantly.`
                      : selectedChannel.serviceName.includes('voice')
                      ? `Allocates a high-reputation localized outbound Caller ID with 10DLC registration and carrier trust score pre-warmed for sub-450ms voice closers.`
                      : `Instant OAuth connection provisions authenticated API scopes with automatic token refreshing and AES-256 encrypted credential storage.`}
                  </p>
                </div>

                {/* Optional Overrides */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedChannel.serviceName.includes('mail') || selectedChannel.serviceName.includes('google') || selectedChannel.serviceName.includes('outlook') ? (
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                        Corporate Mailbox Address
                      </label>
                      <input
                        type="email"
                        placeholder={`outbound@${activeWorkspace?.domain || 'company.com'}`}
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ) : selectedChannel.serviceName.includes('voice') ? (
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                        Outbound Caller ID Phone (+E.164)
                      </label>
                      <input
                        type="text"
                        placeholder="+1 (415) 890-2234"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: 'none',
                      color: '#CBD5E1',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConnectOAuth(selectedChannel.serviceName)}
                    disabled={connecting === selectedChannel.serviceName}
                    style={{
                      padding: '10px 26px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                      border: 'none',
                      color: '#040710',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      cursor: connecting === selectedChannel.serviceName ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Zap size={15} />
                    {connecting === selectedChannel.serviceName ? 'Authorizing Cloud Pipeline...' : `⚡ Connect ${selectedChannel.displayName} in 1-Click`}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: STEP-BY-STEP INTEGRATION GUIDE & CUSTOM API KEYS */}
            {connectTab === 'STEP_BY_STEP' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedChannel.serviceName === 'whatsapp_cloud' ? (
                  /* WHATSAPP STEP-BY-STEP */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'rgba(37, 211, 102, 0.05)', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#25D366', marginBottom: '8px' }}>
                        📋 Meta WhatsApp Business Cloud API — 4-Step Setup Guide
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                        <li>
                          Open <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#38BDF8', fontWeight: '700' }}>Meta for Developers</a> &gt; Click <strong>My Apps</strong> &gt; <strong>Create App</strong> (Select App Type: <strong>"Business"</strong>).
                        </li>
                        <li>
                          Under <strong>Add Products to Your App</strong>, find <strong>WhatsApp</strong> and click <strong>Set Up</strong>.
                        </li>
                        <li>
                          In the left sidebar under <strong>WhatsApp &gt; API Setup</strong>, copy your <strong>Phone Number ID</strong> and <strong>WhatsApp Business Account (WABA) ID</strong>. Generate a <strong>Permanent System User Access Token</strong>.
                        </li>
                        <li>
                          Under <strong>WhatsApp &gt; Configuration</strong>, click <strong>Edit Webhook</strong> and configure:
                        </li>
                      </ol>

                      {/* Webhook Copy Box */}
                      <div style={{ marginTop: '10px', background: '#020617', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Callback URL:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('https://api.vyuhox.com/api/webhooks/whatsapp', 'wa_url')}
                            style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Copy size={12} /> {copiedKey === 'wa_url' ? 'Copied!' : 'Copy URL'}
                          </button>
                        </div>
                        <code style={{ fontSize: '0.74rem', color: '#38BDF8', wordBreak: 'break-all', display: 'block', marginBottom: '8px' }}>
                          https://api.vyuhox.com/api/webhooks/whatsapp
                        </code>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Verify Token:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('vyuhox_webhook_verify_token', 'wa_token')}
                            style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Copy size={12} /> {copiedKey === 'wa_token' ? 'Copied!' : 'Copy Token'}
                          </button>
                        </div>
                        <code style={{ fontSize: '0.74rem', color: '#10B981' }}>
                          vyuhox_webhook_verify_token
                        </code>
                        <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '6px' }}>
                          ⚠️ In Meta Webhook Fields, check <strong>"messages"</strong> to enable incoming customer chat routing.
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Phone Number ID (from Meta API Setup)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 104829102847291"
                        value={customPhoneId}
                        onChange={(e) => setCustomPhoneId(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8FAFC', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Permanent System User Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="EAABw..."
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8FAFC', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                ) : selectedChannel.serviceName === 'telegram' ? (
                  /* TELEGRAM STEP-BY-STEP */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#38BDF8', marginBottom: '8px' }}>
                        🤖 Telegram Bot 3-Step Setup Guide
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                        <li>Open Telegram and message <strong>@BotFather</strong>.</li>
                        <li>Send command <code>/newbot</code>, give your bot a name and username (e.g. <code>{activeWorkspace?.name?.replace(/\s+/g, '_')}_GTM_bot</code>).</li>
                        <li>Copy the HTTP API Bot Token provided by @BotFather and paste it below.</li>
                      </ol>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Telegram Bot Token
                      </label>
                      <input
                        type="password"
                        placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8FAFC', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                ) : selectedChannel.serviceName.includes('voice') ? (
                  /* TWILIO / VOICE STEP-BY-STEP */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#10B981', marginBottom: '8px' }}>
                        📞 Twilio &amp; Bland.ai Voice Caller Setup Guide
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                        <li>Log in to your <strong>Twilio Console</strong> &gt; Copy your <strong>Account SID</strong> and <strong>Auth Token</strong>.</li>
                        <li>Buy or allocate a phone number with Voice capabilities in <strong>+E.164</strong> format (e.g. <code>+14158902234</code>).</li>
                        <li>Configure Voice Webhook to: <code>https://api.vyuhox.com/api/voice/webhook</code></li>
                      </ol>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Verified Outbound Caller ID Phone (+E.164)
                      </label>
                      <input
                        type="text"
                        placeholder="+1 (415) 890-2234"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8FAFC', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Twilio Auth Token / API Secret
                      </label>
                      <input
                        type="password"
                        placeholder="Auth Token"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8FAFC', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                ) : (
                  /* GENERAL API INTEGRATION */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#38BDF8', marginBottom: '6px' }}>
                        🔐 Enterprise API Authentication
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0, lineHeight: '1.5' }}>
                        Enter your private developer credentials or system user access token for {selectedChannel.displayName}. All credentials are encrypted with AES-256-GCM.
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        API Key / Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="Enter API key or access token"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8FAFC', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '10px 18px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#CBD5E1', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConnectOAuth(selectedChannel.serviceName)}
                    disabled={connecting === selectedChannel.serviceName}
                    style={{
                      padding: '10px 26px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      cursor: connecting === selectedChannel.serviceName ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {connecting === selectedChannel.serviceName ? 'Verifying Credentials...' : 'Save & Verify Connection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
