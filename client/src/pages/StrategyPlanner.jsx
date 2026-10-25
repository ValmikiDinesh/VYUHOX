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
  FileText,
  Edit3,
  Save,
  X,
  Printer,
  Calendar,
  CheckSquare,
  Square,
  Clock,
  Compass,
  DollarSign,
  Briefcase,
  Users,
  Award,
  BookOpen,
  Palette,
  Presentation,
  ChevronDown,
  ChevronUp,
  MapPin,
  Camera,
  Mic,
  Factory,
  Ship,
  PhoneCall,
} from 'lucide-react';
import { api } from '../services/api';
import VisualCreativeStudio from '../components/VisualCreativeStudio';

export default function StrategyPlanner({ activeWorkspace, socket, onNavigateTab }) {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ step: '', message: '', percent: 0 });
  const [strategy, setStrategy] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [showCrawledAssets, setShowCrawledAssets] = useState(true);

  // Active view tab: 'blueprint' | 'document' | 'roadmap'
  const [viewTab, setViewTab] = useState('blueprint');

  // Phase 7: Two-Sided Trade Engine & No-Website Onboarding State
  const [onboardingSource, setOnboardingSource] = useState('WEBSITE'); // 'WEBSITE' | 'GOOGLE_MAPS' | 'INSTAGRAM' | 'VOICE_PROMPT'
  const [noWebInput, setNoWebInput] = useState('');
  const [tradeMode, setTradeMode] = useState('STANDARD'); // 'STANDARD' | 'TWO_SIDED_TRADE'
  const [hsCodesInput, setHsCodesInput] = useState('');
  const [isNoWebOnboarding, setIsNoWebOnboarding] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: '',
    category: '',
    coreValueProp: '',
    unfairAdvantage: '',
    primaryPersona: '',
    decisionMakers: '',
    painPoints: '',
    budgetTier: '',
    clientNotes: '',
  });

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
          initEditForm(res.strategy);
        }
      } catch (err) {
        console.error('Failed to load strategy:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchStrategy();
  }, [activeWorkspace]);

  // Populate edit form from strategy
  const initEditForm = (strat) => {
    const a = strat?.analysisResult || {};
    const d = strat?.businessPlanDocument || {};
    setEditForm({
      businessName: strat?.businessName || a.businessName || '',
      category: strat?.category || a.category || '',
      coreValueProp: a.positioning?.coreValueProp || a.summary || '',
      unfairAdvantage: a.positioning?.unfairAdvantage || '',
      primaryPersona: a.targetAudience?.primaryPersona || '',
      decisionMakers: (a.targetAudience?.decisionMakers || []).join(', '),
      painPoints: (a.targetAudience?.painPoints || []).join('\n'),
      budgetTier: a.targetAudience?.estimatedBudgetTier || '',
      clientNotes: strat?.clientNotes || d.clientEditableNotes || '',
    });
  };

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
      setScanProgress({ step: 'COMPLETE', message: 'Strategy & Business Plan ready!', percent: 100 });
      if (data.strategy) {
        setStrategy(data.strategy);
        initEditForm(data.strategy);
      }
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
    setScanProgress({ step: 'INIT', message: `Connecting to ${finalUrl}...`, percent: 10 });

    try {
      const res = await api.scanWebsite(activeWorkspace._id, finalUrl);
      if (res && res.success && res.strategy) {
        setStrategy(res.strategy);
        initEditForm(res.strategy);
      } else if (res && !res.success) {
        alert(res.message || 'Scanning did not return a valid strategy.');
      }
    } catch (err) {
      console.error('Scan failed:', err);
      alert('Scanning notice: ' + (err.message || 'Unable to complete scan'));
    } finally {
      setIsScanning(false);
    }
  };

  // Phase 7: Handle No-Website Onboarding
  const handleNoWebsiteOnboard = async () => {
    if (!noWebInput.trim() || !activeWorkspace) return;
    try {
      setIsNoWebOnboarding(true);
      const hsList = hsCodesInput.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.onboardWithoutWebsite({
        workspaceId: activeWorkspace._id,
        sourceType: onboardingSource,
        sourceInput: noWebInput.trim(),
        tradeMode,
        hsCodes: hsList,
      });

      if (res.success) {
        // Refresh strategy
        const stratRes = await api.getStrategy(activeWorkspace._id);
        if (stratRes.success && stratRes.strategy) {
          setStrategy(stratRes.strategy);
          initEditForm(stratRes.strategy);
        }
        alert(`🚀 Success! AI Booking Micro-Site published live at: ${res.microSiteUrl}`);
      }
    } catch (err) {
      console.error('No-website onboarding error:', err);
      alert('Onboarding error: ' + err.message);
    } finally {
      setIsNoWebOnboarding(false);
    }
  };

  // 4. Save Edited Strategy & Document
  const handleSaveEdits = async () => {
    if (!strategy) return;
    try {
      const updatedAnalysis = {
        ...strategy.analysisResult,
        businessName: editForm.businessName,
        category: editForm.category,
        summary: editForm.coreValueProp,
        positioning: {
          ...strategy.analysisResult?.positioning,
          coreValueProp: editForm.coreValueProp,
          unfairAdvantage: editForm.unfairAdvantage,
        },
        targetAudience: {
          ...strategy.analysisResult?.targetAudience,
          primaryPersona: editForm.primaryPersona,
          decisionMakers: editForm.decisionMakers.split(',').map((s) => s.trim()).filter(Boolean),
          painPoints: editForm.painPoints.split('\n').map((s) => s.trim()).filter(Boolean),
          estimatedBudgetTier: editForm.budgetTier,
        },
      };

      const updatedDoc = {
        ...strategy.businessPlanDocument,
        executiveSummary: {
          ...strategy.businessPlanDocument?.executiveSummary,
          companyName: editForm.businessName,
          industryVertical: editForm.category,
          coreMission: editForm.coreValueProp,
        },
        idealCustomerProfile: {
          ...strategy.businessPlanDocument?.idealCustomerProfile,
          primaryPersona: editForm.primaryPersona,
          decisionMakers: editForm.decisionMakers.split(',').map((s) => s.trim()).filter(Boolean),
          criticalPainPoints: editForm.painPoints.split('\n').map((s) => s.trim()).filter(Boolean),
          estimatedBudgetTier: editForm.budgetTier,
        },
        clientEditableNotes: editForm.clientNotes,
      };

      const payload = {
        businessName: editForm.businessName,
        category: editForm.category,
        analysisResult: updatedAnalysis,
        businessPlanDocument: updatedDoc,
        clientNotes: editForm.clientNotes,
      };

      const res = await api.updateStrategy(strategy._id, payload);
      if (res.success && res.strategy) {
        setStrategy(res.strategy);
        setIsEditing(false);
        setSaveNotice(true);
        setTimeout(() => setSaveNotice(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update strategy:', err);
      alert('Failed to save changes: ' + err.message);
    }
  };

  // 5. Toggle Roadmap Step Status
  const handleToggleStepStatus = async (phaseIndex, currentStatus) => {
    if (!strategy) return;
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Optimistic UI update
    const updatedRoadmap = [...(strategy.stepByStepRoadmap || [])];
    if (updatedRoadmap[phaseIndex]) {
      updatedRoadmap[phaseIndex] = { ...updatedRoadmap[phaseIndex], status: newStatus };
      setStrategy({ ...strategy, stepByStepRoadmap: updatedRoadmap });
    }

    try {
      await api.updateStepStatus(strategy._id, phaseIndex, newStatus);
    } catch (err) {
      console.error('Failed to update step status:', err);
    }
  };

  // 6. Toggle acquisition channels
  const handleToggleChannel = async (channelName, currentEnabled) => {
    if (!strategy) return;
    const newEnabled = !currentEnabled;

    const updatedChannels = strategy.analysisResult?.recommendedChannels?.map((ch) =>
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

  // 7. Copy Hook to Clipboard
  const handleCopyHook = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 8. Copy Full Plan Document to Clipboard
  const handleCopyFullPlan = () => {
    if (!strategy) return;
    const fullText = generateMarkdownReport(strategy);
    navigator.clipboard.writeText(fullText);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  // 9. Export Markdown File
  const handleExportMarkdown = () => {
    if (!strategy) return;
    const mdContent = generateMarkdownReport(strategy);
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${(strategy.businessName || 'company').toLowerCase().replace(/\s+/g, '_')}_business_plan.md`;
    link.download = filename;
    link.click();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  // 10. Print / Save as PDF
  const handlePrintDocument = () => {
    window.print();
  };

  // Helper: Markdown Generator
  const generateMarkdownReport = (strat) => {
    const a = strat?.analysisResult || {};
    const d = strat?.businessPlanDocument || {};
    const roadmap = strat?.stepByStepRoadmap || d.stepByStepLaunchRoadmap || [];

    return `# ${d.documentTitle || `VYUHOX Autonomous Go-To-Market & Business Plan: ${strat.businessName}`}
Generated: ${d.generatedDate || new Date().toLocaleDateString()}
Platform: VYUHOX Autonomous GTM SaaS
Target URL: ${strat.targetUrl}
Industry: ${strat.category || a.category}

================================================================================
1. EXECUTIVE SUMMARY
================================================================================
Company: ${strat.businessName}
Industry Vertical: ${strat.category || a.category}
Core Value Proposition: ${a.positioning?.coreValueProp || a.summary}

Summary of Intelligence:
${d.executiveSummary?.keyFindings || a.summary}

================================================================================
2. TARGET AUDIENCE & IDEAL CUSTOMER PROFILE (ICP)
================================================================================
- Primary Persona: ${a.targetAudience?.primaryPersona}
- Key Decision Makers: ${(a.targetAudience?.decisionMakers || []).join(', ')}
- Estimated Budget Tier: ${a.targetAudience?.estimatedBudgetTier}
- Estimated Deal Size (ACV): ${a.targetAudience?.estimatedACV || 'N/A'}
- Discovered Pricing Model: ${a.targetAudience?.pricingSummary || 'Subscription / Enterprise'}

Critical Buyer Pain Points:
${(a.targetAudience?.painPoints || []).map((p) => `  * ${p}`).join('\n')}

Buying Triggers:
${(a.targetAudience?.buyingTriggers || []).map((t) => `  * ${t}`).join('\n')}

================================================================================
3. STRATEGIC POSITIONING & DIFFERENTIATION
================================================================================
Core Value Prop: "${a.positioning?.coreValueProp}"
Unfair Advantage: ${a.positioning?.unfairAdvantage}

Key Differentiators:
${(a.positioning?.keyDifferentiators || []).map((diff) => `  * ${diff}`).join('\n')}

================================================================================
4. MULTI-TOUCH ACQUISITION SWITCHBOARD
================================================================================
${(a.recommendedChannels || []).map((ch) => `* ${ch.channel} [${ch.enabled ? 'ACTIVE' : 'DISABLED'}] (Fit: ${ch.fitScore}%, Priority: ${ch.priority})\n  Rationale: ${ch.rationale}`).join('\n\n')}

================================================================================
5. HIGH-CONVERTING AD & OUTREACH ANGLES
================================================================================
${(a.adAngles || []).map((hook, i) => `${i + 1}. "${hook.hook}"\n   Angle: ${hook.angle}\n   Target Pain Point: ${hook.targetPainPoint}`).join('\n\n')}

================================================================================
6. RECOMMENDED MULTI-AGENT AUTONOMOUS TEAM
================================================================================
Deployment Mode: ${a.recommendedAITeam?.recommendedPlan || 'Autonomous Mode'}
Projected Monthly ROI: ${a.recommendedAITeam?.estimatedMonthlyROI}
Roster:
${(a.recommendedAITeam?.roles || []).map((r) => `  * ${r}`).join('\n')}

================================================================================
7. 30-DAY VYUHOX STEP-BY-STEP LAUNCH ROADMAP
================================================================================
${roadmap.map((phase, idx) => `[${phase.status || 'PENDING'}] ${phase.phase} (${phase.days})
Tools: ${(phase.tools || []).join(', ')}
Objectives:
${(phase.objectives || []).map((o) => `  * ${o}`).join('\n')}`).join('\n\n')}

================================================================================
8. FINANCIAL & PIPELINE PROJECTIONS
================================================================================
- Projected Monthly Qualified Accounts: ${d.financialAndPipelineProjections?.projectedMonthlyQualifiedLeads || '65 – 140 Accounts'}
- Projected Demo Show Rate: ${d.financialAndPipelineProjections?.projectedDemoShowRate || '82%'}
- Target CAC Reduction: ${d.financialAndPipelineProjections?.targetCustomerAcquisitionCost || '45% reduction'}
- Estimated Gross ROI: ${d.financialAndPipelineProjections?.estimatedGrossROI || a.recommendedAITeam?.estimatedMonthlyROI}

================================================================================
9. CLIENT STRATEGIC NOTES & DIRECTIVES
================================================================================
${strat.clientNotes || d.clientEditableNotes || 'No custom notes added yet. Use Edit Plan in VYUHOX to customize.'}
`;
  };

  const analysis = strategy?.analysisResult;
  const doc = strategy?.businessPlanDocument;
  const roadmap = strategy?.stepByStepRoadmap || doc?.stepByStepLaunchRoadmap || [];
  const rawData = strategy?.rawExtractedData || {};

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-cyan">
              <Sparkles size={13} />
              AUTONOMOUS GTM STRATEGIST & MULTI-PAGE CRAWLER
            </span>
            {strategy?.rawExtractedData?.isLiveCrawl !== undefined && (
              <span className={`badge ${strategy.rawExtractedData.isLiveCrawl ? 'badge-emerald' : 'badge-amber'}`}>
                {strategy.rawExtractedData.isLiveCrawl ? '✓ Live Multi-Page Crawl' : '⚡ Domain Reconstructed'}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Step 1 of 5
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.75rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}>
            Website Crawler & Business Strategy Architect
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Deep-crawls company DOM, pricing models & offerings, synthesizes bespoke ICPs, and structures 30-day autonomous execution blueprints.
          </p>
        </div>

        {analysis && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyFullPlan}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              title="Copy complete markdown business plan to clipboard"
            >
              {copiedDoc ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copiedDoc ? 'Copied Full Document!' : 'Copy Plan'}
            </button>

            <button
              onClick={handleExportMarkdown}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              title="Export formatted Markdown document"
            >
              <Download size={14} /> Export .MD
            </button>

            <button
              onClick={handlePrintDocument}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              title="Print or Save as PDF"
            >
              <Printer size={14} /> Print / PDF
            </button>

            <button
              onClick={() => setViewTab('visuals')}
              className="btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '0.8rem',
                background: viewTab === 'visuals' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#38BDF8',
              }}
              title="Open Autonomous PowerPoint (.PPTX) Presentation Deck & AI Visual Creatives"
            >
              <Presentation size={14} /> 🖥️ PowerPoint &amp; Visuals
            </button>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveEdits();
                } else {
                  setIsEditing(true);
                  setViewTab('document');
                }
              }}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.8rem', background: isEditing ? '#10B981' : undefined }}
            >
              {isEditing ? <Save size={15} /> : <Edit3 size={15} />}
              {isEditing ? 'Save All Changes' : 'Edit Plan Document'}
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
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
          <CheckCircle2 size={16} /> Business Plan & GTM Report exported successfully as Markdown!
        </div>
      )}

      {saveNotice && (
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
          <CheckCircle2 size={16} /> All customizations saved to database. Your AI Agent team is aligned with this plan!
        </div>
      )}

      {/* Onboarding Mode & Deep Scanner Bar */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        {/* Source Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          {[
            { id: 'WEBSITE', label: 'Website URL', icon: Globe, desc: 'DOM & Multi-page Crawler' },
            { id: 'GOOGLE_MAPS', label: 'Google Maps / Place CID', icon: MapPin, desc: 'Local Business & Reviews' },
            { id: 'INSTAGRAM', label: 'Instagram Profile', icon: Camera, desc: 'Social Bio & Catalog' },
            { id: 'VOICE_PROMPT', label: '60s Voice Brief', icon: Mic, desc: 'Audio Transcript / Dictation' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = onboardingSource === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOnboardingSource(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: active ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: active ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: active ? '#38BDF8' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  fontWeight: active ? '700' : '500',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={active ? '#06B6D4' : '#64748B'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {onboardingSource === 'WEBSITE' ? (
          <>
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
                  placeholder="Enter your website URL (e.g. https://yourbusiness.com)"
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
                    <span className="live-dot" style={{ background: '#04101A' }} /> Deep Crawling DOM...
                  </>
                ) : (
                  <>
                    <Search size={16} /> Crawl & Build Strategy
                  </>
                )}
              </button>
            </form>

            {/* Workspace Domain Helper */}
            {activeWorkspace?.domain && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                  Your Workspace Domain:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const target = activeWorkspace.domain.startsWith('http')
                      ? activeWorkspace.domain
                      : `https://${activeWorkspace.domain}`;
                    setUrlInput(target);
                    handleStartScan(target);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    color: '#38BDF8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Globe size={13} />
                  <span>Crawl {activeWorkspace.name} ({activeWorkspace.domain})</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* No-Website Onboarding Form (Google Maps, Instagram, Voice Prompt) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                🚀 NO-WEBSITE CLIENT ONBOARDING &amp; INSTANT MICRO-SITE GENERATOR
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Synthesizes brand identity and auto-compiles an ultra-fast 1-page mobile booking site with 15s speed-to-lead voice dispatch.
              </span>
            </div>

            {onboardingSource === 'VOICE_PROMPT' ? (
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={4}
                  required
                  value={noWebInput}
                  onChange={(e) => setNoWebInput(e.target.value)}
                  placeholder="Paste your 60-second voice dictation transcript or spoken business brief (e.g. 'We are an OEM manufacturer of precision brass valves and fittings located in Jamnagar. We have 35 CNC machines and export to Saudi Arabia and UAE. Looking for industrial distributor inquiries and bulk contract buyers...')"
                  className="input-glass"
                  style={{ padding: '12px 16px', fontSize: '0.85rem', lineHeight: '1.5' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {onboardingSource === 'GOOGLE_MAPS' ? (
                  <MapPin size={18} color="#06B6D4" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                ) : (
                  <Camera size={18} color="#EC4899" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                )}
                <input
                  type="text"
                  required
                  value={noWebInput}
                  onChange={(e) => setNoWebInput(e.target.value)}
                  placeholder={
                    onboardingSource === 'GOOGLE_MAPS'
                      ? 'Paste Google Maps URL, Place CID, or Business Name & City (e.g. https://maps.app.goo.gl/... or Apex Textiles Tirupur)'
                      : 'Enter Instagram Handle or Profile Link (e.g. @apextextiles_india or https://instagram.com/apex...)'
                  }
                  className="input-glass"
                  style={{ paddingLeft: '44px', height: '44px', fontSize: '0.9rem' }}
                />
              </div>
            )}

            {/* Trade Mode Selector & HS Codes Configuration */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', textTransform: 'uppercase' }}>
                  Execution Engine:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setTradeMode('STANDARD')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: tradeMode === 'STANDARD' ? '700' : '500',
                      background: tradeMode === 'STANDARD' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                      border: tradeMode === 'STANDARD' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                      color: tradeMode === 'STANDARD' ? '#38BDF8' : '#94A3B8',
                      cursor: 'pointer',
                    }}
                  >
                    Standard Single Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeMode('TWO_SIDED_TRADE')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: tradeMode === 'TWO_SIDED_TRADE' ? '700' : '500',
                      background: tradeMode === 'TWO_SIDED_TRADE' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                      border: tradeMode === 'TWO_SIDED_TRADE' ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid rgba(255,255,255,0.1)',
                      color: tradeMode === 'TWO_SIDED_TRADE' ? '#C4B5FD' : '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>🌐 Two-Sided Trade Engine (Factories + Importers)</span>
                  </button>
                </div>
              </div>

              {tradeMode === 'TWO_SIDED_TRADE' && (
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <input
                    type="text"
                    value={hsCodesInput}
                    onChange={(e) => setHsCodesInput(e.target.value)}
                    placeholder="Target HS Codes (e.g. 7412.20, 8481.80, 5208.11)"
                    className="input-glass"
                    style={{ height: '36px', fontSize: '0.8rem', padding: '0 12px' }}
                  />
                </div>
              )}

              <button
                type="button"
                disabled={isNoWebOnboarding || !noWebInput.trim()}
                onClick={handleNoWebsiteOnboard}
                className="btn-primary"
                style={{ height: '40px', padding: '0 20px', fontSize: '0.85rem' }}
              >
                {isNoWebOnboarding ? (
                  <>
                    <span className="live-dot" style={{ background: '#04101A' }} /> Synthesizing Brand &amp; Micro-Site...
                  </>
                ) : (
                  <>
                    <Zap size={15} /> Launch Instant AI Micro-Site
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Live Micro-Site Active Status Banner */}
        {strategy?.microSite?.slug && (
          <div style={{
            marginTop: '16px',
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}>
                <Zap size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Autonomous AI 1-Page Booking Micro-Site Active
                  </span>
                  <span className="badge badge-emerald">● Live on Web</span>
                  <span className="badge badge-cyan">⚡ 15s Speed-to-Lead</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                  Inbound inquiries route directly into Maya Vance's voice queue for instant AI phone callback within 15 seconds.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }}>
                📊 <strong>{strategy.microSite.visitorBookingsCount || 0}</strong> Bookings Captured
              </span>
              <a
                href={`http://localhost:5000/api/microsite/${strategy.microSite.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={14} /> Open Live Micro-Site
              </a>
            </div>
          </div>
        )}

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
                  {scanProgress.message || 'Connecting to target website and discovering internal pages...'}
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

      {/* Main View Mode Selector Tabs */}
      {analysis && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
          <button
            onClick={() => setViewTab('blueprint')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: viewTab === 'blueprint' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              border: viewTab === 'blueprint' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              color: viewTab === 'blueprint' ? '#38BDF8' : '#94A3B8',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Compass size={16} /> GTM Command Blueprint
          </button>

          <button
            onClick={() => setViewTab('document')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: viewTab === 'document' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: viewTab === 'document' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              color: viewTab === 'document' ? '#34D399' : '#94A3B8',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={16} /> Complete Business Plan Document {isEditing && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Editing</span>}
          </button>

          <button
            onClick={() => setViewTab('roadmap')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: viewTab === 'roadmap' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: viewTab === 'roadmap' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
              color: viewTab === 'roadmap' ? '#A78BFA' : '#94A3B8',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={16} /> 30-Day VYUHOX Launch Roadmap ({roadmap.filter((r) => r.status === 'COMPLETED').length}/{roadmap.length} Done)
          </button>

          <button
            onClick={() => setViewTab('visuals')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: viewTab === 'visuals' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
              border: viewTab === 'visuals' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
              color: viewTab === 'visuals' ? '#F472B6' : '#94A3B8',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Presentation size={16} /> 🖥️ PowerPoint Presentation &amp; Visuals
          </button>
        </div>
      )}

      {/* Main Content Area */}
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
            Enter your business website URL above to initiate the end-to-end multi-page crawler and generate your customized business plan.
          </p>
          {activeWorkspace?.domain ? (
            <button
              onClick={() => {
                const target = activeWorkspace.domain.startsWith('http')
                  ? activeWorkspace.domain
                  : `https://${activeWorkspace.domain}`;
                setUrlInput(target);
                handleStartScan(target);
              }}
              className="btn-primary"
            >
              <Zap size={16} /> Scan {activeWorkspace.name} ({activeWorkspace.domain})
            </button>
          ) : (
            <button
              onClick={() => {
                const inputEl = document.querySelector('input[placeholder*="website URL"]');
                if (inputEl) inputEl.focus();
              }}
              className="btn-primary"
            >
              <Zap size={16} /> Enter Website URL to Begin
            </button>
          )}
        </div>
      ) : (
        <>
          {/* TAB 1: GTM COMMAND BLUEPRINT */}
          {viewTab === 'blueprint' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Business Overview Header Card */}
              <div className="glass-panel" style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, rgba(11, 17, 32, 0.95) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(6, 182, 212, 0.08) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800' }}>
                        {strategy.businessName}
                      </h3>
                      <span className="badge badge-cyan">{strategy.category || analysis.category}</span>
                      <a
                        href={strategy.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      >
                        <ExternalLink size={14} /> Visit Site
                      </a>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '820px', lineHeight: '1.5' }}>
                      {analysis.summary}
                    </p>

                    {/* Multi-page Crawl Signals Pill */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
                      {rawData.pagesCrawled && rawData.pagesCrawled.length > 0 && (
                        <span style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={13} color="#10B981" /> {rawData.pagesCrawled.length} Pages Crawled
                        </span>
                      )}
                      {rawData.featuresCount > 0 && (
                        <span style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Cpu size={13} color="#06B6D4" /> {rawData.featuresCount} Features Extracted
                        </span>
                      )}
                      {rawData.detectedTech && rawData.detectedTech.length > 0 && (
                        <span style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Layers size={13} color="#A78BFA" /> Tech: {rawData.detectedTech.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Agent Sizing Widget */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    textAlign: 'right',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                      Projected Pipeline Impact
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                      {analysis.recommendedAITeam?.estimatedMonthlyROI || '6.2x Pipeline ROI'}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <Bot size={13} /> {analysis.recommendedAITeam?.recommendedPlan || 'AI Company Mode'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Crawled Website Intelligence & Asset Inventory (Tabs, Pages, Images, Products, Copy) */}
              <div className="glass-panel" style={{
                padding: '20px 24px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#06B6D4',
                    }}>
                      <Globe size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>
                          Live Crawled Intelligence &amp; Website Inventory
                        </h4>
                        {rawData.isSpa && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                            ⚡ SPA Client-Side Rendered (React/Vite)
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        Detailed audit of all navigation tabs, subpages, product offerings, images, and text strings crawled across this website.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCrawledAssets(!showCrawledAssets)}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {showCrawledAssets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showCrawledAssets ? 'Hide Extracted Inventory' : 'View Extracted Inventory'}
                  </button>
                </div>

                {/* Quick Metric Pills */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    📑 <strong>{rawData.scannedTabs?.length || 0}</strong> Navigation Tabs
                  </span>
                  <span style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🔗 <strong>{rawData.scannedLinks?.length || 0}</strong> Discovered Routes &amp; Links
                  </span>
                  <span style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🛡️ <strong>{strategy.analysisResult?.positioning?.keyDifferentiators?.length || rawData.featuresCount || 0}</strong> Extracted Capabilities
                  </span>
                  {rawData.scannedImages?.length > 0 && (
                    <span style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🖼️ <strong>{rawData.scannedImages.length}</strong> Images &amp; Visuals
                    </span>
                  )}
                  {rawData.pricingSignals?.length > 0 && (
                    <span style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      💰 <strong>{rawData.pricingSignals.length}</strong> Pricing Signals
                    </span>
                  )}
                </div>

                {/* Collapsible Details */}
                {showCrawledAssets && (
                  <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {/* Col 1: Tabs & Pages */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📑 Website Navigation Tabs &amp; Header Items ({rawData.scannedTabs?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {rawData.scannedTabs && rawData.scannedTabs.length > 0 ? (
                          rawData.scannedTabs.map((tab, i) => (
                            <span key={i} style={{ fontSize: '0.725rem', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#7DD3FC', padding: '3px 8px', borderRadius: '5px' }}>
                              {tab}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Primary landing page header audited</span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#A78BFA', textTransform: 'uppercase', marginTop: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔗 Discovered Subpages &amp; Routes ({rawData.scannedLinks?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                        {rawData.scannedLinks && rawData.scannedLinks.length > 0 ? (
                          rawData.scannedLinks.map((link, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#C4B5FD', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {link}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Primary landing page scanned</span>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Extracted Features & Evidence */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34D399', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🛡️ Crawled Feature Capabilities &amp; Domain Copy ({analysis.positioning?.keyDifferentiators?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                        {analysis.positioning?.keyDifferentiators && analysis.positioning.keyDifferentiators.length > 0 ? (
                          analysis.positioning.keyDifferentiators.map((diff, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: '#E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4' }}>
                              <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{diff}</span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Features extracted directly from page DOM</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid 1: ICP & Buyer Persona Matrix + Positioning & Value Prop */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
                {/* 🎯 ICP & Buyer Persona Matrix */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target size={18} color="#06B6D4" />
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '700' }}>
                        Target Audience & ICP Persona Matrix
                      </h3>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>Step 2 Ready</span>
                  </div>

                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#38BDF8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                      Primary Target Buyer Persona
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
                        Decision Makers
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F8FAFC', marginTop: '4px' }}>
                        {analysis.targetAudience?.decisionMakers?.join(', ') || 'C-Suite & Founders'}
                      </div>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                        Budget / Deal Size
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#10B981', marginTop: '4px' }}>
                        {analysis.targetAudience?.estimatedBudgetTier || '$5K - $25K / mo'}
                      </div>
                    </div>
                  </div>

                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('leads')}
                      className="btn-secondary"
                      style={{ marginTop: '8px', width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                    >
                      <Users size={14} /> Search This ICP in VYUHOX Lead Finder <ArrowRight size={14} />
                    </button>
                  )}
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
                      fontSize: '0.875rem',
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

              {/* Phase 7: 🌐 Two-Sided Trade Engine: Sourcing & Distribution Hub */}
              {(strategy.tradeMode === 'TWO_SIDED_TRADE' || strategy.twoSidedTradeConfig?.supplierPipeline?.enabled) && (
                <div className="glass-panel" style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(88, 28, 135, 0.12) 50%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#C4B5FD',
                      }}>
                        <Ship size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>
                            Two-Sided Trade Engine: Sourcing &amp; Export Distribution
                          </h3>
                          <span className="badge badge-purple">● Dual-Sided Active</span>
                          <span className="badge badge-cyan">HS Code Intelligence</span>
                        </div>
                        <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
                          Simultaneously sources verified manufacturing factories upstream and qualifies cross-border importers/distributors downstream.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('leads')}
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                        >
                          View Trade Leads
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {/* Column 1: Supplier & Factory Sourcing */}
                    <div style={{
                      padding: '18px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Factory size={16} color="#06B6D4" />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>
                            Supplier &amp; Factory Pipeline
                          </span>
                        </div>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                          Quota: {strategy.twoSidedTradeConfig?.supplierPipeline?.leadQuota || 20}/cycle
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                            Target HS Codes
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                            {(strategy.twoSidedTradeConfig?.supplierPipeline?.targetHsCodes || ['7412.20', '8481.80']).map((hs, i) => (
                              <span key={i} style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#7DD3FC', fontFamily: 'monospace' }}>
                                HS {hs}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                            Sourcing Regions
                          </div>
                          <div style={{ fontSize: '0.775rem', color: '#CBD5E1', marginTop: '2px' }}>
                            {(strategy.twoSidedTradeConfig?.supplierPipeline?.targetRegions || ['India', 'Southeast Asia', 'Turkey']).join(', ')}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                            Autonomous Waterfall Query
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                            {strategy.twoSidedTradeConfig?.supplierPipeline?.searchQuery || `${strategy.businessName} manufacturing factories exporters supplier`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Buyer & Importer Distribution */}
                    <div style={{
                      padding: '18px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Ship size={16} color="#A78BFA" />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#C4B5FD', textTransform: 'uppercase' }}>
                            Buyer &amp; Importer Pipeline
                          </span>
                        </div>
                        <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                          Quota: {strategy.twoSidedTradeConfig?.buyerPipeline?.leadQuota || 20}/cycle
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                            Target HS Codes
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                            {(strategy.twoSidedTradeConfig?.buyerPipeline?.targetHsCodes || ['7412.20', '8481.80']).map((hs, i) => (
                              <span key={i} style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#DDD6FE', fontFamily: 'monospace' }}>
                                HS {hs}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                            Target Buyer Geographies
                          </div>
                          <div style={{ fontSize: '0.775rem', color: '#CBD5E1', marginTop: '2px' }}>
                            {(strategy.twoSidedTradeConfig?.buyerPipeline?.targetRegions || ['UAE', 'Saudi Arabia', 'USA', 'Germany', 'Singapore']).join(', ')}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                            Autonomous Waterfall Query
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                            {strategy.twoSidedTradeConfig?.buyerPipeline?.searchQuery || `${strategy.businessName} wholesale importers distributors procurement`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎛️ Recommended Acquisition Switchboard */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700' }}>
                      Recommended Acquisition Switchboard
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Interactive channel toggles for multi-touch GTM routing. Enabled channels run in live campaigns.
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
                      Synthesized psychological hooks tailored to {strategy.businessName}'s actual features and ICP objections.
                    </p>
                  </div>
                  <span className="badge badge-amber">Ready for Cold Email, WhatsApp & Meta CAPI</span>
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
                      Tailored specifically to {strategy.businessName}'s sales motion and deal velocity:
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
                    <button
                      onClick={() => setViewTab('roadmap')}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      View 30-Day Launch Roadmap <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLETE BUSINESS PLAN DOCUMENT (MCKINSEY / BCG GRADE) */}
          {viewTab === 'document' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Document Banner & Edit Controls */}
              <div className="glass-panel" style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.8)',
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#06B6D4', textTransform: 'uppercase', fontWeight: '700' }}>
                    OFFICIAL GTM DOSSIER
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800' }}>
                    {isEditing ? 'Editing Business Plan Document' : (doc?.documentTitle || `Autonomous GTM Business Plan: ${strategy.businessName}`)}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Version 2.4 Production • Generated for {strategy.businessName} • Fully Editable by Client
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleSaveEdits}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.8rem', background: '#10B981' }}
                      >
                        <Save size={14} /> Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      <Edit3 size={14} /> Edit Document
                    </button>
                  )}
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div
                className="glass-panel"
                style={{
                  padding: '36px 44px',
                  background: 'rgba(11, 17, 32, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                  lineHeight: '1.6',
                }}
              >
                {/* Section 1: Executive Summary */}
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Section 1</span>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800' }}>
                      Executive Summary & Mission
                    </h4>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Business / Brand Name</label>
                        <input
                          type="text"
                          value={editForm.businessName}
                          onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Industry / Vertical Classification</label>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Core Value Proposition & Mission</label>
                        <textarea
                          rows={3}
                          value={editForm.coreValueProp}
                          onChange={(e) => setEditForm({ ...editForm, coreValueProp: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.9rem', color: '#F1F5F9', marginBottom: '10px' }}>
                        <strong>{strategy.businessName}</strong> operates in the <strong>{strategy.category}</strong> vertical. {doc?.executiveSummary?.coreMission || analysis.summary}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                        {doc?.executiveSummary?.keyFindings || `Deep DOM inspection discovered clear value propositions and strong fit for autonomous multi-channel outbound execution.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 2: Ideal Customer Profile (ICP) Deep Dive */}
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Section 2</span>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800' }}>
                      Target Audience & Ideal Customer Profile (ICP)
                    </h4>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Primary Buyer Persona</label>
                        <input
                          type="text"
                          value={editForm.primaryPersona}
                          onChange={(e) => setEditForm({ ...editForm, primaryPersona: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Target Decision Makers (comma-separated)</label>
                        <input
                          type="text"
                          value={editForm.decisionMakers}
                          onChange={(e) => setEditForm({ ...editForm, decisionMakers: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Critical Buyer Pain Points (one per line)</label>
                        <textarea
                          rows={4}
                          value={editForm.painPoints}
                          onChange={(e) => setEditForm({ ...editForm, painPoints: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Estimated Budget Tier / Contract Value</label>
                        <input
                          type="text"
                          value={editForm.budgetTier}
                          onChange={(e) => setEditForm({ ...editForm, budgetTier: e.target.value })}
                          className="input-glass"
                          style={{ marginTop: '4px' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase' }}>Primary Persona</span>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F8FAFC', marginTop: '2px' }}>
                            {analysis.targetAudience?.primaryPersona}
                          </div>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase' }}>Target Decision Makers</span>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', marginTop: '2px' }}>
                            {analysis.targetAudience?.decisionMakers?.join(', ')}
                          </div>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <span style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: '700', textTransform: 'uppercase' }}>Budget / Deal Tier</span>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', marginTop: '2px' }}>
                            {analysis.targetAudience?.estimatedBudgetTier}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                          Core Pain Points Solved
                        </span>
                        <ul style={{ paddingLeft: '20px', marginTop: '6px', color: '#CBD5E1', fontSize: '0.85rem' }}>
                          {analysis.targetAudience?.painPoints?.map((p, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Strategic Differentiation & Market Positioning */}
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Section 3</span>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800' }}>
                      Market Positioning & Unfair Advantage
                    </h4>
                  </div>

                  {isEditing ? (
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Unfair Competitive Advantage</label>
                      <textarea
                        rows={3}
                        value={editForm.unfairAdvantage}
                        onChange={(e) => setEditForm({ ...editForm, unfairAdvantage: e.target.value })}
                        className="input-glass"
                        style={{ marginTop: '4px', resize: 'vertical' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#E2E8F0', marginBottom: '10px' }}>
                        <strong>Unfair Advantage:</strong> {analysis.positioning?.unfairAdvantage}
                      </p>
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                          Key Market Differentiators
                        </span>
                        <ul style={{ paddingLeft: '20px', marginTop: '6px', color: '#CBD5E1', fontSize: '0.85rem' }}>
                          {analysis.positioning?.keyDifferentiators?.map((d, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Multi-Agent AI Team Architecture */}
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>Section 4</span>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800' }}>
                      Dedicated AI Agent Team & Responsibilities
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {(analysis.recommendedAITeam?.roles || []).map((roleStr, idx) => (
                      <div key={idx} style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: '700', fontSize: '0.85rem' }}>
                          <Bot size={15} /> {roleStr.split(':')[0]}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
                          {roleStr.split(':')[1] || roleStr}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Financial Targets & ROI Model */}
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Section 5</span>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800' }}>
                      Projected Unit Economics & Pipeline Returns
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase' }}>Projected ROI Multiple</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>
                        {analysis.recommendedAITeam?.estimatedMonthlyROI || '6.4x ROI'}
                      </div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#06B6D4', fontWeight: '700', textTransform: 'uppercase' }}>Demo Show Rate</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>
                        82% Qualified
                      </div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#A78BFA', fontWeight: '700', textTransform: 'uppercase' }}>Target CAC Reduction</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>
                        -45% vs Manual SDR
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 6: Client Custom Notes & Directives */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Section 6</span>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800' }}>
                      Client Execution Directives & Custom Notes
                    </h4>
                  </div>

                  {isEditing ? (
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Add custom notes, constraints, target geos, or specialized pitch instructions:
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.clientNotes}
                        onChange={(e) => setEditForm({ ...editForm, clientNotes: e.target.value })}
                        placeholder="e.g. Focus outbound strictly on Series A-C US tech companies. Exclude existing customers. Emphasize SOC2 compliance in all voice scripts."
                        className="input-glass"
                        style={{ marginTop: '6px', resize: 'vertical' }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      color: strategy.clientNotes ? '#F8FAFC' : '#64748B',
                      fontSize: '0.85rem',
                      fontStyle: strategy.clientNotes ? 'normal' : 'italic',
                    }}>
                      {strategy.clientNotes || 'No custom client notes added yet. Click "Edit Document" above to insert specific directives, target geographies, or messaging rules.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 30-DAY VYUHOX STEP-BY-STEP LAUNCH ROADMAP */}
          {viewTab === 'roadmap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800' }}>
                      30-Day Autonomous Launch Playbook: {strategy.businessName}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Follow this step-by-step roadmap to launch VYUHOX autonomous prospecting, dialers, and ad pipelines for your business.
                    </p>
                  </div>
                  <span className="badge badge-emerald">
                    {roadmap.filter((r) => r.status === 'COMPLETED').length} of {roadmap.length} Milestones Complete
                  </span>
                </div>
              </div>

              {/* Roadmap Phases List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {roadmap.map((phase, idx) => {
                  const isDone = phase.status === 'COMPLETED';
                  return (
                    <div
                      key={idx}
                      className="glass-panel"
                      style={{
                        padding: '22px 26px',
                        borderLeft: isDone ? '4px solid #10B981' : '4px solid #06B6D4',
                        background: isDone ? 'rgba(16, 185, 129, 0.04)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStepStatus(idx, phase.status)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0,
                            }}
                            title={isDone ? 'Mark as pending' : 'Mark as completed'}
                          >
                            {isDone ? (
                              <CheckCircle2 size={24} color="#10B981" />
                            ) : (
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                border: '2px solid #64748B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }} />
                            )}
                          </button>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                textDecoration: isDone ? 'line-through' : 'none',
                                color: isDone ? '#94A3B8' : '#F8FAFC',
                              }}>
                                {phase.phase}
                              </h4>
                              <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                                <Clock size={11} /> {phase.days}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              Integrated Tools: {(phase.tools || []).join(' • ')}
                            </div>
                          </div>
                        </div>

                        {/* Action Link to direct VYUHOX tool */}
                        {onNavigateTab && (
                          <div>
                            {idx === 0 && (
                              <button onClick={() => onNavigateTab('voice')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                                Open Voice Studio <ArrowRight size={13} />
                              </button>
                            )}
                            {idx === 1 && (
                              <button onClick={() => onNavigateTab('leads')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                                Run Lead Finder <ArrowRight size={13} />
                              </button>
                            )}
                            {idx === 2 && (
                              <button onClick={() => onNavigateTab('inbox')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                                View SDR Inbox <ArrowRight size={13} />
                              </button>
                            )}
                            {idx === 3 && (
                              <button onClick={() => onNavigateTab('voice')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                                Configure Maya Voice AE <ArrowRight size={13} />
                              </button>
                            )}
                            {idx === 4 && (
                              <button onClick={() => onNavigateTab('ads')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                                Launch Ad Optimizer <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Objectives Checklist */}
                      <div style={{ paddingLeft: '34px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(phase.objectives || []).map((obj, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: isDone ? '#64748B' : '#CBD5E1' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isDone ? '#10B981' : '#06B6D4' }} />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: VISUAL PITCH DECK, CANVA & AD ASSETS */}
          {viewTab === 'visuals' && (
            <VisualCreativeStudio strategy={strategy} />
          )}
        </>
      )}
    </div>
  );
}
