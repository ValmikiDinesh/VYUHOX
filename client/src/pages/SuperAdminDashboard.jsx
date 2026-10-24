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
  Key,
  Palette,
  Presentation,
} from 'lucide-react';
import { api } from '../services/api';
import VisualCreativeStudio from '../components/VisualCreativeStudio';

export default function SuperAdminDashboard({
  workspaces = [],
  currency = 'USD',
  exchangeRate = 83.5,
  onInspectWorkspace,
  onSwitchWorkspace,
  onRefreshWorkspaces,
}) {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'rates' | 'integrations' | 'tenants'
  const [regionFilter, setRegionFilter] = useState('ALL'); // 'ALL' | 'INDIA_ONLY' | 'GLOBAL_ONLY'
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState('ALL'); // 'ALL' | 'AI_COMPANY' | 'TOOL'

  // Workspace Feature Management Modal State
  const [managingWorkspace, setManagingWorkspace] = useState(null);
  const [manageForm, setManageForm] = useState(null);
  const [savingManage, setSavingManage] = useState(false);

  // Pricing Plans State
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    planId: '',
    name: '',
    tagline: '',
    category: 'CLIENT_AI',
    targetRegion: 'ALL',
    priceUSD: { monthly: 149, annualMonthly: 119 },
    priceINR: { monthly: 11999, annualMonthly: 9499 },
    features: ['Custom AI SDR Outreach', 'Priority Speed-to-Lead Calling', '5,000 Verified Leads/mo'],
    badge: 'Custom',
    isPopular: false,
  });

  // Platform Config & Utility Usage Rates State
  const [platformConfig, setPlatformConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [pingStatus, setPingStatus] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  // Load plans & platform config
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await api.getPricingPlans({ includeInactive: true });
      if (res.success) setPlans(res.plans);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchPlatformConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await api.getPlatformConfig();
      if (res.success) setPlatformConfig(res.config);
    } catch (err) {
      console.error('Failed to fetch platform config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchPlatformConfig();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Start editing a plan
  const handleStartEdit = (plan) => {
    setEditingPlanId(plan._id);
    setEditForm({
      name: plan.name,
      tagline: plan.tagline || '',
      category: plan.category || 'CLIENT_AI',
      targetRegion: plan.targetRegion || 'ALL',
      priceUSD: { ...plan.priceUSD },
      priceINR: { ...plan.priceINR },
      features: [...plan.features],
      badge: plan.badge || '',
      isPopular: plan.isPopular,
      isActive: plan.isActive,
    });
  };

  // Save updated plan
  const handleSavePlan = async (id) => {
    try {
      const res = await api.updatePricingPlan(id, editForm);
      if (res.success) {
        setPlans((prev) => prev.map((p) => (p._id === id ? res.plan : p)));
        setEditingPlanId(null);
        showToast('Pricing plan updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update plan:', err);
      showToast('Error updating plan');
    }
  };

  // Toggle Plan Active State
  const handleTogglePlanActive = async (id) => {
    try {
      const res = await api.deletePricingPlan(id, false);
      if (res.success) {
        setPlans((prev) => prev.map((p) => (p._id === id ? res.plan : p)));
        showToast('Plan status updated!');
      }
    } catch (err) {
      console.error('Error toggling plan:', err);
    }
  };

  // Create New Plan
  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    if (!newPlanData.planId || !newPlanData.name) return;

    try {
      const res = await api.createPricingPlan(newPlanData);
      if (res.success) {
        setPlans((prev) => [...prev, res.plan]);
        setIsNewPlanModalOpen(false);
        showToast(`New Plan "${res.plan.name}" created successfully!`);
        setNewPlanData({
          planId: '',
          name: '',
          tagline: '',
          category: 'CLIENT_AI',
          targetRegion: 'ALL',
          priceUSD: { monthly: 149, annualMonthly: 119 },
          priceINR: { monthly: 11999, annualMonthly: 9499 },
          features: ['Custom AI SDR Outreach', 'Priority Speed-to-Lead Calling', '5,000 Verified Leads/mo'],
          badge: 'Custom',
          isPopular: false,
        });
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      showToast('Failed to create plan');
    }
  };

  // Save Platform Config (Utility Rates, Integrations & Visual Tools)
  const handleSavePlatformConfig = async () => {
    if (!platformConfig) return;
    try {
      setSavingConfig(true);
      const res = await api.updatePlatformConfig({
        usageRates: platformConfig.usageRates,
        integrations: platformConfig.integrations,
        canvaConnect: platformConfig.canvaConnect,
        googleFlowWorkspace: platformConfig.googleFlowWorkspace,
        pollinationsVisualAi: platformConfig.pollinationsVisualAi,
        dalleVisualAi: platformConfig.dalleVisualAi,
        shortVideoEngine: platformConfig.shortVideoEngine,
        visualToolsGovernance: platformConfig.visualToolsGovernance,
      });
      if (res.success) {
        setPlatformConfig(res.config);
        showToast('Platform rates, carrier integrations & visual AI tools saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save platform config:', err);
      showToast('Failed to save config');
    } finally {
      setSavingConfig(false);
    }
  };

  // Test live ping for any tool / carrier provider
  const handleTestPing = async (provider) => {
    setPingStatus((prev) => ({ ...prev, [provider]: { loading: true } }));
    try {
      const res = await api.testIntegrationPing(provider);
      if (res.success) {
        setPingStatus((prev) => ({
          ...prev,
          [provider]: { loading: false, live: true, latency: res.result.latencyMs, message: res.result.message },
        }));
      }
    } catch (err) {
      setPingStatus((prev) => ({
        ...prev,
        [provider]: { loading: false, live: false, message: 'Ping failed' },
      }));
    }
  };

  // Workspace Feature Management Handlers
  const handleOpenManageModal = (ws) => {
    setManagingWorkspace(ws);
    setManageForm({
      operatingMode: ws.operatingMode || 'TOOL',
      planTier: ws.subscription?.planTier || (ws.operatingMode === 'AI_COMPANY' ? 'AI_COMPANY_STARTER' : 'TOOL_MODE'),
      hiredAgents: ws.hiredAgents && ws.hiredAgents.length > 0 ? [...ws.hiredAgents] : [
        { agentRole: 'CMO', name: 'Ava Vance', monthlyCost: 39, active: ws.operatingMode === 'AI_COMPANY' },
        { agentRole: 'SDR', name: 'Caleb Reed', monthlyCost: 39, active: ws.operatingMode === 'AI_COMPANY' },
        { agentRole: 'VOICE_CLOSER', name: 'Declan Hayes', monthlyCost: 49, active: ws.operatingMode === 'AI_COMPANY' },
        { agentRole: 'CFO', name: 'Warren Cruz', monthlyCost: 39, active: ws.operatingMode === 'AI_COMPANY' },
        { agentRole: 'CUSTOMER_SUCCESS', name: 'Sophia Chen', monthlyCost: 39, active: ws.operatingMode === 'AI_COMPANY' },
        { agentRole: 'CEO', name: 'Astraea Vance', monthlyCost: 49, active: ws.operatingMode === 'AI_COMPANY' },
      ],
      addCreditsUSD: 0,
    });
  };

  const handleSaveManageWorkspace = async (e) => {
    e.preventDefault();
    if (!managingWorkspace || !manageForm) return;
    try {
      setSavingManage(true);
      const res = await api.superadminManageWorkspace(managingWorkspace._id, manageForm);
      if (res.success) {
        showToast(`Workspace "${managingWorkspace.name}" updated successfully!`);
        setManagingWorkspace(null);
        if (onRefreshWorkspaces) onRefreshWorkspaces();
      }
    } catch (err) {
      console.error('Failed to update workspace:', err);
      showToast('Error updating workspace features');
    } finally {
      setSavingManage(false);
    }
  };

  // Filter plans based on region
  const filteredPlans = plans.filter((p) => {
    if (regionFilter === 'ALL') return true;
    return p.targetRegion === regionFilter;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '30px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '10px',
          padding: '12px 20px',
          color: '#34D399',
          fontSize: '0.875rem',
          fontWeight: '700',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            <ShieldCheck size={26} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                Super Admin Master Control
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                Governance &amp; Rates
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
              Configure subscription plans, geo-targeted country pricing, wholesale calling/messaging rates, and tool integrations.
            </p>
          </div>
        </div>

        {activeTab === 'plans' && (
          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="btn-primary"
            style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '4px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '28px',
        flexWrap: 'wrap',
      }}>
        {[
          { id: 'plans', label: 'Subscription Plans & Country Targeting', icon: DollarSign },
          { id: 'rates', label: 'Utility Rates (Calling, WhatsApp, Email, SMS)', icon: Zap },
          { id: 'integrations', label: 'Master Carrier & Tool Integrations (Twilio, AiSensy, etc.)', icon: Radio },
          { id: 'visualTools', label: '🎨 Visual AI & PowerPoint Presentation Tools', icon: Presentation },
          { id: 'tenants', label: 'Active Business Workspaces & Actual Features', icon: Building2 },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: active ? 'linear-gradient(135deg, #06B6D4, #8B5CF6)' : 'transparent',
                color: active ? '#FFFFFF' : '#94A3B8',
                fontWeight: active ? '700' : '500',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBSCRIPTION PLANS & GEO-TARGETING */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div>
          {/* Controls: Region Filter & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600' }}>Filter by Region:</span>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {[
                  { id: 'ALL', label: 'All Regions' },
                  { id: 'INDIA_ONLY', label: 'India Only (INR ₹)' },
                  { id: 'GLOBAL_ONLY', label: 'International Only (USD $)' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRegionFilter(r.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: regionFilter === r.id ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                      color: regionFilter === r.id ? '#38BDF8' : '#94A3B8',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={fetchPlans}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#94A3B8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={13} className={loadingPlans ? 'spin-icon' : ''} />
              <span>Refresh Plans</span>
            </button>
          </div>

          {/* Plans Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
            {filteredPlans.map((plan) => {
              const isEditing = editingPlanId === plan._id;

              return (
                <div
                  key={plan._id}
                  className="card"
                  style={{
                    padding: '24px',
                    background: plan.isActive ? '#0D1527' : 'rgba(15, 23, 42, 0.4)',
                    border: isEditing
                      ? '2px solid #06B6D4'
                      : plan.isPopular
                      ? '1px solid rgba(6, 182, 212, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: plan.isPopular ? '0 0 25px rgba(6, 182, 212, 0.15)' : 'none',
                    opacity: plan.isActive ? 1 : 0.6,
                  }}
                >
                  <div>
                    {/* Tags & Action Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${plan.category === 'ENTERPRISE' ? 'badge-purple' : plan.category === 'CLIENT_AI' ? 'badge-emerald' : 'badge-cyan'}`}>
                          {plan.category}
                        </span>
                        <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>
                          {plan.targetRegion === 'INDIA_ONLY' ? '🇮🇳 India Only' : plan.targetRegion === 'GLOBAL_ONLY' ? '🌐 Global Only' : '🌍 All Regions'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => handleStartEdit(plan)}
                              className="btn-icon"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Edit Pricing & Features"
                            >
                              <Edit2 size={13} color="#38BDF8" />
                            </button>
                            <button
                              onClick={() => handleTogglePlanActive(plan._id)}
                              className="btn-icon"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                            >
                              <Trash2 size={13} color={plan.isActive ? '#94A3B8' : '#34D399'} />
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleSavePlan(plan._id)}
                              style={{
                                background: '#10B981',
                                border: 'none',
                                color: '#04101A',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.725rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPlanId(null)}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: 'none',
                                color: '#CBD5E1',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.725rem',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Plan Name & Tagline */}
                    {!isEditing ? (
                      <>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 6px' }}>
                          {plan.name}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: '1.4' }}>
                          {plan.tagline}
                        </p>
                      </>
                    ) : (
                      <div style={{ marginBottom: '14px' }}>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="input-glass"
                          style={{ height: '32px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}
                        />
                        <select
                          value={editForm.targetRegion}
                          onChange={(e) => setEditForm({ ...editForm, targetRegion: e.target.value })}
                          className="input-glass"
                          style={{ height: '30px', fontSize: '0.75rem', marginBottom: '6px' }}
                        >
                          <option value="ALL">Visible in All Regions</option>
                          <option value="INDIA_ONLY">India Only (Visible in INR)</option>
                          <option value="GLOBAL_ONLY">International Only (Visible in USD)</option>
                        </select>
                      </div>
                    )}

                    {/* Pricing Box (USD & INR) */}
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '16px',
                    }}>
                      {!isEditing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.675rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
                              USD ($) Rate
                            </span>
                            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', color: '#38BDF8' }}>
                              ${plan.priceUSD?.monthly}
                              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/mo</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              ${plan.priceUSD?.annualMonthly}/mo annual
                            </span>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.675rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
                              INR (₹) Rate
                            </span>
                            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', color: '#FBBF24' }}>
                              ₹{plan.priceINR?.monthly?.toLocaleString('en-IN')}
                              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/mo</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              ₹{plan.priceINR?.annualMonthly?.toLocaleString('en-IN')}/mo annual
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>USD Monthly ($)</label>
                            <input
                              type="number"
                              value={editForm.priceUSD.monthly}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                priceUSD: { ...editForm.priceUSD, monthly: parseFloat(e.target.value) || 0 },
                              })}
                              className="input-glass"
                              style={{ height: '30px', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>INR Monthly (₹)</label>
                            <input
                              type="number"
                              value={editForm.priceINR.monthly}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                priceINR: { ...editForm.priceINR, monthly: parseFloat(e.target.value) || 0 },
                              })}
                              className="input-glass"
                              style={{ height: '30px', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                        Included Features:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {plan.features.slice(0, 4).map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.75rem', color: '#CBD5E1' }}>
                            <Check size={13} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: plan.isActive ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                      {plan.isActive ? '● Active in Store' : '○ Inactive / Hidden'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      ID: {plan.planId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UTILITY USAGE RATES (DIRECT CLIENT BILLING) */}
      {/* ========================================================================= */}
      {activeTab === 'rates' && platformConfig && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
                Platform Utility Usage Pricing
              </h2>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#94A3B8' }}>
                Fix the exact per-minute, per-message, and per-lead rates deducted from client wallets when agents execute calls or outreach.
              </p>
            </div>

            <button
              onClick={handleSavePlatformConfig}
              disabled={savingConfig}
              className="btn-emerald"
              style={{ padding: '9px 20px', fontWeight: '700', fontSize: '0.825rem' }}
            >
              {savingConfig ? 'Saving Rates...' : 'Save Utility Pricing'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Rate 1: Voice Calling Rate */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <PhoneCall size={20} color="#06B6D4" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#F8FAFC' }}>
                  AI Voice Calling Rate (per minute)
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '14px' }}>
                Sub-800ms Bland.ai carrier pipeline usage charged per minute of connected call time.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in USD ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={platformConfig.usageRates?.voicePerMinuteUSD || 0.012}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, voicePerMinuteUSD: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in INR (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={platformConfig.usageRates?.voicePerMinuteINR || 1.0}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, voicePerMinuteINR: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
              </div>
            </div>

            {/* Rate 2: WhatsApp Business Messaging Rate */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <MessageSquare size={20} color="#25D366" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#F8FAFC' }}>
                  WhatsApp Message Rate (per msg)
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '14px' }}>
                AiSensy / Meta Cloud API marketing and utility template conversations.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in USD ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={platformConfig.usageRates?.whatsappPerMessageUSD || 0.005}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, whatsappPerMessageUSD: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in INR (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={platformConfig.usageRates?.whatsappPerMessageINR || 0.4}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, whatsappPerMessageINR: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
              </div>
            </div>

            {/* Rate 3: Cold Email Dispatch Rate */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Mail size={20} color="#38BDF8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#F8FAFC' }}>
                  Cold Email Rate (per 1,000 emails)
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '14px' }}>
                Automated multi-mailbox dispatch via Instantly / SendGrid with secondary warmup.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in USD ($/1k)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={platformConfig.usageRates?.emailPer1000USD || 0.8}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, emailPer1000USD: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in INR (₹/1k)</label>
                  <input
                    type="number"
                    step="1.0"
                    value={platformConfig.usageRates?.emailPer1000INR || 65.0}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, emailPer1000INR: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
              </div>
            </div>

            {/* Rate 4: Waterfall Lead Enrichment */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Users size={20} color="#8B5CF6" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#F8FAFC' }}>
                  Lead Enrichment Rate (per contact)
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '14px' }}>
                Waterfall verification across Apollo, Hunter, and LinkedIn phone scrapers.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in USD ($/lead)</label>
                  <input
                    type="number"
                    step="0.005"
                    value={platformConfig.usageRates?.enrichmentPerLeadUSD || 0.02}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, enrichmentPerLeadUSD: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rate in INR (₹/lead)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={platformConfig.usageRates?.enrichmentPerLeadINR || 1.65}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      usageRates: { ...platformConfig.usageRates, enrichmentPerLeadINR: parseFloat(e.target.value) || 0 },
                    })}
                    className="input-glass"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MASTER CARRIER & TOOL INTEGRATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && platformConfig && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
                Master Provider &amp; Toolchain Integrations
              </h2>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#94A3B8' }}>
                Configure and verify the master API credentials that power telephony, WhatsApp, email deliverability, and payment processing.
              </p>
            </div>

            <button
              onClick={handleSavePlatformConfig}
              disabled={savingConfig}
              className="btn-emerald"
              style={{ padding: '9px 20px', fontWeight: '700', fontSize: '0.825rem' }}
            >
              {savingConfig ? 'Saving...' : 'Save API Credentials'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
            {/* Tool 1: Twilio Telephony */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={18} color="#F87171" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Twilio Carrier Telephony</h4>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Active</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                A2P 10DLC registration, WebRTC phone dialer, and voice DID number pooling.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Account SID"
                  value={platformConfig.integrations?.twilio?.accountSid || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, twilio: { ...platformConfig.integrations?.twilio, accountSid: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
                <input
                  type="password"
                  placeholder="Auth Token"
                  value={platformConfig.integrations?.twilio?.authToken || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, twilio: { ...platformConfig.integrations?.twilio, authToken: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
              </div>
              <button
                onClick={() => handleTestPing('twilio')}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
              >
                {pingStatus.twilio?.loading ? 'Pinging Twilio...' : 'Ping Test Connection'}
              </button>
              {pingStatus.twilio?.message && (
                <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '6px' }}>{pingStatus.twilio.message}</div>
              )}
            </div>

            {/* Tool 2: Bland.ai Sub-800ms Voice AI */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} color="#06B6D4" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Bland.ai Conversational Voice</h4>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Sub-800ms</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                Ultra-low latency conversational AI engine powering Maya Vance Voice Closer.
              </p>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="password"
                  placeholder="Bland.ai API Key"
                  value={platformConfig.integrations?.blandAi?.apiKey || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, blandAi: { ...platformConfig.integrations?.blandAi, apiKey: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
              </div>
              <button
                onClick={() => handleTestPing('blandAi')}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
              >
                {pingStatus.blandAi?.loading ? 'Pinging Carrier...' : 'Ping Test Connection'}
              </button>
              {pingStatus.blandAi?.message && (
                <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '6px' }}>{pingStatus.blandAi.message}</div>
              )}
            </div>

            {/* Tool 3: AiSensy WhatsApp Marketing */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#25D366" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>AiSensy / WhatsApp Gateway</h4>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>WhatsApp Live</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                Official WhatsApp Business Platform for broadcasts and inbound SDR automation.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="password"
                  placeholder="AiSensy API Key"
                  value={platformConfig.integrations?.aisensy?.apiKey || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, aisensy: { ...platformConfig.integrations?.aisensy, apiKey: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
                <input
                  type="text"
                  placeholder="Business Number (+91...)"
                  value={platformConfig.integrations?.aisensy?.businessNumber || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, aisensy: { ...platformConfig.integrations?.aisensy, businessNumber: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
              </div>
              <button
                onClick={() => handleTestPing('aisensy')}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
              >
                {pingStatus.aisensy?.loading ? 'Pinging WhatsApp...' : 'Ping Test Connection'}
              </button>
              {pingStatus.aisensy?.message && (
                <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '6px' }}>{pingStatus.aisensy.message}</div>
              )}
            </div>

            {/* Tool 4: Instantly Email Warmup & Sequences */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} color="#38BDF8" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Instantly / Smartlead Warmup</h4>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Warmup 100%</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                Secondary domain warmup and automated cold email delivery safeguards.
              </p>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="password"
                  placeholder="Instantly.ai API Key"
                  value={platformConfig.integrations?.instantlyEmail?.apiKey || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, instantlyEmail: { ...platformConfig.integrations?.instantlyEmail, apiKey: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
              </div>
              <button
                onClick={() => handleTestPing('instantlyEmail')}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
              >
                {pingStatus.instantlyEmail?.loading ? 'Pinging Instantly...' : 'Ping Test Connection'}
              </button>
              {pingStatus.instantlyEmail?.message && (
                <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '6px' }}>{pingStatus.instantlyEmail.message}</div>
              )}
            </div>

            {/* Tool 5: Razorpay (India Payments) */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="#FBBF24" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Razorpay (India Gateway)</h4>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>UPI / Netbanking</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                Instant BHIM UPI, PhonePe, GPay, and Indian RuPay card processing.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Key ID (rzp_live...)"
                  value={platformConfig.integrations?.razorpayIndia?.keyId || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, razorpayIndia: { ...platformConfig.integrations?.razorpayIndia, keyId: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
                <input
                  type="password"
                  placeholder="Key Secret"
                  value={platformConfig.integrations?.razorpayIndia?.keySecret || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, razorpayIndia: { ...platformConfig.integrations?.razorpayIndia, keySecret: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
              </div>
              <button
                onClick={() => handleTestPing('razorpayIndia')}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
              >
                {pingStatus.razorpayIndia?.loading ? 'Pinging Razorpay...' : 'Ping Test Connection'}
              </button>
              {pingStatus.razorpayIndia?.message && (
                <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '6px' }}>{pingStatus.razorpayIndia.message}</div>
              )}
            </div>

            {/* Tool 6: Stripe (Global Payments & Connect) */}
            <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="#60A5FA" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Stripe (Global &amp; Connect)</h4>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Global Cards</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                International credit cards, UPI, and automated payment gateway webhooks.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Publishable Key (pk_live...)"
                  value={platformConfig.integrations?.stripeGlobal?.publishableKey || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, stripeGlobal: { ...platformConfig.integrations?.stripeGlobal, publishableKey: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
                <input
                  type="password"
                  placeholder="Secret Key (sk_live...)"
                  value={platformConfig.integrations?.stripeGlobal?.secretKey || ''}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    integrations: { ...platformConfig.integrations, stripeGlobal: { ...platformConfig.integrations?.stripeGlobal, secretKey: e.target.value } },
                  })}
                  className="input-glass"
                  style={{ height: '32px', fontSize: '0.78rem' }}
                />
              </div>
              <button
                onClick={() => handleTestPing('stripeGlobal')}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
              >
                {pingStatus.stripeGlobal?.loading ? 'Pinging Stripe...' : 'Ping Test Connection'}
              </button>
              {pingStatus.stripeGlobal?.message && (
                <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '6px' }}>{pingStatus.stripeGlobal.message}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACTIVE BUSINESS WORKSPACES & ACTUAL FEATURES */}
      {/* ========================================================================= */}
      {activeTab === 'tenants' && (
        <div>
          {/* Header & Subtitle */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 6px' }}>
              Active Business Workspaces & Actual Features
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
              Inspect and configure actual features, operating modes, AI C-Suite staff, and live pipeline metrics for every registered business workspace.
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div className="card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Total Active Tenants</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38BDF8', marginTop: '4px' }}>{workspaces.length}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Registered business workspaces</div>
            </div>

            <div className="card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.725rem', color: '#A7F3D0', fontWeight: '600', textTransform: 'uppercase' }}>Autonomous AI Companies</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34D399', marginTop: '4px' }}>
                {workspaces.filter((w) => w.operatingMode === 'AI_COMPANY').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Running full AI C-Suite staff</div>
            </div>

            <div className="card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <div style={{ fontSize: '0.725rem', color: '#BAE6FD', fontWeight: '600', textTransform: 'uppercase' }}>Self-Serve Tool Mode</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06B6D4', marginTop: '4px' }}>
                {workspaces.filter((w) => w.operatingMode !== 'AI_COMPANY').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Using dialer, scraper &amp; inbox</div>
            </div>

            <div className="card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <div style={{ fontSize: '0.725rem', color: '#DDD6FE', fontWeight: '600', textTransform: 'uppercase' }}>Active AI Employees</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A78BFA', marginTop: '4px' }}>
                {workspaces.reduce((acc, w) => acc + (w.hiredAgents ? w.hiredAgents.filter(a => a.active).length : (w.operatingMode === 'AI_COMPANY' ? 6 : 0)), 0)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Deployed 24/7 autonomous agents</div>
            </div>

            <div className="card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Total Leads Managed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F8FAFC', marginTop: '4px' }}>
                {workspaces.reduce((acc, w) => acc + (w.leadCount || 0), 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Active contacts across all CRMs</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search business name, domain, or slug..."
                value={workspaceSearch}
                onChange={(e) => setWorkspaceSearch(e.target.value)}
                className="input-glass"
                style={{ height: '36px', fontSize: '0.8125rem', maxWidth: '320px' }}
              />
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {[
                  { id: 'ALL', label: 'All Tenants' },
                  { id: 'AI_COMPANY', label: 'Autonomous AI' },
                  { id: 'TOOL', label: 'Tool Mode' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setWorkspaceTypeFilter(tf.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: workspaceTypeFilter === tf.id ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                      color: workspaceTypeFilter === tf.id ? '#38BDF8' : '#94A3B8',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onRefreshWorkspaces && onRefreshWorkspaces()}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#94A3B8',
                fontSize: '0.775rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} />
              <span>Refresh Tenant Workspaces</span>
            </button>
          </div>

          {/* Workspaces Master Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left', color: '#64748B' }}>
                    <th style={{ padding: '12px 18px' }}>BUSINESS WORKSPACE</th>
                    <th style={{ padding: '12px 14px' }}>TYPE &amp; INDUSTRY</th>
                    <th style={{ padding: '12px 14px' }}>MODE &amp; SUBSCRIPTION PLAN</th>
                    <th style={{ padding: '12px 14px' }}>ACTIVE AI C-SUITE STAFF</th>
                    <th style={{ padding: '12px 14px' }}>ACTUAL FEATURES</th>
                    <th style={{ padding: '12px 14px' }}>LEADS &amp; WALLET</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces
                    .filter((ws) => {
                      if (workspaceSearch) {
                        const q = workspaceSearch.toLowerCase();
                        const matchName = ws.name?.toLowerCase().includes(q);
                        const matchDomain = ws.domain?.toLowerCase().includes(q);
                        const matchSlug = ws.slug?.toLowerCase().includes(q);
                        if (!matchName && !matchDomain && !matchSlug) return false;
                      }
                      if (workspaceTypeFilter === 'AI_COMPANY') return ws.operatingMode === 'AI_COMPANY';
                      if (workspaceTypeFilter === 'TOOL') return ws.operatingMode !== 'AI_COMPANY';
                      return true;
                    })
                    .map((ws) => {
                      const isAi = ws.operatingMode === 'AI_COMPANY';
                      const hiredList = ws.hiredAgents || [];

                      return (
                        <tr key={ws._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          {/* Business Workspace */}
                          <td style={{ padding: '14px 18px', fontWeight: '700', color: '#F8FAFC' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: isAi ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                                border: isAi ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(6, 182, 212, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isAi ? '#34D399' : '#38BDF8',
                                fontSize: '0.85rem',
                                fontWeight: '800',
                              }}>
                                {ws.name ? ws.name.substring(0, 1).toUpperCase() : 'W'}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
                                  <span>{ws.name}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                                  {ws.domain ? ws.domain : `slug: ${ws.slug}`}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Type & Industry */}
                          <td style={{ padding: '14px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="badge badge-gray" style={{ fontSize: '0.675rem' }}>
                                {ws.industry || 'B2B'}
                              </span>
                            </div>
                          </td>

                          {/* Mode & Subscription Plan */}
                          <td style={{ padding: '14px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={`badge ${isAi ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '0.675rem' }}>
                                {isAi ? '⚡ Autonomous AI Co.' : '🛠️ Self-Serve Tool Mode'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#CBD5E1', fontWeight: '600' }}>
                                {ws.subscription?.planTier ? ws.subscription.planTier.replace(/_/g, ' ') : (isAi ? 'AI STARTER ($249/mo)' : 'TOOL MODE ($49/mo)')}
                              </span>
                            </div>
                          </td>

                          {/* Active AI C-Suite Staff */}
                          <td style={{ padding: '14px 14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                              {['CMO', 'SDR', 'VOICE_CLOSER', 'CFO', 'CUSTOMER_SUCCESS', 'CEO'].map((role) => {
                                const isHired = isAi || hiredList.some((a) => a.agentRole === role && a.active);
                                const shortLabel = role === 'VOICE_CLOSER' ? 'Closer' : role === 'CUSTOMER_SUCCESS' ? 'CS' : role;
                                return (
                                  <span
                                    key={role}
                                    style={{
                                      fontSize: '0.65rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '700',
                                      background: isHired ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                      color: isHired ? '#34D399' : '#475569',
                                      border: isHired ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                    }}
                                  >
                                    {shortLabel} {isHired ? '✓' : '—'}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Actual Features */}
                          <td style={{ padding: '14px 14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                              <span className="badge badge-cyan" style={{ fontSize: '0.625rem' }}>⚡ Speed-to-Lead</span>
                              <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>💬 WhatsApp Hub</span>
                              <span className="badge badge-cyan" style={{ fontSize: '0.625rem' }}>📧 Cold Email</span>
                              {isAi && <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>🤖 Ad Optimizer</span>}
                              {isAi && <span className="badge badge-cyan" style={{ fontSize: '0.625rem' }}>📱 Social Reels</span>}
                            </div>
                          </td>

                          {/* Leads & Wallet */}
                          <td style={{ padding: '14px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ fontSize: '0.775rem', fontWeight: '700', color: '#F8FAFC' }}>
                                {(ws.leadCount || 0).toLocaleString()} <span style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: '400' }}>leads</span>
                              </div>
                              <div style={{ fontSize: '0.725rem', color: '#34D399', fontWeight: '600' }}>
                                {isINR
                                  ? `₹${Math.round((ws.walletBalanceUSD || 50) * exchangeRate).toLocaleString('en-IN')}`
                                  : `$${(ws.walletBalanceUSD || 50).toFixed(2)}`}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  if (onInspectWorkspace) onInspectWorkspace(ws);
                                  else if (onSwitchWorkspace) onSwitchWorkspace(ws);
                                }}
                                className="btn-primary"
                                style={{ padding: '5px 12px', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                title="Open and preview workspace as its owner"
                              >
                                <span>Inspect View</span>
                              </button>

                              <button
                                onClick={() => handleOpenManageModal(ws)}
                                className="btn-secondary"
                                style={{ padding: '5px 10px', fontSize: '0.725rem' }}
                                title="Configure operating mode, features, and wallet credits"
                              >
                                Configure
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VISUAL AI, CANVA & GOOGLE FLOW TOOLS (SUPER ADMIN CONTROL) */}
      {/* ========================================================================= */}
      {activeTab === 'visualTools' && platformConfig && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
                🎨 Master Visual AI, Canva Connect & Google Flow Tools
              </h2>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#94A3B8' }}>
                Super Admin Master Control: Test live connections, manage API credentials, open provider login consoles, and use the unified creative studio on the spot.
              </p>
            </div>

            <button
              onClick={handleSavePlatformConfig}
              disabled={savingConfig}
              className="btn-emerald"
              style={{ padding: '9px 22px', fontWeight: '700', fontSize: '0.825rem' }}
            >
              {savingConfig ? 'Saving Settings...' : 'Save Visual Tool Settings'}
            </button>
          </div>

          {/* Section 1: Live Interactive Creative Studio (Admin Generator) */}
          <div className="card" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#06B6D4" />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                  Live Creative Studio Sandbox (Direct Use & Generation)
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                Generate Pitch Decks, AI Ad Creatives, Canva Designs, and GTM Pipeline Flowcharts directly in the Super Admin dashboard.
              </p>
            </div>

            <VisualCreativeStudio isSuperAdmin={true} />
          </div>

          {/* Section 2: Visual Providers Credentials & Quick Login Hub */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
                🛠️ Visual Toolchain Configurations & Direct Provider Login Links
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Configure credentials, verify live connectivity, and access developer portals for each visual representation tool.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {/* Tool 1: Pollinations FLUX.1 (Free AI Images) */}
              <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#06B6D4" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Pollinations FLUX.1 Visual AI</h4>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Free &amp; Unlimited</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                  Open-source FLUX.1 high-resolution image engine. Zero-cost, zero API key required, commercial rights included.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>Default Image Model</label>
                    <select
                      value={platformConfig.pollinationsVisualAi?.defaultModel || 'flux'}
                      onChange={(e) => setPlatformConfig({
                        ...platformConfig,
                        pollinationsVisualAi: { ...platformConfig.pollinationsVisualAi, defaultModel: e.target.value },
                      })}
                      className="input-glass"
                      style={{ height: '34px', fontSize: '0.78rem' }}
                    >
                      <option value="flux">FLUX.1 Schnell (Fast &amp; High Detail)</option>
                      <option value="flux-realism">FLUX Photorealism (Ad Creatives)</option>
                      <option value="turbo">SDXL Turbo (Ultra-Fast)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="enableHd"
                      checked={platformConfig.pollinationsVisualAi?.enableHd !== false}
                      onChange={(e) => setPlatformConfig({
                        ...platformConfig,
                        pollinationsVisualAi: { ...platformConfig.pollinationsVisualAi, enableHd: e.target.checked },
                      })}
                    />
                    <label htmlFor="enableHd" style={{ fontSize: '0.75rem', color: '#CBD5E1', cursor: 'pointer' }}>
                      Enable 8K HD Upscaling on all prompts
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href="https://pollinations.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <span>Pollinations Docs</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleTestPing('pollinationsVisualAi')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
                  >
                    {pingStatus.pollinationsVisualAi?.loading ? 'Testing...' : 'Ping Test'}
                  </button>
                </div>
                {pingStatus.pollinationsVisualAi?.message && (
                  <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '8px' }}>{pingStatus.pollinationsVisualAi.message}</div>
                )}
              </div>

              {/* Tool 2: Autonomous PowerPoint (.PPTX) Presentation Engine */}
              <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Presentation size={18} color="#06B6D4" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>PowerPoint (.PPTX) Engine</h4>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Active / Built-in</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                  Autonomous Microsoft PowerPoint compiler. Synthesizes crawled strategy, ICP matrix, value prop, channels, and 30-day roadmap into 16:9 executive pitch decks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '700' }}>SLIDE COMPILER ENGINE</div>
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>pptxgenjs • 16:9 Widescreen • Dark Obsidian Layout</div>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700' }}>OUTPUT FORMATS</div>
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>Direct .pptx File Download, In-Dashboard Presenter, .HTML Deck</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleTestPing('pptxEngine')}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '7px', fontSize: '0.75rem' }}
                  >
                    {pingStatus.pptxEngine?.loading ? 'Verifying Compiler...' : 'Ping Test PPTX Engine'}
                  </button>
                </div>
                {pingStatus.pptxEngine?.message && (
                  <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '8px' }}>{pingStatus.pptxEngine.message}</div>
                )}
              </div>

              {/* Tool 3: Google Flow AI & Google Slides Workspace */}
              <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#FBBF24" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Google Flow AI &amp; Slides</h4>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Workspace Cloud</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                  Google Slides presentation automation &amp; strategy flowchart sync for enterprise decks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="OAuth Client ID (.apps.googleusercontent.com)"
                    value={platformConfig.googleFlowWorkspace?.clientId || ''}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      googleFlowWorkspace: { ...platformConfig.googleFlowWorkspace, clientId: e.target.value },
                    })}
                    className="input-glass"
                    style={{ height: '34px', fontSize: '0.78rem' }}
                  />
                  <input
                    type="password"
                    placeholder="Google Cloud API Key"
                    value={platformConfig.googleFlowWorkspace?.apiKey || ''}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      googleFlowWorkspace: { ...platformConfig.googleFlowWorkspace, apiKey: e.target.value },
                    })}
                    className="input-glass"
                    style={{ height: '34px', fontSize: '0.78rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Default Google Slides Master Template ID (optional)"
                    value={platformConfig.googleFlowWorkspace?.defaultTemplateId || ''}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      googleFlowWorkspace: { ...platformConfig.googleFlowWorkspace, defaultTemplateId: e.target.value },
                    })}
                    className="input-glass"
                    style={{ height: '34px', fontSize: '0.78rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <span>Google Cloud</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href="https://slides.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <span>Google Slides</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleTestPing('googleFlowWorkspace')}
                    className="btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.75rem' }}
                  >
                    {pingStatus.googleFlowWorkspace?.loading ? '...' : 'Ping'}
                  </button>
                </div>
                {pingStatus.googleFlowWorkspace?.message && (
                  <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '8px' }}>{pingStatus.googleFlowWorkspace.message}</div>
                )}
              </div>

              {/* Tool 4: OpenAI DALL-E 3 Visual Engine */}
              <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={18} color="#A78BFA" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>OpenAI DALL-E 3 Engine</h4>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Photorealistic</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                  Secondary high-precision visual engine for hyper-targeted product mockups and advertising.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="password"
                    placeholder="OpenAI API Key (sk-...)"
                    value={platformConfig.dalleVisualAi?.apiKey || ''}
                    onChange={(e) => setPlatformConfig({
                      ...platformConfig,
                      dalleVisualAi: { ...platformConfig.dalleVisualAi, apiKey: e.target.value },
                    })}
                    className="input-glass"
                    style={{ height: '34px', fontSize: '0.78rem' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>Model</label>
                      <input
                        type="text"
                        readOnly
                        value="dall-e-3"
                        className="input-glass"
                        style={{ height: '34px', fontSize: '0.78rem', opacity: 0.8 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>Quality</label>
                      <select
                        value={platformConfig.dalleVisualAi?.quality || 'standard'}
                        onChange={(e) => setPlatformConfig({
                          ...platformConfig,
                          dalleVisualAi: { ...platformConfig.dalleVisualAi, quality: e.target.value },
                        })}
                        className="input-glass"
                        style={{ height: '34px', fontSize: '0.78rem' }}
                      >
                        <option value="standard">Standard Quality</option>
                        <option value="hd">HD Ultra Definition</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <span>OpenAI Keys</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleTestPing('dalleVisualAi')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
                  >
                    {pingStatus.dalleVisualAi?.loading ? 'Testing...' : 'Ping Test'}
                  </button>
                </div>
                {pingStatus.dalleVisualAi?.message && (
                  <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '8px' }}>{pingStatus.dalleVisualAi.message}</div>
                )}
              </div>

              {/* Tool 5: Vertical Short Video Reel Engine */}
              <div className="card" style={{ padding: '22px', background: '#0D1527' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Radio size={18} color="#EC4899" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Vertical Video Reel Engine</h4>
                  </div>
                  <span className="badge badge-pink" style={{ fontSize: '0.65rem' }}>9:16 Shorts/Reels</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px' }}>
                  Programmatic short video engine powering Ava Vance CMO social reels and TikTok/IG marketing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>Default B-Roll Preset</label>
                    <select
                      value={platformConfig.shortVideoEngine?.defaultPreset || 'modern_fintech'}
                      onChange={(e) => setPlatformConfig({
                        ...platformConfig,
                        shortVideoEngine: { ...platformConfig.shortVideoEngine, defaultPreset: e.target.value },
                      })}
                      className="input-glass"
                      style={{ height: '34px', fontSize: '0.78rem' }}
                    >
                      <option value="modern_fintech">Modern Fintech &amp; Web3 Cyber</option>
                      <option value="saas_dark">SaaS Dark Obsidian Minimal</option>
                      <option value="neon_agency">Neon Agency Kinetic Flow</option>
                      <option value="minimal_clean">Clean Corporate &amp; Healthcare</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="videoWatermark"
                      checked={platformConfig.shortVideoEngine?.includeWatermark !== false}
                      onChange={(e) => setPlatformConfig({
                        ...platformConfig,
                        shortVideoEngine: { ...platformConfig.shortVideoEngine, includeWatermark: e.target.checked },
                      })}
                    />
                    <label htmlFor="videoWatermark" style={{ fontSize: '0.75rem', color: '#CBD5E1', cursor: 'pointer' }}>
                      Include VYUHOX Branding watermark on free tier
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleTestPing('shortVideoEngine')}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '7px', fontSize: '0.75rem' }}
                  >
                    {pingStatus.shortVideoEngine?.loading ? 'Pinging Reel Engine...' : 'Ping Test Connection'}
                  </button>
                </div>
                {pingStatus.shortVideoEngine?.message && (
                  <div style={{ fontSize: '0.7rem', color: '#34D399', marginTop: '8px' }}>{pingStatus.shortVideoEngine.message}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Client Workspace Feature Governance & Access Controls */}
          <div className="card" style={{ padding: '24px', background: '#0D1527', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10B981" />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                  🛡️ Client Access Governance &amp; Usage Limits
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                Specify which visual generation tools are available to client workspaces and configure monthly AI creation limits.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={platformConfig.visualToolsGovernance?.enableAiImageGen !== false}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    visualToolsGovernance: { ...platformConfig.visualToolsGovernance, enableAiImageGen: e.target.checked },
                  })}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>AI Image Generator</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Allow clients to create FLUX.1 images</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={platformConfig.visualToolsGovernance?.enablePptxForClients !== false}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    visualToolsGovernance: { ...platformConfig.visualToolsGovernance, enablePptxForClients: e.target.checked },
                  })}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>PowerPoint (.PPTX) Download</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Allow clients to download full Microsoft PowerPoint presentations</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={platformConfig.visualToolsGovernance?.enablePitchDecksForClients !== false}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    visualToolsGovernance: { ...platformConfig.visualToolsGovernance, enablePitchDecksForClients: e.target.checked },
                  })}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>GTM Pitch Decks</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Generate 6-slide executive PPT decks</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={platformConfig.visualToolsGovernance?.enableVideoReelsForClients !== false}
                  onChange={(e) => setPlatformConfig({
                    ...platformConfig,
                    visualToolsGovernance: { ...platformConfig.visualToolsGovernance, enableVideoReelsForClients: e.target.checked },
                  })}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' }}>Short Video Reels</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Render 9:16 vertical reels for social ads</div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '16px', maxWidth: '320px' }}>
              <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Monthly AI Image Generations Quota per Workspace
              </label>
              <input
                type="number"
                value={platformConfig.visualToolsGovernance?.maxAiImagesPerWorkspaceMonthly || 250}
                onChange={(e) => setPlatformConfig({
                  ...platformConfig,
                  visualToolsGovernance: { ...platformConfig.visualToolsGovernance, maxAiImagesPerWorkspaceMonthly: parseInt(e.target.value, 10) || 0 },
                })}
                className="input-glass"
                style={{ height: '36px', fontSize: '0.825rem' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE WORKSPACE FEATURES & PLAN */}
      {managingWorkspace && manageForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', background: '#0B1120', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px', color: '#F8FAFC' }}>
                  Configure Workspace Features: {managingWorkspace.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                  Adjust operating mode, assign subscription plan, toggle AI employees, or grant courtesy usage credits.
                </p>
              </div>
              <button onClick={() => setManagingWorkspace(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManageWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Operating Mode Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Operating Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedAgents = manageForm.hiredAgents.map((a) => ({ ...a, active: false }));
                      setManageForm({ ...manageForm, operatingMode: 'TOOL', planTier: 'TOOL_MODE', hiredAgents: updatedAgents });
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: manageForm.operatingMode === 'TOOL' ? '2px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: manageForm.operatingMode === 'TOOL' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      color: manageForm.operatingMode === 'TOOL' ? '#38BDF8' : '#94A3B8',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.825rem' }}>🛠️ Self-Serve Tool Mode</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Manual dialing, scraper, and inbox. Low entry fee ($49/mo).</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedAgents = manageForm.hiredAgents.map((a) => ({ ...a, active: true }));
                      setManageForm({ ...manageForm, operatingMode: 'AI_COMPANY', planTier: 'AI_COMPANY_STARTER', hiredAgents: updatedAgents });
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: manageForm.operatingMode === 'AI_COMPANY' ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: manageForm.operatingMode === 'AI_COMPANY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      color: manageForm.operatingMode === 'AI_COMPANY' ? '#34D399' : '#94A3B8',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.825rem' }}>⚡ Autonomous AI Company</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>All 6 AI C-Suite agents run GTM 24/7 autonomously ($249 - $599/mo).</div>
                  </button>
                </div>
              </div>

              {/* Plan Tier Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Assigned Subscription Plan Tier
                </label>
                <select
                  value={manageForm.planTier}
                  onChange={(e) => setManageForm({ ...manageForm, planTier: e.target.value })}
                  className="input-glass"
                  style={{ height: '36px', fontSize: '0.825rem' }}
                >
                  <option value="TOOL_MODE">Tool Mode Core ($49/mo | ₹3,999/mo)</option>
                  <option value="AI_COMPANY_STARTER">AI Company Starter ($249/mo | ₹19,999/mo)</option>
                  <option value="AI_COMPANY_SCALE">AI Company Scale ($599/mo | ₹49,999/mo)</option>
                  <option value="CUSTOM">Custom Enterprise Contract</option>
                </select>
              </div>

              {/* AI C-Suite Employees Roster & Toggles */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Active AI C-Suite Employees
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {manageForm.hiredAgents.map((agent, idx) => {
                    return (
                      <div
                        key={agent.agentRole}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: agent.active ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.775rem', fontWeight: '700', color: agent.active ? '#34D399' : '#94A3B8' }}>
                            {agent.agentRole}: {agent.name || agent.agentRole}
                          </div>
                          <div style={{ fontSize: '0.675rem', color: '#64748B' }}>${agent.monthlyCost}/mo</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={agent.active}
                          onChange={(e) => {
                            const updated = [...manageForm.hiredAgents];
                            updated[idx] = { ...updated[idx], active: e.target.checked };
                            setManageForm({ ...manageForm, hiredAgents: updated });
                          }}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courtesy Credit Grant */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Grant Courtesy Usage Credits ($ USD)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter amount (e.g. 50)"
                    value={manageForm.addCreditsUSD || ''}
                    onChange={(e) => setManageForm({ ...manageForm, addCreditsUSD: parseFloat(e.target.value) || 0 })}
                    className="input-glass"
                    style={{ height: '36px', fontSize: '0.825rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {isINR ? `≈ ₹${Math.round((manageForm.addCreditsUSD || 0) * exchangeRate).toLocaleString('en-IN')}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>
                  Directly adds carrier balance for Twilio calling, WhatsApp messaging, and lead enrichment.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setManagingWorkspace(null)}
                  className="btn-secondary"
                  disabled={savingManage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                  disabled={savingManage}
                >
                  {savingManage ? 'Saving...' : 'Save Workspace Features'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PRICING TIER */}
      {isNewPlanModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', background: '#0B1120', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px', color: '#F8FAFC' }}>
              Create New Platform Pricing Tier
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 18px' }}>
              Define a new subscription package and assign it to a specific target country or global audience.
            </p>

            <form onSubmit={handleCreatePlanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Plan ID (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INDIA_STARTUP_PLUS"
                    value={newPlanData.planId}
                    onChange={(e) => setNewPlanData({ ...newPlanData, planId: e.target.value.toUpperCase() })}
                    className="input-glass"
                    style={{ height: '36px', fontSize: '0.825rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Target Region / Country</label>
                  <select
                    value={newPlanData.targetRegion}
                    onChange={(e) => setNewPlanData({ ...newPlanData, targetRegion: e.target.value })}
                    className="input-glass"
                    style={{ height: '36px', fontSize: '0.825rem' }}
                  >
                    <option value="ALL">All Countries / Universal</option>
                    <option value="INDIA_ONLY">🇮🇳 India Only (Visible in INR)</option>
                    <option value="GLOBAL_ONLY">🌐 International Only (Visible in USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Plan Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India High-Growth AI Suite"
                  value={newPlanData.name}
                  onChange={(e) => setNewPlanData({ ...newPlanData, name: e.target.value })}
                  className="input-glass"
                  style={{ height: '36px', fontSize: '0.825rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Tagline Description</label>
                <input
                  type="text"
                  placeholder="e.g. Optimized for Indian founders scaling regional outbound."
                  value={newPlanData.tagline}
                  onChange={(e) => setNewPlanData({ ...newPlanData, tagline: e.target.value })}
                  className="input-glass"
                  style={{ height: '36px', fontSize: '0.825rem' }}
                />
              </div>

              {/* Pricing inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Price USD ($/mo)</label>
                  <input
                    type="number"
                    required
                    value={newPlanData.priceUSD.monthly}
                    onChange={(e) => setNewPlanData({
                      ...newPlanData,
                      priceUSD: {
                        monthly: parseFloat(e.target.value) || 0,
                        annualMonthly: Math.round((parseFloat(e.target.value) || 0) * 0.8),
                      },
                    })}
                    className="input-glass"
                    style={{ height: '36px', fontSize: '0.825rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.725rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Price INR (₹/mo)</label>
                  <input
                    type="number"
                    required
                    value={newPlanData.priceINR.monthly}
                    onChange={(e) => setNewPlanData({
                      ...newPlanData,
                      priceINR: {
                        monthly: parseFloat(e.target.value) || 0,
                        annualMonthly: Math.round((parseFloat(e.target.value) || 0) * 0.8),
                      },
                    })}
                    className="input-glass"
                    style={{ height: '36px', fontSize: '0.825rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsNewPlanModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>
                  Create Plan Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
