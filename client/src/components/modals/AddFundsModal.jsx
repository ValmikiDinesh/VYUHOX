import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  QrCode,
  Building,
  Smartphone,
  CheckCircle,
  Copy,
  ArrowRight,
} from 'lucide-react';

export default function AddFundsModal({
  isOpen,
  onClose,
  onSubmit,
  currentBalance = 0,
  currency = 'USD', // 'USD' | 'INR'
  exchangeRate = 83.5,
}) {
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [amount, setAmount] = useState(selectedCurrency === 'INR' ? '2500' : '100');
  const [paymentTab, setPaymentTab] = useState(selectedCurrency === 'INR' ? 'upi' : 'card');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState(null);

  if (!isOpen) return null;

  const isINR = selectedCurrency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  const usdOptions = ['50', '100', '250', '500'];
  const inrOptions = ['2500', '5000', '10000', '25000'];

  const handleCurrencyChange = (curr) => {
    setSelectedCurrency(curr);
    if (curr === 'INR') {
      setAmount('2500');
      setPaymentTab('upi');
    } else {
      setAmount('100');
      setPaymentTab('card');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('vyuhox.gtm@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      setLoading(true);
      // If INR, calculate equivalent USD for wallet storage or pass method with currency tag
      const usdValue = isINR ? parsed / exchangeRate : parsed;
      const methodLabel =
        paymentTab === 'upi'
          ? `UPI Instant (${currencySymbol}${amount})`
          : paymentTab === 'netbanking'
          ? `Indian Netbanking (${currencySymbol}${amount})`
          : paymentTab === 'crypto'
          ? 'USDC / Crypto Web3'
          : `Stripe Card (${currencySymbol}${amount})`;

      try {
        await onSubmit(usdValue, methodLabel);
        setSuccessTx({
          amount,
          currency: selectedCurrency,
          method: methodLabel,
          time: new Date().toLocaleTimeString(),
        });
        setTimeout(() => {
          setLoading(false);
          setSuccessTx(null);
          onClose();
        }, 1200);
      } catch (err) {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        background: '#0B1120',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CreditCard size={18} color="#10B981" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                Recharge GTM Wallet
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Prepaid compute for AI Agents, Voice Calls &amp; WhatsApp
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', background: 'transparent', color: '#94A3B8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Currency Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            type="button"
            onClick={() => handleCurrencyChange('USD')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: selectedCurrency === 'USD' ? 'linear-gradient(135deg, #06B6D4, #10B981)' : 'transparent',
              color: selectedCurrency === 'USD' ? '#04101A' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            USD ($) Global / International
          </button>
          <button
            type="button"
            onClick={() => handleCurrencyChange('INR')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: selectedCurrency === 'INR' ? 'linear-gradient(135deg, #F59E0B, #10B981)' : 'transparent',
              color: selectedCurrency === 'INR' ? '#04101A' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            INR (₹) India (UPI / Netbanking)
          </button>
        </div>

        {/* Balance Overview Banner */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Wallet Balance
            </span>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', color: '#10B981' }}>
              ${currentBalance?.toFixed(2) || '0.00'} USD
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', marginLeft: '6px' }}>
                (~₹{((currentBalance || 0) * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
              </span>
            </div>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            Instant Activation
          </span>
        </div>

        {/* Quick Tier Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Select Deposit Amount ({selectedCurrency})
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {(isINR ? inrOptions : usdOptions).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                style={{
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: amount === amt ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: amount === amt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: amount === amt ? '#34D399' : '#CBD5E1',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {currencySymbol}{parseInt(amt).toLocaleString(isINR ? 'en-IN' : 'en-US')}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
            Or Enter Custom Amount ({selectedCurrency})
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#34D399',
              fontWeight: '700',
              fontSize: '1rem',
            }}>
              {currencySymbol}
            </span>
            <input
              type="number"
              min={isINR ? 100 : 10}
              step={isINR ? 100 : 10}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '32px', fontSize: '0.95rem', fontWeight: '700' }}
            />
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Choose Payment Gateway
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: isINR ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {isINR && (
              <button
                type="button"
                onClick={() => setPaymentTab('upi')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: paymentTab === 'upi' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: paymentTab === 'upi' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: paymentTab === 'upi' ? '#34D399' : '#CBD5E1',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Smartphone size={14} />
                <span>UPI (GPay/PhonePe)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setPaymentTab('card')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: paymentTab === 'card' ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.08)',
                background: paymentTab === 'card' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: paymentTab === 'card' ? '#38BDF8' : '#CBD5E1',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <CreditCard size={14} />
              <span>{isINR ? 'Cards / RuPay' : 'Credit / Debit Card'}</span>
            </button>

            {isINR && (
              <button
                type="button"
                onClick={() => setPaymentTab('netbanking')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: paymentTab === 'netbanking' ? '1px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: paymentTab === 'netbanking' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: paymentTab === 'netbanking' ? '#C4B5FD' : '#CBD5E1',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Building size={14} />
                <span>Net Banking</span>
              </button>
            )}

            {!isINR && (
              <button
                type="button"
                onClick={() => setPaymentTab('crypto')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: paymentTab === 'crypto' ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: paymentTab === 'crypto' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: paymentTab === 'crypto' ? '#FBBF24' : '#CBD5E1',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                <span>USDC Crypto</span>
              </button>
            )}
          </div>

          {/* UPI Dynamic Details Panel */}
          {paymentTab === 'upi' && (
            <div style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {/* Fake QR Mock */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                background: '#FFFFFF',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <QrCode size={54} color="#04101A" />
                <span style={{ fontSize: '0.55rem', color: '#04101A', fontWeight: '800' }}>BHIM UPI</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '4px' }}>
                  Scan with Google Pay, PhonePe, Paytm or CRED
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <code style={{
                    fontSize: '0.75rem',
                    color: '#34D399',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '3px 6px',
                    borderRadius: '4px',
                  }}>
                    vyuhox.gtm@icici
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedUpi ? '#10B981' : '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {copiedUpi ? <CheckCircle size={12} /> : <Copy size={12} />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Auto-verified within 5 seconds of transfer via Razorpay UPI Webhook.
                </div>
              </div>
            </div>
          )}

          {/* Netbanking Bank Selection */}
          {paymentTab === 'netbanking' && (
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                Select Major Indian Bank
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                  <div
                    key={bank}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center',
                      fontSize: '0.725rem',
                      fontWeight: '600',
                      color: '#CBD5E1',
                    }}
                  >
                    {bank}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security & Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>256-bit Encrypted Checkout • RBI / PCI-DSS Compliant</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 14px' }}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-emerald"
              style={{
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '700',
              }}
            >
              {loading ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Deposit {currencySymbol}{parseInt(amount || 0).toLocaleString(isINR ? 'en-IN' : 'en-US')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
