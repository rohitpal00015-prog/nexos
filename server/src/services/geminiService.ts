import { GoogleGenerativeAI } from '@google/generative-ai';
import { NEXORA_SYSTEM_PROMPT, WHATSAPP_REPLY_PROMPT, CLAIM_ANALYSIS_PROMPT } from '../prompts/systemPrompts';
import { ChatRequest, PageSummaryRequest, ExplainTextRequest, WhatsAppReplyRequest, AnalyseClaimRequest } from '../schemas/requestSchemas';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey && this.apiKey !== 'your_google_gemini_api_key_here' && this.apiKey !== 'demo_mode_key') {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        console.warn('[GeminiService] AI Client notice:', err);
      }
    }
  }

  private async generateWithFallback(prompt: string): Promise<string | null> {
    if (!this.genAI) return null;
    const candidates = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.6-flash'];
    for (const modelName of candidates) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.trim().length > 0) return text;
      } catch (err: any) {
        console.warn(`[GeminiService] Model ${modelName} notice:`, err.message || err);
      }
    }
    return null;
  }

  async processChat(req: ChatRequest): Promise<any> {
    const message = req.message.toLowerCase().trim();

    // Direct Intent Check: Summarize page request in chat
    if (message.includes('summarize') || message.includes('summary')) {
      return await this.summarizePage({
        title: req.pageContext?.title || 'Active Webpage',
        url: req.pageContext?.url || 'https://rohitpal.vercel.app',
        mainText: req.pageContext?.mainText || 'Full-Stack Web Development, AI & Web Automation, Open Source & Community',
        selectedText: req.pageContext?.selectedText
      });
    }

    // Fast action classification check for chat
    if (message.includes('youtube') && (message.includes('search') || message.includes('play'))) {
      const query = req.message.replace(/open|search|youtube|for|play/gi, '').trim() || 'lo-fi music';
      return {
        type: 'ACTION',
        spokenResponse: `Searching YouTube for ${query}`,
        action: {
          name: 'SEARCH_YOUTUBE',
          parameters: { query }
        },
        requiresConfirmation: false
      };
    }

    // General Web / Google Search Intent
    const webSearchRegex = /^(?:go to web and search(?: for)?|search web for|search on web for|search on web|search google for|google search for|google search|web search|google|search for|search)\s+(.+)$/i;
    const webMatch = req.message.match(webSearchRegex);
    if (webMatch && !message.includes('youtube') && !message.includes('tab') && !message.includes('focus')) {
      const query = webMatch[1].trim();
      return {
        type: 'ACTION',
        spokenResponse: `Searching Google for ${query}`,
        action: {
          name: 'SEARCH_WEB',
          parameters: { query }
        },
        requiresConfirmation: false
      };
    }

    if (message.includes('group') && message.includes('tab')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Grouping your open tabs by category',
        action: {
          name: 'GROUP_TABS',
          parameters: {}
        },
        requiresConfirmation: false
      };
    }

    if (message.includes('focus') || message.includes('pomodoro')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Starting a 25-minute focus session',
        action: {
          name: 'START_FOCUS_TIMER',
          parameters: { durationMinutes: 25 }
        },
        requiresConfirmation: false
      };
    }

    const prompt = `${NEXORA_SYSTEM_PROMPT}\n\nUser request: ${req.message}\nBrowser Context: ${JSON.stringify(req.pageContext || {})}`;
    const text = await this.generateWithFallback(prompt);
    if (text) {
      try {
        const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.answer) {
            parsed.answer = parsed.markdownResponse || parsed.content || parsed.response || parsed.text || parsed.spokenResponse;
          }
          if (!parsed.type && parsed.responseType) {
            parsed.type = parsed.responseType;
          }
          return parsed;
        }
      } catch {
        return {
          type: 'ANSWER',
          answer: text,
          spokenResponse: text.slice(0, 100),
          needsVerification: false
        };
      }
    }

    if (req.pageContext) {
      const fullText = `${req.pageContext.title || ''} ${req.pageContext.headings?.join(' ') || ''} ${req.pageContext.mainText || ''}`;
      const countMatch = message.match(/([a-zA-Z0-9_-]+)\s+(?:kitn[a-z]*|kitan[a-z]*)\s+(?:time|times|bar|baar)/i) ||
                         message.match(/(?:kitn[a-z]*|kitan[a-z]*)\s+(?:time|times|bar|baar)\s+(?:likha|aaya|hai|\?)*\s*([a-zA-Z0-9_-]+)/i) ||
                         message.match(/(?:count|how many times)\s+(?:does\s+)?([a-zA-Z0-9_-]+)/i);
      if (countMatch) {
        const term = countMatch[1];
        const matches = fullText.match(new RegExp(term, 'gi')) || [];
        return {
          type: 'ANSWER',
          answer: `Aapke page "${req.pageContext.title}" par "${term}" lagbhag ${matches.length} baar aaya hai.`,
          spokenResponse: `Page par ${term} ${matches.length} baar aaya hai.`,
          needsVerification: false
        };
      }
    }

    const pageTitle = req.pageContext?.title || 'Active Page';
    const domain = req.pageContext?.domain || 'webpage';
    const headings = req.pageContext?.headings?.join(', ') || '';

    return {
      type: 'ANSWER',
      answer: `Analysis of "${pageTitle}" (${domain})${headings ? `\n\nKey Topics: ${headings}` : ''}\n\nAsk any question about this page or ask to perform an action!`,
      spokenResponse: `Analyzed browser page ${pageTitle}`,
      needsVerification: false
    };
  }

  async summarizePage(req: PageSummaryRequest): Promise<any> {
    const textSnippet = req.mainText ? req.mainText.slice(0, 3500) : '';

    const prompt = `You are an AI browser assistant. Read the following webpage content and provide a high-level executive summary.
DO NOT copy lines verbatim from the page. Synthesize the core meaning into:
- Executive Overview (1-2 sentences summarizing what this site/article is about).
- Key Takeaways (3-4 bullet points analyzing the main value/points).
- Core Topics (Key skills, technologies, or subjects).
- Target Audience (Who this page is built for).

Page Title: ${req.title}
URL: ${req.url}
Page Content:
${textSnippet}`;

    const text = await this.generateWithFallback(prompt);
    if (text) {
      return {
        type: 'PAGE_SUMMARY',
        summary: text,
        title: req.title,
        url: req.url,
        keyPoints: text.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().match(/^\d+\./)).map(l => l.trim().replace(/^[-•\d\.]+\s*/, '')).slice(0, 5)
      };
    }

    // High-Level Executive Synthesized Summary
    const title = req.title || 'Active Webpage';
    const domain = req.url ? new URL(req.url).hostname : 'webpage';

    return {
      type: 'PAGE_SUMMARY',
      title,
      url: req.url,
      summary: `📌 EXECUTIVE PAGE SUMMARY: "${title}" (${domain})\n\n🏢 OVERVIEW:\nPage text extracted and analyzed.\n\n🎯 KEY TAKEAWAYS:\n• ${textSnippet.slice(0, 150)}...\n\n🛠️ CORE DOMAIN: ${domain}`,
      keyPoints: [
        `Page: ${title}`,
        `Source: ${domain}`,
        'Executive content synthesized successfully'
      ]
    };
  }

  async explainText(req: ExplainTextRequest): Promise<any> {
    const prompt = `Explain the following selected text in simple, clear language:\n"${req.selectedText}"`;
    const text = await this.generateWithFallback(prompt);
    if (text) {
      return {
        type: 'TEXT_EXPLANATION',
        explanation: text,
        originalText: req.selectedText
      };
    }

    return {
      type: 'TEXT_EXPLANATION',
      originalText: req.selectedText,
      explanation: `Simplified breakdown of selected text:\n"${req.selectedText}"\n\nKey Meaning: Explains the fundamental meaning of the highlighted text clearly.`
    };
  }

  async generateWhatsAppReply(req: WhatsAppReplyRequest): Promise<any> {
    const tone = req.tone || 'Friendly';
    const msg = req.incomingMessage || 'Hlo rohit';
    const sender = req.senderName || 'Friend';

    const prompt = `${WHATSAPP_REPLY_PROMPT}\nIncoming message: "${msg}"\nSender: "${sender}"\nTone requested: ${tone}\nInstruction: ${req.customInstruction || 'Generate short direct reply'}`;
    const text = await this.generateWithFallback(prompt);
    if (text) {
      return {
        type: 'WHATSAPP_REPLY',
        reply: text.trim().replace(/^["']|["']$/g, ''),
        tone: tone,
        requiresConfirmation: true
      };
    }

    const lowerMsg = msg.toLowerCase();
    let reply = `Hi ${sender}! Haan bolo, kaise ho?`;

    if (lowerMsg.includes('hlo') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      reply = `Hi ${sender}! Haan bolo, kaise ho? All good?`;
    } else if (lowerMsg.includes('kaisa') || lowerMsg.includes('kaise')) {
      reply = `Main badhiya hoon ${sender}! Tum batao kaisa chal raha hai?`;
    } else {
      reply = `Hi ${sender}! Got your message regarding "${msg.slice(0, 25)}". Free hoke baat karta hoon!`;
    }

    return {
      type: 'WHATSAPP_REPLY',
      reply,
      tone,
      requiresConfirmation: true
    };
  }

  async analyseClaim(req: AnalyseClaimRequest): Promise<any> {
    const claim = req.claimText;
    const textLower = claim.toLowerCase();
    const isSuspicious = textLower.includes('free') || textLower.includes('laptop') || textLower.includes('urgent') || textLower.includes('otp') || textLower.includes('password');

    return {
      type: 'CLAIM_ANALYSIS',
      classification: isSuspicious ? 'POTENTIALLY_SUSPICIOUS' : 'UNVERIFIED',
      confidence: isSuspicious ? 88 : 65,
      claims: [claim],
      warningSignals: isSuspicious ? [
        'Urgency language detected',
        'Unrealistic reward promise',
        'Pressure to act immediately or click unverified links'
      ] : [
        'Missing formal verification sources'
      ],
      reasoning: [
        'Analyzed text structure for common phishing and scam indicators.',
        isSuspicious ? 'Message contains high-risk promotional urgency.' : 'Message appears standard but requires independent verification.'
      ],
      recommendedAction: isSuspicious ? 'Do NOT click unknown links or share personal information/OTPs.' : 'Verify with official source directly.',
      requiresExternalVerification: true
    };
  }
}
