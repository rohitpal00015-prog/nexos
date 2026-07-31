import { PageExtractor } from './pageExtractor';
import { WhatsAppAdapter } from './whatsappAdapter';

console.log('[Nexora Content Script] Loaded on:', window.location.href);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_CONTEXT') {
    try {
      const pageContext = PageExtractor.extract();
      sendResponse({ success: true, context: pageContext });
    } catch (err: any) {
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }

  if (message.type === 'GET_WHATSAPP_CONTEXT') {
    try {
      const whatsappCtx = WhatsAppAdapter.getWhatsAppContext();
      sendResponse({ success: true, context: whatsappCtx });
    } catch (err: any) {
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }

  if (message.type === 'INSERT_WHATSAPP_REPLY') {
    try {
      const result = WhatsAppAdapter.insertReply(message.text, message.autoSend || false);
      sendResponse(result);
    } catch (err: any) {
      sendResponse({ success: false, message: err.message });
    }
    return true;
  }
});
