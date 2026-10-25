const API_BASE = '/api';

export const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem('vyuhox_token');
  const headers = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  register: async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  adminLogin: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // Workspaces
  getWorkspaces: async (workspaceId) => {
    const headers = getAuthHeaders();
    if (workspaceId) headers['x-workspace-id'] = workspaceId;
    const res = await fetch(`${API_BASE}/workspaces`, { headers });
    return res.json();
  },
  getWorkspaceStats: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/stats`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  createWorkspace: async (data) => {
    const res = await fetch(`${API_BASE}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateWorkspace: async (id, data) => {
    const res = await fetch(`${API_BASE}/workspaces/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': id }),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  setOperatingMode: async (id, mode) => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/operating-mode`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': id },
      body: JSON.stringify({ operatingMode: mode }),
    });
    return res.json();
  },
  superadminManageWorkspace: async (id, data) => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/superadmin-manage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': id },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Leads
  getLeads: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/leads?${query}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  createLead: async (workspaceId, leadData) => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify(leadData),
    });
    return res.json();
  },
  updateLeadStage: async (workspaceId, leadId, stage) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ stage }),
    });
    return res.json();
  },
  deleteLead: async (workspaceId, leadId) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}`, {
      method: 'DELETE',
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  bulkImportLeads: async (workspaceId, leads) => {
    const res = await fetch(`${API_BASE}/leads/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ leads }),
    });
    return res.json();
  },
  executeBulkAction: async (workspaceId, leadIds, action, targetStage) => {
    const res = await fetch(`${API_BASE}/leads/bulk-action`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify({ leadIds, action, targetStage }),
    });
    return res.json();
  },

  // Real-time Lead Scraper
  startScraper: async (workspaceId, params) => {
    const res = await fetch(`${API_BASE}/scraper/start`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify({ ...params, workspaceId }),
    });
    return res.json();
  },
  getScraperStatus: async (workspaceId, jobId) => {
    const res = await fetch(`${API_BASE}/scraper/status/${jobId}`, {
      headers: getAuthHeaders({ 'x-workspace-id': workspaceId }),
    });
    return res.json();
  },

  // Wallet
  getWallet: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/wallet`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  addFunds: async (workspaceId, amountUSD, paymentMethod) => {
    const res = await fetch(`${API_BASE}/wallet/add-funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ amountUSD, paymentMethod }),
    });
    return res.json();
  },
  updateWalletSettings: async (workspaceId, settings) => {
    const res = await fetch(`${API_BASE}/wallet/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Auth / Me
  getMe: async (token) => {
    const headers = getAuthHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    return res.json();
  },

  // Strategy (Phase 2)
  scanWebsite: async (workspaceId, url) => {
    const res = await fetch(`${API_BASE}/strategy/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ url, workspaceId }),
    });
    return res.json();
  },
  scanWebsitePublic: async (url) => {
    const res = await fetch(`${API_BASE}/strategy/scan-public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },
  getStrategy: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/strategy/${workspaceId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  toggleChannel: async (strategyId, channelName, enabled) => {
    const res = await fetch(`${API_BASE}/strategy/${strategyId}/channels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, enabled }),
    });
    return res.json();
  },

  // Scraper & Waterfall Enrichment (Phase 3)
  startScraper: async (workspaceId, params) => {
    const res = await fetch(`${API_BASE}/scraper/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ ...params, workspaceId }),
    });
    return res.json();
  },
  getScraperStatus: async (jobId) => {
    const res = await fetch(`${API_BASE}/scraper/status/${jobId}`);
    return res.json();
  },
  executeBulkAction: async (workspaceId, leadIds, action, targetStage) => {
    const res = await fetch(`${API_BASE}/leads/bulk-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ leadIds, action, targetStage }),
    });
    return res.json();
  },

  // Omnichannel Hub (Phase 4)
  getConversations: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/messaging/conversations/${workspaceId}?${query}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  getConversationMessages: async (conversationId) => {
    const res = await fetch(`${API_BASE}/messaging/conversations/${conversationId}/messages`);
    return res.json();
  },
  sendMessage: async (messageData) => {
    const res = await fetch(`${API_BASE}/messaging/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return res.json();
  },
  simulateInbound: async (simulationData) => {
    const res = await fetch(`${API_BASE}/messaging/simulate-inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulationData),
    });
    return res.json();
  },
  getAiSuggestion: async (data) => {
    const res = await fetch(`${API_BASE}/messaging/ai-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getSequences: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/messaging/sequences/${workspaceId}`);
    return res.json();
  },
  enrollInSequence: async (workspaceId, leadId, sequenceId) => {
    const res = await fetch(`${API_BASE}/messaging/sequences/${workspaceId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, sequenceId }),
    });
    return res.json();
  },

  // Voice Studio (Phase 5)
  getCalls: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/voice/calls/${workspaceId}?${query}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  getActiveCalls: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/voice/calls/active/${workspaceId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  getCallDetail: async (callId) => {
    const res = await fetch(`${API_BASE}/voice/calls/detail/${callId}`);
    return res.json();
  },
  dispatchCall: async (data) => {
    const res = await fetch(`${API_BASE}/voice/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  takeOverCall: async (callId, repName) => {
    const res = await fetch(`${API_BASE}/voice/calls/${callId}/takeover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repName }),
    });
    return res.json();
  },
  whisperToCall: async (callId, whisperMessage) => {
    const res = await fetch(`${API_BASE}/voice/calls/${callId}/whisper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whisperMessage }),
    });
    return res.json();
  },
  endCall: async (callId) => {
    const res = await fetch(`${API_BASE}/voice/calls/${callId}/end`, {
      method: 'POST',
    });
    return res.json();
  },
  getVoiceToken: async (identity, workspaceId) => {
    const res = await fetch(`${API_BASE}/voice/token?identity=${identity || 'rep'}&workspaceId=${workspaceId}`);
    return res.json();
  },
  getVoiceConfig: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/voice/config/${workspaceId}`);
    return res.json();
  },
  updateVoiceConfig: async (workspaceId, config) => {
    const res = await fetch(`${API_BASE}/voice/config/${workspaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },
  triggerSpeedToLead: async (leadId, workspaceId) => {
    const res = await fetch(`${API_BASE}/voice/speed-to-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, workspaceId }),
    });
    return res.json();
  },
  simulateLiveCall: async (workspaceId, leadId) => {
    const res = await fetch(`${API_BASE}/voice/simulate-live-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, leadId }),
    });
    return res.json();
  },

  // Social Media Studio (Phase 6)
  getSocialPosts: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/social/posts/${workspaceId}?${query}`);
    return res.json();
  },
  generateReel: async (workspaceId, data = {}) => {
    const res = await fetch(`${API_BASE}/social/generate-reel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, ...data }),
    });
    return res.json();
  },
  generateGraphics: async (workspaceId, data = {}) => {
    const res = await fetch(`${API_BASE}/social/generate-graphics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, ...data }),
    });
    return res.json();
  },
  generate30Days: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/social/generate-30-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    return res.json();
  },
  scheduleSocialPost: async (postData) => {
    const res = await fetch(`${API_BASE}/social/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return res.json();
  },
  approveSocialPost: async (postId) => {
    const res = await fetch(`${API_BASE}/social/posts/${postId}/approve`, {
      method: 'POST',
    });
    return res.json();
  },
  publishSocialPostNow: async (postId) => {
    const res = await fetch(`${API_BASE}/social/posts/${postId}/publish-now`, {
      method: 'POST',
    });
    return res.json();
  },
  getSocialConfig: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/social/config/${workspaceId}`);
    return res.json();
  },
  updateSocialConfig: async (workspaceId, config) => {
    const res = await fetch(`${API_BASE}/social/config/${workspaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },
  uploadSocialMedia: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/social/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  createCustomSocialPost: async (postData) => {
    const res = await fetch(`${API_BASE}/social/create-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return res.json();
  },
  generateFromPrompt: async (promptData) => {
    const res = await fetch(`${API_BASE}/social/generate-from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData),
    });
    return res.json();
  },
  rescheduleSocialPost: async (postId, scheduledAt) => {
    const res = await fetch(`${API_BASE}/social/posts/${postId}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt }),
    });
    return res.json();
  },

  // Ads & Meta Campaign Manager (Phase 7: Autonomous Paid Ad Manager)
  getAdCampaigns: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/ads/campaigns/${workspaceId}`);
    return res.json();
  },
  getAdMetrics: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/ads/metrics/${workspaceId}`);
    return res.json();
  },
  getAdLogs: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/ads/logs/${workspaceId}`);
    return res.json();
  },
  createAdCampaign: async (campaignData) => {
    const res = await fetch(`${API_BASE}/ads/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    return res.json();
  },
  toggleAdCampaign: async (campaignId) => {
    const res = await fetch(`${API_BASE}/ads/campaigns/${campaignId}/toggle`, {
      method: 'POST',
    });
    return res.json();
  },
  updateCampaignBudget: async (campaignId, dailyBudget) => {
    const res = await fetch(`${API_BASE}/ads/campaigns/${campaignId}/update-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyBudget }),
    });
    return res.json();
  },
  simulateOptimizer: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/ads/simulate-optimizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    return res.json();
  },
  sendServerCapiConversion: async (conversionData) => {
    const res = await fetch(`${API_BASE}/ads/conversions/capi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversionData),
    });
    return res.json();
  },
  boostPostToAds: async (boostData) => {
    const res = await fetch(`${API_BASE}/ads/boost-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boostData),
    });
    return res.json();
  },
  syncMetaLeads: async (workspaceId, campaignId) => {
    const res = await fetch(`${API_BASE}/ads/sync-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, campaignId }),
    });
    return res.json();
  },

  // =========================================================================
  // Phase 8: Calendar Sync & Telecom / Email Deliverability Safeguards
  // =========================================================================

  // 1. Calendar Service
  getCalendarSlots: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await fetch(`${API_BASE}/calendar/slots?${q.toString()}`);
    return res.json();
  },
  bookAppointment: async (appointmentData) => {
    const res = await fetch(`${API_BASE}/calendar/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    return res.json();
  },
  getAppointments: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await fetch(`${API_BASE}/calendar/appointments?${q.toString()}`);
    return res.json();
  },
  updateAppointment: async (id, data) => {
    const res = await fetch(`${API_BASE}/calendar/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getCalendarConfig: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/calendar/config?workspaceId=${workspaceId}`);
    return res.json();
  },
  connectGoogleCalendar: async (data) => {
    const res = await fetch(`${API_BASE}/calendar/google/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  connectCalCom: async (data) => {
    const res = await fetch(`${API_BASE}/calendar/calcom/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  triggerCalendarReminders: async () => {
    const res = await fetch(`${API_BASE}/calendar/reminders/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // 2. Deliverability & Compliance Safeguards
  getWarmupDomains: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/compliance/warmup/domains?workspaceId=${workspaceId}`);
    return res.json();
  },
  addWarmupDomain: async (domainData) => {
    const res = await fetch(`${API_BASE}/compliance/warmup/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(domainData),
    });
    return res.json();
  },
  auditWarmupDomain: async (domainId) => {
    const res = await fetch(`${API_BASE}/compliance/warmup/audit/${domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
  simulateWarmupStep: async (domainId) => {
    const res = await fetch(`${API_BASE}/compliance/warmup/simulate-step/${domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
  deleteWarmupDomain: async (domainId) => {
    const res = await fetch(`${API_BASE}/compliance/warmup/domains/${domainId}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  getA2PRegistration: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/compliance/a2p?workspaceId=${workspaceId}`);
    return res.json();
  },
  submitA2PRegistration: async (data) => {
    const res = await fetch(`${API_BASE}/compliance/a2p/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getDncList: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await fetch(`${API_BASE}/compliance/dnc?${q.toString()}`);
    return res.json();
  },
  addToDnc: async (data) => {
    const res = await fetch(`${API_BASE}/compliance/dnc/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  checkDnc: async (workspaceId, phone, email) => {
    const res = await fetch(`${API_BASE}/compliance/dnc/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, phone, email }),
    });
    return res.json();
  },
  scrubDncContacts: async (workspaceId, contacts) => {
    const res = await fetch(`${API_BASE}/compliance/dnc/scrub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, contacts }),
    });
    return res.json();
  },
  removeFromDnc: async (dncId) => {
    const res = await fetch(`${API_BASE}/compliance/dnc/${dncId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // =========================================================================
  // Phase 9: Autonomous AI Company & Multi-Agent C-Suite Orchestration
  // =========================================================================

  getAICompanyStatus: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/ai-company/status?workspaceId=${workspaceId}`);
    return res.json();
  },
  getAICompanyActivities: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await fetch(`${API_BASE}/ai-company/activities?${q.toString()}`);
    return res.json();
  },
  getCeoBriefings: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await fetch(`${API_BASE}/ai-company/briefings?${q.toString()}`);
    return res.json();
  },
  generateCeoBriefing: async (data) => {
    const res = await fetch(`${API_BASE}/ai-company/briefings/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  decideCeoProposal: async (data) => {
    const res = await fetch(`${API_BASE}/ai-company/proposals/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  simulateObjectionFeedback: async (data) => {
    const res = await fetch(`${API_BASE}/ai-company/simulate-objection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // =========================================================================
  // Phase 10: Dual-Mode Switch (Tool Mode vs AI Company) & Dynamic Pricing
  // =========================================================================

  getBillingSummary: async (workspaceId) => {
    const res = await fetch(`${API_BASE}/billing/summary?workspaceId=${workspaceId}`);
    return res.json();
  },
  switchOperatingMode: async (data) => {
    const res = await fetch(`${API_BASE}/billing/switch-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  hireAgent: async (data) => {
    const res = await fetch(`${API_BASE}/billing/hire-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  estimateTeamSizing: async (data) => {
    const res = await fetch(`${API_BASE}/billing/estimate-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Phase 12: Self-Growing SaaS Flywheel
  getFlywheelOverview: async () => {
    const res = await fetch(`${API_BASE}/flywheel/overview`);
    return res.json();
  },
  runFlywheelProspecting: async () => {
    const res = await fetch(`${API_BASE}/flywheel/prospect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
  triggerSelfDemoVoice: async (data) => {
    const res = await fetch(`${API_BASE}/flywheel/voice-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  simulateFlywheelCheckout: async (data) => {
    const res = await fetch(`${API_BASE}/flywheel/checkout/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },
  getMe: async (token) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Dynamic Super Admin Pricing Plans
  getPricingPlans: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/billing/plans?${query}`);
    return res.json();
  },
  createPricingPlan: async (planData) => {
    const res = await fetch(`${API_BASE}/billing/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    return res.json();
  },
  updatePricingPlan: async (id, planData) => {
    const res = await fetch(`${API_BASE}/billing/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    return res.json();
  },
  deletePricingPlan: async (id, hardDelete = false) => {
    const res = await fetch(`${API_BASE}/billing/plans/${id}?hardDelete=${hardDelete}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  switchOperatingMode: async (data) => {
    const res = await fetch(`${API_BASE}/billing/switch-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  hireAgent: async (data) => {
    const res = await fetch(`${API_BASE}/billing/hire-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  estimateTeam: async (data) => {
    const res = await fetch(`${API_BASE}/billing/estimate-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getPlatformConfig: async () => {
    const res = await fetch(`${API_BASE}/billing/platform-config`);
    return res.json();
  },
  updatePlatformConfig: async (data) => {
    const res = await fetch(`${API_BASE}/billing/platform-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  testIntegrationPing: async (provider) => {
    const res = await fetch(`${API_BASE}/billing/test-integration-ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    return res.json();
  },
  evaluateFinOps: async () => {
    const res = await fetch(`${API_BASE}/billing/finops/evaluate`);
    return res.json();
  },
  applyFinOpsRates: async () => {
    const res = await fetch(`${API_BASE}/billing/finops/apply-rates`, {
      method: 'POST',
    });
    return res.json();
  },

  // Strategy & Website Scanner
  getStrategy: async (workspaceId) => {
    const token = localStorage.getItem('vyuhox_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (workspaceId) headers['x-workspace-id'] = workspaceId;

    const res = await fetch(`${API_BASE}/strategy/${workspaceId}`, { headers });
    return res.json();
  },
  scanWebsite: async (workspaceId, url) => {
    const token = localStorage.getItem('vyuhox_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (workspaceId) headers['x-workspace-id'] = workspaceId;

    const res = await fetch(`${API_BASE}/strategy/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ workspaceId, url }),
    });
    return res.json();
  },
  updateStrategy: async (strategyId, data) => {
    const token = localStorage.getItem('vyuhox_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/strategy/${strategyId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateStepStatus: async (strategyId, phaseIndex, status) => {
    const token = localStorage.getItem('vyuhox_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/strategy/${strategyId}/step`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ phaseIndex, status }),
    });
    return res.json();
  },
  toggleChannel: async (strategyId, channelName, enabled) => {
    const token = localStorage.getItem('vyuhox_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/strategy/${strategyId}/channels`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ channelName, enabled }),
    });
    return res.json();
  },

  // Visual Representation & Autonomous Pitch Deck Generator
  generateVisualImage: async (data) => {
    const res = await fetch(`${API_BASE}/visual/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  generatePitchDeck: async (data) => {
    const res = await fetch(`${API_BASE}/visual/generate-deck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  downloadPptxFile: async (strategy) => {
    const res = await fetch(`${API_BASE}/visual/download-pptx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy }),
    });
    if (!res.ok) throw new Error('Failed to generate PPTX');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (strategy?.businessName || 'Business').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanName}_GTM_Strategy_Pitch_Deck.pptx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  },
  getFunnelFlow: async (data) => {
    const res = await fetch(`${API_BASE}/visual/funnel-flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getVisualToolsStatus: async () => {
    const res = await fetch(`${API_BASE}/visual/tools-status`);
    return res.json();
  },
};





