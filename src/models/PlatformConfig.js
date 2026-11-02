import mongoose from 'mongoose';

const platformConfigSchema = new mongoose.Schema(
  {
    configKey: {
      type: String,
      default: 'GLOBAL_CONFIG',
      unique: true,
    },
    // Utility usage pricing (Direct Clients)
    usageRates: {
      voicePerMinuteUSD: { type: Number, default: 0.012 },
      voicePerMinuteINR: { type: Number, default: 1.0 },
      whatsappPerMessageUSD: { type: Number, default: 0.005 },
      whatsappPerMessageINR: { type: Number, default: 0.4 },
      smsPerMessageUSD: { type: Number, default: 0.0075 },
      smsPerMessageINR: { type: Number, default: 0.6 },
      emailPer1000USD: { type: Number, default: 0.8 },
      emailPer1000INR: { type: Number, default: 65.0 },
      enrichmentPerLeadUSD: { type: Number, default: 0.02 },
      enrichmentPerLeadINR: { type: Number, default: 1.65 },
      scrapingPerLeadUSD: { type: Number, default: 0.15 },
      scrapingPerLeadINR: { type: Number, default: 12.50 },
    },
    // Master Provider Integrations
    integrations: {
      exotel: {
        accountSid: { type: String, default: '' },
        apiKey: { type: String, default: '' },
        apiToken: { type: String, default: '' },
        callerId: { type: String, default: '+918047192837' },
        isActive: { type: Boolean, default: false },
      },
      telnyx: {
        apiKey: { type: String, default: '' },
        connectionId: { type: String, default: '' },
        callerId: { type: String, default: '+15129876543' },
        balanceUSD: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false },
      },
      twilio: {
        accountSid: { type: String, default: '' },
        authToken: { type: String, default: '' },
        phoneNumber: { type: String, default: '' },
        balanceUSD: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
        lastSyncedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: false },
      },
      blandAi: {
        apiKey: { type: String, default: '' },
        defaultVoiceId: { type: String, default: 'maya' },
        balanceUSD: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false },
      },
      aisensy: {
        apiKey: { type: String, default: '' },
        campaignName: { type: String, default: 'vyuhox_leads' },
        businessNumber: { type: String, default: '' },
        isActive: { type: Boolean, default: false },
      },
      metaCloudApi: {
        phoneId: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        isActive: { type: Boolean, default: false },
      },
      instantlyEmail: {
        apiKey: { type: String, default: '' },
        provider: { type: String, default: 'Instantly.ai' },
        isActive: { type: Boolean, default: false },
      },
      sendgridSmtp: {
        apiKey: { type: String, default: '' },
        fromEmail: { type: String, default: 'noreply@vyuhox.ai' },
        isActive: { type: Boolean, default: false },
      },
      razorpayIndia: {
        keyId: { type: String, default: '' },
        keySecret: { type: String, default: '' },
        isActive: { type: Boolean, default: false },
      },
      stripeGlobal: {
        publishableKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        isActive: { type: Boolean, default: false },
      },
      deepseekLlm: {
        apiKey: { type: String, default: '' },
        model: { type: String, default: 'deepseek-chat' },
        isActive: { type: Boolean, default: false },
      },
      geminiMaster: {
        apiKey: { type: String, default: '' },
        model: { type: String, default: 'gemini-1.5-pro' },
        isActive: { type: Boolean, default: false },
      },
      apollo: {
        apiKey: { type: String, default: '' },
        creditsRemaining: { type: Number, default: 0 },
        renewalDate: { type: String, default: '' },
        lastSyncedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: false },
      },
      outscraper: {
        apiKey: { type: String, default: '' },
        balanceUSD: { type: Number, default: 0 },
        freeTierRemaining: { type: Number, default: 500 },
        lastSyncedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: false },
      },
      bounceban: {
        apiKey: { type: String, default: '' },
        creditsRemaining: { type: Number, default: 0 },
        lastSyncedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: false },
      },
      apify: {
        apiToken: { type: String, default: '' },
        usageUsd: { type: Number, default: 0 },
        maxLimitUsd: { type: Number, default: 100.00 },
        lastSyncedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: false },
      },
      hunter: {
        apiKey: { type: String, default: '' },
        isActive: { type: Boolean, default: false },
      },

      // Visual Representation & Creative Tools (Canva, Google Flow, FLUX)
      canvaConnect: {
        clientId: { type: String, default: 'canva_live_app_vyuhox_prod' },
        clientSecret: { type: String, default: 'sec_canva_connect_partner' },
        designButtonEnabled: { type: Boolean, default: true },
        templateCategory: { type: String, default: 'Presentations & Social Ads' },
        isActive: { type: Boolean, default: true },
      },
      googleFlowWorkspace: {
        clientId: { type: String, default: 'apps.googleusercontent.com/vyuhox-slides' },
        apiKey: { type: String, default: 'AIzaSyGoogleSlidesApiKey_2026' },
        slidesApiEnabled: { type: Boolean, default: true },
        defaultTemplateId: { type: String, default: '1GTM_Strategy_PitchDeck_Theme' },
        isActive: { type: Boolean, default: true },
      },
      pollinationsVisualAi: {
        defaultModel: { type: String, default: 'flux' }, // 'flux' | 'flux-realism' | 'turbo'
        enableHdUpscaling: { type: Boolean, default: true },
        allowFreeUnlimited: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
      },
      dalleVisualAi: {
        apiKey: { type: String, default: '' },
        model: { type: String, default: 'dall-e-3' },
        quality: { type: String, default: 'standard' },
        isActive: { type: Boolean, default: false },
      },
      nanoBananaGpu: {
        apiKey: { type: String, default: '' },
        model: { type: String, default: 'sdxl-turbo' },
        isActive: { type: Boolean, default: true },
      },
      googleFlowVision: {
        apiKey: { type: String, default: '' },
        model: { type: String, default: 'imagen-3' },
        isActive: { type: Boolean, default: true },
      },
      falAiFlux: {
        apiKey: { type: String, default: '' },
        model: { type: String, default: 'fal-ai/flux-pro' },
        isActive: { type: Boolean, default: true },
      },
      shortVideoEngine: {
        defaultBrollTheme: { type: String, default: 'cyber_crypto_matrix' },
        renderEngine: { type: String, default: 'HTML5_Canvas_Compositor' },
        defaultVoiceId: { type: String, default: 'maya' },
        watermarkEnabled: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
      },
    },

    // Visual Tools Governance (Super Admin Controls for Client Workspaces)
    visualToolsGovernance: {
      enableCanvaForClients: { type: Boolean, default: true },
      enablePitchDecksForClients: { type: Boolean, default: true },
      enableVisualAiForClients: { type: Boolean, default: true },
      enableShortVideoForClients: { type: Boolean, default: true },
      maxAiImagesPerWorkspaceMonthly: { type: Number, default: 250 },
    },

    // Multi-LLM Master Gateway & Failover Cascade Architecture
    llmCascadeConfig: {
      providers: [
        {
          providerId: { type: String, enum: ['gemini', 'openai', 'groq', 'claude', 'deepseek'], default: 'gemini' },
          modelName: { type: String, default: 'gemini-1.5-flash' },
          apiKeys: [{ type: String }],
          priority: { type: Number, default: 1 }, // 1 = Primary, 2 = Secondary, 3 = Tertiary
          isActive: { type: Boolean, default: true },
          timeoutMs: { type: Number, default: 6000 },
          maxRetries: { type: Number, default: 2 },
        },
      ],
      activeExecutionMode: {
        type: String,
        enum: ['CASCADE_FAILOVER', 'ROUND_ROBIN', 'COST_OPTIMIZED'],
        default: 'CASCADE_FAILOVER',
      },
      lastFailoverEvent: {
        type: Object,
        default: null,
      },
    },

    // Autonomous FinOps & Cost-Plus Dynamic Margin Engine
    finOpsConfig: {
      autoMarginPricingEnabled: { type: Boolean, default: false },
      targetGrossMarginPercent: { type: Number, default: 80 }, // Guaranteed 80% margin
      wholesaleCostTracking: {
        geminiInputPerMillionUSD: { type: Number, default: 0.075 },
        geminiOutputPerMillionUSD: { type: Number, default: 0.30 },
        openAiInputPerMillionUSD: { type: Number, default: 0.15 },
        openAiOutputPerMillionUSD: { type: Number, default: 0.60 },
        blandCallingPerMinuteUSD: { type: Number, default: 0.09 },
        metaWhatsAppPerMsgINR: { type: Number, default: 0.75 },
        serverFixedOverheadMonthlyUSD: { type: Number, default: 40.0 },
      },
      priceIncreasePolicy: {
        type: String,
        enum: ['NEW_SIGNUPS_ONLY', 'NEXT_RENEWAL_WITH_30_DAYS_NOTICE', 'ANNUAL_ANNIVERSARY_ONLY'],
        default: 'NEW_SIGNUPS_ONLY',
      },
      lastCalculatedRecommendations: {
        calculatedAt: { type: Date },
        suggestedScrapingPerLeadUSD: { type: Number, default: 0.15 },
        suggestedScrapingPerLeadINR: { type: Number, default: 12.50 },
        suggestedVoicePerMinuteUSD: { type: Number, default: 0.35 },
        suggestedVoicePerMinuteINR: { type: Number, default: 29.0 },
        marginAchievedPercent: { type: Number, default: 85 },
      },
    },

    // Wholesale Provider Safety & Low-Balance Alert Thresholds
    wholesaleSafetyAlerts: {
      twilioMinUSD: { type: Number, default: 25.0 },
      outscraperMinUSD: { type: Number, default: 10.0 },
      bouncebanMinCredits: { type: Number, default: 1000 },
      apolloMinCredits: { type: Number, default: 500 },
      apifyMaxSpendPct: { type: Number, default: 85 }, // Alert if > 85% of monthly limit
      alertRecipientEmail: { type: String, default: 'admin@vyuhox.ai' },
      enableSoundAlarm: { type: Boolean, default: true },
    },

    // Master Emergency Circuit Breaker (Global Kill-Switch & Throttling)
    circuitBreakers: {
      pauseAllVoice: { type: Boolean, default: false },
      pauseAllScraping: { type: Boolean, default: false },
      pauseAllEmail: { type: Boolean, default: false },
      hourlyRateLimitPerWorkspace: { type: Number, default: 250 },
      reason: { type: String, default: '' },
      triggeredBy: { type: String, default: '' },
      triggeredAt: { type: Date, default: null },
    },

    // Tier-2 Global Regulatory Blacklist (Federal / High-Risk / TCPA Litigators)
    globalDncList: [
      {
        identifier: { type: String, required: true },
        type: { type: String, enum: ['DOMAIN', 'PHONE'], default: 'DOMAIN' },
        reason: { type: String, default: 'Federal / Regulatory Compliance' },
        addedBy: { type: String, default: 'SUPER_ADMIN' },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // Global Maintenance & Incident Broadcast Dispatcher
    globalAnnouncement: {
      active: { type: Boolean, default: false },
      message: { type: String, default: '' },
      severity: { type: String, enum: ['INFO', 'WARNING', 'MAINTENANCE'], default: 'INFO' },
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: String, default: 'SUPER_ADMIN' },
    },
  },
  { timestamps: true }
);

export const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);
