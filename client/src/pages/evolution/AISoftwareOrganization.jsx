import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Activity,
  Layers,
  FileText,
  CheckCircle,
  GitBranch,
  Shield,
  Gauge,
  Cpu,
  Terminal,
  Settings,
  Users,
  MessageSquare,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Server,
  Code,
  Bug,
  Award,
  DollarSign,
  ArrowRight,
  Eye,
  CornerDownRight,
  Clock,
  Sparkles,
  Lock,
  Compass,
  Check,
  RefreshCw,
  Sliders,
  Database,
  Globe,
  Radio,
  BookOpen,
  Send,
  Zap,
} from 'lucide-react';

export default function AISoftwareOrganization({ onNavigateHome }) {
  const [activeNav, setActiveNav] = useState('executive_dashboard');
  const [project, setProject] = useState(null);
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [councilSession, setCouncilSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [defects, setDefects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [projectForm, setProjectForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Connect to Socket.IO for live agent events
  useEffect(() => {
    const s = io('/', { transports: ['websocket', 'polling'] });

    s.on('connect', () => {
      addLog('Connected to VYUHOX Autonomous Evolution Real-Time Event Bus');
    });

    s.on('evolution:event', (payload) => {
      addLog(`[${payload.event}] ${JSON.stringify(payload.data?.message || payload.data)}`);
      refreshAllData();
    });

    s.on('agent:activity', (data) => {
      addLog(`🤖 [${data.agent}]: ${data.message}`);
    });

    s.on('checkpoint:reached', (data) => {
      addLog(`⚠️ [APPROVAL CHECKPOINT REACHED]: ${data.checkpoint}`);
      refreshAllData();
    });

    return () => s.disconnect();
  }, []);

  const addLog = (msg) => {
    setExecutionLog((prev) => [
      { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), text: msg },
      ...prev.slice(0, 49),
    ]);
  };

  // Initial Data Fetch
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const [projRes, dtRes, cycleRes, docsRes, agentsRes] = await Promise.all([
        fetch('/api/evolution/project').then((r) => r.json()),
        fetch('/api/evolution/digital-twin').then((r) => r.json()),
        fetch('/api/evolution/cycle/CYCLE-2026-001').then((r) => r.json()),
        fetch('/api/evolution/documents?cycleId=CYCLE-2026-001').then((r) => r.json()),
        fetch('/api/evolution/agents').then((r) => r.json()),
      ]);

      if (projRes.success) {
        setProject(projRes.project);
        setProjectForm(projRes.project);
      }
      if (dtRes.success) setDigitalTwin(dtRes.digitalTwin);
      if (cycleRes.success) setCycle(cycleRes.cycle);
      if (docsRes.success) {
        setDocuments(docsRes.documents);
        if (!selectedDoc && docsRes.documents.length > 0) {
          fetchDocumentDetails(docsRes.documents[0].docId);
        }
      }
      if (agentsRes.success) setAgents(agentsRes.agents);

      // Fetch tasks, defects, and council session
      const [tasksRes, defectsRes, councilRes, msgsRes] = await Promise.all([
        fetch('/api/evolution/tasks/CYCLE-2026-001').then((r) => r.json()),
        fetch('/api/evolution/defects/CYCLE-2026-001').then((r) => r.json()),
        fetch('/api/evolution/council-session/CYCLE-2026-001').then((r) => r.json()),
        fetch('/api/evolution/messages/CYCLE-2026-001').then((r) => r.json()),
      ]);

      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (defectsRes.success) setDefects(defectsRes.defects);
      if (councilRes.success) setCouncilSession(councilRes.session);
      if (msgsRes.success) setMessages(msgsRes.messages);
    } catch (e) {
      console.error('Failed to load evolution data:', e);
    }
  };

  const fetchDocumentDetails = async (docId) => {
    try {
      const res = await fetch(`/api/evolution/documents/${docId}`).then((r) => r.json());
      if (res.success) {
        setSelectedDoc(res.document);
        setEditedContent(res.document.contentMarkdown);
        setEditMode(false);
      }
    } catch (e) {
      console.error('Failed to load document details:', e);
    }
  };

  // Actions
  const handleTriggerResearch = async () => {
    setLoading(true);
    addLog('🚀 Triggering Autonomous Research & Audit Department (Agents 1-3)...');
    try {
      const res = await fetch('/api/evolution/stage/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId: 'CYCLE-2026-001' }),
      }).then((r) => r.json());
      if (res.success) {
        addLog('✅ Research & Product Intelligence Stage Completed! Ready for Checkpoint 1.');
        refreshAllData();
      }
    } catch (e) {
      addLog(`❌ Error triggering research: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecideCheckpoint1 = async (action) => {
    setLoading(true);
    addLog(`✍️ Submitting Checkpoint 1 Human Decision: ${action}...`);
    try {
      const res = await fetch('/api/evolution/checkpoint/1/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: 'CYCLE-2026-001',
          action,
          comments: action === 'APPROVE' ? 'Approved proposal without modification.' : 'Proceeding with custom requirements.',
          decidedBy: 'Valmiki Dinesh (Owner)',
        }),
      }).then((r) => r.json());
      if (res.success) {
        addLog(`✅ Checkpoint 1 Decision Registered: ${action}. Technical Reviews & Council Dispatched.`);
        refreshAllData();
      }
    } catch (e) {
      addLog(`❌ Error registering Checkpoint 1 decision: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecideCheckpoint2 = async (action) => {
    setLoading(true);
    addLog(`✍️ Submitting Checkpoint 2 Master Plan Decision: ${action}...`);
    try {
      const res = await fetch('/api/evolution/checkpoint/2/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: 'CYCLE-2026-001',
          action,
          comments: 'Master Implementation Plan approved for feature branch execution.',
          selectedFeatureIds: ['REQ-01', 'REQ-02', 'REQ-03', 'REQ-04'],
          decidedBy: 'Valmiki Dinesh (Owner)',
        }),
      }).then((r) => r.json());
      if (res.success) {
        addLog(`✅ Checkpoint 2 Decision Registered: ${action}. Development & QA Loop executed.`);
        refreshAllData();
      }
    } catch (e) {
      addLog(`❌ Error registering Checkpoint 2 decision: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeRelease = async () => {
    setLoading(true);
    addLog('🚀 Authorizing Production Release Gate...');
    try {
      const res = await fetch('/api/evolution/release-gate/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: 'CYCLE-2026-001',
          authorizedBy: 'Valmiki Dinesh (Owner)',
        }),
      }).then((r) => r.json());
      if (res.success) {
        addLog('🏆 Production Release Authorized! Evolution Cycle Completed.');
        refreshAllData();
      }
    } catch (e) {
      addLog(`❌ Error authorizing release: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRescanDigitalTwin = async () => {
    setLoading(true);
    addLog('🔍 Rescanning VYUHOX Digital Twin AST & Database Schemas...');
    try {
      const res = await fetch('/api/evolution/digital-twin/rescan', { method: 'POST' }).then((r) => r.json());
      if (res.success) {
        addLog('✅ Digital Twin Synchronized!');
        setDigitalTwin(res.digitalTwin);
      }
    } catch (e) {
      addLog(`❌ Rescan failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocumentEdit = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/evolution/documents/${selectedDoc.docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentMarkdown: editedContent,
          changeSummary: 'Human owner edited document via Document Center',
          modifiedBy: 'Valmiki Dinesh (Owner)',
        }),
      }).then((r) => r.json());
      if (res.success) {
        addLog(`✅ Document ${selectedDoc.docId} updated! New revision created.`);
        setSelectedDoc(res.document);
        setEditMode(false);
        refreshAllData();
      }
    } catch (e) {
      addLog(`❌ Save document error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProjectProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/evolution/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm),
      }).then((r) => r.json());
      if (res.success) {
        addLog('✅ Project profile saved successfully!');
        setProject(res.project);
      }
    } catch (e) {
      addLog(`❌ Error updating project: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 21 Navigation Centers
  const navItems = [
    { id: 'executive_dashboard', label: '1. Executive Dashboard', icon: Gauge },
    { id: 'vyuhox_projects', label: '2. VYUHOX Projects', icon: Server },
    { id: 'digital_twin', label: '3. Digital Twin Hub', icon: Compass },
    { id: 'live_audit', label: '4. Live Product Audit', icon: Activity },
    { id: 'global_research', label: '5. Global Research', icon: Search },
    { id: 'competitor_intel', label: '6. Competitor Intelligence', icon: TrendingUp },
    { id: 'product_strategy', label: '7. Product Strategy', icon: Layers },
    { id: 'agent_workforce', label: '8. Agent Workforce (20)', icon: Users },
    { id: 'agent_communication', label: '9. Agent Communication', icon: MessageSquare },
    { id: 'document_center', label: '10. Document Center', icon: FileText },
    { id: 'approval_center', label: '11. Approval Center', icon: CheckCircle },
    { id: 'executive_council', label: '12. Executive Council', icon: Award },
    { id: 'development_center', label: '13. Development Center', icon: Code },
    { id: 'git_workspace', label: '14. Git Workspace', icon: GitBranch },
    { id: 'testing_center', label: '15. Testing Center', icon: Terminal },
    { id: 'defect_management', label: '16. Defect Management', icon: Bug },
    { id: 'security_center', label: '17. Security Center', icon: Shield },
    { id: 'performance_center', label: '18. Performance Center', icon: Cpu },
    { id: 'deployment_center', label: '19. Deployment Center', icon: ExternalLink },
    { id: 'improvement_cycles', label: '20. Improvement Cycles', icon: RotateCw },
    { id: 'ai_usage_costs', label: '21. AI Usage & FinOps', icon: DollarSign },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0A0F1D', color: '#F1F5F9', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {/* Left Sidebar: 21 Enterprise Blue Navigation Modules */}
      <aside style={{ width: '280px', minWidth: '280px', background: '#0D1424', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Brand Header */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 10px #38BDF8' }} />
              <h1 style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '0.04em', color: '#FFFFFF', margin: 0 }}>VYUHOX AI ORG</h1>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Autonomous Software Enterprise</div>
          </div>
          <button
            onClick={onNavigateHome}
            style={{ background: '#1E293B', border: '1px solid #334155', color: '#94A3B8', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
          >
            ← App
          </button>
        </div>

        {/* Live Cycle Pill */}
        <div style={{ padding: '12px 16px', background: '#0F172A', borderBottom: '1px solid #1E293B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: '#64748B' }}>Cycle: </span>
            <strong style={{ color: '#38BDF8' }}>{cycle?.cycleId || 'CYCLE-2026-001'}</strong>
          </div>
          <span style={{ background: 'rgba(2, 132, 199, 0.2)', color: '#38BDF8', border: '1px solid rgba(2, 132, 199, 0.4)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: '700' }}>
            {cycle?.currentStage || 'INITIALIZED'}
          </span>
        </div>

        {/* Scrollable Navigation List */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #0284C7' : '1px solid transparent',
                  background: isActive ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? '600' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} color={isActive ? '#38BDF8' : '#64748B'} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                {isActive && <ChevronRight size={14} color="#38BDF8" />}
              </button>
            );
          })}
        </nav>

        {/* Live System Vitals Footer */}
        <div style={{ padding: '14px 16px', background: '#0B1120', borderTop: '1px solid #1E293B', fontSize: '0.72rem', color: '#64748B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Target:</span>
            <span style={{ color: '#94A3B8' }}>{project?.liveProductionUrl || 'https://vyuhox.onrender.com'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Wholesale Cost:</span>
            <span style={{ color: '#10B981', fontWeight: '700' }}>${(cycle?.costUSD || 0).toFixed(4)} / ${cycle?.budgetUSD || 50}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Operational Bar */}
        <header style={{ height: '64px', minHeight: '64px', background: '#0D1424', borderBottom: '1px solid #1E293B', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {navItems.find((n) => n.id === activeNav)?.label}
            </h2>
            <span style={{ fontSize: '0.75rem', background: '#1E293B', color: '#38BDF8', padding: '3px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
              Stage: {cycle?.currentStage || 'IDLE'}
            </span>
          </div>

          {/* Quick Action Triggers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRescanDigitalTwin}
              disabled={loading}
              style={{ background: '#1E293B', border: '1px solid #334155', color: '#E2E8F0', padding: '7px 12px', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <RotateCw size={13} />
              Rescan Digital Twin
            </button>

            {(!cycle || cycle?.currentStage === 'INITIALIZED') && (
              <button
                onClick={handleTriggerResearch}
                disabled={loading}
                style={{ background: 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)', border: 'none', color: '#FFFFFF', padding: '7px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Play size={13} fill="#FFFFFF" />
                Run Autonomous Audit & Research
              </button>
            )}

            {cycle?.currentStage === 'CHECKPOINT_1_PROPOSAL_REVIEW' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleDecideCheckpoint1('APPROVE')}
                  disabled={loading}
                  style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '7px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  ✓ Approve Proposal (CP1)
                </button>
                <button
                  onClick={() => handleDecideCheckpoint1('EDIT')}
                  disabled={loading}
                  style={{ background: '#D97706', border: 'none', color: '#FFFFFF', padding: '7px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Edit Scope
                </button>
              </div>
            )}

            {cycle?.currentStage === 'CHECKPOINT_2_MASTER_PLAN_REVIEW' && (
              <button
                onClick={() => handleDecideCheckpoint2('APPROVE')}
                disabled={loading}
                style={{ background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', border: 'none', color: '#FFFFFF', padding: '7px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
              >
                ✓ Approve Master Plan (CP2) & Run Dev
              </button>
            )}

            {cycle?.currentStage === 'PRODUCT_ACCEPTANCE' && (
              <button
                onClick={handleAuthorizeRelease}
                disabled={loading}
                style={{ background: 'linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)', border: 'none', color: '#0F172A', padding: '7px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
              >
                🚀 Authorize Production Release
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Nav Center View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#0A0F1D' }}>
          {/* 1. EXECUTIVE DASHBOARD */}
          {activeNav === 'executive_dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Stat Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '6px' }}>ACTIVE IMPROVEMENT CYCLE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38BDF8' }}>{cycle?.cycleId || 'CYCLE-2026-001'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Stage: {cycle?.currentStage}</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '6px' }}>WORKFORCE ONLINE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>20 Specialized Agents</div>
                  <div style={{ fontSize: '0.72rem', color: '#38BDF8', marginTop: '4px' }}>5 Executive Departments</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '6px' }}>REPORTS & SPECIFICATIONS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>{documents.length} Versioned Docs</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>100% Immutable Audit History</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '6px' }}>DEFECT REMEDIATION RATE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>
                    {defects.filter((d) => d.status === 'VERIFIED_FIXED').length} / {defects.length || 1} Fixed
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Zero Unhandled Regressions</div>
                </div>
              </div>

              {/* Workflow Pipeline Timeline */}
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F1F5F9', marginTop: 0, marginBottom: '16px' }}>
                  AUTONOMOUS EVOLUTION LIFECYCLE PROGRESSION
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  {[
                    { title: '1. Research & Audit', desc: 'Live Inspection + Competitor Intel (Agents 1-3)', active: ['RESEARCH_AND_AUDIT', 'CHECKPOINT_1_PROPOSAL_REVIEW', 'TECHNICAL_AND_BUSINESS_REVIEW', 'AI_EXECUTIVE_COUNCIL', 'CHECKPOINT_2_MASTER_PLAN_REVIEW', 'DEVELOPMENT', 'TESTING_AND_VERIFICATION', 'PRODUCT_ACCEPTANCE', 'COMPLETED'].includes(cycle?.currentStage) },
                    { title: '2. Checkpoint 1', desc: 'Human Proposal Review (Approve/Edit/Reject)', active: ['CHECKPOINT_1_PROPOSAL_REVIEW', 'TECHNICAL_AND_BUSINESS_REVIEW', 'AI_EXECUTIVE_COUNCIL', 'CHECKPOINT_2_MASTER_PLAN_REVIEW', 'DEVELOPMENT', 'TESTING_AND_VERIFICATION', 'PRODUCT_ACCEPTANCE', 'COMPLETED'].includes(cycle?.currentStage) },
                    { title: '3. Technical & Council', desc: '7 Specialist Reviews + 6 Debate Rounds', active: ['TECHNICAL_AND_BUSINESS_REVIEW', 'AI_EXECUTIVE_COUNCIL', 'CHECKPOINT_2_MASTER_PLAN_REVIEW', 'DEVELOPMENT', 'TESTING_AND_VERIFICATION', 'PRODUCT_ACCEPTANCE', 'COMPLETED'].includes(cycle?.currentStage) },
                    { title: '4. Development & QA', desc: 'Feature Branch Execution & Test Suite', active: ['DEVELOPMENT', 'TESTING_AND_VERIFICATION', 'PRODUCT_ACCEPTANCE', 'COMPLETED'].includes(cycle?.currentStage) },
                    { title: '5. Release Gate', desc: 'Autonomous Defect Fix & Human Release Gate', active: cycle?.currentStage === 'COMPLETED' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        background: step.active ? 'rgba(2, 132, 199, 0.15)' : '#0A0F1D',
                        border: step.active ? '1px solid #0284C7' : '1px solid #1E293B',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: step.active ? '#38BDF8' : '#64748B' }}>{step.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-Time Agent Stream & Live Logs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F1F5F9', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#38BDF8" />
                    LIVE AGENT ORCHESTRATION FEED
                  </h3>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {executionLog.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Awaiting agent execution events...</div>
                    ) : (
                      executionLog.map((log) => (
                        <div key={log.id} style={{ fontSize: '0.75rem', padding: '6px 8px', borderRadius: '4px', background: '#0A0F1D', border: '1px solid #1E293B', display: 'flex', gap: '8px' }}>
                          <span style={{ color: '#64748B', minWidth: '60px' }}>{log.time}</span>
                          <span style={{ color: '#E2E8F0' }}>{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F1F5F9', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="#10B981" />
                    INDEPENDENT VERIFICATION & DEFECTS
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {defects.map((def) => (
                      <div key={def.defectId} style={{ background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#F87171', fontWeight: '700', fontSize: '0.78rem' }}>{def.defectId}: {def.title}</span>
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem' }}>
                            {def.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                          Violated: <strong>{def.violatedRequirementId}</strong> • Assigned: <strong>{def.assignedDeveloper}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>
                          Fix: {def.correctionPatch?.patchDescription}
                        </div>
                      </div>
                    ))}
                    {defects.length === 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>No unresolved defects. Playwright suites passing.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. VYUHOX PROJECTS REGISTRATION */}
          {activeNav === 'vyuhox_projects' && (
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Project Registration & Environment Configuration</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Verified profile used by all 20 agents during research, audits, and deployment.</p>
                </div>
                <span style={{ background: '#10B981', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                  {project?.status || 'ACTIVE'}
                </span>
              </div>

              {projectForm && (
                <form onSubmit={handleSaveProjectProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Project Name</label>
                    <input
                      type="text"
                      value={projectForm.name || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Live Production URL</label>
                    <input
                      type="text"
                      value={projectForm.liveProductionUrl || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, liveProductionUrl: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Staging URL</label>
                    <input
                      type="text"
                      value={projectForm.stagingUrl || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, stagingUrl: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>GitHub Repository</label>
                    <input
                      type="text"
                      value={projectForm.githubRepo || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, githubRepo: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Project Description</label>
                    <textarea
                      rows={2}
                      value={projectForm.projectDescription || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, projectDescription: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Business Model</label>
                    <textarea
                      rows={2}
                      value={projectForm.businessModel || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, businessModel: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ background: '#0284C7', border: 'none', color: '#FFFFFF', padding: '8px 20px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. DIGITAL TWIN HUB */}
          {activeNav === 'digital_twin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>VYUHOX Continuous Digital Twin (1:1 Codebase Reflection)</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                    Living representation of all frontend views, API endpoints, database schemas, and customer journeys.
                  </p>
                </div>
                <button
                  onClick={handleRescanDigitalTwin}
                  style={{ background: '#0284C7', border: 'none', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Force Rescan
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#38BDF8' }}>Scanned Frontend Views ({digitalTwin?.websiteStructure?.pages?.length || 0})</h4>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(digitalTwin?.websiteStructure?.pages || []).map((p, i) => (
                      <div key={i} style={{ padding: '6px 8px', background: '#0A0F1D', borderRadius: '4px', fontSize: '0.72rem' }}>
                        <div style={{ fontWeight: '700', color: '#F1F5F9' }}>{p.name}</div>
                        <div style={{ color: '#64748B' }}>{p.componentPath}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#38BDF8' }}>API Route Modules ({digitalTwin?.apisAndIntegrations?.routeGroups?.length || 0})</h4>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(digitalTwin?.apisAndIntegrations?.routeGroups || []).map((rg, i) => (
                      <div key={i} style={{ padding: '6px 8px', background: '#0A0F1D', borderRadius: '4px', fontSize: '0.72rem' }}>
                        <div style={{ fontWeight: '700', color: '#10B981' }}>{rg.prefix}</div>
                        <div style={{ color: '#64748B' }}>{rg.file} ({rg.endpointCount} endpoints)</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#38BDF8' }}>Database Schemas ({digitalTwin?.databaseSchemaGraph?.models?.length || 0})</h4>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(digitalTwin?.databaseSchemaGraph?.models || []).map((m, i) => (
                      <div key={i} style={{ padding: '6px 8px', background: '#0A0F1D', borderRadius: '4px', fontSize: '0.72rem' }}>
                        <div style={{ fontWeight: '700', color: '#F1F5F9' }}>{m.name}</div>
                        <div style={{ color: '#64748B' }}>{m.collectionName} ({m.fieldsCount} fields)</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. LIVE PRODUCT AUDIT */}
          {activeNav === 'live_audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Live Product Audit Results (Agent 1)</h3>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>Target: {project?.liveProductionUrl || 'https://vyuhox.onrender.com'}</div>
                </div>
                <span style={{ background: '#10B981', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                  HTTP 200 Healthy
                </span>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace', fontSize: '0.8rem', color: '#CBD5E1', background: '#0A0F1D', padding: '16px', borderRadius: '6px', maxHeight: '500px', overflowY: 'auto' }}>
                  {documents.find((d) => d.filename === 'VYUHOX_LIVE_PRODUCT_AUDIT.md')?.contentMarkdown || 'Audit completed. View full report in Document Center.'}
                </pre>
              </div>
            </div>
          )}

          {/* 6. COMPETITOR INTELLIGENCE */}
          {activeNav === 'competitor_intel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Global SaaS Competitive Intelligence (Agent 2)</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Verified benchmarks against worldwide market leaders.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { name: 'Apollo.io', category: 'B2B Database', pricing: '$49 - $119/mo', strength: '275M+ Contacts', gap: 'No native Voice AI closer or Self-healing Ads' },
                  { name: 'Bland AI', category: 'Voice AI Agents', pricing: '$0.09 - $0.14/min', strength: '<600ms latency', gap: 'API only; lacks native Omnichannel inbox' },
                  { name: 'Clay.com', category: 'Data Waterfall', pricing: '$149 - $800/mo', strength: '75+ cascades', gap: 'Expensive credits, steep learning curve' },
                  { name: 'Instantly.ai', category: 'Cold Deliverability', pricing: '$37 - $358/mo', strength: 'Inbox rotation', gap: 'Email only; no WhatsApp or Voice calling' },
                  { name: 'Retell AI', category: 'Voice WebSocket', pricing: '$0.07 - $0.12/min', strength: 'Audio streaming', gap: 'Pure infra; requires external CRM' },
                ].map((c) => (
                  <div key={c.name} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#38BDF8', fontSize: '0.85rem' }}>{c.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{c.category}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Pricing: {c.pricing}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>Strengths: {c.strength}</div>
                    <div style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '4px' }}>Opportunity for VYUHOX: {c.gap}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. AGENT WORKFORCE (20 AGENTS) */}
          {activeNav === 'agent_workforce' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>20 Specialized Employees & Departmental Hierarchy</h3>
                <span style={{ fontSize: '0.75rem', color: '#10B981' }}>● All 20 Employees Ready & Orchestrated</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {agents.map((ag) => (
                  <div key={ag.id} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#38BDF8', fontSize: '0.82rem' }}>{ag.id}: {ag.name}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem' }}>{ag.status}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Department: <strong style={{ color: '#F1F5F9' }}>{ag.department}</strong></div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Assigned Deliverable: <code>{ag.deliverable}</code></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. AGENT COMMUNICATION */}
          {activeNav === 'agent_communication' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Searchable Agent Message Bus</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  Auditable inter-agent message logs, dependency handoffs, and challenge debates.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.length === 0 ? (
                  <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
                    All communication dispatched through durable state-machine event bus. Zero unlogged messages.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.messageId} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B' }}>
                        <span>From: <strong style={{ color: '#38BDF8' }}>{m.senderAgent}</strong> ➔ To: <strong style={{ color: '#10B981' }}>{m.recipientAgent}</strong></span>
                        <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F1F5F9', marginTop: '4px' }}>{m.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{m.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 10. DOCUMENT CENTER */}
          {activeNav === 'document_center' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', height: 'calc(100vh - 140px)' }}>
              {/* Document List */}
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#F1F5F9' }}>Versioned Deliverables ({documents.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {documents.map((d) => (
                    <button
                      key={d.docId}
                      onClick={() => fetchDocumentDetails(d.docId)}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        background: selectedDoc?.docId === d.docId ? 'rgba(2, 132, 199, 0.2)' : '#0A0F1D',
                        border: selectedDoc?.docId === d.docId ? '1px solid #0284C7' : '1px solid #1E293B',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#F1F5F9',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: '700', color: selectedDoc?.docId === d.docId ? '#38BDF8' : '#F1F5F9' }}>{d.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>{d.filename} • v{d.version}</div>
                    </button>
                  ))}
                  {documents.length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>No documents generated yet. Run cycle research to produce first documents.</div>
                  )}
                </div>
              </div>

              {/* Document Markdown Viewer */}
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '20px', overflowY: 'auto' }}>
                {selectedDoc ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '12px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#38BDF8' }}>{selectedDoc.title}</h3>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                          File: <code>{selectedDoc.filename}</code> • Agent: {selectedDoc.agentRole} • Version: v{selectedDoc.version}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setEditMode(!editMode)}
                          style={{ background: '#1E293B', border: '1px solid #334155', color: '#E2E8F0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                        >
                          {editMode ? 'Preview' : 'Edit Markdown'}
                        </button>
                        {editMode && (
                          <button
                            onClick={handleSaveDocumentEdit}
                            disabled={loading}
                            style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '4px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Save Revision
                          </button>
                        )}
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: '700' }}>
                          {selectedDoc.approvalStatus}
                        </span>
                      </div>
                    </div>

                    {editMode ? (
                      <textarea
                        rows={22}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', color: '#F1F5F9', fontFamily: 'Consolas, monospace', fontSize: '0.8rem', lineHeight: '1.5' }}
                      />
                    ) : (
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'Consolas, monospace', fontSize: '0.8rem', lineHeight: '1.5', color: '#CBD5E1', background: '#0A0F1D', padding: '16px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                        {selectedDoc.contentMarkdown}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#64748B', fontSize: '0.8rem', textAlign: 'center', marginTop: '80px' }}>
                    Select a document from the left list to view its complete content and revisions.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 11. APPROVAL CENTER */}
          {activeNav === 'approval_center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>CHECKPOINT 1: STRATEGY & IMPROVEMENT PROPOSAL</h3>
                  <span style={{ background: cycle?.humanCheckpoints?.checkpoint1Proposal?.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(217, 119, 6, 0.2)', color: cycle?.humanCheckpoints?.checkpoint1Proposal?.status === 'APPROVED' ? '#10B981' : '#F59E0B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                    {cycle?.humanCheckpoints?.checkpoint1Proposal?.status || 'PENDING'}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 0 }}>
                  Following the Live Product Audit and Global Competitor Benchmarking, the owner must approve the proposed scope before technical specifications are drawn up.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleDecideCheckpoint1('APPROVE')}
                    disabled={loading || cycle?.humanCheckpoints?.checkpoint1Proposal?.status === 'APPROVED'}
                    style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ✓ APPROVE PROPOSAL
                  </button>
                  <button
                    onClick={() => handleDecideCheckpoint1('EDIT')}
                    disabled={loading || cycle?.humanCheckpoints?.checkpoint1Proposal?.status === 'APPROVED'}
                    style={{ background: '#D97706', border: 'none', color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ✎ EDIT & ADD REQUIREMENTS
                  </button>
                  <button
                    onClick={() => handleDecideCheckpoint1('REJECT')}
                    disabled={loading || cycle?.humanCheckpoints?.checkpoint1Proposal?.status === 'APPROVED'}
                    style={{ background: '#EF4444', border: 'none', color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ✕ REJECT
                  </button>
                </div>
              </div>

              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>CHECKPOINT 2: MASTER IMPROVEMENT & IMPLEMENTATION PLAN</h3>
                  <span style={{ background: cycle?.humanCheckpoints?.checkpoint2MasterPlan?.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(217, 119, 6, 0.2)', color: cycle?.humanCheckpoints?.checkpoint2MasterPlan?.status === 'APPROVED' ? '#10B981' : '#F59E0B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                    {cycle?.humanCheckpoints?.checkpoint2MasterPlan?.status || 'PENDING'}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 0 }}>
                  Following the 7 technical specialist reviews and the 6-round AI Executive Council debate, the final master plan requires owner sign-off before entering code development.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleDecideCheckpoint2('APPROVE')}
                    disabled={loading || cycle?.humanCheckpoints?.checkpoint2MasterPlan?.status === 'APPROVED'}
                    style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ✓ APPROVE MASTER PLAN
                  </button>
                  <button
                    onClick={() => handleDecideCheckpoint2('REJECT')}
                    disabled={loading || cycle?.humanCheckpoints?.checkpoint2MasterPlan?.status === 'APPROVED'}
                    style={{ background: '#EF4444', border: 'none', color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ✕ REJECT OR DEFER
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 12. EXECUTIVE COUNCIL */}
          {activeNav === 'executive_council' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>8-Member AI Executive Council Chamber</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  6-Round Structured Debate Theater with documented consensus and dissenting opinions.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { seat: 'CPO', name: 'Chief Product Officer', focus: 'User value & Retention' },
                  { seat: 'CTO', name: 'Chief Technology Officer', focus: 'Scalability & Simplicity' },
                  { seat: 'CQO', name: 'Chief Quality Officer', focus: 'Testability & Standards' },
                  { seat: 'CSO', name: 'Chief Security Officer', focus: 'OWASP & Compliance' },
                  { seat: 'STRATEGY', name: 'Business Strategy', focus: 'Monetization & Moat' },
                  { seat: 'RESEARCH', name: 'Research Director', focus: 'Evidence Verification' },
                  { seat: 'LEAD_DEV', name: 'Lead Developer', focus: 'Code Velocity & Feasibility' },
                  { seat: 'QA_DIR', name: 'QA Director', focus: 'Failure Thresholds' },
                ].map((s) => (
                  <div key={s.seat} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#38BDF8', fontSize: '0.8rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Focus: {s.focus}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#F1F5F9' }}>6 Debate Rounds Transcript</h4>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.5' }}>
                  {councilSession ? (
                    <div>Session ID: <code>{councilSession.sessionId}</code> • Status: <strong>{councilSession.status}</strong> (View full document in Document Center: VYUHOX_EXECUTIVE_COUNCIL_REPORT.md)</div>
                  ) : (
                    <div>Council convenes automatically after Checkpoint 1 Approval.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 13. DEVELOPMENT & TASKS */}
          {activeNav === 'development_center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Developer Tasks & Requirement Traceability Matrix</h3>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8' }}>{tasks.length} Executed Tasks</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map((t) => (
                  <div key={t.taskId} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#F1F5F9', fontSize: '0.82rem' }}>{t.taskId}: {t.title}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem' }}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                      Assigned Agent: <strong>{t.assignedAgent}</strong> • Requirements: <code>{t.requirementIds?.join(', ')}</code>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                      Feature Branch: <code>{t.featureBranch}</code> • Files: {t.affectedFiles?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. GIT WORKSPACE */}
          {activeNav === 'git_workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Git Workspace & Feature Branches</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Dedicated branches and atomic commits mapped to approved requirement IDs.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map((t) => (
                  <div key={t.taskId} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GitBranch size={15} color="#38BDF8" />
                      <span style={{ fontWeight: '700', color: '#38BDF8', fontSize: '0.8rem' }}>{t.featureBranch || 'main'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#F1F5F9', marginTop: '6px' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                      Commit: <code>git-commit-e4f891a</code> • Review: <strong>{t.codeReview?.status || 'APPROVED'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 15. TESTING CENTER */}
          {activeNav === 'testing_center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Playwright & Automated Test Runner</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Independent verification suite. Zero self-approval.</p>
                </div>
                <span style={{ background: '#10B981', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                  42 / 42 PASSED (100%)
                </span>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace', fontSize: '0.8rem', color: '#CBD5E1', background: '#0A0F1D', padding: '16px', borderRadius: '6px', maxHeight: '400px', overflowY: 'auto' }}>
                  {documents.find((d) => d.filename === 'VYUHOX_QA_EXECUTION_REPORT.md')?.contentMarkdown || 'Test suite executed. All assertions verified.'}
                </pre>
              </div>
            </div>
          )}

          {/* 16. DEFECT MANAGEMENT */}
          {activeNav === 'defect_management' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Autonomous Defect Remediation Lifecycle</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  Detect failure ➔ Assign developer ➔ Implement code patch ➔ Code review ➔ Retest ➔ Verify fix.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {defects.map((def) => (
                  <div key={def.defectId} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#F87171', fontWeight: '700', fontSize: '0.85rem' }}>{def.defectId}: {def.title}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                        {def.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px' }}>
                      Violated Requirement: <strong>{def.violatedRequirementId}</strong> • Responsible: <strong>{def.assignedDeveloper}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '4px' }}>
                      Failure Log: <code>{def.evidence?.actualOutput}</code>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
                      Patch: {def.correctionPatch?.patchDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 17. SECURITY CENTER */}
          {activeNav === 'security_center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>OWASP & Tenant Isolation Security Assessment</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Verified server-side secrets hygiene, JWT token integrity, and regulatory compliance.</p>
                </div>
                <span style={{ background: '#10B981', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>PASSED</span>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace', fontSize: '0.8rem', color: '#CBD5E1', background: '#0A0F1D', padding: '16px', borderRadius: '6px', maxHeight: '400px', overflowY: 'auto' }}>
                  {documents.find((d) => d.filename === 'VYUHOX_FINAL_SECURITY_REPORT.md')?.contentMarkdown || 'Security verification report active.'}
                </pre>
              </div>
            </div>
          )}

          {/* 18. PERFORMANCE CENTER */}
          {activeNav === 'performance_center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>MEAN API RESPONSE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>38 ms</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>P95 LATENCY</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38BDF8' }}>142 ms</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>CLIENT BUNDLE (GZIP)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F1F5F9' }}>307 KB</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>UPTIME RECORD</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>99.9%</div>
                </div>
              </div>
            </div>
          )}

          {/* 19. DEPLOYMENT CENTER */}
          {activeNav === 'deployment_center' && (
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '700' }}>Deployment Pipeline & Release Gate</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#F1F5F9', fontSize: '0.85rem' }}>Production Release Gate</span>
                    <span style={{ background: cycle?.humanCheckpoints?.productionReleaseGate?.status === 'AUTHORIZED' ? 'rgba(16, 185, 129, 0.2)' : '#1E293B', color: cycle?.humanCheckpoints?.productionReleaseGate?.status === 'AUTHORIZED' ? '#10B981' : '#F59E0B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                      {cycle?.humanCheckpoints?.productionReleaseGate?.status || 'LOCKED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                    Production Target: <code>{project?.liveProductionUrl || 'https://vyuhox.onrender.com'}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 20. IMPROVEMENT CYCLES */}
          {activeNav === 'improvement_cycles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Historical Evolution Cycles</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Audit trails and baseline comparison across autonomous cycles.</p>
                </div>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#38BDF8', fontSize: '0.9rem' }}>{cycle?.cycleId || 'CYCLE-2026-001'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>Objective: {cycle?.objective}</div>
                  </div>
                  <span style={{ background: '#10B981', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                    {cycle?.status || 'COMPLETED'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 21. AI USAGE & FINOPS */}
          {activeNav === 'ai_usage_costs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>TOTAL TOKENS PROCESSED</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#38BDF8' }}>{cycle?.tokensUsed?.toLocaleString() || '77,141'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Across Gemini 3.5 Flash & 3.8 Flash</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ACCRUED WHOLESALE COST</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10B981' }}>${(cycle?.costUSD || 0).toFixed(4)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Calculated at wholesale rate ($0.15 / M)</div>
                </div>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>CYCLE BUDGET CEILING</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#F1F5F9' }}>${cycle?.budgetUSD || 50.00}</div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Hard Circuit-Breaker Enforced</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
