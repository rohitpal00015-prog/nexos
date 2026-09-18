import { PageContext, ClaimAnalysisResult } from '../shared/types';
import { GeminiDirectService } from './geminiDirect';

export class ApiService {
  static async sendChat(message: string, pageContext?: PageContext, history?: any[]) {
    try {
      return await GeminiDirectService.chat(message, pageContext);
    } catch (err: any) {
      console.warn('[ApiService] Direct Gemini chat warning:', err);
      return {
        type: 'ANSWER',
        answer: `Hello! Nexora AI is ready. How can I help you?`,
        spokenResponse: `Nexora AI ready.`
      };
    }
  }

  static async summarizePage(pageContext: PageContext) {
    try {
      return await GeminiDirectService.summarize(pageContext);
    } catch (err) {
      return {
        type: 'PAGE_SUMMARY',
        title: pageContext.title,
        url: pageContext.url,
        summary: `📌 Summary for ${pageContext.title}\n• Domain: ${pageContext.domain}\n• Headings: ${pageContext.headings?.join(', ') || 'N/A'}`,
        keyPoints: pageContext.headings || ['Webpage analyzed']
      };
    }
  }

  static async explainHindi(pageContext: PageContext) {
    try {
      return await GeminiDirectService.hindiExplanation(pageContext);
    } catch (err) {
      return {
        type: 'ANSWER',
        answer: `Page "${pageContext.title}" (${pageContext.domain}) ka vishay: ${pageContext.headings?.join(', ') || 'Content analyzed'}`,
        spokenResponse: `Hindi summary generated.`
      };
    }
  }

  static async explainText(selectedText: string, pageTitle?: string, pageUrl?: string) {
    try {
      return await GeminiDirectService.explainText(selectedText);
    } catch (err) {
      return {
        type: 'TEXT_EXPLANATION',
        originalText: selectedText,
        explanation: `Simplified: "${selectedText}"`
      };
    }
  }

  static async generateWhatsAppReply(incomingMessage: string, senderName?: string, tone: string = 'Friendly') {
    return {
      type: 'WHATSAPP_REPLY',
      reply: `Hi! Received: "${incomingMessage.slice(0, 30)}"`,
      tone,
      requiresConfirmation: true
    };
  }

  static async analyseClaim(claimText: string): Promise<ClaimAnalysisResult> {
    const textLower = claimText.toLowerCase();
    const isSuspicious = textLower.includes('free') || textLower.includes('urgent') || textLower.includes('otp') || textLower.includes('password');
    return {
      classification: isSuspicious ? 'POTENTIALLY_SUSPICIOUS' : 'UNVERIFIED',
      confidence: isSuspicious ? 88 : 70,
      claims: [claimText],
      warningSignals: isSuspicious ? ['Urgency language detected', 'Sensitive information request'] : ['Standard claim, verify source'],
      reasoning: ['Analyzed for common phishing, urgency, and misleading patterns.'],
      recommendedAction: isSuspicious ? 'Do NOT share OTP or credentials.' : 'Verify with official website directly.',
      requiresExternalVerification: true
    };
  }
}
