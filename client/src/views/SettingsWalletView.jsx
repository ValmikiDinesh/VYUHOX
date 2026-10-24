import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  DollarSign,
  ArrowUpRight,
  Shield,
  CheckCircle,
  Clock,
  Sparkles,
  Key,
  Globe,
  Save,
} from 'lucide-react';

export default function SettingsWalletView({
  activeWorkspace,
  onUpdateWorkspace,
  wallet,
  onAddFunds,
  onUpdateWalletSettings,
}) {
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [industry, setIndustry] = useState(activeWorkspace?.industry || 'B2B');
  const [businessCategory, setBusinessCategory] = useState(activeWorkspace?.businessCategory || '');
  const [businessModelDescription, setBusinessModelDescription] = useState(activeWorkspace?.businessModelDescription || '');
  const [domain, setDomain] = useState(activeWorkspace?.domain || '');
  const [depositAmount, setDepositAmount] = useState('100');
  const [isSavingWs, setIsSavingWs] = useState(false);
  const [wsSaveMessage, setWsSaveMessage] = useState('');

  React.useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name || '');
      setIndustry(activeWorkspace.industry || 'B2B');
      setDomain(activeWorkspace.domain || '');
      setBusinessCategory(activeWorkspace.businessCategory || '');
      setBusinessModelDescription(activeWorkspace.businessModelDescription || '');
    }
  }, [activeWorkspace]);

  // Auto recharge state
  const [autoRecharge, setAutoRecharge] = useState(wallet?.autoRechargeEnabled || false);
  const [rechargeThreshold, setRechargeThreshold] = useState(wallet?.rechargeThreshold || 25);
  const [rechargeAmount, setRechargeAmount] = useState(wallet?.rechargeAmount || 100);

  const handleSaveWorkspace = async (e) => {
    e.preventDefault();
    setIsSavingWs(true);
    await onUpdateWorkspace({
      name,
      industry,
      domain,
      businessCategory,
      businessModelDescription,
    });
    setIsSavingWs(false);
    setWsSaveMessage('Workspace settings updated successfully!');
    setTimeout(() => setWsSaveMessage(''), 3000);
  };

  const handleDeposit = async () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      await onAddFunds(val);
    }
  };

  const handleSaveAutoRecharge = async () => {
    await onUpdateWalletSettings({
      autoRechargeEnabled: autoRecharge,
      rechargeThreshold: parseFloat(rechargeThreshold),
      rechargeAmount: parseFloat(rechargeAmount),
    });
  };

  const integrations = [
    { name: 'Bland.ai (Voice Engine)', status: 'Connected', key: 'Live WebRTC' },
    { name: 'Twilio (Telecom Gateway)', status: 'Connected', key: 'A2P 10DLC' },
    { name: 'OpenAI (Reasoning Core)', status: 'Active', key: 'GPT-4o & Mini' },
    { name: 'Resend (Email Gateway)', status: 'Active', key: 'Dedicated IP' },
    { name: 'Meta Ads Manager API', status: 'Standby', key: 'Pixel & CAPI' },
    { name: 'Google Ads API', status: 'Standby', key: 'Search & PMax' },
  ];

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '800' }}>
          Workspace Settings & GTM Wallet
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Manage your multi-tenant organization profile, custom domains, and autonomous API billing
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Workspace Profile Settings */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Building2 size={18} color="#06B6D4" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
              Workspace Identity
            </h3>
          </div>

          <form onSubmit={handleSaveWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Business / Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-glass"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Industry Sector
              </label>
              <select
                value={['B2B', 'Cybersecurity', 'Crypto', 'Fintech', 'Health', 'EdTech', 'Ecommerce', 'D2C', 'Local'].includes(industry) ? industry : 'Custom'}
                onChange={(e) => {
                  if (e.target.value !== 'Custom') {
                    setIndustry(e.target.value);
                  }
                }}
                className="input-glass"
                style={{ cursor: 'pointer' }}
              >
                <option value="B2B">B2B SaaS / Services</option>
                <option value="Cybersecurity">Cybersecurity & PQC</option>
                <option value="Crypto">Crypto & Web3</option>
                <option value="Fintech">Fintech & Capital Markets</option>
                <option value="Health">Healthcare & Biotech</option>
                <option value="EdTech">EdTech & Education</option>
                <option value="Ecommerce">Ecommerce & Retail</option>
                <option value="D2C">D2C Brand</option>
                <option value="Local">Local & Professional Services</option>
                <option value="Custom">Custom / Other Industry (Specify below)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Custom Business Category & Niche
              </label>
              <input
                type="text"
                value={businessCategory}
                onChange={(e) => {
                  setBusinessCategory(e.target.value);
                  if (industry === 'Custom' || !['B2B', 'Cybersecurity', 'Crypto', 'Fintech', 'Health', 'EdTech', 'Ecommerce', 'D2C', 'Local'].includes(industry)) {
                    setIndustry(e.target.value || 'Custom');
                  }
                }}
                placeholder="e.g. Post-Quantum Cryptography & Enterprise Risk Readiness"
                className="input-glass"
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Define your exact business niche so autonomous SDRs and Voice Agents tailor their pitch.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Business Model & Offering Explanation
              </label>
              <textarea
                value={businessModelDescription}
                onChange={(e) => setBusinessModelDescription(e.target.value)}
                placeholder="Explain how your business operates, your revenue model (subscription, commission, retainer), who your target buyers are, and your primary value proposition..."
                className="input-glass"
                rows={3}
                style={{ width: '100%', resize: 'vertical', minHeight: '75px', lineHeight: '1.4', fontFamily: 'inherit' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Used by Sophia CMO and Marcus SDR to formulate precision outbound hooks and objection handling.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Company Website Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. quantumshield.io or yourdomain.com"
                className="input-glass"
              />
            </div>

            {wsSaveMessage && (
              <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> {wsSaveMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingWs}
              className="btn-primary"
              style={{ marginTop: '8px' }}
            >
              <Save size={15} /> {isSavingWs ? 'Saving...' : 'Save Workspace Changes'}
            </button>
          </form>
        </div>

        {/* GTM Billing & Wallet Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#10B981" />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
                Autonomous Wallet
              </h3>
            </div>
            <span className="badge badge-emerald">Stripe Verified</span>
          </div>

          {/* Current Balance Display */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
              Available Autonomous Balance
            </div>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '2.2rem',
              fontWeight: '800',
              color: '#F8FAFC',
              margin: '4px 0',
            }}>
              ${wallet ? wallet.balanceUSD?.toFixed(2) : '0.00'}{' '}
              <span style={{ fontSize: '1rem', color: '#10B981', fontWeight: '600' }}>USD</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Funds Voice AI calls, Scraper enrichment tokens, and automated SMS/WhatsApp
            </div>
          </div>

          {/* Deposit Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Instant Top-Up
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              {['50', '100', '250', '500'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: depositAmount === amt ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                    background: depositAmount === amt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: depositAmount === amt ? '#34D399' : '#CBD5E1',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Custom Amount"
                className="input-glass"
                style={{ flex: 1 }}
              />
              <button onClick={handleDeposit} className="btn-emerald" style={{ whiteSpace: 'nowrap' }}>
                + Add Funds
              </button>
            </div>
          </div>

          {/* Auto Recharge Settings */}
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F8FAFC' }}>
                  Auto-Recharge Guardrail
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Prevent voice calls and scraper pipelines from stopping
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRecharge}
                onChange={(e) => setAutoRecharge(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {autoRecharge && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>When below:</span>
                <input
                  type="number"
                  value={rechargeThreshold}
                  onChange={(e) => setRechargeThreshold(e.target.value)}
                  className="input-glass"
                  style={{ width: '70px', padding: '4px 8px', fontSize: '0.75rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deposit:</span>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="input-glass"
                  style={{ width: '70px', padding: '4px 8px', fontSize: '0.75rem' }}
                />
                <button
                  type="button"
                  onClick={handleSaveAutoRecharge}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration Status & Transaction Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Core Integration Services */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Key size={18} color="#8B5CF6" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
              Service Gateways & Integrations
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {integrations.map((svc, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F8FAFC' }}>{svc.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{svc.key}</div>
                </div>
                <span className={`badge ${svc.status === 'Connected' || svc.status === 'Active' ? 'badge-emerald' : 'badge-gray'}`}>
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#06B6D4" />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700' }}>
                Wallet Transaction Ledger
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {wallet?.transactions?.length || 0} Events Logged
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {!wallet?.transactions || wallet.transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                No transactions recorded yet.
              </div>
            ) : (
              wallet.transactions.map((tx, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${
                      tx.type === 'CREDIT' ? 'badge-emerald' :
                      tx.type === 'BONUS' ? 'badge-cyan' : 'badge-amber'
                    }`}>
                      {tx.type}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#F8FAFC', fontWeight: '500' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                        {new Date(tx.timestamp).toLocaleString()} • {tx.referenceId || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: tx.type === 'DEBIT' ? '#F43F5E' : '#10B981',
                  }}>
                    {tx.type === 'DEBIT' ? '-' : '+'}${tx.amountUSD?.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
