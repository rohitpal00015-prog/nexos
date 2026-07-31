import { LocalCommandParser } from './localCommandParser';
import { ActionExecutor } from './actionExecutor';
import { FocusManager } from './focusManager';

// Enable side panel on click
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Nexora Background] Service worker installed successfully.');
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('[Nexora Background] Failed to set side panel behavior:', err);
    });
  }
});

// Alarm Listener for Focus Timer
chrome.alarms.onAlarm.addListener((alarm) => {
  FocusManager.handleAlarmFired(alarm);
});

// Runtime Messaging Dispatcher
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_USER_COMMAND') {
    (async () => {
      try {
        const text = message.text;
        // Layer 1: Check Local Parser first
        const localActionResult = LocalCommandParser.parse(text);

        if (localActionResult) {
          if (localActionResult.action && !localActionResult.requiresConfirmation) {
            const execResult = await ActionExecutor.execute(localActionResult.action);
            sendResponse({
              success: true,
              isLocal: true,
              data: {
                ...localActionResult,
                executionResult: execResult
              }
            });
            return;
          }
          sendResponse({ success: true, isLocal: true, data: localActionResult });
          return;
        }

        // Layer 2: Send to backend for AI classification if local parser doesn't match
        sendResponse({ success: true, isLocal: false, needsBackend: true });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (message.type === 'EXECUTE_ACTION') {
    (async () => {
      const result = await ActionExecutor.execute(message.action);
      sendResponse(result);
    })();
    return true;
  }
});
