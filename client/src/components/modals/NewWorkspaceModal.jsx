import React, { useState } from 'react';
import { X, Building2, Sparkles } from 'lucide-react';

export default function NewWorkspaceModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'B2B',
    domain: '',
    operatingMode: 'TOOL',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        border: '1px solid rgba(6, 182, 212, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#06B6D4" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '700' }}>
              Create New Business Workspace
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', background: 'transparent' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Workspace / Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Global Ventures"
              className="input-glass"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Industry Vertical
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="input-glass"
            >
              <option value="Crypto">Crypto & Web3</option>
              <option value="Ecommerce">Ecommerce & Retail</option>
              <option value="B2B">B2B Enterprise / Agency</option>
              <option value="D2C">D2C Consumer Brands</option>
              <option value="Local">Local Services / SMB</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Website Domain
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="e.g. apexventures.io"
              className="input-glass"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Initial Operating Mode
            </label>
            <select
              value={formData.operatingMode}
              onChange={(e) => setFormData({ ...formData, operatingMode: e.target.value })}
              className="input-glass"
            >
              <option value="TOOL">Tool Mode (Manual Operator)</option>
              <option value="AI_COMPANY">Autonomous AI Company (24/7 Multi-Agent)</option>
            </select>
          </div>

          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.75rem',
            color: '#34D399',
          }}>
            🎁 Includes <strong>$50.00 complimentary starter balance</strong> for autonomous voice dialing and lead enrichment.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Sparkles size={16} /> {loading ? 'Creating...' : 'Launch Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
