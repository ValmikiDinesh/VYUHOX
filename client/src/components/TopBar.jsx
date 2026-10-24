import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  Globe,
  Radio,
  UserCheck,
  CreditCard,
  Share2,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Shield,
  Layers,
  ExternalLink,
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
  onOpenConnectChannels,
}) {
  const isAiMode = operatingMode === 'AI_COMPANY';
  const isINR = currency === 'INR';
  const exchangeRate = 83.5;

  // Dropdown States
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { id: 'client_ai', label: 'Client (Autonomous AI Co.)', badge: 'Client', color: '#10B981' },
    { id: 'client_tool', label: 'Client (Self-Serve Tool)', badge: 'Tool', color: '#F59E0B' },
    { id: 'superadmin', label: 'Superadmin (Platform Owner)', badge: 'Master', color: '#06B6D4' },
  ];

  const currentRoleObj = roles.find((r) => r.id === rolePersona) || roles[0];

  const walletBalance = wallet?.balanceUSD || 0;
  const formattedBalance = isINR
    ? `₹${(walletBalance * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : `$${walletBalance.toFixed(2)}`;

  return (
    <header style={{
      height: '62px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(11, 17, 32, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Left: Active workspace breadcrumb & Live status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.05rem',
            fontWeight: '800',
            color: '#F8FAFC',
            letterSpacing: '-0.01em',
            margin: 0,
          }}>
            {activeWorkspace?.name || 'VYUHOX Platform'}
          </h1>
          <span className={`badge ${
            activeWorkspace?.industry === 'Crypto' ? 'badge-cyan' :
            activeWorkspace?.industry === 'D2C' ? 'badge-rose' : 'badge-emerald'
          }`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
            {activeWorkspace?.industry || 'B2B'}
          </span>
        </div>

        {/* Real-time gateway status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(16, 185, 129, 0.08)',
          padding: '3px 7px',
          borderRadius: '999px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '0.675rem',
          color: '#34D399',
          fontWeight: '600',
        }}>
          <Radio size={10} color="#10B981" />
          <span>{socketConnected ? 'Live' : 'Connecting'}</span>
        </div>
      </div>

      {/* Center: Sleek Search Bar */}
      <div style={{ position: 'relative', width: '300px' }}>
        <Search size={14} color="#64748B" style={{ position: 'absolute', left: '12px', top: '11px' }} />
        <input
          type="text"
          placeholder="Search leads, calls, campaigns... (Ctrl+K)"
          className="input-glass"
          style={{ paddingLeft: '34px', height: '34px', fontSize: '0.8rem', borderRadius: '8px' }}
        />
      </div>

      {/* Right: Clean, Uncluttered Executive Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* 1. Currency Switcher Pill */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2px',
        }}>
          <button
            onClick={() => onToggleCurrency && onToggleCurrency('INR')}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: 'none',
              background: isINR ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: isINR ? '#FBBF24' : '#94A3B8',
              fontSize: '0.7rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            title="Display in INR (₹)"
          >
            INR ₹
          </button>
          <button
            onClick={() => onToggleCurrency && onToggleCurrency('USD')}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: 'none',
              background: !isINR ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: !isINR ? '#38BDF8' : '#94A3B8',
              fontSize: '0.7rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            title="Display in USD ($)"
          >
            USD $
          </button>
        </div>

        {/* 2. Wallet Credit Chip */}
        <button
          onClick={onOpenAddFundsModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
          }}
          title="Deposit compute credit"
        >
          <CreditCard size={13} />
          <span>{formattedBalance}</span>
          <span style={{
            fontSize: '0.625rem',
            padding: '1px 5px',
            borderRadius: '4px',
            background: '#10B981',
            color: '#04101A',
            fontWeight: '800',
          }}>
            + Add
          </span>
        </button>

        {/* 2.5 Prominent Live Public Site Button */}
        <button
          onClick={onViewLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            color: '#38BDF8',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.15)',
          }}
          title="Switch to public live website"
        >
          <Globe size={13} color="#38BDF8" />
          <span>Public Site</span>
          <ExternalLink size={12} color="#38BDF8" />
        </button>

        {/* 3. Consolidated '+ Action' Dropdown Button */}
        <div ref={actionMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setActionMenuOpen(!actionMenuOpen)}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
            }}
          >
            <Plus size={14} />
            <span>Action</span>
            <ChevronDown size={13} />
          </button>

          {actionMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              background: '#0D1527',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '6px',
              width: '210px',
              zIndex: 60,
              boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
            }}>
              <div
                onClick={() => { onOpenNewLeadModal(); setActionMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: '#F8FAFC',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Plus size={14} color="#06B6D4" />
                <span>Add Inbound Lead</span>
              </div>

              <div
                onClick={() => { onOpenConnectChannels(); setActionMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: '#F8FAFC',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Share2 size={14} color="#25D366" />
                <span>Connect Channels (WA/TG)</span>
              </div>

              <div
                onClick={() => { onToggleOperatingMode(); setActionMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: '#F8FAFC',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Sparkles size={14} color="#10B981" />
                <span>{isAiMode ? 'Switch to Tool Mode' : 'Upgrade to AI Company'}</span>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

              <div
                onClick={() => { onViewLanding(); setActionMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: '#94A3B8',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Globe size={14} color="#38BDF8" />
                <span>View Public Site</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. User Profile Avatar Dropdown */}
        <div ref={profileMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: rolePersona === 'superadmin'
                ? 'linear-gradient(135deg, #06B6D4, #8B5CF6)'
                : 'linear-gradient(135deg, #10B981, #06B6D4)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={currentUser?.name || "User Profile"}
          >
            {currentUser?.name
              ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : activeWorkspace?.ownerName
              ? activeWorkspace.ownerName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : rolePersona === 'superadmin'
              ? 'SA'
              : (activeWorkspace?.name ? activeWorkspace.name.substring(0, 2).toUpperCase() : 'DV')}
          </button>

          {profileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              background: '#0D1527',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '8px',
              width: '240px',
              zIndex: 60,
              boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
            }}>
              {/* Profile Card Header */}
              <div style={{ padding: '8px 10px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {currentUser?.name || activeWorkspace?.ownerName || (rolePersona === 'superadmin' ? 'Nanda Sai (Platform Owner)' : activeWorkspace?.name || 'Dinesh Valmiki')}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginTop: '2px', wordBreak: 'break-all' }}>
                  {currentUser?.email || activeWorkspace?.ownerEmail || (rolePersona === 'superadmin' ? 'founder@vyuhox.ai' : 'valmikidineshoffcl@gmail.com')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${rolePersona === 'superadmin' ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.625rem' }}>
                    {rolePersona === 'superadmin' ? 'Platform Super Admin' : 'Workspace Owner'}
                  </span>
                  {activeWorkspace?.name && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>
                      {activeWorkspace.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Only Super Admin can see developer perspective switcher */}
              {rolePersona === 'superadmin' && (
                <div style={{ padding: '8px 8px 4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                    Admin Preview Persona:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {roles.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onChangeRolePersona && onChangeRolePersona(r.id);
                          setProfileMenuOpen(false);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.725rem',
                          color: rolePersona === r.id ? '#F8FAFC' : '#94A3B8',
                          background: rolePersona === r.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{r.label}</span>
                        <span style={{ fontSize: '0.6rem', color: r.color, fontWeight: '700' }}>{r.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Client Account Details */}
              {rolePersona !== 'superadmin' && (
                <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#CBD5E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Workspace:</span>
                    <strong style={{ color: '#38BDF8' }}>{activeWorkspace?.name || 'Quantum Shield'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Industry:</span>
                    <span>{activeWorkspace?.industry || 'B2B'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Plan:</span>
                    <span style={{ color: '#10B981', fontWeight: '600' }}>
                      {activeWorkspace?.subscription?.planTier ? activeWorkspace.subscription.planTier.replace(/_/g, ' ') : 'Self-Serve Tool Mode'}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '6px 0' }} />

              <div
                onClick={() => {
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    onViewLanding();
                  }
                  setProfileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#EF4444',
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
