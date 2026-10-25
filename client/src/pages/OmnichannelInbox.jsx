import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  CheckCheck,
  Check,
  Search,
  Filter,
  Bot,
  Zap,
  Flame,
  AlertTriangle,
  HelpCircle,
  XCircle,
  RefreshCw,
  User,
  Building,
  Clock,
  ChevronDown,
  Calendar,
  ArrowRight,
  ExternalLink,
  Shield,
  Play,
  Share2,
} from 'lucide-react';
import { api } from '../services/api';

const CHANNEL_CONFIG = {
  WHATSAPP: {
    label: 'WhatsApp',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: MessageSquare,
  },
  TELEGRAM: {
    label: 'Telegram',
    color: '#0EA5E9',
    bg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(14, 165, 233, 0.3)',
    icon: MessageCircle,
  },
  SMS: {
    label: 'SMS',
    color: '#A855F7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.3)',
    icon: Phone,
  },
  EMAIL: {
    label: 'Email',
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    icon: Mail,
  },
};

const SENTIMENT_BADGES = {
  HIGH_INTENT: {
    label: 'High Intent',
    icon: Flame,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  OBJECTION: {
    label: 'Objection',
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  GENERAL_INQUIRY: {
    label: 'Question',
    icon: HelpCircle,
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  NOT_INTERESTED: {
    label: 'Not Interested',
    icon: XCircle,
    color: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.35)',
  },
  NEUTRAL: {
    label: 'Neutral',
    icon: Clock,
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.25)',
  },
};

const QUICK_TEMPLATES = [
  {
    title: 'Schedule 15-Min Demo',
    channel: 'WHATSAPP',
    text: 'Great to connect! Would love to walk you through our autonomous GTM engine. Feel free to grab any 15-minute slot on our calendar: https://cal.com/vyuhox/discovery-sync',
  },
  {
    title: 'Pricing & ROI Overview',
    channel: 'EMAIL',
    text: 'Thanks for reaching out regarding pricing. Our plans start with automated multi-channel outbound and waterfall enrichment. Based on your scale, our partners see a 3.4x pipeline acceleration in under 14 days.',
  },
  {
    title: 'Objection / Risk-Free Trial',
    channel: 'SMS',
    text: 'Completely understand your timing and budget consideration. We offer a zero-risk 14-day performance pilot so you can verify lead quality before committing.',
  },
  {
    title: 'Security & Compliance Pack',
    channel: 'TELEGRAM',
    text: 'All our gateways comply with institutional security standards, SOC2 Type II isolation, and encrypted webhook streams. I have attached our compliance dossier for your review.',
  },
];

export default function OmnichannelInbox({ activeWorkspace, socket }) {
  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Composer
  const [composeText, setComposeText] = useState('');
  const [activeComposeChannel, setActiveComposeChannel] = useState('WHATSAPP');
  const [isSending, setIsSending] = useState(false);

  // AI Copilot
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Lead Stage update
  const [updatingStage, setUpdatingStage] = useState(false);
  const [activeLead, setActiveLead] = useState(null);

  // Simulation Modal
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simChannel, setSimChannel] = useState('WHATSAPP');
  const [simText, setSimText] = useState('Hello! We are looking to scale our outbound pipeline. What is your pricing and can we schedule a demo?');
  const [simSenderName, setSimSenderName] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // AI Scraped Leads & Outreach Drafting
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [activeDraftTab, setActiveDraftTab] = useState('EMAIL');

  const messagesEndRef = useRef(null);

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSyncScrapedLeads = async () => {
    if (!activeWorkspace?._id) return;
    setSyncingLeads(true);
    try {
      const res = await api.syncScrapedLeads(activeWorkspace._id);
      if (res.success) {
        showToast(`✨ ${res.message || 'Scraped leads synced and AI outreach drafted!'}`);
        await loadConversations();
      } else {
        showToast(res.message || 'Failed to sync leads');
      }
    } catch (err) {
      showToast('Error syncing leads: ' + err.message);
    } finally {
      setSyncingLeads(false);
    }
  };

  // Bulk Contact Selection & AI Outreach
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkChannel, setBulkChannel] = useState('AUTO');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCustomPrompt, setBulkCustomPrompt] = useState('');
  const [bulkSending, setBulkSending] = useState(false);

  const handleToggleSelectLead = (leadId) => {
    if (!leadId) return;
    const strId = leadId.toString();
    setSelectedLeadIds((prev) =>
      prev.includes(strId) ? prev.filter((id) => id !== strId) : [...prev, strId]
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredConversations
      .map((c) => c.leadId?._id?.toString())
      .filter(Boolean);
    if (selectedLeadIds.length === allFilteredIds.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(allFilteredIds);
    }
  };

  const handleBulkSend = async (channel = bulkChannel, customPrompt = '') => {
    if (!activeWorkspace?._id || selectedLeadIds.length === 0) return;
    setBulkSending(true);
    try {
      const res = await api.bulkDispatchOutreach({
        workspaceId: activeWorkspace._id,
        leadIds: selectedLeadIds,
        channel,
        customPrompt,
      });
      if (res.success) {
        showToast(`🚀 ${res.message || `Dispatched AI outreach to ${res.sentCount} leads!`}`);
        setIsBulkModalOpen(false);
        setBulkCustomPrompt('');
        setSelectedLeadIds([]);
        await loadConversations(true);
      } else {
        showToast(res.message || 'Bulk dispatch failed');
      }
    } catch (err) {
      showToast('Bulk dispatch error: ' + err.message);
    } finally {
      setBulkSending(false);
    }
  };

  // 1. Fetch Conversations on workspace change or filter change
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    loadConversations();
  }, [activeWorkspace?._id, channelFilter]);

  const loadConversations = async (silent = false) => {
    if (!silent) setLoadingThreads(true);
    try {
      const params = {};
      if (channelFilter !== 'ALL') params.channel = channelFilter;
      const res = await api.getConversations(activeWorkspace._id, params);
      if (res.success) {
        setConversations(res.conversations || []);
        // Select first if none selected
        if (!selectedConversation && res.conversations?.length > 0) {
          selectThread(res.conversations[0]);
        } else if (selectedConversation) {
          const updatedSelected = res.conversations.find((c) => c._id === selectedConversation._id);
          if (updatedSelected) {
            setSelectedConversation(updatedSelected);
            setActiveLead(updatedSelected.leadId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      if (!silent) setLoadingThreads(false);
    }
  };

  // 2. Select Thread and Load Messages
  const selectThread = async (conv) => {
    setSelectedConversation(conv);
    setActiveLead(conv.leadId);
    setActiveComposeChannel(conv.activeChannel || 'WHATSAPP');
    setLoadingMessages(true);
    try {
      const res = await api.getConversationMessages(conv._id);
      if (res.success) {
        setMessages(res.messages || []);
        fetchAiSuggestion(conv._id, conv.leadId?._id);
      }
    } catch (err) {
      console.error('Failed to load thread messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 3. Auto-scroll to bottom of conversation stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Fetch AI Suggested Response
  const fetchAiSuggestion = async (conversationId, leadId) => {
    setLoadingAi(true);
    try {
      const res = await api.getAiSuggestion({
        conversationId,
        leadId,
        workspaceId: activeWorkspace?._id,
      });
      if (res.success && res.suggestion) {
        setAiSuggestion(res.suggestion);
      }
    } catch (err) {
      console.error('Failed to get AI suggested response:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Safe deduplicating message appender
  const appendMessageIfNew = (newMsg) => {
    if (!newMsg) return;
    const newId = (newMsg._id || '').toString();
    setMessages((prev) => {
      if (newId && prev.some((m) => (m._id || '').toString() === newId)) {
        return prev;
      }
      return [...prev, newMsg];
    });
  };

  // 5. Socket.io Real-time Event Subscriptions
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = ({ message, conversation, lead, suggestedReply }) => {
      // Append to current thread if matching
      const convId = (message.conversationId || conversation?._id || '').toString();
      const currentConvId = (selectedConversation?._id || '').toString();

      if (selectedConversation && convId === currentConvId) {
        appendMessageIfNew(message);
        if (suggestedReply) {
          setAiSuggestion(suggestedReply);
        }
        if (lead) {
          setActiveLead(lead);
        }
      }
      // Refresh thread list
      loadConversations(true);
    };

    const handleMessageSent = ({ message, conversation }) => {
      const convId = (message.conversationId || conversation?._id || '').toString();
      const currentConvId = (selectedConversation?._id || '').toString();

      if (selectedConversation && convId === currentConvId) {
        appendMessageIfNew(message);
      }
      loadConversations(true);
    };

    const handleConversationUpdated = ({ conversation }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, ...conversation } : c))
      );
    };

    const handleLeadStageChanged = ({ leadId, stage, score }) => {
      if (activeLead && activeLead._id === leadId) {
        setActiveLead((prev) => ({ ...prev, stage, score: score !== undefined ? score : prev.score }));
      }
      setConversations((prev) =>
        prev.map((c) => {
          if (c.leadId?._id === leadId) {
            return { ...c, leadId: { ...c.leadId, stage, score: score !== undefined ? score : c.leadId.score } };
          }
          return c;
        })
      );
    };

    socket.on('message:received', handleMessageReceived);
    socket.on('message:sent', handleMessageSent);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('leadStageChanged', handleLeadStageChanged);

    return () => {
      socket.off('message:received', handleMessageReceived);
      socket.off('message:sent', handleMessageSent);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('leadStageChanged', handleLeadStageChanged);
    };
  }, [socket, selectedConversation, activeLead]);

  // 6. Send Outbound Message
  const handleSendMessage = async (textToSend = composeText) => {
    if (!textToSend.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const payload = {
        conversationId: selectedConversation._id,
        leadId: activeLead?._id,
        workspaceId: activeWorkspace?._id,
        channel: activeComposeChannel,
        content: textToSend.trim(),
      };

      const res = await api.sendMessage(payload);
      if (res.success) {
        setComposeText('');
        appendMessageIfNew(res.message);
        loadConversations(true);
        showToast(`Dispatched via ${activeComposeChannel} Gateway!`);
      }
    } catch (err) {
      console.error('Failed to send outbound message:', err);
      showToast('Error sending message. Check gateway connection.');
    } finally {
      setIsSending(false);
    }
  };

  // 7. Trigger Inbound Simulation
  const handleSimulateInbound = async () => {
    if (!simText.trim()) return;

    setIsSimulating(true);
    try {
      const payload = {
        workspaceId: activeWorkspace?._id,
        leadId: activeLead?._id || selectedConversation?.leadId?._id,
        channel: simChannel,
        content: simText.trim(),
        senderName: simSenderName || activeLead?.name || 'Prospect Contact',
      };

      const res = await api.simulateInbound(payload);
      if (res.success) {
        setIsSimModalOpen(false);
        showToast(`Simulated ${simChannel} reply received & classified!`);
        // If it belongs to currently selected conversation, append
        if (selectedConversation && res.conversation?._id === selectedConversation._id) {
          appendMessageIfNew(res.message);
          if (res.suggestedReply) setAiSuggestion(res.suggestedReply);
          if (res.lead) setActiveLead(res.lead);
        } else if (res.conversation) {
          selectThread(res.conversation);
        }
        loadConversations(true);
      }
    } catch (err) {
      console.error('Failed to simulate inbound:', err);
      showToast('Simulation failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  // 8. Update Lead Stage Inline
  const handleUpdateLeadStage = async (newStage) => {
    if (!activeLead?._id || !activeWorkspace?._id) return;
    setUpdatingStage(true);
    try {
      const res = await api.updateLeadStage(activeWorkspace._id, activeLead._id, newStage);
      if (res.success) {
        setActiveLead(res.lead);
        showToast(`Pipeline Stage updated to "${newStage}"`);
        loadConversations(true);
      }
    } catch (err) {
      console.error('Failed to update lead stage:', err);
    } finally {
      setUpdatingStage(false);
    }
  };

  // 9. Enroll in Drip Sequence
  const handleStartEmailSequence = async () => {
    if (!activeLead?._id || !activeWorkspace?._id) return;
    try {
      const res = await api.enrollInSequence(activeWorkspace._id, activeLead._id);
      if (res.success) {
        showToast(`Enrolled ${activeLead.name} in SaaS Founder Drip Sequence!`);
      }
    } catch (err) {
      console.error('Failed to enroll lead:', err);
    }
  };

  // Filter threads by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const lead = c.leadId || {};
    return (
      (lead.name || '').toLowerCase().includes(q) ||
      (lead.company || '').toLowerCase().includes(q) ||
      (c.lastMessageSnippet || '').toLowerCase().includes(q)
    );
  });

  // Deduplicate messages in display by _id
  const displayMessages = React.useMemo(() => {
    const seen = new Set();
    return messages.filter((msg) => {
      const id = (msg._id || '').toString();
      if (id && seen.has(id)) return false;
      if (id) seen.add(id);
      return true;
    });
  }, [messages]);

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 65px)',
      background: '#070C18',
      color: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '380px',
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.25)',
          borderRadius: '10px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#38BDF8',
          fontSize: '0.875rem',
          fontWeight: '600',
          backdropFilter: 'blur(16px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Zap size={16} color="#06B6D4" />
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLUMN 1: THREADS LIST (LEFT) */}
      {/* ========================================================================= */}
      <div style={{
        width: '340px',
        minWidth: '320px',
        maxWidth: '380px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 17, 32, 0.7)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Threads Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.35)',
              }}>
                <MessageSquare size={17} color="#04101A" strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, letterSpacing: '0.01em' }}>
                  Omnichannel Inbox
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  {conversations.length} Active Threads
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                id="sync-scraped-leads-btn"
                onClick={handleSyncScrapedLeads}
                disabled={syncingLeads}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#38BDF8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: syncingLeads ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Fetch scraped CRM leads and use AI to draft personalized Email, WhatsApp, Telegram, and SMS outreach"
              >
                <Sparkles size={12} className={syncingLeads ? 'spin-icon' : ''} color="#10B981" />
                {syncingLeads ? 'AI Drafting...' : 'AI Draft Leads'}
              </button>

              <button
                id="simulate-inbound-btn"
                onClick={() => {
                  setSimSenderName(activeLead?.name || '');
                  setIsSimModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#38BDF8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Simulate inbound message from lead"
              >
                <Zap size={13} />
                Simulate
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search leads, companies, messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Channel Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '5px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}>
            {[
              { id: 'ALL', label: 'All', color: '#38BDF8' },
              { id: 'WHATSAPP', label: 'WhatsApp', color: '#10B981' },
              { id: 'TELEGRAM', label: 'Telegram', color: '#0EA5E9' },
              { id: 'SMS', label: 'SMS', color: '#A855F7' },
              { id: 'EMAIL', label: 'Email', color: '#06B6D4' },
            ].map((tab) => {
              const active = channelFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setChannelFilter(tab.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: active ? '700' : '500',
                    background: active ? `${tab.color}25` : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${active ? tab.color : 'rgba(255, 255, 255, 0.06)'}`,
                    color: active ? tab.color : '#94A3B8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Select All & Multi-Lead Selection Bar */}
          {filteredConversations.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.72rem',
              color: '#94A3B8',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filteredConversations.length > 0 && selectedLeadIds.length === filteredConversations.length}
                  onChange={handleToggleSelectAll}
                  style={{ accentColor: '#06B6D4', cursor: 'pointer' }}
                />
                <span>Select All ({filteredConversations.length})</span>
              </label>

              {selectedLeadIds.length > 0 ? (
                <span style={{ color: '#38BDF8', fontWeight: '700' }}>
                  {selectedLeadIds.length} Selected
                </span>
              ) : (
                <span style={{ fontSize: '0.675rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="live-dot" style={{ width: '6px', height: '6px', background: '#10B981' }} />
                  AI Auto-Closer Active
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bulk AI Action Toolbar */}
        {selectedLeadIds.length > 0 && (
          <div style={{
            padding: '10px 14px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(16, 185, 129, 0.18) 100%)',
            borderBottom: '1px solid rgba(6, 182, 212, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#F8FAFC' }}>
                ⚡ Bulk Outreach ({selectedLeadIds.length} Selected)
              </span>
              <button
                onClick={() => setSelectedLeadIds([])}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>

            {/* Target Channel Selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'AUTO', label: 'Auto (Best)' },
                { id: 'WHATSAPP', label: 'WhatsApp' },
                { id: 'EMAIL', label: 'Email' },
                { id: 'TELEGRAM', label: 'Telegram' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setBulkChannel(ch.id)}
                  style={{
                    flex: 1,
                    padding: '3px 4px',
                    borderRadius: '5px',
                    fontSize: '0.66rem',
                    fontWeight: bulkChannel === ch.id ? '700' : '500',
                    background: bulkChannel === ch.id ? '#06B6D4' : 'rgba(255, 255, 255, 0.06)',
                    color: bulkChannel === ch.id ? '#04101A' : '#CBD5E1',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Dispatch Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => handleBulkSend(bulkChannel)}
                disabled={bulkSending}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: bulkSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Send size={11} />
                {bulkSending ? 'Sending...' : `AI Send (${selectedLeadIds.length})`}
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                disabled={bulkSending}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#38BDF8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Enter custom campaign goal or product feature update"
              >
                <Sparkles size={11} />
                Custom AI Pitch
              </button>
            </div>
          </div>
        )}

        {/* Thread Cards List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {loadingThreads ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', fontSize: '0.85rem' }}>
              <RefreshCw size={20} className="spin-icon" style={{ margin: '0 auto 10px' }} />
              Connecting to omnichannel streams...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
              <Sparkles size={24} color="#06B6D4" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
              <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '6px' }}>
                No active outreach threads
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '0 0 14px', lineHeight: '1.4' }}>
                Fetch your scraped CRM leads to automatically draft tailored AI messages across Email, WhatsApp, Telegram, and SMS.
              </p>
              <button
                onClick={handleSyncScrapedLeads}
                disabled={syncingLeads}
                style={{
                  padding: '7px 12px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  border: 'none',
                  color: '#04101A',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: syncingLeads ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} className={syncingLeads ? 'spin-icon' : ''} />
                {syncingLeads ? 'AI Drafting...' : '⚡ AI Fetch & Draft Leads'}
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConversation?._id === conv._id;
              const lead = conv.leadId || {};
              const channelMeta = CHANNEL_CONFIG[conv.activeChannel] || CHANNEL_CONFIG.WHATSAPP;
              const ChannelIcon = channelMeta.icon;
              const sentimentMeta = SENTIMENT_BADGES[conv.sentiment] || SENTIMENT_BADGES.NEUTRAL;
              const SentimentIcon = sentimentMeta.icon;

              return (
                <div
                  key={conv._id}
                  onClick={() => selectThread(conv)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isSelected
                      ? 'rgba(6, 182, 212, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'rgba(6, 182, 212, 0.45)' : 'rgba(255, 255, 255, 0.05)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Top row: Avatar + Name + Time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelectLead(lead._id);
                        }}
                        style={{ accentColor: '#06B6D4', cursor: 'pointer', width: '14px', height: '14px', marginRight: '2px' }}
                        title="Select lead for bulk outreach"
                      />
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        color: channelMeta.color,
                        position: 'relative',
                      }}>
                        {(lead.name || 'L').charAt(0)}
                        <span style={{
                          position: 'absolute',
                          bottom: '-3px',
                          right: '-3px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: channelMeta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <ChannelIcon size={8} color="#04101A" />
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F1F5F9' }}>
                          {lead.name || 'Unnamed Contact'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {lead.company || 'Enterprise Lead'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {conv.unreadCount > 0 && (
                        <div style={{
                          marginTop: '3px',
                          background: '#06B6D4',
                          color: '#04101A',
                          borderRadius: '10px',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '1px 6px',
                          display: 'inline-block',
                        }}>
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Snippet */}
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#94A3B8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '8px',
                  }}>
                    {conv.lastMessageSnippet || 'No messages yet...'}
                  </div>

                  {/* Badges: Channel + Sentiment */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: channelMeta.bg,
                      color: channelMeta.color,
                      border: `1px solid ${channelMeta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <ChannelIcon size={10} />
                      {channelMeta.label}
                    </span>

                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: sentimentMeta.bg,
                      color: sentimentMeta.color,
                      border: `1px solid ${sentimentMeta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <SentimentIcon size={10} />
                      {sentimentMeta.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLUMN 2: LIVE CONVERSATION STREAM (MIDDLE) */}
      {/* ========================================================================= */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#090E1A',
        position: 'relative',
      }}>
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(11, 17, 32, 0.8)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1rem',
                  color: '#04101A',
                }}>
                  {(activeLead?.name || 'L').charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>
                      {activeLead?.name || 'Contact'}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: '600',
                    }}>
                      ● Live Gateway Sync
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                    {activeLead?.title ? `${activeLead.title} at ` : ''}{activeLead?.company || 'Enterprise'} • {activeLead?.phone || activeLead?.email || 'Connected'}
                  </div>
                </div>
              </div>

              {/* Active Channel Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Current Channel:</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: CHANNEL_CONFIG[selectedConversation.activeChannel]?.bg || 'rgba(6, 182, 212, 0.15)',
                  color: CHANNEL_CONFIG[selectedConversation.activeChannel]?.color || '#06B6D4',
                  border: `1px solid ${CHANNEL_CONFIG[selectedConversation.activeChannel]?.border || 'rgba(6, 182, 212, 0.3)'}`,
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {React.createElement(CHANNEL_CONFIG[selectedConversation.activeChannel]?.icon || MessageSquare, { size: 13 })}
                  {CHANNEL_CONFIG[selectedConversation.activeChannel]?.label || selectedConversation.activeChannel}
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
                  <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 12px' }} />
                  Loading message stream...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
                  No messages in this thread yet. Send a greeting below!
                </div>
              ) : (
                displayMessages.map((msg) => {
                  const isInbound = msg.direction === 'INBOUND';
                  const channelInfo = CHANNEL_CONFIG[msg.channel] || CHANNEL_CONFIG.WHATSAPP;
                  const ChannelIcon = channelInfo.icon;

                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isInbound ? 'flex-start' : 'flex-end',
                        maxWidth: '82%',
                        alignSelf: isInbound ? 'flex-start' : 'flex-end',
                      }}
                    >
                      {/* Sender and Channel Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        fontSize: '0.72rem',
                        color: '#64748B',
                      }}>
                        <ChannelIcon size={12} color={channelInfo.color} />
                        <span>{msg.senderName || (isInbound ? activeLead?.name : 'You')}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Bubble */}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: isInbound ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        background: isInbound
                          ? 'rgba(15, 23, 42, 0.85)'
                          : 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
                        border: isInbound
                          ? `1px solid rgba(255, 255, 255, 0.08)`
                          : '1px solid rgba(13, 148, 136, 0.4)',
                        color: '#F8FAFC',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        boxShadow: isInbound
                          ? '0 4px 16px rgba(0,0,0,0.2)'
                          : '0 4px 20px rgba(13, 148, 136, 0.25)',
                        position: 'relative',
                        wordBreak: 'break-word',
                      }}>
                        {msg.content}

                        {/* Status Checkmark for Outbound */}
                        {!isInbound && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                            marginTop: '4px',
                            fontSize: '0.65rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                          }}>
                            <span>{msg.status || 'DELIVERED'}</span>
                            <CheckCheck size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Outbound Compose Box */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(11, 17, 32, 0.95)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {/* Channel Switcher + Quick Templates Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>DISPATCH VIA:</span>
                  {['WHATSAPP', 'TELEGRAM', 'SMS', 'EMAIL'].map((ch) => {
                    const cfg = CHANNEL_CONFIG[ch];
                    const active = activeComposeChannel === ch;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={ch}
                        onClick={() => setActiveComposeChannel(ch)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: active ? '700' : '500',
                          background: active ? cfg.bg : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${active ? cfg.border : 'rgba(255, 255, 255, 0.06)'}`,
                          color: active ? cfg.color : '#94A3B8',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon size={12} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Templates Selector & AI Draft Load */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedConversation?.aiDrafts?.[activeComposeChannel] && (
                    <button
                      type="button"
                      id="load-ai-draft-quick-btn"
                      onClick={() => {
                        const draft = selectedConversation.aiDrafts[activeComposeChannel];
                        const text = activeComposeChannel === 'EMAIL' && draft.subject
                          ? `Subject: ${draft.subject}\n\n${draft.body}`
                          : draft.body;
                        setComposeText(text);
                        showToast(`✨ Loaded AI ${activeComposeChannel} draft`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#10B981',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                      title="Load AI drafted copy for this channel"
                    >
                      <Sparkles size={11} />
                      Load AI Draft
                    </button>
                  )}

                  <select
                    onChange={(e) => {
                      const tmpl = QUICK_TEMPLATES.find((t) => t.title === e.target.value);
                      if (tmpl) {
                        setComposeText(tmpl.text);
                        setActiveComposeChannel(tmpl.channel);
                      }
                    }}
                    defaultValue=""
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      color: '#38BDF8',
                      fontSize: '0.72rem',
                      padding: '4px 8px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled>⚡ Quick Templates</option>
                    {QUICK_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.title} value={tmpl.title}>
                        {tmpl.title} ({tmpl.channel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Input & Send Button */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea
                  id="compose-message-input"
                  rows={2}
                  placeholder={`Draft outbound reply to ${activeLead?.name || 'lead'} via ${CHANNEL_CONFIG[activeComposeChannel]?.label}... (Press Enter to send, Shift+Enter for new line)`}
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    outline: 'none',
                    resize: 'none',
                  }}
                />

                <button
                  id="send-message-btn"
                  onClick={() => handleSendMessage()}
                  disabled={isSending || !composeText.trim()}
                  style={{
                    height: '48px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    background: composeText.trim()
                      ? 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)'
                      : 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    color: composeText.trim() ? '#04101A' : '#64748B',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: composeText.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: composeText.trim() ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSending ? (
                    <RefreshCw size={16} className="spin-icon" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            padding: '40px',
            textAlign: 'center',
          }}>
            <MessageSquare size={48} color="#06B6D4" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', margin: '0 0 8px' }}>Omnichannel Communications Hub</h3>
            <p style={{ maxWidth: '420px', fontSize: '0.875rem' }}>
              Select a conversation thread from the left or trigger an incoming simulation to experience real-time AI classification and multi-channel dispatch.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COLUMN 3: LEAD CRM DOSSIER & AI COPILOT (RIGHT) */}
      {/* ========================================================================= */}
      <div style={{
        width: '360px',
        minWidth: '340px',
        maxWidth: '400px',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 17, 32, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '18px',
        gap: '16px',
      }}>
        {activeLead ? (
          <>
            {/* Header / Profile Card */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CRM Lead Dossier
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38BDF8',
                  fontWeight: '700',
                }}>
                  ID: {activeLead._id.toString().substring(18)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#04101A',
                }}>
                  {activeLead.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                    {activeLead.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    {activeLead.title || 'Executive'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600' }}>
                    {activeLead.company || 'Enterprise Account'}
                  </div>
                </div>
              </div>

              {/* Contact Specs */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.78rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
                  <Mail size={13} color="#06B6D4" />
                  <span style={{ color: '#F1F5F9' }}>{activeLead.email || 'No email attached'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
                  <Phone size={13} color="#10B981" />
                  <span style={{ color: '#F1F5F9' }}>{activeLead.phone || 'No phone attached'}</span>
                </div>
              </div>

              {/* AI Score Gauge */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600' }}>AI FIT SCORE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>
                    {activeLead.score || 75}/100
                  </div>
                </div>
                <div style={{
                  width: '90px',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${activeLead.score || 75}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #06B6D4, #10B981)',
                    borderRadius: '4px',
                  }} />
                </div>
              </div>
            </div>

            {/* Pipeline Stage Controller */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  CRM Pipeline Stage
                </span>
                {updatingStage && <span style={{ fontSize: '0.68rem', color: '#06B6D4' }}>Syncing...</span>}
              </div>

              <select
                id="lead-stage-select"
                value={activeLead.stage || 'Prospect'}
                onChange={(e) => handleUpdateLeadStage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(11, 17, 32, 0.9)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '8px',
                  color: '#38BDF8',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Prospect">📍 Prospect</option>
                <option value="Contacted">💬 Contacted</option>
                <option value="Qualified">🔥 Qualified</option>
                <option value="Demo_Booked">📅 Demo Booked</option>
                <option value="Won">🏆 Won (Closed)</option>
                <option value="Lost">❌ Lost</option>
              </select>
            </div>

            {/* Quick Actions (Voice AI, Sequences) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <button
                id="trigger-voice-call-btn"
                onClick={async () => {
                  if (activeLead?.phone) {
                    showToast(`📞 Dialing ${activeLead.name} via Bland.ai Voice AI (<800ms)...`);
                    try {
                      await api.dispatchCall({
                        workspaceId: activeWorkspace?._id,
                        leadId: activeLead._id,
                        phoneNumber: activeLead.phone,
                      });
                      showToast(`📞 Voice AI Call connected to ${activeLead.name}!`);
                    } catch {
                      showToast(`Voice call queued for ${activeLead.name}`);
                    }
                  } else {
                    showToast('No phone number attached to lead');
                  }
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Phone size={15} />
                Trigger Voice AI Call
              </button>

              <button
                id="start-email-sequence-btn"
                onClick={handleStartEmailSequence}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#38BDF8',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Calendar size={15} />
                Start Email Drip Sequence
              </button>
            </div>

            {/* 🤖 AI AUTONOMOUS MULTI-CHANNEL OUTREACH DRAFTS */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={16} color="#10B981" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#F8FAFC' }}>
                    AI Omnichannel Drafts
                  </span>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  fontWeight: '700',
                }}>
                  Sarah SDR AI
                </span>
              </div>

              {/* Channel Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
                {[
                  { id: 'EMAIL', label: 'Email', icon: Mail, color: '#06B6D4' },
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: '#10B981' },
                  { id: 'TELEGRAM', label: 'Telegram', icon: MessageCircle, color: '#0EA5E9' },
                  { id: 'SMS', label: 'SMS', icon: Phone, color: '#A855F7' },
                ].map((tab) => {
                  const active = activeDraftTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDraftTab(tab.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '6px 2px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: active ? '700' : '500',
                        background: active ? `${tab.color}30` : 'transparent',
                        border: active ? `1px solid ${tab.color}` : '1px solid transparent',
                        color: active ? tab.color : '#94A3B8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <TabIcon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Current Channel Draft Content */}
              {(() => {
                const drafts = selectedConversation?.aiDrafts || selectedConversation?.metadata?.aiDrafts || {};
                const currentDraft = drafts[activeDraftTab];

                if (!currentDraft || (!currentDraft.body && !currentDraft.subject)) {
                  return (
                    <div style={{
                      padding: '14px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#94A3B8',
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}>
                      No {activeDraftTab} draft cached for this lead yet.
                      <button
                        onClick={handleSyncScrapedLeads}
                        disabled={syncingLeads}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          marginTop: '8px',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          background: 'rgba(6, 182, 212, 0.2)',
                          border: '1px solid rgba(6, 182, 212, 0.4)',
                          color: '#38BDF8',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={11} className={syncingLeads ? 'spin-icon' : ''} />
                        {syncingLeads ? 'Drafting...' : '✨ Generate AI Drafts'}
                      </button>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeDraftTab === 'EMAIL' && currentDraft.subject && (
                      <div style={{
                        fontSize: '0.74rem',
                        padding: '6px 10px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        borderRadius: '6px',
                        color: '#F8FAFC',
                      }}>
                        <strong style={{ color: '#38BDF8' }}>Subject:</strong> {currentDraft.subject}
                      </div>
                    )}
                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      color: '#CBD5E1',
                      lineHeight: '1.45',
                      maxHeight: '130px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-line',
                    }}>
                      {currentDraft.body}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setActiveComposeChannel(activeDraftTab);
                          const text = activeDraftTab === 'EMAIL' && currentDraft.subject
                            ? `Subject: ${currentDraft.subject}\n\n${currentDraft.body}`
                            : currentDraft.body;
                          setComposeText(text);
                          showToast(`Applied ${activeDraftTab} AI draft to composer!`);
                        }}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Edit in Compose
                      </button>
                      <button
                        onClick={async () => {
                          setActiveComposeChannel(activeDraftTab);
                          const textToSend = activeDraftTab === 'EMAIL' && currentDraft.subject
                            ? `Subject: ${currentDraft.subject}\n\n${currentDraft.body}`
                            : currentDraft.body;
                          await handleSendMessage(textToSend);
                        }}
                        disabled={isSending}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                          border: 'none',
                          color: '#04101A',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Send size={11} />
                        Instant Send
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 🤖 AI COPILOT SUGGESTED RESPONSE */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              boxShadow: '0 8px 32px rgba(6, 182, 212, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#06B6D4" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#F8FAFC' }}>
                    AI Copilot Draft
                  </span>
                </div>
                <button
                  onClick={() => fetchAiSuggestion(selectedConversation?._id, activeLead?._id)}
                  disabled={loadingAi}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                  title="Regenerate suggestion"
                >
                  <RefreshCw size={13} className={loadingAi ? 'spin-icon' : ''} />
                </button>
              </div>

              {/* Rationale Tag */}
              {aiSuggestion?.rationale && (
                <div style={{
                  fontSize: '0.7rem',
                  color: '#38BDF8',
                  background: 'rgba(6, 182, 212, 0.12)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  lineHeight: '1.4',
                }}>
                  💡 {aiSuggestion.rationale}
                </div>
              )}

              {/* Suggested Reply Content */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.8)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                lineHeight: '1.5',
                minHeight: '60px',
              }}>
                {loadingAi ? (
                  <div style={{ color: '#64748B', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={14} className="spin-icon" /> Drafting AI response...
                  </div>
                ) : (
                  aiSuggestion?.suggestedText || 'Click regenerate to draft an AI suggested reply based on the current lead intent.'
                )}
              </div>

              {/* 1-Click Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  id="insert-and-send-ai-btn"
                  onClick={() => {
                    if (aiSuggestion?.suggestedText) {
                      handleSendMessage(aiSuggestion.suggestedText);
                    }
                  }}
                  disabled={!aiSuggestion?.suggestedText}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '7px',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                    border: 'none',
                    color: '#04101A',
                    fontWeight: '800',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <Send size={12} />
                  Insert & Send
                </button>

                <button
                  onClick={() => {
                    if (aiSuggestion?.suggestedText) {
                      setComposeText(aiSuggestion.suggestedText);
                      showToast('Inserted AI draft into composer');
                    }
                  }}
                  disabled={!aiSuggestion?.suggestedText}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontWeight: '600',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontSize: '0.85rem' }}>
            Select a thread to load contact dossier and AI Copilot recommendations.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SIMULATE INBOUND MESSAGE MODAL */}
      {/* ========================================================================= */}
      {isSimModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 7, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '480px',
            maxWidth: '92vw',
            background: '#0B1120',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#06B6D4" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Simulate Inbound Lead Message
                </h3>
              </div>
              <button
                onClick={() => setIsSimModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
              Test the unified inbound webhook and real-time AI sentiment classifier by generating an instant lead response.
            </p>

            {/* Select Channel */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                INBOUND CHANNEL
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['WHATSAPP', 'TELEGRAM', 'SMS', 'EMAIL'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSimChannel(ch)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: simChannel === ch ? '700' : '500',
                      background: simChannel === ch ? CHANNEL_CONFIG[ch].bg : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${simChannel === ch ? CHANNEL_CONFIG[ch].color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: simChannel === ch ? CHANNEL_CONFIG[ch].color : '#94A3B8',
                      cursor: 'pointer',
                    }}
                  >
                    {CHANNEL_CONFIG[ch].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                SCENARIO PRESETS
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: '🔥 High Intent: Pricing & Demo Request', text: "Hello! We are looking to scale our outbound pipeline. What is your pricing and can we schedule a demo this Friday?" },
                  { label: '⚠️ Objection: Pricing Too Expensive', text: "We looked over your proposal. The pricing seems too expensive compared to our current internal setup right now." },
                  { label: '💬 General Inquiry: Feature Check', text: "Hi, does your platform natively integrate with Telegram and WhatsApp webhooks for real-time alerting?" },
                  { label: '🚫 Not Interested: Unsubscribe', text: "Please remove me from your list and unsubscribe. Not interested at this time." },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSimText(preset.text)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#E2E8F0',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                MESSAGE CONTENT
              </label>
              <textarea
                rows={3}
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Submit Simulation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsSimModalOpen(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94A3B8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                id="submit-simulate-inbound"
                onClick={handleSimulateInbound}
                disabled={isSimulating || !simText.trim()}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  border: 'none',
                  color: '#04101A',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSimulating ? <RefreshCw size={14} className="spin-icon" /> : <Zap size={14} />}
                Trigger Inbound Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK CUSTOM AI PITCH MODAL */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#0B1120',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.2)',
            borderRadius: '14px',
            width: '540px',
            maxWidth: '92vw',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06B6D4, #10B981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sparkles size={20} color="#04101A" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Custom AI Pitch Campaign
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    Personalize & dispatch to <span style={{ color: '#38BDF8', fontWeight: '700' }}>{selectedLeadIds.length} leads</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Channel Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                TARGET CHANNEL
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'AUTO', label: 'Auto (Best)', icon: Sparkles, color: '#06B6D4' },
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: '#10B981' },
                  { id: 'EMAIL', label: 'Email', icon: Mail, color: '#38BDF8' },
                  { id: 'TELEGRAM', label: 'Telegram', icon: Send, color: '#0EA5E9' },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const active = bulkChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setBulkChannel(ch.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        background: active ? `${ch.color}25` : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${active ? ch.color : 'rgba(255, 255, 255, 0.08)'}`,
                        color: active ? ch.color : '#CBD5E1',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: active ? '700' : '500',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Icon size={16} />
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign Prompt / Goal */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                CUSTOM AI DIRECTIVE / VALUE PROP OBJECTIVE
              </label>
              <textarea
                rows={4}
                value={bulkCustomPrompt}
                onChange={(e) => setBulkCustomPrompt(e.target.value)}
                placeholder="E.g., Highlight our end-to-end web & mobile app engineering services, mention our recent 40% performance boost guarantee, and propose an architecture audit..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                  fontSize: '0.82rem',
                  outline: 'none',
                  lineHeight: '1.4',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Quick Strategy Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                OR SELECT STRATEGY PRESET:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {
                    label: '🎯 Consultative Feature Breakdown & Deal Closing',
                    prompt: 'Detail our top service offerings, explain key features and direct ROI, and propose closing a partnership agreement this week.',
                  },
                  {
                    label: '🚀 End-of-Quarter 20% Strategic Partnership Offer',
                    prompt: 'Introduce our premium services catalog with a special 20% quarterly partnership incentive, highlighting fast time-to-market.',
                  },
                  {
                    label: '💼 Complimentary Tech & Strategy Growth Audit',
                    prompt: 'Offer a 100% free comprehensive audit of their digital presence and infrastructure based on our core capabilities.',
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBulkCustomPrompt(preset.prompt)}
                    style={{
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#E2E8F0',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                disabled={bulkSending}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94A3B8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                id="submit-bulk-campaign"
                onClick={() => handleBulkSend(bulkChannel, bulkCustomPrompt)}
                disabled={bulkSending}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  border: 'none',
                  color: '#04101A',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: bulkSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {bulkSending ? <RefreshCw size={14} className="spin-icon" /> : <Send size={14} />}
                {bulkSending ? 'AI Dispatching...' : `Launch AI Campaign (${selectedLeadIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
