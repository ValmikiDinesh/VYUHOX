import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onImport }) {
  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      [
        {
          name: 'Sarah Connor',
          company: 'Cyberdyne Systems',
          title: 'CTO',
          email: 'sconnor@cyberdyne.tech',
          phone: '+1 415 889 1234',
          stage: 'Prospect',
          score: 82,
          source: 'Scraper',
        },
        {
          name: 'Liam O\'Connor',
          company: 'Apex Dublin Trading',
          title: 'Head of Quant',
          email: 'liam@apexquant.ie',
          phone: '+353 1 496 0123',
          stage: 'Qualified',
          score: 91,
          source: 'Inbound',
        },
      ],
      null,
      2
    )
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImport = async () => {
    try {
      setError('');
      setLoading(true);
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JSON array of lead objects');
      }
      await onImport(parsed);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid JSON format');
      setLoading(false);
    }
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
        maxWidth: '560px',
        padding: '24px',
        border: '1px solid rgba(6, 182, 212, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="#06B6D4" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '700' }}>
              Bulk Lead Ingestion
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', background: 'transparent' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Paste JSON formatted lead records. They will be automatically mapped to the workspace CRM schema with AI scores.
        </p>

        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#FB7185',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <textarea
          rows="10"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="input-glass"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', lineHeight: '1.4' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleImport} disabled={loading} className="btn-primary">
            <Upload size={16} /> {loading ? 'Importing...' : 'Import Leads'}
          </button>
        </div>
      </div>
    </div>
  );
}
