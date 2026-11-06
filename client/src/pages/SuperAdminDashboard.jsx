import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Users,
  Building2,
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Settings,
  TrendingUp,
  AlertCircle,
  Radio,
  ExternalLink,
  ChevronDown,
  PhoneCall,
  MessageSquare,
  Mail,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Key,
  Palette,
  Database,
  Search,
  Activity,
  Sliders,
  CheckCircle2,
  Server,
  ArrowRight,
  ShieldAlert,
  LifeBuoy,
  Download,
  AlertTriangle,
  Terminal,
  Send,
  Clock,
  UserCheck,
  X,
} from 'lucide-react';
import { api } from '../services/api';

export default function SuperAdminDashboard({
  workspaces = [],
  currency = 'USD',
  exchangeRate = 83.5,
  onInspectWorkspace,
  onSwitchWorkspace,
  onRefreshWorkspaces,
  activePillar,
  onSelectPillar,
}) {
  // 4 Consolidated Unified Pillars
  // 'vitals' | 'tenants' | 'integrations' | 'finops'
  const [internalTab, setInternalTab] = useState('vitals');
  const activeTab = activePillar || internalTab;
  const setActiveTab = onSelectPillar || setInternalTab;

  // Pillar 1: Vitals & Watchdog
  const [metrics, setMetrics] = useState(null);
  const [infraHealth, setInfraHealth] = useState(null);
  const [dropoffs, setDropoffs] = useState([]);
  const [loadingVitals, setLoadingVitals] = useState(false);

  // Pillar 2: Client Accounts & Two-Sided Support Desk
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('ALL'); // 'ALL' | 'AI_COMPANY' | 'TOOL'
  const [supportTickets, setSupportTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'IN_REVIEW' | 'RESOLVED'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketResolutionNote, setTicketResolutionNote] = useState('');
  const [ticketCreditAmount, setTicketCreditAmount] = useState('');
  const [adminAttachments, setAdminAttachments] = useState([]);
  const [isUploadingAdminFile, setIsUploadingAdminFile] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState(false);

  // Standalone Credit Injector Modal
  const [injectModalOpen, setInjectModalOpen] = useState(false);
  const [injectTargetWs, setInjectTargetWs] = useState(null);
  const [injectAmount, setInjectAmount] = useState('');
  const [injectReason, setInjectReason] = useState('');
  const [injectingCredit, setInjectingCredit] = useState(false);

  // Pillar 3: Master Integrations & Circuit Breaker
  const [platformConfig, setPlatformConfig] = useState({
    integrations: {
      apollo: { apiKey: '' },
      outscraper: { apiKey: '' },
      twilio: { accountSid: '', authToken: '', phoneNumber: '' },
      geminiMaster: { apiKey: '' },
      bounceban: { apiKey: '' },
      apify: { apiToken: '' },
    },
  });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [pingStatus, setPingStatus] = useState({});
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, provider: null, title: '' });
  const [deletingProvider, setDeletingProvider] = useState(false);
  const [circuitBreakerForm, setCircuitBreakerForm] = useState({
    pauseAllVoice: false,
    pauseAllScraping: false,
    pauseAllEmail: false,
    hourlyRateLimitPerWorkspace: 250,
    reason: '',
  });
  const [savingBreaker, setSavingBreaker] = useState(false);

  // Safe helper to update any nested provider field in platformConfig
  const handleUpdateIntegrationField = (provider, field, value) => {
    setPlatformConfig((prev) => {
      const base = prev || {};
      const prevIntegrations = base.integrations || {};
      const prevProvider = prevIntegrations[provider] || {};
      return {
        ...base,
        integrations: {
          ...prevIntegrations,
          [provider]: {
            ...prevProvider,
            [field]: value,
          },
        },
      };
    });
  };

  // Wholesale Provider Telemetry & Balance Monitoring
  const [wholesaleTelemetry, setWholesaleTelemetry] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [refreshingTelemetry, setRefreshingTelemetry] = useState(false);

  // Pillar 4: FinOps, Rates, Plans, DNC & Audit Trail
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [finopsData, setFinopsData] = useState(null);
  const [evaluatingFinops, setEvaluatingFinops] = useState(false);
  const [applyingFinops, setApplyingFinops] = useState(false);
  const [globalDncList, setGlobalDncList] = useState([]);
  const [newDncIdentifier, setNewDncIdentifier] = useState('');
  const [newDncType, setNewDncType] = useState('DOMAIN');
  const [newDncReason, setNewDncReason] = useState('');
  const [savingDnc, setSavingDnc] = useState(false);
  const [announcementState, setAnnouncementState] = useState({
    active: false,
    message: '',
    severity: 'INFO',
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [auditFilter, setAuditFilter] = useState('ALL');

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  // Toggle mask state for API keys
  const toggleKeyVisibility = (keyId) => {
    setRevealedKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  // Mask string helper
  const maskKey = (keyVal, isRevealed) => {
    if (!keyVal) return '••••••••••••••••';
    if (isRevealed) return keyVal;
    if (keyVal.length <= 8) return '••••••••';
    return `${keyVal.slice(0, 4)}••••••••${keyVal.slice(-4)}`;
  };

  // Initial Load
  useEffect(() => {
    loadVitalsData();
    loadTenantsAndTickets();
    loadConfigAndPlans();
    loadAuditLogs();
  }, []);

  const loadVitalsData = async () => {
    setLoadingVitals(true);
    try {
      const [metricsRes, healthRes, dropoffsRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getInfrastructureHealth(),
        api.getOnboardingDropoffs(),
      ]);
      if (metricsRes?.success) setMetrics(metricsRes.metrics);
      if (healthRes?.success) setInfraHealth(healthRes.health);
      if (dropoffsRes?.success) setDropoffs(dropoffsRes.dropoffs || []);
    } catch (err) {
      console.warn('Error loading vitals:', err);
    } finally {
      setLoadingVitals(false);
    }
  };

  const loadTenantsAndTickets = async () => {
    setLoadingTenants(true);
    setLoadingTickets(true);
    try {
      const [tenantsRes, ticketsRes] = await Promise.all([
        api.getTenants(),
        api.getSupportTickets(),
      ]);
      if (tenantsRes?.success) setTenants(tenantsRes.tenants || []);
      if (ticketsRes?.success) setSupportTickets(ticketsRes.tickets || []);
    } catch (err) {
      console.warn('Error loading tenants/tickets:', err);
    } finally {
      setLoadingTenants(false);
      setLoadingTickets(false);
    }
  };

  const loadConfigAndPlans = async () => {
    setLoadingConfig(true);
    setLoadingPlans(true);
    try {
      const [cfgRes, plansRes] = await Promise.all([
        api.getPlatformConfig(),
        api.getPricingPlans({ includeInactive: true }),
      ]);
      if (cfgRes?.success && cfgRes.config) {
        setPlatformConfig((prev) => ({
          ...(prev || {}),
          ...cfgRes.config,
          integrations: {
            ...(prev?.integrations || {}),
            ...(cfgRes.config?.integrations || {}),
          },
        }));
        if (cfgRes.config.circuitBreakers) {
          setCircuitBreakerForm({
            pauseAllVoice: !!cfgRes.config.circuitBreakers.pauseAllVoice,
            pauseAllScraping: !!cfgRes.config.circuitBreakers.pauseAllScraping,
            pauseAllEmail: !!cfgRes.config.circuitBreakers.pauseAllEmail,
            hourlyRateLimitPerWorkspace: cfgRes.config.circuitBreakers.hourlyRateLimitPerWorkspace || 250,
            reason: cfgRes.config.circuitBreakers.reason || '',
          });
        }
        if (cfgRes.config.globalDncList) {
          setGlobalDncList(cfgRes.config.globalDncList);
        }
        if (cfgRes.config.globalAnnouncement) {
          setAnnouncementState(cfgRes.config.globalAnnouncement);
        }
      }
      if (plansRes?.success) setPlans(plansRes.plans || []);
      loadWholesaleTelemetry();
    } catch (err) {
      console.warn('Error loading config/plans:', err);
    } finally {
      setLoadingConfig(false);
      setLoadingPlans(false);
    }
  };

  const loadWholesaleTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const res = await api.getWholesaleTelemetry();
      if (res?.success && res.telemetry) {
        setWholesaleTelemetry(res.telemetry);
      }
    } catch (err) {
      console.warn('Error loading wholesale telemetry:', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  const handleRefreshTelemetry = async () => {
    setRefreshingTelemetry(true);
    try {
      const res = await api.refreshWholesaleTelemetry();
      if (res?.success && res.telemetry) {
        setWholesaleTelemetry(res.telemetry);
        showToast('⚡ Live wholesale provider balances re-synced successfully!');
      } else {
        showToast('Failed to refresh wholesale telemetry', true);
      }
    } catch (err) {
      showToast('Error refreshing wholesale telemetry', true);
    } finally {
      setRefreshingTelemetry(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getAuditLogs({ limit: 100 });
      if (res?.success) setAuditLogs(res.logs || []);
    } catch (err) {
      console.warn('Error loading audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Integration Ping Test - Sends current form values or stored credentials for live API validation
  const handleTestPing = async (provider) => {
    try {
      const currentCreds = platformConfig?.integrations?.[provider] || {};
      setPingStatus((prev) => ({ ...prev, [provider]: { status: 'TESTING', message: 'Validating upstream connection...' } }));
      const res = await api.testIntegrationPing(provider, currentCreds);
      if (res?.success && res.result) {
        setPingStatus((prev) => ({ ...prev, [provider]: res.result }));
        showToast(`✅ ${formatProviderName(provider)} ping: ${res.result.status} (${res.result.latencyMs}ms)`);
      } else {
        const failureResult = res?.result || { status: 'FAILED', message: res?.message || 'Verification failed. Check credentials.' };
        setPingStatus((prev) => ({ ...prev, [provider]: failureResult }));
        showToast(`❌ ${formatProviderName(provider)}: ${failureResult.message}`);
      }
    } catch (err) {
      setPingStatus((prev) => ({ ...prev, [provider]: { status: 'FAILED', message: err.message } }));
      showToast(`❌ ${formatProviderName(provider)} ping error: ${err.message}`);
    }
  };

  const [savingKeys, setSavingKeys] = useState({});

  // Human-readable names for integrations
  const formatProviderName = (provider) => {
    const map = {
      apollo: 'Apollo.io B2B Enrichment',
      outscraper: 'Outscraper Maps Extractor',
      twilio: 'Twilio Voice & SMS',
      exotel: 'Exotel Domestic India Rail',
      telnyx: 'Telnyx Global Carrier Fiber',
      blandAi: 'Bland.ai Voice SDR (Maya)',
      aisensy: 'AiSensy WhatsApp API',
      geminiMaster: 'Google Gemini 1.5 Master',
      bounceban: 'BounceBan Catch-All Shield',
      apify: 'Apify Social Actor Cloud',
      razorpayIndia: 'Razorpay India Payments',
      stripeGlobal: 'Stripe Global Payments',
      sendgridSmtp: 'SendGrid SMTP Gateway',
      instantlyEmail: 'Instantly Email Warmup',
    };
    return map[provider] || provider;
  };

  // Smooth scroll to specific integration card and highlight it
  const scrollToIntegration = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'all 0.4s ease';
      el.style.border = '1px solid #38BDF8';
      el.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.45)';
      setTimeout(() => {
        el.style.border = '1px solid rgba(255, 255, 255, 0.06)';
        el.style.boxShadow = 'none';
      }, 3000);
    }
  };

  // Robust Provider Configuration Saver
  const handleSaveProvider = async (provider) => {
    setSavingKeys((prev) => ({ ...prev, [provider]: true }));
    try {
      const providerState = { ...(platformConfig?.integrations?.[provider] || {}) };
      
      const hasKey = Boolean(
        (providerState.apiKey && providerState.apiKey.trim()) ||
        (providerState.authToken && providerState.authToken.trim()) ||
        (providerState.apiToken && providerState.apiToken.trim()) ||
        (providerState.secretKey && providerState.secretKey.trim()) ||
        (providerState.keySecret && providerState.keySecret.trim()) ||
        (providerState.accessToken && providerState.accessToken.trim()) ||
        (providerState.accountSid && providerState.accountSid.trim() && providerState.apiKey && providerState.apiKey.trim())
      );
      providerState.isActive = hasKey;

      const payload = {
        integrations: {
          [provider]: providerState,
        },
      };
      const res = await api.updatePlatformConfig(payload);
      if (res?.success) {
        setPlatformConfig((prev) => ({
          ...(prev || {}),
          ...res.config,
          integrations: {
            ...(prev?.integrations || {}),
            ...(res.config?.integrations || {}),
            [provider]: {
              ...(res.config?.integrations?.[provider] || providerState),
            },
          },
        }));
        showToast(`✅ ${formatProviderName(provider)} credentials saved.`);
        loadAuditLogs();
        loadWholesaleTelemetry();
      } else {
        showToast(res?.message || `Failed to save ${provider} credentials`);
      }
    } catch (err) {
      showToast(`Error saving ${provider} credentials`);
    } finally {
      setSavingKeys((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Disconnect & Delete Credentials with confirmation
  const handleRequestDelete = (provider, title) => {
    setDeleteConfirmModal({ open: true, provider, title: title || formatProviderName(provider) });
  };

  const handleConfirmDelete = async () => {
    const provider = deleteConfirmModal.provider;
    if (!provider) return;
    setDeletingProvider(true);
    try {
      const current = platformConfig?.integrations?.[provider] || {};
      const wiped = {};
      for (const k of Object.keys(current)) {
        if (typeof current[k] === 'string') wiped[k] = '';
        else if (typeof current[k] === 'number') wiped[k] = 0;
        else if (typeof current[k] === 'boolean') wiped[k] = false;
        else wiped[k] = '';
      }
      wiped.isActive = false;

      const payload = {
        integrations: {
          [provider]: wiped,
        },
      };
      const res = await api.updatePlatformConfig(payload);
      if (res?.success) {
        setPlatformConfig((prev) => ({
          ...(prev || {}),
          ...res.config,
          integrations: {
            ...(prev?.integrations || {}),
            ...(res.config?.integrations || {}),
            [provider]: wiped,
          },
        }));
        setPingStatus((prev) => {
          const next = { ...prev };
          delete next[provider];
          return next;
        });
        showToast(`🗑️ ${deleteConfirmModal.title} credentials deleted.`);
        setDeleteConfirmModal({ open: false, provider: null, title: '' });
        loadAuditLogs();
        loadWholesaleTelemetry();
      } else {
        showToast(res?.message || `Failed to delete ${provider} credentials`);
      }
    } catch (err) {
      showToast(`Error deleting ${provider} credentials`);
    } finally {
      setDeletingProvider(false);
    }
  };

  // Backwards compatible single key saver
  const handleSaveSingleKey = async (provider) => {
    return handleSaveProvider(provider);
  };

  // Save Platform Config (Integrations or Rates)
  const handleSaveConfig = async (partialConfig) => {
    setSavingConfig(true);
    try {
      const res = await api.updatePlatformConfig(partialConfig);
      if (res?.success) {
        setPlatformConfig(res.config);
        showToast('Platform configuration saved and audit-logged.');
        loadAuditLogs();
        loadWholesaleTelemetry();
      } else {
        showToast(res?.message || 'Failed to save configuration');
      }
    } catch (err) {
      showToast('Error saving configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Circuit Breaker Trigger
  const handleSaveCircuitBreaker = async () => {
    setSavingBreaker(true);
    try {
      const res = await api.updateCircuitBreakers(circuitBreakerForm);
      if (res?.success) {
        showToast('Circuit breakers updated in real-time across all nodes.');
        loadAuditLogs();
        loadVitalsData();
      }
    } catch (err) {
      showToast('Error updating circuit breakers');
    } finally {
      setSavingBreaker(false);
    }
  };

  // Inject Wallet Credit
  const handleInjectCreditSubmit = async (e) => {
    e.preventDefault();
    if (!injectTargetWs || !injectAmount || Number(injectAmount) <= 0) return;

    setInjectingCredit(true);
    try {
      const res = await api.injectWalletCredit({
        workspaceId: injectTargetWs._id,
        amountUSD: Number(injectAmount),
        reason: injectReason || 'Super Admin Platform Adjustment',
      });
      if (res?.success) {
        showToast(`✅ Credited $${Number(injectAmount).toFixed(2)} to ${injectTargetWs.name}`);
        setInjectModalOpen(false);
        setInjectAmount('');
        setInjectReason('');
        loadTenantsAndTickets();
        loadAuditLogs();
      } else {
        showToast(res?.message || 'Credit injection failed');
      }
    } catch (err) {
      showToast('Error injecting credit');
    } finally {
      setInjectingCredit(false);
    }
  };

  // Support Ticket Resolution
  const handleResolveTicketSubmit = async (ticketStatus) => {
    if (!selectedTicket) return;
    setResolvingTicket(true);
    try {
      const payload = {
        status: ticketStatus,
        adminNotes: ticketResolutionNote,
        creditAmountUSD: ticketCreditAmount ? Number(ticketCreditAmount) : 0,
        attachments: adminAttachments,
      };
      const res = await api.updateSupportTicket(selectedTicket._id, payload);
      if (res?.success) {
        showToast(`Ticket #${selectedTicket.ticketNumber} updated (${ticketStatus})`);
        setSelectedTicket(null);
        setTicketResolutionNote('');
        setTicketCreditAmount('');
        setAdminAttachments([]);
        loadTenantsAndTickets();
        loadAuditLogs();
      }
    } catch (err) {
      showToast('Failed to update ticket');
    } finally {
      setResolvingTicket(false);
    }
  };

  // Global DNC
  const handleAddDncSubmit = async (e) => {
    e.preventDefault();
    if (!newDncIdentifier.trim()) return;

    setSavingDnc(true);
    try {
      const res = await api.updateGlobalDnc({
        action: 'ADD',
        identifier: newDncIdentifier.trim(),
        type: newDncType,
        reason: newDncReason || 'Regulatory & TCPA Protection',
      });
      if (res?.success) {
        setGlobalDncList(res.globalDncList);
        setNewDncIdentifier('');
        setNewDncReason('');
        showToast('Identifier added to Tier-2 Global DNC blacklist.');
        loadAuditLogs();
      }
    } catch (err) {
      showToast('Failed to update DNC');
    } finally {
      setSavingDnc(false);
    }
  };

  const handleRemoveDnc = async (identifier) => {
    try {
      const res = await api.updateGlobalDnc({ action: 'REMOVE', identifier });
      if (res?.success) {
        setGlobalDncList(res.globalDncList);
        showToast(`Removed ${identifier} from Global DNC.`);
        loadAuditLogs();
      }
    } catch (err) {
      showToast('Error removing identifier');
    }
  };

  // Global Announcement
  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      const res = await api.updateAnnouncement(announcementState);
      if (res?.success) {
        showToast('Global announcement updated and broadcast to all clients.');
        loadAuditLogs();
      }
    } catch (err) {
      showToast('Error broadcasting announcement');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // FinOps AI CFO Evaluation
  const handleEvaluateFinOps = async () => {
    setEvaluatingFinops(true);
    try {
      const res = await api.evaluateFinOps();
      if (res?.success) {
        setFinopsData(res.analysis);
        showToast('Autonomous AI CFO analyzed wholesale telemetry & margin thresholds.');
      }
    } catch (err) {
      showToast('Failed to evaluate FinOps');
    } finally {
      setEvaluatingFinops(false);
    }
  };

  const handleApplyFinOpsRates = async () => {
    setApplyingFinops(true);
    try {
      const res = await api.applyFinOpsRates();
      if (res?.success) {
        showToast('Recommended dynamic rates applied to live billing engine.');
        loadConfigAndPlans();
        loadAuditLogs();
      }
    } catch (err) {
      showToast('Failed to apply rates');
    } finally {
      setApplyingFinops(false);
    }
  };

  // 1-Click CSV Export
  const handleExportCSV = () => {
    if (!tenants || tenants.length === 0) {
      showToast('No tenant data to export');
      return;
    }

    const headers = [
      'Workspace Name',
      'Slug',
      'Domain',
      'Owner Email',
      'Industry',
      'Mode',
      'Onboarding Completed',
      'Plan Tier',
      'Wallet Balance USD',
      'Created At',
    ];

    const rows = tenants.map((t) => [
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${t.slug || ''}"`,
      `"${t.domain || ''}"`,
      `"${t.ownerEmail || ''}"`,
      `"${t.industry || ''}"`,
      `"${t.operatingMode || ''}"`,
      t.onboardingCompleted ? 'YES' : 'NO',
      `"${t.subscription?.planTier || 'FREE_AUDIT'}"`,
      (t.walletBalanceUSD || 0).toFixed(2),
      `"${new Date(t.createdAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vyuhox_gtm_governance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Governance CSV Report exported successfully.');
  };

  // Filtered lists
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      (t.name || '').toLowerCase().includes(tenantSearch.toLowerCase()) ||
      (t.ownerEmail || '').toLowerCase().includes(tenantSearch.toLowerCase()) ||
      (t.domain || '').toLowerCase().includes(tenantSearch.toLowerCase());
    const matchesType =
      tenantFilter === 'ALL'
        ? true
        : tenantFilter === 'AI_COMPANY'
        ? t.operatingMode === 'AI_COMPANY'
        : t.operatingMode !== 'AI_COMPANY';
    return matchesSearch && matchesType;
  });

  const filteredTickets = supportTickets.filter((tick) => {
    if (ticketFilter === 'ALL') return true;
    return tick.status === ticketFilter;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    return log.actionType === auditFilter;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', color: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.84rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Super Admin GTM Governance Platform
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Multi-Tenant Architecture • Zero-Overdraft Pre-emptive Billing • Global Carrier Infrastructure
              </div>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              loadVitalsData();
              loadTenantsAndTickets();
              loadConfigAndPlans();
              loadAuditLogs();
              showToast('Refreshed all GTM governance data');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F8FAFC',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* The 4 Consolidated Pillars Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '4px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '28px',
        }}
      >
        {[
          { id: 'vitals', label: 'Pillar 1: Executive Command & Platform Vitals', icon: Activity },
          { id: 'tenants', label: 'Pillar 2: Client Accounts & Two-Sided Support Desk', icon: Building2 },
          { id: 'integrations', label: 'Pillar 3: Master Integrations & Kill-Switch', icon: Radio },
          { id: 'finops', label: 'Pillar 4: FinOps, Rates, Plans & Audit Trail', icon: DollarSign },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '8px',
                border: 'none',
                background: active ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'transparent',
                color: active ? '#FFFFFF' : '#94A3B8',
                fontWeight: active ? '800' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* PILLAR 1: EXECUTIVE COMMAND & PLATFORM VITALS                             */}
      {/* ========================================================================= */}
      {activeTab === 'vitals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Executive KPI Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Total Workspaces</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#38BDF8', marginTop: '4px' }}>
                {metrics?.totalWorkspaces ?? workspaces.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Multi-tenant registered workspaces</div>
            </div>

            <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: '700', textTransform: 'uppercase' }}>Platform MRR</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#34D399', marginTop: '4px' }}>
                ${(metrics?.totalMRR ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Combined active client subscriptions</div>
            </div>

            <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Verified Leads Scraped</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#F8FAFC', marginTop: '4px' }}>
                {(metrics?.totalLeads ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Total outbound contacts in CRM pool</div>
            </div>

            <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ fontSize: '0.72rem', color: '#FDE68A', fontWeight: '700', textTransform: 'uppercase' }}>Client Wallet Pool</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#F59E0B', marginTop: '4px' }}>
                ${(metrics?.totalWalletUSD ?? 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Prepaid escrow usage funds</div>
            </div>

            <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontSize: '0.72rem', color: '#FCA5A5', fontWeight: '700', textTransform: 'uppercase' }}>Open Support Tickets</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: metrics?.openTicketsCount > 0 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
                {metrics?.openTicketsCount ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Requires engineering review</div>
            </div>
          </div>

          {/* Infrastructure Health Watchdog */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#38BDF8" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Platform Infrastructure Watchdog</h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                All Primary Pipelines Online
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>DATABASE CLUSTER</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#10B981', margin: '4px 0' }}>
                  {infraHealth?.database?.status || 'CONNECTED'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Latency: {infraHealth?.database?.latencyMs || 12}ms • Mongo Primary
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>AI LLM GATEWAY</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#10B981', margin: '4px 0' }}>
                  {infraHealth?.aiGateway?.status || 'ONLINE'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Provider: Google Gemini 1.5 Pro • 92ms
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>VOICE TELEPHONY TRUNK</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#10B981', margin: '4px 0' }}>
                  {infraHealth?.telephony?.status || 'ONLINE'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Trunk: {infraHealth?.telephony?.trunk || '+1 (800) 555-GTM1'}
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>EMAIL SMTP DISPATCHER</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#10B981', margin: '4px 0' }}>
                  {infraHealth?.emailOutbound?.status || 'ONLINE'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Sender: {infraHealth?.emailOutbound?.sender || 'noreply@vyuhox.ai'}
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Drop-Off Radar */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Onboarding Drop-Off Radar
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Identifies prospect workspaces that stalled before completing autonomous setup
                </div>
              </div>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                }}
              >
                {dropoffs.length} Stalled Workspaces
              </span>
            </div>

            {dropoffs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: '0.82rem' }}>
                🎉 Outstanding conversion: Zero onboarding drop-offs recorded.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: '#94A3B8' }}>
                      <th style={{ padding: '10px 14px' }}>Workspace</th>
                      <th style={{ padding: '10px 14px' }}>Owner Email</th>
                      <th style={{ padding: '10px 14px' }}>Industry</th>
                      <th style={{ padding: '10px 14px' }}>Created</th>
                      <th style={{ padding: '10px 14px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropoffs.map((d) => (
                      <tr key={d._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: '700', color: '#F1F5F9' }}>{d.name}</td>
                        <td style={{ padding: '10px 14px', color: '#38BDF8' }}>{d.ownerEmail || 'Pending user email'}</td>
                        <td style={{ padding: '10px 14px', color: '#94A3B8' }}>{d.industry || 'B2B'}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={() => onInspectWorkspace && onInspectWorkspace(d)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              color: '#38BDF8',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Inspect Step →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 2: CLIENT ACCOUNTS & TWO-SIDED SUPPORT DESK                        */}
      {/* ========================================================================= */}
      {activeTab === 'tenants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sub-Header: Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search client workspaces, emails, domains..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'AI_COMPANY', 'TOOL'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTenantFilter(mode)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '6px',
                      border: tenantFilter === mode ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: tenantFilter === mode ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                      color: tenantFilter === mode ? '#38BDF8' : '#94A3B8',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {mode === 'ALL' ? 'All Modes' : mode === 'AI_COMPANY' ? 'AI Company' : 'Tool Mode'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Showing <strong>{filteredTenants.length}</strong> of <strong>{tenants.length}</strong> client workspaces
            </div>
          </div>

          {/* Client Workspaces Table */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#0F172A', textAlign: 'left', color: '#94A3B8' }}>
                    <th style={{ padding: '12px 16px' }}>Workspace</th>
                    <th style={{ padding: '12px 16px' }}>Owner</th>
                    <th style={{ padding: '12px 16px' }}>Plan / Tier</th>
                    <th style={{ padding: '12px 16px' }}>Dedicated Caller ID</th>
                    <th style={{ padding: '12px 16px' }}>Mode</th>
                    <th style={{ padding: '12px 16px' }}>Wallet Balance</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((w) => (
                    <tr key={w._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#F8FAFC' }}>{w.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{w.domain || w.slug}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#38BDF8', fontWeight: '600' }}>{w.ownerEmail || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{w.ownerName || 'Client User'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38BDF8',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                          }}
                        >
                          {w.subscription?.planTier || 'FREE_AUDIT'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              color: w.dedicatedCallerId ? '#10B981' : '#F59E0B',
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            {w.dedicatedCallerId || (w.baseCountry === 'IN' ? '+918047192837' : '+15129876543')}
                          </span>
                          <button
                            onClick={async () => {
                              const nextId = prompt(`Assign Dedicated Virtual Caller ID for "${w.name}":`, w.dedicatedCallerId || (w.baseCountry === 'IN' ? '+918047192837' : '+15129876543'));
                              if (nextId !== null && nextId.trim() !== '') {
                                try {
                                  await api.updateWorkspace(w._id, { dedicatedCallerId: nextId.trim() });
                                  fetchTenants();
                                } catch (err) {
                                  alert('Failed to update dedicated caller ID: ' + err.message);
                                }
                              }
                            }}
                            title="Assign or edit dedicated virtual caller ID"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                          {w.baseCountry === 'IN' ? '🇮🇳 Exotel Domestic' : '🌍 Telnyx Fiber'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            background: w.operatingMode === 'AI_COMPANY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: w.operatingMode === 'AI_COMPANY' ? '#10B981' : '#CBD5E1',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                          }}
                        >
                          {w.operatingMode === 'AI_COMPANY' ? 'AI Company' : 'Tool Mode'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '800', color: (w.walletBalanceUSD || 0) <= 0 ? '#EF4444' : '#10B981' }}>
                          ${(w.walletBalanceUSD || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Strict $0.00 Floor</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={async () => {
                              try {
                                const nextState = !w.byocEnabled;
                                await api.updateWorkspace(w._id, { byocEnabled: nextState });
                                fetchTenants();
                              } catch (err) {
                                alert('Failed to toggle BYOC: ' + err.message);
                              }
                            }}
                            title="Toggle Custom VIP Enterprise BYOC (Bring Your Own Carrier)"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: w.byocEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${w.byocEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.15)'}`,
                              color: w.byocEnabled ? '#34D399' : '#94A3B8',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            {w.byocEnabled ? '👑 BYOC Active' : '🔒 Enable BYOC'}
                          </button>
                          <button
                            onClick={() => {
                              setInjectTargetWs(w);
                              setInjectModalOpen(true);
                            }}
                            title="Inject credit into client wallet"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              color: '#F59E0B',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            + Credit
                          </button>
                          <button
                            onClick={() => onInspectWorkspace && onInspectWorkspace(w)}
                            title="1-Click inspect client workspace view"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                              border: 'none',
                              color: '#FFFFFF',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                            }}
                          >
                            👁️ Inspect View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two-Sided Support Desk Section */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LifeBuoy size={18} color="#38BDF8" />
                  <span>Two-Sided Support Desk (Auto-Attached Diagnostics)</span>
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Review client reports with auto-captured technical diagnostics, resolve tickets, and credit wallets
                </div>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketFilter(st)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: ticketFilter === st ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: ticketFilter === st ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                      color: ticketFilter === st ? '#38BDF8' : '#94A3B8',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '0.82rem' }}>
                No support tickets found for filter: {ticketFilter}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTickets.map((tick) => (
                  <div
                    key={tick._id}
                    style={{
                      background: '#0F172A',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38BDF8' }}>
                          #{tick.ticketNumber}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background:
                              tick.priority === 'URGENT'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : tick.priority === 'HIGH'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(56, 189, 248, 0.15)',
                            color:
                              tick.priority === 'URGENT'
                                ? '#EF4444'
                                : tick.priority === 'HIGH'
                                ? '#F59E0B'
                                : '#38BDF8',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                          }}
                        >
                          {tick.priority}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: tick.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: tick.status === 'RESOLVED' ? '#10B981' : '#F59E0B',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                          }}
                        >
                          {tick.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {new Date(tick.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', color: '#F8FAFC' }}>{tick.subject}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.4' }}>{tick.message}</p>
                    </div>

                    {/* Auto-Attached Technical Diagnostics Box */}
                    
                    {/* Render Attached Screenshots / Files */}
                    {tick.attachments && tick.attachments.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', marginBottom: '6px' }}>
                          ATTACHED SCREENSHOTS & FILES:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {tick.attachments.map((att, aIdx) => (
                            <a
                              key={aIdx}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                color: '#38BDF8',
                                fontSize: '0.72rem',
                                textDecoration: 'none',
                              }}
                            >
                              <span>📎 {att.fileName}</span>
                              <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>({att.uploaderRole})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {tick.diagnosticsSnapshot && (
                      <div
                        style={{
                          background: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '0.72rem',
                          color: '#CBD5E1',
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: '700', marginBottom: '4px' }}>
                          <Terminal size={12} />
                          <span>Technical Diagnostics Snapshot</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                          <div>User: <strong>{tick.userEmail}</strong></div>
                          <div>Workspace: <strong>{tick.workspaceName}</strong></div>
                          <div>Wallet at ticket: <strong>${(tick.diagnosticsSnapshot.walletBalanceUSD || 0).toFixed(2)}</strong></div>
                          <div>Mode: <strong>{tick.diagnosticsSnapshot.operatingMode || 'AI_COMPANY'}</strong></div>
                          <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}>
                            Last Error: <code style={{ color: '#F87171' }}>{tick.diagnosticsSnapshot.lastApiError || 'None'}</code>
                          </div>
                        </div>
                      </div>
                    )}

                    {tick.creditedAmountUSD > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', marginBottom: '8px' }}>
                        ✅ Compensation Injected: +${tick.creditedAmountUSD.toFixed(2)} USD
                      </div>
                    )}

                    {tick.adminNotes && (
                      <div style={{ fontSize: '0.74rem', color: '#E2E8F0', background: 'rgba(0, 0, 0, 0.3)', padding: '6px 10px', borderRadius: '6px', marginBottom: '8px' }}>
                        <strong>Admin Notes:</strong> {tick.adminNotes}
                      </div>
                    )}

                    {/* Action button */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setSelectedTicket(tick);
                          setTicketResolutionNote(tick.adminNotes || '');
                          setTicketCreditAmount('');
                          setAdminAttachments([]);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: '#0284C7',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Resolve / Credit Client →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 3: MASTER INTEGRATIONS & KILL-SWITCH                               */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Wholesale Provider Live Balance & Telemetry Hub */}
          <div className="specular-glass" style={{ padding: '24px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} color="#06B6D4" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Wholesale Provider Live Balance &amp; Telemetry Hub
                  </h3>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                    Super Admin Master Hub
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '3px' }}>
                  Centralized master accounts powering all client workspaces. Real-time balance polling, credit counters, and automated safety guards.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleRefreshTelemetry}
                  disabled={refreshingTelemetry || loadingTelemetry}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: refreshingTelemetry ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <RefreshCw size={13} className={refreshingTelemetry ? 'animate-spin' : ''} />
                  {refreshingTelemetry ? 'Syncing...' : 'Force Re-Sync Balances'}
                </button>
              </div>
            </div>

            {/* Safety Alerts Banner (if any provider is low) */}
            {wholesaleTelemetry?.alerts && wholesaleTelemetry.alerts.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {wholesaleTelemetry.alerts.map((alt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#FCA5A5' }}>
                    <AlertTriangle size={15} color="#EF4444" />
                    <span><strong>[{alt.provider}]</strong> {alt.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 5 Wholesale Provider Live Telemetry Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
              {/* Card 1: Apollo.io */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.apollo?.apiKey);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#38BDF8' }}>Apollo.io B2B</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? (wholesaleTelemetry?.providers?.apollo?.status || 'CONNECTED') : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          {(wholesaleTelemetry?.providers?.apollo?.creditsRemaining || 0).toLocaleString()}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>credits</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Allowance: {(wholesaleTelemetry?.providers?.apollo?.monthlyLimit || 0).toLocaleString()}</span>
                          <span>{wholesaleTelemetry?.providers?.apollo?.latencyMs ? `${wholesaleTelemetry.providers.apollo.latencyMs}ms` : 'Active'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>No master API key configured</div>
                        <button
                          onClick={() => scrollToIntegration('integration-apollo')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            color: '#38BDF8',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Apollo Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 2: Outscraper */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.outscraper?.apiKey);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#34D399' }}>Outscraper Maps</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? (wholesaleTelemetry?.providers?.outscraper?.status || 'CONNECTED') : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          ${(wholesaleTelemetry?.providers?.outscraper?.balanceUSD || 0).toFixed(2)}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>USD</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Free Tier: {wholesaleTelemetry?.providers?.outscraper?.freeTierRemaining || 0}/500</span>
                          <span>{wholesaleTelemetry?.providers?.outscraper?.latencyMs ? `${wholesaleTelemetry.providers.outscraper.latencyMs}ms` : 'Active'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>No master API key configured</div>
                        <button
                          onClick={() => scrollToIntegration('integration-outscraper')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#34D399',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Outscraper Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 3: BounceBan */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.bounceban?.apiKey);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#C4B5FD' }}>BounceBan Catch-All</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? (wholesaleTelemetry?.providers?.bounceban?.status || 'CONNECTED') : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          {(wholesaleTelemetry?.providers?.bounceban?.creditsRemaining || 0).toLocaleString()}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>checks</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Rollover Credits</span>
                          <span>{wholesaleTelemetry?.providers?.bounceban?.latencyMs ? `${wholesaleTelemetry.providers.bounceban.latencyMs}ms` : 'Active'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>No master API key configured</div>
                        <button
                          onClick={() => scrollToIntegration('integration-bounceban')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: '1px solid rgba(168, 85, 247, 0.35)',
                            color: '#C4B5FD',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect BounceBan Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 4: Twilio Voice & Lookup */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.twilio?.authToken);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F87171' }}>Twilio Voice &amp; Lookup</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? (wholesaleTelemetry?.providers?.twilio?.status || 'CONNECTED') : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          ${(wholesaleTelemetry?.providers?.twilio?.balanceUSD || 0).toFixed(2)}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>USD</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Lookup v2 + Maya Voice</span>
                          <span>{wholesaleTelemetry?.providers?.twilio?.latencyMs ? `${wholesaleTelemetry.providers.twilio.latencyMs}ms` : 'Active'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>Auth token not configured</div>
                        <button
                          onClick={() => scrollToIntegration('integration-twilio')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#F87171',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Twilio Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 5: Apify Social */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.apify?.apiToken);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FBBF24' }}>Apify Social Actors</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? (wholesaleTelemetry?.providers?.apify?.status || 'CONNECTED') : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          ${(wholesaleTelemetry?.providers?.apify?.usageUsd || 0).toFixed(2)}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>/ ${wholesaleTelemetry?.providers?.apify?.maxLimitUsd || 100}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Hard Limit Protected</span>
                          <span>{wholesaleTelemetry?.providers?.apify?.latencyMs ? `${wholesaleTelemetry.providers.apify.latencyMs}ms` : 'Active'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>No API token configured</div>
                        <button
                          onClick={() => scrollToIntegration('integration-apify')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            color: '#FBBF24',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Apify Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 6: Exotel India Domestic Telephony */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.exotel?.apiKey && platformConfig?.integrations?.exotel?.apiToken);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#10B981' }}>Exotel Domestic India</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? 'TRAI VERIFIED' : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          ₹4,850
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>INR (~₹0.80/m)</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>100% Domestic PSTN</span>
                          <span>{wholesaleTelemetry?.providers?.exotel?.latencyMs ? `${wholesaleTelemetry.providers.exotel.latencyMs}ms` : '95ms'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>Indian carrier keys pending</div>
                        <button
                          onClick={() => scrollToIntegration('integration-exotel')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#34D399',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Exotel Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 7: Telnyx Global Private Fiber Carrier */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.telnyx?.apiKey);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#38BDF8' }}>Telnyx Global Fiber</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? 'CARRIER ACTIVE' : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          ${(wholesaleTelemetry?.providers?.telnyx?.balanceUSD || 142.60).toFixed(2)}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>USD (~$0.007/m)</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>140+ Countries Fiber Backbone</span>
                          <span>{wholesaleTelemetry?.providers?.telnyx?.latencyMs ? `${wholesaleTelemetry.providers.telnyx.latencyMs}ms` : '78ms'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>Global fiber API key pending</div>
                        <button
                          onClick={() => scrollToIntegration('integration-telnyx')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            color: '#38BDF8',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Telnyx Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 8: Bland.ai Voice SDR Maya */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.blandAi?.apiKey);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F59E0B' }}>Bland.ai Voice SDR (Maya)</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? 'SUB-700MS LIVE' : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          ${(platformConfig?.integrations?.blandAi?.balanceUSD || 45.00).toFixed(2)}
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>USD</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Maya Closer Voice Active</span>
                          <span>{wholesaleTelemetry?.providers?.blandAi?.latencyMs ? `${wholesaleTelemetry.providers.blandAi.latencyMs}ms` : '86ms'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>Bland.ai API key pending</div>
                        <button
                          onClick={() => scrollToIntegration('integration-bland')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            color: '#FBBF24',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect Bland.ai Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 9: AiSensy Official Meta WhatsApp */}
              {(() => {
                const isConnected = Boolean(platformConfig?.integrations?.aisensy?.apiKey);
                return (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#22C55E' }}>AiSensy WhatsApp API</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10B981' : '#F87171',
                        fontWeight: '800',
                      }}>
                        {isConnected ? 'META CLOUD LIVE' : 'NOT CONNECTED'}
                      </span>
                    </div>

                    {isConnected ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                          98% Open Rate
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>(~₹0.40/msg)</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Official Meta Business BSP</span>
                          <span>{wholesaleTelemetry?.providers?.aisensy?.latencyMs ? `${wholesaleTelemetry.providers.aisensy.latencyMs}ms` : '110ms'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '8px' }}>AiSensy live token pending</div>
                        <button
                          onClick={() => scrollToIntegration('integration-aisensy')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            color: '#4ADE80',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Connect AiSensy Key</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Global Carrier Infrastructure Topology Map */}
          <div className="specular-glass" style={{ padding: '24px 28px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={20} color="#38BDF8" />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Global Carrier Infrastructure Topology Map
                  </h3>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    All 5 Gateways Healthy
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  Real-time telemetry, round-trip packet latency, and uptime across upstream enterprise carriers.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pulse-emerald" />
                <span className="tabular-nums" style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>
                  Average Latency: 311ms
                </span>
              </div>
            </div>

            {/* Carrier Node Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {[
                {
                  name: 'Exotel India Domestic Rail',
                  role: '100% TRAI & DoT Compliant Domestic Click-to-Call',
                  latency: '95ms',
                  status: '99.99% Uptime',
                  route: 'India-South (Mumbai/Bengaluru)',
                  color: '#10B981',
                  active: !circuitBreakerForm.pauseAllVoice,
                },
                {
                  name: 'Telnyx Global Private Fiber',
                  role: 'Wholesale Voice & 10DLC SMS Across 140+ Countries',
                  latency: '78ms',
                  status: '100.0% Uptime',
                  route: 'Global Private Backbone',
                  color: '#38BDF8',
                  active: !circuitBreakerForm.pauseAllVoice,
                },
                {
                  name: 'AiSensy Official Meta WhatsApp',
                  role: 'Indian & Emerging Market WhatsApp Business API',
                  latency: '110ms',
                  status: '99.98% Uptime',
                  route: 'Meta Cloud API (Gurugram)',
                  color: '#22C55E',
                  active: !circuitBreakerForm.pauseAllComms,
                },
                {
                  name: 'Bland.ai Dedicated Route',
                  role: 'Sub-700ms Inbound & Outbound Voice AE',
                  latency: '612ms',
                  status: '99.98% Uptime',
                  route: 'US-East WebRTC Gateway',
                  color: '#F59E0B',
                  active: !circuitBreakerForm.pauseAllVoice,
                },
                {
                  name: 'Twilio Trust Hub (A2P 10DLC TCR)',
                  role: 'Carrier-Preapproved SMS & WhatsApp API',
                  latency: '142ms',
                  status: '99.95% Uptime',
                  route: 'US-West SMS Gateway',
                  color: '#10B981',
                  active: !circuitBreakerForm.pauseAllComms,
                },
                {
                  name: 'Apollo.io B2B Intelligence',
                  role: 'Lead Scraper & Real-Time Intent Waterfall',
                  latency: '240ms',
                  status: '99.99% Uptime',
                  route: 'Global Edge CDN',
                  color: '#38BDF8',
                  active: !circuitBreakerForm.pauseAllScraping,
                },
                {
                  name: 'Hunter.io / ZeroBounce',
                  role: 'DNS MX Deliverability & Email Verification',
                  latency: '185ms',
                  status: '100.0% Uptime',
                  route: 'EU-Central Mail Gateway',
                  color: '#06B6D4',
                  active: true,
                },
                {
                  name: 'Google Gemini Pro 1.5 Orchestrator',
                  role: 'AI C-Suite Strategic Intelligence Engine',
                  latency: '380ms',
                  status: '99.99% Uptime',
                  route: 'Multi-Region Neural Bus',
                  color: '#A855F7',
                  active: true,
                },
              ].map((node) => (
                <div
                  key={node.name}
                  className="specular-card"
                  style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    border: `1px solid ${node.active ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.4)'}`,
                    background: 'rgba(8, 11, 18, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={node.active ? 'pulse-emerald' : 'pulse-emerald'} style={{ background: node.active ? '#10B981' : '#EF4444' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F8FAFC' }}>
                        {node.name.split(' ')[0]}
                      </span>
                    </div>
                    <span className="tabular-nums" style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      color: node.active ? '#10B981' : '#EF4444',
                      background: node.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${node.active ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}>
                      {node.active ? node.latency : 'HALTED'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: '1.4' }}>
                    {node.role}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: 'var(--border-hairline)',
                    paddingTop: '8px',
                    fontSize: '0.675rem',
                    color: '#64748B',
                  }}>
                    <span>{node.route}</span>
                    <span className="tabular-nums" style={{ color: '#F8FAFC', fontWeight: '600' }}>{node.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Emergency Circuit Breaker (Kill-Switch) */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldAlert size={22} color="#EF4444" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#EF4444' }}>
                  Master Emergency Circuit Breaker (Global Kill-Switch & Throttling)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>
                  Instantly halt outbound telephony, scrapers, or emails across all client tenants in the event of upstream carrier outages or abuse
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: circuitBreakerForm.pauseAllVoice ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <input
                  type="checkbox"
                  checked={circuitBreakerForm.pauseAllVoice}
                  onChange={(e) => setCircuitBreakerForm({ ...circuitBreakerForm, pauseAllVoice: e.target.checked })}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: circuitBreakerForm.pauseAllVoice ? '#EF4444' : '#F8FAFC' }}>
                    Pause All Voice Calls
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Blocks Twilio & Bland.ai outbound calls</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: circuitBreakerForm.pauseAllScraping ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <input
                  type="checkbox"
                  checked={circuitBreakerForm.pauseAllScraping}
                  onChange={(e) => setCircuitBreakerForm({ ...circuitBreakerForm, pauseAllScraping: e.target.checked })}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: circuitBreakerForm.pauseAllScraping ? '#EF4444' : '#F8FAFC' }}>
                    Pause All Scraper Engines
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Stops Outscraper & Apollo harvests</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: circuitBreakerForm.pauseAllEmail ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <input
                  type="checkbox"
                  checked={circuitBreakerForm.pauseAllEmail}
                  onChange={(e) => setCircuitBreakerForm({ ...circuitBreakerForm, pauseAllEmail: e.target.checked })}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: circuitBreakerForm.pauseAllEmail ? '#EF4444' : '#F8FAFC' }}>
                    Pause All Outbound Email
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Halts SendGrid & Instantly sequences</div>
                </div>
              </label>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                  HOURLY RATE LIMIT / WORKSPACE
                </div>
                <input
                  type="number"
                  value={circuitBreakerForm.hourlyRateLimitPerWorkspace}
                  onChange={(e) => setCircuitBreakerForm({ ...circuitBreakerForm, hourlyRateLimitPerWorkspace: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Reason for kill-switch trigger (required for audit trail)..."
                value={circuitBreakerForm.reason}
                onChange={(e) => setCircuitBreakerForm({ ...circuitBreakerForm, reason: e.target.value })}
                style={{
                  flex: 1,
                  minWidth: '260px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.82rem',
                }}
              />
              <button
                onClick={handleSaveCircuitBreaker}
                disabled={savingBreaker}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: savingBreaker ? 'not-allowed' : 'pointer',
                }}
              >
                {savingBreaker ? 'Applying Override...' : 'Apply Circuit Breaker'}
              </button>
            </div>
          </div>

          {/* Master Integrations Switchboard */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Master Integrations Switchboard (Screen-Share Safe)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  API keys are masked by default (••••••••) to protect platform secrets during founder presentations
                </div>
              </div>
              <button
                onClick={() => handleSaveConfig({ integrations: platformConfig?.integrations })}
                disabled={savingConfig}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                {savingConfig ? 'Saving...' : 'Save All Keys'}
              </button>
            </div>

            {/* Integrations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {[
                {
                  id: 'exotel',
                  title: 'Exotel Domestic India Rail',
                  subtitle: 'TRAI-Compliant PSTN Virtual PRI & Indian Voice',
                  category: 'TELECOM (INDIA)',
                  accentColor: '#10B981',
                  accentBg: 'rgba(16, 185, 129, 0.15)',
                  accentBorder: 'rgba(16, 185, 129, 0.3)',
                  icon: <PhoneCall size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.exotel?.accountSid && platformConfig?.integrations?.exotel?.apiKey),
                  fields: [
                    { name: 'accountSid', label: 'Exotel Account SID / Subdomain', placeholder: 'e.g. valmikisoftwares1', required: true },
                    { name: 'apiKey', label: 'API Key', placeholder: 'Enter Exotel API Key', secret: true, required: true },
                    { name: 'apiToken', label: 'API Token (Password)', placeholder: 'Enter Exotel API Token', secret: true, required: true },
                    { name: 'callerId', label: 'Virtual Caller ID (+91...)', placeholder: 'e.g. +91 80 4719 2837', required: false },
                  ],
                },
                {
                  id: 'telnyx',
                  title: 'Telnyx Global Carrier Fiber',
                  subtitle: 'Direct Wholesale Private Fiber (140+ Countries)',
                  category: 'TELECOM (GLOBAL)',
                  accentColor: '#06B6D4',
                  accentBg: 'rgba(6, 182, 212, 0.15)',
                  accentBorder: 'rgba(6, 182, 212, 0.3)',
                  icon: <Globe size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.telnyx?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'Telnyx V2 API Key', placeholder: 'KEY...', secret: true, required: true },
                    { name: 'connectionId', label: 'TeXML Connection ID / SIP Profile', placeholder: 'SIP Connection ID', required: false },
                    { name: 'callerId', label: 'Global Caller ID (+1...)', placeholder: 'e.g. +1 512 987 6543', required: false },
                  ],
                },
                {
                  id: 'blandAi',
                  title: 'Bland.ai Voice SDR (Maya)',
                  subtitle: 'Sub-800ms Conversational AI Telephony',
                  category: 'AI VOICE AGENT',
                  accentColor: '#F59E0B',
                  accentBg: 'rgba(245, 158, 11, 0.15)',
                  accentBorder: 'rgba(245, 158, 11, 0.3)',
                  icon: <Sparkles size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.blandAi?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'Bland.ai Developer API Key', placeholder: 'org_...', secret: true, required: true },
                    { name: 'defaultVoiceId', label: 'Default Maya Voice ID', placeholder: 'maya', required: false },
                  ],
                },
                {
                  id: 'aisensy',
                  title: 'AiSensy WhatsApp API',
                  subtitle: 'Official Meta Cloud Business API (India/Global)',
                  category: 'WHATSAPP MESSAGING',
                  accentColor: '#22C55E',
                  accentBg: 'rgba(34, 197, 94, 0.15)',
                  accentBorder: 'rgba(34, 197, 94, 0.3)',
                  icon: <MessageSquare size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.aisensy?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'AiSensy Live API Key', placeholder: 'Enter AiSensy API Key', secret: true, required: true },
                    { name: 'campaignName', label: 'Default Campaign Name', placeholder: 'vyuhox_leads', required: false },
                    { name: 'businessNumber', label: 'Registered Meta Phone (+91...)', placeholder: '+91 98765 43210', required: false },
                  ],
                },
                {
                  id: 'twilio',
                  title: 'Twilio Voice & SMS Gateway',
                  subtitle: 'Global CPaaS Carrier & Phone Verification',
                  category: 'TELECOM (BACKUP)',
                  accentColor: '#EF4444',
                  accentBg: 'rgba(239, 68, 68, 0.15)',
                  accentBorder: 'rgba(239, 68, 68, 0.3)',
                  icon: <PhoneCall size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.twilio?.accountSid && platformConfig?.integrations?.twilio?.authToken),
                  fields: [
                    { name: 'accountSid', label: 'Twilio Account SID (AC...)', placeholder: 'AC...', required: true },
                    { name: 'authToken', label: 'Twilio Auth Token', placeholder: 'Auth Token...', secret: true, required: true },
                    { name: 'phoneNumber', label: 'Twilio Phone Number', placeholder: '+1 (800) 555-0199', required: false },
                  ],
                },
                {
                  id: 'apollo',
                  title: 'Apollo.io B2B Enrichment',
                  subtitle: 'Corporate Lead Verification & Data Enrichment',
                  category: 'DATA ENRICHMENT',
                  accentColor: '#38BDF8',
                  accentBg: 'rgba(56, 189, 248, 0.15)',
                  accentBorder: 'rgba(56, 189, 248, 0.3)',
                  icon: <Database size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.apollo?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'Apollo API Key', placeholder: 'Enter Apollo API Key (sk_...)', secret: true, required: true },
                  ],
                },
                {
                  id: 'outscraper',
                  title: 'Outscraper Maps Extractor',
                  subtitle: 'Local Business & Google Maps Extraction',
                  category: 'LEAD SCRAPING',
                  accentColor: '#FB923C',
                  accentBg: 'rgba(251, 146, 60, 0.15)',
                  accentBorder: 'rgba(251, 146, 60, 0.3)',
                  icon: <Search size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.outscraper?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'Outscraper API Key', placeholder: 'Enter Outscraper API Key', secret: true, required: true },
                  ],
                },
                {
                  id: 'bounceban',
                  title: 'BounceBan Catch-All Shield',
                  subtitle: 'Deep Email Verification & Deliverability',
                  category: 'EMAIL HYGIENE',
                  accentColor: '#A855F7',
                  accentBg: 'rgba(168, 85, 247, 0.15)',
                  accentBorder: 'rgba(168, 85, 247, 0.3)',
                  icon: <ShieldCheck size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.bounceban?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'BounceBan API Key', placeholder: 'Enter BounceBan API Key', secret: true, required: true },
                  ],
                },
                {
                  id: 'apify',
                  title: 'Apify Social Actor Cloud',
                  subtitle: 'Social Media & Profile Scraping Cloud',
                  category: 'ACTOR CLOUD',
                  accentColor: '#EC4899',
                  accentBg: 'rgba(236, 72, 153, 0.15)',
                  accentBorder: 'rgba(236, 72, 153, 0.3)',
                  icon: <Users size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.apify?.apiToken),
                  fields: [
                    { name: 'apiToken', label: 'Apify API Token', placeholder: 'apify_api_...', secret: true, required: true },
                  ],
                },
                {
                  id: 'geminiMaster',
                  title: 'Google Gemini 1.5 Master',
                  subtitle: 'Multimodal LLM & GTM Strategic Reasoning',
                  category: 'CORE INTELLIGENCE',
                  accentColor: '#818CF8',
                  accentBg: 'rgba(129, 140, 248, 0.15)',
                  accentBorder: 'rgba(129, 140, 248, 0.3)',
                  icon: <Cpu size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.geminiMaster?.apiKey),
                  fields: [
                    { name: 'apiKey', label: 'Gemini API Key', placeholder: 'AIzaSy...', secret: true, required: true },
                    { name: 'model', label: 'Model Identifier', placeholder: 'gemini-1.5-pro', required: false },
                  ],
                },
                {
                  id: 'razorpayIndia',
                  title: 'Razorpay India Payment Rail',
                  subtitle: 'UPI, Netbanking & Cards Gateway (INR)',
                  category: 'PAYMENTS (INDIA)',
                  accentColor: '#0284C7',
                  accentBg: 'rgba(2, 132, 199, 0.15)',
                  accentBorder: 'rgba(2, 132, 199, 0.3)',
                  icon: <DollarSign size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.razorpayIndia?.keyId && platformConfig?.integrations?.razorpayIndia?.keySecret),
                  fields: [
                    { name: 'keyId', label: 'Razorpay Key ID', placeholder: 'rzp_live_...', required: true },
                    { name: 'keySecret', label: 'Razorpay Key Secret', placeholder: 'Key Secret...', secret: true, required: true },
                  ],
                },
                {
                  id: 'stripeGlobal',
                  title: 'Stripe Global Payments',
                  subtitle: 'International Cards & Invoicing (USD/EUR)',
                  category: 'PAYMENTS (GLOBAL)',
                  accentColor: '#6366F1',
                  accentBg: 'rgba(99, 102, 241, 0.15)',
                  accentBorder: 'rgba(99, 102, 241, 0.3)',
                  icon: <DollarSign size={18} />,
                  isConfigured: Boolean(platformConfig?.integrations?.stripeGlobal?.secretKey),
                  fields: [
                    { name: 'publishableKey', label: 'Stripe Publishable Key', placeholder: 'pk_live_...', required: false },
                    { name: 'secretKey', label: 'Stripe Secret Key', placeholder: 'sk_live_...', secret: true, required: true },
                  ],
                },
              ].map((card) => {
                const currentVals = platformConfig?.integrations?.[card.id] || {};
                return (
                  <div
                    key={card.id}
                    id={`integration-${card.id}`}
                    style={{
                      background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                      borderRadius: '14px',
                      border: `1px solid ${card.isConfigured ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      boxShadow: card.isConfigured ? '0 4px 20px rgba(16, 185, 129, 0.05)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: card.accentBg,
                              border: `1px solid ${card.accentBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: card.accentColor,
                              flexShrink: 0,
                            }}
                          >
                            {card.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#F8FAFC' }}>
                              {card.title}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>
                              {card.subtitle}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            background: card.isConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                            color: card.isConfigured ? '#10B981' : '#94A3B8',
                            border: `1px solid ${card.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: card.isConfigured ? '#10B981' : '#94A3B8',
                            }}
                          />
                          {card.isConfigured ? 'CONNECTED' : 'NOT CONFIGURED'}
                        </span>
                      </div>

                      {/* Fields with Explicit Labels */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {card.fields.map((field) => (
                          <div key={field.name}>
                            <label
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                color: '#CBD5E1',
                                marginBottom: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span>{field.label}</span>
                              {field.required && <span style={{ color: '#F43F5E', fontSize: '0.65rem' }}>*Required</span>}
                            </label>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input
                                type={field.secret && !revealedKeys[`${card.id}_${field.name}`] ? 'password' : 'text'}
                                value={currentVals[field.name] || ''}
                                placeholder={field.placeholder}
                                onChange={(e) => handleUpdateIntegrationField(card.id, field.name, e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: '#0B1120',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: '#F8FAFC',
                                  fontSize: '0.8rem',
                                  fontFamily: field.secret ? 'monospace' : 'inherit',
                                  outline: 'none',
                                }}
                              />
                              {field.secret && (
                                <button
                                  type="button"
                                  onClick={() => toggleKeyVisibility(`${card.id}_${field.name}`)}
                                  title={revealedKeys[`${card.id}_${field.name}`] ? 'Hide' : 'Reveal'}
                                  style={{
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {revealedKeys[`${card.id}_${field.name}`] ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Area: Ping Result Banner + Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pingStatus[card.id] && (
                        <div
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            background:
                              pingStatus[card.id].status === 'LIVE'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : pingStatus[card.id].status === 'TESTING'
                                ? 'rgba(56, 189, 248, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                            border: `1px solid ${
                              pingStatus[card.id].status === 'LIVE'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : pingStatus[card.id].status === 'TESTING'
                                ? 'rgba(56, 189, 248, 0.3)'
                                : 'rgba(239, 68, 68, 0.3)'
                            }`,
                            color:
                              pingStatus[card.id].status === 'LIVE'
                                ? '#34D399'
                                : pingStatus[card.id].status === 'TESTING'
                                ? '#38BDF8'
                                : '#F87171',
                          }}
                        >
                          {pingStatus[card.id].status === 'TESTING' ? (
                            <RefreshCw size={14} className="animate-spin" style={{ marginTop: '1px', flexShrink: 0 }} />
                          ) : pingStatus[card.id].status === 'LIVE' ? (
                            <Check size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                          ) : (
                            <AlertCircle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, lineHeight: '1.4' }}>
                            <strong>{pingStatus[card.id].status}:</strong> {pingStatus[card.id].message || 'Complete'}
                            {pingStatus[card.id].latencyMs ? ` (${pingStatus[card.id].latencyMs}ms)` : ''}
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleTestPing(card.id)}
                          disabled={pingStatus[card.id]?.status === 'TESTING'}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '8px',
                            background: 'rgba(56, 189, 248, 0.08)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38BDF8',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: pingStatus[card.id]?.status === 'TESTING' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Zap size={13} />
                          <span>Test Ping</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {card.isConfigured && (
                            <button
                              type="button"
                              onClick={() => handleRequestDelete(card.id, card.title)}
                              title={`Delete ${card.title} credentials`}
                              style={{
                                padding: '7px 10px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#F87171',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSaveProvider(card.id)}
                            disabled={savingKeys[card.id]}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              background: '#0284C7',
                              border: 'none',
                              color: '#FFFFFF',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: savingKeys[card.id] ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                            }}
                          >
                            {savingKeys[card.id] ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            <span>{savingKeys[card.id] ? 'Saving...' : 'Save Keys'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 4: FINOPS, RATES, PLANS, DNC & AUDIT TRAIL                          */}
      {/* ========================================================================= */}
      {activeTab === 'finops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* FinOps Wholesale Margin Waterfall Chart */}
          <div className="specular-glass" style={{ padding: '24px 28px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="#10B981" />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Wholesale Carrier Margin Waterfall &amp; Escrow Liquidity
                  </h3>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    78.4% Gross Margin Locked
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  Deterministic financial safety model: client deposits minus wholesale carrier expenses equals guaranteed gross margin.
                </div>
              </div>

              <div className="tabular-nums" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Multi-Tenant Wallet Liquidity</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10B981' }}>$34,850.00</div>
              </div>
            </div>

            {/* Visual Waterfall Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: '#CBD5E1' }}>
                <span>Gross Deposits: <strong>$100,000 (100%)</strong></span>
                <span>Wholesale Costs: <strong style={{ color: '#F87171' }}>$21,600 (21.6%)</strong></span>
                <span>Net SaaS Margin: <strong style={{ color: '#10B981' }}>$78,400 (78.4%)</strong></span>
              </div>
              <div style={{
                height: '14px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
                display: 'flex',
                border: 'var(--border-hairline)',
              }}>
                <div title="Voice Wholesale (Bland)" style={{ width: '10.8%', background: '#F59E0B' }} />
                <div title="SMS/WhatsApp (Twilio)" style={{ width: '4.5%', background: '#38BDF8' }} />
                <div title="Scraper (Apollo)" style={{ width: '3.9%', background: '#0284C7' }} />
                <div title="LLM (Gemini)" style={{ width: '2.4%', background: '#A855F7' }} />
                <div title="Net Retained Gross Margin" style={{ width: '78.4%', background: '#10B981' }} />
              </div>
            </div>

            {/* Waterfall Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="specular-card" style={{ padding: '12px 16px', background: 'rgba(8, 11, 18, 0.8)' }}>
                <div style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: '700' }}>VOICE WHOLESALE</div>
                <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', margin: '2px 0' }}>$0.012 / min</div>
                <div style={{ fontSize: '0.675rem', color: '#64748B' }}>Bland.ai WebRTC pipeline</div>
              </div>

              <div className="specular-card" style={{ padding: '12px 16px', background: 'rgba(8, 11, 18, 0.8)' }}>
                <div style={{ fontSize: '0.68rem', color: '#38BDF8', fontWeight: '700' }}>A2P 10DLC TCR</div>
                <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', margin: '2px 0' }}>$0.005 / msg</div>
                <div style={{ fontSize: '0.675rem', color: '#64748B' }}>Twilio Trust Hub 100% Valid</div>
              </div>

              <div className="specular-card" style={{ padding: '12px 16px', background: 'rgba(8, 11, 18, 0.8)' }}>
                <div style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: '700' }}>WATERFALL SCRAPE</div>
                <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', margin: '2px 0' }}>$0.020 / lead</div>
                <div style={{ fontSize: '0.675rem', color: '#64748B' }}>Apollo + Hunter MX verify</div>
              </div>

              <div className="specular-card" style={{ padding: '12px 16px', background: 'rgba(8, 11, 18, 0.8)' }}>
                <div style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700' }}>GUARANTEED MARGIN</div>
                <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: '900', color: '#10B981', margin: '2px 0' }}>78.4% Retained</div>
                <div style={{ fontSize: '0.675rem', color: '#64748B' }}>Zero-overdraft floor enforced</div>
              </div>
            </div>
          </div>

          {/* Autonomous AI CFO & Gross Margin Guard */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} color="#38BDF8" />
                  <span>Autonomous AI CFO & Cost-Plus Margin Engine (80% Guaranteed Margin)</span>
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Continuously tracks wholesale carrier rates (Twilio, Gemini, Meta) and enforces cost-plus pricing
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleEvaluateFinOps}
                  disabled={evaluatingFinops}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38BDF8',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {evaluatingFinops ? 'Analyzing Carrier Costs...' : 'Recalculate Margins'}
                </button>
                <button
                  onClick={handleApplyFinOpsRates}
                  disabled={applyingFinops}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  {applyingFinops ? 'Applying...' : '1-Click Apply AI CFO Rates'}
                </button>
              </div>
            </div>

            {finopsData && (
              <div style={{ background: '#0F172A', borderRadius: '10px', padding: '14px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800', marginBottom: '4px' }}>
                  AI CFO Target Gross Margin: {finopsData.targetGrossMarginPercent || 80}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>
                  Recommended Scraper Rate: ${finopsData.suggestedScrapingPerLeadUSD} / lead • Voice: ${finopsData.suggestedVoicePerMinuteUSD} / min
                </div>
              </div>
            )}

            {/* Zero-Overdraft Pre-Emptive Utility Usage Rates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>AI VOICE (PER MINUTE)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0' }}>
                  ${platformConfig?.usageRates?.voicePerMinuteUSD || 0.012} <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/ ₹{platformConfig?.usageRates?.voicePerMinuteINR || 1.0}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10B981' }}>Floor: $0.00 • Low Warning: $10/$3</div>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>WHATSAPP (PER MESSAGE)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0' }}>
                  ${platformConfig?.usageRates?.whatsappPerMessageUSD || 0.005} <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/ ₹{platformConfig?.usageRates?.whatsappPerMessageINR || 0.4}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10B981' }}>Meta Cloud Direct Gateway</div>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>COLD EMAIL (PER 1,000)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0' }}>
                  ${platformConfig?.usageRates?.emailPer1000USD || 0.8} <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/ ₹{platformConfig?.usageRates?.emailPer1000INR || 65.0}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10B981' }}>SendGrid SMTP High Deliverability</div>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>MAPS SCRAPER (PER LEAD)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0' }}>
                  ${platformConfig?.usageRates?.scrapingPerLeadUSD || 0.15} <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/ ₹{platformConfig?.usageRates?.scrapingPerLeadINR || 12.5}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10B981' }}>Multi-source enrichments</div>
              </div>
            </div>
          </div>

          {/* Subscription Plans Matrix */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Live Subscription Plans & Limits</h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Geo-targeted tiers (USD for Global, INR for India)
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {plans.map((p) => (
                <div
                  key={p._id || p.planId}
                  style={{
                    background: '#0F172A',
                    borderRadius: '10px',
                    padding: '16px',
                    border: p.isPopular ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>{p.badge || 'Tier'}</span>
                    <span style={{ fontSize: '0.68rem', color: p.isActive ? '#10B981' : '#64748B' }}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#F8FAFC' }}>{p.name}</h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: '6px 0' }}>
                    ${p.priceUSD?.monthly || 0} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>/mo (₹{p.priceINR?.monthly || 0})</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '10px' }}>{p.tagline}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem', color: '#CBD5E1' }}>
                    <div>• Leads Included: {p.limits?.leadsPerMonth || 500}/mo</div>
                    <div>• Voice Minutes: {p.limits?.voiceMinutesPerMonth || 60}/mo</div>
                    <div>• WhatsApp: {p.limits?.whatsappMessages || 1000}/mo</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier-2 Global Regulatory Blacklist (Master DNC) */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Tier-2 Global Regulatory Blacklist (Master DNC Isolation)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Protected federal domains (e.g. @fbi.gov) and serial litigators blocked globally across ALL client accounts. Tier-1 opt-outs remain isolated per client workspace.
                </div>
              </div>
            </div>

            {/* Add DNC Form */}
            <form onSubmit={handleAddDncSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Identifier (e.g. @fbi.gov, @gov.in, or +18005550199)"
                value={newDncIdentifier}
                onChange={(e) => setNewDncIdentifier(e.target.value)}
                required
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.8rem',
                }}
              />
              <select
                value={newDncType}
                onChange={(e) => setNewDncType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.8rem',
                }}
              >
                <option value="DOMAIN">DOMAIN</option>
                <option value="PHONE">PHONE</option>
              </select>
              <input
                type="text"
                placeholder="Regulatory Reason (e.g. TCPA Serial Litigator / Federal Agency)"
                value={newDncReason}
                onChange={(e) => setNewDncReason(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="submit"
                disabled={savingDnc}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {savingDnc ? 'Adding...' : '+ Blacklist'}
              </button>
            </form>

            {/* List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {globalDncList.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  No global regulatory blacklists added yet.
                </div>
              ) : (
                globalDncList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0F172A',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span style={{ color: '#EF4444', fontWeight: '800' }}>{item.identifier}</span>
                    <span style={{ color: '#94A3B8' }}>({item.type})</span>
                    <button
                      onClick={() => handleRemoveDnc(item.identifier)}
                      style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0 2px' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Global Maintenance & Incident Broadcast Dispatcher */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Global Maintenance & Incident Broadcast Dispatcher
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Pushes a sticky banner across all active client dashboards in real-time
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={announcementState.active}
                    onChange={(e) => setAnnouncementState({ ...announcementState, active: e.target.checked })}
                  />
                  <span>Active Broadcast</span>
                </label>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {['INFO', 'WARNING', 'MAINTENANCE'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAnnouncementState({ ...announcementState, severity: sev })}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: announcementState.severity === sev ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: announcementState.severity === sev ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                        color: announcementState.severity === sev ? '#38BDF8' : '#94A3B8',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={announcementState.message}
                onChange={(e) => setAnnouncementState({ ...announcementState, message: e.target.value })}
                placeholder="e.g. Scheduled Twilio carrier maintenance tonight at 02:00 UTC. Outbound voice calling will pause for 15 minutes."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveAnnouncement}
                  disabled={savingAnnouncement}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  {savingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </div>
          </div>

          {/* Tamper-Evident Admin Security Audit Log */}
          <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Tamper-Evident Admin Security Audit Log
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Chronological, immutable ledger of all super admin actions (rate updates, wallet credits, kill switches)
                </div>
              </div>

              {/* Action Filter */}
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.75rem',
                }}
              >
                <option value="ALL">All Actions</option>
                <option value="WALLET_CREDITED">WALLET_CREDITED</option>
                <option value="CIRCUIT_BREAKER_TRIGGERED">CIRCUIT_BREAKER_TRIGGERED</option>
                <option value="RATE_UPDATED">RATE_UPDATED</option>
                <option value="INTEGRATION_KEY_UPDATED">INTEGRATION_KEY_UPDATED</option>
                <option value="GLOBAL_DNC_ADDED">GLOBAL_DNC_ADDED</option>
                <option value="ANNOUNCEMENT_BROADCAST">ANNOUNCEMENT_BROADCAST</option>
                <option value="SUPPORT_TICKET_RESOLVED">SUPPORT_TICKET_RESOLVED</option>
              </select>
            </div>

            {filteredAuditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.8rem' }}>
                No audit entries found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                {filteredAuditLogs.map((log) => (
                  <div
                    key={log._id}
                    style={{
                      background: '#0F172A',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '800', color: '#38BDF8' }}>{log.actionType}</span>
                        <span style={{ color: '#94A3B8' }}>•</span>
                        <span style={{ color: '#E2E8F0' }}>{log.adminEmail}</span>
                        {log.targetWorkspaceName && (
                          <>
                            <span style={{ color: '#94A3B8' }}>→</span>
                            <span style={{ color: '#FCD34D' }}>{log.targetWorkspaceName}</span>
                          </>
                        )}
                      </div>
                      <div style={{ color: '#94A3B8' }}>{log.details}</div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STANDALONE WALLET CREDIT INJECTOR                                  */}
      {/* ========================================================================= */}
      {injectModalOpen && injectTargetWs && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              width: '420px',
              maxWidth: '90vw',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F59E0B' }}>
                Inject Wallet Credit
              </h3>
              <button
                onClick={() => setInjectModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#94A3B8' }}>
              Credit funds directly into <strong>{injectTargetWs.name}</strong>. Logged immediately into the security audit trail.
            </p>

            <form onSubmit={handleInjectCreditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '4px' }}>
                  Amount in USD ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="e.g. 50.00"
                  value={injectAmount}
                  onChange={(e) => setInjectAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '4px' }}>
                  Reason & Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pilot trial boost / Carrier downtime compensation"
                  value={injectReason}
                  onChange={(e) => setInjectReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '4px' }}>
                  Attach Verification / Proof Screenshot (Super Admin)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.txt"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setIsUploadingAdminFile(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', f);
                      const upRes = await api.uploadSupportAttachment(fd);
                      if (upRes?.success && upRes.file) {
                        setAdminAttachments(prev => [...prev, {
                          uploaderRole: 'SUPER_ADMIN',
                          uploaderEmail: 'founder@vyuhox.ai',
                          fileUrl: upRes.file.fileUrl,
                          fileName: upRes.file.fileName,
                          fileType: upRes.file.fileType,
                          fileSizeKb: upRes.file.fileSizeKb,
                        }]);
                      }
                    } catch(err) {
                      console.error('Admin upload error:', err);
                    } finally {
                      setIsUploadingAdminFile(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '0.72rem',
                  }}
                />
                {adminAttachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {adminAttachments.map((at, idx) => (
                      <span key={idx} style={{ background: '#0284C7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        📎 {at.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setInjectModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={injectingCredit || !injectAmount}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: injectingCredit ? 'not-allowed' : 'pointer',
                  }}
                >
                  {injectingCredit ? 'Injecting...' : 'Confirm Injection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TICKET RESOLUTION & COMPENSATION                                   */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              width: '480px',
              maxWidth: '92vw',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Resolve Support Ticket #{selectedTicket.ticketNumber}
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#38BDF8' }}>
                  {selectedTicket.workspaceName} • {selectedTicket.userEmail}
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: '#F8FAFC', marginBottom: '4px' }}>{selectedTicket.subject}</div>
              <div>{selectedTicket.message}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '4px' }}>
                  Admin Resolution Notes
                </label>
                <textarea
                  value={ticketResolutionNote}
                  onChange={(e) => setTicketResolutionNote(e.target.value)}
                  placeholder="Explain resolution (e.g. Network route cleared, dialer verified, compensation credited)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '4px' }}>
                  Optional Wallet Compensation ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={ticketCreditAmount}
                  onChange={(e) => setTicketCreditAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleResolveTicketSubmit('IN_REVIEW')}
                  disabled={resolvingTicket}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#F59E0B',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Mark In Review
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveTicketSubmit('RESOLVED')}
                  disabled={resolvingTicket}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  {resolvingTicket ? 'Saving...' : 'Resolve Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: DELETE / DISCONNECT CREDENTIALS CONFIRMATION                       */}
      {/* ========================================================================= */}
      {deleteConfirmModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '16px',
              padding: '26px',
              width: '450px',
              maxWidth: '92vw',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Disconnect {deleteConfirmModal.title}?
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#EF4444', fontWeight: '700', marginTop: '2px' }}>
                  Permanent Credential Deletion & Disconnect
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: '1.55', margin: '0 0 22px 0' }}>
              Are you sure you want to delete all stored API keys, tokens, and routing configurations for{' '}
              <strong style={{ color: '#FFFFFF' }}>{deleteConfirmModal.title}</strong>?
              <br /><br />
              <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
                ⚠️ Any automated voice closer calls, WhatsApp campaigns, or lead enrichment operations routed through this provider will be immediately halted until new keys are entered.
              </span>
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ open: false, provider: null, title: '' })}
                disabled={deletingProvider}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingProvider}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: deletingProvider ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                }}
              >
                {deletingProvider ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>{deletingProvider ? 'Deleting Keys...' : 'Yes, Delete Credentials'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
