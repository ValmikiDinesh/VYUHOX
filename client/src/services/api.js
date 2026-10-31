import { authStorage } from './authStorage';

const API_BASE = '/api';

export const getAuthHeaders = (extra = {}) => {
  const token = authStorage.getToken();
  const wsId = authStorage.getActiveWsId();
  const headers = { ...extra };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (wsId && !headers['x-workspace-id']) {
    headers['x-workspace-id'] = String(wsId);
  }
  return headers;
};

export const authedFetch = (url, options = {}) => {
  const token = authStorage.getToken();
  const wsId = authStorage.getActiveWsId();
  const headers = { ...(options.headers || {}) };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (wsId && !headers['x-workspace-id']) {
    headers['x-workspace-id'] = String(wsId);
  }
  return fetch(url, { ...options, headers });
};

export const safeFetchJson = async (url, options = {}) => {
  try {
    const res = await authedFetch(url, options);
    const text = await res.text();
    if (!text || !text.trim()) {
      if (!res.ok) {
        return { success: false, message: `Server returned HTTP ${res.status} with empty response.` };
      }
      return { success: true };
    }
    try {
      const data = JSON.parse(text);
      if (!res.ok && data.success === undefined) {
        data.success = false;
      }
      return data;
    } catch (parseErr) {
      if (!res.ok) {
        return { success: false, message: `Server error (${res.status}): ${text.slice(0, 150)}` };
      }
      return { success: false, message: `Unexpected response format: ${text.slice(0, 100)}` };
    }
  } catch (networkErr) {
    return {
      success: false,
      message: networkErr.message?.includes('abort')
        ? 'Scan request timed out. The server is still crawling in background.'
        : `Network connection error: ${networkErr.message}`,
    };
  }
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await authedFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  register: async (data) => {
    const res = await authedFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  adminLogin: async (credentials) => {
    const res = await authedFetch(`${API_BASE}/auth/admin-login`, {
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
    const res = await authedFetch(`${API_BASE}/workspaces`, { headers });
    return res.json();
  },
  getWorkspaceStats: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/workspaces/${workspaceId}/stats`, {
      headers: getAuthHeaders({ 'x-workspace-id': workspaceId }),
    });
    return res.json();
  },
  createWorkspace: async (data) => {
    const res = await authedFetch(`${API_BASE}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateWorkspace: async (id, data) => {
    const res = await authedFetch(`${API_BASE}/workspaces/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': id }),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  setOperatingMode: async (id, mode) => {
    const res = await authedFetch(`${API_BASE}/workspaces/${id}/operating-mode`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': id }),
      body: JSON.stringify({ operatingMode: mode }),
    });
    return res.json();
  },
  superadminManageWorkspace: async (id, data) => {
    const res = await authedFetch(`${API_BASE}/workspaces/${id}/superadmin-manage`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': id }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Leads
  getLeads: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authedFetch(`${API_BASE}/leads?${query}`, {
      headers: getAuthHeaders({ 'x-workspace-id': workspaceId }),
    });
    return res.json();
  },
  createLead: async (workspaceId, leadData) => {
    const res = await authedFetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify(leadData),
    });
    return res.json();
  },
  updateLeadStage: async (workspaceId, leadId, stage) => {
    const res = await authedFetch(`${API_BASE}/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify({ stage }),
    });
    return res.json();
  },
  deleteLead: async (workspaceId, leadId) => {
    const res = await authedFetch(`${API_BASE}/leads/${leadId}`, {
      method: 'DELETE',
      headers: getAuthHeaders({ 'x-workspace-id': workspaceId }),
    });
    return res.json();
  },
  bulkImportLeads: async (workspaceId, leads) => {
    const res = await authedFetch(`${API_BASE}/leads/bulk-import`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify({ leads }),
    });
    return res.json();
  },
  executeBulkAction: async (workspaceId, leadIds, action, targetStage) => {
    const res = await authedFetch(`${API_BASE}/leads/bulk-action`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify({ leadIds, action, targetStage }),
    });
    return res.json();
  },

  // Real-time Lead Scraper
  startScraper: async (workspaceId, params) => {
    const res = await authedFetch(`${API_BASE}/scraper/start`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }),
      body: JSON.stringify({ ...params, workspaceId }),
    });
    return res.json();
  },
  getScraperStatus: async (workspaceId, jobId) => {
    const res = await authedFetch(`${API_BASE}/scraper/status/${jobId}`, {
      headers: getAuthHeaders({ 'x-workspace-id': workspaceId }),
    });
    return res.json();
  },

  // Wallet
  getWallet: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/wallet`, {
      headers: getAuthHeaders(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
    });
    return res.json();
  },
  addFunds: async (workspaceId, amountUSD, paymentMethod) => {
    const res = await authedFetch(`${API_BASE}/wallet/add-funds`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}) }),
      body: JSON.stringify({ amountUSD, paymentMethod }),
    });
    return res.json();
  },
  updateWalletSettings: async (workspaceId, settings) => {
    const res = await authedFetch(`${API_BASE}/wallet/settings`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json', ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}) }),
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Auth / Me
  getMe: async (token) => {
    const headers = getAuthHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const res = await authedFetch(`${API_BASE}/auth/me`, { headers });
    return res.json();
  },

  // Strategy (Phase 2)
  scanWebsite: async (workspaceId, urlOrPayload) => {
    const payload = typeof urlOrPayload === 'string'
      ? { url: urlOrPayload, workspaceId }
      : { ...urlOrPayload, workspaceId };
    return safeFetchJson(`${API_BASE}/strategy/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify(payload),
    });
  },
  scanWebsitePublic: async (url) => {
    return safeFetchJson(`${API_BASE}/strategy/scan-public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  },
  getStrategy: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/strategy/${workspaceId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  recrawlWebsite: async (workspaceId) => {
    return safeFetchJson(`${API_BASE}/strategy/recrawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
  },
  toggleChannel: async (strategyId, channelName, enabled) => {
    const res = await authedFetch(`${API_BASE}/strategy/${strategyId}/channels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, enabled }),
    });
    return res.json();
  },
  getBrainStatus: async (workspaceId) => {
    return safeFetchJson(`${API_BASE}/strategy/brain-status?workspaceId=${workspaceId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
  trainBrain: async (workspaceId, payload) => {
    return safeFetchJson(`${API_BASE}/strategy/train-brain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ ...payload, workspaceId }),
    });
  },
  getMasterBrainStatus: async () => {
    return safeFetchJson(`${API_BASE}/strategy/master-brain/status`);
  },
  updateServices: async (workspaceId, payload) => {
    return safeFetchJson(`${API_BASE}/strategy/update-services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ ...payload, workspaceId }),
    });
  },
  updateStrategy: async (strategyId, payload) => {
    return safeFetchJson(`${API_BASE}/strategy/${strategyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Scraper & Waterfall Enrichment (Phase 3)
  startScraper: async (workspaceId, params) => {
    const res = await authedFetch(`${API_BASE}/scraper/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ ...params, workspaceId }),
    });
    return res.json();
  },
  getScraperStatus: async (jobId) => {
    const res = await authedFetch(`${API_BASE}/scraper/status/${jobId}`);
    return res.json();
  },
  executeBulkAction: async (workspaceId, leadIds, action, targetStage) => {
    const res = await authedFetch(`${API_BASE}/leads/bulk-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ leadIds, action, targetStage }),
    });
    return res.json();
  },
  approveAndSendLead: async (workspaceId, leadId, data = {}) => {
    const res = await authedFetch(`${API_BASE}/leads/${leadId}/approve-and-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  approveAndSendAllLeads: async (workspaceId, data = {}) => {
    const res = await authedFetch(`${API_BASE}/leads/approve-and-send-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  generateLeadDraft: async (workspaceId, leadId, customGoal = '') => {
    const res = await authedFetch(`${API_BASE}/leads/${leadId}/generate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ customGoal }),
    });
    return res.json();
  },
  generateDraftsAll: async (workspaceId, leadIds = []) => {
    const res = await authedFetch(`${API_BASE}/leads/generate-drafts-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ leadIds }),
    });
    return res.json();
  },
  startChatWithLead: async (workspaceId, leadId, data = {}) => {
    const res = await authedFetch(`${API_BASE}/messaging/start-chat-with-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ workspaceId, leadId, ...data }),
    });
    return res.json();
  },

  // Omnichannel Hub (Phase 4)
  getConversations: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authedFetch(`${API_BASE}/messaging/conversations/${workspaceId}?${query}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  syncScrapedLeads: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/messaging/sync-scraped-leads/${workspaceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  bulkDispatchOutreach: async ({ workspaceId, leadIds, channel = 'AUTO', customPrompt = '' }) => {
    const res = await authedFetch(`${API_BASE}/messaging/bulk-dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      body: JSON.stringify({ workspaceId, leadIds, channel, customPrompt }),
    });
    return res.json();
  },
  getConversationMessages: async (conversationId) => {
    const res = await authedFetch(`${API_BASE}/messaging/conversations/${conversationId}/messages`);
    return res.json();
  },
  sendMessage: async (messageData) => {
    const res = await authedFetch(`${API_BASE}/messaging/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return res.json();
  },
  simulateInbound: async (simulationData) => {
    const res = await authedFetch(`${API_BASE}/messaging/simulate-inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulationData),
    });
    return res.json();
  },
  getAiSuggestion: async (data) => {
    const res = await authedFetch(`${API_BASE}/messaging/ai-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getSequences: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/messaging/sequences/${workspaceId}`);
    return res.json();
  },
  enrollInSequence: async (workspaceId, leadId, sequenceId) => {
    const res = await authedFetch(`${API_BASE}/messaging/sequences/${workspaceId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, sequenceId }),
    });
    return res.json();
  },

  // Voice Studio (Phase 5)
  getCalls: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authedFetch(`${API_BASE}/voice/calls/${workspaceId}?${query}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  getActiveCalls: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/voice/calls/active/${workspaceId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.json();
  },
  getCallDetail: async (callId) => {
    const res = await authedFetch(`${API_BASE}/voice/calls/detail/${callId}`);
    return res.json();
  },
  dispatchCall: async (data) => {
    const res = await authedFetch(`${API_BASE}/voice/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  takeOverCall: async (callId, repName) => {
    const res = await authedFetch(`${API_BASE}/voice/calls/${callId}/takeover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repName }),
    });
    return res.json();
  },
  whisperToCall: async (callId, whisperMessage) => {
    const res = await authedFetch(`${API_BASE}/voice/calls/${callId}/whisper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whisperMessage }),
    });
    return res.json();
  },
  endCall: async (callId) => {
    const res = await authedFetch(`${API_BASE}/voice/calls/${callId}/end`, {
      method: 'POST',
    });
    return res.json();
  },
  getVoiceToken: async (identity, workspaceId) => {
    const res = await authedFetch(`${API_BASE}/voice/token?identity=${identity || 'rep'}&workspaceId=${workspaceId}`);
    return res.json();
  },
  getVoiceConfig: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/voice/config/${workspaceId}`);
    return res.json();
  },
  updateVoiceConfig: async (workspaceId, config) => {
    const res = await authedFetch(`${API_BASE}/voice/config/${workspaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },
  triggerSpeedToLead: async (leadId, workspaceId) => {
    const res = await authedFetch(`${API_BASE}/voice/speed-to-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, workspaceId }),
    });
    return res.json();
  },
  simulateLiveCall: async (workspaceId, leadId) => {
    const res = await authedFetch(`${API_BASE}/voice/simulate-live-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, leadId }),
    });
    return res.json();
  },

  // Social Media Studio (Phase 6)
  getSocialPosts: async (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authedFetch(`${API_BASE}/social/posts/${workspaceId}?${query}`);
    return res.json();
  },
  generateReel: async (workspaceId, data = {}) => {
    const res = await authedFetch(`${API_BASE}/social/generate-reel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, ...data }),
    });
    return res.json();
  },
  generateGraphics: async (workspaceId, data = {}) => {
    const res = await authedFetch(`${API_BASE}/social/generate-graphics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, ...data }),
    });
    return res.json();
  },
  generate30Days: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/social/generate-30-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    return res.json();
  },
  scheduleSocialPost: async (postData) => {
    const res = await authedFetch(`${API_BASE}/social/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return res.json();
  },
  approveSocialPost: async (postId) => {
    const res = await authedFetch(`${API_BASE}/social/posts/${postId}/approve`, {
      method: 'POST',
    });
    return res.json();
  },
  publishSocialPostNow: async (postId) => {
    const res = await authedFetch(`${API_BASE}/social/posts/${postId}/publish-now`, {
      method: 'POST',
    });
    return res.json();
  },
  getSocialConfig: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/social/config/${workspaceId}`);
    return res.json();
  },
  updateSocialConfig: async (workspaceId, config) => {
    const res = await authedFetch(`${API_BASE}/social/config/${workspaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },
  uploadSocialMedia: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authedFetch(`${API_BASE}/social/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  createCustomSocialPost: async (postData) => {
    const res = await authedFetch(`${API_BASE}/social/create-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return res.json();
  },
  generateFromPrompt: async (promptData) => {
    const res = await authedFetch(`${API_BASE}/social/generate-from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData),
    });
    return res.json();
  },
  rescheduleSocialPost: async (postId, scheduledAt) => {
    const res = await authedFetch(`${API_BASE}/social/posts/${postId}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt }),
    });
    return res.json();
  },

  // Ads & Meta Campaign Manager (Phase 7: Autonomous Paid Ad Manager)
  getAdCampaigns: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/ads/campaigns/${workspaceId}`);
    return res.json();
  },
  getAdMetrics: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/ads/metrics/${workspaceId}`);
    return res.json();
  },
  getAdLogs: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/ads/logs/${workspaceId}`);
    return res.json();
  },
  createAdCampaign: async (campaignData) => {
    const res = await authedFetch(`${API_BASE}/ads/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    return res.json();
  },
  toggleAdCampaign: async (campaignId) => {
    const res = await authedFetch(`${API_BASE}/ads/campaigns/${campaignId}/toggle`, {
      method: 'POST',
    });
    return res.json();
  },
  updateCampaignBudget: async (campaignId, dailyBudget) => {
    const res = await authedFetch(`${API_BASE}/ads/campaigns/${campaignId}/update-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyBudget }),
    });
    return res.json();
  },
  simulateOptimizer: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/ads/simulate-optimizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    return res.json();
  },
  sendServerCapiConversion: async (conversionData) => {
    const res = await authedFetch(`${API_BASE}/ads/conversions/capi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversionData),
    });
    return res.json();
  },
  boostPostToAds: async (boostData) => {
    const res = await authedFetch(`${API_BASE}/ads/boost-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boostData),
    });
    return res.json();
  },
  generateCampaignAi: async (params) => {
    const res = await authedFetch(`${API_BASE}/ads/generate-campaign-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
  approveAndLaunchCampaign: async (params) => {
    const res = await authedFetch(`${API_BASE}/ads/approve-and-launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
  generateVisualAsset: async (params) => {
    const res = await authedFetch(`${API_BASE}/ads/generate-visual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
  leadAutoFollowup: async (params) => {
    const res = await authedFetch(`${API_BASE}/ads/lead-auto-followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
  triggerSelfHeal: async (creativeId, rejectionCode, policyDetails) => {
    const res = await authedFetch(`${API_BASE}/ads/self-heal/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creativeId, rejectionCode, policyDetails }),
    });
    return res.json();
  },
  simulateSelfHeal: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/ads/self-heal/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    return res.json();
  },
  auditStoreForShopping: async (storeUrl) => {
    const res = await authedFetch(`${API_BASE}/ads/google/audit-store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl }),
    });
    return res.json();
  },
  syncMetaLeads: async (workspaceId, campaignId) => {
    const res = await authedFetch(`${API_BASE}/ads/sync-leads`, {
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
    const res = await authedFetch(`${API_BASE}/calendar/slots?${q.toString()}`);
    return res.json();
  },
  bookAppointment: async (appointmentData) => {
    const res = await authedFetch(`${API_BASE}/calendar/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    return res.json();
  },
  getAppointments: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await authedFetch(`${API_BASE}/calendar/appointments?${q.toString()}`);
    return res.json();
  },
  updateAppointment: async (id, data) => {
    const res = await authedFetch(`${API_BASE}/calendar/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getCalendarConfig: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/calendar/config?workspaceId=${workspaceId}`);
    return res.json();
  },
  connectGoogleCalendar: async (data) => {
    const res = await authedFetch(`${API_BASE}/calendar/google/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  connectCalCom: async (data) => {
    const res = await authedFetch(`${API_BASE}/calendar/calcom/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  triggerCalendarReminders: async () => {
    const res = await authedFetch(`${API_BASE}/calendar/reminders/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // 2. Deliverability & Compliance Safeguards
  getWarmupDomains: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/compliance/warmup/domains?workspaceId=${workspaceId}`);
    return res.json();
  },
  addWarmupDomain: async (domainData) => {
    const res = await authedFetch(`${API_BASE}/compliance/warmup/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(domainData),
    });
    return res.json();
  },
  auditWarmupDomain: async (domainId) => {
    const res = await authedFetch(`${API_BASE}/compliance/warmup/audit/${domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
  simulateWarmupStep: async (domainId) => {
    const res = await authedFetch(`${API_BASE}/compliance/warmup/simulate-step/${domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
  deleteWarmupDomain: async (domainId) => {
    const res = await authedFetch(`${API_BASE}/compliance/warmup/domains/${domainId}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  getA2PRegistration: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/compliance/a2p?workspaceId=${workspaceId}`);
    return res.json();
  },
  submitA2PRegistration: async (data) => {
    const res = await authedFetch(`${API_BASE}/compliance/a2p/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getDncList: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await authedFetch(`${API_BASE}/compliance/dnc?${q.toString()}`);
    return res.json();
  },
  addToDnc: async (data) => {
    const res = await authedFetch(`${API_BASE}/compliance/dnc/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  checkDnc: async (workspaceId, phone, email) => {
    const res = await authedFetch(`${API_BASE}/compliance/dnc/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, phone, email }),
    });
    return res.json();
  },
  scrubDncContacts: async (workspaceId, contacts) => {
    const res = await authedFetch(`${API_BASE}/compliance/dnc/scrub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, contacts }),
    });
    return res.json();
  },
  removeFromDnc: async (dncId) => {
    const res = await authedFetch(`${API_BASE}/compliance/dnc/${dncId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // =========================================================================
  // Phase 9: Autonomous AI Company & Multi-Agent C-Suite Orchestration
  // =========================================================================

  getAICompanyStatus: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/ai-company/status?workspaceId=${workspaceId}`);
    return res.json();
  },
  getAICompanyActivities: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await authedFetch(`${API_BASE}/ai-company/activities?${q.toString()}`);
    return res.json();
  },
  getCeoBriefings: async (workspaceId, params = {}) => {
    const q = new URLSearchParams({ workspaceId, ...params });
    const res = await authedFetch(`${API_BASE}/ai-company/briefings?${q.toString()}`);
    return res.json();
  },
  generateCeoBriefing: async (data) => {
    const res = await authedFetch(`${API_BASE}/ai-company/briefings/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  decideCeoProposal: async (data) => {
    const res = await authedFetch(`${API_BASE}/ai-company/proposals/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  simulateObjectionFeedback: async (data) => {
    const res = await authedFetch(`${API_BASE}/ai-company/simulate-objection`, {
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
    const res = await authedFetch(`${API_BASE}/billing/summary?workspaceId=${workspaceId}`);
    return res.json();
  },
  switchOperatingMode: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/switch-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  hireAgent: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/hire-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  estimateTeamSizing: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/estimate-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Phase 12: Self-Growing SaaS Flywheel
  getFlywheelOverview: async () => {
    const res = await authedFetch(`${API_BASE}/flywheel/overview`);
    return res.json();
  },
  runFlywheelProspecting: async () => {
    const res = await authedFetch(`${API_BASE}/flywheel/prospect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
  triggerSelfDemoVoice: async (data) => {
    const res = await authedFetch(`${API_BASE}/flywheel/voice-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  simulateFlywheelCheckout: async (data) => {
    const res = await authedFetch(`${API_BASE}/flywheel/checkout/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Continuous Multi-Round AI Brain & Evolution
  getBusinessBrain: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/flywheel/brain/${workspaceId}`);
    return res.json();
  },
  askBusinessBrain: async (workspaceId, data) => {
    const res = await authedFetch(`${API_BASE}/flywheel/brain/${workspaceId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  advanceBrainRound: async (workspaceId, data = {}) => {
    const res = await authedFetch(`${API_BASE}/flywheel/brain/${workspaceId}/advance-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getSuperAdminBrainOverview: async () => {
    const res = await authedFetch(`${API_BASE}/flywheel/brain-superadmin/overview`);
    return res.json();
  },

  // Auth
  login: async (credentials) => {
    const res = await authedFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  register: async (userData) => {
    const res = await authedFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },
  getMe: async (token) => {
    const res = await authedFetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Dynamic Super Admin Pricing Plans
  getPricingPlans: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authedFetch(`${API_BASE}/billing/plans?${query}`);
    return res.json();
  },
  createPricingPlan: async (planData) => {
    const res = await authedFetch(`${API_BASE}/billing/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    return res.json();
  },
  updatePricingPlan: async (id, planData) => {
    const res = await authedFetch(`${API_BASE}/billing/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    return res.json();
  },
  deletePricingPlan: async (id, hardDelete = false) => {
    const res = await authedFetch(`${API_BASE}/billing/plans/${id}?hardDelete=${hardDelete}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  switchOperatingMode: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/switch-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  hireAgent: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/hire-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  estimateTeam: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/estimate-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getPlatformConfig: async () => {
    const res = await authedFetch(`${API_BASE}/billing/platform-config`);
    return res.json();
  },
  updatePlatformConfig: async (data) => {
    const res = await authedFetch(`${API_BASE}/billing/platform-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  testIntegrationPing: async (provider) => {
    const res = await authedFetch(`${API_BASE}/billing/test-integration-ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    return res.json();
  },
  evaluateFinOps: async () => {
    const res = await authedFetch(`${API_BASE}/billing/finops/evaluate`);
    return res.json();
  },
  applyFinOpsRates: async () => {
    const res = await authedFetch(`${API_BASE}/billing/finops/apply-rates`, {
      method: 'POST',
    });
    return res.json();
  },

  // Strategy & Website Scanner
  getStrategy: async (workspaceId) => {
    const token = authStorage.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (workspaceId) headers['x-workspace-id'] = workspaceId;

    const res = await authedFetch(`${API_BASE}/strategy/${workspaceId}`, { headers });
    return res.json();
  },
  updateStrategy: async (strategyId, data) => {
    const token = authStorage.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await authedFetch(`${API_BASE}/strategy/${strategyId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateStepStatus: async (strategyId, phaseIndex, status) => {
    const token = authStorage.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await authedFetch(`${API_BASE}/strategy/${strategyId}/step`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ phaseIndex, status }),
    });
    return res.json();
  },
  toggleChannel: async (strategyId, channelName, enabled) => {
    const token = authStorage.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await authedFetch(`${API_BASE}/strategy/${strategyId}/channels`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ channelName, enabled }),
    });
    return res.json();
  },

  // Visual Representation & Autonomous Pitch Deck Generator
  generateVisualImage: async (data) => {
    const res = await authedFetch(`${API_BASE}/visual/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  generatePitchDeck: async (data) => {
    const res = await authedFetch(`${API_BASE}/visual/generate-deck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  downloadPptxFile: async (strategy) => {
    const res = await authedFetch(`${API_BASE}/visual/download-pptx`, {
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
    const res = await authedFetch(`${API_BASE}/visual/funnel-flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getVisualToolsStatus: async () => {
    const res = await authedFetch(`${API_BASE}/visual/tools-status`);
    return res.json();
  },

  // Phase 4: Client Self-Serve Channel Integration Wizard (Multi-Tenancy)
  getWorkspaceIntegrations: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/integrations/${workspaceId}`);
    return res.json();
  },
  connectChannelOAuth: async (data) => {
    const res = await authedFetch(`${API_BASE}/integrations/oauth/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  pingChannelIntegration: async (workspaceId, serviceName) => {
    const res = await authedFetch(`${API_BASE}/integrations/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, serviceName }),
    });
    return res.json();
  },
  disconnectChannelIntegration: async (workspaceId, serviceName) => {
    const res = await authedFetch(`${API_BASE}/integrations/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, serviceName }),
    });
    return res.json();
  },

  // Phase 5: Autonomous Daily Executive Briefings & 1-Click Action Cards
  getLatestBriefing: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/briefings/latest/${workspaceId}`);
    return res.json();
  },
  generateBriefing: async (data) => {
    const res = await authedFetch(`${API_BASE}/briefings/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getGlobalBriefing: async () => {
    const res = await authedFetch(`${API_BASE}/briefings/global`);
    return res.json();
  },
  executeActionCard: async (data) => {
    const res = await authedFetch(`${API_BASE}/briefings/actions/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Phase 6: Ultra-Fast Dynamic Landing Page Personalization (Geo-IP & Visitor Intent)
  getGeoPersonalization: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authedFetch(`${API_BASE}/public/personalization?${query}`);
    return res.json();
  },

  // Phase 7: Two-Sided Trade Engine & "No-Website" Onboarding System
  onboardWithoutWebsite: async (data) => {
    const token = authStorage.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await authedFetch(`${API_BASE}/strategy/onboard-no-website`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Phase 8: Autonomous SEO, AEO & Domain Authority Backlink Engine
  checkEmailSpam: async (emailText, subject = '') => {
    const res = await authedFetch(`${API_BASE}/seo-tools/spam-checker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailText, subject }),
    });
    return res.json();
  },
  calculateIcp: async (industry, productDescription = '') => {
    const res = await authedFetch(`${API_BASE}/seo-tools/icp-calculator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, productDescription }),
    });
    return res.json();
  },
  testDomainDns: async (domain) => {
    const res = await authedFetch(`${API_BASE}/seo-tools/dns-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    });
    return res.json();
  },
  getAeoPack: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/seo-tools/aeo-pack/${workspaceId}`);
    return res.json();
  },
  getMasterVyuhoxSchema: async () => {
    const res = await authedFetch(`${API_BASE}/seo-tools/master-schema`);
    return res.json();
  },
  getDigitalPrPitches: async (workspaceId = null) => {
    const url = workspaceId ? `${API_BASE}/seo-tools/digital-pr/pitches?workspaceId=${workspaceId}` : `${API_BASE}/seo-tools/digital-pr/pitches`;
    const res = await authedFetch(url);
    return res.json();
  },
  generateDigitalPrPitch: async (pitchId, founderInfo = null, workspaceId = null) => {
    const res = await authedFetch(`${API_BASE}/seo-tools/digital-pr/generate-pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pitchId, founderInfo, workspaceId }),
    });
    return res.json();
  },
  submitDigitalPrPitch: async (pitchId) => {
    const res = await authedFetch(`${API_BASE}/seo-tools/digital-pr/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pitchId }),
    });
    return res.json();
  },
  markAcceptedDigitalPrPitch: async (pitchId, backlinkUrl = '') => {
    const res = await authedFetch(`${API_BASE}/seo-tools/digital-pr/mark-accepted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pitchId, backlinkUrl }),
    });
    return res.json();
  },
  toggleAeoAutoPilot: async (workspaceId, enabled) => {
    const res = await authedFetch(`${API_BASE}/seo-tools/auto-pilot/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, enabled }),
    });
    return res.json();
  },
  oneClickLaunchSeo: async (workspaceId) => {
    const res = await authedFetch(`${API_BASE}/seo-tools/one-click-launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    return res.json();
  },
  // Universal Business Market Intelligence Radar
  getMarketRadar: async () => {
    return safeFetchJson(`${API_BASE}/strategy/market-radar`);
  },
  sweepMarketRadar: async () => {
    return safeFetchJson(`${API_BASE}/strategy/market-radar/sweep`, { method: 'POST' });
  },
  // Multi-Persona Voiceover Studio
  getVoices: async () => {
    return safeFetchJson(`${API_BASE}/social/voices`);
  },
  previewVoice: async (voiceId, text = '') => {
    return safeFetchJson(`${API_BASE}/social/voices/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId, text }),
    });
  },
  // Complete Corporate Roles & Workforce Taxonomy
  getEmployeeRoles: async () => {
    return safeFetchJson(`${API_BASE}/strategy/employee-roles`);
  },
  // SANJAYA - Autonomous AI Voice Commander
  sendSanjayaCommand: async (commandText, workspaceId) => {
    return safeFetchJson(`${API_BASE}/sanjaya/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandText, workspaceId }),
    });
  },
    getSanjayaSuggestions: async () => {
    return safeFetchJson(`${API_BASE}/sanjaya/suggestions`);
  },

  // Generic HTTP helpers (Axios-compatible)
  get: async (url) => {
    const data = await safeFetchJson(url);
    return { data };
  },
  post: async (url, body) => {
    const data = await safeFetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    return { data };
  },
  put: async (url, body) => {
    const data = await safeFetchJson(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    return { data };
  },

  // Super Admin GTM Governance APIs (4 Pillars)
  getAdminMetrics: async () => {
    return safeFetchJson(`${API_BASE}/billing/admin-metrics`);
  },
  getTenants: async () => {
    return safeFetchJson(`${API_BASE}/billing/tenants`);
  },
  injectWalletCredit: async (payload) => {
    return safeFetchJson(`${API_BASE}/billing/inject-wallet-credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  getOnboardingDropoffs: async () => {
    return safeFetchJson(`${API_BASE}/billing/onboarding-dropoffs`);
  },
  getInfrastructureHealth: async () => {
    return safeFetchJson(`${API_BASE}/billing/infrastructure-health`);
  },
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetchJson(`${API_BASE}/billing/audit-logs?${query}`);
  },
  updateCircuitBreakers: async (payload) => {
    return safeFetchJson(`${API_BASE}/billing/circuit-breakers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateGlobalDnc: async (payload) => {
    return safeFetchJson(`${API_BASE}/billing/global-dnc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateAnnouncement: async (payload) => {
    return safeFetchJson(`${API_BASE}/billing/announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  getSupportTickets: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetchJson(`${API_BASE}/support/tickets?${query}`);
  },
  updateSupportTicket: async (ticketId, payload) => {
    return safeFetchJson(`${API_BASE}/support/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
};






