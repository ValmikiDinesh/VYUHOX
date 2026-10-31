import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Terminal,
  LifeBuoy,
  Paperclip,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';

export default function SupportHelpWidget({
  activeWorkspace,
  wallet,
  operatingMode,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = controlledOnClose || (() => setInternalIsOpen(false));

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [activeView, setActiveView] = useState('new'); // 'new' | 'history'

  // Screenshot & File Attachments State
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const userEmail = activeWorkspace?.ownerEmail || localStorage.getItem('vyuhox_user_email') || 'client@vyuhox.ai';
  const userName = activeWorkspace?.ownerName || localStorage.getItem('vyuhox_user_name') || 'Client Operator';

  // Fetch recent tickets for this workspace when widget opens
  useEffect(() => {
    if (isOpen && activeWorkspace?._id) {
      fetchWorkspaceTickets();
    }
  }, [isOpen, activeWorkspace?._id]);

  // Clipboard Paste Screenshot Listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = async (e) => {
      if (!isOpen || activeView !== 'new') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            uploadFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeView]);

  const uploadFile = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.uploadSupportAttachment(formData);
      if (res?.success && res.file) {
        setAttachments((prev) => [
          ...prev,
          {
            uploaderRole: 'CLIENT',
            uploaderEmail: userEmail,
            fileUrl: res.file.fileUrl,
            fileName: res.file.fileName,
            fileType: res.file.fileType,
            fileSizeKb: res.file.fileSizeKb,
          },
        ]);
      }
    } catch (err) {
      console.error('[SupportWidget] Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

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
        attachments,
      };

      const res = await api.post('/api/support/ticket', payload);
      if (res?.data?.success) {
        setSubmittedTicket(res.data.ticket);
        setSubject('');
        setMessage('');
        setAttachments([]);
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

  if (!isOpen) return null;

  return (
    <div
      className="specular-glass"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        width: '440px',
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: '680px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--specular-top-elevated), 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(2, 132, 199, 0.15)',
        border: 'var(--border-hairline)',
        borderRadius: '16px',
        background: 'rgba(8, 11, 18, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--surface-1)',
          borderBottom: 'var(--border-hairline)',
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
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
            }}
          >
            <LifeBuoy size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              VYUHOX Engineering Help Desk
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#10B981' }}>
              <span className="pulse-emerald" style={{ width: '6px', height: '6px' }} />
              Super Admin Desk Active • 2-Way Audit Trail
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            transition: 'color var(--duration-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={18} />
        </button>
      </div>

      {/* Sub-Tabs (New Ticket vs History) */}
      <div
        style={{
          display: 'flex',
          borderBottom: 'var(--border-hairline)',
          background: 'var(--surface-0)',
        }}
      >
        <button
          onClick={() => setActiveView('new')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeView === 'new' ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: activeView === 'new' ? '2px solid #38BDF8' : '2px solid transparent',
            color: activeView === 'new' ? '#38BDF8' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all var(--duration-fast)',
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
            background: activeView === 'history' ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: activeView === 'history' ? '2px solid #38BDF8' : '2px solid transparent',
            color: activeView === 'history' ? '#38BDF8' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all var(--duration-fast)',
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
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '800' }}>
                Ticket Submitted to Super Admin!
              </h4>
              <div
                className="tabular-nums"
                style={{
                  display: 'inline-block',
                  background: 'rgba(2, 132, 199, 0.15)',
                  color: '#38BDF8',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  marginBottom: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                #{submittedTicket.ticketNumber}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', margin: '0 0 20px' }}>
                Your technical diagnostics, error screenshot, and workspace state have been transmitted to the Sovereign Super Admin desk. Any applicable credit adjustments will be directly injected into your wallet.
              </p>
              <button
                onClick={() => {
                  setSubmittedTicket(null);
                  setActiveView('history');
                }}
                className="btn-primary"
                style={{
                  padding: '9px 20px',
                  fontSize: '0.82rem',
                }}
              >
                View Ticket Status
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Diagnostics Auto-Attach Banner */}
              <div
                className="specular-card"
                style={{
                  padding: '10px 12px',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--surface-1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: '700', marginBottom: '4px' }}>
                  <Terminal size={12} />
                  <span>Auto-Attached Technical Diagnostics</span>
                </div>
                <div className="tabular-nums" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: 'var(--text-primary)' }}>
                  <span>Workspace: <strong>{activeWorkspace?.name || 'Current'}</strong></span>
                  <span>•</span>
                  <span>Wallet: <strong style={{ color: '#10B981' }}>${(wallet?.balanceUSD || 0).toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Mode: <strong>{operatingMode}</strong></span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
                        border: priority === lvl ? '1px solid #38BDF8' : 'var(--border-hairline)',
                        background: priority === lvl ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: priority === lvl ? '#38BDF8' : 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all var(--duration-fast)',
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Scraper stopped at lead #45 / Voice latency issue"
                  required
                  className="specular-input"
                  style={{ boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Issue Details &amp; Expected Behavior
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Please describe what happened. You can also paste screenshots directly (Ctrl+V)!"
                  required
                  className="specular-input"
                  style={{
                    lineHeight: '1.45',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Screenshot & File Upload Dropzone */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Attach Screenshots / Logs (Paste with Ctrl+V)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38BDF8',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Paperclip size={12} />
                    <span>Browse File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.log,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Uploaded File Thumbnails */}
                {attachments.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="specular-card"
                        style={{
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.72rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <ImageIcon size={13} color="#38BDF8" />
                        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0 2px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '1px dashed rgba(56, 189, 248, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '0.72rem',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      background: 'rgba(2, 132, 199, 0.04)',
                      transition: 'border-color var(--duration-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38BDF8')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)')}
                  >
                    {isUploading ? 'Uploading screenshot...' : '📸 Click to browse or paste screenshot directly (Ctrl+V)'}
                  </div>
                )}
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
                className="btn-primary"
                style={{
                  padding: '11px',
                  width: '100%',
                  fontSize: '0.84rem',
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
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                No support tickets submitted for this workspace yet.
              </div>
            ) : (
              recentTickets.map((t) => (
                <div
                  key={t._id}
                  className="specular-card"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="tabular-nums" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#38BDF8' }}>
                      #{t.ticketNumber}
                    </span>
                    <span
                      className={`badge ${
                        t.status === 'RESOLVED'
                          ? 'badge-emerald'
                          : t.status === 'IN_REVIEW'
                          ? 'badge-amber'
                          : 'badge-cyan'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {t.subject}
                  </h5>
                  <p style={{ margin: '0 0 8px', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {t.message}
                  </p>

                  {/* Render attached screenshots if any */}
                  {t.attachments && t.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {t.attachments.map((att, attIdx) => (
                        <a
                          key={attIdx}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'var(--surface-0)',
                            border: 'var(--border-hairline)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            color: '#38BDF8',
                            fontSize: '0.68rem',
                            textDecoration: 'none',
                          }}
                        >
                          <ImageIcon size={11} />
                          <span>{att.fileName}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}

                  {t.creditedAmountUSD > 0 && (
                    <div
                      className="tabular-nums"
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
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px' }}>
                      <strong style={{ color: '#F8FAFC' }}>Admin Note:</strong> {t.adminNotes}
                    </div>
                  )}
                  <div className="tabular-nums" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

}
