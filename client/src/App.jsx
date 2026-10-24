import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './views/DashboardView';
import ClientDashboardView from './views/ClientDashboardView';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LeadsView from './views/LeadsView';
import SettingsWalletView from './views/SettingsWalletView';
import PhaseRoadmapPreview from './views/PhaseRoadmapPreview';
import StrategyPlanner from './pages/StrategyPlanner';
import LeadFinder from './pages/LeadFinder';
import OmnichannelInbox from './pages/OmnichannelInbox';
import VoiceStudio from './pages/VoiceStudio';
import SocialStudio from './pages/SocialStudio';
import AdsManager from './pages/AdsManager';
import CalendarSettings from './pages/CalendarSettings';
import ComplianceSettings from './pages/ComplianceSettings';
import AICompanyHQ from './pages/AICompanyHQ';
import AgentStore from './pages/AgentStore';
import FlywheelHub from './pages/FlywheelHub';
import LandingPage from './pages/LandingPage';
import ClientAuthPage from './pages/ClientAuthPage';
import AdminAuthPage from './pages/AdminAuthPage';

import ModeSwitchModal from './components/ModeSwitchModal';
import NewLeadModal from './components/modals/NewLeadModal';
import NewWorkspaceModal from './components/modals/NewWorkspaceModal';
import AddFundsModal from './components/modals/AddFundsModal';
import BulkImportModal from './components/modals/BulkImportModal';
import ConnectChannelsModal from './components/modals/ConnectChannelsModal';

import { api } from './services/api';

export default function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [operatingMode, setOperatingMode] = useState('TOOL');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

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
    if (hash === '#app' || path === '/app') {
      return 'app';
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState(getViewFromLocation);

  // Global Currency State (USD $ vs INR ₹) with standard conversion rate
  const [currency, setCurrency] = useState('INR');
  const exchangeRate = 83.5;

  // Current Logged-In User Identity
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vyuhox_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Role / Persona Simulation (superadmin, client_ai, client_tool)
  const [rolePersona, setRolePersona] = useState(() => {
    try {
      const saved = localStorage.getItem('vyuhox_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'superadmin') return 'superadmin';
        return 'client_ai';
      }
    } catch (e) {}
    return 'client_ai';
  });
  const [isAdminInspectionMode, setIsAdminInspectionMode] = useState(false);

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

  // 1. Initial Load: Fetch Workspaces & Match Logged-In User
  useEffect(() => {
    const initApp = async () => {
      try {
        const token = localStorage.getItem('vyuhox_token');
        if (token) {
          const meRes = await api.getMe(token);
          if (meRes.success && meRes.user) {
            setCurrentUser(meRes.user);
            localStorage.setItem('vyuhox_user', JSON.stringify(meRes.user));

            const wsList = meRes.workspaces || [];
            setWorkspaces(wsList);

            let matchedWs = meRes.activeWorkspace;
            if (!matchedWs && wsList.length > 0) {
              matchedWs = wsList.find((w) => String(w._id) === String(meRes.user.workspaceId)) || wsList[0];
            }
            if (matchedWs) {
              setActiveWorkspace(matchedWs);
              setOperatingMode(matchedWs.operatingMode || 'TOOL');
            }
            if (meRes.user.role === 'superadmin') {
              setRolePersona('superadmin');
            } else {
              setRolePersona('client_ai');
            }
            return;
          }
        }

        // Fallback if no token or unauthenticated
        const res = await api.getWorkspaces();
        if (res.success && res.workspaces.length > 0) {
          let availableWs = res.workspaces;
          if (currentUser && currentUser.role !== 'superadmin' && currentUser.workspaceId) {
            availableWs = res.workspaces.filter((w) => String(w._id) === String(currentUser.workspaceId));
          }
          setWorkspaces(availableWs);

          // Find workspace corresponding to current user
          let matchedWs = null;
          const savedUser = currentUser;
          if (savedUser && savedUser.workspaceId) {
            matchedWs = availableWs.find(
              (w) => String(w._id) === String(savedUser.workspaceId)
            );
          }
          if (!matchedWs && savedUser && savedUser.email) {
            matchedWs = availableWs.find(
              (w) =>
                (savedUser.email.includes('dinesh') && w.name?.toLowerCase().includes('quantum')) ||
                (savedUser.companyName && w.name?.toLowerCase() === savedUser.companyName.toLowerCase())
            );
          }

          const defaultWs = matchedWs || availableWs[0];
          setActiveWorkspace(defaultWs);
          if (defaultWs) {
            setOperatingMode(defaultWs.operatingMode || 'TOOL');
            if (!currentUser || !currentUser.email) {
              const fallbackUserData = {
                name: defaultWs.ownerName || 'Dinesh Valmiki',
                email: defaultWs.ownerEmail || 'valmikidineshoffcl@gmail.com',
                role: 'workspace_owner',
                workspaceId: defaultWs._id,
              };
              setCurrentUser(fallbackUserData);
              localStorage.setItem('vyuhox_user', JSON.stringify(fallbackUserData));
            }
          }
          if (savedUser?.role === 'superadmin') {
            setRolePersona('superadmin');
          } else {
            setRolePersona('client_ai');
          }
        }
      } catch (err) {
        console.error('Failed to initialize workspaces:', err);
      }
    };
    initApp();
  }, []);

  // 2. Setup Socket.io connection
  useEffect(() => {
    const s = io('/', { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      setSocketConnected(true);
    });

    s.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // 3. When activeWorkspace changes, join its room and fetch data
  useEffect(() => {
    if (!activeWorkspace) return;

    if (socket && socket.connected) {
      socket.emit('joinWorkspace', activeWorkspace._id);
    }

    setOperatingMode(activeWorkspace.operatingMode || 'TOOL');

    refreshWorkspaceData();
  }, [activeWorkspace, socket]);

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

    socket.on('leadCreated', handleLeadCreated);
    socket.on('leadStageChanged', handleLeadStageChanged);
    socket.on('leadDeleted', handleLeadDeleted);
    socket.on('walletUpdated', handleWalletUpdated);
    socket.on('operatingModeUpdated', handleOperatingModeUpdated);

    return () => {
      socket.off('leadCreated', handleLeadCreated);
      socket.off('leadStageChanged', handleLeadStageChanged);
      socket.off('leadDeleted', handleLeadDeleted);
      socket.off('walletUpdated', handleWalletUpdated);
      socket.off('operatingModeUpdated', handleOperatingModeUpdated);
    };
  }, [socket, activeWorkspace]);

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

  const handleAdminAuthSuccess = (user, workspace, chosenCurr) => {
    if (chosenCurr) setCurrency(chosenCurr);
    setIsAdminInspectionMode(false);
    setRolePersona('superadmin');
    const adminUser = user || {
      id: 'usr_superadmin',
      name: 'Nanda Sai (Platform Owner)',
      email: 'admin@vyuhox.ai',
      role: 'superadmin',
    };
    setCurrentUser(adminUser);
    localStorage.setItem('vyuhox_user', JSON.stringify(adminUser));
    if (workspace) setActiveWorkspace(workspace);
    window.location.hash = '#app';
    setCurrentView('app');
  };

  const handleClientAuthSuccess = (user, workspace, chosenCurr, role = 'client_ai') => {
    if (chosenCurr) setCurrency(chosenCurr);
    setIsAdminInspectionMode(false);
    setRolePersona(role);
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('vyuhox_user', JSON.stringify(user));
    }
    if (workspace) {
      setActiveWorkspace(workspace);
      if (user?.role !== 'superadmin') {
        setWorkspaces([workspace]);
      }
    }
    if (role === 'client_ai') {
      setOperatingMode('AI_COMPANY');
    } else {
      setOperatingMode(workspace?.operatingMode || 'TOOL');
    }
    setActiveTab('dashboard');
    window.location.hash = '#app';
    setCurrentView('app');
  };

  const handleSignOut = () => {
    localStorage.removeItem('vyuhox_token');
    localStorage.removeItem('vyuhox_user');
    setCurrentUser(null);
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
        onSelectPlan={(plan) => {
          if (plan === 'AI_COMPANY') setOperatingMode('AI_COMPANY');
          window.location.hash = '#signup';
          setCurrentView('client_signup');
        }}
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
      {/* Responsive Multi-Tenant Navigation Sidebar */}
      <Sidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        currentUser={currentUser}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          setOperatingMode(ws.operatingMode || 'TOOL');
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
          onOpenConnectChannels={() => setIsConnectChannelsModalOpen(true)}
        />

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
          />
        )}

        {activeTab === 'inbox' && (
          <OmnichannelInbox
            activeWorkspace={activeWorkspace}
            socket={socket}
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

        {activeTab === 'flywheel' && (
          <FlywheelHub
            activeWorkspace={activeWorkspace}
            socket={socket}
          />
        )}
      </main>

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

      <ConnectChannelsModal
        isOpen={isConnectChannelsModalOpen}
        onClose={() => setIsConnectChannelsModalOpen(false)}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
}
