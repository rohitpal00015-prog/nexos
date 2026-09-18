import { PageContext, ActionResponse } from '../shared/types';
import { StorageService } from './storage';
import { LocalCommandParser } from '../background/localCommandParser';

const DEFAULT_API_KEY = 'AIzaSyBDGk6RbMBJ3eyKPZHSt5gwpJQldeKeAAE';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.6-flash'
];

const SYSTEM_INSTRUCTION = `
You are Nexora AI, a smart in-browser copilot.
You help users manage tabs, understand web pages, answer questions, and search the web.

RULES:
1. Always respond in the user's language (Hindi, Hinglish, or English) naturally, warmly, and concisely.
2. If the user asks about the active webpage (e.g. "is page par kya likha hai", "wiki kitni baar hai", "summary do"), analyze the provided page context (title, headings, text) directly and provide accurate details.
3. If the user asks to search or browse (e.g. "search free meeting", "google news"), return structured JSON:
   { "type": "ACTION", "action": { "name": "SEARCH_WEB", "parameters": { "query": "..." } }, "spokenResponse": "Searching Google for ..." }
4. For general questions, return structured JSON or markdown text.
   JSON format: { "type": "ANSWER", "answer": "...", "spokenResponse": "..." }
`;

export class GeminiDirectService {
  private static async getApiKey(): Promise<string> {
    try {
      const settings = await StorageService.getSettings();
      // Allow custom key if configured in settings, otherwise use default
      return (settings as any)?.customApiKey || DEFAULT_API_KEY;
    } catch {
      return DEFAULT_API_KEY;
    }
  }

  static async generateContent(prompt: string): Promise<string | null> {
    const apiKey = await this.getApiKey();

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            return text;
          }
        }
      } catch (err) {
        console.warn(`[GeminiDirect] Model ${model} request error:`, err);
      }
    }

    return null;
  }

  static async chat(message: string, pageContext?: PageContext): Promise<any> {
    const norm = message.toLowerCase().trim();

    // 1. Instant check for deterministic local actions
    const localResult = LocalCommandParser.parse(message);
    if (localResult) {
      return localResult;
    }

    // 2. Client-side fast keyword occurrence counter
    if (pageContext?.mainText) {
      const countMatch = message.match(/([a-zA-Z0-9_-]+)\s+(?:kitn[a-z]*|kitan[a-z]*)\s+(?:time|times|bar|baar)/i) ||
                         message.match(/(?:kitn[a-z]*|kitan[a-z]*)\s+(?:time|times|bar|baar)\s+(?:likha|aaya|hai|\?)*\s*([a-zA-Z0-9_-]+)/i) ||
                         message.match(/(?:count|how many times)\s+(?:does\s+)?([a-zA-Z0-9_-]+)/i);
      if (countMatch) {
        const term = countMatch[1];
        const fullContent = `${pageContext.title || ''} ${pageContext.headings?.join(' ') || ''} ${pageContext.mainText}`;
        const count = (fullContent.match(new RegExp(term, 'gi')) || []).length;
        return {
          type: 'ANSWER',
          answer: `Aapke page "${pageContext.title || 'current'}" par **"${term}"** word lagbhag **${count} baar** aaya hai.`,
          spokenResponse: `Page par ${term} ${count} baar aaya hai.`,
          needsVerification: false
        };
      }
    }

    // 3. Direct Gemini API call
    const contextSummary = pageContext
      ? `\n\nBROWSER PAGE CONTEXT:\nTitle: ${pageContext.title}\nURL: ${pageContext.url}\nHeadings: ${pageContext.headings?.join(', ') || 'None'}\nMain Content Snippet: ${pageContext.mainText?.slice(0, 3000) || 'None'}\nSelected Text: ${pageContext.selectedText || 'None'}`
      : '';

    const prompt = `${SYSTEM_INSTRUCTION}\n\nUSER REQUEST: "${message}"${contextSummary}`;
    const rawResponse = await this.generateContent(prompt);

    if (rawResponse) {
      try {
        const clean = rawResponse.replace(/```json\s*|\s*```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.answer) {
            parsed.answer = parsed.markdownResponse || parsed.content || parsed.response || parsed.text || parsed.spokenResponse;
          }
          if (!parsed.type && parsed.responseType) parsed.type = parsed.responseType;
          return parsed;
        }
      } catch {
        return {
          type: 'ANSWER',
          answer: rawResponse,
          spokenResponse: rawResponse.slice(0, 100),
          needsVerification: false
        };
      }
    }

    // Offline / Network Fallback
    if (pageContext) {
      return {
        type: 'ANSWER',
        answer: `📌 **${pageContext.title}** (${pageContext.domain})\n\nPage par ye mukhya topics hain:\n${pageContext.headings?.map(h => `• ${h}`).join('\n') || 'Content extracted.'}\n\nAap is page ke baare me koi bhi sawaal pooch sakte hain!`,
        spokenResponse: `Analyzed page ${pageContext.title}`,
        needsVerification: false
      };
    }

    return {
      type: 'ANSWER',
      answer: `Hello! Main aapka Nexora AI copilot hoon. Aap mujhse tabs manage karne, web search karne, ya page summarize karne ke liye bol sakte hain!`,
      spokenResponse: `Hello! I am Nexora AI. How can I help you today?`,
      needsVerification: false
    };
  }

  static async summarize(pageContext: PageContext): Promise<any> {
    const textSnippet = pageContext.mainText ? pageContext.mainText.slice(0, 3500) : '';

    const prompt = `Provide a high-level executive summary of this webpage in simple, clear language (Mix of English and Hindi/Hinglish):
- 🏢 Overview (1-2 sentences)
- 🎯 Key Takeaways (3-4 bullet points)
- 🛠️ Core Topics

Page Title: ${pageContext.title}
URL: ${pageContext.url}
Content:
${textSnippet}`;

    const text = await this.generateContent(prompt);
    if (text) {
      return {
        type: 'PAGE_SUMMARY',
        summary: text,
        title: pageContext.title,
        url: pageContext.url,
        keyPoints: text.split('\n').filter(l => l.trim().startsWith('•') || l.trim().startsWith('-')).map(l => l.trim().replace(/^[-•]\s*/, '')).slice(0, 5)
      };
    }

    return {
      type: 'PAGE_SUMMARY',
      title: pageContext.title,
      url: pageContext.url,
      summary: `📌 **Summary for ${pageContext.title}**\n\n• Domain: ${pageContext.domain}\n• Headings: ${pageContext.headings?.join(', ') || 'N/A'}\n• Word count: ~${(pageContext.mainText || '').split(/\s+/).length} words`,
      keyPoints: pageContext.headings || ['Webpage analyzed']
    };
  }

  static async hindiExplanation(pageContext: PageContext): Promise<any> {
    const textSnippet = pageContext.mainText ? pageContext.mainText.slice(0, 3000) : '';

    const prompt = `Is webpage ke mukhya vishay aur main points ko aasan aur saral HINDI (Devanagari ya clean Hinglish) me samjhao:
Page Title: ${pageContext.title}
URL: ${pageContext.url}
Content:
${textSnippet}`;

    const text = await this.generateContent(prompt);
    return {
      type: 'ANSWER',
      answer: text || `Aapka page "${pageContext.title}" ek web document hai jisme mukhya roop se: ${pageContext.headings?.join(', ') || 'content'} ke baare me jankari di gayi hai.`,
      spokenResponse: `Page ko Hindi me explain kiya gaya hai.`
    };
  }

  static async explainText(selectedText: string): Promise<any> {
    const prompt = `Explain the following selected text in simple language (English & Hinglish):
"${selectedText}"`;

    const text = await this.generateContent(prompt);
    return {
      type: 'TEXT_EXPLANATION',
      explanation: text || `Simplified: "${selectedText}"`,
      originalText: selectedText
    };
  }
}
