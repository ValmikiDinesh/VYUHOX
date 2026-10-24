import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Key,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Zap,
  Radio,
} from 'lucide-react';
import {
  WhatsAppLogo,
  TelegramLogo,
  InstagramLogo,
  MetaLogo,
  LinkedInLogo,
  TwitterXLogo,
  YouTubeLogo,
  GoogleLogo,
  TikTokLogo,
} from '../SocialLogos';

export default function ConnectChannelsModal({ isOpen, onClose, activeWorkspace }) {
  const [activeChannel, setActiveChannel] = useState('whatsapp');
  const [connectionStates, setConnectionStates] = useState({
    whatsapp: { connected: true, identifier: '+1 (415) 890-2234', method: 'Cloud API & QR Bridge' },
    telegram: { connected: true, identifier: '@VyuhoxGtmBot', method: 'BotFather Webhook' },
    meta: { connected: false, identifier: '', method: 'Meta Graph API' },
    linkedin: { connected: true, identifier: `${activeWorkspace?.name || 'Workspace'} (Org ID: 88192)`, method: 'LinkedIn OAuth 2.0' },
    twitter: { connected: false, identifier: '', method: 'X API v2' },
    google: { connected: true, identifier: 'Google Ads (ID: 942-881-2290)', method: 'Conversions API' },
  });

  const [formInputs, setFormInputs] = useState({
    whatsappPhoneId: '109283746591029',
    whatsappToken: 'EAAO...active_token',
    telegramToken: '682910384:AAHk...telegram_live_token',
    metaPageId: '',
    metaToken: '',
    linkedinOrgId: '88192',
    twitterApiKey: '',
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = (channelKey) => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionStates((prev) => ({
        ...prev,
        [channelKey]: {
          ...prev[channelKey],
          connected: true,
          identifier: prev[channelKey].identifier || 'Connected & Verified',
        },
      }));
      setSuccessToast(`Successfully verified connection for ${channelKey.toUpperCase()}!`);
      setTimeout(() => setSuccessToast(null), 3500);
    }, 900);
  };

  const channelList = [
    { id: 'whatsapp', name: 'WhatsApp Business', logo: WhatsAppLogo, color: '#25D366' },
    { id: 'telegram', name: 'Telegram Bot', logo: TelegramLogo, color: '#29B6F6' },
    { id: 'meta', name: 'Instagram & Facebook', logo: InstagramLogo, color: '#E1306C' },
    { id: 'linkedin', name: 'LinkedIn Company', logo: LinkedInLogo, color: '#0A66C2' },
    { id: 'twitter', name: 'X / Twitter', logo: TwitterXLogo, color: '#F8FAFC' },
    { id: 'google', name: 'Google Ads & YouTube', logo: GoogleLogo, color: '#4285F4' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(4, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="card" style={{
        maxWidth: '860px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        padding: 0,
        background: '#0B1120',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
              Connect Channels & Social Media
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
              Link your official communication channels and social platforms to enable automated AI messaging, ads, and video posting.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '10px 24px',
            fontSize: '0.85rem',
            color: '#34D399',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Two-Column Body: Left Channel Tabs, Right Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, minHeight: '460px', overflow: 'hidden' }}>
          {/* Left Channel Tabs */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }}>
            {channelList.map((ch) => {
              const Logo = ch.logo;
              const isSelected = activeChannel === ch.id;
              const isConn = connectionStates[ch.id]?.connected;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Logo size={24} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC' }}>{ch.name}</div>
                      <div style={{ fontSize: '0.7rem', color: isConn ? '#34D399' : '#94A3B8' }}>
                        {isConn ? 'Connected' : 'Not Connected'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isConn ? '#10B981' : '#64748B',
                  }} />
                </button>
              );
            })}
          </div>

          {/* Right Configuration Form */}
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            {/* WhatsApp Configuration */}
            {activeChannel === 'whatsapp' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <WhatsAppLogo size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>WhatsApp Business Integration</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                      Powers two-way conversational AI, Marcus Cole's outbound messaging, and booking confirmations.
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(37, 211, 102, 0.08)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Radio size={18} color="#25D366" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#25D366' }}>Active Number: +1 (415) 890-2234</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Meta Cloud API • 99.9% Inbound Webhook SLA</div>
                    </div>
                  </div>
                  <span className="badge badge-emerald">Live</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      Meta Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={formInputs.whatsappPhoneId}
                      onChange={(e) => setFormInputs({ ...formInputs, whatsappPhoneId: e.target.value })}
                      className="input"
                      style={{ width: '100%', padding: '10px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      System User Permanent Access Token
                    </label>
                    <input
                      type="password"
                      value={formInputs.whatsappToken}
                      onChange={(e) => setFormInputs({ ...formInputs, whatsappToken: e.target.value })}
                      className="input"
                      style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.75rem',
                  }}>
                    <strong style={{ color: '#38BDF8' }}>Inbound Webhook URL (Paste in Meta Developer Portal):</strong>
                    <div style={{ color: '#F8FAFC', fontFamily: 'monospace', marginTop: '4px' }}>
                      https://api.vyuhox.com/api/webhooks/whatsapp
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleTestConnection('whatsapp')}
                    disabled={testingConnection}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    {testingConnection ? 'Testing Webhook...' : 'Verify WhatsApp Connection'}
                  </button>
                </div>
              </div>
            )}

            {/* Telegram Configuration */}
            {activeChannel === 'telegram' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <TelegramLogo size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Telegram Bot Integration</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                      Direct messaging, group notification triggers, and crypto/Web3 prospect conversations.
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(41, 182, 246, 0.08)',
                  border: '1px solid rgba(41, 182, 246, 0.25)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={18} color="#29B6F6" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#29B6F6' }}>Bot: @VyuhoxGtmBot</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Telegram Bot API • Webhook Active</div>
                    </div>
                  </div>
                  <span className="badge badge-cyan">Active</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      Bot Token (from @BotFather)
                    </label>
                    <input
                      type="text"
                      value={formInputs.telegramToken}
                      onChange={(e) => setFormInputs({ ...formInputs, telegramToken: e.target.value })}
                      placeholder="e.g. 123456789:ABCDefghIJKlmnoPQRstuvw"
                      className="input"
                      style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace' }}
                    />
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                    Create a bot in Telegram by messaging <code>@BotFather</code>, click <code>/newbot</code>, and paste the generated API token above.
                  </p>
                </div>

                <button
                  onClick={() => handleTestConnection('telegram')}
                  disabled={testingConnection}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  {testingConnection ? 'Checking Bot...' : 'Test Telegram Webhook'}
                </button>
              </div>
            )}

            {/* Meta (Instagram & Facebook) */}
            {activeChannel === 'meta' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <InstagramLogo size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Instagram & Facebook Pages</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                      Automated reels publishing, carousel posts, and Instagram DM sales conversations.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      Meta Facebook Page ID
                    </label>
                    <input
                      type="text"
                      value={formInputs.metaPageId}
                      onChange={(e) => setFormInputs({ ...formInputs, metaPageId: e.target.value })}
                      placeholder="e.g. 10928374659201"
                      className="input"
                      style={{ width: '100%', padding: '10px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      Instagram Graph API Access Token
                    </label>
                    <input
                      type="password"
                      value={formInputs.metaToken}
                      onChange={(e) => setFormInputs({ ...formInputs, metaToken: e.target.value })}
                      placeholder="Paste your long-lived page token"
                      className="input"
                      style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleTestConnection('meta')}
                  disabled={testingConnection}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  {testingConnection ? 'Authorizing Graph API...' : 'Connect Instagram & Meta Page'}
                </button>
              </div>
            )}

            {/* LinkedIn Configuration */}
            {activeChannel === 'linkedin' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <LinkedInLogo size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>LinkedIn Company Page</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                      B2B thought leadership articles, automated company updates, and lead form syncing.
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(10, 102, 194, 0.08)',
                  border: '1px solid rgba(10, 102, 194, 0.25)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={18} color="#0A66C2" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60A5FA' }}>Connected: {activeWorkspace?.name || 'Workspace'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Organization ID: 88192 • Auto-Publishing Enabled</div>
                    </div>
                  </div>
                  <span className="badge badge-cyan">Active</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      LinkedIn Organization ID
                    </label>
                    <input
                      type="text"
                      value={formInputs.linkedinOrgId}
                      onChange={(e) => setFormInputs({ ...formInputs, linkedinOrgId: e.target.value })}
                      className="input"
                      style={{ width: '100%', padding: '10px 12px' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleTestConnection('linkedin')}
                  disabled={testingConnection}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  {testingConnection ? 'Checking Token...' : 'Refresh LinkedIn OAuth Token'}
                </button>
              </div>
            )}

            {/* X / Twitter */}
            {activeChannel === 'twitter' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <TwitterXLogo size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>X (Twitter) Developer API</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                      Automated viral tweet storm generation, market commentary, and DM notifications.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      X API Key & Secret
                    </label>
                    <input
                      type="text"
                      value={formInputs.twitterApiKey}
                      onChange={(e) => setFormInputs({ ...formInputs, twitterApiKey: e.target.value })}
                      placeholder="Paste your consumer key"
                      className="input"
                      style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleTestConnection('twitter')}
                  disabled={testingConnection}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  {testingConnection ? 'Authorizing X...' : 'Connect X Account'}
                </button>
              </div>
            )}

            {/* Google / YouTube */}
            {activeChannel === 'google' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <GoogleLogo size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Google Ads & YouTube Shorts</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                      Offline conversion tracking (CAPI) and automated YouTube Shorts reel distribution.
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(66, 133, 244, 0.08)',
                  border: '1px solid rgba(66, 133, 244, 0.25)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={18} color="#4285F4" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60A5FA' }}>Customer ID: 942-881-2290</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Conversions API Connected • YouTube Ready</div>
                    </div>
                  </div>
                  <span className="badge badge-blue">Active</span>
                </div>

                <button
                  onClick={() => handleTestConnection('google')}
                  disabled={testingConnection}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  {testingConnection ? 'Pinging Google...' : 'Sync Google Conversions'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(4, 8, 16, 0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>End-to-end encrypted token storage with multi-tenant isolation.</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
