import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './views/DashboardView';
import ClientDashboardView from './views/ClientDashboardView';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSidebar from './components/admin/SuperAdminSidebar';
import SuperAdminTopBar from './components/admin/SuperAdminTopBar';
import LeadsView from './views/LeadsView';
import SettingsWalletView from './views/SettingsWalletView';
import PhaseRoadmapPreview from './views/PhaseRoadmapPreview';
import StrategyPlanner from './pages/StrategyPlanner';
import LeadFinder from './pages/LeadFinder';
import OmnichannelInbox from './pages/OmnichannelInbox';
import VoiceStudio from './pages/VoiceStudio';
import SocialStudio from './pages/SocialStudio';
import AdsManager from './pages/AdsManager';
import IntegrationsHub from './pages/IntegrationsHub';
import CalendarSettings from './pages/CalendarSettings';
import ComplianceSettings from './pages/ComplianceSettings';
import AICompanyHQ from './pages/AICompanyHQ';
import AgentStore from './pages/AgentStore';
import LandingPage from './pages/LandingPage';
import ClientAuthPage from './pages/ClientAuthPage';
import AdminAuthPage from './pages/AdminAuthPage';
import SeoAeoHub from './pages/SeoAeoHub';
import SpamChecker from './pages/FreeTools/SpamChecker';
import IcpCalculator from './pages/FreeTools/IcpCalculator';
import DnsTester from './pages/FreeTools/DnsTester';

import ModeSwitchModal from './components/ModeSwitchModal';
import NewLeadModal from './components/modals/NewLeadModal';
import NewWorkspaceModal from './components/modals/NewWorkspaceModal';
import AddFundsModal from './components/modals/AddFundsModal';
import BulkImportModal from './components/modals/BulkImportModal';
import ConnectChannelsModal from './components/modals/ConnectChannelsModal';
import SanjayaVoiceCommander from './components/SanjayaVoiceCommander';
import SupportHelpWidget from './components/SupportHelpWidget';
import TacticalCommandDock from './components/TacticalCommandDock';
import UniversalCommandPalette from './components/UniversalCommandPalette';
import { Mic, Sparkles } from 'lucide-react';

import { api } from './services/api';
import { authStorage } from './services/authStorage';

export default function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    try {
      return authStorage.getActiveWorkspace();
    } catch (e) {}
    return null;
  });
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [operatingMode, setOperatingMode] = useState('AI_COMPANY');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [targetChatConversationId, setTargetChatConversationId] = useState(null);
  const [globalAnnouncement, setGlobalAnnouncement] = useState(null);

  // Dedicated URL Route Detection:
  // - '#admin', '#admin-login', '/admin' -> 'admin_login' (Super Admin Master Portal)
  // - '#login', '#signin', '/login'      -> 'client_login' (Business Client Login)
  // - '#signup', '#register', '/signup'  -> 'client_signup' (Business Client Registration)
  // - '#app', '/app'                     -> 'app' (App Workspace)
  // - default / '#landing'               -> 'landing' (Public Website)
  const getViewFromLocation = () => {
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();

    if (
      hash === '#admin' ||
      hash === '#admin-login' ||
      hash.startsWith('#admin') ||
      path === '/admin' ||
      path === '/admin/login'
    ) {
      return 'admin_login';
    }
    if (
      hash === '#login' ||
      hash === '#signin' ||
      path === '/login' ||
      path === '/signin'
    ) {
      return 'client_login';
    }
    if (
      hash === '#signup' ||
      hash === '#register' ||
      path === '/signup' ||
      path === '/register'
    ) {
      return 'client_signup';
    }
    if (hash === '#tools/spam-checker' || path === '/tools/spam-checker') {
      return 'tool_spam_checker';
    }
    if (hash === '#tools/icp-calculator' || path === '/tools/icp-calculator') {
      return 'tool_icp_calculator';
    }
    if (hash === '#tools/dns-tester' || hash === '#tools/dns-lookup' || path === '/tools/dns-lookup') {
      return 'tool_dns_tester';
    }
    if (hash === '#app' || path === '/app') {
      return 'app';
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState(getViewFromLocation);

  useEffect(() => {
    const handleHash = () => setCurrentView(getViewFromLocation());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Global Currency State (USD $ vs INR ₹) with automatic Indian timezone detection
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('vyuhox_currency');
      if (saved === 'INR' || saved === 'USD') return saved;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const offset = new Date().getTimezoneOffset();
      if (tz.includes('Calcutta') || tz.includes('Kolkata') || offset === -330) {
        return 'INR';
      }
    } catch (e) {}
    return 'INR';
  });

  const setCurrency = (newCurr) => {
    setCurrencyState(newCurr);
    try {
      localStorage.setItem('vyuhox_currency', newCurr);
    } catch (e) {}
  };

  const exchangeRate = 83.5;

  // Current Logged-In User Identity
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return authStorage.getUser();
    } catch (e) {
      return null;
    }
  });

  // Role / Persona Simulation (superadmin, client_ai, client_tool)
  const [rolePersona, setRolePersona] = useState(() => {
    try {
      const u = authStorage.getUser();
      const w = authStorage.getActiveWorkspace();
      if (u) {
        if (u.role === 'superadmin') return 'superadmin';
        const isPaidAi = w?.operatingMode === 'AI_COMPANY' && w?.subscription?.planTier && w?.subscription?.planTier !== 'NONE';
        return isPaidAi ? 'client_ai' : 'client_tool';
      }
    } catch (e) {}
    return 'client_tool';
  });
  const [isAdminInspectionMode, setIsAdminInspectionMode] = useState(false);
  const [adminActivePillar, setAdminActivePillar] = useState('vitals');
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);

  // Super Admin Pending Support Tickets Counter
  useEffect(() => {
    if (rolePersona === 'superadmin' || currentUser?.role === 'superadmin') {
      const fetchPendingTickets = async () => {
        try {
          const res = await api.getSupportTickets({ status: 'OPEN' });
          if (res?.success && Array.isArray(res.tickets)) {
            setPendingTicketsCount(res.tickets.length);
          }
        } catch (e) {}
      };
      fetchPendingTickets();
      const interval = setInterval(fetchPendingTickets, 30000);
      return () => clearInterval(interval);
    }
  }, [rolePersona, currentUser]);

  const handleSwitchToPlatformHQ = () => {
    const hqWs =
      workspaces.find(
        (w) =>
          w.name?.toLowerCase().includes('platform hq') ||
          w.name?.toLowerCase().includes('vyuhox')
      ) || workspaces[0];
    if (hqWs) {
      setActiveWorkspace(hqWs);
      authStorage.setActiveWsId(hqWs._id);
      setOperatingMode(hqWs.operatingMode || 'AI_COMPANY');
      setIsAdminInspectionMode(true);
      setActiveTab('dashboard');
    } else {
      setIsNewWorkspaceModalOpen(true);
    }
  };


  // Sync hash and history state changes with currentView
  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentView(getViewFromLocation());
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Modals
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isConnectChannelsModalOpen, setIsConnectChannelsModalOpen] = useState(false);
  const [isSanjayaOpen, setIsSanjayaOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Global Keyboard Shortcut: Cmd+K or Ctrl+K opens Universal Omnibar
  useEffect(() => {
    const handleCmdK = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleCmdK);
    return () => window.removeEventListener('keydown', handleCmdK);
  }, []);

  // Global Keyboard Shortcut: Cmd+J or Ctrl+J opens SANJAYA Voice Commander
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setIsSanjayaOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Initial Load: Fetch Workspaces & Match Logged-In User
  useEffect(() => {
    const initApp = async () => {
      try {
        const token = authStorage.getToken();
        if (!token) {
          setCurrentUser(null);
          setActiveWorkspace(null);
          setWorkspaces([]);
          return;
        }

        const meRes = await api.getMe(token);
        if (meRes.success && meRes.user) {
          setCurrentUser(meRes.user);
          authStorage.setUser(meRes.user);

          const wsList = meRes.workspaces || [];
          setWorkspaces(wsList);

          const savedWsId = authStorage.getActiveWsId();
          let matchedWs = null;

          if (savedWsId && wsList.length > 0) {
            matchedWs = wsList.find((w) => String(w._id) === String(savedWsId));
          }
          if (!matchedWs) {
            matchedWs = meRes.activeWorkspace;
          }
          if (!matchedWs && wsList.length > 0) {
            matchedWs = wsList.find((w) => String(w._id) === String(meRes.user.workspaceId)) || wsList[0];
          }

          if (matchedWs) {
            setActiveWorkspace(matchedWs);
            authStorage.setActiveWorkspace(matchedWs);
            setOperatingMode(matchedWs.operatingMode || 'TOOL');
          }

          if (meRes.user.role === 'superadmin') {
            setRolePersona('superadmin');
          } else {
            const isPaidAi = matchedWs?.operatingMode === 'AI_COMPANY' && matchedWs?.subscription?.planTier && matchedWs?.subscription?.planTier !== 'NONE';
            setRolePersona(isPaidAi ? 'client_ai' : 'client_tool');
          }
        } else {
          // Token invalid or expired
          authStorage.clearSession();
          setCurrentUser(null);
          setActiveWorkspace(null);
          setWorkspaces([]);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      }
    };
    initApp();
  }, []);

  
  // Super Admin Global Announcement Listener
  useEffect(() => {
    const fetchGlobalAnnouncement = async () => {
      try {
        const res = await api.get('/api/support/announcement');
        if (res?.data?.success && res.data.announcement) {
          setGlobalAnnouncement(res.data.announcement);
        }
      } catch (e) {}
    };
    fetchGlobalAnnouncement();

    if (socket) {
      socket.on('global:announcement_updated', (data) => {
        if (data?.announcement) {
          setGlobalAnnouncement(data.announcement);
        }
      });
    }
  }, [socket]);

  // 2. Setup Socket.io connection
  useEffect(() => {
    const s = io('/', { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      setSocketConnected(true);
      const wsId = localStorage.getItem('vyuhox_active_ws_id');
      if (wsId) {
        s.emit('joinWorkspace', wsId);
      }
    });

    s.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // 3. When activeWorkspace changes or tab switches, join room and fetch latest workspace data
  useEffect(() => {
    if (!activeWorkspace) return;

    if (socket && socket.connected) {
      socket.emit('joinWorkspace', activeWorkspace._id);
    }

    setOperatingMode(activeWorkspace.operatingMode || 'AI_COMPANY');

    refreshWorkspaceData();
  }, [activeWorkspace, socket, activeTab]);

  const refreshWorkspaceData = async () => {
    if (!activeWorkspace) return;
    try {
      const [leadsRes, statsRes, walletRes] = await Promise.all([
        api.getLeads(activeWorkspace._id),
        api.getWorkspaceStats(activeWorkspace._id),
        api.getWallet(activeWorkspace._id),
      ]);

      if (leadsRes.success) setLeads(leadsRes.leads || []);
      if (statsRes.success) setStats(statsRes.stats);
      if (walletRes.success) setWallet(walletRes.wallet);
    } catch (err) {
      console.error('Error fetching workspace data:', err);
    }
  };

  // 4. Socket Listeners for Real-time Multi-tenant events
  useEffect(() => {
    if (!socket) return;

    const handleLeadCreated = (newLead) => {
      setLeads((prev) => [newLead, ...prev]);
      if (activeWorkspace) api.getWorkspaceStats(activeWorkspace._id).then((r) => r.success && setStats(r.stats));
    };

    const handleLeadStageChanged = ({ leadId, stage }) => {
      setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, stage } : l)));
      if (activeWorkspace) api.getWorkspaceStats(activeWorkspace._id).then((r) => r.success && setStats(r.stats));
    };

    const handleLeadDeleted = ({ leadId }) => {
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      if (activeWorkspace) api.getWorkspaceStats(activeWorkspace._id).then((r) => r.success && setStats(r.stats));
    };

    const handleWalletUpdated = ({ balanceUSD, transaction }) => {
      setWallet((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          balanceUSD,
          transactions: [transaction, ...(prev.transactions || [])],
        };
      });
    };

    const handleOperatingModeUpdated = ({ operatingMode: newMode }) => {
      setOperatingMode(newMode);
    };

    const handleSuperAdminAlert = (alertData) => {
      if (rolePersona === 'superadmin' || currentUser?.role === 'superadmin') {
        const audio = new Audio('/audio/ding.mp3');
        audio.play().catch(() => {});
        alert(`🚨 [SUPERADMIN CRITICAL ALERT: AI QUOTA / API OUTAGE]\n\nDiagnostic: ${alertData.diagnostic}\n\nAction Required: ${alertData.instruction}`);
      }
    };

    socket.on('leadCreated', handleLeadCreated);
    socket.on('leadStageChanged', handleLeadStageChanged);
    socket.on('leadDeleted', handleLeadDeleted);
    socket.on('walletUpdated', handleWalletUpdated);
    socket.on('operatingModeUpdated', handleOperatingModeUpdated);
    socket.on('superadmin:alert', handleSuperAdminAlert);

    return () => {
      socket.off('leadCreated', handleLeadCreated);
      socket.off('leadStageChanged', handleLeadStageChanged);
      socket.off('leadDeleted', handleLeadDeleted);
      socket.off('walletUpdated', handleWalletUpdated);
      socket.off('operatingModeUpdated', handleOperatingModeUpdated);
      socket.off('superadmin:alert', handleSuperAdminAlert);
    };
  }, [socket, activeWorkspace, rolePersona, currentUser]);

  // Toggle Operating Mode - Opens ModeSwitchModal
  const handleToggleOperatingMode = () => {
    setIsModeModalOpen(true);
  };

  const handleSwitchOperatingMode = async (targetMode) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.switchOperatingMode({
        workspaceId: activeWorkspace._id,
        targetMode,
        planTier: targetMode === 'AI_COMPANY' ? 'AI_COMPANY_STARTER' : 'TOOL_MODE',
      });
      if (res.success) {
        setOperatingMode(targetMode);
        setActiveWorkspace(res.workspace);
        setWorkspaces((prev) => prev.map((w) => (w._id === res.workspace._id ? res.workspace : w)));
      }
    } catch (err) {
      console.error('Failed to switch operating mode:', err);
    }
  };

  // Add Lead
  const handleCreateLead = async (leadData) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.createLead(activeWorkspace._id, leadData);
      if (res.success) {
        setLeads((prev) => [res.lead, ...prev]);
        const statsRes = await api.getWorkspaceStats(activeWorkspace._id);
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  // Update Lead Stage
  const handleUpdateLeadStage = async (leadId, stage) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.updateLeadStage(activeWorkspace._id, leadId, stage);
      if (res.success) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? res.lead : l)));
        const statsRes = await api.getWorkspaceStats(activeWorkspace._id);
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.deleteLead(activeWorkspace._id, leadId);
      if (res.success) {
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        const statsRes = await api.getWorkspaceStats(activeWorkspace._id);
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Bulk Import Leads
  const handleBulkImport = async (newLeads) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.bulkImportLeads(activeWorkspace._id, newLeads);
      if (res.success) {
        setLeads((prev) => [...(res.leads || []), ...prev]);
        const statsRes = await api.getWorkspaceStats(activeWorkspace._id);
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to bulk import:', err);
    }
  };

  // Add Funds
  const handleAddFunds = async (amountUSD, paymentMethod) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.addFunds(activeWorkspace._id, amountUSD, paymentMethod);
      if (res.success) {
        setWallet(res.wallet);
      }
    } catch (err) {
      console.error('Failed to add funds:', err);
    }
  };

  // Create Workspace
  const handleCreateWorkspace = async (wsData) => {
    try {
      const res = await api.createWorkspace(wsData);
      if (res.success) {
        setWorkspaces((prev) => [res.workspace, ...prev]);
        setActiveWorkspace(res.workspace);
        setWallet(res.wallet);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  // Update Workspace Details
  const handleUpdateWorkspace = async (updatedFields) => {
    if (!activeWorkspace) return;
    try {
      const res = await api.updateWorkspace(activeWorkspace._id, updatedFields);
      if (res.success) {
        setActiveWorkspace(res.workspace);
        setWorkspaces((prev) => prev.map((w) => (w._id === res.workspace._id ? res.workspace : w)));
      }
    } catch (err) {
      console.error('Failed to update workspace:', err);
    }
  };

  const handleViewLanding = () => {
    window.location.hash = '';
    setCurrentView('landing');
  };

  const handleAdminAuthSuccess = (user, workspace, chosenCurr, token = null) => {
    if (chosenCurr) setCurrency(chosenCurr);
    setIsAdminInspectionMode(false);
    setRolePersona('superadmin');
    const adminUser = user || {
      id: 'usr_superadmin',
      name: 'Super Admin',
      email: 'admin@vyuhox.ai',
      role: 'superadmin',
    };
    setCurrentUser(adminUser);
    authStorage.setUser(adminUser);
    if (token) authStorage.setToken(token);
    if (workspace) {
      setActiveWorkspace(workspace);
      authStorage.setActiveWorkspace(workspace);
    }
    window.location.hash = '#app';
    setCurrentView('app');
  };

  const handleClientAuthSuccess = (user, workspace, chosenCurr, role = 'client_tool', token = null) => {
    if (chosenCurr) setCurrency(chosenCurr);
    setIsAdminInspectionMode(false);
    setRolePersona(role);
    setCurrentUser(user);
    if (token) authStorage.setToken(token);
    if (user) authStorage.setUser(user);
    if (workspace) {
      setActiveWorkspace(workspace);
      authStorage.setActiveWorkspace(workspace);
      if (user?.role !== 'superadmin') {
        setWorkspaces([workspace]);
      }
    }
    setOperatingMode(workspace?.operatingMode || 'TOOL');
    setActiveTab('dashboard');
    window.location.hash = '#app';
    setCurrentView('app');
  };

  const handleSignOut = () => {
    authStorage.clearSession();
    setCurrentUser(null);
    setActiveWorkspace(null);
    setWorkspaces([]);
    setRolePersona('client_ai');
    window.location.hash = '#login';
    setCurrentView('client_login');
  };

  const handleEnterApp = (user, workspace, chosenCurr, role) => {
    if (chosenCurr) setCurrency(chosenCurr);
    if (role) handleChangeRolePersona(role);
    if (workspace) setActiveWorkspace(workspace);
    window.location.hash = '#app';
    setCurrentView('app');
  };

  // 1. Dedicated Super Admin Master Login View
  if (currentView === 'admin_login') {
    return (
      <AdminAuthPage
        onAuthSuccess={handleAdminAuthSuccess}
        onBackToLanding={handleViewLanding}
      />
    );
  }

  // 2. Dedicated Client Sign In View
  if (currentView === 'client_login') {
    return (
      <ClientAuthPage
        initialMode="signin"
        defaultCurrency={currency}
        onAuthSuccess={handleClientAuthSuccess}
        onBackToLanding={handleViewLanding}
      />
    );
  }

  // 3. Dedicated Client Registration View
  if (currentView === 'client_signup') {
    return (
      <ClientAuthPage
        initialMode="signup"
        defaultCurrency={currency}
        onAuthSuccess={handleClientAuthSuccess}
        onBackToLanding={handleViewLanding}
      />
    );
  }

  // 4. Public Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        initialCurrency={currency}
        onEnterApp={handleEnterApp}
        onNavigateAuth={(mode) => {
          if (mode === 'signup') {
            window.location.hash = '#signup';
            setCurrentView('client_signup');
          } else {
            window.location.hash = '#login';
            setCurrentView('client_login');
          }
        }}
        onSelectPlan={(plan) => {
          if (plan === 'AI_COMPANY') setOperatingMode('AI_COMPANY');
          window.location.hash = '#signup';
          setCurrentView('client_signup');
        }}
      />
    );
  }

  // 5. Free Link Magnet: Cold Email Spam Checker
  if (currentView === 'tool_spam_checker') {
    return (
      <SpamChecker
        onNavigateHome={() => {
          window.location.hash = '';
          setCurrentView('landing');
        }}
      />
    );
  }

  // 6. Free Link Magnet: B2B ICP Persona Calculator
  if (currentView === 'tool_icp_calculator') {
    return (
      <IcpCalculator
        onNavigateHome={() => {
          window.location.hash = '';
          setCurrentView('landing');
        }}
      />
    );
  }

  // 7. Free Link Magnet: Domain MX, SPF & DMARC Deliverability Tester
  if (currentView === 'tool_dns_tester') {
    return (
      <DnsTester
        onNavigateHome={() => {
          window.location.hash = '';
          setCurrentView('landing');
        }}
      />
    );
  }

  // 8. Enforce Authentication for App Workspace
  if (currentView === 'app' && !currentUser && !authStorage.getToken()) {
    return (
      <ClientAuthPage
        initialMode="signin"
        defaultCurrency={currency}
        onAuthSuccess={handleClientAuthSuccess}
        onBackToLanding={handleViewLanding}
      />
    );
  }

  // Handle Role Persona Simulation Switching
  const handleChangeRolePersona = (roleId) => {
    setIsAdminInspectionMode(false);
    setRolePersona(roleId);
    if (roleId === 'client_ai') {
      setOperatingMode('AI_COMPANY');
      setActiveTab('dashboard');
    } else if (roleId === 'client_tool') {
      setOperatingMode('TOOL');
      setActiveTab('dashboard');
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const res = await api.getWorkspaces();
      if (res.success && res.workspaces) {
        setWorkspaces(res.workspaces);
      }
    } catch (err) {
      console.error('Failed to refresh workspaces:', err);
    }
  };

  return (
    <div className="app-container">
      {rolePersona === 'superadmin' && !isAdminInspectionMode ? (
        <>
          <SuperAdminSidebar
            activePillar={adminActivePillar}
            setActivePillar={setAdminActivePillar}
            onSwitchToPlatformHQ={handleSwitchToPlatformHQ}
            onLogout={handleSignOut}
            pendingTicketsCount={pendingTicketsCount}
          />
          <main className="main-content">
            <SuperAdminTopBar
              currentUser={currentUser}
              activePillar={adminActivePillar}
              workspaces={workspaces}
              onSwitchToPlatformHQ={handleSwitchToPlatformHQ}
              currency={currency}
              onToggleCurrency={(c) => setCurrency(c)}
              exchangeRate={exchangeRate}
              pendingTicketsCount={pendingTicketsCount}
              onLogout={handleSignOut}
              onViewLanding={handleViewLanding}
            />

            {/* Global System Announcement Banner */}
            {globalAnnouncement?.active && globalAnnouncement.message && (
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 9999,
                  background:
                    globalAnnouncement.severity === 'MAINTENANCE'
                      ? 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)'
                      : globalAnnouncement.severity === 'WARNING'
                      ? 'linear-gradient(90deg, #D97706 0%, #B45309 100%)'
                      : 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📢</span>
                  <span>{globalAnnouncement.message}</span>
                </div>
                <button
                  onClick={() => setGlobalAnnouncement(prev => prev ? { ...prev, active: false } : null)}
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}

            <SuperAdminDashboard
              workspaces={workspaces}
              currency={currency}
              exchangeRate={exchangeRate}
              activePillar={adminActivePillar}
              onSelectPillar={setAdminActivePillar}
              onInspectWorkspace={(ws) => {
                setActiveWorkspace(ws);
                setOperatingMode(ws.operatingMode || 'TOOL');
                setIsAdminInspectionMode(true);
                setActiveTab('dashboard');
              }}
              onRefreshWorkspaces={refreshWorkspaces}
            />
          </main>
        </>
      ) : (
        <>
          {/* Responsive Multi-Tenant Navigation Sidebar */}
          <Sidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        currentUser={currentUser}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          if (ws?._id) authStorage.setActiveWsId(ws._id);
          setOperatingMode(ws.operatingMode || 'AI_COMPANY');
        }}
        onOpenNewWorkspaceModal={() => setIsNewWorkspaceModalOpen(true)}
        operatingMode={operatingMode}
        onToggleOperatingMode={handleToggleOperatingMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        onOpenAddFundsModal={() => setIsAddFundsModalOpen(true)}
        rolePersona={rolePersona}
        currency={currency}
        exchangeRate={exchangeRate}
        onViewLanding={handleViewLanding}
      />

      {/* Main View Area */}
      <main className="main-content">
        <TopBar
          currentUser={currentUser}
          activeWorkspace={activeWorkspace}
          operatingMode={operatingMode}
          onToggleOperatingMode={handleToggleOperatingMode}
          onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
          wallet={wallet}
          onOpenAddFundsModal={() => setIsAddFundsModalOpen(true)}
          socketConnected={socketConnected}
          onViewLanding={handleViewLanding}
          onSignOut={handleSignOut}
          currency={currency}
          onToggleCurrency={(c) => setCurrency(c)}
          rolePersona={rolePersona}
          onChangeRolePersona={handleChangeRolePersona}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenSanjayaVoiceModal={() => setIsSanjayaOpen(true)}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        
        {/* Global System Announcement Banner */}
        {globalAnnouncement?.active && globalAnnouncement.message && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 9999,
              background:
                globalAnnouncement.severity === 'MAINTENANCE'
                  ? 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)'
                  : globalAnnouncement.severity === 'WARNING'
                  ? 'linear-gradient(90deg, #D97706 0%, #B45309 100%)'
                  : 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              padding: '10px 24px',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📢</span>
              <span>{globalAnnouncement.message}</span>
            </div>
            <button
              onClick={() => setGlobalAnnouncement(prev => prev ? { ...prev, active: false } : null)}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '4px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Super Admin Inspection Mode Banner */}
        {isAdminInspectionMode && (
          <div style={{
            position: 'sticky',
            top: 0,
            background: 'linear-gradient(90deg, #B45309 0%, #D97706 50%, #0284C7 100%)',
            color: '#FFFFFF',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.4)',
            zIndex: 100,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.725rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}>
                👁️ Super Admin Preview
              </span>
              <span>
                You are inspecting client workspace: <strong>{activeWorkspace?.name}</strong> ({activeWorkspace?.industry} • {operatingMode === 'AI_COMPANY' ? 'Autonomous AI Company' : 'Self-Serve Tool'}). All client views and tools are active.
              </span>
            </div>
            <button
              onClick={() => {
                setIsAdminInspectionMode(false);
                setActiveTab('dashboard');
              }}
              style={{
                background: '#0F172A',
                color: '#38BDF8',
                border: '1px solid #38BDF8',
                borderRadius: '8px',
                padding: '6px 14px',
                fontWeight: '700',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Exit Preview & Return to Master Control →
            </button>
          </div>
        )}

        {/* Dynamic Route View Switching */}
        {activeTab === 'dashboard' && (
          isAdminInspectionMode ? (
            <ClientDashboardView
              currentUser={currentUser}
              activeWorkspace={activeWorkspace}
              operatingMode={operatingMode}
              stats={stats}
              leads={leads}
              wallet={wallet}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddFundsModal={() => setIsAddFundsModalOpen(true)}
              onToggleOperatingMode={handleToggleOperatingMode}
              onUpdateActiveWorkspace={(updatedWs) => {
                setActiveWorkspace(updatedWs);
                authStorage.setActiveWorkspace(updatedWs);
                if (updatedWs.operatingMode) {
                  setOperatingMode(updatedWs.operatingMode);
                }
              }}
              onOpenPlanModal={() => setIsModeModalOpen(true)}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          ) : rolePersona === 'superadmin' ? (
            <SuperAdminDashboard
              workspaces={workspaces}
              currency={currency}
              exchangeRate={exchangeRate}
              onInspectWorkspace={(ws) => {
                setActiveWorkspace(ws);
                setOperatingMode(ws.operatingMode || 'TOOL');
                setIsAdminInspectionMode(true);
                setActiveTab('dashboard');
              }}
              onRefreshWorkspaces={refreshWorkspaces}
            />
          ) : (
            <ClientDashboardView
              currentUser={currentUser}
              activeWorkspace={activeWorkspace}
              operatingMode={operatingMode}
              stats={stats}
              leads={leads}
              wallet={wallet}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddFundsModal={() => setIsAddFundsModalOpen(true)}
              onToggleOperatingMode={handleToggleOperatingMode}
              onUpdateActiveWorkspace={(updatedWs) => {
                setActiveWorkspace(updatedWs);
                authStorage.setActiveWorkspace(updatedWs);
                if (updatedWs.operatingMode) {
                  setOperatingMode(updatedWs.operatingMode);
                }
              }}
              onOpenPlanModal={() => setIsModeModalOpen(true)}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          )
        )}

        {activeTab === 'admin-plans' && (
          <SuperAdminDashboard
            workspaces={workspaces}
            currency={currency}
            exchangeRate={exchangeRate}
            onInspectWorkspace={(ws) => {
              setActiveWorkspace(ws);
              setOperatingMode(ws.operatingMode || 'TOOL');
              setIsAdminInspectionMode(true);
              setActiveTab('dashboard');
            }}
            onRefreshWorkspaces={refreshWorkspaces}
          />
        )}

        {activeTab === 'leads' && (
          <LeadFinder
            activeWorkspace={activeWorkspace}
            leads={leads}
            wallet={wallet}
            currency={currency}
            exchangeRate={exchangeRate}
            onOpenAddFundsModal={() => setIsAddFundsModalOpen(true)}
            onRefreshLeads={refreshWorkspaceData}
            onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
            onOpenBulkImportModal={() => setIsBulkImportModalOpen(true)}
            socket={socket}
            onNavigateTab={setActiveTab}
            onOpenChatWithLead={(conversationId) => {
              setTargetChatConversationId(conversationId);
              setActiveTab('inbox');
            }}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyPlanner
            activeWorkspace={activeWorkspace}
            socket={socket}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsWalletView
            activeWorkspace={activeWorkspace}
            onUpdateWorkspace={handleUpdateWorkspace}
            wallet={wallet}
            onAddFunds={handleAddFunds}
            onUpdateWalletSettings={async (settings) => {
              if (activeWorkspace) {
                const res = await api.updateWalletSettings(activeWorkspace._id, settings);
                if (res.success) setWallet(res.wallet);
              }
            }}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}

        {activeTab === 'inbox' && (
          <OmnichannelInbox
            activeWorkspace={activeWorkspace}
            socket={socket}
            initialConversationId={targetChatConversationId}
            onClearInitialConversation={() => setTargetChatConversationId(null)}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceStudio
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}

        {activeTab === 'social' && (
          <SocialStudio
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}

        {activeTab === 'ads' && (
          <AdsManager
            activeWorkspace={activeWorkspace}
            socket={socket}
            wallet={wallet}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsHub
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarSettings
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceSettings
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}

        {activeTab === 'seo-aeo' && (
          <SeoAeoHub
            activeWorkspace={activeWorkspace}
            socket={socket}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'ai-company' && (
          <AICompanyHQ
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}

        {activeTab === 'agent-store' && (
          <AgentStore
            activeWorkspace={activeWorkspace}
            socket={socket}
            onOpenModeModal={() => setIsModeModalOpen(true)}
          />
        )}

              </main>

        </>
      )}

      {/* Interactive Modals */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSubmit={handleCreateLead}
      />

      <NewWorkspaceModal
        isOpen={isNewWorkspaceModalOpen}
        onClose={() => setIsNewWorkspaceModalOpen(false)}
        onSubmit={handleCreateWorkspace}
      />

      <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onClose={() => setIsAddFundsModalOpen(false)}
        onSubmit={handleAddFunds}
        currentBalance={wallet?.balanceUSD}
        currency={currency}
        exchangeRate={exchangeRate}
      />

      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImport={handleBulkImport}
      />

      <ModeSwitchModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        currentMode={operatingMode}
        onSwitchMode={handleSwitchOperatingMode}
        onOpenAgentStore={() => {
          setActiveTab('agent-store');
          setIsModeModalOpen(false);
        }}
      />

      {/* SANJAYA (सञ्जय) • Autonomous Celestial Voice Commander */}
      <SanjayaVoiceCommander
        isOpen={isSanjayaOpen}
        onClose={() => setIsSanjayaOpen(false)}
        activeWorkspace={activeWorkspace}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onToggleOperatingMode={handleToggleOperatingMode}
        onOpenAddFundsModal={() => setIsAddFundsModalOpen(true)}
        onRefreshData={refreshWorkspaceData}
      />

      {/* Unified Tactical Command Dock (Sanjaya + Support with zero overlap) */}
      <TacticalCommandDock
        isSanjayaOpen={isSanjayaOpen}
        setIsSanjayaOpen={setIsSanjayaOpen}
        isSupportOpen={isSupportOpen}
        setIsSupportOpen={setIsSupportOpen}
      />

      {/* Controlled Support Desk Modal */}
      <SupportHelpWidget
        activeWorkspace={activeWorkspace}
        wallet={wallet}
        operatingMode={operatingMode}
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Raycast / Linear Style Universal Omnibar Command Palette (Cmd+K) */}
      <UniversalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenSanjaya={() => setIsSanjayaOpen(true)}
        onOpenAddFunds={() => setIsAddFundsModalOpen(true)}
        onOpenNewLead={() => setIsNewLeadModalOpen(true)}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          authStorage.setActiveWsId(ws._id);
        }}
        onViewLanding={handleViewLanding}
      />
    </div>
  );
}
