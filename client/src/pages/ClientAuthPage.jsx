import {
  Sparkles,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
  Zap,
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    mobileNumber: '',
    password: '',
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
        if (!formData.name.trim()) {
          setError('Full Name is required.');
          setLoading(false);
          return;
        }
        if (!formData.email.trim()) {
          setError('Email ID is required.');
          setLoading(false);
          return;
        }
        if (!formData.companyName.trim()) {
          setError('Company / Business Name is required.');
          setLoading(false);
          return;
        }
        if (!formData.mobileNumber.trim()) {
          setError('Mobile Number is required.');
          setLoading(false);
          return;
        }
        if (!formData.password) {
          setError('Password is required.');
          setLoading(false);
          return;
        }

        const res = await api.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          companyName: formData.companyName.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          password: formData.password,
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
          email: formData.email.trim(),
          password: formData.password,
        });

        if (res.success) {
          authStorage.setSession(res.token, res.user, res.workspace);
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
              ? 'Create your account to unlock your dedicated business revenue engine.'
              : 'Access your live leads, voice closer, and autonomous C-Suite dashboard.'}
          </p>
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
                Full Name <span style={{ color: '#F87171' }}>*</span>
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
              Email ID <span style={{ color: '#F87171' }}>*</span>
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

          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
                  Company / Business Name <span style={{ color: '#F87171' }}>*</span>
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
                  Mobile Number <span style={{ color: '#F87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210 or +1 (555) 000-0000"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
              Password <span style={{ color: '#F87171' }}>*</span>
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
                <span>Create Account & Continue</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
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
            <span>One user • One dashboard • Dedicated business intelligence engine</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
            <Zap size={14} color="#06B6D4" />
            <span>Autonomous GTM strategy &amp; deep web/maps analysis</span>
          </div>
        </div>

        {/* Switch Mode Prompt */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.825rem', color: '#94A3B8' }}>
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
