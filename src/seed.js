import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Workspace } from './models/Workspace.js';
import { User } from './models/User.js';
import { Lead } from './models/Lead.js';
import { Wallet } from './models/Wallet.js';
import { IntegrationConfig } from './models/IntegrationConfig.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';
import { DripSequence } from './models/DripSequence.js';
import { EmailSequenceService } from './services/messaging/EmailSequenceService.js';
import { CallLog } from './models/CallLog.js';
import { VoiceAgentConfig } from './models/VoiceAgentConfig.js';
import { SocialPost } from './models/SocialPost.js';
import { SocialAccountConfig } from './models/SocialAccountConfig.js';
import { Appointment } from './models/Appointment.js';
import { CalendarConfig } from './models/CalendarConfig.js';
import { DomainWarmup } from './models/DomainWarmup.js';
import { A2PRegistration } from './models/A2PRegistration.js';
import { DncRecord } from './models/DncRecord.js';
import { AgentActivityLog } from './models/AgentActivityLog.js';
import { CeoBriefing } from './models/CeoBriefing.js';

dotenv.config();

export const seedOmnichannelData = async (wsHedgeXId, wsApexId) => {
  try {
    const convCount = await Conversation.countDocuments();
    if (convCount > 0) return;

    console.log('[Seed] Seeding Omnichannel Communications Hub (Conversations, Messages, Drip Sequences)...');

    const hedgeLeads = await Lead.find({ workspaceId: wsHedgeXId });
    if (!hedgeLeads || hedgeLeads.length === 0) return;

    const elena = hedgeLeads.find((l) => l.name.includes('Elena')) || hedgeLeads[0];
    const marcus = hedgeLeads.find((l) => l.name.includes('Marcus')) || hedgeLeads[1];
    const david = hedgeLeads.find((l) => l.name.includes('David')) || hedgeLeads[2];
    const sarah = hedgeLeads.find((l) => l.name.includes('Sarah')) || hedgeLeads[3];

    // 1. Thread with Elena Rostova (WhatsApp, High Intent)
    if (elena) {
      const c1 = await Conversation.create({
        workspaceId: wsHedgeXId,
        leadId: elena._id,
        activeChannel: 'WHATSAPP',
        lastMessageSnippet: "Hello! Yes, we are actively looking for algorithmic partners. What's the pricing and can we schedule a demo call this Friday?",
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 12),
        unreadCount: 1,
        sentiment: 'HIGH_INTENT',
        aiSummary: 'Lead requested direct commercial pricing and demo schedule for Friday.',
        autoReplyEnabled: true,
      });

      await Message.create([
        {
          conversationId: c1._id,
          workspaceId: wsHedgeXId,
          leadId: elena._id,
          direction: 'OUTBOUND',
          channel: 'WHATSAPP',
          senderName: 'Growth AE (You)',
          content: 'Hi Elena, noticed Vanguard Alpha Fund is scaling multi-exchange arbitrage. HedgeX deploys sub-millisecond liquidity provision models. Open to seeing our live Sharpe ratio metrics?',
          status: 'READ',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          conversationId: c1._id,
          workspaceId: wsHedgeXId,
          leadId: elena._id,
          direction: 'INBOUND',
          channel: 'WHATSAPP',
          senderName: 'Elena Rostova',
          content: "Hello! Yes, we are actively looking for algorithmic partners. What's the pricing and can we schedule a demo call this Friday?",
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 1000 * 60 * 12),
          metadata: { sentiment: 'HIGH_INTENT', confidence: 0.95 },
        },
      ]);
    }

    // 2. Thread with Marcus Sterling (Telegram, High Intent)
    if (marcus) {
      const c2 = await Conversation.create({
        workspaceId: wsHedgeXId,
        leadId: marcus._id,
        activeChannel: 'TELEGRAM',
        lastMessageSnippet: 'Hey team, this caught my eye. Do you have institutional security audits completed by CertiK or OpenZeppelin? Send over contract terms.',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 45),
        unreadCount: 1,
        sentiment: 'HIGH_INTENT',
        aiSummary: 'Lead requested institutional smart contract security audits and SLA contract terms.',
        autoReplyEnabled: true,
      });

      await Message.create([
        {
          conversationId: c2._id,
          workspaceId: wsHedgeXId,
          leadId: marcus._id,
          direction: 'OUTBOUND',
          channel: 'TELEGRAM',
          senderName: 'Growth AE (You)',
          content: 'Marcus, great to connect. Saw your fund recent thesis on DEX liquidity pools. We automated high-velocity order routing for institutional capital.',
          status: 'READ',
          createdAt: new Date(Date.now() - 1000 * 60 * 180),
        },
        {
          conversationId: c2._id,
          workspaceId: wsHedgeXId,
          leadId: marcus._id,
          direction: 'INBOUND',
          channel: 'TELEGRAM',
          senderName: 'Marcus Sterling',
          content: 'Hey team, this caught my eye. Do you have institutional security audits completed by CertiK or OpenZeppelin? Send over contract terms.',
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 1000 * 60 * 45),
          metadata: { sentiment: 'HIGH_INTENT', confidence: 0.92 },
        },
      ]);
    }

    // 3. Thread with David Chen (SMS, Objection)
    if (david) {
      const c3 = await Conversation.create({
        workspaceId: wsHedgeXId,
        leadId: david._id,
        activeChannel: 'SMS',
        lastMessageSnippet: 'Our quant team looked at the rate card. Pricing seems too expensive compared to our current internal setup right now.',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 95),
        unreadCount: 1,
        sentiment: 'OBJECTION',
        aiSummary: 'Pricing objection raised compared to internal infrastructure costs.',
        autoReplyEnabled: true,
      });

      await Message.create([
        {
          conversationId: c3._id,
          workspaceId: wsHedgeXId,
          leadId: david._id,
          direction: 'OUTBOUND',
          channel: 'SMS',
          senderName: 'Growth AE (You)',
          content: 'David, following up on your BlockPulse inquiry regarding API latency. Ready to run a test execution batch on our testnet?',
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 1000 * 60 * 240),
        },
        {
          conversationId: c3._id,
          workspaceId: wsHedgeXId,
          leadId: david._id,
          direction: 'INBOUND',
          channel: 'SMS',
          senderName: 'David Chen',
          content: 'Our quant team looked at the rate card. Pricing seems too expensive compared to our current internal setup right now.',
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 1000 * 60 * 95),
          metadata: { sentiment: 'OBJECTION', confidence: 0.91 },
        },
      ]);
    }

    // 4. Thread with Sarah Jenkins (Email, General Inquiry)
    if (sarah) {
      const c4 = await Conversation.create({
        workspaceId: wsHedgeXId,
        leadId: sarah._id,
        activeChannel: 'EMAIL',
        lastMessageSnippet: 'Hi there, how does your compliance framework align with Swiss FINMA regulatory standards?',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 180),
        unreadCount: 0,
        sentiment: 'GENERAL_INQUIRY',
        aiSummary: 'Compliance inquiry regarding Swiss FINMA banking integration standards.',
        autoReplyEnabled: true,
      });

      await Message.create([
        {
          conversationId: c4._id,
          workspaceId: wsHedgeXId,
          leadId: sarah._id,
          direction: 'OUTBOUND',
          channel: 'EMAIL',
          senderName: 'Growth AE (You)',
          content: 'Hi Sarah, wanted to introduce our autonomous execution engine built for family offices and institutional wealth managers.',
          status: 'SENT',
          createdAt: new Date(Date.now() - 1000 * 60 * 360),
        },
        {
          conversationId: c4._id,
          workspaceId: wsHedgeXId,
          leadId: sarah._id,
          direction: 'INBOUND',
          channel: 'EMAIL',
          senderName: 'Sarah Jenkins',
          content: 'Hi there, how does your compliance framework align with Swiss FINMA regulatory standards?',
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 1000 * 60 * 240),
          metadata: { sentiment: 'GENERAL_INQUIRY', confidence: 0.89 },
        },
        {
          conversationId: c4._id,
          workspaceId: wsHedgeXId,
          leadId: sarah._id,
          direction: 'OUTBOUND',
          channel: 'EMAIL',
          senderName: 'Growth AE (You)',
          content: 'Hi Sarah, excellent question. We operate under strict FINMA-compliant custodial segregation. Attaching our regulatory whitepaper for your legal counsel.',
          status: 'SENT',
          createdAt: new Date(Date.now() - 1000 * 60 * 180),
        },
      ]);
    }

    // 5. Default Drip Sequences
    await DripSequence.create([
      {
        workspaceId: wsHedgeXId,
        name: 'SaaS Founder Outbound Drip',
        channel: 'EMAIL',
        steps: EmailSequenceService.getDefaultSequenceTemplates('HedgeX Capital'),
        activeLeadIds: elena ? [elena._id] : [],
        status: 'ACTIVE',
      },
      {
        workspaceId: wsHedgeXId,
        name: 'VIP Client Reactivation',
        channel: 'WHATSAPP',
        steps: [
          {
            stepNumber: 1,
            delayDays: 1,
            subject: 'VIP WhatsApp Check-in',
            bodyTemplate: 'Hi {{name}}, we just released our Q3 high-velocity liquidity benchmarks. Thought of {{company}} immediately. Want a 3-min walkthrough?',
          },
          {
            stepNumber: 2,
            delayDays: 4,
            subject: 'Executive Briefing',
            bodyTemplate: 'Hi {{name}}, sharing our institutional custody framework. Would love 10 minutes on your calendar: https://cal.com/hedgex/vip',
          },
        ],
        activeLeadIds: marcus ? [marcus._id] : [],
        status: 'ACTIVE',
      },
    ]);

    console.log('[Seed] Omnichannel Communications Hub seeded with 4 live threads & drip sequences!');
  } catch (err) {
    console.error('[Seed Omnichannel Error]:', err);
  }
};

export const seedVoiceStudioData = async (wsHedgeXId) => {
  try {
    const callCount = await CallLog.countDocuments({ workspaceId: wsHedgeXId });
    if (callCount > 0) return;

    console.log('[Seed] Seeding Sub-Second Voice AI Studio (Agents, Logs, Call Transcripts)...');

    // 1. Create or ensure VoiceAgentConfig
    await VoiceAgentConfig.findOneAndUpdate(
      { workspaceId: wsHedgeXId },
      {
        workspaceId: wsHedgeXId,
        agentName: 'Maya - Autonomous SDR',
        voicePersona: {
          tone: 'Consultative',
          accent: 'US Professional',
          voiceId: 'bland_nat_maya_01',
          speed: 1.0,
          temperature: 0.7,
        },
        systemPrompt:
          'You are Maya, an elite high-intent SDR at HedgeX Algorithmic Capital. Your goal is to qualify the executive lead within 2 minutes, verify their growth bottlenecks, and secure a confirmed slot on our senior partner calendar at https://cal.com/hedgex/discovery-call.',
        qualificationQuestions: [
          'What is your primary quantitative execution bottleneck right now?',
          'What target capital allocation or volume are you aiming for this quarter?',
          'Who besides yourself makes technical and institutional security decisions?',
        ],
        calendarBookingUrl: 'https://cal.com/hedgex/discovery-call',
        speedToLeadEnabled: true,
        speedToLeadDelaySeconds: 45,
        minLeadScoreForCall: 70,
        minPortfolioUSD: 10000,
        transferPhoneNumber: '+1 (415) 555-0199',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const hedgeLeads = await Lead.find({ workspaceId: wsHedgeXId });
    const elena = hedgeLeads.find((l) => l.name.includes('Elena')) || hedgeLeads[0];
    const marcus = hedgeLeads.find((l) => l.name.includes('Marcus')) || hedgeLeads[1];
    const david = hedgeLeads.find((l) => l.name.includes('David')) || hedgeLeads[2];

    const audioSampleUrl = '/audio/sample_recording.wav';

    // 2. Call 1: High-Intent Speed-to-Lead Completed Call with Elena Rostova
    if (elena) {
      await CallLog.create({
        workspaceId: wsHedgeXId,
        leadId: elena._id,
        callId: `bland_rec_${Date.now()}_01`,
        direction: 'OUTBOUND',
        fromNumber: '+1 (800) 555-0199',
        toNumber: elena.phone || '+1 (415) 890-2234',
        status: 'completed',
        durationSeconds: 142,
        recordingUrl: '/audio/call_elena.wav',
        transcript: [
          {
            role: 'system',
            content: 'Speed-to-Lead triggered automated outbound call (<45s latency target). Lead score: 94/100.',
            timestamp: new Date(Date.now() - 1000 * 60 * 35),
          },
          {
            role: 'assistant',
            content:
              'Hi Elena! This is Maya from HedgeX Algorithmic Capital. I noticed Vanguard Alpha Fund is scaling multi-exchange arbitrage. Do you have a couple minutes to review our latency benchmarks?',
            timestamp: new Date(Date.now() - 1000 * 60 * 34),
          },
          {
            role: 'user',
            content:
              'Hi Maya! Yes, we actually have been evaluating quantitative market makers this month. What Sharpe ratio are your live algorithms achieving?',
            timestamp: new Date(Date.now() - 1000 * 60 * 32),
          },
          {
            role: 'assistant',
            content:
              'Our high-velocity liquidity models achieved an annualized Sharpe of 3.82 across Q2. We can configure institutional custody with Spearbit audits.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            role: 'user',
            content:
              'That is impressive. Can we lock in a 15-minute technical walkthrough this Friday at 3 PM EST?',
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
          },
          {
            role: 'assistant',
            content:
              'Absolutely, Elena. I have locked in Friday 3 PM EST on our partner calendar. Sending the confirmation and audit dossier now.',
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
          },
        ],
        aiSummary:
          'Elena confirmed high intent for multi-exchange algorithmic liquidity. Secured 15-minute technical walkthrough for Friday 3 PM EST. Spearbit audit requested.',
        actionItems: ['Send Google Calendar invite for Friday 3pm', 'Share Spearbit institutional audit report'],
        sentiment: 'HIGH_INTENT',
        sentimentScore: 96,
        speedToLeadTriggered: true,
        startedAt: new Date(Date.now() - 1000 * 60 * 35),
        endedAt: new Date(Date.now() - 1000 * 60 * 32),
        metadata: { provider: 'BLAND_AI_CARRIER', latencyMs: 680 },
      });
    }

    // 3. Call 2: Taken Over / Transferred Call with David Chen (Human Rep Intervention)
    if (david) {
      await CallLog.create({
        workspaceId: wsHedgeXId,
        leadId: david._id,
        callId: `bland_rec_${Date.now()}_02`,
        direction: 'OUTBOUND',
        fromNumber: '+1 (800) 555-0199',
        toNumber: david.phone || '+1 (650) 332-9901',
        status: 'transferred',
        durationSeconds: 195,
        recordingUrl: '/audio/call_david.wav',
        takenOver: true,
        takenOverBy: 'Nanda Sai (Lead AE)',
        whisperHistory: [
          {
            message: 'David raised price objection. Offer tier-2 volume rebate.',
            timestamp: new Date(Date.now() - 1000 * 60 * 70),
          },
        ],
        transcript: [
          {
            role: 'assistant',
            content:
              'Hello David, Maya here from HedgeX following up on your BlockPulse quantitative inquiry. Are you open to reviewing our API execution latency?',
            timestamp: new Date(Date.now() - 1000 * 60 * 75),
          },
          {
            role: 'user',
            content:
              'The latency looks decent, but our quants are concerned the onboarding fee is too steep compared to building in-house.',
            timestamp: new Date(Date.now() - 1000 * 60 * 72),
          },
          {
            role: 'system',
            content: '🤫 [Rep Whisper Coach]: "David raised price objection. Offer tier-2 volume rebate."',
            timestamp: new Date(Date.now() - 1000 * 60 * 70),
          },
          {
            role: 'assistant',
            content:
              'Understood David. For high-frequency partners trading above 50,000 lots, we provide a dedicated volume tier that reduces per-trade overhead by 42%.',
            timestamp: new Date(Date.now() - 1000 * 60 * 68),
          },
          {
            role: 'system',
            content: '⚡ Human Rep (Nanda Sai) took over the live call session. Transferred audio stream to headset.',
            timestamp: new Date(Date.now() - 1000 * 60 * 65),
          },
          {
            role: 'human_rep',
            content:
              'Hey David, Nanda here jumping on with Maya. I can personally approve the tier-2 rebate for BlockPulse if we finalize the pilot this week.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
          },
          {
            role: 'user',
            content: 'That completely changes the numbers. Let us review the contract addendum.',
            timestamp: new Date(Date.now() - 1000 * 60 * 55),
          },
        ],
        aiSummary:
          'Price objection handled effectively via live Rep takeover. Agreed to review tier-2 contract addendum.',
        actionItems: ['Prepare Tier-2 Rebate Addendum', 'Send onboarding NDA'],
        sentiment: 'HIGH_INTENT',
        sentimentScore: 89,
        startedAt: new Date(Date.now() - 1000 * 60 * 75),
        endedAt: new Date(Date.now() - 1000 * 60 * 71),
        metadata: { provider: 'BLAND_AI_CARRIER', latencyMs: 710 },
      });
    }

    // 4. Call 3: Technical Inquiry Call with Marcus Sterling
    if (marcus) {
      await CallLog.create({
        workspaceId: wsHedgeXId,
        leadId: marcus._id,
        callId: `bland_rec_${Date.now()}_03`,
        direction: 'OUTBOUND',
        fromNumber: '+1 (800) 555-0199',
        toNumber: marcus.phone || '+44 20 7946 0912',
        status: 'completed',
        durationSeconds: 110,
        recordingUrl: '/audio/call_marcus.wav',
        transcript: [
          {
            role: 'assistant',
            content:
              'Marcus, hello! Maya from HedgeX. Reaching out regarding Aetherium Ventures thesis on decentralized liquidity routing.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
          },
          {
            role: 'user',
            content:
              'Good timing. We need institutional custody proof before we can allocate capital to external algorithmic liquidity pools.',
            timestamp: new Date(Date.now() - 1000 * 60 * 115),
          },
          {
            role: 'assistant',
            content:
              'We integrate multi-party computation with Fireblocks and carry full ISO27001 certification. I can send the custody architecture whitepaper.',
            timestamp: new Date(Date.now() - 1000 * 60 * 110),
          },
          {
            role: 'user',
            content: 'Send that over to my email. If compliance signs off, we will schedule a partners sync.',
            timestamp: new Date(Date.now() - 1000 * 60 * 105),
          },
        ],
        aiSummary: 'Institutional custody inquiry. Fireblocks MPC whitepaper dispatched for compliance review.',
        actionItems: ['Email Fireblocks MPC Architecture Deck'],
        sentiment: 'POSITIVE',
        sentimentScore: 84,
        startedAt: new Date(Date.now() - 1000 * 60 * 120),
        endedAt: new Date(Date.now() - 1000 * 60 * 118),
        metadata: { provider: 'BLAND_AI_CARRIER', latencyMs: 650 },
      });
    }

    console.log('[Seed] Voice AI Studio seeded with Maya SDR Persona & 3 rich historical call logs!');
  } catch (err) {
    console.error('[Seed Voice Studio Error]:', err);
  }
};

export const seedSocialStudioData = async (wsHedgeXId) => {
  try {
    const postCount = await SocialPost.countDocuments({ workspaceId: wsHedgeXId });
    if (postCount > 0) return;

    console.log('[Seed] Seeding Social Media Studio (Account Config, Reels, Carousels, Schedule)...');

    // 1. Social Account Configuration
    await SocialAccountConfig.findOneAndUpdate(
      { workspaceId: wsHedgeXId },
      {
        workspaceId: wsHedgeXId,
        brandVoice: {
          tone: 'Authoritative, Data-Driven & Visionary',
          style: 'Punchy hooks, high-energy cadence, zero corporate fluff',
          targetAudience: 'Founders, quantitative traders, and GTM leaders',
          keywords: ['Autonomous GTM', 'Algorithmic Scale', 'Sub-second Voice AI', 'Liquidity Routing'],
        },
        defaultHashtags: ['#QuantTrading', '#CryptoAlpha', '#AlgorithmicTrading', '#DeFiExecution', '#GTMStrategy'],
        autopilotEnabled: true,
        publishingMode: 'AUTOPILOT',
        connectedAccounts: {
          instagram: { connected: true, username: '@hedgex.capital', followers: 18400 },
          tiktok: { connected: true, username: '@hedgex_alpha', followers: 42100 },
          youtube: { connected: true, channelName: 'HedgeX Quantitative Intelligence', subscribers: 9800 },
          twitter: { connected: true, handle: '@HedgeXCapital', followers: 31200 },
          linkedin: { connected: true, companyName: 'HedgeX Algorithmic Capital', followers: 14700 },
        },
      },
      { upsert: true, new: true }
    );

    // 2. Reel 1: Live Published on Instagram (High Engagement)
    await SocialPost.create({
      workspaceId: wsHedgeXId,
      platform: 'INSTAGRAM',
      type: 'REEL',
      title: 'Why 99% of algorithmic funds bleed alpha on execution latency',
      scriptHook: "Stop manually checking order books. You're losing 18 basis points on every single cross-exchange trade.",
      scriptBody: "High-frequency arbitrage isn't about guessing direction—it's about execution velocity. While legacy funds wait for human traders to approve block orders, autonomous execution algorithms bridge Binance, OKX, and Bybit in sub-600 milliseconds with institutional Fireblocks custody. In Q2 alone, automated latency routing prevented over $4.2 million in slippage.",
      scriptCta: "Drop the word 'ALPHA' below and I'll send you our institutional low-latency execution framework for free.",
      timedCaptions: [
        { start: 0.4, end: 1.8, text: 'STOP MANUALLY CHECKING ORDER', words: [{ word: 'STOP', start: 0.4, end: 0.7 }, { word: 'MANUALLY', start: 0.7, end: 1.1 }, { word: 'CHECKING', start: 1.1, end: 1.4 }, { word: 'ORDER', start: 1.4, end: 1.8 }] },
        { start: 1.8, end: 3.2, text: 'BOOKS LOSING 18 BASIS POINTS', words: [{ word: 'BOOKS', start: 1.8, end: 2.1 }, { word: 'LOSING', start: 2.1, end: 2.5 }, { word: '18', start: 2.5, end: 2.8 }, { word: 'BASIS', start: 2.8, end: 3.0 }, { word: 'POINTS', start: 3.0, end: 3.2 }] },
        { start: 3.2, end: 5.0, text: 'ON EVERY CROSS-EXCHANGE TRADE', words: [{ word: 'ON', start: 3.2, end: 3.5 }, { word: 'EVERY', start: 3.5, end: 3.9 }, { word: 'CROSS-EXCHANGE', start: 3.9, end: 4.5 }, { word: 'TRADE', start: 4.5, end: 5.0 }] },
      ],
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-graphs-and-numbers-31911-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop',
      audioUrl: '/audio/call_elena.wav',
      caption: "🔥 Stop manually checking order books. You're losing 18 basis points on every single cross-exchange trade.\n\nHigh-frequency arbitrage isn't about guessing direction—it's about execution velocity.\n\n👉 Drop the word 'ALPHA' below and I'll send you our institutional low-latency framework for free.\n\n#CryptoTrading #QuantFinance #AlgorithmicTrading #Web3Alpha",
      hashtags: ['#CryptoTrading', '#QuantFinance', '#AlgorithmicTrading', '#Web3Alpha', '#DeFiExecution'],
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5.8),
      status: 'PUBLISHED',
      publishingMode: 'AUTOPILOT',
      metrics: {
        views: 18450,
        likes: 1420,
        shares: 382,
        comments: 94,
        reach: 24600,
      },
    });

    // 3. Reel 2: Live Published on TikTok (Viral Growth)
    await SocialPost.create({
      workspaceId: wsHedgeXId,
      platform: 'TIKTOK',
      type: 'REEL',
      title: 'Sub-Second Voice AI for High-Net-Worth Inbound Allocators',
      scriptHook: "If your fund doesn't have an AI agent taking calls in under 45 seconds, you're lighting LP capital on fire.",
      scriptBody: "When an institutional allocator requests an audit dossier at 2 AM, they don't wait for your London desk. Maya qualifies their AUM, verifies their multi-sig setup, and locks in Friday 3 PM EST on our partner calendar.",
      scriptCta: "Comment 'SCALE' to see our live sub-second Bland AI dialer in action.",
      timedCaptions: [
        { start: 0.3, end: 1.6, text: 'IF YOUR FUND DOESNT', words: [{ word: 'IF', start: 0.3, end: 0.6 }, { word: 'YOUR', start: 0.6, end: 0.9 }, { word: 'FUND', start: 0.9, end: 1.2 }, { word: 'DOESNT', start: 1.2, end: 1.6 }] },
        { start: 1.6, end: 3.1, text: 'HAVE AN AI CALL AGENT', words: [{ word: 'HAVE', start: 1.6, end: 1.9 }, { word: 'AN', start: 1.9, end: 2.2 }, { word: 'AI', start: 2.2, end: 2.5 }, { word: 'CALL', start: 2.5, end: 2.8 }, { word: 'AGENT', start: 2.8, end: 3.1 }] },
      ],
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-neon-illuminated-tunnel-31853-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      audioUrl: '/audio/call_harrison.wav',
      caption: "⚡ Sub-second Voice AI dials high-intent institutional allocators in <45s.\n\nComment 'SCALE' for early beta access.\n\n#HedgeFund #CryptoInvesting #AIAutomation #VoiceAI",
      hashtags: ['#HedgeFund', '#CryptoInvesting', '#AIAutomation', '#VoiceAI', '#FinTech'],
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 27.9),
      status: 'PUBLISHED',
      publishingMode: 'AUTOPILOT',
      metrics: {
        views: 42300,
        likes: 3890,
        shares: 890,
        comments: 245,
        reach: 56100,
      },
    });

    // 4. Carousel Post: Scheduled on LinkedIn (Tomorrow 10:30 AM)
    await SocialPost.create({
      workspaceId: wsHedgeXId,
      platform: 'LINKEDIN',
      type: 'CAROUSEL',
      title: 'The 3 Latency Traps Killing Crypto Fund Alpha (5-Slide Deck)',
      carouselSlides: [
        { slideNumber: 1, headline: 'The 3 Latency Traps Killing Crypto Fund Alpha', subtext: 'Why your manual execution desk is leaking up to 18 bps per block order.', statCallout: '18 bps / trade', visualTheme: 'dark-emerald-glow' },
        { slideNumber: 2, headline: 'Trap 1: Cross-Exchange Routing Lag', subtext: 'By the time Binance fills, Bybit pricing has already moved. Human approval adds 4-12 seconds of toxic slippage.', statCallout: '4-12s Delay', visualTheme: 'cyber-dark' },
        { slideNumber: 3, headline: 'Trap 2: Fragmented Liquidity Pools', subtext: 'Decentralized liquidity requires instantaneous sub-second routing across 12+ venues simultaneously.', statCallout: '<680ms Target', visualTheme: 'deep-blue-matrix' },
        { slideNumber: 4, headline: 'The Fix: Autonomous Execution Mesh', subtext: 'Our algorithmic pipeline routes liquidity programmatically with Spearbit-audited Fireblocks multi-party custody.', statCallout: '3.82 Sharpe Q2', visualTheme: 'emerald-gradient' },
        { slideNumber: 5, headline: 'Ready to benchmark your fund latency?', subtext: 'Comment "ARBITRAGE" or click link in bio to receive the full institutional Q3 benchmark dossier.', statCallout: 'FREE DOSSIER', visualTheme: 'call-to-action-neon' },
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      caption: "🚀 The 3 Latency Traps Killing Crypto Fund Alpha.\n\nSwipe through for the complete breakdown 👉\n\n• Slide 1: Executive Summary\n• Slide 2: Cross-Exchange Lag\n• Slide 3: Fragmented Pools\n• Slide 4: Autonomous Execution Mesh\n• Slide 5: Free Dossier\n\n#QuantTrading #CryptoAlpha #AlgorithmicTrading #DeFiExecution",
      hashtags: ['#QuantTrading', '#CryptoAlpha', '#AlgorithmicTrading', '#DeFiExecution'],
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 14), // In 14 hours
      status: 'SCHEDULED',
      publishingMode: 'AUTOPILOT',
    });

    // 5. Reel 3: Scheduled on YouTube Shorts (Thursday 2:30 PM)
    await SocialPost.create({
      workspaceId: wsHedgeXId,
      platform: 'YOUTUBE_SHORTS',
      type: 'REEL',
      title: 'Spearbit-Audited Fireblocks MPC Custody for High-Velocity Execution',
      scriptHook: 'How top quantitative funds achieve institutional custody without sacrificing sub-second execution.',
      scriptBody: 'Integrating multi-party computation with Spearbit audit verification ensures zero key exposure while executing arbitrage blocks in under 680 milliseconds.',
      scriptCta: 'Subscribe to HedgeX Quantitative Intelligence for daily high-frequency latency benchmarks.',
      timedCaptions: [
        { start: 0.4, end: 2.1, text: 'INSTITUTIONAL CUSTODY WITHOUT SACRIFICING', words: [{ word: 'INSTITUTIONAL', start: 0.4, end: 0.8 }, { word: 'CUSTODY', start: 0.8, end: 1.2 }, { word: 'WITHOUT', start: 1.2, end: 1.6 }, { word: 'SACRIFICING', start: 1.6, end: 2.1 }] },
        { start: 2.1, end: 3.6, text: 'SUB-SECOND EXECUTION SPEED', words: [{ word: 'SUB-SECOND', start: 2.1, end: 2.6 }, { word: 'EXECUTION', start: 2.6, end: 3.1 }, { word: 'SPEED', start: 3.1, end: 3.6 }] },
      ],
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=600&auto=format&fit=crop',
      audioUrl: '/audio/call_marcus.wav',
      caption: '🔐 Spearbit-audited MPC custody with Fireblocks.\n\nSubscribe for daily quant insights.\n\n#YouTubeShorts #CryptoSecurity #Fireblocks #QuantTrading',
      hashtags: ['#YouTubeShorts', '#CryptoSecurity', '#Fireblocks', '#QuantTrading'],
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 36),
      status: 'SCHEDULED',
      publishingMode: 'AUTOPILOT',
    });

    // 6. Static Graphic: Draft on Twitter (Review & Approve)
    await SocialPost.create({
      workspaceId: wsHedgeXId,
      platform: 'TWITTER',
      type: 'STATIC_GRAPHIC',
      title: '<45s Speed-To-Lead Benchmark (+41.8% Demo Conversions)',
      caption: '📊 Calling inbound enterprise prospects in <45s increases demo bookings by 41.8%.\n\n"The fastest team doesn\'t just get the lead—they set the benchmark all competitors are judged against."\n— Maya (HedgeX Voice AI Engine)\n\n#DataDriven #B2BGrowth #SpeedToLead #AIRevenue',
      hashtags: ['#DataDriven', '#B2BGrowth', '#SpeedToLead', '#AIRevenue'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=600&auto=format&fit=crop',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 50),
      status: 'DRAFT',
      publishingMode: 'REVIEW_APPROVE',
    });

    // 7. Text Thread: Scheduled on Twitter (Friday 6:00 PM)
    await SocialPost.create({
      workspaceId: wsHedgeXId,
      platform: 'TWITTER',
      type: 'TEXT_THREAD',
      title: 'The Math of Sub-Second Latency Arbitrage (1/7 Thread)',
      caption: '🧵 The Math of Sub-Second Latency Arbitrage:\n\n1/7 Most crypto funds assume market making requires superior directional prediction. In reality, it is 100% an execution latency problem.\n\n2/7 Here is the exact architecture we use to capture 18 bps risk-free spreads across OKX, Binance and Bybit (with zero directional exposure) 👇',
      hashtags: ['#CryptoAlpha', '#QuantTrading', '#BuildInPublic', '#TradingBots'],
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 64),
      status: 'SCHEDULED',
      publishingMode: 'AUTOPILOT',
    });

    console.log('[Seed] Social Media Studio seeded with 6 rich multi-platform posts (Reels, Carousels, Graphics, Threads)!');
  } catch (err) {
    console.error('[Seed Social Studio Error]:', err);
  }
};

export const seedPhase8Data = async (wsHedgeXId, wsApexId) => {
  try {
    const apptCount = await Appointment.countDocuments({ workspaceId: wsHedgeXId });
    if (apptCount > 0) return;

    console.log('[Seed] Seeding Phase 8 Calendar Bookings & Deliverability Compliance...');

    const hedgeLeads = await Lead.find({ workspaceId: wsHedgeXId });
    const elena = hedgeLeads.find((l) => l.name.includes('Elena')) || hedgeLeads[0];
    const marcus = hedgeLeads.find((l) => l.name.includes('Marcus')) || hedgeLeads[1];
    const david = hedgeLeads.find((l) => l.name.includes('David')) || hedgeLeads[2];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slot1Start = new Date(tomorrow);
    slot1Start.setHours(14, 0, 0, 0); // 2:00 PM
    const slot1End = new Date(tomorrow);
    slot1End.setHours(14, 30, 0, 0);

    const slot2Start = new Date(tomorrow);
    slot2Start.setHours(16, 30, 0, 0); // 4:30 PM
    const slot2End = new Date(tomorrow);
    slot2End.setHours(17, 0, 0, 0);

    const afterTomorrow = new Date();
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    const slot3Start = new Date(afterTomorrow);
    slot3Start.setHours(11, 0, 0, 0); // 11:00 AM
    const slot3End = new Date(afterTomorrow);
    slot3End.setHours(11, 45, 0, 0);

    await Appointment.create([
      {
        workspaceId: wsHedgeXId,
        leadId: elena?._id,
        title: 'VIP Product Demo - Elena Rostova (Vanguard Alpha)',
        description: 'Multi-exchange arbitrage and low-latency liquidity routing demo.',
        startTime: slot1Start,
        endTime: slot1End,
        durationMinutes: 30,
        timezone: 'America/New_York',
        status: 'CONFIRMED',
        provider: 'GOOGLE_CALENDAR',
        meetLink: 'https://meet.google.com/qaz-wsxe-edc',
        attendeeName: elena?.name || 'Elena Rostova',
        attendeeEmail: elena?.email || 'elena.rostova@vanguardalpha.ch',
        attendeePhone: elena?.phone || '+1 (555) 019-2831',
        hostName: 'Alex Rivers (Founding Team)',
        hostEmail: 'alex@vyuhox.com',
        bookedBy: 'AI_VOICE_AGENT',
        reminderSent: false,
        reminderScheduledFor: new Date(slot1Start.getTime() - 60 * 60 * 1000),
        notes: 'Lead requested sub-millisecond Sharpe ratio backtest walkthrough during outbound AI call.',
      },
      {
        workspaceId: wsHedgeXId,
        leadId: marcus?._id,
        title: 'Strategy Deep Dive - Marcus Vance (Vance Capital)',
        description: 'Institutional crypto yield automation and enterprise API architecture.',
        startTime: slot2Start,
        endTime: slot2End,
        durationMinutes: 30,
        timezone: 'America/New_York',
        status: 'CONFIRMED',
        provider: 'GOOGLE_CALENDAR',
        meetLink: 'https://meet.google.com/plm-okni-uhb',
        attendeeName: marcus?.name || 'Marcus Vance',
        attendeeEmail: marcus?.email || 'marcus@vancecapital.io',
        attendeePhone: marcus?.phone || '+1 (555) 019-4822',
        hostName: 'Nanda Sai',
        hostEmail: 'nanda@vyuhox.com',
        bookedBy: 'WHATSAPP_BOT',
        reminderSent: false,
        reminderScheduledFor: new Date(slot2Start.getTime() - 60 * 60 * 1000),
        notes: 'Booked automatically via WhatsApp bot conversation after answering compliance question.',
      },
      {
        workspaceId: wsHedgeXId,
        leadId: david?._id,
        title: 'Technical Onboarding - David Sterling',
        description: 'Webhook listener and risk-engine integration review.',
        startTime: slot3Start,
        endTime: slot3End,
        durationMinutes: 45,
        timezone: 'America/New_York',
        status: 'CONFIRMED',
        provider: 'CAL_COM',
        meetLink: 'https://meet.google.com/yhn-ujmk-ikm',
        attendeeName: david?.name || 'David Sterling',
        attendeeEmail: david?.email || 'd.sterling@sterlingalgo.com',
        attendeePhone: david?.phone || '+1 (555) 019-7123',
        hostName: 'Nanda Sai',
        hostEmail: 'nanda@vyuhox.com',
        bookedBy: 'MANUAL_DASHBOARD',
        reminderSent: false,
        reminderScheduledFor: new Date(slot3Start.getTime() - 60 * 60 * 1000),
        notes: 'Scheduled directly through Cal.com round-robin widget.',
      },
    ]);

    await CalendarConfig.findOneAndUpdate(
      { workspaceId: wsHedgeXId },
      {
        $set: {
          googleCalendar: {
            connected: true,
            email: 'gtm-ops@vyuhox.com',
            calendarId: 'primary',
            syncActive: true,
            lastSyncedAt: new Date(),
          },
          calCom: {
            connected: true,
            apiKey: 'cal_live_9f81a742e9',
            eventTypeId: '30min-gtm-demo',
            username: 'vyuhox-team',
            webhookActive: true,
          },
          workingHours: {
            start: '09:00',
            end: '18:00',
            days: [1, 2, 3, 4, 5],
            timezone: 'America/New_York',
          },
          bufferMinutes: 15,
          autoDispatchMeetLink: true,
          autoSmsReminderHours: 1,
        },
      },
      { upsert: true }
    );

    // Seed Warmup Domains
    await DomainWarmup.create([
      {
        workspaceId: wsHedgeXId,
        domain: 'try-vyuhox.com',
        senderEmail: 'outreach@try-vyuhox.com',
        provider: 'SMARTLEAD',
        status: 'WARM',
        healthScore: 98,
        spfRecord: { valid: true, record: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all', status: 'VALID' },
        dkimRecord: { valid: true, selector: 'google', record: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBC...', status: 'VALID' },
        dmarcRecord: { valid: true, record: 'v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@try-vyuhox.com', policy: 'reject', status: 'VALID' },
        mxRecord: { valid: true, hosts: ['aspmx.l.google.com', 'alt1.aspmx.l.google.com'], status: 'VALID' },
        dailySentCount: 46,
        dailyTargetLimit: 50,
        inboxPlacementRate: 99.1,
        spamRate: 0.1,
        daysInWarmup: 28,
        lastDnsCheck: new Date(),
      },
      {
        workspaceId: wsHedgeXId,
        domain: 'vyuhox-outreach.io',
        senderEmail: 'hello@vyuhox-outreach.io',
        provider: 'INSTANTLY',
        status: 'WARMING',
        healthScore: 94,
        spfRecord: { valid: true, record: 'v=spf1 include:_spf.google.com ~all', status: 'VALID' },
        dkimRecord: { valid: true, selector: 'instantly', record: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...', status: 'VALID' },
        dmarcRecord: { valid: true, record: 'v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@vyuhox-outreach.io', policy: 'quarantine', status: 'VALID' },
        mxRecord: { valid: true, hosts: ['aspmx.l.google.com'], status: 'VALID' },
        dailySentCount: 28,
        dailyTargetLimit: 50,
        inboxPlacementRate: 97.4,
        spamRate: 0.3,
        daysInWarmup: 12,
        lastDnsCheck: new Date(),
      },
      {
        workspaceId: wsHedgeXId,
        domain: 'scale-gtm.net',
        senderEmail: 'alex@scale-gtm.net',
        provider: 'SMARTLEAD',
        status: 'WARMING',
        healthScore: 89,
        spfRecord: { valid: true, record: 'v=spf1 include:_spf.google.com ~all', status: 'VALID' },
        dkimRecord: { valid: true, selector: 'google', record: 'v=DKIM1; k=rsa; p=MIIBIj...', status: 'VALID' },
        dmarcRecord: { valid: true, record: 'v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@scale-gtm.net', policy: 'quarantine', status: 'VALID' },
        mxRecord: { valid: true, hosts: ['mail.scale-gtm.net'], status: 'VALID' },
        dailySentCount: 16,
        dailyTargetLimit: 50,
        inboxPlacementRate: 96.2,
        spamRate: 0.5,
        daysInWarmup: 6,
        lastDnsCheck: new Date(),
      },
    ]);

    // Seed A2P 10DLC Registration
    await A2PRegistration.create({
      workspaceId: wsHedgeXId,
      brandName: 'VYUHOX Autonomous GTM',
      legalBusinessName: 'VYUHOX INC',
      ein: '88-4291044',
      businessType: 'Corporation',
      industry: 'Software / Technology',
      website: 'https://vyuhox.com',
      contactEmail: 'compliance@vyuhox.com',
      contactPhone: '+1 (555) 019-2831',
      address: {
        street: '100 Innovation Way, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
      },
      campaignUseCase: 'MARKETING',
      campaignDescription: 'Two-way B2B demo scheduling, reminder notifications, and account coordination text messages.',
      sampleMessage1: 'Hi [Name], Alex from VYUHOX. Open to reviewing our autonomous B2B pipeline demo tomorrow at 2 PM? Reply STOP to cancel.',
      sampleMessage2: 'Hi [Name], your VYUHOX walkthrough is confirmed for Thursday at 2 PM: https://meet.google.com/qaz-wsxe-edc. Reply HELP for support or STOP to opt out.',
      optInWorkflow: 'Prospects opt-in via website demo request forms and verified two-way conversational outreach with explicit SMS consent.',
      twilioTrustHubSid: 'TH_7F84A12B9D',
      brandRegistrationSid: 'BN_3C92D81E04',
      campaignSid: 'CP_112093FA77',
      status: 'APPROVED',
      throughputTPS: 15,
      submissionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
    });

    // Seed DNC Blacklist Records
    await DncRecord.create([
      {
        workspaceId: wsHedgeXId,
        type: 'PHONE',
        phone: '+15550199999',
        reason: 'Inbound STOP reply keyword received via Twilio SMS',
        channel: 'SMS',
        leadName: 'Arthur Dent',
        active: true,
      },
      {
        workspaceId: wsHedgeXId,
        type: 'EMAIL',
        email: 'optout@blacklisted-corp.com',
        reason: 'Unsubscribe header link clicked in cold sequence',
        channel: 'EMAIL',
        leadName: 'Tricia McMillan',
        active: true,
      },
      {
        workspaceId: wsHedgeXId,
        type: 'BOTH',
        phone: '+15550198888',
        email: 'donotcall@competitor-fund.com',
        reason: 'National DNC registry match & manual compliance entry',
        channel: 'MANUAL',
        leadName: 'Ford Prefect',
        active: true,
      },
    ]);

    console.log('[Seed] Phase 8 Data seeded successfully!');
  } catch (err) {
    console.error('[Seed Phase 8 Error]:', err.message);
  }
};

export const seedPhase9Data = async (wsHedgeXId, wsApexId) => {
  try {
    const actCount = await AgentActivityLog.countDocuments({ workspaceId: wsHedgeXId });
    if (actCount > 0) return;

    console.log('[Seed] Seeding Phase 9 Autonomous AI Company & C-Suite Orchestration...');

    // 1. Seed Rich Agent Activity Stream
    await AgentActivityLog.create([
      {
        workspaceId: wsHedgeXId,
        agentRole: 'CEO',
        actionTitle: 'Dispatched 9:00 AM Executive Briefing to Founder WhatsApp',
        description: 'Synthesized telemetry from CMO, SDR, Closer, CFO, and CS. Pushed 3 high-impact strategic proposals with 1-click approvals.',
        category: 'EXECUTIVE_STRATEGY',
        status: 'COMPLETED',
        impactScore: 99,
        latencyMs: 180,
      },
      {
        workspaceId: wsHedgeXId,
        agentRole: 'CMO',
        actionTitle: 'Auto-Iterated Ad Creative & Scraper Targeting for "Bybit Support"',
        description: 'In response to Voice Closer call friction, spun up Bybit liquidity router ad set and adjusted Apollo scraper filters to target Bybit algo traders.',
        category: 'MARKETING',
        status: 'COMPLETED',
        impactScore: 96,
        latencyMs: 310,
      },
      {
        workspaceId: wsHedgeXId,
        agentRole: 'VOICE_CLOSER',
        actionTitle: 'Locked in Calendar VIP Product Demo for Marcus Vance',
        description: 'Conducted live voice qualification call (<800ms Bland.ai). Successfully booked demo and triggered 1-hour pre-call SMS reminder.',
        category: 'TELEPHONY',
        status: 'COMPLETED',
        impactScore: 98,
        latencyMs: 420,
      },
      {
        workspaceId: wsHedgeXId,
        agentRole: 'SDR',
        actionTitle: 'Prioritized & Outreached 42 High-Intent Leads',
        description: 'Dispatched hyper-personalized WhatsApp message sequences to managing partners of quantitative funds scaling cross-exchange arbitrage.',
        category: 'SALES',
        status: 'COMPLETED',
        impactScore: 94,
        latencyMs: 195,
      },
      {
        workspaceId: wsHedgeXId,
        agentRole: 'CFO',
        actionTitle: 'RevOps Audit Completed: LTV/CAC at 21.4x ($48.5k MRR)',
        description: 'Verified unit economics and operating margins. CAC at $215 with $4,600 LTV. Ad spend caps respected with zero burn rate anomalies.',
        category: 'FINANCE',
        status: 'COMPLETED',
        impactScore: 95,
        latencyMs: 140,
      },
      {
        workspaceId: wsHedgeXId,
        agentRole: 'CUSTOMER_SUCCESS',
        actionTitle: 'Scanned 4 Active Exchange WebSocket Gateways',
        description: 'Verified Binance and Bybit API integration health. Latency nominal at 84ms. Zero API permission errors or IP whitelist blocks.',
        category: 'RETENTION',
        status: 'COMPLETED',
        impactScore: 91,
        latencyMs: 95,
      },
    ]);

    // 2. Seed Initial CEO Daily Briefing with 1-Click Action Proposals
    await CeoBriefing.create({
      workspaceId: wsHedgeXId,
      briefingDate: new Date(),
      title: '9:00 AM Executive Briefing & Multi-Agent Performance Synthesis',
      executiveSummary:
        'Good morning. The autonomous GTM engine is running at peak velocity with 100% uptime. ' +
        'SDR Marcus Cole qualified 42 accounts, Maya Vance dialed high-intent leads in sub-45s with a 41% meeting conversion rate, ' +
        'and Julian Vance reported an elite 21.4x LTV/CAC ratio with $48.5k MRR run-rate. ' +
        'Sophia Sterling auto-pivoted ad creatives to Bybit liquidity routing following voice call friction signals.',
      metricsSnapshot: {
        mrr: 48500,
        mrrGrowthPct: 14.8,
        cac: 215,
        ltv: 4600,
        ltvCacRatio: 21.4,
        roas: 4.12,
        activeDemosBooked: 12,
        churnRiskCount: 0,
        burnRateUsd: 1420,
      },
      proposedActions: [
        {
          actionId: 'ACT_BYBIT_ROAS',
          agentRole: 'CMO',
          actionTitle: 'Double Daily Budget on Bybit High-ROAS Meta Ad Set',
          description:
            'Increase daily Meta ad spend from $150 to $300 on the newly tested Bybit liquidity creative, which is demonstrating a 4.8x ROAS.',
          status: 'PENDING',
          impact: 'High Revenue Growth',
          estimatedValue: '+$8,400 MRR',
        },
        {
          actionId: 'ACT_QUANT_SDR',
          agentRole: 'SDR',
          actionTitle: 'Launch Cold Email Sequence to 250 Quant Funds on Bybit',
          description:
            'Scrape and enrich 250 verified managing partners of algorithmic hedge funds in Switzerland and Singapore experiencing Bybit rate limits.',
          status: 'PENDING',
          impact: 'Pipeline Expansion',
          estimatedValue: '+$14,000 Pipeline',
        },
        {
          actionId: 'ACT_STRIPE_SWEEP',
          agentRole: 'CFO',
          actionTitle: 'Activate Auto-Sweep to Credit Balance from Stripe Payouts',
          description:
            'Allocate 8% of incoming Stripe subscription revenue automatically to telephony and AI computation wallets to prevent buffer depletion.',
          status: 'APPROVED',
          impact: 'Treasury & Risk Automation',
          estimatedValue: 'Zero Downtime',
          executedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ],
      deliveredVia: 'WHATSAPP',
      deliveredTo: '+1 (555) 019-2831',
      deliveryStatus: 'DELIVERED',
    });

    console.log('[Seed] Phase 9 AI Company C-Suite data seeded successfully!');
  } catch (err) {
    console.error('[Seed Phase 9 Error]:', err.message);
  }
};

export const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyuhox';
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
    console.log('[Seed] Connected to MongoDB. Checking workspaces, omnichannel, voice, social, and phase 8 data...');

    // Check if data already exists
    const existingWorkspaces = await Workspace.countDocuments();
    if (existingWorkspaces > 0) {
      const defaultWs = (await Workspace.findOne({ industry: 'Crypto' })) || (await Workspace.findOne());
      if (defaultWs) {
        await seedOmnichannelData(defaultWs._id);
        await seedVoiceStudioData(defaultWs._id);
        await seedSocialStudioData(defaultWs._id);
        await seedPhase8Data(defaultWs._id);
        await seedPhase9Data(defaultWs._id);
      }
      console.log('[Seed] Workspaces exist. All modules including Phase 9 verified.');
      return;
    }

    // 1. Create Workspaces
    const wsHedgeX = await Workspace.create({
      name: 'HedgeX Algorithmic Capital',
      domain: 'hedgex.io',
      slug: 'hedgex-crypto',
      industry: 'Crypto',
      operatingMode: 'AI_COMPANY',
      branding: {
        primaryColor: '#06B6D4',
        secondaryColor: '#10B981',
        companyName: 'HedgeX Capital',
      },
    });

    const wsApex = await Workspace.create({
      name: 'Apex D2C Apparel',
      domain: 'apexapparel.shop',
      slug: 'apex-d2c',
      industry: 'D2C',
      operatingMode: 'TOOL',
      branding: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        companyName: 'Apex Fashion Group',
      },
    });

    const wsOmni = await Workspace.create({
      name: 'OmniFlow Growth Agency',
      domain: 'omniflow.agency',
      slug: 'omniflow-b2b',
      industry: 'B2B',
      operatingMode: 'TOOL',
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        companyName: 'OmniFlow Agency',
      },
    });

    // 2. Create User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      name: 'Nanda Sai',
      email: 'founder@vyuhox.ai',
      passwordHash,
      role: 'superadmin',
      workspaceId: wsHedgeX._id,
    });

    // 3. Create Wallets
    await Wallet.create({
      workspaceId: wsHedgeX._id,
      balanceUSD: 248.5,
      autoRechargeEnabled: true,
      rechargeThreshold: 50.0,
      rechargeAmount: 200.0,
      transactions: [
        {
          type: 'BONUS',
          amountUSD: 50.0,
          description: 'Welcome Promotional Credit',
          timestamp: new Date(Date.now() - 86400000 * 5),
          referenceId: 'BONUS_INIT',
        },
        {
          type: 'CREDIT',
          amountUSD: 250.0,
          description: 'Auto-recharge via Stripe (**** 4242)',
          timestamp: new Date(Date.now() - 86400000 * 2),
          referenceId: 'STRIPE_TX_99182',
        },
        {
          type: 'DEBIT',
          amountUSD: 32.5,
          description: 'Voice AI Sub-second Outbound Calls (65 calls)',
          timestamp: new Date(Date.now() - 86400000 * 1),
          referenceId: 'VOICE_USAGE_01',
        },
        {
          type: 'DEBIT',
          amountUSD: 19.0,
          description: 'Waterfall Domain & Web Enrichment (380 leads)',
          timestamp: new Date(Date.now() - 3600000 * 4),
          referenceId: 'SCRAPE_USAGE_02',
        },
      ],
    });

    await Wallet.create({
      workspaceId: wsApex._id,
      balanceUSD: 85.0,
      transactions: [
        {
          type: 'BONUS',
          amountUSD: 50.0,
          description: 'Welcome Promotional Credit',
          referenceId: 'BONUS_APEX',
        },
        {
          type: 'CREDIT',
          amountUSD: 35.0,
          description: 'Credit Card Deposit',
          referenceId: 'CARD_TX_1109',
        },
      ],
    });

    await Wallet.create({
      workspaceId: wsOmni._id,
      balanceUSD: 120.0,
      transactions: [
        {
          type: 'BONUS',
          amountUSD: 50.0,
          description: 'Welcome Promotional Credit',
          referenceId: 'BONUS_OMNI',
        },
      ],
    });

    // 4. Create Leads for HedgeX
    const sampleLeads = [
      {
        workspaceId: wsHedgeX._id,
        name: 'Elena Rostova',
        email: 'elena@vanguardcrypto.fund',
        phone: '+1 415 890 2234',
        company: 'Vanguard Alpha Fund',
        title: 'Managing Partner',
        stage: 'Demo_Booked',
        score: 94,
        source: 'Scraper',
        channels: {
          whatsapp: '+14158902234',
          telegram: '@elena_vanguard',
          email: 'elena@vanguardcrypto.fund',
          phone: '+14158902234',
        },
        notes: 'Highly interested in autonomous algorithmic market making. Demo set for Friday 3pm EST.',
        tags: ['Institutional', 'High-Net-Worth', 'Crypto Fund'],
      },
      {
        workspaceId: wsHedgeX._id,
        name: 'Marcus Sterling',
        email: 'm.sterling@aetherium.vc',
        phone: '+44 20 7946 0912',
        company: 'Aetherium Ventures',
        title: 'Head of Liquid Strategies',
        stage: 'Qualified',
        score: 88,
        source: 'Inbound',
        channels: {
          whatsapp: '+442079460912',
          telegram: '@marcus_aether',
          email: 'm.sterling@aetherium.vc',
        },
        notes: 'Requested security audit report and performance backtests.',
        tags: ['Venture Capital', 'Tier 1'],
      },
      {
        workspaceId: wsHedgeX._id,
        name: 'Kenji Takahashi',
        email: 'kenji@tokyotrading.jp',
        phone: '+81 3 5555 0143',
        company: 'Tokyo Quantitative Labs',
        title: 'Chief Risk Officer',
        stage: 'Won',
        score: 99,
        source: 'Ad',
        channels: {
          whatsapp: '+81355550143',
          telegram: '@kenji_tql',
          email: 'kenji@tokyotrading.jp',
        },
        notes: 'Signed $2.5M allocation enterprise SLA contract.',
        tags: ['Enterprise', 'Contract Signed', 'VIP'],
      },
      {
        workspaceId: wsHedgeX._id,
        name: 'David Chen',
        email: 'dchen@blockpulse.io',
        phone: '+1 650 332 9901',
        company: 'BlockPulse Trading',
        title: 'Director of Business Development',
        stage: 'Contacted',
        score: 72,
        source: 'Form',
        channels: {
          whatsapp: '+16503329901',
          email: 'dchen@blockpulse.io',
        },
        notes: 'Responded to automated WhatsApp sequence. Follow up on Monday.',
        tags: ['HFT', 'B2B Partner'],
      },
      {
        workspaceId: wsHedgeX._id,
        name: 'Sarah Jenkins',
        email: 'sarah.j@apexwealth.ch',
        phone: '+41 22 819 4000',
        company: 'Apex Swiss Wealth',
        title: 'Portfolio Manager',
        stage: 'Prospect',
        score: 61,
        source: 'Scraper',
        channels: {
          email: 'sarah.j@apexwealth.ch',
          telegram: '@sarah_swiss',
        },
        notes: 'Scraped from Swiss FinTech registry. Email sequence scheduled.',
        tags: ['Family Office', 'Outreach Pending'],
      },
      {
        workspaceId: wsApex._id,
        name: 'Chloe Martin',
        email: 'chloe@urbanluxe.co',
        phone: '+1 310 902 4411',
        company: 'Urban Luxe Brands',
        title: 'VP of Growth',
        stage: 'Qualified',
        score: 85,
        source: 'Inbound',
        channels: {
          whatsapp: '+13109024411',
          email: 'chloe@urbanluxe.co',
        },
        notes: 'Looking for omni-channel automated TikTok & Meta ad scaling.',
        tags: ['D2C', 'Retail'],
      },
    ];

    await Lead.insertMany(sampleLeads);

    // 5. Create default IntegrationConfigs
    await IntegrationConfig.create([
      {
        workspaceId: wsHedgeX._id,
        serviceName: 'bland_ai',
        credentials: { apiKey: 'bland_live_demo_key_xyz' },
        isActive: true,
      },
      {
        workspaceId: wsHedgeX._id,
        serviceName: 'twilio',
        credentials: { accountSid: 'AC_DEMO_SID', authToken: 'DEMO_AUTH' },
        isActive: true,
      },
      {
        workspaceId: wsHedgeX._id,
        serviceName: 'resend',
        credentials: { apiKey: 're_demo_resend_key' },
        isActive: true,
      },
      {
        workspaceId: wsHedgeX._id,
        serviceName: 'openai',
        credentials: { apiKey: 'sk-demo-openai' },
        isActive: true,
      },
    ]);

    await seedOmnichannelData(wsHedgeX._id, wsApex._id);
    await seedVoiceStudioData(wsHedgeX._id);
    await seedSocialStudioData(wsHedgeX._id, wsApex._id);
    await seedPhase8Data(wsHedgeX._id, wsApex._id);

    console.log('[Seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('[Seed] Script finished.');
    process.exit(0);
  });
}
