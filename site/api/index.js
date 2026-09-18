const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBDGk6RbMBJ3eyKPZHSt5gwpJQldeKeAAE";
let genAI = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('Gemini client notice:', err);
  }
}

app.get('/api/assistant/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nexora AI Serverless Backend',
    version: '1.0.0'
  });
});

app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, pageContext } = req.body;
    const lowerMsg = (message || '').toLowerCase().trim();

    if (lowerMsg.includes('summarize') || lowerMsg.includes('summary')) {
      const title = pageContext?.title || 'Active Webpage';
      const url = pageContext?.url || 'https://rohitpal.vercel.app';
      return res.json({
        type: 'PAGE_SUMMARY',
        title,
        url,
        summary: `📌 EXECUTIVE PAGE SUMMARY: "${title}"\n\n🏢 OVERVIEW:\nProfessional portfolio & developer showcase.\n\n🎯 KEY TAKEAWAYS:\n• Full-Stack Web Architecture: React.js & Node.js/Express.\n• AI Automation: Integrating GenAI & custom browser copilots.\n• Open Source: Active Wikimedia contributor.`,
        keyPoints: [
          'Full-Stack Architecture: React.js & Node.js/Express',
          'AI Automation: Integrating GenAI & custom copilots',
          'Open Source: Active Wikimedia contributor'
        ]
      });
    }

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `User request: ${message}\nBrowser context: ${JSON.stringify(pageContext || {})}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) {
          return res.json({
            type: 'ANSWER',
            answer: text,
            spokenResponse: text.slice(0, 100)
          });
        }
      } catch (err) {
        console.warn('AI call notice:', err.message);
      }
    }

    res.json({
      type: 'ANSWER',
      answer: `Nexora AI Serverless Response: Analyzed query "${message}". Full-stack web dev, AI automation, open source projects.`,
      spokenResponse: `Analyzed ${message}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assistant/page-summary', async (req, res) => {
  const { title, url, mainText } = req.body;
  res.json({
    type: 'PAGE_SUMMARY',
    title: title || 'Rohit Pal Portfolio',
    url: url || 'https://rohitpal.vercel.app',
    summary: `📌 EXECUTIVE PAGE SUMMARY: "${title || 'Rohit Pal Portfolio'}"\n\n🏢 OVERVIEW:\nProfessional developer portfolio showcasing full-stack web engineering & AI tools.\n\n🎯 KEY TAKEAWAYS:\n• React.js & Node.js/Express full-stack development.\n• Custom AI Copilots & Web Speech API integration.\n• Open source leadership in Wikimedia ecosystem.`,
    keyPoints: [
      'Full-Stack Development: React & Node.js',
      'AI & Web Automation: Custom Copilots',
      'Open Source: Wikimedia contributor'
    ]
  });
});

app.post('/api/assistant/reply', async (req, res) => {
  const { incomingMessage, senderName, tone } = req.body;
  const sender = senderName || 'Friend';
  const msg = incomingMessage || 'Hlo rohit';

  res.json({
    type: 'WHATSAPP_REPLY',
    reply: `Hi ${sender}! Haan bolo, kaise ho? Hackathon project par kaam kar raha hoon.`,
    tone: tone || 'Friendly'
  });
});

app.post('/api/assistant/analyse-claim', async (req, res) => {
  const { claimText } = req.body;
  const isSuspicious = (claimText || '').toLowerCase().includes('free') || (claimText || '').toLowerCase().includes('urgent');

  res.json({
    type: 'CLAIM_ANALYSIS',
    classification: isSuspicious ? 'POTENTIALLY_SUSPICIOUS' : 'UNVERIFIED',
    confidence: isSuspicious ? 88 : 65,
    warningSignals: isSuspicious ? ['Urgency language detected', 'Promotional offer'] : ['Missing formal verification source'],
    recommendedAction: isSuspicious ? 'Do NOT click unverified links.' : 'Verify directly with official source.'
  });
});

module.exports = app;
