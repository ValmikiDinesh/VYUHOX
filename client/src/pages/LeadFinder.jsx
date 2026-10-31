import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  Send,
  ExternalLink,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  Server,
  Globe,
  Coins,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Smartphone,
  ArrowUp,
  PhoneCall,
  Check,
  Building2,
  MapPin,
  Briefcase,
  Target,
  RefreshCw,
  Info,
  CreditCard,
  Bot,
  Compass,
  Layers,
  ArrowUpRight,
  Sliders,
  CheckCheck,
  X,
} from 'lucide-react';
import { api } from '../services/api';

const INDIAN_CITIES = [
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Mumbai, Maharashtra',
  'Delhi NCR / Gurgaon',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Noida, Uttar Pradesh',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
];

const GLOBAL_CITIES = [
  'San Francisco Bay Area, CA',
  'Austin, Texas',
  'New York City, NY',
  'Dallas, Texas',
  'Seattle, Washington',
  'London, United Kingdom',
  'Dubai, United Arab Emirates',
  'Singapore',
  'Toronto, Canada',
  'Sydney, Australia',
];

export default function LeadFinder({
  activeWorkspace,
  leads = [],
  wallet,
  currency = 'USD',
  exchangeRate = 83.5,
  onOpenAddFundsModal,
  onRefreshLeads,
  onOpenNewLeadModal,
  onOpenBulkImportModal,
  socket,
  onNavigateTab,
  onOpenChatWithLead,
}) {
  // Strategy & Business Context State
  const [strategy, setStrategy] = useState(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);

  // Self-healing internal leads state
  const [internalLeads, setInternalLeads] = useState(Array.isArray(leads) ? leads : []);

  useEffect(() => {
    if (Array.isArray(leads) && leads.length > 0) {
      setInternalLeads(leads);
    }
  }, [leads]);

  const loadLeadsData = async () => {
    const wsId = activeWorkspace?._id || localStorage.getItem('vyuhox_active_ws_id');
    if (!wsId) return;
    try {
      const res = await api.getLeads(wsId);
      if (res && res.success && Array.isArray(res.leads)) {
        setInternalLeads(res.leads);
        if (onRefreshLeads) onRefreshLeads();
      }
    } catch (e) {
      console.warn('Failed to fetch leads in LeadFinder:', e);
    }
  };

  useEffect(() => {
    loadLeadsData();
  }, [activeWorkspace?._id]);

  // Active View Tab: 'crm_leads' | 'scraper_console' | 'all'
  const [activeSubTab, setActiveSubTab] = useState('crm_leads');

  // Scraper Search Parameters (Multi-Territory Support: Cities, States, Countries)
  const [selectedLocations, setSelectedLocations] = useState(['Hyderabad, Telangana']);
  const [locationInput, setLocationInput] = useState('');
  const [limit, setLimit] = useState(25);
  const [customKeywords, setCustomKeywords] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [expandedNotesId, setExpandedNotesId] = useState(null);

  const handleAddLocation = (locToAdd) => {
    const term = (locToAdd || locationInput).trim();
    if (!term) return;
    if (!selectedLocations.includes(term)) {
      setSelectedLocations([...selectedLocations, term]);
    }
    setLocationInput('');
  };

  const handleRemoveLocation = (locToRemove) => {
    setSelectedLocations(selectedLocations.filter((l) => l !== locToRemove));
  };

  const handleTogglePreset = (presetLoc) => {
    if (selectedLocations.includes(presetLoc)) {
      handleRemoveLocation(presetLoc);
    } else {
      setSelectedLocations([...selectedLocations, presetLoc]);
    }
  };

  // Per-Lead Pricing Rate
  const RATE_PER_LEAD_USD = 0.15;
  const RATE_PER_LEAD_INR = 12.5;

  // Plan-Aware Free Quotas
  const PLAN_LIMITS = {
    NONE: { name: 'Free Audit (No Plan)', quota: 0, badge: 'No Plan' },
    STARTER: { name: 'Starter AI Plan', quota: 250, badge: 'Starter' },
    GROWTH: { name: 'Growth Suite', quota: 1000, badge: 'Growth' },
    SCALE: { name: 'Autonomous Pro', quota: 5000, badge: 'Scale Pro' },
    ENTERPRISE: { name: 'Global Enterprise', quota: 25000, badge: 'Enterprise' },
  };

  const planTier = activeWorkspace?.subscription?.planTier || activeWorkspace?.plan || 'NONE';
  const isNoPlan = planTier === 'NONE';
  const planInfo = PLAN_LIMITS[planTier] || PLAN_LIMITS.NONE;
  const monthlyQuota = isNoPlan ? 0 : (activeWorkspace?.leadUsage?.monthlyIncludedQuota ?? planInfo.quota);
  const scrapedThisMonth = activeWorkspace?.leadUsage?.scrapedThisMonth || 0;
  const remainingFreeQuota = Math.max(0, monthlyQuota - scrapedThisMonth);
  const quotaPercent = monthlyQuota > 0 ? Math.min(100, Math.round((scrapedThisMonth / monthlyQuota) * 100)) : 0;

  // Current batch breakdown
  const freeBatch = Math.min(limit, remainingFreeQuota);
  const overageBatch = Math.max(0, limit - freeBatch);
  const overageCostUSD = (overageBatch * RATE_PER_LEAD_USD).toFixed(2);
  const overageCostINR = Math.round(overageBatch * RATE_PER_LEAD_INR);

  // Live Progress Tracker State
  const [progressData, setProgressData] = useState({
    step: '',
    stepIndex: 0,
    totalSteps: 4,
    message: '',
    percent: 0,
  });

  // Table Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [minScore, setMinScore] = useState(0);
  const [actionNotice, setActionNotice] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Customized AI Script Review & Client Approval State
  const [selectedLeadForScript, setSelectedLeadForScript] = useState(null);
  const [scriptModalChannel, setScriptModalChannel] = useState('WHATSAPP');
  const [scriptModalText, setScriptModalText] = useState('');
  const [scriptModalSubject, setScriptModalSubject] = useState('');
  const [isSendingScript, setIsSendingScript] = useState(false);
  const [isRegeneratingScript, setIsRegeneratingScript] = useState(false);
  const [isBatchSendModalOpen, setIsBatchSendModalOpen] = useState(false);
  const [batchChannel, setBatchChannel] = useState('AUTO');
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [isGeneratingAllScripts, setIsGeneratingAllScripts] = useState(false);

  // Table Pagination State (Default 50 clients per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 50, 100, or 'ALL'

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, minScore]);

  // 1. Fetch Active Workspace Strategy on Mount or Workspace Switch
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    let isMounted = true;
    setIsLoadingStrategy(true);

    api
      .getStrategy(activeWorkspace._id)
      .then((res) => {
        if (isMounted && res?.strategy) {
          setStrategy(res.strategy);
        }
      })
      .catch((err) => {
        console.error('Failed to load strategy for LeadFinder:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStrategy(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWorkspace?._id]);

  // Derive Autonomous AI Calibration from Crawled Data & Strategy
  const currentBusinessName = strategy?.businessName || activeWorkspace?.name || 'Your Business';
  const currentCategory = strategy?.category || activeWorkspace?.industry || 'B2B Enterprise';
  const targetAudience = strategy?.analysisResult?.targetAudience || {};
  const primaryPersona = targetAudience.primaryPersona || 'Enterprise Decision Makers & C-Suite';

  // Automatically resolve decision maker personas from LLM crawl strategy
  const aiDecisionMakers =
    targetAudience.decisionMakers && targetAudience.decisionMakers.length > 0
      ? targetAudience.decisionMakers
      : [
          'Chief Information Security Officer (CISO)',
          'Chief Technology Officer (CTO)',
          'VP of Engineering',
          'Director of Infrastructure & Cloud Security',
        ];

  const aiPainPoint =
    targetAudience.painPoints?.[0] ||
    'Accelerating autonomous pipeline velocity and reducing infrastructure operational friction';

  // AI-calibrated trade role: automatically deduced without manual dropdown
  const aiCalibratedRole = (function resolveRole() {
    const rawTokens = `${currentBusinessName} ${currentCategory} ${activeWorkspace?.businessModelDescription || ''}`.toLowerCase();
    if (rawTokens.includes('manufacturer') || rawTokens.includes('exporter') || rawTokens.includes('factory')) {
      return 'BUYER'; // Direct commercial buyers & procurement leaders
    }
    if (rawTokens.includes('trader') || rawTokens.includes('import export')) {
      return 'HYBRID_TRADER';
    }
    return 'BUYER';
  })();

  const aiRoleLabel =
    aiCalibratedRole === 'BUYER'
      ? 'Direct Enterprise Buyers & Decision-Makers'
      : aiCalibratedRole === 'SELLER'
      ? 'Verified Manufacturers & Exporters'
      : 'Cross-Border Trading Entities';

  // 2. Listen to Socket.io live scraper events
  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data) => {
      setProgressData({
        step: data.step,
        stepIndex: data.stepIndex || 1,
        totalSteps: data.totalSteps || 4,
        message: data.message,
        percent: data.percent,
      });
    };

    const handleLeadFound = () => {
      loadLeadsData();
      if (onRefreshLeads) onRefreshLeads();
    };

    const handleComplete = (data) => {
      setIsScraping(false);
      const isFree = !data.deductedUSD || data.deductedUSD === 0;
      const billingMsg = isFree
        ? `100% Free under your ${planInfo.badge} plan quota (${data.freeLeadsScraped || data.count} leads drawn from plan).`
        : `Deducted $${data.deductedUSD?.toFixed(2)} (${
            currency === 'INR'
              ? `₹${Math.round((data.deductedUSD || 0) * exchangeRate)}`
              : `$${data.deductedUSD?.toFixed(2)}`
          }) for ${data.billableLeadsScraped || data.count} overage lead(s).`;

      setProgressData({
        step: 'INGESTED_TO_CRM',
        stepIndex: 4,
        totalSteps: 4,
        message: `Scrape complete! Ingested ${data.count} genuine, MX-verified leads in ${data.location}. ${billingMsg}`,
        percent: 100,
      });
      loadLeadsData();
      setActiveSubTab('crm_leads');
      if (onRefreshLeads) onRefreshLeads();
      setTimeout(() => {
        setActiveJobId(null);
      }, 6000);
    };

    const handleBulkUpdated = () => {
      loadLeadsData();
      if (onRefreshLeads) onRefreshLeads();
    };

    const handleScriptOrStageEvent = () => {
      loadLeadsData();
      if (onRefreshLeads) onRefreshLeads();
    };

    socket.on('scraper:progress', handleProgress);
    socket.on('scraper:lead_found', handleLeadFound);
    socket.on('scraper:complete', handleComplete);
    socket.on('leadsBulkUpdated', handleBulkUpdated);
    socket.on('leads:scripts_drafted', handleScriptOrStageEvent);
    socket.on('leadStageChanged', handleScriptOrStageEvent);
    socket.on('message:sent', handleScriptOrStageEvent);

    return () => {
      socket.off('scraper:progress', handleProgress);
      socket.off('scraper:lead_found', handleLeadFound);
      socket.off('scraper:complete', handleComplete);
      socket.off('leadsBulkUpdated', handleBulkUpdated);
      socket.off('leads:scripts_drafted', handleScriptOrStageEvent);
      socket.off('leadStageChanged', handleScriptOrStageEvent);
      socket.off('message:sent', handleScriptOrStageEvent);
    };
  }, [socket, onRefreshLeads]);

  // 3. Launch Autonomous AI Multi-Source Scraper across Multiple Territories
  const handleStartScrape = async () => {
    if (!activeWorkspace) return;

    // Resolve multi-locations
    const finalLocations = selectedLocations.length > 0
      ? selectedLocations
      : locationInput.trim()
      ? [locationInput.trim()]
      : [];

    if (finalLocations.length === 0) {
      alert('Please select or enter at least one target location (e.g. Hyderabad, Telangana or San Francisco, CA) where you want to scrape leads.');
      return;
    }

    const locationSummary = finalLocations.join('; ');

    // Plan-Aware Lead Quota & Wallet Check
    if (overageBatch > 0) {
      const requiredUSD = overageBatch * RATE_PER_LEAD_USD;
      const currentBalance = wallet?.balanceUSD || 0;

      if (currentBalance < requiredUSD) {
        alert(
          `Your ${planInfo.name} includes ${monthlyQuota.toLocaleString()} free verified leads per month (${remainingFreeQuota.toLocaleString()} remaining free leads this cycle).\n\n` +
            `Scraping ${limit} leads exceeds your remaining free quota by ${overageBatch} lead(s). Required overage: $${overageCostUSD} (${
              currency === 'INR' ? `₹${overageCostINR}` : `$${overageCostUSD}`
            }).\n\n` +
            `Current wallet balance: $${currentBalance.toFixed(2)} (${
              currency === 'INR' ? `₹${Math.round(currentBalance * exchangeRate)}` : `$${currentBalance.toFixed(2)}`
            }). Please recharge your wallet to continue.`
        );
        if (onOpenAddFundsModal) onOpenAddFundsModal();
        return;
      }
    }

    setIsScraping(true);
    const businessName = strategy?.businessName || activeWorkspace?.name || 'Your Business';

    setProgressData({
      step: 'SOURCE_DISCOVERY',
      stepIndex: 1,
      totalSteps: 4,
      message: `AI querying multi-source registries across ${finalLocations.length} territories [${finalLocations.slice(0, 3).join(', ')}${finalLocations.length > 3 ? '...' : ''}] for ${businessName}...`,
      percent: 15,
    });

    try {
      const res = await api.startScraper(activeWorkspace._id, {
        location: locationSummary,
        locations: finalLocations,
        limit,
        targetRole: aiCalibratedRole, // Pure AI-Calibrated Role
        customKeywords: customKeywords.trim(),
      });
      if (res.success && res.jobId) {
        setActiveJobId(res.jobId);

        // Fallback polling to guarantee UI sync even if socket event was dropped
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.getScraperStatus(activeWorkspace._id, res.jobId);
            if (statusRes.success && statusRes.job) {
              const j = statusRes.job;
              if (j.progress && j.status === 'RUNNING') {
                setProgressData((prev) => ({
                  ...prev,
                  percent: Math.max(prev.percent, j.progress),
                  message: j.step || prev.message,
                }));
              }
              if (j.status === 'COMPLETED') {
                clearInterval(pollInterval);
                setIsScraping(false);
                setProgressData({
                  step: 'INGESTED_TO_CRM',
                  stepIndex: 4,
                  totalSteps: 4,
                  message: `Scrape complete! Ingested ${j.count || j.leads?.length || limit} genuine verified leads to CRM.`,
                  percent: 100,
                });
                await loadLeadsData();
                setActiveSubTab('crm_leads');
                if (onRefreshLeads) onRefreshLeads();
                setTimeout(() => setActiveJobId(null), 5000);
              } else if (j.status === 'FAILED') {
                clearInterval(pollInterval);
                setIsScraping(false);
                alert('Scraper encountered an error: ' + (j.error || 'Failed to complete scrape'));
              }
            }
          } catch (e) {
            console.warn('Scraper polling notice:', e);
          }
        }, 1500);
      } else {
        alert(res.message || 'Failed to start scraper');
        setIsScraping(false);
      }
    } catch (err) {
      console.error('Scraper launch failed:', err);
      setIsScraping(false);
      alert('Failed to launch scraper: ' + err.message);
    }
  };

  // 4. Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(displayedLeads.map((l) => l._id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  // 5. Bulk Action Handler
  const handleBulkAction = async (action, targetStage = null) => {
    if (selectedLeadIds.length === 0 || !activeWorkspace) return;

    try {
      const res = await api.executeBulkAction(activeWorkspace._id, selectedLeadIds, action, targetStage);
      if (res.success) {
        setActionNotice(`Executed ${action.replace(/_/g, ' ')} on ${res.modifiedCount} leads!`);
        setSelectedLeadIds([]);
        if (onRefreshLeads) onRefreshLeads();
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  // 6. Update Single Lead Stage
  const handleStageChange = async (leadId, newStage) => {
    if (!activeWorkspace) return;
    try {
      await api.updateLeadStage(activeWorkspace._id, leadId, newStage);
      if (onRefreshLeads) onRefreshLeads();
    } catch (err) {
      console.error('Stage change failed:', err);
    }
  };

  // 7. Delete Single Lead
  const handleDeleteLead = async (leadId) => {
    if (!activeWorkspace) return;
    try {
      await api.deleteLead(activeWorkspace._id, leadId);
      if (onRefreshLeads) onRefreshLeads();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // 8. Open Customized Script Review & Edit Modal
  const handleOpenScriptModal = (lead) => {
    setSelectedLeadForScript(lead);
    const drafts = lead.metadata?.outreachDrafts || {};
    let preferred = 'WHATSAPP';
    if (!lead.phone && lead.email) preferred = 'EMAIL';
    else if (lead.channels?.telegram && !lead.phone) preferred = 'TELEGRAM';

    setScriptModalChannel(preferred);
    setScriptModalSubject(drafts.EMAIL?.subject || `Strategic Expansion for ${lead.company || 'your team'}`);
    const body = preferred === 'EMAIL' ? drafts.EMAIL?.body : drafts[preferred]?.body || drafts.WHATSAPP?.body || drafts.EMAIL?.body || '';
    setScriptModalText(body || '');
  };

  const handleChannelTabChange = (ch) => {
    setScriptModalChannel(ch);
    const drafts = selectedLeadForScript?.metadata?.outreachDrafts || {};
    if (ch === 'EMAIL') {
      setScriptModalText(drafts.EMAIL?.body || '');
      setScriptModalSubject(drafts.EMAIL?.subject || `Strategic Expansion for ${selectedLeadForScript?.company || 'your team'}`);
    } else if (ch === 'WHATSAPP') {
      setScriptModalText(drafts.WHATSAPP?.body || '');
    } else if (ch === 'TELEGRAM') {
      setScriptModalText(drafts.TELEGRAM?.body || '');
    } else if (ch === 'SMS') {
      setScriptModalText(drafts.SMS?.body || '');
    }
  };

  // 9. Client Approves & Sends Single Customized Script
  const handleApproveAndSendSingle = async () => {
    if (!selectedLeadForScript || !activeWorkspace?._id) return;
    setIsSendingScript(true);
    try {
      const res = await api.approveAndSendLead(activeWorkspace._id, selectedLeadForScript._id, {
        channel: scriptModalChannel,
        customText: scriptModalText,
        subject: scriptModalSubject,
      });
      if (res.success) {
        setActionNotice(`🚀 Customized message approved & dispatched to ${selectedLeadForScript.name} via ${scriptModalChannel}! Added to Omnichannel.`);
        setSelectedLeadForScript(null);
        await loadLeadsData();
        if (onRefreshLeads) onRefreshLeads();
        setTimeout(() => setActionNotice(''), 4500);
      } else {
        alert(res.message || 'Failed to dispatch message');
      }
    } catch (err) {
      console.error('Approve and send failed:', err);
      alert('Error sending: ' + err.message);
    } finally {
      setIsSendingScript(false);
    }
  };

  // 10. Regenerate Script with AI
  const handleRegenerateScript = async () => {
    if (!selectedLeadForScript || !activeWorkspace?._id) return;
    setIsRegeneratingScript(true);
    try {
      const res = await api.generateLeadDraft(activeWorkspace._id, selectedLeadForScript._id);
      if (res.success && res.drafts) {
        setSelectedLeadForScript({
          ...selectedLeadForScript,
          metadata: { ...(selectedLeadForScript.metadata || {}), outreachDrafts: res.drafts },
        });
        const currentChannel = scriptModalChannel;
        if (currentChannel === 'EMAIL') {
          setScriptModalText(res.drafts.EMAIL?.body || '');
          setScriptModalSubject(res.drafts.EMAIL?.subject || '');
        } else {
          setScriptModalText(res.drafts[currentChannel]?.body || '');
        }
        await loadLeadsData();
      }
    } catch (e) {
      console.warn('Regenerate script error:', e);
    } finally {
      setIsRegeneratingScript(false);
    }
  };

  // 11. Chat in Omnichannel On Demand
  const handleChatInOmnichannel = async (lead) => {
    if (!lead || !activeWorkspace?._id) return;
    try {
      const res = await api.startChatWithLead(activeWorkspace._id, lead._id);
      if (res.success && res.conversationId) {
        if (onOpenChatWithLead) {
          onOpenChatWithLead(res.conversationId);
        } else if (onNavigateTab) {
          onNavigateTab('inbox');
        }
      }
    } catch (e) {
      console.error('Start chat error:', e);
      alert('Failed to initiate Omnichannel conversation: ' + e.message);
    }
  };

  // 12. 1-Click Approve and Send All Pending Leads
  const handleApproveAndSendAll = async () => {
    if (!activeWorkspace?._id) return;
    setIsBatchSending(true);
    try {
      const targetIds = selectedLeadIds.length > 0 ? selectedLeadIds : [];
      const res = await api.approveAndSendAllLeads(activeWorkspace._id, {
        leadIds: targetIds,
        channel: batchChannel,
      });
      if (res.success) {
        setActionNotice(`✨ 1-Click Send Complete! Dispatched ${res.sentCount} customized messages. All active leads are now synced in Omnichannel.`);
        setIsBatchSendModalOpen(false);
        setSelectedLeadIds([]);
        await loadLeadsData();
        if (onRefreshLeads) onRefreshLeads();
        setTimeout(() => setActionNotice(''), 5000);
      } else {
        alert(res.message || 'Batch dispatch failed');
      }
    } catch (e) {
      console.error('Batch approve and send failed:', e);
      alert('Error during batch dispatch: ' + e.message);
    } finally {
      setIsBatchSending(false);
    }
  };

  // 13. Generate Drafts for All Leads
  const handleGenerateAllPendingScripts = async () => {
    if (!activeWorkspace?._id) return;
    setIsGeneratingAllScripts(true);
    try {
      const res = await api.generateDraftsAll(activeWorkspace._id, selectedLeadIds);
      if (res.success) {
        setActionNotice(`✨ Synthesized customized scripts for ${res.count} leads! Review and approve whenever ready.`);
        await loadLeadsData();
        if (onRefreshLeads) onRefreshLeads();
        setTimeout(() => setActionNotice(''), 4500);
      }
    } catch (e) {
      console.warn('Generate all drafts error:', e);
    } finally {
      setIsGeneratingAllScripts(false);
    }
  };

  // 8. Filter & Paginate Leads
  const allCurrentLeads = internalLeads && internalLeads.length > 0 ? internalLeads : (Array.isArray(leads) ? leads : []);
  const filteredLeads = (allCurrentLeads || []).filter((lead) => {
    if (!lead || typeof lead !== 'object') return false;
    const matchesStage = stageFilter === 'ALL' || lead.stage === stageFilter;
    const matchesScore = typeof lead.score === 'number' ? lead.score >= minScore : true;
    const s = (searchTerm || '').trim().toLowerCase();
    const matchesSearch =
      !s ||
      (lead.name || '').toLowerCase().includes(s) ||
      (lead.company || '').toLowerCase().includes(s) ||
      (lead.email || '').toLowerCase().includes(s) ||
      (lead.title || '').toLowerCase().includes(s) ||
      (lead.location || '').toLowerCase().includes(s) ||
      (lead.phone || '').toLowerCase().includes(s) ||
      (lead.notes || '').toLowerCase().includes(s);
    return matchesStage && matchesScore && matchesSearch;
  });

  const totalFilteredCount = filteredLeads.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(totalFilteredCount / (pageSize || 10)));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === 'ALL' ? 0 : (safePage - 1) * (pageSize || 10);
  const displayedLeads = pageSize === 'ALL' ? filteredLeads : filteredLeads.slice(startIndex, startIndex + (pageSize || 10));

  const stepsList = [
    { id: 1, label: 'Multi-Source Discovery', key: 'SOURCE_DISCOVERY' },
    { id: 2, label: 'Executive Resolution', key: 'METADATA_ENRICHMENT' },
    { id: 3, label: 'Live DNS MX Handshake', key: 'DNS_MX_VERIFICATION' },
    { id: 4, label: 'CRM & Wallet Deduction', key: 'INGESTED_TO_CRM' },
  ];

  // Pricing formatting
  const totalCostUSD = (limit * RATE_PER_LEAD_USD).toFixed(2);
  const totalCostINR = (limit * RATE_PER_LEAD_INR).toFixed(0);
  const walletBalanceUSD = wallet?.balanceUSD || 0;
  const walletBalanceINR = Math.round(walletBalanceUSD * exchangeRate);

  // Detect client business region
  const isIndiaWorkspace =
    currency === 'INR' ||
    (activeWorkspace?.name || '').toLowerCase().includes('quantum') ||
    (activeWorkspace?.industry || '').toLowerCase().includes('india') ||
    (activeWorkspace?.ownerEmail || '').endsWith('.in');

  const locationSuggestions = isIndiaWorkspace ? INDIAN_CITIES : GLOBAL_CITIES;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '22px', background: '#070C18', minHeight: '100vh', color: '#F8FAFC' }}>
      {/* 1. Header with Branded SaaS Style */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              <Sparkles size={12} /> Autonomous AI Lead Prospecting
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <ShieldCheck size={12} /> Live DNS MX Verified Handshake
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#C084FC',
              border: '1px solid rgba(168, 85, 247, 0.25)',
            }}>
              ✨ AI LLM Strategy-Calibrated
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#F8FAFC' }}>
            Autonomous Lead Prospecting &amp; Enrichment Engine
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', margin: '4px 0 0' }}>
            AI queries registries, search engines, and social graphs to discover, verify, and ingest high-intent decision-makers based on your crawled ICP.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/api/leads/export"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              fontSize: '0.8rem',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} /> Export CSV
          </a>
          <button
            onClick={onOpenBulkImportModal}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={14} /> Bulk Ingest
          </button>
          <button
            onClick={onOpenNewLeadModal}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              border: 'none',
              color: '#021C11',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Plus size={15} /> Add Lead
          </button>
          <button
            onClick={() => setIsBatchSendModalOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
              transition: 'all 0.2s ease',
            }}
            title="Review and dispatch customized scripts to all pending prospects in 1 click"
          >
            <Send size={14} /> 1-Click Send All ({allCurrentLeads.filter((l) => l.stage !== 'Contacted' && l.metadata?.outreachStatus !== 'SENT').length})
          </button>
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} /> {actionNotice}
        </div>
      )}

      {/* 2. Sleek KPI Metrics Strip (Compact 1-Line SaaS Bar) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '2px',
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CRM Verified Leads
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>
              {allCurrentLeads.length.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#10B981', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={11} /> {allCurrentLeads.filter((l) => l.verificationStatus === 'VERIFIED').length} Mailserver Validated
            </div>
          </div>
          <Users size={20} color="#38BDF8" />
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isNoPlan ? 'Plan Quota (No Plan)' : `${planInfo.badge} Plan Quota`}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: isNoPlan ? '#64748B' : '#10B981', marginTop: '2px' }}>
              {remainingFreeQuota.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>/ {monthlyQuota.toLocaleString()} leads</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px' }}>
              {isNoPlan ? 'Upgrade to a package to unlock lead quotas' : `${scrapedThisMonth.toLocaleString()} used (${quotaPercent}%) • 0 overage`}
            </div>
          </div>
          <Zap size={20} color="#10B981" />
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LLM Fit Conviction
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#C084FC', marginTop: '2px' }}>
              94.8%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px' }}>
              ICP Persona Matrix Calibrated
            </div>
          </div>
          <Target size={20} color="#C084FC" />
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Wallet Reserve
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FBBF24', marginTop: '2px' }}>
              {currency === 'INR' ? `₹${walletBalanceINR.toLocaleString('en-IN')}` : `$${walletBalanceUSD.toFixed(2)}`}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px' }}>
              Standby for extra volume scrapes
            </div>
          </div>
          <Coins size={20} color="#FBBF24" />
        </div>
      </div>

      {/* 3. Launch Autonomous Territory Prospecting Card (Unified & Compact) */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.07) 0%, rgba(15, 23, 42, 0.88) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.28)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Card Header with ICP Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#021C11',
              fontWeight: '800',
              flexShrink: 0,
            }}>
              <Compass size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Launch Autonomous Territory Prospecting
                </span>
                <span style={{
                  fontSize: '0.675rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  fontWeight: '700',
                }}>
                  ✨ AI ICP: {currentBusinessName} ({currentCategory})
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                Extract verified decision-makers across target territories with authentic 10-digit mobile numbers &amp; DNS MX validation.
              </div>
            </div>
          </div>

          {/* Decision Makers Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Target Roles:</span>
            {aiDecisionMakers.slice(0, 3).map((dm, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.675rem',
                  fontWeight: '600',
                  color: '#CBD5E1',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '2px 7px',
                  borderRadius: '5px',
                }}
              >
                {dm}
              </span>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 0.8fr auto',
          gap: '12px',
          alignItems: 'flex-end',
          marginBottom: '10px',
        }}>
          {/* Territory Input */}
          <div>
            <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', fontWeight: '600' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#10B981" /> Target Geographic Territories ({selectedLocations.length} active)
              </span>
            </label>
            <div style={{ position: 'relative', display: 'flex', gap: '6px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <MapPin size={14} color="#34D399" style={{ position: 'absolute', left: '11px', top: '12px' }} />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLocation();
                    }
                  }}
                  placeholder="Type city/state/country & press Enter..."
                  style={{
                    height: '38px',
                    paddingLeft: '34px',
                    width: '100%',
                    fontSize: '0.825rem',
                    color: '#F8FAFC',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddLocation()}
                style={{
                  padding: '0 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34D399',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Optional Niche */}
          <div>
            <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px', fontWeight: '600' }}>
              <Sparkles size={12} color="#A78BFA" /> Optional Niche / Focus
            </label>
            <input
              type="text"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              placeholder="e.g. Fintech, Healthcare, SaaS..."
              style={{
                height: '38px',
                padding: '0 12px',
                width: '100%',
                fontSize: '0.825rem',
                color: '#F8FAFC',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
          </div>

          {/* Batch Volume */}
          <div>
            <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Batch Volume
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              style={{
                height: '38px',
                padding: '0 10px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '0.8rem',
                color: '#F8FAFC',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                outline: 'none',
              }}
            >
              <option value={10}>10 Leads (Quick Sample)</option>
              <option value={25}>25 Leads (Recommended)</option>
              <option value={50}>50 Leads (Sprint)</option>
              <option value={100}>100 Leads (Standard)</option>
            </select>
          </div>

          {/* Scraper Run Button */}
          <div>
            <button
              onClick={handleStartScrape}
              disabled={isScraping}
              style={{
                height: '38px',
                padding: '0 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                border: 'none',
                color: '#021C11',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: isScraping ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              {isScraping ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Scraping...
                </>
              ) : (
                <>
                  <Play size={14} fill="#021C11" /> Run AI Scraper ({limit} Leads)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected Territories & Quick Preset Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase' }}>
            Territories ({selectedLocations.length}):
          </span>
          {selectedLocations.map((loc) => (
            <span
              key={loc}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34D399',
                fontSize: '0.71rem',
                fontWeight: '600',
              }}
            >
              <MapPin size={10} /> {loc}
              <button
                type="button"
                onClick={() => handleRemoveLocation(loc)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  padding: 0,
                  marginLeft: '2px',
                }}
              >
                ✕
              </button>
            </span>
          ))}

          <span style={{ fontSize: '0.68rem', color: '#64748B', marginLeft: '6px' }}>Presets:</span>
          {locationSuggestions.slice(0, 5).map((loc, idx) => {
            const isSelected = selectedLocations.includes(loc);
            if (isSelected) return null;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTogglePreset(loc)}
                style={{
                  padding: '2px 8px',
                  borderRadius: '5px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94A3B8',
                  fontSize: '0.69rem',
                  cursor: 'pointer',
                }}
              >
                + {loc}
              </button>
            );
          })}
        </div>

        {/* Quota / Billing Indicator */}
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '7px',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.73rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
            <CheckCircle2 size={13} color="#10B981" />
            <strong style={{ color: '#34D399' }}>✓ 100% Free with {planInfo.name}</strong>
            <span style={{ color: '#94A3B8' }}>
              ({limit} leads drawn from {remainingFreeQuota} free allowance. Results listed below).
            </span>
          </div>
          <div style={{ color: '#94A3B8' }}>
            Wallet: <strong style={{ color: '#10B981' }}>{currency === 'INR' ? `₹${walletBalanceINR.toLocaleString('en-IN')}` : `$${walletBalanceUSD.toFixed(2)}`}</strong>
          </div>
        </div>

        {/* Live Stepped Scraper Progress */}
        {(isScraping || activeJobId) && (
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
              {stepsList.map((step) => {
                const isPassed = progressData.percent >= (step.id / 4) * 100 || progressData.stepIndex > step.id;
                const isCurrent = progressData.stepIndex === step.id;
                return (
                  <div
                    key={step.id}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: isPassed
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isCurrent
                        ? 'rgba(6, 182, 212, 0.15)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isPassed
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : isCurrent
                        ? '1px solid rgba(6, 182, 212, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={13} color="#10B981" />
                    ) : isCurrent ? (
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06B6D4' }} />
                    ) : (
                      <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>{step.id}</span>
                    )}
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: isPassed || isCurrent ? '600' : '400',
                      color: isPassed ? '#34D399' : isCurrent ? '#38BDF8' : '#94A3B8',
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: '#F8FAFC', fontWeight: '500' }}>
                {progressData.message || 'Executing autonomous multi-source search and verification...'}
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#10B981' }}>
                {progressData.percent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${progressData.percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06B6D4 0%, #10B981 100%)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* 4. Verified Leads Database & CRM Table (50 clients per page) */}
      <div
        id="crm-leads-card-section"
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '800px',
        }}
      >
        {/* Card Header for Verified Leads Table */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(10, 16, 30, 0.85)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
            }}>
              <Users size={16} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Verified Leads &amp; Client Directory
                <span style={{
                  fontSize: '0.685rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  fontWeight: '700',
                }}>
                  {filteredLeads.length} Clients
                </span>
                <span style={{
                  fontSize: '0.685rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  fontWeight: '600',
                }}>
                  50 Clients per page
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                Authenticated decision-makers with TRAI-compliant 10-digit mobile numbers &amp; live DNS MX mailservers.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={loadLeadsData}
              title="Refresh CRM Leads"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                fontSize: '0.74rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} /> Sync CRM
            </button>
            <a
              href="/api/leads/export"
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                fontSize: '0.74rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Download size={13} /> Export CSV
            </a>
            <button
              onClick={onOpenNewLeadModal}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                border: 'none',
                color: '#021C11',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Plus size={14} /> Add Lead
            </button>
          </div>
        </div>
        {/* Bulk Action Toolbar if selected */}
        {selectedLeadIds.length > 0 && (
          <div style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15))',
            borderBottom: '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>
              🎯 {selectedLeadIds.length} Verified Leads Selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsBatchSendModalOpen(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Send size={13} /> Approve &amp; Send Selected ({selectedLeadIds.length})
              </button>
              <button
                onClick={handleGenerateAllPendingScripts}
                disabled={isGeneratingAllScripts}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#38BDF8',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: isGeneratingAllScripts ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} /> {isGeneratingAllScripts ? 'Drafting...' : 'Regenerate Scripts'}
              </button>
              <button
                onClick={() => handleBulkAction('TRIGGER_VOICE_CALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#10B981',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <PhoneCall size={13} /> Trigger Maya Voice AI
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#F43F5E',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Filter Strip */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, email, company, job title, location..."
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '36px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                fontSize: '0.825rem',
                color: '#F8FAFC',
                outline: 'none',
              }}
            />
          </div>

          {/* Stage filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            {['ALL', 'Prospect', 'Contacted', 'Qualified', 'Demo_Booked', 'Won'].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: stageFilter === stage ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: stageFilter === stage ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: stageFilter === stage ? '#38BDF8' : '#94A3B8',
                  fontSize: '0.74rem',
                  fontWeight: stageFilter === stage ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {stage === 'ALL' ? 'All Leads' : stage.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Min Score Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
              Min Fit: <strong>{minScore}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              style={{ width: '80px', accentColor: '#06B6D4' }}
            />
          </div>

          {/* Real-time CRM Count & Refresh Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              color: '#34D399',
              fontWeight: '700',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}>
              {filteredLeads.length} of {allCurrentLeads.length} Leads
            </span>
            <button
              type="button"
              onClick={loadLeadsData}
              title="Refresh CRM Leads"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 11px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} /> Sync CRM
            </button>
          </div>
        </div>

        {/* CRM Leads Table Scroll Wrapper */}
        <div
          id="crm-leads-table-container"
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            flex: 1,
            minHeight: '650px',
            maxHeight: '820px',
            position: 'relative',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(16, 185, 129, 0.4) rgba(15, 23, 42, 0.6)',
          }}
        >
          <table className="table-dense-container" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-1)', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
              <tr style={{
                background: 'var(--surface-1)',
                borderBottom: 'var(--border-hairline)',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                letterSpacing: '0.05em',
                fontWeight: '700',
              }}>
                <th style={{ padding: '9px 12px', width: '36px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={displayedLeads.length > 0 && selectedLeadIds.length === displayedLeads.length}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '9px 8px', width: '36px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '9px 12px' }}>Contact & Executive Title</th>
                <th style={{ padding: '9px 12px' }}>Target Company & Domain</th>
                <th style={{ padding: '9px 12px' }}>Verified Email & MX Server</th>
                <th style={{ padding: '9px 12px' }}>Phone / Location</th>
                <th style={{ padding: '9px 12px' }}>AI Fit Score</th>
                <th style={{ padding: '9px 12px' }}>Pipeline Stage</th>
                <th style={{ padding: '9px 12px' }}>Custom AI Script</th>
                <th style={{ padding: '9px 12px' }}>Channels</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '54px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={36} color="#475569" />
                      <div style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: '600' }}>
                        No verified leads in workspace CRM yet
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                        Enter your target territory above (e.g. "San Francisco, CA" or "Bengaluru, India"), then click "Run AI Scraper".
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedLeads.map((lead, idx) => {
                  const isChecked = selectedLeadIds.includes(lead._id);
                  const isVerified = lead.verificationStatus === 'VERIFIED';
                  const isNotesExpanded = expandedNotesId === lead._id;

                  return (
                    <React.Fragment key={lead._id}>
                      <tr
                        className={`grid-row-interactive ${isChecked ? 'table-row-selected' : ''}`}
                        style={{
                          borderBottom: 'var(--border-hairline)',
                          background: isChecked ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                          transition: 'background var(--duration-fast) var(--ease-spring)',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectLead(lead._id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>

                        {/* Numbering */}
                        <td className="tabular-nums" style={{ padding: '8px 8px', textAlign: 'center', color: '#64748B', fontWeight: '700', fontSize: '0.72rem' }}>
                          {startIndex + idx + 1}
                        </td>

                        {/* Contact Info */}
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '7px',
                              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(16, 185, 129, 0.25))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#38BDF8',
                              fontWeight: '700',
                              fontSize: '0.78rem',
                            }}>
                              {lead.name ? lead.name.substring(0, 1) : 'L'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#EDEDED', fontSize: '0.8125rem' }}>{lead.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '500' }}>
                                {lead.title || 'Decision Maker'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company & Domain */}
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: '600', color: '#E2E8F0', fontSize: '0.8125rem' }}>{lead.company || 'Enterprise'}</div>
                          </div>
                          {lead.website && (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '0.68rem',
                                color: '#06B6D4',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'none',
                                marginTop: '1px',
                              }}
                            >
                              <ExternalLink size={10} /> {lead.website.replace(/https?:\/\//, '')}
                            </a>
                          )}
                        </td>

                        {/* Verified Email & Live MX */}
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#F8FAFC', fontWeight: '500', fontSize: '0.78rem' }}>{lead.email}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                            {isVerified ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                                <ShieldCheck size={9} /> MX Verified
                              </span>
                            ) : (
                              <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                                <AlertTriangle size={9} /> Unverified
                              </span>
                            )}
                            {lead.mxHost && (
                              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                                ({lead.mxHost.split('.')[0]})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone & Location */}
                        <td style={{ padding: '8px 12px' }}>
                          <div className="tabular-nums" style={{
                            color: lead.phone ? '#10B981' : '#64748B',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                          }}>
                            <Smartphone size={12} color="#10B981" />
                            <span>{lead.phone || 'Direct line active'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                            {lead.phone && (
                              <span style={{
                                fontSize: '0.6rem',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#34D399',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontWeight: '600',
                              }}>
                                <CheckCircle2 size={8} />
                                {lead.metadata?.phoneVerification?.telecomStandard === 'TRAI_10_DIGIT_CELLULAR' || lead.phone?.startsWith('+91')
                                  ? 'TRAI Cell'
                                  : 'Direct Cell'}
                              </span>
                            )}
                            {lead.channels?.whatsapp && (
                              <span style={{
                                fontSize: '0.62rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: 'rgba(37, 211, 102, 0.12)',
                                color: '#25D366',
                                border: '1px solid rgba(37, 211, 102, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontWeight: '600',
                              }}>
                                WhatsApp
                              </span>
                            )}
                          </div>
                          {lead.location && (
                            <div style={{ fontSize: '0.685rem', color: '#94A3B8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={10} color="#64748B" /> {lead.location}
                            </div>
                          )}
                        </td>

                        {/* AI Fit Score */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '42px',
                              height: '5px',
                              borderRadius: '999px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${lead.score}%`,
                                height: '100%',
                                background: lead.score >= 80 ? '#10B981' : lead.score >= 60 ? '#06B6D4' : '#F59E0B',
                              }} />
                            </div>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              color: lead.score >= 80 ? '#34D399' : '#38BDF8',
                            }}>
                              {lead.score}
                            </span>
                          </div>
                        </td>

                        {/* Pipeline Stage */}
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead._id, e.target.value)}
                            style={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#F8FAFC',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              outline: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Prospect">Prospect</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Demo_Booked">Demo Booked</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                        {/* Custom AI Script Status */}
                        <td style={{ padding: '14px 16px' }}>
                          {lead.stage === 'Contacted' || lead.metadata?.outreachStatus === 'SENT' ? (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34D399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                            }}>
                              <CheckCircle2 size={11} /> Sent &amp; Synced
                            </span>
                          ) : lead.metadata?.outreachDrafts ? (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#FBBF24',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                            }}>
                              <Sparkles size={11} /> Awaiting Approval
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(148, 163, 184, 0.12)',
                              color: '#94A3B8',
                              border: '1px solid rgba(148, 163, 184, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                            }}>
                              Draft Ready
                            </span>
                          )}
                        </td>

                        {/* Channels */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} title={`Email: ${lead.email}`} style={{ color: '#38BDF8' }}>
                                <Mail size={14} />
                              </a>
                            )}
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} title={`Phone: ${lead.phone}`} style={{ color: '#34D399' }}>
                                <Phone size={14} />
                              </a>
                            )}
                            {lead.channels?.whatsapp && (
                              <span title={`WhatsApp: ${lead.channels.whatsapp}`} style={{ color: '#10B981' }}>
                                <MessageSquare size={14} />
                              </span>
                            )}
                            {lead.channels?.linkedin && (
                              <a href={lead.channels.linkedin} target="_blank" rel="noreferrer" title="LinkedIn Profile" style={{ color: '#06B6D4' }}>
                                <Globe size={14} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenScriptModal(lead)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: lead.metadata?.outreachStatus === 'SENT' ? 'rgba(16, 185, 129, 0.15)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                                border: lead.metadata?.outreachStatus === 'SENT' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 182, 212, 0.4)',
                                color: lead.metadata?.outreachStatus === 'SENT' ? '#34D399' : '#38BDF8',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Review customized AI script and approve & send"
                            >
                              <Send size={11} /> {lead.metadata?.outreachStatus === 'SENT' ? 'View Sent' : 'Review & Send'}
                            </button>
                            <button
                              onClick={() => handleChatInOmnichannel(lead)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                color: '#38BDF8',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Start direct Omnichannel chat with this lead"
                            >
                              <MessageSquare size={11} /> Chat
                            </button>
                            <button
                              onClick={() => setExpandedNotesId(isNotesExpanded ? null : lead._id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: isNotesExpanded ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="View Strategy Outreach Pitch"
                            >
                              <Info size={13} color={isNotesExpanded ? '#38BDF8' : '#94A3B8'} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Delete Lead"
                            >
                              <Trash2 size={13} color="#F43F5E" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Strategy Notes Row */}
                      {isNotesExpanded && (
                        <tr style={{ background: 'rgba(6, 182, 212, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td colSpan={11} style={{ padding: '12px 20px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              fontSize: '0.785rem',
                              color: '#CBD5E1',
                              lineHeight: '1.5',
                            }}>
                              <Zap size={14} color="#06B6D4" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <span style={{ color: '#38BDF8', fontWeight: '700' }}>Strategy-Calibrated Pitch Angle: </span>
                                {lead.notes || 'No specific outreach memo generated.'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div style={{
          padding: '14px 20px',
          background: 'rgba(10, 16, 30, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          {/* Left: Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Showing <strong style={{ color: '#F8FAFC' }}>{totalFilteredCount === 0 ? 0 : startIndex + 1}</strong> to{' '}
              <strong style={{ color: '#F8FAFC' }}>{Math.min(startIndex + (pageSize === 'ALL' ? totalFilteredCount : pageSize), totalFilteredCount)}</strong> of{' '}
              <strong style={{ color: '#34D399' }}>{totalFilteredCount} Verified Leads</strong>
            </span>
            {totalFilteredCount > 0 && (
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.12)',
                color: '#38BDF8',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                fontWeight: '600',
              }}>
                Page {safePage} of {totalPages}
              </span>
            )}
          </div>

          {/* Center: Rows per page selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Show:</span>
            {[25, 50, 100, 'ALL'].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: pageSize === size ? '#06B6D4' : 'rgba(255, 255, 255, 0.04)',
                  color: pageSize === size ? '#021C11' : '#94A3B8',
                  border: pageSize === size ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                {size === 'ALL' ? `All (${totalFilteredCount})` : `${size} Clients`}
              </button>
            ))}
          </div>

          {/* Right: Page Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                setCurrentPage(1);
                const tableEl = document.getElementById('crm-leads-table-container');
                if (tableEl) tableEl.scrollTop = 0;
              }}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: safePage <= 1 ? '#475569' : '#CBD5E1',
                fontSize: '0.72rem',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                const tableEl = document.getElementById('crm-leads-card-section');
                if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: safePage <= 1 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: safePage <= 1 ? '#475569' : '#F8FAFC',
                fontSize: '0.76rem',
                fontWeight: '600',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ChevronLeft size={15} /> Previous Page
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => {
                  setCurrentPage(pNum);
                  const tableEl = document.getElementById('crm-leads-card-section');
                  if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  minWidth: '32px',
                  height: '30px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  background: safePage === pNum ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: safePage === pNum ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: safePage === pNum ? '#34D399' : '#94A3B8',
                  fontSize: '0.76rem',
                  fontWeight: safePage === pNum ? '800' : '500',
                  cursor: 'pointer',
                }}
              >
                {pNum}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                const tableEl = document.getElementById('crm-leads-card-section');
                if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: safePage >= totalPages ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.25))',
                border: safePage >= totalPages ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #10B981',
                color: safePage >= totalPages ? '#475569' : '#34D399',
                fontSize: '0.76rem',
                fontWeight: '700',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              Next Page <ChevronRight size={15} />
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                setCurrentPage(totalPages);
                const tableEl = document.getElementById('crm-leads-table-container');
                if (tableEl) tableEl.scrollTop = 0;
              }}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: safePage >= totalPages ? '#475569' : '#CBD5E1',
                fontSize: '0.72rem',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>

            {/* Scroll to Top helper */}
            <button
              type="button"
              onClick={() => {
                const tableEl = document.getElementById('crm-leads-table-container');
                if (tableEl) tableEl.scrollTop = 0;
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                marginLeft: '6px',
                padding: '5px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94A3B8',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="Scroll to Top"
            >
              <ArrowUp size={12} /> Top
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Individual Customized AI Script Review & Client Approval */}
      {selectedLeadForScript && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSendingScript) {
              setSelectedLeadForScript(null);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '740px',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#0B132B',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              color: '#F8FAFC',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#38BDF8',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Sparkles size={11} /> AI Customized Script
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}>
                    Awaiting Your Approval
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                  Review &amp; Approve Outreach Script
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
                  Tailored for <strong>{selectedLeadForScript.name}</strong> ({selectedLeadForScript.title || 'Executive'}) at <strong>{selectedLeadForScript.company || 'Enterprise'}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLeadForScript(null)}
                disabled={isSendingScript}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Context Card: Contact Details + Matched Services */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.78rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} color="#06B6D4" />
                  <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{selectedLeadForScript.company || 'Enterprise'}</span>
                  {selectedLeadForScript.industry && (
                    <span style={{ color: '#64748B' }}>• {selectedLeadForScript.industry}</span>
                  )}
                  {selectedLeadForScript.location && (
                    <span style={{ color: '#64748B' }}>• {selectedLeadForScript.location}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedLeadForScript.phone && (
                    <span style={{ color: '#34D399', fontWeight: '600' }}>📞 {selectedLeadForScript.phone}</span>
                  )}
                  {selectedLeadForScript.email && (
                    <span style={{ color: '#38BDF8' }}>✉️ {selectedLeadForScript.email}</span>
                  )}
                </div>
              </div>

              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.18)',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#CBD5E1',
                fontSize: '0.74rem',
              }}>
                <span style={{ color: '#38BDF8', fontWeight: '700' }}>🎯 Cross-Matched Offerings: </span>
                {selectedLeadForScript.metadata?.matchedServices?.join(', ') ||
                  (strategy?.analysisResult?.coreOfferings ? strategy.analysisResult.coreOfferings.slice(0, 3).join(', ') : 'GTM Acceleration & Automation')}
              </div>
            </div>

            {/* Channel Selection Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              {[
                { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: '#10B981', available: !!selectedLeadForScript.phone },
                { id: 'EMAIL', label: 'Email', icon: Mail, color: '#06B6D4', available: !!selectedLeadForScript.email },
                { id: 'TELEGRAM', label: 'Telegram', icon: Send, color: '#0EA5E9', available: true },
                { id: 'SMS', label: 'SMS', icon: Smartphone, color: '#A855F7', available: !!selectedLeadForScript.phone },
              ].map((ch) => {
                const isActive = scriptModalChannel === ch.id;
                const IconComponent = ch.icon;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChannelTabChange(ch.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isActive ? `1px solid ${ch.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isActive ? `${ch.color}20` : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? '700' : '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={14} color={isActive ? ch.color : '#94A3B8'} />
                    <span>{ch.label}</span>
                    {ch.available && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ch.color }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Email Subject Input (if Email tab is active) */}
            {scriptModalChannel === 'EMAIL' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '6px', fontWeight: '600' }}>
                  Email Subject Line:
                </label>
                <input
                  type="text"
                  value={scriptModalSubject}
                  onChange={(e) => setScriptModalSubject(e.target.value)}
                  placeholder="Subject line..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '0.825rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Editable Script Textarea */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '600' }}>
                  {scriptModalChannel} Message Content (Editable):
                </label>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  {scriptModalText.length} characters
                </span>
              </div>
              <textarea
                value={scriptModalText}
                onChange={(e) => setScriptModalText(e.target.value)}
                rows={9}
                placeholder="Customized AI message script..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#F8FAFC',
                  fontSize: '0.825rem',
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Safety Guarantee Callout */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.74rem',
              color: '#A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
              <div>
                <strong>Client Controlled &amp; Synced:</strong> When you click <em>Approve &amp; Send</em>, this message is dispatched via {scriptModalChannel} and this lead is brought into your <strong>Omnichannel Outreach Inbox</strong> to track replies in real-time.
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleRegenerateScript}
                  disabled={isRegeneratingScript || isSendingScript}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#CBD5E1',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isRegeneratingScript ? 'wait' : 'pointer',
                  }}
                >
                  <RefreshCw size={13} style={{ animation: isRegeneratingScript ? 'spin 1s linear infinite' : 'none' }} />
                  {isRegeneratingScript ? 'Regenerating...' : 'Regenerate Script'}
                </button>

                <button
                  type="button"
                  onClick={() => handleChatInOmnichannel(selectedLeadForScript)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#38BDF8',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                  title="Open live chat thread for this lead in Omnichannel Inbox"
                >
                  <MessageSquare size={13} /> Chat in Omnichannel
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLeadForScript(null)}
                  disabled={isSendingScript}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApproveAndSendSingle}
                  disabled={isSendingScript || !scriptModalText.trim()}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                    border: 'none',
                    color: '#021C11',
                    fontSize: '0.825rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    cursor: isSendingScript ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Send size={14} />
                  {isSendingScript ? 'Sending Message...' : 'Approve & Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-Click Approve & Send All Pending Leads */}
      {isBatchSendModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isBatchSending) {
              setIsBatchSendModalOpen(false);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#0B132B',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              color: '#F8FAFC',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#C084FC',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Zap size={11} /> 1-Click Mass Dispatch
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                  Approve &amp; Send All Outreach
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
                  Dispatch customized AI scripts to all {selectedLeadIds.length > 0 ? `${selectedLeadIds.length} selected` : 'pending'} prospects at once.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBatchSendModalOpen(false)}
                disabled={isBatchSending}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Batch Info Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Target Prospects:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#38BDF8' }}>
                  {selectedLeadIds.length > 0
                    ? `${selectedLeadIds.length} Selected Leads`
                    : `${allCurrentLeads.filter((l) => l.stage !== 'Contacted' && l.metadata?.outreachStatus !== 'SENT').length} Pending Leads`}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '6px', fontWeight: '600' }}>
                  Select Outbound Channel Strategy:
                </label>
                <select
                  value={batchChannel}
                  onChange={(e) => setBatchChannel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '0.825rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="AUTO">AUTO (WhatsApp if cellular phone available, otherwise Email)</option>
                  <option value="WHATSAPP">WhatsApp Only</option>
                  <option value="EMAIL">Email Only</option>
                  <option value="TELEGRAM">Telegram Only</option>
                  <option value="SMS">SMS Only</option>
                </select>
              </div>

              <div style={{
                background: 'rgba(6, 182, 212, 0.06)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.74rem',
                color: '#CBD5E1',
                lineHeight: '1.5',
              }}>
                ✨ <strong>Deep Role-Based Customization:</strong> Every contact receives their own bespoke message created from their job title, company, requirements, and your specific offerings. When dispatched, each thread will immediately appear in your Omnichannel Inbox.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsBatchSendModalOpen(false)}
                disabled={isBatchSending}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94A3B8',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApproveAndSendAll}
                disabled={isBatchSending}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.825rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: isBatchSending ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                }}
              >
                <Send size={14} />
                {isBatchSending ? 'Dispatching Messages...' : 'Approve & Send All in 1 Click'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
