import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Building2,
  DollarSign,
  Radio,
  Sparkles,
  ExternalLink,
  LogOut,
  ChevronDown,
  LifeBuoy,
  Globe,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function SuperAdminTopBar({
  currentUser,
  activePillar = 'vitals',
  workspaces = [],
  onSwitchToPlatformHQ,
  currency = 'USD',
  onToggleCurrency,
  exchangeRate = 83.5,
  pendingTicketsCount = 0,
  onLogout,
  onViewLanding,
}) {
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

  const isINR = currency === 'INR';

  // Calculate quick stats from workspaces
  const activeTenantsCount = workspaces.filter(
    (w) => w?.name !== 'VYUHOX Platform HQ'
  ).length;

  const totalWalletPoolUSD = workspaces.reduce((acc, w) => {
    return acc + (Number(w?.walletBalanceUSD) || Number(w?.wallet?.balanceUSD) || 0);
  }, 0);

  const formattedWalletPool = isINR
    ? `₹${(totalWalletPoolUSD * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : `$${totalWalletPoolUSD.toFixed(2)}`;

  const pillarTitles = {
    vitals: 'Platform Vitals & Real-Time Radar',
    tenants: 'Client Workspaces & Two-Way Support Desk',
    integrations: 'Carrier Integrations & Circuit Breaker',
    finops: 'FinOps, Dynamic Rates & Tamper-Evident Audit',
  };

  return (
    <header
      style={{
        height: '64px',
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Left: Active Pillar Title & Live Pulse */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {pillarTitles[activePillar] || 'Governance Console'}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                fontSize: '0.7rem',
                fontWeight: '700',
                letterSpacing: '0.02em',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              Live GTM Cluster
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Autonomous Multi-Tenant Orchestrator • Zero-Overdraft Pre-emptive Engine
          </div>
        </div>
      </div>

      {/* Middle: Sovereign Health Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Active Tenants Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Building2 size={13} style={{ color: '#38BDF8' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>Tenants:</span>
          <span style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: '800' }}>
            {activeTenantsCount} Active
          </span>
        </div>

        {/* Global Wallet Pool */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <DollarSign size={13} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>Pre-paid Pool:</span>
          <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800', fontFamily: 'monospace' }}>
            {formattedWalletPool}
          </span>
        </div>

        {/* Support Alert Pill */}
        {pendingTicketsCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              fontSize: '0.75rem',
              fontWeight: '800',
              animation: 'pulse 2s infinite',
            }}
          >
            <LifeBuoy size={13} />
            <span>{pendingTicketsCount} Support Ticket{pendingTicketsCount > 1 ? 's' : ''} Pending</span>
          </div>
        )}
      </div>

      {/* Right: Currency Toggle, Platform HQ Switcher, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Currency Switcher */}
        {onToggleCurrency && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => onToggleCurrency('USD')}
              style={{
                border: 'none',
                background: !isINR ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'transparent',
                color: !isINR ? '#FFFFFF' : '#94A3B8',
                borderRadius: '6px',
                padding: '4px 9px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              $ USD
            </button>
            <button
              onClick={() => onToggleCurrency('INR')}
              style={{
                border: 'none',
                background: isINR ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'transparent',
                color: isINR ? '#FFFFFF' : '#94A3B8',
                borderRadius: '6px',
                padding: '4px 9px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ₹ INR
            </button>
          </div>
        )}

        {/* 1-Click "Switch to Platform HQ Client Workspace" Button */}
        <button
          onClick={onSwitchToPlatformHQ}
          title="Switch to Platform HQ Client Workspace"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38BDF8',
            borderRadius: '9999px',
            padding: '7px 16px',
            fontSize: '0.78rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)';
            e.currentTarget.style.color = '#38BDF8';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(2, 132, 199, 0.25)';
          }}
        >
          <Sparkles size={14} />
          <span>Switch to Platform HQ Workspace</span>
          <ArrowRight size={13} />
        </button>

        {/* Admin Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '4px 12px 4px 5px',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '0.82rem',
                color: '#FFFFFF',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
              }}
            >
              SA
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#F8FAFC' }}>
                {currentUser?.name || 'Super Admin'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#38BDF8', fontWeight: '700' }}>
                Founder & Owner
              </div>
            </div>
            <ChevronDown size={14} style={{ color: '#94A3B8' }} />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '240px',
                background: '#090D1A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#FFFFFF' }}>
                  {currentUser?.name || 'Super Admin'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  {currentUser?.email || 'founder@vyuhox.ai'}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(2, 132, 199, 0.2)',
                    color: '#38BDF8',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}
                >
                  <ShieldCheck size={11} />
                  Sovereign Master Authority
                </div>
              </div>

              <div style={{ padding: '4px 0' }}>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onViewLanding) onViewLanding();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#94A3B8',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }}
                >
                  <Globe size={14} />
                  <span>View Public Live Site</span>
                  <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out Sovereign Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

