import React, { useState } from 'react';
import { Globe, Shield, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function DnsTester({ onNavigateHome }) {
  const [domain, setDomain] = useState('vyuhox.com');
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async (e) => {
    if (e) e.preventDefault();
    if (!domain.trim()) return;

    try {
      setIsTesting(true);
      const res = await api.testDomainDns(domain);
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error('DNS test failed:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040810',
      color: '#F8FAFC',
      fontFamily: 'Outfit, -apple-system, sans-serif',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{ maxWidth: '860px', width: '100%', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onNavigateHome}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            color: '#04101A',
          }}>
            V
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>VYUHOX Free Tools</span>
        </div>

        <button
          onClick={onNavigateHome}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Explore Autonomous GTM Platform</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '860px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '10px', display: 'inline-flex', gap: '6px' }}>
            <Sparkles size={13} /> FREE PROGRAMMATIC LINK MAGNET • ZERO SIGNUP REQUIRED
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.03em', margin: '8px 0' }}>
            Domain MX, SPF, DKIM &amp; DMARC Deliverability Tester
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
            Verify that your domain records comply with 2026 Google Workspace, Microsoft 365, and Yahoo DMARC sender enforcement guidelines.
          </p>
        </div>

        {/* Input Card */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <form onSubmit={handleTest} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Globe size={18} color="#06B6D4" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain (e.g. yourcompany.com)"
                className="input-glass"
                style={{ paddingLeft: '44px', height: '44px', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={isTesting || !domain.trim()}
              className="btn-primary"
              style={{ height: '44px', padding: '0 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isTesting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Querying Root Nameservers...
                </>
              ) : (
                <>
                  <Shield size={16} /> Test Deliverability Records
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        {result && (
          <div className="glass-panel" style={{
            padding: '28px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: `1px solid ${getScoreColor(result.healthScore)}44`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>
                  Domain Deliverability Health
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: getScoreColor(result.healthScore) }}>
                    {result.healthScore}
                  </span>
                  <span style={{ fontSize: '1.2rem', color: '#64748B' }}>/ 100</span>
                  <span className={`badge ${result.healthScore >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ marginLeft: '8px' }}>
                    {result.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Tested Domain</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#CBD5E1' }}>{result.domain}</span>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', display: 'block', marginTop: '2px' }}>
                  Primary MX: {result.primaryMx}
                </span>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: result.hasMx ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: result.hasMx ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {result.hasMx ? <CheckCircle2 size={20} color="#10B981" /> : <XCircle size={20} color="#EF4444" />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: result.hasMx ? '#34D399' : '#F87171' }}>
                    MX Records ({result.mxCount})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{result.hasMx ? 'Mail Server Active' : 'No Mail Server'}</div>
                </div>
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: result.hasSpf ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: result.hasSpf ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {result.hasSpf ? <CheckCircle2 size={20} color="#10B981" /> : <XCircle size={20} color="#EF4444" />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: result.hasSpf ? '#34D399' : '#F87171' }}>
                    SPF Sender Policy
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{result.hasSpf ? 'Anti-Spoofing Valid' : 'Missing SPF TXT'}</div>
                </div>
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: result.hasDmarc ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: result.hasDmarc ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {result.hasDmarc ? <CheckCircle2 size={20} color="#10B981" /> : <XCircle size={20} color="#EF4444" />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: result.hasDmarc ? '#34D399' : '#F87171' }}>
                    DMARC Enforcement
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{result.hasDmarc ? '2026 Compliant' : 'Missing DMARC'}</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} /> DNS Configuration Action Items
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Viral CTA */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Automate 100% Deliverability with VYUHOX Safeguards
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                  Automatic mailbox warmup, rotating sender pools, and 10DLC compliance built directly into the platform.
                </div>
              </div>
              <button
                onClick={onNavigateHome}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Secure Outbound Deliverability Free →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
