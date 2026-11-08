import mongoose from 'mongoose';

const evolutionProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    liveProductionUrl: {
      type: String,
      trim: true,
      default: 'https://vyuhox.onrender.com',
    },
    stagingUrl: {
      type: String,
      trim: true,
      default: 'http://localhost:5000',
    },
    githubRepo: {
      type: String,
      trim: true,
      default: 'https://github.com/ValmikiDinesh/VYUHOX.git',
    },
    frontendDirectory: {
      type: String,
      trim: true,
      default: 'client',
    },
    backendDirectory: {
      type: String,
      trim: true,
      default: 'src',
    },
    technologyStack: {
      frontend: { type: String, default: 'React 19, Vite 8, Tailwind CSS, Lucide Icons, Socket.IO Client' },
      backend: { type: String, default: 'Node.js 20+, Express 4, Mongoose 8, Socket.IO Server' },
      database: { type: String, default: 'MongoDB Atlas Distributed Multi-Tenant Cluster' },
      aiModels: { type: String, default: 'Google Gemini 3.5 Flash / Flash-Lite / 3.8 Flash, Multi-Provider Fallback' },
      telephony: { type: String, default: 'Twilio, Bland AI, Exotel, Telnyx' },
      testing: { type: String, default: 'Playwright, Node Test Suite, Mocha/Chai AST Scanners' },
    },
    databaseInfo: {
      type: { type: String, default: 'MongoDB Atlas' },
      host: { type: String, default: 'vyuhox.hstarn5.mongodb.net' },
      collectionsCount: { type: Number, default: 33 },
      details: { type: String, default: 'Multi-tenant isolated workspaces with wallet transactions, audit logs, and lead indexes' },
    },
    apiDocumentation: {
      totalEndpoints: { type: Number, default: 110 },
      routePrefixes: {
        type: [String],
        default: [
          '/api/auth', '/api/workspaces', '/api/leads', '/api/wallet', '/api/strategy',
          '/api/scraper', '/api/messaging', '/api/webhooks', '/api/voice', '/api/social',
          '/api/ads', '/api/calendar', '/api/compliance', '/api/ai-company', '/api/billing',
          '/api/visual', '/api/integrations', '/api/briefings', '/api/public', '/api/microsite',
          '/api/seo-tools', '/api/sanjaya', '/api/support', '/api/evolution'
        ],
      },
      description: { type: String, default: 'RESTful JSON API with JWT Bearer auth, Workspace header tenancy, and Socket.IO real-time channels' },
    },
    projectDescription: {
      type: String,
      default: 'Full End-to-End Autonomous GTM SaaS Platform & Multi-Agent AI Product Evolution System',
    },
    businessModel: {
      type: String,
      default: 'B2B Multi-tenant SaaS with hybrid subscription plans (Tool Mode, AI Company Starter/Scale, Custom VIP) and usage-based wallet credits for telephony, SMS, ad spend, and AI inference',
    },
    targetCustomers: {
      type: String,
      default: 'B2B Enterprises, mid-market growth teams, digital marketing agencies, sales development teams, and founders seeking autonomous go-to-market pipelines',
    },
    currentFeatures: {
      type: [String],
      default: [
        'Omnichannel Outreach (WhatsApp, SMS, Email, Telegram)',
        'Autonomous Voice AI Agents (Speed-to-lead, Outbound Closer, Twilio/Bland/Exotel/Telnyx router)',
        'Autonomous Ads Manager & Self-Healing Campaigns (Meta & Google Ads)',
        'Autonomous Social Studio & Video Script Engine',
        'SEO & AEO Hub with Schema Generation and Digital PR Outreach',
        'AI Company C-Suite (AI CEO, CMO, CFO, SDR, Voice Closer, Customer Success)',
        'Global Compliance Engine (A2P 10DLC, DNC Registry, Secondary Domain Warmup, Calling Window Guards)',
        'Sanjaya Voice Commander & Universal Command Dock',
        'Multi-tenant Workspaces, Wallets, and Stripe/Razorpay Billing'
      ],
    },
    knownLimitations: {
      type: [String],
      default: [
        'Render free-tier cold-start latency on external web requests',
        'Playwright headless browser execution requires sufficient RAM on hosting VM',
        'Telephony carrier approval cycles (A2P 10DLC brand trust scores) require manual TCR approval'
      ],
    },
    devEnvironment: {
      type: String,
      default: 'Local Node.js 20+ ESM, Windows PowerShell, Vite Dev Server on port 5173, Express on port 5000',
    },
    deploymentEnvironment: {
      type: String,
      default: 'Render Web Service (vyuhox-platform.onrender.com), MongoDB Atlas Cloud, AWS S3 / CloudFront',
    },
    ownerEmail: {
      type: String,
      default: 'valmikidineshoffcl@gmail.com',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    activeCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvolutionCycle',
      default: null,
    },
  },
  { timestamps: true }
);

export const EvolutionProject = mongoose.model('EvolutionProject', evolutionProjectSchema);
export default EvolutionProject;
