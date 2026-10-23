import mongoose from 'mongoose';

const voiceAgentConfigSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    agentName: {
      type: String,
      default: 'Maya - Autonomous SDR',
    },
    voicePersona: {
      tone: {
        type: String,
        enum: ['Executive', 'Friendly', 'Consultative', 'Aggressive Closer', 'Warm Conversational'],
        default: 'Consultative',
      },
      language: {
        type: String,
        default: 'en-US', // e.g. en-US, en-IN, hi-IN, te-IN, ta-IN, es-ES
      },
      accent: {
        type: String,
        default: 'US Professional',
      },
      voiceId: {
        type: String,
        default: 'bland_nat_maya_01',
      },
      speed: {
        type: Number,
        default: 1.0,
      },
      temperature: {
        type: Number,
        default: 0.7,
      },
    },
    systemPrompt: {
      type: String,
      default:
        'You are Maya, an elite high-intent SDR at {{companyName}}. Your goal is to qualify the executive lead within 2 minutes, verify their growth bottlenecks, and secure a confirmed slot on our senior partner calendar at {{calendarUrl}}.',
    },
    qualificationQuestions: [
      {
        type: String,
      },
    ],
    calendarBookingUrl: {
      type: String,
      default: 'https://cal.com/vyuhox/discovery-sync',
    },
    speedToLeadEnabled: {
      type: Boolean,
      default: true,
    },
    speedToLeadDelaySeconds: {
      type: Number,
      default: 45,
    },
    minLeadScoreForCall: {
      type: Number,
      default: 70,
    },
    minPortfolioUSD: {
      type: Number,
      default: 10000,
    },
    transferPhoneNumber: {
      type: String,
      default: '+1 (415) 555-0199',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const VoiceAgentConfig = mongoose.model('VoiceAgentConfig', voiceAgentConfigSchema);
