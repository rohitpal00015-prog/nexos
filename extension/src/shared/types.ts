export type AssistantStatus =
  | 'Ready'
  | 'Listening'
  | 'Thinking'
  | 'Executing'
  | 'Waiting for confirmation'
  | 'Error';

export type AllowedActionName =
  | 'OPEN_URL'
  | 'ACTIVATE_TAB'
  | 'CREATE_TAB'
  | 'CLOSE_CURRENT_TAB'
  | 'MUTE_CURRENT_TAB'
  | 'UNMUTE_CURRENT_TAB'
  | 'REFRESH_TAB'
  | 'GO_BACK'
  | 'GO_FORWARD'
  | 'SEARCH_YOUTUBE'
  | 'SEARCH_WEB'
  | 'GROUP_TABS'
  | 'CLOSE_DUPLICATE_TABS'
  | 'START_FOCUS_TIMER'
  | 'PAUSE_FOCUS_TIMER'
  | 'STOP_FOCUS_TIMER'
  | 'GET_PAGE_CONTEXT'
  | 'INSERT_TEXT'
  | 'CLEAN_SESSION';

export interface ActionItem {
  name: AllowedActionName;
  parameters?: Record<string, any>;
}

export interface ActionResponse {
  type: 'ACTION' | 'MULTI_ACTION';
  spokenResponse?: string;
  action?: ActionItem;
  actions?: ActionItem[];
  requiresConfirmation?: boolean;
  confirmationDetails?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actionPayload?: ActionResponse;
  summaryData?: any;
  explanationData?: any;
  whatsappReply?: any;
  claimAnalysis?: any;
}

export interface PageContext {
  title: string;
  url: string;
  domain: string;
  selectedText?: string;
  mainText?: string;
  headings?: string[];
  metadata?: Record<string, any>;
}

export interface FocusTimerState {
  isActive: boolean;
  isPaused: boolean;
  durationMinutes: number;
  remainingSeconds: number;
  startTime: number | null;
}

export interface TabGroupCategory {
  category: 'Study' | 'Work' | 'Social' | 'Media' | 'Documentation' | 'Other';
  tabs: chrome.tabs.Tab[];
}

export interface ClaimAnalysisResult {
  classification: 'VERIFIED' | 'LIKELY_TRUE' | 'MISLEADING' | 'UNVERIFIED' | 'LIKELY_FALSE' | 'OPINION' | 'SATIRE' | 'INSUFFICIENT_EVIDENCE' | 'POTENTIALLY_SUSPICIOUS';
  confidence: number;
  claims: string[];
  warningSignals: string[];
  reasoning: string[];
  recommendedAction: string;
  requiresExternalVerification: boolean;
}

export interface WhatsAppContext {
  isWhatsApp: boolean;
  chatName?: string;
  latestMessage?: string;
  senderName?: string;
}
