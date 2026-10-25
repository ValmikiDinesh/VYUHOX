import { Workspace } from '../../models/Workspace.js';
import { Wallet } from '../../models/Wallet.js';

export const AGENT_CATALOG = {
  CMO: {
    role: 'CMO',
    name: 'Sophia Sterling',
    title: 'AI Chief Marketing Officer',
    monthlyCost: 49,
    description: 'Directs lead scrapers, generates 4-phase viral Reels, and iterates ad creatives based on objection feedback.',
    humanSalaryEquivalent: '$14,000 / mo',
    badgeColor: '#EC4899',
    category: 'Demand Generation',
  },
  SDR: {
    role: 'SDR',
    name: 'Marcus Cole',
    title: 'AI Lead Development Representative',
    monthlyCost: 39,
    description: 'Scans and enriches lead waterfall, personalizes outbound emails, and converses on WhatsApp.',
    humanSalaryEquivalent: '$5,500 / mo',
    badgeColor: '#3B82F6',
    category: 'Pipeline & Outbound',
  },
  VOICE_CLOSER: {
    role: 'VOICE_CLOSER',
    name: 'Maya Vance',
    title: 'AI Senior Voice Closer & AE',
    monthlyCost: 49,
    description: 'Sub-45s inbound speed-to-lead phone dialing, qualification discovery, and automated demo scheduling.',
    humanSalaryEquivalent: '$9,000 / mo',
    badgeColor: '#10B981',
    category: 'High-Intent Closing',
  },
  CFO: {
    role: 'CFO',
    name: 'Julian Vance',
    title: 'AI Chief Financial Officer & RevOps',
    monthlyCost: 39,
    description: 'Monitors Stripe recurring billing, audits CAC/LTV ratios (21.4x), and enforces ad spend stop-loss ceilings.',
    humanSalaryEquivalent: '$12,000 / mo',
    badgeColor: '#F59E0B',
    category: 'Finance & Margins',
  },
  CUSTOMER_SUCCESS: {
    role: 'CUSTOMER_SUCCESS',
    name: 'Chloe Kim',
    title: 'AI Head of Customer Success & Retention',
    monthlyCost: 39,
    description: 'Monitors Binance/Bybit API keys, sends automated onboarding support via WhatsApp, and prevents churn.',
    humanSalaryEquivalent: '$6,000 / mo',
    badgeColor: '#8B5CF6',
    category: 'Retention & Onboarding',
  },
};

export const PLAN_TIERS = {
  TOOL_MODE: {
    name: 'Autonomous AI Starter',
    baseMonthlyFee: 49,
    description: 'Autonomous AI access to Lead Scraper, In-browser Dialer, Omnichannel AI Drafter, and Ad Manager.',
    includedAgentsCount: 0,
    features: [
      'Autonomous Waterfall Lead Scraper & Enrichment',
      'In-browser WebRTC Phone Dialer',
      'AI-Drafted WhatsApp, Telegram & Email sequences',
      'Meta & Google Ads Campaign Manager',
      'Universal DNC & Deliverability Audits',
      'Pay-as-you-go telephony usage wallet',
    ],
  },
  AI_COMPANY_STARTER: {
    name: 'Autonomous AI Company',
    baseMonthlyFee: 249,
    description: 'Full autonomous C-Suite orchestration. All 5 AI agents + Central AI CEO included ($66/mo savings).',
    includedAgentsCount: 5,
    features: [
      'Everything in AI Starter included',
      'All 5 AI Executives (CMO, SDR, Closer, CFO, CS) Active',
      'Central AI CEO 9:00 AM WhatsApp Morning Briefing',
      '1-Click Strategic Proposal Approvals',
      'Automated Cross-Agent Feedback Loop',
      'Speed-to-lead sub-45s voice dialing',
    ],
  },
  AI_COMPANY_SCALE: {
    name: 'Autonomous AI Company (Enterprise Scale)',
    baseMonthlyFee: 599,
    description: 'Dedicated high-throughput telephony, dedicated custom enterprise endpoints, and unlimited AI employee seats.',
    includedAgentsCount: 5,
    features: [
      'Everything in Autonomous AI Company',
      'High-throughput 30 TPS A2P 10DLC campaign registration',
      'Dedicated enterprise workspace & SSO security',
      'Dedicated GPU voice synthesis nodes (<400ms SLA)',
      'Custom webhook routers & Zapier integrations',
      'Dedicated RevOps engineer support',
    ],
  },
};

class PricingCalculator {
  /**
   * Get dynamic pricing summary for workspace
   */
  async getPricingSummary(workspaceId) {
    const [ws, wallet] = await Promise.all([
      Workspace.findById(workspaceId).lean(),
      Wallet.findOne({ workspaceId }).lean(),
    ]);

    if (!ws) throw new Error('Workspace not found');

    const operatingMode = ws.operatingMode || 'TOOL';
    const planTierKey = operatingMode === 'AI_COMPANY' ? 'AI_COMPANY_STARTER' : 'TOOL_MODE';
    const currentTier = PLAN_TIERS[planTierKey];

    // Compute active hired agents
    const hiredAgents = ws.hiredAgents || [];
    const activeHired = hiredAgents.filter((a) => a.active);

    let baseFee = currentTier.baseMonthlyFee;
    let agentAddonFee = 0;

    if (operatingMode === 'TOOL') {
      // In Tool mode, each active hired agent is billed individually ($39 - $49/mo)
      agentAddonFee = activeHired.reduce((acc, a) => acc + (a.monthlyCost || 39), 0);
    } else {
      // In AI Company mode, all agents are bundled in baseFee ($249)
      agentAddonFee = 0;
    }

    const totalMonthlyFee = baseFee + agentAddonFee;

    return {
      success: true,
      workspaceId: ws._id,
      operatingMode,
      planTier: planTierKey,
      planDetails: currentTier,
      baseMonthlyFee: baseFee,
      agentAddonFee,
      totalMonthlyFee,
      hiredAgents: hiredAgents.map((h) => ({
        ...h,
        details: AGENT_CATALOG[h.agentRole] || {},
      })),
      activeHiredCount: activeHired.length,
      walletBalanceUSD: wallet ? wallet.balanceUSD : 50.0,
      agentCatalog: Object.values(AGENT_CATALOG),
      availablePlans: PLAN_TIERS,
    };
  }

  /**
   * Switch operating mode (TOOL vs AI_COMPANY)
   */
  async switchOperatingMode({ workspaceId, targetMode, planTier = 'AI_COMPANY_STARTER', io }) {
    if (!['TOOL', 'AI_COMPANY'].includes(targetMode)) {
      throw new Error('Invalid operating mode. Must be TOOL or AI_COMPANY');
    }

    const ws = await Workspace.findById(workspaceId);
    if (!ws) throw new Error('Workspace not found');

    ws.operatingMode = targetMode;

    if (targetMode === 'AI_COMPANY') {
      const tierInfo = PLAN_TIERS[planTier] || PLAN_TIERS.AI_COMPANY_STARTER;
      ws.subscription = {
        planTier,
        baseMonthlyFee: tierInfo.baseMonthlyFee,
        agentAddonFee: 0,
        totalMonthlyFee: tierInfo.baseMonthlyFee,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      };

      // Activate all 5 core agents
      const defaultRoles = ['CMO', 'SDR', 'VOICE_CLOSER', 'CFO', 'CUSTOMER_SUCCESS'];
      ws.hiredAgents = defaultRoles.map((role) => ({
        agentRole: role,
        name: AGENT_CATALOG[role]?.name || role,
        monthlyCost: AGENT_CATALOG[role]?.monthlyCost || 39,
        active: true,
        hiredAt: new Date(),
      }));
    } else {
      // Switch back to Tool mode ($49/mo base)
      const currentHired = ws.hiredAgents?.filter((a) => a.active) || [];
      const addonCost = currentHired.reduce((acc, a) => acc + (a.monthlyCost || 39), 0);

      ws.subscription = {
        planTier: 'TOOL_MODE',
        baseMonthlyFee: 49,
        agentAddonFee: addonCost,
        totalMonthlyFee: 49 + addonCost,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      };
    }

    await ws.save();

    if (io) {
      io.to(workspaceId.toString()).emit('workspace:mode_updated', {
        operatingMode: ws.operatingMode,
        subscription: ws.subscription,
        hiredAgents: ws.hiredAgents,
      });
    }

    return {
      success: true,
      message: `Operating mode updated to ${targetMode === 'AI_COMPANY' ? 'Autonomous AI Company' : 'Autonomous AI Starter Engine'}`,
      workspace: ws,
    };
  }

  /**
   * "Hire As You Grow" Modular Switchboard:
   * Hire, pause, or release an individual AI agent ($39 - $49/mo each)
   */
  async toggleHiredAgent({ workspaceId, agentRole, action = 'HIRE', io }) {
    const catalogItem = AGENT_CATALOG[agentRole];
    if (!catalogItem) {
      throw new Error(`Unknown agent role: ${agentRole}`);
    }

    const ws = await Workspace.findById(workspaceId);
    if (!ws) throw new Error('Workspace not found');

    if (!ws.hiredAgents) ws.hiredAgents = [];

    const existingIdx = ws.hiredAgents.findIndex((a) => a.agentRole === agentRole);

    if (action === 'HIRE') {
      if (existingIdx >= 0) {
        ws.hiredAgents[existingIdx].active = true;
      } else {
        ws.hiredAgents.push({
          agentRole,
          name: catalogItem.name,
          monthlyCost: catalogItem.monthlyCost,
          active: true,
          hiredAt: new Date(),
        });
      }
    } else if (action === 'RELEASE' || action === 'PAUSE') {
      if (existingIdx >= 0) {
        ws.hiredAgents[existingIdx].active = false;
      }
    }

    // Recalculate dynamic subscription totals
    const activeHired = ws.hiredAgents.filter((a) => a.active);
    const addonCost = ws.operatingMode === 'TOOL' ? activeHired.reduce((acc, a) => acc + (a.monthlyCost || 39), 0) : 0;
    const baseFee = ws.operatingMode === 'AI_COMPANY' ? 249 : 49;

    ws.subscription = {
      planTier: ws.operatingMode === 'AI_COMPANY' ? 'AI_COMPANY_STARTER' : 'TOOL_MODE',
      baseMonthlyFee: baseFee,
      agentAddonFee: addonCost,
      totalMonthlyFee: baseFee + addonCost,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
    };

    await ws.save();

    if (io) {
      io.to(workspaceId.toString()).emit('workspace:agents_updated', {
        hiredAgents: ws.hiredAgents,
        subscription: ws.subscription,
      });
    }

    return {
      success: true,
      message: `${catalogItem.name} (${catalogItem.title}) ${action === 'HIRE' ? 'hired successfully' : 'paused'}`,
      hiredAgents: ws.hiredAgents,
      subscription: ws.subscription,
    };
  }

  /**
   * Business Complexity Scanner & Dynamic Team Sizing Calculator
   * Recommends team size, estimated ROI, and equivalent human replacement value
   */
  estimateTeamAndROI({ monthlyLeads = 500, adBudgetUSD = 2000, targetDealSize = 3500, industry = 'B2B' }) {
    const leads = Number(monthlyLeads) || 500;
    const adBudget = Number(adBudgetUSD) || 2000;
    const dealSize = Number(targetDealSize) || 3500;

    const recommendedAgents = [];

    // SDR recommendation
    if (leads >= 150) {
      recommendedAgents.push(AGENT_CATALOG.SDR);
    }

    // Voice Closer recommendation
    if (leads >= 300 || dealSize >= 2000) {
      recommendedAgents.push(AGENT_CATALOG.VOICE_CLOSER);
    }

    // CMO recommendation
    if (adBudget >= 1000 || industry === 'Crypto' || industry === 'D2C') {
      recommendedAgents.push(AGENT_CATALOG.CMO);
    }

    // CFO recommendation
    if (adBudget >= 3000 || dealSize >= 5000) {
      recommendedAgents.push(AGENT_CATALOG.CFO);
    }

    // Customer Success recommendation
    if (industry === 'Crypto' || leads >= 500) {
      recommendedAgents.push(AGENT_CATALOG.CUSTOMER_SUCCESS);
    }

    // Fallback if low volume
    if (recommendedAgents.length === 0) {
      recommendedAgents.push(AGENT_CATALOG.SDR);
    }

    // Compare Tool Mode + Hired Agents vs Full AI Company Bundle ($249)
    const modularCost = 49 + recommendedAgents.reduce((acc, a) => acc + a.monthlyCost, 0);
    const fullCompanyCost = 249;
    const recommendBundle = recommendedAgents.length >= 4 || modularCost >= 220;

    const recommendedTier = recommendBundle ? 'AI_COMPANY_STARTER' : 'TOOL_MODE';
    const estimatedMonthlyCost = recommendBundle ? fullCompanyCost : modularCost;

    // Human equivalent monthly salary
    const humanSalaryReplaced = recommendedAgents.length * 8500; // Average human SDR/AE/CMO monthly cost
    const monthlySavings = humanSalaryReplaced - estimatedMonthlyCost;
    const hoursSavedPerMonth = Math.min(220, Math.round(leads * 0.35 + (adBudget / 100) * 2));

    // Pipeline forecast
    const estimatedDemos = Math.round(leads * 0.08);
    const estimatedClosedDeals = Math.round(estimatedDemos * 0.28);
    const estimatedPipelineUSD = estimatedClosedDeals * dealSize;

    return {
      success: true,
      inputs: { monthlyLeads: leads, adBudgetUSD: adBudget, targetDealSize: dealSize, industry },
      recommendedAgents,
      recommendBundle,
      recommendedTier,
      estimatedMonthlyCost,
      hoursSavedPerMonth,
      humanSalaryReplaced: `$${humanSalaryReplaced.toLocaleString()} / mo`,
      monthlySavings: `$${monthlySavings.toLocaleString()} / mo`,
      pipelineForecast: {
        estimatedDemos,
        estimatedClosedDeals,
        estimatedPipelineUSD: `$${estimatedPipelineUSD.toLocaleString()}`,
        roiMultiplier: ((estimatedPipelineUSD / estimatedMonthlyCost) || 12).toFixed(1) + 'x',
      },
    };
  }
}

export const pricingCalculator = new PricingCalculator();
