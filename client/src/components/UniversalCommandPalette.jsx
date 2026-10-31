import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Users,
  PhoneCall,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Shield,
  CreditCard,
  Building2,
  ExternalLink,
  Bot,
  Globe,
  Settings,
  ArrowRight,
  Command,
} from 'lucide-react';

export default function UniversalCommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSanjaya,
  onOpenAddFunds,
  onOpenNewLead,
  workspaces = [],
  activeWorkspace,
  onSelectWorkspace,
  onViewLanding,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Default Quick Actions
  const allActions = [
    {
      id: 'sanjaya',
      title: 'Talk with SANJAYA (सञ्जय) Co-Founder',
      category: 'AI Co-Founder',
      icon: Sparkles,
      color: '#38BDF8',
      action: () => {
        onClose();
        if (onOpenSanjaya) onOpenSanjaya();
      },
    },
    {
      id: 'leads',
      title: 'Find New High-Intent Leads',
      category: 'Prospecting',
      icon: Users,
      color: '#0284C7',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('leads');
      },
    },
    {
      id: 'voice',
      title: 'Maya Vance Voice AI Calling Studio',
      category: 'Speed-to-Lead',
      icon: PhoneCall,
      color: '#FB7185',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('voice');
      },
    },
    {
      id: 'inbox',
      title: 'Omnichannel Inbox (WhatsApp, Email, SMS)',
      category: 'Communications',
      icon: MessageSquare,
      color: '#10B981',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('inbox');
      },
    },
    {
      id: 'ai-company',
      title: 'AI Company Boardroom & Digital HQ',
      category: 'Autonomous Workforce',
      icon: Bot,
      color: '#A855F7',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('ai-company');
      },
    },
    {
      id: 'strategy',
      title: 'Strategy & Value Proposition Synthesizer',
      category: 'Strategic Brain',
      icon: Globe,
      color: '#38BDF8',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('strategy');
      },
    },
    {
      id: 'ads',
      title: 'Autonomous Paid Ads Manager',
      category: 'Marketing',
      icon: TrendingUp,
      color: '#F59E0B',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('ads');
      },
    },
    {
      id: 'wallet',
      title: 'Deposit Funds to Prepaid Compute Wallet',
      category: 'FinOps & Billing',
      icon: CreditCard,
      color: '#10B981',
      action: () => {
        onClose();
        if (onOpenAddFunds) onOpenAddFunds();
      },
    },
    {
      id: 'new-lead',
      title: 'Add New Custom Lead Manually',
      category: 'CRM',
      icon: Users,
      color: '#38BDF8',
      action: () => {
        onClose();
        if (onOpenNewLead) onOpenNewLead();
      },
    },
    {
      id: 'public-site',
      title: 'View Public Live Marketing Website',
      category: 'Navigation',
      icon: ExternalLink,
      color: '#94A3B8',
      action: () => {
        onClose();
        if (onViewLanding) onViewLanding();
      },
    },
    {
      id: 'settings',
      title: 'Workspace Settings, DNC & Deliverability',
      category: 'Compliance',
      icon: Settings,
      color: '#64748B',
      action: () => {
        onClose();
        if (onNavigateTab) onNavigateTab('compliance');
      },
    },
  ];

  // Filter actions based on search query
  const filteredActions = allActions.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Keyboard Navigation (Esc to close, Up/Down arrows to select, Enter to execute)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(2, 4, 8, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="omnibar-active"
        style={{
          width: '640px',
          maxWidth: '92vw',
          background: '#0B0F19',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 25px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Search size={18} style={{ color: '#38BDF8', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search leads, or trigger actions..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: '500',
            }}
          />
          <kbd
            style={{
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredActions.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              No commands matching "{query}"
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: '600', color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontSize: '0.72rem' }}>
                      <span>Run</span>
                      <ArrowRight size={13} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(5, 8, 14, 0.7)',
            fontSize: '0.72rem',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span><strong style={{ color: '#94A3B8' }}>↑↓</strong> to navigate</span>
            <span><strong style={{ color: '#94A3B8' }}>↵</strong> to select</span>
            <span><strong style={{ color: '#94A3B8' }}>esc</strong> to dismiss</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38BDF8' }}>
            <Zap size={11} />
            <span>VYUHOX Omnibar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
