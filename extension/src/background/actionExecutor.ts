import { ActionItem } from '../shared/types';
import { ALLOWED_ACTIONS } from '../shared/constants';
import { TabManager } from './tabManager';
import { FocusManager } from './focusManager';

export class ActionExecutor {
  static validate(action: ActionItem): { valid: boolean; reason?: string } {
    if (!action || !action.name) {
      return { valid: false, reason: 'Invalid or missing action payload' };
    }

    if (!ALLOWED_ACTIONS.includes(action.name as any)) {
      return { valid: false, reason: `Action "${action.name}" is not in the allowed action list.` };
    }

    // Protocol check for URLs
    if (action.name === 'OPEN_URL' || action.name === 'CREATE_TAB') {
      const url = action.parameters?.url;
      if (!url) return { valid: false, reason: 'Missing URL parameter' };
      try {
        const p = new URL(url).protocol;
        if (p !== 'http:' && p !== 'https:') {
          return { valid: false, reason: `Unsafe URL protocol "${p}". Only http and https allowed.` };
        }
      } catch {
        return { valid: false, reason: 'Invalid URL format' };
      }
    }

    return { valid: true };
  }

  static async execute(action: ActionItem): Promise<{ success: boolean; message: string; data?: any }> {
    const validation = this.validate(action);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Execution rejected' };
    }

    const { name, parameters } = action;

    try {
      switch (name) {
        case 'OPEN_URL': {
          const tab = await TabManager.openOrActivateTab(parameters?.url);
          return { success: true, message: `Navigated to ${parameters?.url}`, data: { tabId: tab.id } };
        }

        case 'SEARCH_YOUTUBE': {
          const query = encodeURIComponent(parameters?.query || 'lo-fi music');
          const url = `https://www.youtube.com/results?search_query=${query}`;
          const tab = await TabManager.openOrActivateTab(url);
          return { success: true, message: `Searched YouTube for "${parameters?.query}"`, data: { tabId: tab.id } };
        }

        case 'CLOSE_CURRENT_TAB': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.remove(activeTab.id);
            return { success: true, message: 'Closed current tab' };
          }
          return { success: false, message: 'No active tab to close' };
        }

        case 'MUTE_CURRENT_TAB': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.update(activeTab.id, { muted: true });
            return { success: true, message: 'Muted current tab' };
          }
          return { success: false, message: 'No active tab to mute' };
        }

        case 'UNMUTE_CURRENT_TAB': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.update(activeTab.id, { muted: false });
            return { success: true, message: 'Unmuted current tab' };
          }
          return { success: false, message: 'No active tab to unmute' };
        }

        case 'REFRESH_TAB': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.reload(activeTab.id);
            return { success: true, message: 'Refreshed active page' };
          }
          return { success: false, message: 'No active tab to refresh' };
        }

        case 'GO_BACK': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.goBack(activeTab.id);
            return { success: true, message: 'Navigated back' };
          }
          return { success: false, message: 'Could not go back' };
        }

        case 'GO_FORWARD': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.goForward(activeTab.id);
            return { success: true, message: 'Navigated forward' };
          }
          return { success: false, message: 'Could not go forward' };
        }

        case 'GROUP_TABS': {
          await TabManager.groupTabsByCategory();
          return { success: true, message: 'Grouped open tabs by domain category' };
        }

        case 'CLOSE_DUPLICATE_TABS': {
          const count = await TabManager.closeDuplicateTabs();
          return { success: true, message: `Closed ${count} duplicate tab(s)` };
        }

        case 'START_FOCUS_TIMER': {
          const minutes = parameters?.durationMinutes || 25;
          const state = await FocusManager.startTimer(minutes);
          return { success: true, message: `Started ${minutes}-minute focus timer`, data: state };
        }

        case 'STOP_FOCUS_TIMER': {
          const state = await FocusManager.stopTimer();
          return { success: true, message: 'Stopped focus timer', data: state };
        }

        case 'INSERT_TEXT': {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            const response = await chrome.tabs.sendMessage(activeTab.id, {
              type: 'INSERT_WHATSAPP_REPLY',
              text: parameters?.text
            });
            return { success: true, message: 'Inserted text into WhatsApp composer', data: response };
          }
          return { success: false, message: 'No active tab to insert text' };
        }

        default:
          return { success: false, message: `Unhandled action: ${name}` };
      }
    } catch (err: any) {
      console.error(`[ActionExecutor] Execution error for ${name}:`, err);
      return { success: false, message: err.message || 'Action execution failed' };
    }
  }
}
