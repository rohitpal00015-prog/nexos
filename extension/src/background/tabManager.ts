import { DOMAIN_CATEGORIES } from '../shared/constants';

export class TabManager {
  static async openOrActivateTab(url: string): Promise<chrome.tabs.Tab> {
    try {
      const parsedUrl = new URL(url);
      const tabs = await chrome.tabs.query({ currentWindow: true });
      
      const existingTab = tabs.find(t => {
        if (!t.url) return false;
        try {
          const u = new URL(t.url);
          return u.hostname.replace('www.', '') === parsedUrl.hostname.replace('www.', '');
        } catch {
          return false;
        }
      });

      if (existingTab && existingTab.id) {
        await chrome.tabs.update(existingTab.id, { active: true });
        if (existingTab.url !== url && url !== 'https://web.whatsapp.com') {
          await chrome.tabs.update(existingTab.id, { url });
        }
        return existingTab;
      }
    } catch (err) {
      console.warn('[TabManager] Query/Parse URL error, creating new tab:', err);
    }

    return await chrome.tabs.create({ url });
  }

  static normalizeUrl(urlStr?: string): string {
    if (!urlStr) return '';
    try {
      const u = new URL(urlStr);
      // Remove trailing slash, tracking params (utm_*), and hash fragments
      let cleanPath = u.pathname.replace(/\/$/, '');
      const searchParams = new URLSearchParams(u.search);
      const keysToDelete: string[] = [];
      searchParams.forEach((_, key) => {
        if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid') {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(k => searchParams.delete(k));

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return `${u.protocol}//${u.hostname}${cleanPath}${queryStr}`;
    } catch {
      return urlStr || '';
    }
  }

  static async findDuplicateTabs(): Promise<{ url: string; tabs: chrome.tabs.Tab[] }[]> {
    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const urlMap = new Map<string, chrome.tabs.Tab[]>();

    for (const tab of allTabs) {
      if (!tab.url || tab.url.startsWith('chrome://')) continue;
      const norm = this.normalizeUrl(tab.url);
      if (!urlMap.has(norm)) {
        urlMap.set(norm, []);
      }
      urlMap.get(norm)!.push(tab);
    }

    const duplicates: { url: string; tabs: chrome.tabs.Tab[] }[] = [];
    urlMap.forEach((tabs, url) => {
      if (tabs.length > 1) {
        duplicates.push({ url, tabs });
      }
    });

    return duplicates;
  }

  static async closeDuplicateTabs(): Promise<number> {
    const duplicates = await this.findDuplicateTabs();
    let closedCount = 0;

    for (const item of duplicates) {
      // Keep the active tab or the first one, close the rest
      const [first, ...rest] = item.tabs;
      const toCloseIds = rest
        .filter(t => t.id !== undefined && !t.active)
        .map(t => t.id!);

      if (toCloseIds.length > 0) {
        await chrome.tabs.remove(toCloseIds);
        closedCount += toCloseIds.length;
      }
    }

    return closedCount;
  }

  static async groupTabsByCategory(): Promise<void> {
    if (!chrome.tabGroups) return; // Fallback if tabGroups API unavailable

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const categories: Record<string, number[]> = {
      Study: [],
      Work: [],
      Social: [],
      Media: [],
      Documentation: [],
      Other: []
    };

    for (const tab of tabs) {
      if (!tab.id || !tab.url || tab.url.startsWith('chrome://')) continue;
      try {
        const hostname = new URL(tab.url).hostname.replace('www.', '');
        const matchedCategory = DOMAIN_CATEGORIES[hostname] || 'Other';
        categories[matchedCategory].push(tab.id);
      } catch {
        categories['Other'].push(tab.id);
      }
    }

    for (const [catName, tabIds] of Object.entries(categories)) {
      if (tabIds.length > 0) {
        try {
          const groupId = await chrome.tabs.group({ tabIds });
          await chrome.tabGroups.update(groupId, {
            title: catName,
            collapsed: false
          });
        } catch (err) {
          console.warn(`[TabManager] Could not group category ${catName}:`, err);
        }
      }
    }
  }
}
