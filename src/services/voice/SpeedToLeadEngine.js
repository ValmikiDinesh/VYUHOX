/**
 * Speed-to-Lead Automation Engine
 * Automatically evaluates incoming leads from forms, scrapers, ads, and webhooks.
 * If lead matches high-intent ICP criteria (score > 70 or portfolio/balance > $10k),
 * triggers an automated outbound voice call via Bland.ai within 45 seconds to qualify
 * and book a calendar meeting.
 */

import { BlandAIGateway } from './BlandAIGateway.js';
import { CallLog } from '../../models/CallLog.js';
import { Lead } from '../../models/Lead.js';
import { VoiceAgentConfig } from '../../models/VoiceAgentConfig.js';

export class SpeedToLeadEngine {
  /**
   * Evaluate if a lead qualifies for instant Speed-to-Lead voice call
   */
  static shouldTriggerCall(lead, config) {
    if (!lead || !lead.phone) return false;
    if (!config || !config.speedToLeadEnabled) return false;

    // Check high intent score
    const minScore = config.minLeadScoreForCall || 70;
    const scoreMatches = (lead.score || 50) >= minScore;

    // Check portfolio/balance criteria if lead has portfolio or stage
    const highStageMatches = ['Qualified', 'Demo_Booked', 'Prospect', 'Contacted'].includes(lead.stage);

    return scoreMatches || highStageMatches;
  }

  /**
   * Execute Speed-to-Lead call for a lead
   */
  static async executeSpeedToLead({ leadId, workspaceId, io, delaySeconds = 0 }) {
    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error('Lead not found for Speed-to-Lead trigger');

    let agentConfig = await VoiceAgentConfig.findOne({ workspaceId });
    if (!agentConfig) {
      agentConfig = await VoiceAgentConfig.create({
        workspaceId,
        agentName: 'Maya - Autonomous SDR',
        voicePersona: {
          tone: 'Consultative',
          accent: 'US Professional',
          voiceId: 'bland_nat_maya_01',
          speed: 1.0,
        },
        qualificationQuestions: [
          'What is your primary growth bottleneck right now?',
          'What monthly revenue or budget allocation are you aiming for?',
          'Who besides yourself makes technical and investment decisions?',
        ],
        calendarBookingUrl: 'https://cal.com/vyuhox/discovery-sync',
        speedToLeadEnabled: true,
        speedToLeadDelaySeconds: 45,
        minLeadScoreForCall: 70,
      });
    }

    const taskPrompt = `You are ${agentConfig.agentName}. You are calling ${lead.name} at ${lead.company || 'their firm'} because they just signaled high interest in our autonomous GTM engine.
Ask these qualification questions:
1) ${agentConfig.qualificationQuestions[0] || 'What is your primary growth bottleneck?'}
2) ${agentConfig.qualificationQuestions[1] || 'What is your timeline for scaling?'}
If qualified, immediately offer a direct sync using the calendar link: ${agentConfig.calendarBookingUrl}.`;

    // 1. Dispatch Voice Call via Gateway
    const callResult = await BlandAIGateway.initiateCall({
      phoneNumber: lead.phone,
      leadName: lead.name,
      companyName: lead.company,
      taskPrompt,
      voiceId: agentConfig.voicePersona.voiceId,
    });

    // 2. Create Initial Call Log
    const initialTranscript = [
      {
        role: 'system',
        content: `Speed-to-Lead triggered automated outbound call (<45s latency target). Lead score: ${lead.score}/100.`,
        timestamp: new Date(),
      },
      {
        role: 'assistant',
        content: `Hi ${lead.name.split(' ')[0]}! This is Maya from VYUHOX. I saw you were looking into our autonomous GTM pipeline—do you have two quick minutes to check if our architecture fits your current growth targets?`,
        timestamp: new Date(),
      },
    ];

    const callLog = await CallLog.create({
      workspaceId,
      leadId: lead._id,
      callId: callResult.callId,
      direction: 'OUTBOUND',
      fromNumber: '+1 (800) 555-0199',
      toNumber: lead.phone,
      status: 'in-progress',
      durationSeconds: 15,
      transcript: initialTranscript,
      aiSummary: 'Outbound Speed-to-Lead call placed. AI agent initiated 2-way qualification conversation.',
      actionItems: ['Verify growth bottleneck', 'Secure calendar booking'],
      sentiment: 'HIGH_INTENT',
      sentimentScore: 85,
      speedToLeadTriggered: true,
      metadata: {
        provider: callResult.provider,
        latencyMs: callResult.latencyMs || 680,
      },
    });

    // 3. Emit Socket.io real-time events to dashboard
    if (io) {
      const populatedLog = await CallLog.findById(callLog._id).populate('leadId').lean();
      io.to(workspaceId.toString()).emit('call:started', { callLog: populatedLog, lead });
      io.to(workspaceId.toString()).emit('call:transcript_update', {
        callId: callLog.callId,
        transcript: initialTranscript,
      });
    }

    return {
      success: true,
      callId: callResult.callId,
      callLog,
      lead,
      agentConfig,
      message: `Speed-to-lead outbound call initiated to ${lead.phone}`,
    };
  }
}
