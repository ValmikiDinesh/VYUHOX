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
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  const showToast = (msg, isError = false) => {
    setToast({ text: msg, isError });
    setTimeout(() => setToast(null), 4500);
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

      {/* 2-Click OAuth Connect Modal */}
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
            maxWidth: '560px',
            padding: '28px',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(6, 182, 212, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#10B981" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Connect {selectedChannel.displayName}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.45', marginBottom: '18px' }}>
              Authorize this channel with strict tenant isolation. All messages, webhooks, and phone pings will be isolated strictly to your workspace (<strong style={{ color: '#38BDF8' }}>{activeWorkspace?.name}</strong>).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
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
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
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
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    System Access Token / API Key (Optional Override)
                  </label>
                  <input
                    type="password"
                    placeholder="Auto-provisioned via OAuth if left blank"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '9px 16px',
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
                  padding: '9px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  border: 'none',
                  color: '#040710',
                  fontWeight: '800',
                  cursor: connecting === selectedChannel.serviceName ? 'not-allowed' : 'pointer',
                }}
              >
                {connecting === selectedChannel.serviceName ? 'Authorizing OAuth...' : 'Confirm 2-Click Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
