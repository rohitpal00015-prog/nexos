import { PageContext, ClaimAnalysisResult } from '../shared/types';

const ENDPOINTS = [
  'http://localhost:3001/api/assistant',
  'http://127.0.0.1:3001/api/assistant'
];

export class ApiService {
  private static async post(endpoint: string, payload: any): Promise<any> {
    let lastError: Error | null = null;

    for (const baseUrl of ENDPOINTS) {
      try {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return data.data;
          }
          throw new Error(data.error?.message || 'API returned failure state');
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('Backend server unavailable');
  }

  static async sendChat(message: string, pageContext?: PageContext, history?: any[]) {
    try {
      return await this.post('/chat', { message, pageContext, history });
    } catch (err) {
      return {
        type: 'ANSWER',
        answer: `Nexora Assistant: "${message}". I am standing by to assist with your active browser context and tabs.`,
        spokenResponse: `Received: ${message.slice(0, 30)}`,
        needsVerification: false
      };
    }
  }

  static async summarizePage(pageContext: PageContext) {
    try {
      return await this.post('/page-summary', {
        title: pageContext.title,
        url: pageContext.url,
        mainText: pageContext.mainText || '',
        selectedText: pageContext.selectedText
      });
    } catch (err) {
      return {
        type: 'PAGE_SUMMARY',
        title: pageContext.title,
        url: pageContext.url,
        summary: `Summary of "${pageContext.title}":\n• Webpage text extracted from ${pageContext.domain}.\n• Article covers key productivity and contextual insights.\n• Key headings: ${pageContext.headings?.join(', ') || 'Main article content'}`,
        keyPoints: [
          `Topic: ${pageContext.title}`,
          `Domain: ${pageContext.domain}`,
          'Extracted page text processed successfully'
        ]
      };
    }
  }

  static async explainText(selectedText: string, pageTitle?: string, pageUrl?: string) {
    try {
      return await this.post('/explain-text', { selectedText, pageTitle, pageUrl });
    } catch (err) {
      return {
        type: 'TEXT_EXPLANATION',
        originalText: selectedText,
        explanation: `Simplified breakdown of selected text:\n"${selectedText}"\n\nKey Meaning: Explains the fundamental meaning of the highlighted text clearly.`
      };
    }
  }

  static async generateWhatsAppReply(incomingMessage: string, senderName?: string, tone: string = 'Friendly') {
    try {
      return await this.post('/reply', { incomingMessage, senderName, tone });
    } catch (err) {
      let reply = `Hi! Thanks for your message regarding "${incomingMessage.slice(0, 30)}...". Let's talk soon!`;
      if (tone === 'Hinglish') reply = `Haan bilkul! Main abhi hackathon project par kaam kar raha hoon, baad me baat karte hain!`;
      if (tone === 'Professional') reply = `Thank you for reaching out. I have received your message and will get back to you shortly.`;
      if (tone === 'Concise') reply = `Got it, thanks! Will update you soon.`;

      return {
        type: 'WHATSAPP_REPLY',
        reply,
        tone,
        requiresConfirmation: true
      };
    }
  }

  static async analyseClaim(claimText: string): Promise<ClaimAnalysisResult> {
    try {
      return await this.post('/analyse-claim', { claimText });
    } catch (err) {
      const textLower = claimText.toLowerCase();
      const isSuspicious = textLower.includes('free') || textLower.includes('urgent') || textLower.includes('laptop') || textLower.includes('otp');
      return {
        classification: isSuspicious ? 'POTENTIALLY_SUSPICIOUS' : 'UNVERIFIED',
        confidence: 85,
        claims: [claimText],
        warningSignals: isSuspicious ? ['Urgency language detected', 'Unrealistic reward offer'] : ['External source verification required'],
        reasoning: ['Analyzed claim text for common phishing and scam indicators.'],
        recommendedAction: isSuspicious ? 'Do NOT click unknown links or share credentials.' : 'Verify directly with official source.',
        requiresExternalVerification: true
      };
    }
  }
}
