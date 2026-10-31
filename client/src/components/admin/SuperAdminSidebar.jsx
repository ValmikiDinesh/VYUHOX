import React from 'react';
import {
  ShieldCheck,
  Activity,
  Building2,
  Radio,
  DollarSign,
  LogOut,
  ChevronRight,
  Sparkles,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

export default function SuperAdminSidebar({
  activePillar,
  setActivePillar,
  onSwitchToPlatformHQ,
  onLogout,
  pendingTicketsCount = 0,
}) {
  const navItems = [
    {
      id: 'vitals',
      label: 'Executive Command & Vitals',
      icon: Activity,
      description: 'Platform metrics, radar & watchdog',
    },
    {
      id: 'tenants',
      label: 'Client Workspaces & Support',
      icon: Building2,
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} New` : null,
      badgeColor: '#EF4444',
      description: 'Accounts, inspect view & tickets',
    },
    {
      id: 'integrations',
      label: 'Carrier Integrations & Kill-Switch',
      icon: Radio,
      description: 'Apollo, Twilio, Gemini & circuit breaker',
    },
    {
      id: 'finops',
      label: 'FinOps, Rates & Audit Trail',
      icon: DollarSign,
      description: 'Zero-overdraft rates, DNC & logs',
    },
  ];

  return (
    <aside
      style={{
        width: '290px',
        minWidth: '290px',
        height: '100vh',
        background: 'linear-gradient(180deg, #070B14 0%, #030712 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Platform Master Header */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(2, 132, 199, 0.45)',
              color: '#FFFFFF',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              VYUHOX
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Master Platform Console
            </div>
          </div>
        </div>

        {/* Live System Pill */}
        <div
          style={{
            marginTop: '14px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: '700' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>Sovereign Engine Online</span>
          </div>
          <span style={{ color: '#64748B', fontSize: '0.68rem' }}>v1.0.0</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px 6px' }}>
          Governance Pillars
        </div>

        {navItems.map((item) => {
          const active = activePillar === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePillar(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                border: active ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: active
                  ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.2) 0%, rgba(15, 23, 42, 0.4) 100%)'
                  : 'transparent',
                color: active ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: active ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: active ? '#38BDF8' : '#64748B',
                }}
              >
                <Icon size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: active ? '800' : '600', color: active ? '#F8FAFC' : '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '8px',
                        background: item.badgeColor,
                        color: '#FFFFFF',
                        fontSize: '0.62rem',
                        fontWeight: '800',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Switch to Platform HQ Client Workspace */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <button
          onClick={onSwitchToPlatformHQ}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: '800',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
            e.currentTarget.style.borderColor = '#F59E0B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#FBBF24" />
            <span>Platform HQ Workspace</span>
          </div>
          <ChevronRight size={14} />
        </button>

        {/* Founder Logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '0 4px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Logged in: <strong style={{ color: '#F1F5F9' }}>founder@vyuhox.ai</strong>
          </div>
          <button
            onClick={onLogout}
            title="Log out of Super Admin"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
            }}
          >
            <LogOut size={13} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

