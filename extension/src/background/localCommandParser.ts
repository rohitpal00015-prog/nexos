import { ActionResponse } from '../shared/types';

export class LocalCommandParser {
  static parse(text: string): ActionResponse | null {
    const norm = text.toLowerCase().trim();

    // 1. YouTube Search & Open (Clean Query Parsing)
    if (norm.includes('youtube') && (norm.includes('search') || norm.includes('play') || norm.includes('lofi') || norm.includes('lo-fi') || norm.includes('music'))) {
      let query = text.replace(/open|search|youtube|&|for|play|music/gi, '').trim();
      if (!query || query.length < 2) query = 'lofi hip hop music live';
      return {
        type: 'ACTION',
        spokenResponse: `Searching YouTube for ${query}`,
        action: {
          name: 'SEARCH_YOUTUBE',
          parameters: { query }
        },
        requiresConfirmation: false
      };
    }

    // 1b. General Web / Google Search
    const webSearchRegex = /^(?:go to web and search(?: for)?|search web for|search on web for|search on web|search google for|google search for|google search|web search|google|search for|search)\s+(.+)$/i;
    const webSearchMatch = text.match(webSearchRegex);
    if (webSearchMatch && !norm.includes('youtube') && !norm.includes('focus') && !norm.includes('tab')) {
      const query = webSearchMatch[1].trim();
      if (query.length > 0) {
        return {
          type: 'ACTION',
          spokenResponse: `Searching web for ${query}`,
          action: {
            name: 'SEARCH_WEB',
            parameters: { query }
          },
          requiresConfirmation: false
        };
      }
    }

    if (norm.startsWith('open youtube')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Opening YouTube',
        action: { name: 'OPEN_URL', parameters: { url: 'https://www.youtube.com' } },
        requiresConfirmation: false
      };
    }

    // 2. Meta-Wiki & Wikipedia Triggers
    if (norm.includes('open metawiki') || norm.includes('open meta wiki') || norm.includes('open meta-wiki')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Opening Wikimedia Meta-Wiki',
        action: { name: 'OPEN_URL', parameters: { url: 'https://meta.wikimedia.org' } },
        requiresConfirmation: false
      };
    }

    if (norm.includes('open wikipedia') || norm.includes('open wiki')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Opening Wikipedia',
        action: { name: 'OPEN_URL', parameters: { url: 'https://www.wikipedia.org' } },
        requiresConfirmation: false
      };
    }

    // 3. Common Website Shortcuts
    if (norm.startsWith('open gmail') || norm.includes('open my mail')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Opening Gmail',
        action: { name: 'OPEN_URL', parameters: { url: 'https://mail.google.com' } },
        requiresConfirmation: false
      };
    }

    if (norm.startsWith('open whatsapp') || norm.includes('find my whatsapp') || norm.includes('switch to whatsapp')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Navigating to WhatsApp Web',
        action: { name: 'OPEN_URL', parameters: { url: 'https://web.whatsapp.com' } },
        requiresConfirmation: false
      };
    }

    if (norm.startsWith('open github')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Opening GitHub',
        action: { name: 'OPEN_URL', parameters: { url: 'https://github.com' } },
        requiresConfirmation: false
      };
    }

    if (norm.startsWith('open google')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Opening Google',
        action: { name: 'OPEN_URL', parameters: { url: 'https://www.google.com' } },
        requiresConfirmation: false
      };
    }

    // Dynamic Generic "open <name>" Fallback
    if (norm.startsWith('open ')) {
      const site = norm.replace('open ', '').trim().replace(/\s+/g, '');
      if (site.length > 1) {
        const targetUrl = site.includes('.') ? `https://${site}` : `https://www.${site}.com`;
        return {
          type: 'ACTION',
          spokenResponse: `Opening ${site}`,
          action: { name: 'OPEN_URL', parameters: { url: targetUrl } },
          requiresConfirmation: false
        };
      }
    }

    // 4. Tab Actions (Mute, Unmute, Refresh, Close, Back, Forward)
    if (norm.includes('mute') && (norm.includes('tab') || norm.includes('page') || norm.includes('current'))) {
      return {
        type: 'ACTION',
        spokenResponse: 'Muting current tab',
        action: { name: 'MUTE_CURRENT_TAB', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm.includes('unmute') && (norm.includes('tab') || norm.includes('page') || norm.includes('current'))) {
      return {
        type: 'ACTION',
        spokenResponse: 'Unmuting current tab',
        action: { name: 'UNMUTE_CURRENT_TAB', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm === 'close tab' || norm === 'close current tab' || norm === 'close this tab') {
      return {
        type: 'ACTION',
        spokenResponse: 'Closing current tab',
        action: { name: 'CLOSE_CURRENT_TAB', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm === 'refresh page' || norm === 'reload page' || norm === 'refresh') {
      return {
        type: 'ACTION',
        spokenResponse: 'Refreshing page',
        action: { name: 'REFRESH_TAB', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm === 'go back' || norm === 'back') {
      return {
        type: 'ACTION',
        spokenResponse: 'Navigating back',
        action: { name: 'GO_BACK', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm === 'go forward' || norm === 'forward') {
      return {
        type: 'ACTION',
        spokenResponse: 'Navigating forward',
        action: { name: 'GO_FORWARD', parameters: {} },
        requiresConfirmation: false
      };
    }

    // 5. Group & Duplicate Tabs (INSTANT EXECUTION)
    if (norm.includes('group') && (norm.includes('tab') || norm.includes('tabs'))) {
      return {
        type: 'ACTION',
        spokenResponse: 'Grouping open tabs by category',
        action: { name: 'GROUP_TABS', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm.includes('close duplicate') || norm.includes('remove duplicate') || norm.includes('clean duplicate')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Closing duplicate open tabs',
        action: { name: 'CLOSE_DUPLICATE_TABS', parameters: {} },
        requiresConfirmation: false
      };
    }

    if (norm.includes('clean session') || norm.includes('clear session') || norm.includes('clean workspace') || norm === 'clean session' || norm === 'clean') {
      return {
        type: 'ACTION',
        spokenResponse: 'Cleaning session and checking duplicate tabs',
        action: { name: 'CLEAN_SESSION', parameters: {} },
        requiresConfirmation: false
      };
    }

    // 6. Focus Timer
    if (norm.includes('start focus') || norm.includes('start pomodoro') || norm.includes('25 minute focus') || norm.includes('focus timer')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Starting 25-minute focus session',
        action: { name: 'START_FOCUS_TIMER', parameters: { durationMinutes: 25 } },
        requiresConfirmation: false
      };
    }

    if (norm.includes('stop focus') || norm.includes('stop timer')) {
      return {
        type: 'ACTION',
        spokenResponse: 'Stopping focus session',
        action: { name: 'STOP_FOCUS_TIMER', parameters: {} },
        requiresConfirmation: false
      };
    }

    return null;
  }
}
