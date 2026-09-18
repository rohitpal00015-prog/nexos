import { z } from 'zod';

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  pageContext: z.object({
    title: z.string().optional(),
    url: z.string().optional(),
    domain: z.string().optional(),
    selectedText: z.string().optional(),
    mainText: z.string().optional(),
    headings: z.array(z.string()).optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
});

export const PageSummaryRequestSchema = z.object({
  title: z.string(),
  url: z.string(),
  mainText: z.string(),
  selectedText: z.string().optional(),
});

export const ExplainTextRequestSchema = z.object({
  selectedText: z.string().min(1),
  pageTitle: z.string().optional(),
  pageUrl: z.string().optional(),
});

export const WhatsAppReplyRequestSchema = z.object({
  incomingMessage: z.string().min(1),
  senderName: z.string().optional(),
  tone: z.enum(['Friendly', 'Professional', 'Concise', 'Polite', 'Hinglish', 'Formal']).default('Friendly'),
  customInstruction: z.string().optional(),
});

export const AnalyseClaimRequestSchema = z.object({
  claimText: z.string().min(1),
  sourceUrl: z.string().optional(),
});

// Outbound AI Schema definitions
export const AllowedActionNames = z.enum([
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
  'SEARCH_WEB',
  'GROUP_TABS',
  'CLOSE_DUPLICATE_TABS',
  'START_FOCUS_TIMER',
  'PAUSE_FOCUS_TIMER',
  'STOP_FOCUS_TIMER',
  'GET_PAGE_CONTEXT',
  'INSERT_TEXT',
  'CLEAN_SESSION'
]);

export const ActionItemSchema = z.object({
  name: AllowedActionNames,
  parameters: z.record(z.any()).optional().default({}),
});

export const BaseAiResponseSchema = z.object({
  type: z.enum(['ANSWER', 'ACTION', 'MULTI_ACTION', 'PAGE_SUMMARY', 'TEXT_EXPLANATION', 'WHATSAPP_REPLY', 'CLAIM_ANALYSIS', 'ERROR']),
  spokenResponse: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type PageSummaryRequest = z.infer<typeof PageSummaryRequestSchema>;
export type ExplainTextRequest = z.infer<typeof ExplainTextRequestSchema>;
export type WhatsAppReplyRequest = z.infer<typeof WhatsAppReplyRequestSchema>;
export type AnalyseClaimRequest = z.infer<typeof AnalyseClaimRequestSchema>;
