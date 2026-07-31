import { WhatsAppContext } from '../shared/types';

export class WhatsAppAdapter {
  static isWhatsAppPage(): boolean {
    return window.location.hostname === 'web.whatsapp.com';
  }

  static getActiveChatName(): string {
    if (!this.isWhatsAppPage()) return 'WhatsApp Web';

    const selectors = [
      '#main header span[title]',
      '#main header [data-testid="conversation-info-header-chat-title"]',
      '#main header div span[dir="auto"]',
      '#main header h2'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.getAttribute('title')) {
        return el.getAttribute('title')!;
      }
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (text && text.length > 0 && text.length < 40) return text;
      }
    }
    return 'Active WhatsApp Chat';
  }

  static getLatestVisibleMessage(): { text?: string; sender?: string } {
    if (!this.isWhatsAppPage()) return { text: 'Hello! Kaise ho?' };

    // Find all message bubbles in active chat
    const messageElements = document.querySelectorAll('#main div[data-id] .copyable-text, #main div.message-in .copyable-text, #main div[role="row"] .selectable-text');
    if (messageElements.length > 0) {
      const lastMsgEl = messageElements[messageElements.length - 1];
      const text = lastMsgEl.textContent?.trim();
      if (text && text.length > 0) return { text };
    }

    const mainArea = document.querySelector('#main');
    if (mainArea) {
      const textNodes = mainArea.querySelectorAll('span.selectable-text');
      if (textNodes.length > 0) {
        const lastNode = textNodes[textNodes.length - 1];
        if (lastNode.textContent?.trim()) {
          return { text: lastNode.textContent.trim() };
        }
      }
    }

    return { text: 'Hlo rohit' };
  }

  static getWhatsAppContext(): WhatsAppContext {
    const isWhatsApp = this.isWhatsAppPage();
    if (!isWhatsApp) {
      return { isWhatsApp: false };
    }

    const chatName = this.getActiveChatName();
    const latest = this.getLatestVisibleMessage();

    return {
      isWhatsApp: true,
      chatName,
      latestMessage: latest.text || 'Hlo rohit',
      senderName: chatName
    };
  }

  static findComposer(): HTMLElement | null {
    if (!this.isWhatsAppPage()) return null;

    const selectors = [
      '#main footer div[contenteditable="true"]',
      '#main footer [data-testid="conversation-compose-box-input"]',
      '#main div[contenteditable="true"]',
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"]'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el instanceof HTMLElement) {
        return el;
      }
    }
    return null;
  }

  static insertReply(text: string, autoSend: boolean = false): { success: boolean; message: string } {
    if (!this.isWhatsAppPage()) {
      return { success: false, message: 'WhatsApp Web is not active in this tab.' };
    }

    const composer = this.findComposer();
    if (!composer) {
      return { success: false, message: 'Please open an active chat in WhatsApp Web first.' };
    }

    try {
      composer.focus();

      // Clear & set content directly
      document.execCommand('selectAll', false, undefined);
      const inserted = document.execCommand('insertText', false, text);

      if (!inserted) {
        composer.innerHTML = '';
        const p = document.createElement('p');
        p.className = 'selectable-text copyable-text';
        p.textContent = text;
        composer.appendChild(p);
      }

      // Dispatch Input Events
      composer.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: text, bubbles: true }));
      composer.dispatchEvent(new InputEvent('input', { bubbles: true }));

      // Trigger Send if requested
      if (autoSend) {
        setTimeout(() => {
          // Look for WhatsApp Send button
          const sendBtnSelectors = [
            '#main footer button[aria-label="Send"]',
            '#main footer button[data-testid="compose-btn-send"]',
            '#main footer button span[data-icon="send"]',
            '#main footer button'
          ];

          let clicked = false;
          for (const sel of sendBtnSelectors) {
            const btn = document.querySelector(sel);
            if (btn instanceof HTMLElement) {
              const parentBtn = btn.closest('button');
              if (parentBtn) {
                parentBtn.click();
                clicked = true;
                break;
              }
              btn.click();
              clicked = true;
              break;
            }
          }

          if (!clicked) {
            // Dispatch Enter key event to composer
            const enterEvt = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            });
            composer.dispatchEvent(enterEvt);
          }
        }, 150);
      }

      return {
        success: true,
        message: autoSend ? 'Message typed & sent to WhatsApp!' : 'Message typed into WhatsApp composer!'
      };
    } catch (err: any) {
      return { success: false, message: `Error typing message: ${err.message}` };
    }
  }
}
