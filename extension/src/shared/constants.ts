export const ALLOWED_ACTIONS = [
  'OPEN_URL',
  'ACTIVATE_TAB',
  'CREATE_TAB',
  'CLOSE_CURRENT_TAB',
  'MUTE_CURRENT_TAB',
  'UNMUTE_CURRENT_TAB',
  'REFRESH_TAB',
  'GO_BACK',
  'GO_FORWARD',
  'SEARCH_YOUTUBE',
  'GROUP_TABS',
  'CLOSE_DUPLICATE_TABS',
  'START_FOCUS_TIMER',
  'PAUSE_FOCUS_TIMER',
  'STOP_FOCUS_TIMER',
  'GET_PAGE_CONTEXT',
  'INSERT_TEXT'
] as const;

export const BACKEND_URL = 'http://localhost:3001/api/assistant';

export const DOMAIN_CATEGORIES: Record<string, 'Study' | 'Work' | 'Social' | 'Media' | 'Documentation'> = {
  'youtube.com': 'Media',
  'spotify.com': 'Media',
  'netflix.com': 'Media',
  'github.com': 'Work',
  'gitlab.com': 'Work',
  'stackoverflow.com': 'Work',
  'docs.google.com': 'Work',
  'web.whatsapp.com': 'Social',
  'twitter.com': 'Social',
  'x.com': 'Social',
  'linkedin.com': 'Social',
  'reddit.com': 'Social',
  'wikipedia.org': 'Study',
  'arxiv.org': 'Study',
  'coursera.org': 'Study',
  'developer.mozilla.org': 'Documentation'
};
