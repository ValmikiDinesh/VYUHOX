import React, { useState } from 'react';
import {
  Sparkles,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';
import { authStorage } from '../services/authStorage';

export default function ClientAuthPage({
  initialMode = 'signin', // 'signin' | 'signup'
  onAuthSuccess,
  defaultCurrency = 'INR',
  onBackToLanding,
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const pendingCrawlUrl = typeof window !== 'undefined' ? sessionStorage.getItem('vyuhox_pending_crawl_url') || '' : '';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    websiteUrl: pendingCrawlUrl,
    industry: 'AI_AUTO_DETECT',
    businessCategory: '',
    businessModelDescription: '',
    currency: defaultCurrency,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName || `${formData.name.split(' ')[0]}'s Company`,
          websiteUrl: formData.websiteUrl,
          industry: formData.industry,
          businessCategory: formData.businessCategory,
          businessModelDescription: formData.businessModelDescription,
        });

        if (res.success) {
          authStorage.setSession(res.token, res.user, res.workspace);
          const isAiCompanyPaid = res.workspace?.operatingMode === 'AI_COMPANY' && res.workspace?.subscription?.planTier && res.workspace?.subscription?.planTier !== 'NONE';
          const signupPersona = isAiCompanyPaid ? 'client_ai' : 'client_tool';
          if (onAuthSuccess) {
            onAuthSuccess(res.user, res.workspace, formData.currency, signupPersona, res.token);
          }
        } else {
          setError(res.message || 'Registration failed. Please try again.');
        }
      } else {
        // Sign In
        const res = await api.login({
          email: formData.email,
          password: formData.password,
        });

        if (res.success) {
          authStorage.setSession(res.token, res.user, res.workspace);
          // If a client logs in, route to client dashboard with their authentic plan
          const isAiCompanyPaid = res.workspace?.operatingMode === 'AI_COMPANY' && res.workspace?.subscription?.planTier && res.workspace?.subscription?.planTier !== 'NONE';
          const persona = res.user.role === 'superadmin' ? 'superadmin' : (isAiCompanyPaid ? 'client_ai' : 'client_tool');
          if (onAuthSuccess) {
            onAuthSuccess(res.user, res.workspace, formData.currency, persona, res.token);
          }
        } else {
          setError(res.message || 'Invalid email or password. Please verify your credentials.');
        }
      }
    } catch (err) {
      console.error('Client auth error:', err);
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0A1628 0%, #030712 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background glows */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      {/* Top Navigation / Brand */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '32px',
        right: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div
          onClick={onBackToLanding}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            color: '#030712',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            V
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', letterSpacing: '0.05em' }}>
            VYUHOX
          </span>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>
            Client Portal
          </span>
        </div>

        <button
          onClick={onBackToLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#CBD5E1',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38BDF8'; e.currentTarget.style.color = '#38BDF8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.color = '#CBD5E1'; }}
        >
          <ArrowLeft size={14} />
          <span>Back to Website</span>
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="card" style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(11, 17, 32, 0.95)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.1)',
        borderRadius: '20px',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10,
        marginTop: '40px',
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
          }}>
            {mode === 'signup' ? (
              <Sparkles size={26} color="#030712" />
            ) : (
              <LogIn size={26} color="#030712" />
            )}
          </div>

          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 6px' }}>
            {mode === 'signup' ? 'Create Your Client Workspace' : 'Sign In to Your Workspace'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
            {mode === 'signup'
              ? 'Deploy your autonomous AI C-Suite and scale multi-channel pipeline.'
              : 'Access your live leads, voice closer, and autonomous C-Suite dashboard.'}
          </p>

          {pendingCrawlUrl && (
            <div style={{
              marginTop: '14px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#38BDF8',
              textAlign: 'left',
            }}>
              <Sparkles size={14} color="#06B6D4" />
              <span>
                <strong>Website queued for crawl:</strong> {pendingCrawlUrl} — your GTM strategy, business plan &amp; ICP will synthesize immediately upon entry.
              </span>
            </div>
          )}
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              background: mode === 'signin' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: mode === 'signin' ? '#34D399' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              background: mode === 'signup' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: mode === 'signup' ? '#38BDF8' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            <UserPlus size={15} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.825rem',
            marginBottom: '18px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass"
                  style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-glass"
                style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-glass"
                style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                  Company / Brand Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Flow AI"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                  Website or Business Profile Link (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={15} color="#06B6D4" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="url"
                    placeholder="https://yourcompany.com or Google Maps / Business Link"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '3px', display: 'block' }}>
                  Provide your link to let AI LLM immediately crawl and discover your offerings.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>
                      Industry Vertical
                    </label>
                    <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '700' }}>
                      AI Handled
                    </span>
                  </div>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box', background: '#0F172A', color: '#F8FAFC' }}
                  >
                    <option value="AI_AUTO_DETECT">✨ Auto-Detect by AI LLM (Recommended)</option>
                    <option value="B2B">B2B SaaS / Services</option>
                    <option value="Cybersecurity">Cybersecurity & PQC</option>
                    <option value="Crypto">Crypto & Web3</option>
                    <option value="Fintech">Fintech / Finance</option>
                    <option value="Health">Healthcare & Bio</option>
                    <option value="EdTech">EdTech & Education</option>
                    <option value="D2C">E-Commerce & D2C</option>
                    <option value="Local">Local & Professional</option>
                    <option value="Custom">Custom / Other Industry</option>
                  </select>
                  <span style={{ fontSize: '0.68rem', color: '#38BDF8', marginTop: '4px', display: 'block', lineHeight: '1.3' }}>
                    AI LLM will accurately detect and handle your category after crawling your business link.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                    Billing Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box', background: '#0F172A', color: '#F8FAFC' }}
                  >
                    <option value="INR">INR (₹) - India</option>
                    <option value="USD">USD ($) - Global</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                  Custom Business Category & Niche
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-Quantum Security, AI Legaltech, Clean Energy SaaS"
                  value={formData.businessCategory}
                  onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                  className="input-glass"
                  style={{ width: '100%', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                  About Your Business Model & Value Proposition (Optional)
                </label>
                <textarea
                  placeholder="Tell us what you sell, who your target buyers are, and how you charge..."
                  value={formData.businessModelDescription}
                  onChange={(e) => setFormData({ ...formData, businessModelDescription: e.target.value })}
                  className="input-glass"
                  rows={2}
                  style={{ width: '100%', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '44px',
              fontSize: '0.9rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'signup' ? (
              <>
                <span>Launch Client Workspace</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
            <CheckCircle size={14} color="#10B981" />
            <span>Autonomous 6-Agent C-Suite orchestration ready on launch</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
            <Zap size={14} color="#06B6D4" />
            <span>Sub-45s speed-to-lead outbound voice dialer included</span>
          </div>
        </div>

        {/* Switch Mode Prompt */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.8rem', color: '#94A3B8' }}>
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontWeight: '700', cursor: 'pointer', padding: 0 }}
              >
                Sign In here →
              </button>
            </span>
          ) : (
            <span>
              New to VYUHOX?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                style={{ background: 'transparent', border: 'none', color: '#34D399', fontWeight: '700', cursor: 'pointer', padding: 0 }}
              >
                Create an account →
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
