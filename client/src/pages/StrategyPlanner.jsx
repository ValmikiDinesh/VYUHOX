import React, { useState, useEffect } from 'react';
import {
  Target,
  Search,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Share2,
  TrendingUp,
  Cpu,
  Bot,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';

export default function StrategyPlanner({ activeWorkspace, socket }) {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ step: '', message: '', percent: 0 });
  const [strategy, setStrategy] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [exportNotice, setExportNotice] = useState(false);

  // Quick-try presets
  const samplePresets = [
    { label: 'Fintech / Web3 (HedgeX)', url: 'https://hedgex.io' },
    { label: 'B2B SaaS (Linear)', url: 'https://linear.app' },
    { label: 'Global Payments (Stripe)', url: 'https://stripe.com' },
    { label: 'D2C Apparel (Gymshark)', url: 'https://gymshark.com' },
  ];

  // 1. Fetch current strategy for active workspace
  useEffect(() => {
    if (!activeWorkspace) return;
    const fetchStrategy = async () => {
      setLoadingInitial(true);
      try {
        const res = await api.getStrategy(activeWorkspace._id);
        if (res.success && res.strategy) {
          setStrategy(res.strategy);
          setUrlInput(res.strategy.targetUrl || '');
        }
      } catch (err) {
        console.error('Failed to load strategy:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchStrategy();
  }, [activeWorkspace]);

  // 2. Listen to Socket live scanning events
  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data) => {
      setScanProgress({
        step: data.step,
        message: data.message,
        percent: data.progressPercent,
      });
    };

    const handleComplete = (data) => {
      setIsScanning(false);
      setScanProgress({ step: 'COMPLETE', message: 'Strategy generated!', percent: 100 });
    };

    socket.on('scan:progress', handleProgress);
    socket.on('scan:complete', handleComplete);

    return () => {
      socket.off('scan:progress', handleProgress);
      socket.off('scan:complete', handleComplete);
    };
  }, [socket]);

  // 3. Trigger Scan
  const handleStartScan = async (targetUrlToScan) => {
    const finalUrl = (targetUrlToScan || urlInput).trim();
    if (!finalUrl || !activeWorkspace) return;

    setIsScanning(true);
    setScanProgress({ step: 'INIT', message: `Initializing scanner for ${finalUrl}...`, percent: 10 });

    try {
      const res = await api.scanWebsite(activeWorkspace._id, finalUrl);
      if (res.success && res.strategy) {
        setStrategy(res.strategy);
      }
    } catch (err) {
      console.error('Scan failed:', err);
      alert('Scanning error: ' + (err.message || 'Unable to analyze website'));
    } finally {
      setIsScanning(false);
    }
  };

  // 4. Toggle channel state
  const handleToggleChannel = async (channelName, currentEnabled) => {
    if (!strategy) return;
    const newEnabled = !currentEnabled;

    // Optimistic UI update
    const updatedChannels = strategy.analysisResult.recommendedChannels.map((ch) =>
      ch.channel === channelName ? { ...ch, enabled: newEnabled } : ch
    );
    setStrategy({
      ...strategy,
      analysisResult: {
        ...strategy.analysisResult,
        recommendedChannels: updatedChannels,
      },
    });

    try {
      await api.toggleChannel(strategy._id, channelName, newEnabled);
    } catch (err) {
      console.error('Failed to toggle channel:', err);
    }
  };

  // 5. Copy Hook to Clipboard
  const handleCopyHook = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 6. Export Strategy Markdown
  const handleExportMarkdown = () => {
    if (!strategy || !strategy.analysisResult) return;
    const a = strategy.analysisResult;

    const mdContent = `# VYUHOX AI GTM STRATEGY REPORT
Generated: ${new Date().toLocaleDateString()}
Platform: VYUHOX Autonomous GTM SaaS

## Target Business: ${a.businessName}
- **Website**: ${a.websiteUrl}
- **Category**: ${a.category}
- **Summary**: ${a.summary}

---

## 🎯 Target Audience & ICP Matrix
- **Primary Persona**: ${a.targetAudience?.primaryPersona}
- **Decision Makers**: ${a.targetAudience?.decisionMakers?.join(', ')}
- **Estimated Budget Tier**: ${a.targetAudience?.estimatedBudgetTier}
- **Core Pain Points**:
${a.targetAudience?.painPoints?.map((p) => `  - ${p}`).join('\n')}

---

## ⚡ Positioning & Value Proposition
- **Core Value Proposition**: ${a.positioning?.coreValueProp}
- **Unfair Advantage**: ${a.positioning?.unfairAdvantage}
- **Key Differentiators**:
${a.positioning?.keyDifferentiators?.map((d) => `  - ${d}`).join('\n')}

---

## 🎛️ Recommended Acquisition Switchboard
${a.recommendedChannels?.map((ch) => `- **${ch.channel}** (Fit: ${ch.fitScore}%, Priority: ${ch.priority}) - ${ch.enabled ? '[ENABLED]' : '[DISABLED]'}\n  ${ch.rationale}`).join('\n\n')}

---

## 💡 High-Converting Ad Hooks
${a.adAngles?.map((hook, i) => `${i + 1}. "${hook.hook}"\n   - Angle: ${hook.angle}\n   - Target Pain Point: ${hook.targetPainPoint}`).join('\n\n')}

---

## 🤖 Recommended Multi-Agent Autonomous Team
- **Roles**: ${a.recommendedAITeam?.roles?.join(', ')}
- **Projected ROI**: ${a.recommendedAITeam?.estimatedMonthlyROI}
- **Deployment Mode**: ${a.recommendedAITeam?.recommendedPlan}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.businessName.toLowerCase().replace(/\s+/g, '_')}_gtm_strategy.md`;
    link.click();

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const analysis = strategy?.analysisResult;

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-cyan">
              <Sparkles size={13} />
              AI GTM STRATEGIST & REAL-TIME SCANNER
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Phase 2 Operational
            </span>
          </div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.65rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}>
            Autonomous Business Scanner & ICP Synthesizer
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Deep-crawls target landing pages, extracts value propositions, and architects 24/7 autonomous multi-channel execution plans.
          </p>
        </div>

        {analysis && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportMarkdown} className="btn-secondary" style={{ padding: '8px 16px' }}>
              <Download size={15} /> Export Strategy (.md)
            </button>
            <button
              onClick={() => handleStartScan(urlInput)}
              disabled={isScanning}
              className="btn-primary"
              style={{ padding: '8px 16px' }}
            >
              <Zap size={15} /> {isScanning ? 'Scanning...' : 'Re-Scan Website'}
            </button>
          </div>
        )}
      </div>

      {exportNotice && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34D399',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle2 size={16} /> Markdown GTM Strategy Report downloaded successfully!
        </div>
      )}

      {/* URL Input & Scanner Bar */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartScan();
          }}
          style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '320px' }}>
            <Globe size={18} color="#06B6D4" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter target company URL (e.g. https://stripe.com, https://linear.app, or your business)"
              className="input-glass"
              style={{ paddingLeft: '44px', height: '44px', fontSize: '0.9rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="btn-primary"
            style={{ height: '44px', padding: '0 24px', fontSize: '0.875rem' }}
          >
            {isScanning ? (
              <>
                <span className="live-dot" style={{ background: '#04101A' }} /> Scanning DOM...
              </>
            ) : (
              <>
                <Search size={16} /> Scan & Architect GTM
              </>
            )}
          </button>
        </form>

        {/* Quick-try presets chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
            Quick-Try Presets:
          </span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrlInput(preset.url);
                handleStartScan(preset.url);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#CBD5E1',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                e.currentTarget.style.color = '#38BDF8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              <span>{preset.label}</span>
              <ChevronRight size={12} color="#64748B" />
            </button>
          ))}
        </div>

        {/* Scanning Animated Radar / Progress Bar */}
        {isScanning && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-dot" style={{ background: '#06B6D4' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#38BDF8' }}>
                  {scanProgress.message || 'Analyzing DOM and extracting positioning hooks...'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#06B6D4' }}>
                {scanProgress.percent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${scanProgress.percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06B6D4, #10B981)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Main Executive Strategy View */}
      {loadingInitial ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <span className="live-dot" style={{ background: '#06B6D4', width: '12px', height: '12px' }} />
          <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>Loading GTM Strategic Intelligence...</div>
        </div>
      ) : !analysis ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Target size={44} color="#64748B" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '700' }}>
            No Active GTM Strategy Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '8px auto 20px' }}>
            Enter any target company URL above or pick a sample preset to run the real-time business scanner.
          </p>
          <button onClick={() => handleStartScan('https://linear.app')} className="btn-primary">
            <Zap size={16} /> Scan Sample Platform (Linear.app)
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Business Overview Header Card */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(11, 17, 32, 0.95) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: '800' }}>
                    {analysis.businessName}
                  </h3>
                  <span className="badge badge-cyan">{analysis.category}</span>
                  <a
                    href={analysis.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                  >
                    <ExternalLink size={14} /> Visit Site
                  </a>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '800px', lineHeight: '1.5' }}>
                  {analysis.summary}
                </p>
              </div>

              {/* Multi-Agent Sizing Widget */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '14px 18px',
                textAlign: 'right',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Projected GTM Return
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>
                  {analysis.recommendedAITeam?.estimatedMonthlyROI || '5.2x Projected ROI'}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <Bot size={12} /> {analysis.recommendedAITeam?.recommendedPlan || 'AI Company Mode'}
                </div>
              </div>
            </div>
          </div>

          {/* Grid 1: ICP & Buyer Persona Matrix + Positioning & Value Prop */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
            {/* 🎯 ICP & Buyer Persona Matrix */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#06B6D4" />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '700' }}>
                  Target Audience & ICP Persona Matrix
                </h3>
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#38BDF8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                  Primary Target Persona
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#F8FAFC', marginTop: '2px' }}>
                  {analysis.targetAudience?.primaryPersona}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Critical Buyer Pain Points
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {analysis.targetAudience?.painPoints?.map((pain, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.8rem',
                        color: '#E2E8F0',
                      }}
                    >
                      <AlertCircle size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pain}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Target Decision Makers
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F8FAFC', marginTop: '4px' }}>
                    {analysis.targetAudience?.decisionMakers?.join(', ') || 'C-Suite & Founders'}
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Estimated Budget Tier
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#10B981', marginTop: '4px' }}>
                    {analysis.targetAudience?.estimatedBudgetTier || '$5K - $25K / month'}
                  </div>
                </div>
              </div>
            </div>

            {/* ⚡ Positioning & Value Proposition */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#10B981" />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '700' }}>
                  Positioning & Strategic Edge
                </h3>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Core Value Proposition
                </span>
                <div style={{
                  marginTop: '6px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#F8FAFC',
                  lineHeight: '1.45',
                }}>
                  "{analysis.positioning?.coreValueProp}"
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Unfair Competitive Advantage
                </span>
                <div style={{
                  marginTop: '6px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  fontSize: '0.825rem',
                  color: '#38BDF8',
                  lineHeight: '1.4',
                }}>
                  {analysis.positioning?.unfairAdvantage}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Key Strategic Differentiators
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {analysis.positioning?.keyDifferentiators?.map((diff, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0 }} />
                      <span>{diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 🎛️ Recommended Acquisition Switchboard */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700' }}>
                  Recommended Acquisition Switchboard
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Interactive channel toggles for multi-touch GTM routing. Toggle to enable or disable in live campaigns.
                </p>
              </div>
              <span className="badge badge-emerald">
                {analysis.recommendedChannels?.filter((c) => c.enabled).length} of {analysis.recommendedChannels?.length} Channels Active
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {analysis.recommendedChannels?.map((ch, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: ch.enabled ? 'rgba(6, 182, 212, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    border: ch.enabled ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: ch.enabled ? '#F8FAFC' : '#94A3B8' }}>
                        {ch.channel}
                      </span>
                      {/* Toggle switch button */}
                      <button
                        type="button"
                        onClick={() => handleToggleChannel(ch.channel, ch.enabled)}
                        style={{
                          width: '42px',
                          height: '22px',
                          borderRadius: '999px',
                          background: ch.enabled ? '#10B981' : 'rgba(255, 255, 255, 0.15)',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: ch.enabled ? '22px' : '2px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            transition: 'left 0.2s ease',
                          }}
                        />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '60px', height: '5px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${ch.fitScore}%`, height: '100%', background: '#06B6D4' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#06B6D4' }}>
                        {ch.fitScore}% Fit Score
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {ch.rationale}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💡 5 High-Converting Ad Copy Angles */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700' }}>
                  5 High-Converting Ad & Outreach Angles
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Synthesized psychological hooks ready to copy directly into Meta Ads, Cold Email, or WhatsApp scripts.
                </p>
              </div>
              <span className="badge badge-amber">Ready for Meta & Google CAPI</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysis.adAngles?.map((ad, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-violet" style={{ fontSize: '0.675rem' }}>
                        {ad.angle}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        Target: {ad.targetPainPoint}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC' }}>
                      "{ad.hook}"
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyHook(ad.hook, i)}
                    className="btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check size={14} color="#10B981" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Hook
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 🤖 Recommended Autonomous AI Team Sizing Card */}
          <div className="glass-panel" style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Bot size={18} color="#10B981" />
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700' }}>
                    Recommended Multi-Agent C-Suite Deployment
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Based on {analysis.businessName}'s business model and target audience complexity, we recommend deploying:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {analysis.recommendedAITeam?.roles?.map((role, idx) => (
                    <span key={idx} className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      <CheckCircle2 size={13} /> {role}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  Phase 9 Multi-Agent C-Suite Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
