import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Presentation,
  Download,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap,
  CheckCircle2,
  FileText,
  Shield,
  Bot,
  Target,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

export default function VisualCreativeStudio({
  strategy = null,
  isSuperAdmin = false,
  onClose = null,
}) {
  const [activeSubTab, setActiveSubTab] = useState('deck'); // 'deck' | 'image' | 'flowchart'

  // 1. Deck State
  const [deck, setDeck] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingDeck, setLoadingDeck] = useState(false);
  const [isDownloadingPptx, setIsDownloadingPptx] = useState(false);

  // 2. Image Generation State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' | '16:9' | '9:16'
  const [selectedModel, setSelectedModel] = useState('flux');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // 3. Funnel Flow State
  const [funnelFlow, setFunnelFlow] = useState(null);
  const [loadingFlow, setLoadingFlow] = useState(false);

  // Initial load
  useEffect(() => {
    loadDeck();
    loadFunnelFlow();

    // Pre-populate prompt from strategy ad angles if available
    if (strategy?.analysisResult?.adAngles?.[0]?.hook) {
      const hook = strategy.analysisResult.adAngles[0].hook;
      const biz = strategy.businessName || 'enterprise';
      setPrompt(`High-converting marketing visual for ${biz}: ${hook}, octane render, vibrant sleek UI, 8k professional commercial photography`);
    } else {
      const biz = strategy?.businessName || 'enterprise';
      const cat = strategy?.category || 'B2B SaaS';
      setPrompt(`Futuristic digital dashboard for ${biz} in ${cat}, high tech neon luminescence, 8k commercial marketing visual`);
    }
  }, [strategy]);

  // Load Pitch Deck
  const loadDeck = async () => {
    setLoadingDeck(true);
    try {
      const res = await api.generatePitchDeck({ strategy });
      if (res.success) {
        setDeck(res);
      }
    } catch (err) {
      console.error('Failed to load pitch deck:', err);
    } finally {
      setLoadingDeck(false);
    }
  };

  // Load Funnel Flow
  const loadFunnelFlow = async () => {
    setLoadingFlow(true);
    try {
      const res = await api.getFunnelFlow({ strategy });
      if (res.success) {
        setFunnelFlow(res.flow);
      }
    } catch (err) {
      console.error('Failed to load funnel flow:', err);
    } finally {
      setLoadingFlow(false);
    }
  };

  // Generate Visual AI Image
  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingImage(true);

    let width = 1024;
    let height = 1024;
    if (aspectRatio === '16:9') {
      width = 1280;
      height = 720;
    } else if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    }

    try {
      const res = await api.generateVisualImage({
        prompt,
        width,
        height,
        model: selectedModel,
        seed: Math.floor(Math.random() * 900000) + 100000,
      });

      if (res.success) {
        setGeneratedImage(res);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
      alert('Image generation failed: ' + err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Download real PowerPoint (.pptx) file directly
  const handleDownloadPptx = async () => {
    setIsDownloadingPptx(true);
    try {
      await api.downloadPptxFile(strategy || deck);
    } catch (err) {
      console.error('Failed to download PPTX:', err);
      alert('Failed to generate PowerPoint file: ' + err.message);
    } finally {
      setIsDownloadingPptx(false);
    }
  };

  // Copy Image Link
  const handleCopyLink = () => {
    if (generatedImage?.imageUrl) {
      navigator.clipboard.writeText(generatedImage.imageUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Export HTML Presentation Deck
  const handleDownloadHtmlDeck = () => {
    if (!deck || !deck.slides) return;
    const slidesHtml = deck.slides.map((s, idx) => `
      <section class="slide" id="slide-${idx}">
        <div class="slide-badge">${s.badge || 'Executive Presentation'}</div>
        <h1>${s.title}</h1>
        <h3>${s.subtitle || ''}</h3>
        ${s.tagline ? `<p class="tagline">"${s.tagline}"</p>` : ''}
        ${s.primaryPersona ? `<div class="card"><strong>Primary Persona:</strong> ${s.primaryPersona}</div>` : ''}
        ${s.decisionMakers ? `<div class="card"><strong>Decision Makers:</strong> ${s.decisionMakers}</div>` : ''}
        ${s.unfairAdvantage ? `<div class="card"><strong>Unfair Advantage:</strong> ${s.unfairAdvantage}</div>` : ''}
        <ul>
          ${(s.points || s.phases || s.roles || []).map((p) => `<li>${p}</li>`).join('')}
        </ul>
        <div class="footer">${deck.businessName} • Autonomous GTM Strategy • Slide ${s.slideNumber} of ${deck.slides.length}</div>
      </section>
    `).join('\n');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${deck.businessName} - GTM Pitch Deck</title>
<style>
  body { margin: 0; background: #030712; color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
  .slide { width: 960px; height: 540px; background: linear-gradient(135deg, #0B1120 0%, #0F172A 100%); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; padding: 48px; box-sizing: border-box; position: relative; margin: 20px 0; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
  .slide-badge { position: absolute; top: 32px; right: 40px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #38BDF8; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; }
  h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px 0; color: #FFFFFF; letter-spacing: -0.02em; }
  h3 { font-size: 16px; color: #94A3B8; margin: 0 0 24px 0; }
  .tagline { font-size: 18px; color: #38BDF8; font-style: italic; margin-bottom: 20px; }
  .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; font-size: 14px; color: #E2E8F0; }
  ul { padding-left: 20px; font-size: 14px; color: #CBD5E1; line-height: 1.6; }
  .footer { position: absolute; bottom: 24px; left: 48px; right: 48px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; }
</style>
</head>
<body>
${slidesHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (deck.businessName || 'gtm').toLowerCase().replace(/\s+/g, '_');
    a.download = `${cleanName}_pitch_deck.html`;
    a.click();
  };

  const currentSlide = deck?.slides?.[currentSlideIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Tabs Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '6px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('deck')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'deck' ? 'linear-gradient(135deg, #06B6D4, #3B82F6)' : 'transparent',
              color: activeSubTab === 'deck' ? '#FFFFFF' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            <Presentation size={16} />
            <span>🖥️ PowerPoint (.PPTX) Presentation Deck</span>
          </button>

          <button
            onClick={() => setActiveSubTab('image')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'image' ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'transparent',
              color: activeSubTab === 'image' ? '#FFFFFF' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={16} />
            <span>🎨 AI Ad &amp; Visual Creative Generator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flowchart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'flowchart' ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'transparent',
              color: activeSubTab === 'flowchart' ? '#FFFFFF' : '#94A3B8',
              fontWeight: '700',
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            <Layers size={16} />
            <span>📊 Visual GTM Pipeline Funnel Flowchart</span>
          </button>
        </div>

        {isSuperAdmin && (
          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
            <Shield size={12} /> Super Admin Control Hub
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: AUTONOMOUS POWERPOINT (.PPTX) PRESENTATION DECK */}
      {/* ========================================================================= */}
      {activeSubTab === 'deck' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Deck Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                Slide {currentSlideIndex + 1} of {deck?.slides?.length || 6}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#F8FAFC', fontWeight: '700' }}>
                {deck?.businessName || strategy?.businessName || 'Executive Strategy'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                • Built automatically from crawled business intelligence
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadPptx}
                disabled={isDownloadingPptx}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #06B6D4, #10B981)',
                  fontWeight: '700',
                }}
                title="Download real Microsoft PowerPoint (.pptx) file created from this data"
              >
                <Download size={15} />
                <span>{isDownloadingPptx ? 'Generating .PPTX...' : 'Download PowerPoint (.PPTX)'}</span>
              </button>

              <button
                onClick={handleDownloadHtmlDeck}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                title="Download offline HTML presentation deck"
              >
                <FileText size={14} /> Download .HTML Deck
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Present Slide Deck'}</span>
              </button>
            </div>
          </div>

          {/* Slide Stage Container */}
          {loadingDeck || !currentSlide ? (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
              <RefreshCw size={24} className="spin-slow" style={{ margin: '0 auto 12px' }} />
              <div>Compiling Executive PowerPoint Presentation...</div>
            </div>
          ) : (
            <div
              style={{
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100vw' : '100%',
                height: isFullscreen ? '100vh' : '520px',
                zIndex: isFullscreen ? 9999 : 1,
                background: 'linear-gradient(135deg, #070C18 0%, #0D1629 60%, #030712 100%)',
                borderRadius: isFullscreen ? 0 : '16px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
                padding: isFullscreen ? '60px 100px' : '36px 44px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Slide Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                    {currentSlide.badge || 'Executive Presentation'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                    VYUHOX Autonomous Strategy Dossier • 16:9 Slide Presentation
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: isFullscreen ? '2.4rem' : '1.85rem',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  margin: '4px 0 6px',
                  letterSpacing: '-0.02em',
                }}>
                  {currentSlide.title}
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                  {currentSlide.subtitle}
                </div>
              </div>

              {/* Slide Body */}
              <div style={{ margin: '16px 0', flex: 1, overflowY: 'auto' }}>
                {/* Visual Cover for Slide 1 */}
                {currentSlide.type === 'HERO' && currentSlide.coverImage && (
                  <div style={{
                    marginBottom: '16px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    height: isFullscreen ? '180px' : '130px',
                    position: 'relative',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}>
                    <img
                      src={currentSlide.coverImage}
                      alt="Strategy Visual Cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, rgba(7, 12, 24, 0.95) 0%, rgba(7, 12, 24, 0.3) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 24px',
                    }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38BDF8', maxWidth: '500px' }}>
                        "{currentSlide.tagline}"
                      </div>
                    </div>
                  </div>
                )}

                {currentSlide.tagline && currentSlide.type !== 'HERO' && (
                  <div style={{
                    fontSize: '1.05rem',
                    color: '#38BDF8',
                    fontStyle: 'italic',
                    marginBottom: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderLeft: '4px solid #06B6D4',
                  }}>
                    "{currentSlide.tagline}"
                  </div>
                )}

                {/* Specific Slide Content Cards */}
                {currentSlide.type === 'ICP' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase' }}>Primary Persona</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC', marginTop: '2px' }}>{currentSlide.primaryPersona}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase' }}>Decision Makers</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', marginTop: '2px' }}>{currentSlide.decisionMakers}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: '700', textTransform: 'uppercase' }}>Budget Tier / ACV</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', marginTop: '2px' }}>{currentSlide.budgetTier}</div>
                    </div>
                  </div>
                )}

                {currentSlide.unfairAdvantage && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#34D399',
                    fontSize: '0.875rem',
                    marginBottom: '14px',
                  }}>
                    <strong>Unfair Advantage:</strong> {currentSlide.unfairAdvantage}
                  </div>
                )}

                {/* Bullet Points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentSlide.points || currentSlide.phases || currentSlide.roles || []).map((pt, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.875rem',
                        color: '#E2E8F0',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <CheckCircle2 size={15} color="#06B6D4" style={{ flexShrink: 0 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Footer with Nav Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '16px',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {deck?.businessName} • Slide {currentSlideIndex + 1} of {deck?.slides?.length}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  <div style={{ display: 'flex', gap: '5px' }}>
                    {deck?.slides?.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: currentSlideIndex === idx ? '#06B6D4' : 'rgba(255,255,255,0.15)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    disabled={currentSlideIndex === (deck?.slides?.length || 6) - 1}
                    onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: AI AD & VISUAL CREATIVE GENERATOR (FLUX.1) */}
      {/* ========================================================================= */}
      {activeSubTab === 'image' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
          {/* Controls Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
                AI Visual Ad &amp; Asset Generator
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Generate high-resolution visual graphics for advertising campaigns, marketing collaterals, and social media posts powered by Pollinations FLUX.1.
              </p>
            </div>

            {/* Prompt input */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Creative Prompt
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your visual creative in detail..."
                className="input-glass"
                style={{ width: '100%', fontSize: '0.825rem', resize: 'vertical' }}
              />
            </div>

            {/* Aspect Ratio Buttons */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Aspect Ratio / Format
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: '1:1', label: 'Square (1:1)', desc: 'Instagram & Feed Ads' },
                  { id: '16:9', label: 'Landscape (16:9)', desc: 'Pitch Deck & LinkedIn' },
                  { id: '9:16', label: 'Vertical (9:16)', desc: 'Story & Reel Video Ads' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: aspectRatio === ar.id ? '2px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: aspectRatio === ar.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      color: aspectRatio === ar.id ? '#38BDF8' : '#94A3B8',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.78rem' }}>{ar.label}</div>
                    <div style={{ fontSize: '0.675rem', color: '#64748B', marginTop: '2px' }}>{ar.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selector */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Visual Engine Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input-glass"
                style={{ height: '36px', fontSize: '0.8rem' }}
              >
                <option value="auto">⚡ Auto-Rotating Zero-Limit Engine (Multi-Tool Failover)</option>
                <option value="banana">Nano Banana / Serverless SDXL GPU</option>
                <option value="google-flow">Google Flow / Imagen 3 Vision Engine</option>
                <option value="flux">FLUX.1 Schnell (Fast &amp; High Detail - Recommended)</option>
                <option value="flux-realism">FLUX Photorealism (Commercial Marketing)</option>
                <option value="flux-pro">HuggingFace FLUX.1 Schnell</option>
                <option value="fal">Fal.ai / Replicate Fast Flux</option>
                <option value="turbo">SDXL Turbo (Ultra-Fast)</option>
                <option value="dall-e-3">OpenAI DALL-E 3 (Requires API Key in Admin)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !prompt.trim()}
              className="btn-primary"
              style={{
                padding: '12px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                fontWeight: '700',
              }}
            >
              <Sparkles size={16} />
              <span>{isGeneratingImage ? 'Synthesizing Visual Creative...' : 'Generate Visual Image (Free)'}</span>
            </button>
          </div>

          {/* Preview Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {isGeneratingImage ? (
              <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                <RefreshCw size={36} className="spin-slow" color="#8B5CF6" style={{ margin: '0 auto 16px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC' }}>Rendering 8K Marketing Visual...</div>
                <div style={{ fontSize: '0.75rem', marginTop: '6px' }}>Diffusing prompt through FLUX.1 neural engine</div>
              </div>
            ) : generatedImage?.imageUrl ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  maxHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#040711',
                }}>
                  <img
                    src={generatedImage.imageUrl}
                    alt="AI Visual Output"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href={generatedImage.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="vyuhox_marketing_visual.jpg"
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <Download size={13} /> Download JPG
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {copiedUrl ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>{copiedUrl ? 'Copied Image Link!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748B' }}>
                <ImageIcon size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>No Visual Generated Yet</div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Click "Generate Visual Image" to synthesize an image.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: VISUAL GTM FUNNEL FLOWCHART */}
      {/* ========================================================================= */}
      {activeSubTab === 'flowchart' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px', color: '#F8FAFC' }}>
              Autonomous GTM Acquisition Funnel Flow
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
              Visual map illustrating how cold intent signals are converted to verified appointments automatically.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            {(funnelFlow?.nodes || []).map((node, idx) => (
              <div
                key={node.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderTop: `4px solid ${node.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: node.color, fontWeight: '700', textTransform: 'uppercase' }}>
                    {node.tool}
                  </div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: '700', margin: '4px 0 6px', color: '#F8FAFC' }}>
                    {node.label}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                    {node.desc}
                  </p>
                </div>

                {idx < (funnelFlow?.nodes?.length || 5) - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#64748B' }}>
                    <span>Next step</span>
                    <ArrowRight size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
