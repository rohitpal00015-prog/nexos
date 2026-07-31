import { ChatMessage } from '../shared/types';

export interface UserSettings {
  micEnabled: boolean;
  whatsappIntegrationEnabled: boolean;
  pageContextEnabled: boolean;
  localHistoryEnabled: boolean;
  speakAnswers: boolean;
  language: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  micEnabled: true,
  whatsappIntegrationEnabled: true,
  pageContextEnabled: true,
  localHistoryEnabled: true,
  speakAnswers: false,
  language: 'en-IN'
};

export class StorageService {
  private static CHAT_KEY = 'NEXORA_CHAT_HISTORY';
  private static SETTINGS_KEY = 'NEXORA_SETTINGS';

  static async getSettings(): Promise<UserSettings> {
    try {
      const data = await chrome.storage.local.get([this.SETTINGS_KEY]);
      return { ...DEFAULT_SETTINGS, ...data[this.SETTINGS_KEY] };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await chrome.storage.local.set({ [this.SETTINGS_KEY]: updated });
    return updated;
  }

  static async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const data = await chrome.storage.local.get([this.CHAT_KEY]);
      return data[this.CHAT_KEY] || [];
    } catch {
      return [];
    }
  }

  static async saveChatMessage(msg: ChatMessage): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.localHistoryEnabled) return;

    const history = await this.getChatHistory();
    const updated = [...history, msg].slice(-50); // Keep last 50 messages
    await chrome.storage.local.set({ [this.CHAT_KEY]: updated });
  }

  static async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
  }
}
