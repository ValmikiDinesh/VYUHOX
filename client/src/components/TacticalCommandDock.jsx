import React from 'react';
import { Mic, LifeBuoy, Sparkles } from 'lucide-react';

export default function TacticalCommandDock({
  isSanjayaOpen,
  setIsSanjayaOpen,
  isSupportOpen,
  setIsSupportOpen,
  unreadTicketsCount = 0,
}) {
  const toggleSanjaya = () => {
    if (!isSanjayaOpen) {
      setIsSupportOpen(false); // Close support if opening Sanjaya
      setIsSanjayaOpen(true);
    } else {
      setIsSanjayaOpen(false);
    }
  };

  const toggleSupport = () => {
    if (!isSupportOpen) {
      setIsSanjayaOpen(false); // Close Sanjaya if opening support
      setIsSupportOpen(true);
    } else {
      setIsSupportOpen(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        padding: '5px 8px',
        borderRadius: '40px',
        background: 'rgba(11, 17, 32, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.65), 0 0 20px rgba(6, 182, 212, 0.15)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Segment 1: Sanjaya Voice AI Button */}
      <button
        onClick={toggleSanjaya}
        title="Summon Sanjaya Celestial Voice Commander (Cmd+J / Ctrl+J)"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '8px 16px',
          borderRadius: '30px',
          background: isSanjayaOpen
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'rgba(245, 158, 11, 0.12)',
          color: isSanjayaOpen ? '#0F172A' : '#FBBF24',
          border: isSanjayaOpen ? '1px solid #F59E0B' : '1px solid rgba(245, 158, 11, 0.25)',
          cursor: 'pointer',
          fontWeight: '800',
          fontSize: '0.8rem',
          letterSpacing: '0.01em',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isSanjayaOpen) {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSanjayaOpen) {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: isSanjayaOpen ? '#0F172A' : 'rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mic size={14} color={isSanjayaOpen ? '#FBBF24' : '#F59E0B'} />
        </div>
        <span>Sanjaya AI</span>
        <span
          style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '8px',
            background: isSanjayaOpen ? 'rgba(0, 0, 0, 0.25)' : 'rgba(245, 158, 11, 0.2)',
            color: isSanjayaOpen ? '#FFFFFF' : '#FDE68A',
            fontWeight: '700',
          }}
        >
          ⌘J
        </span>
      </button>

      {/* Subtle Capsule Divider */}
      <div
        style={{
          width: '1px',
          height: '20px',
          background: 'rgba(255, 255, 255, 0.12)',
          margin: '0 6px',
        }}
      />

      {/* Segment 2: Support Desk Button */}
      <button
        onClick={toggleSupport}
        title="Open Support Desk & Diagnostic Help"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 15px',
          borderRadius: '30px',
          background: isSupportOpen
            ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'
            : 'rgba(56, 189, 248, 0.1)',
          color: isSupportOpen ? '#FFFFFF' : '#38BDF8',
          border: isSupportOpen ? '1px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.25)',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '0.8rem',
          letterSpacing: '0.01em',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isSupportOpen) {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSupportOpen) {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <LifeBuoy size={15} color={isSupportOpen ? '#FFFFFF' : '#38BDF8'} />
        <span>Support</span>
        {unreadTicketsCount > 0 && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }}
          />
        )}
      </button>
    </div>
  );
}
