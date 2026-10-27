import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Globe,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Shield,
  FileCode,
  Newspaper,
  TrendingUp,
  Link2,
  Bot,
  Zap,
  RefreshCw,
  Search,
  MessageSquare,
  Award,
} from 'lucide-react';
import { api } from '../services/api';

export default function SeoAeoHub({ activeWorkspace, socket, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('aeo'); // 'aeo' | 'digital_pr' | 'viral_backlinks' | 'link_magnets'
  const [aeoPack, setAeoPack] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [loadingAeo, setLoadingAeo] = useState(true);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);

  // 24/7 Auto-Pilot & 1-Click Launch State
  const [autoPilot, setAutoPilot] = useState(activeWorkspace?.aeoAutoPilot || false);
  const [togglingAutoPilot, setTogglingAutoPilot] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Digital PR State
  const [pitches, setPitches] = useState([]);
  const [loadingPitches, setLoadingPitches] = useState(false);
  const [generatingPitchId, setGeneratingPitchId] = useState(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState(null);

  // Load AEO Pack & Strategy for active workspace
  useEffect(() => {
    if (!activeWorkspace) return;
    setAutoPilot(!!activeWorkspace.aeoAutoPilot);
    const fetchAeoAndStrategy = async () => {
      setLoadingAeo(true);
      try {
        const [aeoRes, stratRes] = await Promise.all([
          api.getAeoPack(activeWorkspace._id),
          api.getStrategy(activeWorkspace._id),
        ]);
        if (aeoRes.success && aeoRes.aeoPack) {
          setAeoPack(aeoRes.aeoPack);
        }
        if (stratRes && stratRes.success && stratRes.strategy) {
          setStrategy(stratRes.strategy);
        }
      } catch (err) {
        console.error('Failed to load AEO pack or strategy:', err);
      } finally {
        setLoadingAeo(false);
      }
    };
    fetchAeoAndStrategy();
  }, [activeWorkspace]);

  // Toggle 24/7 Autonomous AI Auto-Pilot
  const handleToggleAutoPilot = async () => {
    if (!activeWorkspace?._id) return;
    setTogglingAutoPilot(true);
    try {
      const res = await api.toggleAeoAutoPilot(activeWorkspace._id, !autoPilot);
      if (res && res.success) {
        setAutoPilot(res.autoPilot);
        setActionNotice({
          type: 'success',
          msg: res.message || 'Auto-pilot setting updated successfully!',
        });
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch (err) {
      console.error('Toggle auto-pilot error:', err);
      setActionNotice({ type: 'error', msg: 'Failed to toggle auto-pilot: ' + err.message });
      setTimeout(() => setActionNotice(null), 5000);
    } finally {
      setTogglingAutoPilot(false);
    }
  };

  // 1-Click Launch AI SEO & AEO Engine
  const handleOneClickLaunch = async () => {
    if (!activeWorkspace?._id) return;
    setLaunching(true);
    try {
      const res = await api.oneClickLaunchSeo(activeWorkspace._id);
      if (res && res.success) {
        if (res.aeoPack) setAeoPack(res.aeoPack);
        fetchPitches();
        setActionNotice({
          type: 'success',
          msg: res.message || 'AI SEO & AEO Engine launched! Schema injected & AI crawlers indexed.',
        });
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err) {
      console.error('One-click launch error:', err);
      setActionNotice({ type: 'error', msg: 'Failed to launch SEO/AEO: ' + err.message });
      setTimeout(() => setActionNotice(null), 5000);
    } finally {
      setLaunching(false);
    }
  };

  // Load Digital PR pitches
  const fetchPitches = async () => {
    setLoadingPitches(true);
    try {
      const res = await api.getDigitalPrPitches(activeWorkspace?._id);
      if (res.success && res.pitches) {
        setPitches(res.pitches);
      }
    } catch (err) {
      console.error('Failed to load pitches:', err);
    } finally {
      setLoadingPitches(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'digital_pr') {
      fetchPitches();
    }
  }, [activeTab, activeWorkspace?._id]);

  // Generate quote for a pitch
  const handleGenerateQuote = async (pitchId) => {
    setGeneratingPitchId(pitchId);
    try {
      const founderInfo = {
        name: activeWorkspace?.ownerName || 'Valmiki Dinesh',
        title: `Founder & CEO, ${activeWorkspace?.name || 'Enterprise'}`,
        websiteUrl: activeWorkspace?.domain ? `https://${activeWorkspace.domain}` : 'https://vyuhox.com',
      };
      const res = await api.generateDigitalPrPitch(pitchId, founderInfo, activeWorkspace?._id);
      if (res.success && res.pitch) {
        setPitches((prev) => prev.map((p) => (p._id === pitchId ? res.pitch : p)));
      }
    } catch (err) {
      console.error('Failed to generate pitch quote:', err);
    } finally {
      setGeneratingPitchId(null);
    }
  };

  // Submit pitch
  const handleSubmitPitch = async (pitchId) => {
    try {
      const res = await api.submitDigitalPrPitch(pitchId);
      if (res.success && res.pitch) {
        setPitches((prev) => prev.map((p) => (p._id === pitchId ? res.pitch : p)));
      }
    } catch (err) {
      console.error('Failed to submit pitch:', err);
    }
  };

  // Mark Accepted Backlink Won
  const handleMarkAccepted = async (pitchId) => {
    try {
      const res = await api.markAcceptedDigitalPrPitch(pitchId);
      if (res.success && res.pitch) {
        setPitches((prev) => prev.map((p) => (p._id === pitchId ? res.pitch : p)));
      }
    } catch (err) {
      console.error('Failed to mark backlink won:', err);
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-purple">
              <Sparkles size={13} /> PHASE 8: AUTONOMOUS SEO, AEO &amp; DOMAIN AUTHORITY
            </span>
            <span className="badge badge-cyan">Target: DR 50+ to DR 92</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
            Answer Engine Optimization (AEO) &amp; Digital PR Engine
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Guarantees your business is cited as the #1 authority in Perplexity, ChatGPT, and Claude search queries, while winning DR 85+ editorial backlinks from Forbes &amp; TechCrunch.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* 24/7 Auto-Pilot Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: autoPilot ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: autoPilot ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 14px',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot" style={{ background: autoPilot ? '#10B981' : '#64748B', boxShadow: autoPilot ? '0 0 8px #10B981' : 'none' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: autoPilot ? '#34D399' : '#94A3B8' }}>
                {autoPilot ? '24/7 Autonomous AI Auto-Pilot' : 'Autonomous Auto-Pilot: Paused'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoPilot}
              disabled={togglingAutoPilot}
              style={{
                width: '42px',
                height: '22px',
                borderRadius: '999px',
                background: autoPilot ? '#10B981' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
              title="Toggle continuous 24/7 autonomous SEO & AEO optimization"
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: autoPilot ? '22px' : '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>

          {/* 1-Click Launch Button */}
          <button
            type="button"
            onClick={handleOneClickLaunch}
            disabled={launching}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
              border: 'none',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
            }}
          >
            <Zap size={14} />
            <span>{launching ? 'Synthesizing with AI LLM...' : '⚡ One-Click Launch AI SEO & AEO'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: actionNotice.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: actionNotice.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          color: actionNotice.type === 'error' ? '#F87171' : '#34D399',
          fontSize: '0.825rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {actionNotice.type === 'error' ? <Shield size={16} /> : <CheckCircle2 size={16} />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'aeo', label: '🤖 AEO Citation Pack & Schemas', desc: 'Perplexity & ChatGPT Search' },
          { id: 'digital_pr', label: '📰 Autonomous Digital PR (DR 85+)', desc: 'Forbes & TechCrunch Pitches' },
          { id: 'viral_backlinks', label: '🌐 "Powered By" Viral Network', desc: 'Client Micro-Site Loop' },
          { id: 'link_magnets', label: '🧲 Programmatic Link Magnets', desc: 'Free Utility Tools' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: active ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                border: active ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                color: active ? '#38BDF8' : '#94A3B8',
                fontSize: '0.85rem',
                fontWeight: active ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AEO Citation Pack & Schemas */}
      {activeTab === 'aeo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Perplexity Citation Strategy */}
          <div className="glass-panel" style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                    5 High-Conversion Q&amp;As Optimized for Perplexity &amp; ChatGPT Search
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0' }}>
                    When users ask conversational AI engines about your niche, these structured Q&amp;As force the model to cite your business as the #1 verified provider.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aeoPack?.aeoFaqRecommendations?.map((faq, i) => (
                <div key={i} style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#7DD3FC' }}>
                      Q{i + 1}: "{faq.question}"
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                      {faq.llmSearchIntent}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: '1.45', margin: '4px 0 0' }}>
                    <strong>Cited Answer:</strong> {faq.recommendedAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: JSON-LD Schema & AI Bot Whitelist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* JSON-LD Schema */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={18} color="#06B6D4" />
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC' }}>
                    Automated JSON-LD Schema Markup
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(aeoPack?.clientSchema, null, 2));
                    setCopiedSchema(true);
                    setTimeout(() => setCopiedSchema(false), 2000);
                  }}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {copiedSchema ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  <span>{copiedSchema ? 'Copied JSON-LD' : 'Copy Schema'}</span>
                </button>
              </div>

              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#040810',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.725rem',
                fontFamily: 'monospace',
                color: '#38BDF8',
                lineHeight: '1.4',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(aeoPack?.clientSchema, null, 2)}
                </pre>
              </div>
            </div>

            {/* AI Bot Whitelist Directives */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={18} color="#10B981" />
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC' }}>
                    AI Crawler Whitelist Directives (Robots.txt)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(aeoPack?.aiBotDirectives || '');
                    setCopiedRobots(true);
                    setTimeout(() => setCopiedRobots(false), 2000);
                  }}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {copiedRobots ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  <span>{copiedRobots ? 'Copied Rules' : 'Copy Rules'}</span>
                </button>
              </div>

              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#040810',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#34D399',
                lineHeight: '1.4',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <pre style={{ margin: 0 }}>
                  {aeoPack?.aiBotDirectives || '# Loading AI bot whitelist...'}
                </pre>
              </div>
            </div>
          </div>

          {/* Card 3: Crawled Technical SEO Audit & High-Intent Transactional Keyword Clusters */}
          {(() => {
            const seo = strategy?.seoStrategy || strategy?.analysisResult?.seoStrategy || {};
            const keywords = seo.primaryKeywords || [
              'best ' + (activeWorkspace?.businessCategory || activeWorkspace?.name || 'services') + ' near me',
              'buy ' + (activeWorkspace?.name || 'services'),
              (activeWorkspace?.name || 'enterprise') + ' solutions pricing',
              'top rated ' + (activeWorkspace?.industry || 'B2B') + ' providers',
            ];
            const checklist = seo.technicalChecklist || [
              'Enforce SSL HTTPS across all subdomains',
              'Inject Automated JSON-LD Schema (Organization, Product, FAQPage)',
              'Sub-1.5s Core Web Vitals (LCP, INP & CLS optimized)',
              'Dynamic XML Sitemap auto-broadcast to Google Search Console',
              'AI Crawler Whitelist enabled in Robots.txt for ChatGPT & Perplexity',
            ];

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {/* Technical SEO Audit */}
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#10B981" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC' }}>
                        Technical SEO Audit &amp; Crawl Readiness
                      </span>
                    </div>
                    <span className="badge badge-emerald">Autonomous Auto-Fix Active</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {checklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#E2E8F0', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <CheckCircle2 size={15} color="#10B981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-Intent Keyword Clusters */}
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={18} color="#38BDF8" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC' }}>
                        High-Intent Transactional Keyword Clusters
                      </span>
                    </div>
                    <span className="badge badge-cyan">Google 1st Page Intent</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {keywords.map((kw, i) => (
                      <span key={i} style={{
                        fontSize: '0.78rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38BDF8',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}>
                        🔍 {kw}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                    These transactional keywords are targeted by VYUHOX's programmatic AEO pages, blog articles, and AI search entity graph.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: Autonomous Digital PR & Editorial Pitching (DR 85+) */}
      {activeTab === 'digital_pr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                    Live Journalist Inquiries &amp; Automated PR Pitches
                  </h3>
                  <span className="badge badge-purple">Connectively / Qwoted Feed Active</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0' }}>
                  Monitors top-tier journalists at Forbes, TechCrunch, Inc., and Entrepreneur. Caleb PR Agent drafts 3-sentence expert quotes from the founder to win DR 85–92 do-follow backlinks.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchPitches}
                disabled={loadingPitches}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} className={loadingPitches ? 'animate-spin' : ''} />
                <span>Refresh Opportunities</span>
              </button>
            </div>

            {/* Opportunities List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pitches.map((pitch) => (
                <div key={pitch._id} style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: pitch.status === 'ACCEPTED_BACKLINK_WON'
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : pitch.status === 'SUBMITTED'
                    ? '1px solid rgba(6, 182, 212, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                        {pitch.publication}
                      </span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        DR {pitch.publicationDr}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        by {pitch.journalistName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${
                        pitch.status === 'ACCEPTED_BACKLINK_WON'
                          ? 'badge-emerald'
                          : pitch.status === 'SUBMITTED'
                          ? 'badge-cyan'
                          : pitch.status === 'DRAFTED'
                          ? 'badge-amber'
                          : 'badge-purple'
                      }`}>
                        {pitch.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '4px' }}>
                    Topic: "{pitch.topic}"
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 12px', lineHeight: '1.45' }}>
                    <strong>Query:</strong> {pitch.query}
                  </p>

                  {/* Drafted Quote Section */}
                  {pitch.draftedQuote ? (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase' }}>
                          Drafted Founder Expert Quote
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(pitch.draftedQuote);
                            setCopiedQuoteId(pitch._id);
                            setTimeout(() => setCopiedQuoteId(null), 2000);
                          }}
                          style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                        >
                          {copiedQuoteId === pitch._id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                          <span>{copiedQuoteId === pitch._id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#F8FAFC', fontStyle: 'italic', margin: 0, lineHeight: '1.45' }}>
                        {pitch.draftedQuote}
                      </p>
                    </div>
                  ) : null}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Attribution: {pitch.attributedFounder?.name || 'Valmiki Dinesh'} • {pitch.attributedFounder?.websiteUrl || 'https://vyuhox.com'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        disabled={generatingPitchId === pitch._id}
                        onClick={() => handleGenerateQuote(pitch._id)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="Re-synthesize authoritative founder quote tailored specifically to this journalist topic"
                      >
                        <Sparkles size={12} className={generatingPitchId === pitch._id ? 'animate-spin' : ''} color="#EC4899" />
                        <span>{generatingPitchId === pitch._id ? 'Synthesizing...' : pitch.draftedQuote ? 'Re-Generate with AI' : 'Generate AI Quote'}</span>
                      </button>

                      {pitch.draftedQuote && pitch.status === 'DRAFTED' && (
                        <button
                          type="button"
                          onClick={() => handleSubmitPitch(pitch._id)}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                        >
                          1-Click Send Pitch to Journalist
                        </button>
                      )}

                      {pitch.status === 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() => handleMarkAccepted(pitch._id)}
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                        >
                          ✓ Confirm Backlink Acquired
                        </button>
                      )}

                      {pitch.status === 'ACCEPTED_BACKLINK_WON' && (
                        <span style={{ fontSize: '0.75rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                          <CheckCircle2 size={14} color="#10B981" /> DR {pitch.publicationDr} Editorial Backlink Won
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: "Powered by VYUHOX" Viral Backlink Network */}
      {activeTab === 'viral_backlinks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}>
                <Link2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                  The "Powered by VYUHOX" Autonomous Viral Backlink Loop
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0' }}>
                  Every client booking micro-site, public landing page, and calendar embed acts as an organic, white-hat backlink node.
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Active Backlink Nodes</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38BDF8', marginTop: '2px' }}>1,248</div>
                <span style={{ fontSize: '0.72rem', color: '#10B981' }}>+18% this month</span>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Average Domain Rating (DR)</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', marginTop: '2px' }}>58.4</div>
                <span style={{ fontSize: '0.72rem', color: '#34D399' }}>High Authority Tier</span>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Link Type</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#A78BFA', marginTop: '2px' }}>Do-Follow</div>
                <span style={{ fontSize: '0.72rem', color: '#C4B5FD' }}>100% PageRank Passing</span>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Monthly Referral Clicks</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F472B6', marginTop: '2px' }}>14,290</div>
                <span style={{ fontSize: '0.72rem', color: '#F472B6' }}>Inbound High-Intent</span>
              </div>
            </div>

            {/* Backlink Code Snippet */}
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '8px' }}>
                Standard Embedded Footnote on Client Portals:
              </div>
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#040810',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#38BDF8',
              }}>
                {'<a href="https://vyuhox.com" target="_blank" rel="noopener follow">Powered by VYUHOX Autonomous GTM OS</a>'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Programmatic Free Tool Link Magnets */}
      {activeTab === 'link_magnets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
              3 Public Free Utility Link Magnets (Hosted on vyuhox.com)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '4px 0 0' }}>
              These high-utility tools run autonomously with zero maintenance. They naturally attract permanent backlinks from universities, SaaS blogs, and B2B newsletters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Tool 1 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '14px' }}>
              <div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>Tool 1 • Cold Email</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', margin: '6px 0 8px' }}>
                  Spam Score &amp; Deliverability Analyzer
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.45', margin: '0 0 16px' }}>
                  Audits cold email text against 200+ spam keywords, calculates deliverability penalties, and gives actionable advice.
                </p>
              </div>
              <a
                href="#tools/spam-checker"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Launch Tool Page</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Tool 2 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '14px' }}>
              <div>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>Tool 2 • Market Strategy</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', margin: '6px 0 8px' }}>
                  B2B ICP Persona &amp; ACV Calculator
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.45', margin: '0 0 16px' }}>
                  Takes any industry keyword and deduces 3 qualified buyer personas, estimated contract values, and exact decision maker job titles.
                </p>
              </div>
              <a
                href="#tools/icp-calculator"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Launch Tool Page</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Tool 3 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '14px' }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>Tool 3 • Infrastructure</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', margin: '6px 0 8px' }}>
                  Domain MX, SPF &amp; DMARC Tester
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.45', margin: '0 0 16px' }}>
                  Directly queries DNS records for any domain to test compliance with Google Workspace &amp; Yahoo 2026 bulk sender guidelines.
                </p>
              </div>
              <a
                href="#tools/dns-tester"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Launch Tool Page</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
