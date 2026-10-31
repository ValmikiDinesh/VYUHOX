import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Send, CheckCircle2, AlertTriangle, Shield, Terminal, LifeBuoy } from 'lucide-react';
import { api } from '../services/api';

export default function SupportHelpWidget({ activeWorkspace, wallet, operatingMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [activeView, setActiveView] = useState('new'); // 'new' | 'history'

  const userEmail = activeWorkspace?.ownerEmail || localStorage.getItem('vyuhox_user_email') || 'client@vyuhox.ai';
  const userName = activeWorkspace?.ownerName || localStorage.getItem('vyuhox_user_name') || 'Client Operator';

  // Fetch recent tickets for this workspace when widget opens
  useEffect(() => {
    if (isOpen && activeWorkspace?._id) {
      fetchWorkspaceTickets();
    }
  }, [isOpen, activeWorkspace?._id]);

  const fetchWorkspaceTickets = async () => {
    try {
      const res = await api.get(`/api/support/tickets?workspaceId=${activeWorkspace?._id}&limit=10`);
      if (res?.data?.success) {
        setRecentTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.warn('[SupportWidget] Error fetching history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // Auto-capture technical diagnostics snapshot
    const diagnosticsSnapshot = {
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : '',
      walletBalanceUSD: wallet?.balanceUSD || 0,
      currentStrategyId: activeWorkspace?.currentStrategyId || '',
      lastApiError: sessionStorage.getItem('last_client_api_error') || 'None recorded',
      operatingMode: operatingMode || 'AI_COMPANY',
      planTier: activeWorkspace?.subscription?.planTier || 'FREE_AUDIT',
    };

    try {
      const payload = {
        workspaceId: activeWorkspace?._id,
        workspaceName: activeWorkspace?.name || 'Workspace',
        userId: activeWorkspace?.ownerId || null,
        userEmail,
        userName,
        subject,
        message,
        priority,
        diagnosticsSnapshot,
      };

      const res = await api.post('/api/support/ticket', payload);
      if (res?.data?.success) {
        setSubmittedTicket(res.data.ticket);
        setSubject('');
        setMessage('');
        fetchWorkspaceTickets();
      } else {
        setError(res?.data?.message || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('[SupportWidget] Submit failed:', err);
      setError(err?.response?.data?.message || err.message || 'Network error submitting ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '190px',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#38BDF8',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 8px 25px rgba(15, 23, 42, 0.65)',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '0.82rem',
          letterSpacing: '0.02em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="Open Support & Engineering Help Desk"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.borderColor = '#38BDF8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
        }}
      >
        <LifeBuoy size={16} color="#38BDF8" />
        <span>Support</span>
      </button>

      {/* Modal / Flyout Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: '620px',
            background: '#0F172A',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.1)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(90deg, #1E293B 0%, #0F172A 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                }}
              >
                <LifeBuoy size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#F8FAFC' }}>
                  VYUHOX Help Desk
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#10B981' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Super Admin & Engineering Active
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSubmittedTicket(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub-Tabs (New Ticket vs History) */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#0B1120',
            }}
          >
            <button
              onClick={() => setActiveView('new')}
              style={{
                flex: 1,
                padding: '10px',
                background: activeView === 'new' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeView === 'new' ? '2px solid #38BDF8' : '2px solid transparent',
                color: activeView === 'new' ? '#38BDF8' : '#64748B',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Open New Ticket
            </button>
            <button
              onClick={() => {
                setActiveView('history');
                fetchWorkspaceTickets();
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: activeView === 'history' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeView === 'history' ? '2px solid #38BDF8' : '2px solid transparent',
                color: activeView === 'history' ? '#38BDF8' : '#64748B',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Ticket History ({recentTickets.length})
            </button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {activeView === 'new' ? (
              submittedTicket ? (
                <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                  <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px', color: '#F8FAFC', fontSize: '1.05rem' }}>
                    Ticket Submitted!
                  </h4>
                  <div
                    style={{
                      display: 'inline-block',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38BDF8',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      marginBottom: '12px',
                    }}
                  >
                    #{submittedTicket.ticketNumber}
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem', lineHeight: '1.5', margin: '0 0 20px' }}>
                    Your technical diagnostics and workspace state have been transmitted to the Super Admin desk. Any applicable credit adjustments will be directly credited to your wallet.
                  </p>
                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setActiveView('history');
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#38BDF8',
                      color: '#0F172A',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    View Ticket Status
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Diagnostics Auto-Attach Banner */}
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '0.72rem',
                      color: '#94A3B8',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: '700', marginBottom: '4px' }}>
                      <Terminal size={12} />
                      <span>Auto-Attached Technical Diagnostics</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: '#CBD5E1' }}>
                      <span>Workspace: <strong>{activeWorkspace?.name || 'Current'}</strong></span>
                      <span>•</span>
                      <span>Wallet: <strong>${(wallet?.balanceUSD || 0).toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Mode: <strong>{operatingMode}</strong></span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                      Priority Level
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setPriority(lvl)}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '6px',
                            border: priority === lvl ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: priority === lvl ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            color: priority === lvl ? '#38BDF8' : '#94A3B8',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Scraper stopped at lead #45 / Dialer timeout"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                      Issue Details & Expected Behavior
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Please explain what happened. If applicable, describe the step where you got stuck."
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '0.82rem',
                        lineHeight: '1.4',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {error && (
                    <div style={{ color: '#EF4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !subject.trim() || !message.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || !subject.trim() || !message.trim() ? 0.6 : 1,
                      marginTop: '4px',
                    }}
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Transmitting Diagnostics...' : 'Submit Support Ticket'}</span>
                  </button>
                </form>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentTickets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: '0.8rem' }}>
                    No support tickets submitted for this workspace yet.
                  </div>
                ) : (
                  recentTickets.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#38BDF8' }}>
                          #{t.ticketNumber}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background:
                              t.status === 'RESOLVED'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : t.status === 'IN_REVIEW'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(56, 189, 248, 0.15)',
                            color:
                              t.status === 'RESOLVED'
                                ? '#10B981'
                                : t.status === 'IN_REVIEW'
                                ? '#F59E0B'
                                : '#38BDF8',
                          }}
                        >
                          {t.status}
                        </span>
                      </div>
                      <h5 style={{ margin: '0 0 4px', fontSize: '0.82rem', color: '#F1F5F9' }}>
                        {t.subject}
                      </h5>
                      <p style={{ margin: '0 0 8px', fontSize: '0.74rem', color: '#94A3B8', lineHeight: '1.4' }}>
                        {t.message}
                      </p>
                      {t.creditedAmountUSD > 0 && (
                        <div
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            color: '#10B981',
                            fontWeight: '700',
                            marginBottom: '6px',
                          }}
                        >
                          +${t.creditedAmountUSD.toFixed(2)} Credited to Wallet
                        </div>
                      )}
                      {t.adminNotes && (
                        <div style={{ fontSize: '0.72rem', color: '#CBD5E1', background: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px' }}>
                          <strong>Admin Note:</strong> {t.adminNotes}
                        </div>
                      )}
                      <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '6px' }}>
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

