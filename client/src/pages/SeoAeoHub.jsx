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
  const [loadingAeo, setLoadingAeo] = useState(true);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);

  // Digital PR State
  const [pitches, setPitches] = useState([]);
  const [loadingPitches, setLoadingPitches] = useState(false);
  const [generatingPitchId, setGeneratingPitchId] = useState(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState(null);

  // Load AEO Pack for active workspace
  useEffect(() => {
    if (!activeWorkspace) return;
    const fetchAeo = async () => {
      setLoadingAeo(true);
      try {
        const res = await api.getAeoPack(activeWorkspace._id);
        if (res.success && res.aeoPack) {
          setAeoPack(res.aeoPack);
        }
      } catch (err) {
        console.error('Failed to load AEO pack:', err);
      } finally {
        setLoadingAeo(false);
      }
    };
    fetchAeo();
  }, [activeWorkspace]);

  // Load Digital PR pitches
  const fetchPitches = async () => {
    setLoadingPitches(true);
    try {
      const res = await api.getDigitalPrPitches();
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
  }, [activeTab]);

  // Generate quote for a pitch
  const handleGenerateQuote = async (pitchId) => {
    setGeneratingPitchId(pitchId);
    try {
      const res = await api.generateDigitalPrPitch(pitchId);
      if (res.success && res.pitch) {
        setPitches((prev) => prev.map((p) => (p._id === pitchId ? res.pitch : p)));
      }
    } catch (err) {
      console.error('Failed to generate pitch quote:', err);
      alert('Error generating quote: ' + err.message);
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
            <Shield size={14} /> 100% White-Hat Algorithm Proof
          </span>
        </div>
      </div>

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

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!pitch.draftedQuote && (
                        <button
                          type="button"
                          disabled={generatingPitchId === pitch._id}
                          onClick={() => handleGenerateQuote(pitch._id)}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {generatingPitchId === pitch._id ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" /> Drafting Quote...
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} /> Generate AI Expert Quote
                            </>
                          )}
                        </button>
                      )}

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
