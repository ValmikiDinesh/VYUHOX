/**
 * EmployeeRoleBrain.js
 * Universal Organizational Role & Dynamic AI Workforce Allocation Brain
 * 
 * Teaches VYUHOX about every echelon of corporate and business operations:
 * - Founders, CEOs, CTOs, COOs, CMOs, CFOs, CROs
 * - VPs, Directors, Team Managers, Assistant Managers, Project Managers
 * - Sales Leaders, Account Executives, SDRs/BDRs, Inbound Telecallers, Closers
 * - Growth Architects, Lead Strategists, Business Analysts, Market Specialists
 * - Tech Leads, Full Stack Developers, DevOps, QA Engineers, UI/UX Specialists
 * - Performance Marketers, Paid Media Buyers, Reels/Content Creators, Copywriters
 * - Customer Success Managers, Onboarding Leads, Operations Coordinators
 * - Specialized Local & Industry Roles (Clinic Directors, Dentists, Chefs, Chit Foremen, Brokers, Plant Managers)
 * 
 * When any client URL is crawled, VYUHOX analyzes the company's category, offerings, and bottlenecks
 * to dynamically allocate a bespoke AI Agent Workforce matching their exact operational needs.
 */

export class EmployeeRoleBrain {
  /**
   * Master Organizational Role Matrix (50+ Roles Across All Corporate Echelons)
   */
  static ROLES_TAXONOMY = {
    // =========================================================================
    // 1. EXECUTIVE LEADERSHIP (C-SUITE & FOUNDERS)
    // =========================================================================
    FOUNDER_CEO: {
      id: 'FOUNDER_CEO',
      title: 'Founder & Chief Executive Officer (CEO)',
      echelon: 'EXECUTIVE_LEADERSHIP',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Setting overall company vision, capital allocation, and market positioning',
        'Directing go-to-market execution, strategic partnerships, and enterprise client relations',
        'Driving sustainable unit economics, profitability, and compounding corporate valuation',
      ],
      aiAgentMapping: { name: 'Horizon', role: 'Autonomous Executive AI Strategist' },
      expectedImpact: 'Eliminates strategic misalignment and accelerates corporate decision velocity by 4x',
    },
    CHIEF_TECHNOLOGY_OFFICER: {
      id: 'CHIEF_TECHNOLOGY_OFFICER',
      title: 'Chief Technology Officer (CTO)',
      echelon: 'EXECUTIVE_LEADERSHIP',
      archetypeFit: ['B2B_SAAS', 'AI_TECH_STARTUP', 'DEVTOOLS', 'FINTECH'],
      coreResponsibilities: [
        'Architecting scalable cloud infrastructure, API gateways, and microservice topologies',
        'Ensuring 99.99% system uptime, zero-trust security postures, and technical compliance (SOC2/ISO)',
        'Managing developer productivity, CI/CD deployment velocity, and core IP roadmaps',
      ],
      aiAgentMapping: { name: 'Cypher', role: 'Autonomous Cloud & Technical Architecture Agent' },
      expectedImpact: 'Maintains enterprise-grade platform reliability and eliminates technical debt bottlenecks',
    },
    CHIEF_REVENUE_OFFICER: {
      id: 'CHIEF_REVENUE_OFFICER',
      title: 'Chief Revenue Officer (CRO)',
      echelon: 'EXECUTIVE_LEADERSHIP',
      archetypeFit: ['B2B_SAAS', 'MANUFACTURING_EXPORT', 'REAL_ESTATE', 'AGENCY'],
      coreResponsibilities: [
        'Unifying sales, marketing, and customer success pipelines into a predictable revenue engine',
        'Optimizing customer acquisition costs (CAC) against customer lifetime value (LTV)',
        'Designing tiered monetization schedules, enterprise contract terms, and pricing power',
      ],
      aiAgentMapping: { name: 'Julian Vance', role: 'Autonomous Revenue Operations & Margin Guardian' },
      expectedImpact: 'Maintains 80%+ gross margin discipline and eliminates pipeline revenue leakage',
    },
    CHIEF_MARKETING_OFFICER: {
      id: 'CHIEF_MARKETING_OFFICER',
      title: 'Chief Marketing Officer (CMO)',
      echelon: 'EXECUTIVE_LEADERSHIP',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Orchestrating multi-channel inbound customer acquisition and brand authority campaigns',
        'Allocating paid advertising budgets across Meta, Google, LinkedIn, and programmatic channels',
        'Directing brand storytelling, high-converting offer positioning, and viral social hooks',
      ],
      aiAgentMapping: { name: 'Sophia Sterling', role: 'Autonomous CMO & Multi-Channel Growth Director' },
      expectedImpact: 'Drives blended ROAS above 3.5x and establishes industry-leading brand recognition',
    },
    CHIEF_OPERATING_OFFICER: {
      id: 'CHIEF_OPERATING_OFFICER',
      title: 'Chief Operating Officer (COO)',
      echelon: 'EXECUTIVE_LEADERSHIP',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Streamlining cross-department workflows, fulfillment cycles, and SLA performance',
        'Eliminating manual friction and administrative overhead through automation',
        'Scaling operational capacity to support 10x customer volume without linear headcount growth',
      ],
      aiAgentMapping: { name: 'Nexus', role: 'Autonomous Workflow & Operations Engine' },
      expectedImpact: 'Reduces operational turnaround time by 65% across order fulfillment and client delivery',
    },

    // =========================================================================
    // 2. SALES, CLOSING & REVENUE OPERATIONS
    // =========================================================================
    INBOUND_PHONE_CLOSER: {
      id: 'INBOUND_PHONE_CLOSER',
      title: 'Inbound Speed-to-Lead Phone Closer / Senior Account Executive',
      echelon: 'SALES_REVENUE',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Calling new inbound form inquiries and demo requests within 45 seconds of submission',
        'Qualifying buyer budget, decision timeline, and specific pain points using consultative frameworks',
        'Locking in scheduled calendar consultations or closing payments on high-intent calls',
      ],
      aiAgentMapping: { name: 'Maya Vance', role: 'Sub-800ms Conversational AI Voice Closer' },
      expectedImpact: '390% increase in lead-to-opportunity conversion via sub-45 second speed-to-lead',
    },
    OUTBOUND_ENTERPRISE_SDR: {
      id: 'OUTBOUND_ENTERPRISE_SDR',
      title: 'Outbound Sales Development Representative (SDR / BDR)',
      echelon: 'SALES_REVENUE',
      archetypeFit: ['B2B_SAAS', 'MANUFACTURING_EXPORT', 'AGENCY', 'HEALTHCARE_B2B'],
      coreResponsibilities: [
        'Identifying and verifying target decision makers (CEOs, CTOs, VPs) across key target accounts',
        'Crafting bespoke, multi-touch cold email and LinkedIn sequences referencing their exact challenges',
        'Warming prospect domains and delivering 25-35 qualified executive meetings every month',
      ],
      aiAgentMapping: { name: 'Sarah Cole', role: 'Autonomous Multi-Source Outbound Prospecting SDR' },
      expectedImpact: 'Delivers 30+ qualified sales opportunities per month with zero manual research hours',
    },
    WHATSAPP_CONVERSATIONAL_SELLER: {
      id: 'WHATSAPP_CONVERSATIONAL_SELLER',
      title: 'Conversational Commerce & WhatsApp Sales Specialist',
      echelon: 'SALES_REVENUE',
      archetypeFit: ['D2C_ECOMMERCE', 'FINANCIAL_SERVICES_CHITFUND', 'LOCAL_HEALTHCARE', 'REAL_ESTATE'],
      coreResponsibilities: [
        'Engaging prospects directly on WhatsApp with sub-30 second personalized response times',
        'Dispatching interactive product catalogs, video walkthroughs, and secure payment links',
        'Recovering abandoned checkout carts and coordinating automated appointment confirmations',
      ],
      aiAgentMapping: { name: 'Aria', role: 'Omnichannel WhatsApp & Conversational Sales Agent' },
      expectedImpact: '98% message open rate and 42% cart abandonment recovery within 15 minutes',
    },
    SALES_DIRECTOR_MANAGER: {
      id: 'SALES_DIRECTOR_MANAGER',
      title: 'Sales Director & Team Pipeline Manager',
      echelon: 'SALES_REVENUE',
      archetypeFit: ['B2B_SAAS', 'REAL_ESTATE', 'MANUFACTURING_EXPORT', 'FINTECH'],
      coreResponsibilities: [
        'Conducting weekly pipeline velocity audits and identifying stagnant deal stages',
        'Equipping closing reps with counter-objection battlecards and competitor teardowns',
        'Forecasting quarterly revenue attainment with 95% forecast accuracy',
      ],
      aiAgentMapping: { name: 'Marcus Kane', role: 'Autonomous Sales Strategy & Deal Velocity Director' },
      expectedImpact: 'Shortens average enterprise sales cycles by 28 days and prevents pipeline slippage',
    },

    // =========================================================================
    // 3. STRATEGY, GROWTH & MARKET EXPANSION
    // =========================================================================
    LEAD_GROWTH_STRATEGIST: {
      id: 'LEAD_GROWTH_STRATEGIST',
      title: 'Lead Growth Strategist & GTM Architect',
      echelon: 'STRATEGY_GROWTH',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Analyzing competitive gaps, industry market trends, and untapped customer segments',
        'Architecting 30-day market entry, product launch, and high-velocity acquisition roadmaps',
        'Formulating differentiated value propositions that make competitors look outdated',
      ],
      aiAgentMapping: { name: 'Horizon', role: 'Autonomous Chief Strategy Officer' },
      expectedImpact: 'Identifies high-leverage growth vectors delivering 3x faster time-to-market',
    },
    BUSINESS_INTELLIGENCE_ANALYST: {
      id: 'BUSINESS_INTELLIGENCE_ANALYST',
      title: 'Business Intelligence Specialist & SWOT Analyst',
      echelon: 'STRATEGY_GROWTH',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Executing rigorous SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) on target markets',
        'Tracking buyer sentiment, macro economic indicators, and regulatory developments',
        'Translating complex behavioral telemetry into actionable revenue recommendations',
      ],
      aiAgentMapping: { name: 'Radar-AI', role: 'Autonomous Market Radar & SWOT Intelligence Engine' },
      expectedImpact: 'Detects market shifts and competitor threats 60 days before they impact pipeline',
    },

    // =========================================================================
    // 4. MARKETING, CREATIVE & MEDIA PRODUCTION
    // =========================================================================
    PAID_MEDIA_BUYER: {
      id: 'PAID_MEDIA_BUYER',
      title: 'Performance Marketing Manager & Paid Media Buyer (Meta & Google Ads)',
      echelon: 'MARKETING_CREATIVE',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Managing 24/7 campaign bidding, budget scaling, and server-side Conversions API (CAPI)',
        'Executing algorithmic kill rules on fatigue ad sets (2x Target CPA) and scaling winning creatives',
        'Testing multi-variant creative angles across Meta Reels, Google PMax, and YouTube Shorts',
      ],
      aiAgentMapping: { name: 'AdVance', role: 'Autonomous Paid Ads Budget & Bidding Optimizer' },
      expectedImpact: 'Lowers customer acquisition cost by 38% while scaling daily ad spend profitably',
    },
    VIRAL_REELS_DIRECTOR: {
      id: 'VIRAL_REELS_DIRECTOR',
      title: 'Viral Video & Short-Form Creative Director (Reels & TikTok)',
      echelon: 'MARKETING_CREATIVE',
      archetypeFit: ['D2C_ECOMMERCE', 'LOCAL_HEALTHCARE', 'RESTAURANT', 'GYM_FITNESS', 'REAL_ESTATE'],
      coreResponsibilities: [
        'Scripting high-retention 3-second pattern interrupts, tactile b-roll hooks, and visual storytelling',
        'Directing 9:16 vertical video compositions, kinetic typography captions, and audio timing',
        'Translating customer transformation stories into viral organic social assets',
      ],
      aiAgentMapping: { name: 'Studio-X', role: 'Autonomous 9:16 Kinetic Video Reel Director' },
      expectedImpact: 'Generates 50,000+ targeted monthly organic views with zero production studio fees',
    },
    DIRECT_RESPONSE_COPYWRITER: {
      id: 'DIRECT_RESPONSE_COPYWRITER',
      title: 'Senior Direct-Response Advertising Copywriter',
      echelon: 'MARKETING_CREATIVE',
      archetypeFit: ['ALL'],
      coreResponsibilities: [
        'Writing psychological headlines that stop scrolling and speak to burning consumer desires',
        'Drafting persuasive landing page copy, email sequences, and high-CTR ad text',
        'Employing proven frameworks: Pain-Agitate-Solve, Before-After-Bridge, and Social Proof Stacking',
      ],
      aiAgentMapping: { name: 'CopyPulse', role: 'Psychological Copy & Conversion Hook Specialist' },
      expectedImpact: 'Elevates ad click-through rates (CTR) from 0.8% to 2.8%+ across cold audiences',
    },
    SEO_AEO_AUTHORITY_SPECIALIST: {
      id: 'SEO_AEO_AUTHORITY_SPECIALIST',
      title: 'SEO & AI Search (AEO) Authority Specialist',
      echelon: 'MARKETING_CREATIVE',
      archetypeFit: ['B2B_SAAS', 'LOCAL_HEALTHCARE', 'HOME_SERVICES', 'REAL_ESTATE', 'EDTECH'],
      coreResponsibilities: [
        'Optimizing website structure for Google Search, ChatGPT, Perplexity, and Gemini Answer Engines',
        'Structuring JSON-LD Schema markup, FAQ blocks, and high-intent entity keywords',
        'Publishing authoritative domain content that captures high-intent organic search buyers',
      ],
      aiAgentMapping: { name: 'RankMaster', role: 'Search & Answer Engine Optimization (AEO) Agent' },
      expectedImpact: 'Secures primary AI Answer citations and drives top 3 rankings on high-intent searches',
    },

    // =========================================================================
    // 5. CUSTOMER SUCCESS, ONBOARDING & RETENTION
    // =========================================================================
    CUSTOMER_SUCCESS_MANAGER: {
      id: 'CUSTOMER_SUCCESS_MANAGER',
      title: 'Customer Success Manager (CSM) & Onboarding Specialist',
      echelon: 'OPERATIONS_SUPPORT',
      archetypeFit: ['B2B_SAAS', 'FINANCIAL_SERVICES_CHITFUND', 'EDTECH', 'HEALTHCARE'],
      coreResponsibilities: [
        'Guiding new clients through setup, account configuration, and fast time-to-first-value (<48h)',
        'Monitoring usage telemetry to detect disengagement or churn risk before renewal dates',
        'Facilitating account upgrades, expansion seats, and testimonial collection',
      ],
      aiAgentMapping: { name: 'ClientCare', role: 'Autonomous Client Retention & Onboarding Concierge' },
      expectedImpact: 'Increases net revenue retention (NRR) to 118% and slashes 90-day churn to under 2%',
    },

    // =========================================================================
    // 6. SPECIALIZED INDUSTRY ROLES (LOCAL, D2C, CLINICS, FINANCIAL, ETC.)
    // =========================================================================
    CLINIC_PATIENT_COORDINATOR: {
      id: 'CLINIC_PATIENT_COORDINATOR',
      title: 'Clinical Patient Care Coordinator & Appointment Manager',
      echelon: 'INDUSTRY_SPECIALISTS',
      archetypeFit: ['LOCAL_HEALTHCARE_DENTAL', 'WELLNESS'],
      coreResponsibilities: [
        'Answering dental/medical emergency inquiries within 30 seconds with calm, empathetic tone',
        'Explaining cosmetic and clinical treatment procedures, dental insurance, and EMI options',
        'Automating post-treatment follow-up check-ins and Google 5-star review collection',
      ],
      aiAgentMapping: { name: 'Maya Health', role: 'Empathetic Healthcare & Dental Appointment Specialist' },
      expectedImpact: '92% appointment show-up rate and 50+ new 5-star Google patient reviews monthly',
    },
    D2C_ABANDONED_CART_RECOVERY: {
      id: 'D2C_ABANDONED_CART_RECOVERY',
      title: 'D2C E-Commerce Cart Recovery & VIP Loyalty Concierge',
      echelon: 'INDUSTRY_SPECIALISTS',
      archetypeFit: ['D2C_ECOMMERCE_APPAREL', 'D2C_BEAUTY_SKINCARE'],
      coreResponsibilities: [
        'Triggering personalized WhatsApp recovery texts with product images 15 mins after cart abandonment',
        'Offering limited-time personalized bundle discounts and 1-click checkout links',
        'Executing post-delivery sizing check-ins and recommending seasonal drops based on past orders',
      ],
      aiAgentMapping: { name: 'ShopPulse', role: 'D2C Revenue Recovery & VIP Shopper Concierge' },
      expectedImpact: 'Recovers 22% of previously lost checkout carts within 4 hours',
    },
    CHIT_FUND_SCHEME_ADMINISTRATOR: {
      id: 'CHIT_FUND_SCHEME_ADMINISTRATOR',
      title: 'Regulated Chit Scheme Administrator & Investor Relations Agent',
      echelon: 'INDUSTRY_SPECIALISTS',
      archetypeFit: ['FINANCIAL_SERVICES_CHITFUND', 'FINTECH'],
      coreResponsibilities: [
        'Explaining RBI and State Chit Fund Act regulatory protections and dividend distribution models',
        'Notifying subscribers about monthly e-auction dates, winning bids, and prize money payouts',
        'Automating monthly installment UPI payment links, WhatsApp digital passbooks, and receipts',
      ],
      aiAgentMapping: { name: 'ChitFlow', role: 'Regulated Savings & Auction Administration Agent' },
      expectedImpact: 'Zero compliance disputes, 99.4% timely monthly collection rate across subscriber pools',
    },
    REAL_ESTATE_ACQUISITION_AGENT: {
      id: 'REAL_ESTATE_ACQUISITION_AGENT',
      title: 'Luxury Real Estate Client Concierge & Showing Coordinator',
      echelon: 'INDUSTRY_SPECIALISTS',
      archetypeFit: ['REAL_ESTATE_DEVELOPMENT'],
      coreResponsibilities: [
        'Instantly qualifying luxury property buyers on budget, financing pre-approval, and timeline',
        'Dispatching cinematic digital brochures, floorplans, and drone video walkthroughs on WhatsApp',
        'Coordinating private on-site developer viewings with calendar sync and VIP reminders',
      ],
      aiAgentMapping: { name: 'EstatesAI', role: 'Luxury Property Inbound Concierge & Showing Specialist' },
      expectedImpact: 'Connects high-net-worth investors to sales agents in under 60 seconds',
    },
    TRADE_LOGISTICS_EXPEDITER: {
      id: 'TRADE_LOGISTICS_EXPEDITER',
      title: 'International Trade Sourcing & Export Documentation Specialist',
      echelon: 'INDUSTRY_SPECIALISTS',
      archetypeFit: ['MANUFACTURING_EXPORT_IMPORT'],
      coreResponsibilities: [
        'Matching overseas verified buyers with domestic manufacturers based on HS codes and volume',
        'Generating proforma invoices, packing lists, certificate of origin, and customs filings',
        'Tracking ocean container bill of lading milestones and escrow letter of credit releases',
      ],
      aiAgentMapping: { name: 'TradePulse', role: 'Bilateral Export Clearance & Buyer Matchmaker' },
      expectedImpact: 'Reduces export compliance paperwork from 5 days to 20 minutes',
    },
  };

  /**
   * Dynamically Allocates an Authentic, Tailored AI Workforce Team
   * Based on the Crawled Company's Exact Category, Offerings, and Real-World Operational Gaps
   */
  static allocateDynamicTeam(category, businessModel, crawledData = {}, workspaceName = 'Enterprise') {
    const cleanCategory = (category || '').toLowerCase();
    const cleanModel = (businessModel || '').toUpperCase();
    const name = workspaceName || crawledData.businessName || 'Your Business';
    const detectedFeatures = crawledData.detectedFeatures || [];
    const pricing = crawledData.detectedPricing || [];

    // Determine primary operational archetype
    const isHealthcare = cleanCategory.includes('dental') || cleanCategory.includes('clinic') || cleanCategory.includes('healthcare') || cleanCategory.includes('doctor');
    const isD2C = cleanCategory.includes('apparel') || cleanCategory.includes('fashion') || cleanCategory.includes('skincare') || cleanCategory.includes('beauty') || cleanCategory.includes('clothing') || cleanCategory.includes('ecommerce');
    const isChitFund = cleanCategory.includes('chit') || cleanCategory.includes('micro-savings') || cleanCategory.includes('finance') || cleanCategory.includes('loan');
    const isRealEstate = cleanCategory.includes('real estate') || cleanCategory.includes('property') || cleanCategory.includes('penthouse') || cleanCategory.includes('realty');
    const isManufacturing = cleanCategory.includes('manufacturing') || cleanCategory.includes('export') || cleanCategory.includes('import') || cleanCategory.includes('trade');
    const isRestaurant = cleanCategory.includes('restaurant') || cleanCategory.includes('cafe') || cleanCategory.includes('dining') || cleanCategory.includes('food');
    const isHomeServices = cleanCategory.includes('hvac') || cleanCategory.includes('contractor') || cleanCategory.includes('plumb') || cleanCategory.includes('roof');
    const isGym = cleanCategory.includes('gym') || cleanCategory.includes('fitness') || cleanCategory.includes('wellness');
    const isEdtech = cleanCategory.includes('edtech') || cleanCategory.includes('coaching') || cleanCategory.includes('academy') || cleanCategory.includes('course');

    let allocatedRoles = [];
    let coreBottleneckSolved = '';
    let projectedMonthlyRoi = '';

    if (isHealthcare) {
      coreBottleneckSolved = 'Missed phone calls during clinical hours and patient hesitation over treatment costs';
      projectedMonthlyRoi = '₹3,50,000 – ₹8,00,000+ incremental patient lifetime value from automated show-ups & reviews';
      allocatedRoles = [
        {
          roleKey: 'CLINIC_PATIENT_COORDINATOR',
          title: 'Clinical Patient Coordinator (Maya Health)',
          purpose: `Answers inbound appointment inquiries for ${name} within 30s, explains procedures, and locks in booked chair time.`,
          monthlyEquivalentValue: '$3,200/mo Human Salary',
        },
        {
          roleKey: 'SEO_AEO_AUTHORITY_SPECIALIST',
          title: 'Local Clinic Authority & Google Reviews Specialist (RankMaster)',
          purpose: `Positions ${name} as the #1 verified clinic on Google Maps and automated post-visit 5-star review sequences.`,
          monthlyEquivalentValue: '$2,500/mo Agency Retainer',
        },
        {
          roleKey: 'PAID_MEDIA_BUYER',
          title: 'Cosmetic & Dental Lead Media Buyer (AdVance)',
          purpose: `Scales targeted local Meta & Google Search ads specifically for high-value treatments with zero ad budget waste.`,
          monthlyEquivalentValue: '$2,800/mo Media Buyer',
        },
        {
          roleKey: 'WHATSAPP_CONVERSATIONAL_SELLER',
          title: 'WhatsApp Treatment Plan Follow-up Concierge (Aria)',
          purpose: `Nurtures consultation patients who hesitated, sharing before/after smiles and flexible EMI payment options.`,
          monthlyEquivalentValue: '$1,800/mo Coordinator',
        },
        {
          roleKey: 'LEAD_GROWTH_STRATEGIST',
          title: 'Practice Revenue Strategist (Horizon)',
          purpose: `Analyzes patient retention, treatment profitability, and optimizes pricing tiers for maximum monthly clinic revenue.`,
          monthlyEquivalentValue: '$4,500/mo Consultant',
        },
      ];
    } else if (isD2C) {
      coreBottleneckSolved = 'Rising Meta advertising CPMs, ad creative fatigue, and high checkout cart abandonment';
      projectedMonthlyRoi = '4.2x – 6.8x Blended ROAS & 22% direct lift in checkout cart recovery';
      allocatedRoles = [
        {
          roleKey: 'VIRAL_REELS_DIRECTOR',
          title: 'Short-Form Video & Viral Hook Director (Studio-X)',
          purpose: `Generates 9:16 vertical video ad concepts highlighting ${name}'s unique fabric textures, styling, and unboxing appeal.`,
          monthlyEquivalentValue: '$4,000/mo Creative Director',
        },
        {
          roleKey: 'PAID_MEDIA_BUYER',
          title: 'Autonomous Meta & Google ROAS Media Buyer (AdVance)',
          purpose: `Executes 24/7 autonomous budget scaling, cutting fatigue adsets within 2h and scaling top-performing hooks.`,
          monthlyEquivalentValue: '$3,500/mo Media Buyer',
        },
        {
          roleKey: 'D2C_ABANDONED_CART_RECOVERY',
          title: 'WhatsApp Instant Cart Recovery Concierge (ShopPulse)',
          purpose: `Sends sub-15 minute conversational WhatsApp recovery messages with 1-click purchase links to shoppers who dropped off.`,
          monthlyEquivalentValue: '$2,200/mo Retention Specialist',
        },
        {
          roleKey: 'DIRECT_RESPONSE_COPYWRITER',
          title: 'Direct-Response Ad Copywriter (CopyPulse)',
          purpose: `Authors pattern-interrupt ad copy and urgency-driven promotional drops tailored to ${name}'s customer demographic.`,
          monthlyEquivalentValue: '$2,800/mo Copywriter',
        },
        {
          roleKey: 'CHIEF_REVENUE_OFFICER',
          title: 'D2C Unit Economics & Margin Guardian (Julian Vance)',
          purpose: `Monitors blended customer acquisition cost (CAC), return rates, and shipping margins to protect gross profitability.`,
          monthlyEquivalentValue: '$5,000/mo Fractional CFO',
        },
      ];
    } else if (isChitFund) {
      coreBottleneckSolved = 'Explaining state regulatory safety to new savers and managing manual monthly auction notifications';
      projectedMonthlyRoi = '₹15,00,000 – ₹50,00,000+ monthly scheme subscriptions pool growth with zero collection delays';
      allocatedRoles = [
        {
          roleKey: 'CHIT_FUND_SCHEME_ADMINISTRATOR',
          title: 'Regulated Chit Scheme Administrator (ChitFlow)',
          purpose: `Educates prospective subscribers on ${name}'s 100% RBI & State Chit Fund Act compliance, auction mechanics, and security.`,
          monthlyEquivalentValue: '$2,800/mo Scheme Officer',
        },
        {
          roleKey: 'INBOUND_PHONE_CLOSER',
          title: 'Inbound Scheme Phone Closer (Maya Vance)',
          purpose: `Answers calls from local merchants and families seeking monthly savings or emergency working capital in sub-45s.`,
          monthlyEquivalentValue: '$3,000/mo Financial Closer',
        },
        {
          roleKey: 'WHATSAPP_CONVERSATIONAL_SELLER',
          title: 'Auction & Digital Passbook Coordinator (Aria)',
          purpose: `Automates monthly auction announcements, winning bid disbursal updates, and 1-click UPI installment collection receipts.`,
          monthlyEquivalentValue: '$2,000/mo Collections Coordinator',
        },
        {
          roleKey: 'DIRECT_RESPONSE_COPYWRITER',
          title: 'High-Trust Financial Campaign Specialist (CopyPulse)',
          purpose: `Drafts regional trust-building ads contrasting safe government-registered chits against volatile market schemes.`,
          monthlyEquivalentValue: '$2,500/mo Copywriter',
        },
        {
          roleKey: 'CHIEF_OPERATING_OFFICER',
          title: 'Chit Compliance & Subscriber Operations Lead (Nexus)',
          purpose: `Streamlines KYC document verification, bank NEFT payouts, and regulatory reporting with zero manual paperwork.`,
          monthlyEquivalentValue: '$4,000/mo Operations Lead',
        },
      ];
    } else if (isRealEstate) {
      coreBottleneckSolved = 'High ad spend on low-intent window shoppers and lost broker follow-up on million-dollar buyer inquiries';
      projectedMonthlyRoi = '$45,000 – $180,000+ incremental commissions from sub-60s VIP buyer qualification';
      allocatedRoles = [
        {
          roleKey: 'REAL_ESTATE_ACQUISITION_AGENT',
          title: 'Luxury Property Inbound Concierge (EstatesAI)',
          purpose: `Connects with inbound property inquiries within 45s, pre-qualifying budget and financing readiness for ${name}.`,
          monthlyEquivalentValue: '$4,500/mo Senior Agent',
        },
        {
          roleKey: 'VIRAL_REELS_DIRECTOR',
          title: 'Cinematic Property Tour Video Director (Studio-X)',
          purpose: `Crafts cinematic vertical video reels highlighting architecture, penthouse views, and neighborhood lifestyle.`,
          monthlyEquivalentValue: '$3,500/mo Video Producer',
        },
        {
          roleKey: 'PAID_MEDIA_BUYER',
          title: 'High-Net-Worth Target Media Buyer (AdVance)',
          purpose: `Directs precision Meta & Google Search campaigns targeting affluent investors, NRI buyers, and relocating executives.`,
          monthlyEquivalentValue: '$3,800/mo Media Buyer',
        },
        {
          roleKey: 'WHATSAPP_CONVERSATIONAL_SELLER',
          title: 'VIP WhatsApp Brochure & Viewing Coordinator (Aria)',
          purpose: `Dispatches floorplans, pricing tiers, and coordinates calendar bookings for private developer showings.`,
          monthlyEquivalentValue: '$2,200/mo Showing Coordinator',
        },
        {
          roleKey: 'SALES_DIRECTOR_MANAGER',
          title: 'Brokerage Deal Pipeline Manager (Marcus Kane)',
          purpose: `Tracks escrow milestones, contract signatures, and prevents prospective home buyers from cooling off.`,
          monthlyEquivalentValue: '$5,500/mo Sales Director',
        },
      ];
    } else if (isManufacturing) {
      coreBottleneckSolved = 'Finding verified overseas buyers across target HS codes and lengthy customs documentation friction';
      projectedMonthlyRoi = '$35,000 – $150,000+ export order volume and 90% reduction in export document preparation hours';
      allocatedRoles = [
        {
          roleKey: 'TRADE_LOGISTICS_EXPEDITER',
          title: 'International Trade Sourcing & Export Specialist (TradePulse)',
          purpose: `Connects verified global buyers with ${name}'s product specifications across target HS codes and ports.`,
          monthlyEquivalentValue: '$4,800/mo Export Manager',
        },
        {
          roleKey: 'OUTBOUND_ENTERPRISE_SDR',
          title: 'Global Importer Outbound Specialist (Sarah Cole)',
          purpose: `Reaches overseas procurement directors and wholesale distributors with tailored FOB/CIF container proposals.`,
          monthlyEquivalentValue: '$3,500/mo B2B SDR',
        },
        {
          roleKey: 'INBOUND_PHONE_CLOSER',
          title: 'Technical Specification Closer (Maya Vance)',
          purpose: `Coordinates initial supplier inquiries, factory capability audits, and sample request shipments.`,
          monthlyEquivalentValue: '$3,800/mo Technical Closer',
        },
        {
          roleKey: 'CHIEF_OPERATING_OFFICER',
          title: 'Customs & Documentation Operations Lead (Nexus)',
          purpose: `Automates proforma invoices, bills of lading, certificates of origin, and trade letter of credit tracking.`,
          monthlyEquivalentValue: '$4,200/mo Logistics Lead',
        },
        {
          roleKey: 'CHIEF_REVENUE_OFFICER',
          title: 'Trade Finance & Margin Architect (Julian Vance)',
          purpose: `Guarantees container unit profitability and manages currency exchange hedging risks across cross-border accounts.`,
          monthlyEquivalentValue: '$5,000/mo Finance Officer',
        },
      ];
    } else {
      // Default / B2B SaaS & Enterprise Platforms
      coreBottleneckSolved = 'High customer acquisition costs, sluggish outbound sales pipelines, and long sales conversion cycles';
      projectedMonthlyRoi = '5.8x – 10.4x Qualified Pipeline Return on Investment within 60 days';
      allocatedRoles = [
        {
          roleKey: 'OUTBOUND_ENTERPRISE_SDR',
          title: 'Targeted Account SDR & Pipeline Hunter (Sarah Cole)',
          purpose: `Executes multi-touch outbound prospecting across VP and C-Level decision makers interested in ${name}.`,
          monthlyEquivalentValue: '$4,000/mo SDR Salary',
        },
        {
          roleKey: 'INBOUND_PHONE_CLOSER',
          title: 'Sub-800ms Enterprise Voice Closer (Maya Vance)',
          purpose: `Dials incoming trial sign-ups and demo inquiries within 45 seconds to secure technical evaluation calls.`,
          monthlyEquivalentValue: '$4,500/mo Senior AE',
        },
        {
          roleKey: 'CHIEF_MARKETING_OFFICER',
          title: 'Autonomous CMO & Demand Generation Director (Sophia Sterling)',
          purpose: `Architects high-converting Meta, LinkedIn, and Google campaigns highlighting ${name}'s verified differentiators.`,
          monthlyEquivalentValue: '$6,000/mo Fractional CMO',
        },
        {
          roleKey: 'DIRECT_RESPONSE_COPYWRITER',
          title: 'Conversion Rate & Narrative Copywriter (CopyPulse)',
          purpose: `Continuously tests comparison landing pages, email nurture sequences, and high-CTR ad angles.`,
          monthlyEquivalentValue: '$3,000/mo Copywriter',
        },
        {
          roleKey: 'CHIEF_REVENUE_OFFICER',
          title: 'Unit Economics & Pricing Guardian (Julian Vance)',
          purpose: `Audits customer acquisition cost (CAC) against lifetime value (LTV) and designs high-margin expansion tiers.`,
          monthlyEquivalentValue: '$5,500/mo CFO Advisor',
        },
      ];
    }

    const totalValue = allocatedRoles.reduce((acc, r) => {
      const match = r.monthlyEquivalentValue.match(/\$([0-9,]+)/);
      return acc + (match ? parseInt(match[1].replace(/,/g, ''), 10) : 3500);
    }, 0);

    return {
      categoryIdentified: category,
      businessModel: cleanModel,
      coreBottleneckSolved,
      projectedMonthlyRoi,
      teamMembersCount: allocatedRoles.length,
      monthlyHumanEquivalentCost: `$${totalValue.toLocaleString()}/mo in human staff`,
      vyuhoxAutonomousPlan: 'VYUHOX Autonomous AI Workforce (Zero Overhead • 24/7 Execution)',
      roles: allocatedRoles.map((r) => `${r.title}: ${r.purpose}`),
      teamMembers: allocatedRoles,
    };
  }

  /**
   * Retrieves the full encyclopedia of employee roles for Super Admin & Client Inspection
   */
  static getFullRolesEncyclopedia() {
    return Object.values(this.ROLES_TAXONOMY);
  }
}

export default EmployeeRoleBrain;
