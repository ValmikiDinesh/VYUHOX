import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  MessageSquare,
  Mic,
  Video,
  TrendingUp,
  Calendar,
  Bot,
  Settings,
  ChevronDown,
  Plus,
  Zap,
  Shield,
  CreditCard,
  Building2,
  Sparkles,
  Cpu,
  ShoppingBag,
  RefreshCw,
  Globe,
  Link2,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Multi-tenant defense: superadmin can switch workspaces, clients only see their own workspace
  const isSuperadmin = rolePersona === 'superadmin' || currentUser?.role === 'superadmin';
  const visibleWorkspaces = isSuperadmin
    ? (workspaces || [])
    : (() => {
        const filtered = (workspaces || []).filter((w) =>
          currentUser?.workspaceId
            ? String(w._id) === String(currentUser.workspaceId)
            : activeWorkspace
            ? String(w._id) === String(activeWorkspace._id)
            : true
        );
        return filtered.length > 0 ? filtered : (workspaces || []);
      })();

  // Filter navigation items dynamically based on user role / package
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'strategy', label: 'Strategy & Business Plan', icon: Globe, count: 'Live' },
    { id: 'leads', label: 'Lead Prospecting', icon: Users, count: 'CRM' },
    { id: 'inbox', label: 'Omnichannel Outreach', icon: MessageSquare, count: 'AI SDR' },
    { id: 'voice', label: 'Voice AI Closer Maya', icon: Mic, count: 'Sub-45s' },
    { id: 'calendar', label: 'Calendar & Demos', icon: Calendar, count: 'Meetings' },
    { id: 'social', label: 'Social Studio', icon: Video, count: 'Live' },
    { id: 'ads', label: 'Ads Manager', icon: TrendingUp, count: 'Live' },
    { id: 'integrations', label: 'Channel Integrations', icon: Link2, count: 'Multi-Tenant' },
    { id: 'compliance', label: 'Deliverability & DNC', icon: Shield, count: '10DLC' },
    { id: 'seo-aeo', label: 'SEO & AEO Authority', icon: Sparkles, count: 'DR 50+' },
    { id: 'ai-company', label: 'AI Company HQ', icon: Bot, count: 'Live' },
    { id: 'agent-store', label: 'AI Employee Store', icon: ShoppingBag, count: 'New' },
    { id: 'admin-plans', label: 'Plans & Pricing Admin', icon: Shield, count: 'Admin', superadminOnly: true },
    { id: 'flywheel', label: 'Growth Flywheel', icon: RefreshCw, count: 'Auto', superadminOnly: true },
    { id: 'public-site', label: 'Live Public Website', icon: Globe, count: 'Site' },
    { id: 'settings', label: 'Settings & Billing', icon: Settings },
  ];

  const navItems = allNavItems.filter((item) => {
    if (item.superadminOnly && rolePersona !== 'superadmin') return false;
    return true;
  });

  const isAiMode = operatingMode === 'AI_COMPANY';
  const brandName = 'VYUHOX';
  const primaryGrad = 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)';

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      height: '100vh',
      background: 'rgba(11, 17, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
    }}>
      {/* Platform Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: primaryGrad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.45)',
          }}>
            <Cpu size={22} color="#04101A" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '0.02em',
                background: 'linear-gradient(90deg, #F8FAFC, #38BDF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {brandName}
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: '700',
                padding: '2px 5px',
                borderRadius: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}>
                GTM 1.0
              </span>
            </div>
            <p style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}>
              Autonomous GTM SaaS
            </p>
          </div>
        </div>

        {/* Workspace Card (Locked for Clients: 1 User = 1 Dashboard = 1 Business) */}
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <button
            onClick={() => {
              if (isSuperadmin) setDropdownOpen(!dropdownOpen);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              color: '#F8FAFC',
              cursor: isSuperadmin ? 'pointer' : 'default',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                fontSize: '0.8rem',
                fontWeight: '700',
              }}>
                {activeWorkspace ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '150px',
                }}>
                  {activeWorkspace ? activeWorkspace.name : 'Your Business'}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                  {activeWorkspace?.businessCategory || activeWorkspace?.industry || 'Active Business'}
                </div>
              </div>
            </div>
            {isSuperadmin ? (
              <ChevronDown size={16} color="#94A3B8" />
            ) : (
              <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                Locked
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              background: '#0D1527',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '12px',
              padding: '6px',
              zIndex: 50,
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                padding: '6px 8px',
                fontSize: '0.7rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                fontWeight: '700',
                letterSpacing: '0.05em',
              }}>
                Active Workspaces
              </div>
              {visibleWorkspaces.map((ws) => (
                <div
                  key={ws._id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: ws._id === activeWorkspace?._id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    color: ws._id === activeWorkspace?._id ? '#38BDF8' : '#CBD5E1',
                    fontSize: '0.8125rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      ws._id === activeWorkspace?._id ? 'rgba(6, 182, 212, 0.12)' : 'transparent')
                  }
                >
                  <span style={{ fontWeight: ws._id === activeWorkspace?._id ? '600' : '400' }}>
                    {ws.name}
                  </span>
                  <span style={{
                    fontSize: '0.675rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#94A3B8',
                  }}>
                    {ws.industry}
                  </span>
                </div>
              ))}
              {isSuperadmin && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenNewWorkspaceModal();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#10B981',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                    }}
                  >
                    <Plus size={16} /> Create Workspace
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Autonomous AI GTM Engine Badge */}
        <div style={{ marginTop: '14px' }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="live-dot"
                style={{
                  background: '#10B981',
                  boxShadow: '0 0 10px #10B981',
                }}
              />
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  color: '#38BDF8',
                  textTransform: 'uppercase',
                }}>
                  Autonomous AI GTM
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                  24/7 AI Multi-Agent Engine
                </div>
              </div>
            </div>
            <Sparkles size={16} color="#06B6D4" />
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'public-site') {
                  if (onViewLanding) onViewLanding();
                  return;
                }
                setActiveTab(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                color: isActive ? '#38BDF8' : '#94A3B8',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.8125rem',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#38BDF8' : '#64748B'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.625rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#64748B',
                }}>
                  {item.badge}
                </span>
              )}
              {item.count && (
                <span style={{
                  fontSize: '0.625rem',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Wallet Card & User Profile */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Wallet Balance Card */}
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
              GTM Compute Credit
            </div>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#10B981',
            }}>
              {currency === 'INR'
                ? `₹${(((wallet?.balanceUSD || 0) * exchangeRate)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : `$${wallet ? wallet.balanceUSD?.toFixed(2) : '0.00'}`}
            </div>
          </div>
          <button
            onClick={onOpenAddFundsModal}
            className="btn-primary"
            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
          >
            + Add
          </button>
        </div>

        {/* User Profile & Role Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 6px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: rolePersona === 'client_ai'
              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
              : rolePersona === 'client_tool'
              ? 'linear-gradient(135deg, #F59E0B, #10B981)'
              : 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#FFFFFF',
          }}>
            {currentUser?.name
              ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : (rolePersona.startsWith('client') ? 'CL' : 'NS')}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F8FAFC' }}>
              {currentUser?.name || (rolePersona.startsWith('client') ? activeWorkspace?.name || 'Client User' : 'Nanda Sai')}
            </div>
            <div style={{
              fontSize: '0.675rem',
              color: isSuperadmin ? '#10B981' : (!activeWorkspace?.subscription?.planTier || activeWorkspace?.subscription?.planTier === 'NONE') ? '#94A3B8' : rolePersona === 'client_ai' ? '#34D399' : '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Shield size={10} />
              {isSuperadmin
                ? 'Superadmin'
                : (!activeWorkspace?.subscription?.planTier || activeWorkspace?.subscription?.planTier === 'NONE')
                ? 'Plan: None (Free Audit)'
                : activeWorkspace?.subscription?.planTier === 'TOOL_MODE'
                ? 'Tool User ($49)'
                : 'AI Company ($249)'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
