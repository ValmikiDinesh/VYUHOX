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
    },
    // Master Provider Integrations
    integrations: {
      twilio: {
        accountSid: { type: String, default: 'AC_TWILIO_MASTER_PROD' },
        authToken: { type: String, default: 'auth_secret_master_token' },
        phoneNumber: { type: String, default: '+1 (800) 555-GTM1' },
        isActive: { type: Boolean, default: true },
      },
      blandAi: {
        apiKey: { type: String, default: 'org_bland_carrier_live_key' },
        isActive: { type: Boolean, default: true },
      },
      aisensy: {
        apiKey: { type: String, default: 'aisensy_live_token_7721' },
        businessNumber: { type: String, default: '+91 98765 43210' },
        isActive: { type: Boolean, default: true },
      },
      metaCloudApi: {
        phoneId: { type: String, default: '109283746591029' },
        accessToken: { type: String, default: 'EAAO...meta_token' },
        isActive: { type: Boolean, default: true },
      },
      instantlyEmail: {
        apiKey: { type: String, default: 'instantly_warmup_token_992' },
        provider: { type: String, default: 'Instantly.ai' },
        isActive: { type: Boolean, default: true },
      },
      sendgridSmtp: {
        apiKey: { type: String, default: 'SG.live_sendgrid_key_881' },
        fromEmail: { type: String, default: 'noreply@vyuhox.ai' },
        isActive: { type: Boolean, default: true },
      },
      razorpayIndia: {
        keyId: { type: String, default: 'rzp_live_vyuhox_in' },
        keySecret: { type: String, default: 'sec_razorpay_master' },
        isActive: { type: Boolean, default: true },
      },
      stripeGlobal: {
        publishableKey: { type: String, default: 'pk_live_vyuhox_global' },
        secretKey: { type: String, default: 'sk_live_stripe_master' },
        isActive: { type: Boolean, default: true },
      },
      deepseekLlm: {
        apiKey: { type: String, default: 'sk-deepseek-enterprise-key' },
        model: { type: String, default: 'deepseek-chat' },
        isActive: { type: Boolean, default: true },
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
      shortVideoEngine: {
        defaultBrollTheme: { type: String, default: 'cyber_crypto_matrix' },
        renderEngine: { type: String, default: 'HTML5_Canvas_Compositor' },
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
  },
  { timestamps: true }
);

export const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);
