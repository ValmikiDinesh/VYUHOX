/**
 * AI Sentiment & Intent Classifier Service
 * Evaluates inbound communications and classifies sentiment into:
 * - HIGH_INTENT (Strong buying signal, pricing request, demo request)
 * - OBJECTION (Cost, timing, competitor lock-in, budget constraints)
 * - GENERAL_INQUIRY (Technical questions, feature inquiries, general questions)
 * - NOT_INTERESTED (Unsubscribe, negative pushback, opt-out)
 * - NEUTRAL (Acknowledgments, polite greetings)
 *
 * Automatically calculates recommended CRM stage updates and drafts
 * an instant context-aware AI suggested response tailored to the workspace GTM strategy.
 */

import { GtmStrategy } from '../../models/GtmStrategy.js';
import { Lead } from '../../models/Lead.js';
import { CumulativeContextService } from '../ai/CumulativeContextService.js';
import { LlmGatewayService } from '../ai/LlmGatewayService.js';

export class SentimentClassifier {
  /**
   * Classify message sentiment and intent
   * @param {string} text - Inbound message body
   * @param {Object} [context] - Contextual metadata (channel, lead info)
   * @returns {Promise<{ sentiment: string, confidence: number, summary: string, recommendedStage: string, scoreDelta: number }>}
   */
  static async classify(text = '', context = {}) {
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // 1. Check for live OpenAI configuration if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an elite B2B/D2C sales conversation intelligence AI. Analyze this inbound customer message and return JSON strictly with format:
{
  "sentiment": "HIGH_INTENT" | "OBJECTION" | "GENERAL_INQUIRY" | "NOT_INTERESTED" | "NEUTRAL",
  "confidence": number between 0.8 and 1.0,
  "summary": "1 sentence explanation of lead intent",
  "recommendedStage": "Qualified" | "Demo_Booked" | "Contacted" | "Lost" | null,
  "scoreDelta": number between -20 and +25
}`,
              },
              { role: 'user', content: `Lead message: "${raw}"` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed.sentiment) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[SentimentClassifier] OpenAI API failed, falling back to rule engine:', err.message);
      }
    }

    // 2. High-Accuracy Rule & Semantic Intent Matcher Fallback
    // High Intent triggers
    const highIntentKeywords = [
      'price', 'pricing', 'cost', 'quote', 'demo', 'call', 'schedule', 'talk', 'meeting',
      'calendar', 'book', 'sign up', 'interested', 'buy', 'contract', 'proposal', 'lets connect',
      'let\'s talk', 'when are you free', 'how do i start', 'pilot', 'roi', 'terms'
    ];

    // Objection triggers
    const objectionKeywords = [
      'expensive', 'too high', 'no budget', 'budget constraint', 'cannot afford', 'already using',
      'competitor', 'not right now', 'bad timing', 'later next quarter', 'too busy', 'need approval',
      'security concern', 'not convinced', 'what about privacy'
    ];

    // Not Interested triggers
    const notInterestedKeywords = [
      'unsubscribe', 'stop', 'remove me', 'not interested', 'leave me alone', 'spam',
      'do not contact', 'opt out', 'take me off', 'no thanks', 'please stop'
    ];

    // Check Not Interested first
    if (notInterestedKeywords.some((kw) => lower.includes(kw))) {
      return {
        sentiment: 'NOT_INTERESTED',
        confidence: 0.96,
        summary: 'Lead explicitly declined or requested removal from communication.',
        recommendedStage: 'Lost',
        scoreDelta: -25,
      };
    }

    // Check High Intent
    if (highIntentKeywords.some((kw) => lower.includes(kw))) {
      const isDemoSpecific = lower.includes('demo') || lower.includes('calendar') || lower.includes('call') || lower.includes('book');
      return {
        sentiment: 'HIGH_INTENT',
        confidence: 0.94,
        summary: isDemoSpecific
          ? 'Lead requested a demo/meeting or direct call.'
          : 'Lead signaled high buying intent or requested commercial pricing details.',
        recommendedStage: isDemoSpecific ? 'Demo_Booked' : 'Qualified',
        scoreDelta: 20,
      };
    }

    // Check Objection
    if (objectionKeywords.some((kw) => lower.includes(kw))) {
      return {
        sentiment: 'OBJECTION',
        confidence: 0.91,
        summary: 'Lead expressed a timing, cost, or competitor objection requiring strategic rebuttal.',
        recommendedStage: 'Contacted',
        scoreDelta: -5,
      };
    }

    // Check General Inquiry (contains question mark or inquiry tokens)
    if (raw.includes('?') || ['how', 'what', 'where', 'who', 'does', 'can you', 'is it', 'do you support'].some((kw) => lower.includes(kw))) {
      return {
        sentiment: 'GENERAL_INQUIRY',
        confidence: 0.88,
        summary: 'Lead requested technical or functional details about features/integrations.',
        recommendedStage: 'Contacted',
        scoreDelta: 10,
      };
    }

    return {
      sentiment: 'NEUTRAL',
      confidence: 0.85,
      summary: 'Standard lead response or courtesy acknowledgment.',
      recommendedStage: 'Contacted',
      scoreDelta: 2,
    };
  }

  /**
   * Generate context-aware AI suggestion for response using Cumulative Context Flywheel (Level 1 + 2 + 3)
   */
  static async generateSuggestedReply({ messageContent, sentiment, lead, workspaceId }) {
    let ctx = null;
    try {
      ctx = await CumulativeContextService.getLevel3Context(workspaceId, lead?._id);
    } catch (e) {
      console.warn('[SentimentClassifier] Context retrieval fallback:', e.message);
    }

    const businessName = ctx?.businessName || 'Our Team';
    const coreValueProp = ctx?.coreValueProp || 'Accelerating autonomous pipeline velocity';
    const leadName = lead?.name ? lead.name.split(' ')[0] : 'there';
    const company = lead?.company || 'your team';
    const leadTitle = lead?.title || 'Decision Maker';
    const isQuestion = messageContent.includes('?') || /what|how|why|when|where|who|price|cost|tier|pricing|can you|do you|feature|support|demo|integrate/i.test(messageContent);

    // If prospect is asking a specific question, answer with 100% exact business data from the trained Brain
    if (isQuestion) {
      try {
        const qaResult = await CumulativeContextService.answerLeadQuestion({
          workspaceId,
          leadId: lead?._id,
          question: messageContent,
          channel: lead?.channel || 'OMNICHANNEL',
        });
        if (qaResult?.answer) {
          return {
            suggestedText: `Hi ${leadName}, ${qaResult.answer}`,
            rationale: `Answered directly from ${businessName} Business Brain (Round ${qaResult.round || 1}) grounded in real business capabilities & QA ledger.`,
            provider: 'BUSINESS_BRAIN_AI',
          };
        }
      } catch (qaErr) {
        console.warn('[SentimentClassifier] QA answer error:', qaErr.message);
      }
    }

    // 1. Multi-LLM Generation via LlmGatewayService (Gemini, Groq, OpenAI)
    try {
      const prompt = `You are an elite enterprise Account Executive representing ${businessName}.
CONTEXT (CUMULATIVE FLYWHEEL ACROSS ALL ROUNDS & LEVELS):
${ctx?.summaryText || `Company: ${businessName}. Value Prop: ${coreValueProp}`}

INBOUND MESSAGE TO ANSWER:
"${messageContent}"

DETECTED SENTIMENT: ${sentiment}
LEAD: ${leadName} (${leadTitle}) at ${company}

TASK:
Draft a concise, high-converting, empathetic reply (under 75 words).
- Speak specifically on behalf of ${businessName}.
- Directly address their inquiry/objection using ${businessName}'s value proposition.
- If HIGH_INTENT: Offer a direct 15-minute sync.
- If OBJECTION: Acknowledge empathetically with high-conviction social proof.
- If GENERAL_INQUIRY: Clarify capabilities and ask a sharp qualifying discovery question.
Output ONLY the drafted reply message text.`;

      const llmResult = await LlmGatewayService.execute({
        prompt,
        systemInstruction: `You are an expert SDR & Account Executive AI Copilot representing ${businessName}. Output only the direct message reply without preambles or quotes.`,
        temperature: 0.3,
      });

      if (llmResult?.text && llmResult.text.trim()) {
        const cleanReply = llmResult.text.replace(/^["']|["']$/g, '').trim();
        return {
          suggestedText: cleanReply,
          rationale: `AI Copilot generated reply tailored to ${sentiment} intent for ${company} using Level 1-6 Business Context.`,
          provider: llmResult.model || 'MULTI_LLM_CASCADE',
        };
      }
    } catch (err) {
      console.warn('[SentimentClassifier] LLM generation failed, falling back to context-aware templates:', err.message);
    }

    // 2. High-Fidelity Context-Aware Fallback Templates
    let suggestedText = '';
    let rationale = '';

    switch (sentiment) {
      case 'HIGH_INTENT':
        suggestedText = `Hi ${leadName}, fantastic to hear! We would love to walk ${company} through how ${businessName} delivers ${coreValueProp}. You can pick any 15-minute slot on our calendar right here: https://cal.com/vyuhox/discovery-sync. Looking forward to speaking!`;
        rationale = 'High Intent detected: Immediate calendar dispatch with business value hook.';
        break;

      case 'OBJECTION':
        suggestedText = `Hi ${leadName}, completely understand your concern regarding timing and allocation. Many leaders evaluating ${businessName} had the exact same hesitation before seeing our results in under 14 days. Would you be open to reviewing a quick 2-minute benchmark report?`;
        rationale = 'Objection detected: Empathetic acknowledgment paired with ROI social proof.';
        break;

      case 'NOT_INTERESTED':
        suggestedText = `Understood, ${leadName}! I have updated our records and removed you from further outreach. If things change down the road as ${company} scales, we are always here. Wishing you all the best!`;
        rationale = 'Not Interested: Graceful opt-out confirmation respecting lead boundaries.';
        break;

      case 'GENERAL_INQUIRY':
        suggestedText = `Hi ${leadName}, thanks for reaching out! Yes, ${businessName} directly provides ${coreValueProp} with turnkey integration. Are you looking to streamline current operational bottlenecks or accelerate active pipelines?`;
        rationale = 'General Inquiry: Clarified business capability and closed with a qualifying discovery question.';
        break;

      default:
        suggestedText = `Hi ${leadName}, thanks for following up! How are things currently looking on your side at ${company}? Let me know if there are specific targets you are aiming to hit this quarter with ${businessName}.`;
        rationale = 'Neutral Sentiment: Polite engagement keeping the conversation warm.';
        break;
    }

    return {
      suggestedText,
      rationale,
      provider: 'HEURISTIC_AI_ENGINE',
    };
  }

  /**
   * Apply classification results to lead & conversation in database
   */
  static async applyToLeadAndConversation({ leadId, workspaceId, sentimentResult, io }) {
    if (!leadId) return null;

    try {
      const updateData = {};
      if (sentimentResult.recommendedStage) {
        updateData.stage = sentimentResult.recommendedStage;
      }

      const currentLead = await Lead.findById(leadId);
      if (currentLead) {
        if (sentimentResult.scoreDelta) {
          const newScore = Math.max(0, Math.min(100, (currentLead.score || 50) + sentimentResult.scoreDelta));
          updateData.score = newScore;
        }

        const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, { new: true });

        // Emit real-time stage changed event
        if (io && sentimentResult.recommendedStage) {
          io.to(workspaceId.toString()).emit('leadStageChanged', {
            leadId: updatedLead._id,
            stage: updatedLead.stage,
            score: updatedLead.score,
          });
          io.to(workspaceId.toString()).emit('leadUpdated', updatedLead);
        }

        return updatedLead;
      }
    } catch (err) {
      console.error('[SentimentClassifier] Failed to auto-update lead CRM stage:', err);
    }
    return null;
  }
}
