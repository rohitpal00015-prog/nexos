import { useState, useEffect, useCallback } from 'react';
import { PageContext, WhatsAppContext } from '../../shared/types';
import { TabManager } from '../../background/tabManager';

export function useTabState() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [whatsappContext, setWhatsappContext] = useState<WhatsAppContext>({ isWhatsApp: false });
  const [totalTabsCount, setTotalTabsCount] = useState<number>(0);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [isRestrictedPage, setIsRestrictedPage] = useState<boolean>(false);

  const refreshTabState = useCallback(async () => {
    try {
      if (!chrome.tabs) return;

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        setActiveTab(tab);
        const url = tab.url || '';

        if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
          setIsRestrictedPage(true);
          setPageContext({
            title: tab.title || 'Chrome System Page',
            url: url || 'chrome://',
            domain: 'chrome'
          });
          setWhatsappContext({ isWhatsApp: false });
        } else {
          setIsRestrictedPage(false);
          // Query Content Script for Page Context with safe fallback
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTEXT' }, (res) => {
              if (chrome.runtime.lastError) {
                // Suppress restriction error silently
                setPageContext({
                  title: tab.title || 'Webpage',
                  url: tab.url || '',
                  domain: tab.url ? new URL(tab.url).hostname : ''
                });
                return;
              }
              if (res && res.success && res.context) {
                setPageContext(res.context);
              } else {
                setPageContext({
                  title: tab.title || 'Webpage',
                  url: tab.url || '',
                  domain: tab.url ? new URL(tab.url).hostname : ''
                });
              }
            });

            // Query WhatsApp Context if applicable
            if (url.includes('web.whatsapp.com')) {
              chrome.tabs.sendMessage(tab.id, { type: 'GET_WHATSAPP_CONTEXT' }, (waRes) => {
                if (chrome.runtime.lastError) {
                  setWhatsappContext({ isWhatsApp: false });
                  return;
                }
                if (waRes && waRes.success && waRes.context) {
                  setWhatsappContext(waRes.context);
                }
              });
            } else {
              setWhatsappContext({ isWhatsApp: false });
            }
          }
        }
      }

      // Count open tabs
      const allTabs = await chrome.tabs.query({ currentWindow: true });
      setTotalTabsCount(allTabs.length);

      // Check duplicates count
      const duplicates = await TabManager.findDuplicateTabs();
      let count = 0;
      duplicates.forEach(d => count += (d.tabs.length - 1));
      setDuplicateCount(count);

    } catch (err) {
      console.warn('[useTabState] Error refreshing tab state:', err);
    }
  }, []);

  useEffect(() => {
    refreshTabState();
    const handleActivated = () => refreshTabState();
    const handleUpdated = (_: number, changeInfo: any) => {
      if (changeInfo.status === 'complete') refreshTabState();
    };

    if (chrome.tabs) {
      chrome.tabs.onActivated.addListener(handleActivated);
      chrome.tabs.onUpdated.addListener(handleUpdated);
    }

    return () => {
      if (chrome.tabs) {
        chrome.tabs.onActivated.removeListener(handleActivated);
        chrome.tabs.onUpdated.removeListener(handleUpdated);
      }
    };
  }, [refreshTabState]);

  return {
    activeTab,
    pageContext,
    whatsappContext,
    totalTabsCount,
    duplicateCount,
    isRestrictedPage,
    refreshTabState
  };
}
