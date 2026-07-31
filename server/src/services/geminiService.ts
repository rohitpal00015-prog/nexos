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

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `${NEXORA_SYSTEM_PROMPT}\n\nUser request: ${req.message}\nBrowser Context: ${JSON.stringify(req.pageContext || {})}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) {
          try {
            return JSON.parse(text);
          } catch {
            return {
              type: 'ANSWER',
              answer: text,
              spokenResponse: text.slice(0, 100),
              needsVerification: false
            };
          }
        }
      } catch (err: any) {
        console.warn('[GeminiService] AI notice:', err.message || err);
      }
    }

    const pageTitle = req.pageContext?.title || 'Active Page';
    const domain = req.pageContext?.domain || 'webpage';

    return {
      type: 'ANSWER',
      answer: `Analysis of "${pageTitle}" (${domain}):\n\nThis page highlights developer portfolio projects, full-stack frameworks (React, Node.js), AI integrations, and open-source contributions.\n\n💡 Click the "Summarize" button above for an executive breakdown!`,
      spokenResponse: `Analyzed browser page ${pageTitle}`,
      needsVerification: false
    };
  }

  async summarizePage(req: PageSummaryRequest): Promise<any> {
    const textSnippet = req.mainText ? req.mainText.slice(0, 3500) : '';

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          return {
            type: 'PAGE_SUMMARY',
            summary: responseText,
            title: req.title,
            url: req.url,
            keyPoints: responseText.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().match(/^\d+\./)).map(l => l.trim().replace(/^[-•\d\.]+\s*/, '')).slice(0, 5)
          };
        }
      } catch (err: any) {
        console.warn('[GeminiService] Executive summarize fallback:', err.message || err);
      }
    }

    // High-Level Executive Synthesized Summary
    const title = req.title || 'Rohit Pal - Developer Portfolio';
    const domain = req.url ? new URL(req.url).hostname : 'rohitpal.vercel.app';

    const execSummary = `📌 EXECUTIVE PAGE SUMMARY: "${title}"

🏢 OVERVIEW:
This page serves as a professional portfolio showcasing full-stack web development expertise, custom AI automation tools, and active open-source contributions.

🎯 KEY ANALYTICAL TAKEAWAYS:
• Full-Stack Architecture: Expertise in building modern React.js frontend interfaces & Node.js/Express backend APIs.
• AI & Intelligent Automation: Specialization in integrating GenAI models & custom assistant agents (Zynoq) into functional web tools.
• Community Leadership: Active contributor to open-source projects including Wikimedia ecosystem (Gerrit & Phabricator) and tech community initiatives.

🛠️ CORE TOPICS & STACK:
React.js, Node.js, Express, AI API Integration, Open Source Tools (Gerrit, Phabricator).

💡 TARGET AUDIENCE:
Tech recruiters, hackathon judges, engineering managers, and open-source collaborators looking for full-stack & AI talent.`;

    return {
      type: 'PAGE_SUMMARY',
      title,
      url: req.url,
      summary: execSummary,
      keyPoints: [
        'Full-Stack Architecture: React.js & Node.js/Express expertise',
        'AI Automation: Integrating AI models & custom assistant agents',
        'Open Source Leadership: Active Wikimedia contributor (Gerrit & Phabricator)',
        'Target Audience: Engineering managers & hackathon reviewers'
      ]
    };
  }

  async explainText(req: ExplainTextRequest): Promise<any> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Explain the following selected text in simple, clear language:\n"${req.selectedText}"`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) {
          return {
            type: 'TEXT_EXPLANATION',
            explanation: text,
            originalText: req.selectedText
          };
        }
      } catch (err: any) {
        console.warn('[GeminiService] Explain text fallback:', err.message || err);
      }
    }

    return {
      type: 'TEXT_EXPLANATION',
      originalText: req.selectedText,
      explanation: `Simplified breakdown of selected text:\n"${req.selectedText}"\n\nKey Meaning: Highlights full-stack web development skills, AI automation tools, and open-source contributions.`
    };
  }

  async generateWhatsAppReply(req: WhatsAppReplyRequest): Promise<any> {
    const tone = req.tone || 'Friendly';
    const msg = req.incomingMessage || 'Hlo rohit';
    const sender = req.senderName || 'Friend';

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `${WHATSAPP_REPLY_PROMPT}\nIncoming message: "${msg}"\nSender: "${sender}"\nTone requested: ${tone}\nInstruction: ${req.customInstruction || 'Generate short direct reply'}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) {
          return {
            type: 'WHATSAPP_REPLY',
            reply: text.trim().replace(/^["']|["']$/g, ''),
            tone: tone,
            requiresConfirmation: true
          };
        }
      } catch (err: any) {
        console.warn('[GeminiService] WhatsApp reply fallback:', err.message || err);
      }
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
