import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Sparkles, Mail, RefreshCw, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

export default function SpamChecker({ onNavigateHome }) {
  const [subject, setSubject] = useState('');
  const [emailText, setEmailText] = useState(
    "Hi Alexander,\n\nI wanted to reach out because we offer a 100% free consultation to help double your income. Act now for an exclusive deal with no risk and guaranteed results!\n\nClick here to get started today."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!emailText.trim()) return;

    try {
      setIsAnalyzing(true);
      const res = await api.checkEmailSpam(emailText, subject);
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error('Spam check failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10B981';
    if (score >= 65) return '#F59E0B';
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
      {/* Header & Nav */}
      <div style={{ maxWidth: '840px', width: '100%', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      <div style={{ maxWidth: '840px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Title Card */}
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '10px', display: 'inline-flex', gap: '6px' }}>
            <Sparkles size={13} /> FREE PROGRAMMATIC LINK MAGNET • ZERO SIGNUP REQUIRED
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.03em', margin: '8px 0' }}>
            Cold Email Spam Score &amp; Deliverability Tester
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto' }}>
            Evaluate your outbound copy against 200+ spam keywords, spam filter tripwires, and 2026 Google &amp; Yahoo primary inbox guidelines.
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Subject Line (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quick question regarding your B2B sales pipeline"
                className="input-glass"
                style={{ height: '42px', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Email Body Copy
              </label>
              <textarea
                rows={6}
                required
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste your cold email copy here..."
                className="input-glass"
                style={{ padding: '14px', fontSize: '0.9rem', lineHeight: '1.5' }}
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !emailText.trim()}
              className="btn-primary"
              style={{ height: '44px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Analyzing 200+ Spam Filters...
                </>
              ) : (
                <>
                  <Shield size={16} /> Audit Cold Email Deliverability
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
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: `1px solid ${getScoreColor(result.deliverabilityScore)}44`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>
                  Inbox Deliverability Score
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: getScoreColor(result.deliverabilityScore) }}>
                    {result.deliverabilityScore}
                  </span>
                  <span style={{ fontSize: '1.2rem', color: '#64748B' }}>/ 100</span>
                  <span className={`badge ${result.deliverabilityScore >= 80 ? 'badge-emerald' : result.deliverabilityScore >= 60 ? 'badge-amber' : 'badge-red'}`} style={{ marginLeft: '8px' }}>
                    {result.rating.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Word Count</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#CBD5E1' }}>{result.wordCount} words</span>
                <span style={{ fontSize: '0.72rem', color: result.wordCount > 150 ? '#EF4444' : '#10B981', display: 'block', marginTop: '2px' }}>
                  {result.wordCount > 150 ? '⚠️ High Word Count (Ideal: 50-120)' : '✓ Concise Length'}
                </span>
              </div>
            </div>

            {/* Triggers Found */}
            {result.triggersFound?.length > 0 ? (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} /> {result.triggersFound.length} Spam Words &amp; Aggressive Pitch Flags Detected:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.triggersFound.map((trig, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.8rem', fontWeight: '600' }}>
                      "{trig}"
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34D399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Zero blacklisted spam trigger words detected in your copy!
              </div>
            )}

            {/* AI Optimization Suggestions */}
            {result.suggestions?.length > 0 && (
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  💡 Deliverability Optimization Tips
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                  {result.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Platform Viral CTA Banner */}
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
                  Never Land in Spam Again: Deploy VYUHOX Caleb SDR
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                  Autonomous 1-to-1 personalized copywriting with pre-flight anti-spam audit and sub-45s Maya Voice callbacks.
                </div>
              </div>
              <button
                onClick={onNavigateHome}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Start Autonomous Outbound Free →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
