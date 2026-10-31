import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Mic,
  Video,
  TrendingUp,
  Calendar,
  Bot,
  Settings,
  Shield,
  Sparkles,
  Cpu,
  ShoppingBag,
  Globe,
  Link2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export default function Sidebar({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenNewWorkspaceModal,
  operatingMode,
  onToggleOperatingMode,
  activeTab,
  setActiveTab,
  wallet,
  onOpenAddFundsModal,
  rolePersona = 'superadmin',
  currency = 'USD',
  exchangeRate = 83.5,
  onViewLanding,
  currentUser,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isSuperadmin = rolePersona === 'superadmin' || currentUser?.role === 'superadmin';

  // 3 Clean Grouped Accordions
  const navGroups = [
    {
      group: 'OPERATIONAL COCKPIT',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'ai-company', label: 'Autonomous Boardroom', icon: Bot },
        { id: 'leads', label: 'Lead Discovery & CRM', icon: Users },
        { id: 'inbox', label: 'Omnichannel Inbox', icon: MessageSquare },
      ],
    },
    {
      group: 'AUTONOMOUS ENGINES',
      items: [
        { id: 'voice', label: 'Maya Voice Closer', icon: Mic },
        { id: 'calendar', label: 'Calendar & Bookings', icon: Calendar },
        { id: 'strategy', label: 'Strategy & Brain', icon: Globe },
        { id: 'social', label: 'Social Video Studio', icon: Video },
        { id: 'ads', label: 'Paid Ads Optimizer', icon: TrendingUp },
      ],
    },
    {
      group: 'GOVERNANCE & FINOPS',
      items: [
        { id: 'integrations', label: 'Carrier Integrations', icon: Link2 },
        { id: 'compliance', label: 'Deliverability & DNC', icon: Shield },
        { id: 'seo-aeo', label: 'SEO / AEO Engine', icon: Sparkles },
        { id: 'settings', label: 'Settings & Wallet', icon: Settings },
        ...(isSuperadmin
          ? [{ id: 'admin-plans', label: 'Super Admin Console', icon: ShieldCheck, superadminOnly: true }]
          : []),
      ],
    },
  ];

  const brandName = 'VYUHOX';

  const walletBalanceNum = Number(wallet?.balanceUSD ?? 0);
  const formattedBalance = currency === 'INR'
    ? `₹${(walletBalanceNum * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : `$${walletBalanceNum.toFixed(2)}`;

  return (
    <aside
      style={{
        width: collapsed ? '68px' : '260px',
        minWidth: collapsed ? '68px' : '260px',
        height: '100vh',
        background: 'var(--surface-1)',
        borderRight: 'var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'Inter, system-ui, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* Brand & Workspace Header */}
      <div
        style={{
          height: '56px',
          padding: collapsed ? '0 12px' : '0 16px',
          borderBottom: 'var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(2, 132, 199, 0.4)',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Cpu size={18} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  {brandName}
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: '800',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  GTM 1.0
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>
                Autonomous Cockpit
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            title="Collapse Sidebar (Cmd+B)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <button
            onClick={() => setCollapsed(false)}
            title="Expand Sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed ? '12px 6px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {navGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  color: '#475569',
                  letterSpacing: '0.06em',
                  padding: '0 8px 6px',
                  textTransform: 'uppercase',
                }}
              >
                {group.group}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: collapsed ? '9px 0' : '8px 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      position: 'relative',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.12s ease',
                      boxShadow: isActive ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94A3B8';
                      }
                    }}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '6px',
                          bottom: '6px',
                          width: '3px',
                          background: '#38BDF8',
                          borderRadius: '0 2px 2px 0',
                          boxShadow: '0 0 8px #38BDF8',
                        }}
                      />
                    )}
                    <Icon
                      size={17}
                      style={{
                        color: isActive ? '#38BDF8' : '#64748B',
                        flexShrink: 0,
                      }}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Footer: Wallet & Profile */}
      <div
        style={{
          padding: collapsed ? '12px 6px' : '14px 12px',
          borderTop: 'var(--border-hairline)',
          background: 'rgba(4, 6, 10, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Wallet Mini-Pill */}
        {!collapsed ? (
          <div
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'var(--surface-2)',
              border: 'var(--border-hairline)',
              boxShadow: 'var(--specular-top-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                Pre-paid Compute
              </div>
              <div className="tabular-nums" style={{ fontSize: '0.9rem', fontWeight: '800', color: '#10B981' }}>
                {formattedBalance}
              </div>
            </div>
            <button
              onClick={onOpenAddFundsModal}
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
            >
              + Add
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAddFundsModal}
            title={`Compute Balance: ${formattedBalance}`}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <CreditCard size={16} />
          </button>
        )}

        {/* User Identity */}
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '2px 4px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: '800',
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'F'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.name || activeWorkspace?.name || 'Founder'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                {activeWorkspace?.industry || 'Enterprise'}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
