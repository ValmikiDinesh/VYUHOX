import React, { useState } from 'react';
import { Target, Users, DollarSign, ArrowRight, Sparkles, RefreshCw, Briefcase, Zap } from 'lucide-react';
import { api } from '../../services/api';

export default function IcpCalculator({ onNavigateHome }) {
  const [industry, setIndustry] = useState('Fintech & B2B Payments');
  const [productDescription, setProductDescription] = useState('Cross-border remittance API & automated FX hedging for enterprise exporters');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!industry.trim()) return;

    try {
      setIsCalculating(true);
      const res = await api.calculateIcp(industry, productDescription);
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error('ICP calculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
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
          <span className="badge badge-purple" style={{ marginBottom: '10px', display: 'inline-flex', gap: '6px' }}>
            <Sparkles size={13} /> FREE PROGRAMMATIC LINK MAGNET • ZERO SIGNUP REQUIRED
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.03em', margin: '8px 0' }}>
            B2B ICP Persona &amp; ACV Deal Size Calculator
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
            Enter your market vertical or product offer. Our AI strategy engine deduces 3 qualified buyer personas, estimated contract values, and exact decision maker job titles.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Industry Vertical or Target Market
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Healthcare SaaS, Industrial Manufacturing, Logistics"
                className="input-glass"
                style={{ height: '42px', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Core Product / Offering Summary
              </label>
              <textarea
                rows={3}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="What pain does your product solve? Who uses it?"
                className="input-glass"
                style={{ padding: '12px', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={isCalculating || !industry.trim()}
              className="btn-primary"
              style={{ height: '44px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isCalculating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Deducing Qualified Buyer Personas...
                </>
              ) : (
                <>
                  <Target size={16} /> Calculate 3 ICP Personas &amp; ACV Values
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Grid */}
        {result?.personas && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#06B6D4" /> 3 High-Conversion Buyer Personas for "{result.industry}"
              </h3>
              <span className="badge badge-emerald">Deduction Complete</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {result.personas.map((p, idx) => (
                <div key={idx} className="glass-panel" style={{
                  padding: '22px',
                  borderRadius: '14px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Persona {idx + 1}</span>
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700' }}>{p.urgencyLevel} Urgency</span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0 10px', lineHeight: '1.3' }}>
                      {p.personaTitle}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      Target Pain Point
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '4px 0 12px', lineHeight: '1.4' }}>
                      {p.painPoint}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      Decision Maker Job Titles
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '6px 0 12px' }}>
                      {(p.decisionMakerJobTitles || []).map((t, i) => (
                        <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.72rem', color: '#7DD3FC' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Est. Deal Size (ACV):</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#34D399' }}>{p.estimatedAcv}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Platform Viral CTA Banner */}
            <div style={{
              marginTop: '10px',
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.12) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Auto-Prospect &amp; Close These Personas with VYUHOX
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                  Our AI scouts verified mobile phones and work emails for these exact titles, with sub-45s voice closer handoff.
                </div>
              </div>
              <button
                onClick={onNavigateHome}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Launch Autonomous Campaign Free →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
