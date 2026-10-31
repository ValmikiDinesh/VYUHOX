import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  CreditCard,
  ChevronDown,
  LogOut,
  ExternalLink,
  Plus,
  Shield,
  Bot,
  Zap,
} from 'lucide-react';

export default function TopBar({
  currentUser,
  activeWorkspace,
  operatingMode,
  onToggleOperatingMode,
  onOpenNewLeadModal,
  wallet,
  onOpenAddFundsModal,
  socketConnected,
  onViewLanding,
  onSignOut,
  currency = 'INR',
  onToggleCurrency,
  rolePersona = 'superadmin',
  onChangeRolePersona,
  onNavigateTab,
  onOpenSanjayaVoiceModal,
  onOpenCommandPalette,
}) {
  const isINR = currency === 'INR';
  const exchangeRate = 83.5;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const walletBalance = Number(wallet?.balanceUSD ?? 0);
  const formattedBalance = isINR
    ? `₹${(walletBalance * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : `$${walletBalance.toFixed(2)}`;

  return (
    <header
      style={{
        height: '48px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: 'var(--border-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Left: Breadcrumbs & Living Heartbeat Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ color: '#64748B', fontWeight: '500' }}>VYUHOX</span>
          <span style={{ color: '#CBD5E1' }}>/</span>
          <span style={{ color: '#0F172A', fontWeight: '700' }}>
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '1px 6px',
              borderRadius: '9999px',
              background: '#E0F2FE',
              color: '#0284C7',
              border: '1px solid #BAE6FD',
              marginLeft: '4px',
            }}
          >
            {operatingMode === 'AI_COMPANY' ? 'Autonomous AI' : 'Tool Mode'}
          </span>
        </div>

        {/* Live Socket Telemetry Dot */}
        <div
          title={socketConnected ? 'Cluster Live & Synchronized' : 'Connecting to Cluster...'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            fontSize: '0.68rem',
            color: '#059669',
            fontWeight: '600',
          }}
        >
          <span className="pulse-emerald" />
          <span>{socketConnected ? 'Live' : 'Reconnecting'}</span>
        </div>
      </div>

      {/* Center: Spotlight Omnibar Search Input */}
      <div
        onClick={() => {
          if (onOpenCommandPalette) onOpenCommandPalette();
          else if (onOpenSanjayaVoiceModal) onOpenSanjayaVoiceModal();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '320px',
          height: '30px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '0 10px',
          cursor: 'pointer',
          color: '#64748B',
          fontSize: '0.78rem',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.borderColor = '#CBD5E1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#F8FAFC';
          e.currentTarget.style.borderColor = '#E2E8F0';
        }}
      >
        <Search size={14} style={{ color: '#64748B' }} />
        <span style={{ flex: 1, color: '#64748B' }}>Search or command...</span>
        <kbd
          style={{
            fontSize: '0.65rem',
            padding: '1px 5px',
            borderRadius: '4px',
            background: '#F1F5F9',
            color: '#475569',
            fontFamily: 'monospace',
            border: '1px solid #E2E8F0',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right: Currency Toggle, Compute Wallet, Quick Action, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Currency Switcher Pill */}
        {onToggleCurrency && (
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              padding: '1px',
            }}
          >
            <button
              onClick={() => onToggleCurrency('USD')}
              style={{
                border: 'none',
                background: !isINR ? '#FFFFFF' : 'transparent',
                color: !isINR ? '#0284C7' : '#64748B',
                boxShadow: !isINR ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                borderRadius: '5px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              $ USD
            </button>
            <button
              onClick={() => onToggleCurrency('INR')}
              style={{
                border: 'none',
                background: isINR ? '#FFFFFF' : 'transparent',
                color: isINR ? '#D97706' : '#64748B',
                boxShadow: isINR ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                borderRadius: '5px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              ₹ INR
            </button>
          </div>
        )}

        {/* Compute Wallet Pill */}
        <button
          onClick={onOpenAddFundsModal}
          title="Deposit prepaid compute funds"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#D1FAE5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ECFDF5')}
        >
          <CreditCard size={12} />
          <span className="tabular-nums">{formattedBalance}</span>
          <span style={{ fontSize: '0.65rem', color: '#047857', opacity: 0.9 }}>+ Add</span>
        </button>

        {/* 1-Click Fast Action */}
        <button
          onClick={onOpenNewLeadModal}
          className="btn-primary"
          style={{
            height: '28px',
            padding: '0 10px',
            fontSize: '0.75rem',
            gap: '4px',
            borderRadius: '6px',
          }}
        >
          <Plus size={13} />
          <span>New Lead</span>
        </button>

        {/* Consolidated Profile Popover */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: '800',
                color: '#FFFFFF',
              }}
            >
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <ChevronDown size={12} style={{ color: '#64748B' }} />
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '220px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: '10px',
                padding: '6px',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A' }}>
                  {currentUser?.name || 'Founder'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  {currentUser?.email || 'client@vyuhox.ai'}
                </div>
              </div>

              <div style={{ padding: '4px 0' }}>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onToggleOperatingMode) onToggleOperatingMode();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#475569',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Bot size={13} color="#0284C7" />
                  <span>Toggle Operating Mode</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onViewLanding) onViewLanding();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#475569',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <ExternalLink size={13} color="#64748B" />
                  <span>View Public Marketing Site</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onSignOut) onSignOut();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#DC2626',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={13} color="#DC2626" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
