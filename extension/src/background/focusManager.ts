import { FocusTimerState } from '../shared/types';

export class FocusManager {
  private static ALARM_NAME = 'NEXORA_FOCUS_ALARM';
  private static STORAGE_KEY = 'NEXORA_FOCUS_STATE';

  static async getTimerState(): Promise<FocusTimerState> {
    const data = await chrome.storage.local.get([this.STORAGE_KEY]);
    if (data[this.STORAGE_KEY]) {
      return data[this.STORAGE_KEY];
    }
    return {
      isActive: false,
      isPaused: false,
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      startTime: null
    };
  }

  static async startTimer(durationMinutes: number = 25): Promise<FocusTimerState> {
    const remainingSeconds = durationMinutes * 60;
    const newState: FocusTimerState = {
      isActive: true,
      isPaused: false,
      durationMinutes,
      remainingSeconds,
      startTime: Date.now()
    };

    await chrome.storage.local.set({ [this.STORAGE_KEY]: newState });

    // Create Alarm for completion
    await chrome.alarms.create(this.ALARM_NAME, {
      delayInMinutes: durationMinutes
    });

    return newState;
  }

  static async pauseTimer(): Promise<FocusTimerState> {
    const currentState = await this.getTimerState();
    if (!currentState.isActive) return currentState;

    await chrome.alarms.clear(this.ALARM_NAME);
    const updated: FocusTimerState = {
      ...currentState,
      isPaused: true
    };
    await chrome.storage.local.set({ [this.STORAGE_KEY]: updated });
    return updated;
  }

  static async resumeTimer(): Promise<FocusTimerState> {
    const currentState = await this.getTimerState();
    if (!currentState.isActive || !currentState.isPaused) return currentState;

    const remainingMinutes = Math.max(0.1, currentState.remainingSeconds / 60);
    await chrome.alarms.create(this.ALARM_NAME, {
      delayInMinutes: remainingMinutes
    });

    const updated: FocusTimerState = {
      ...currentState,
      isPaused: false
    };
    await chrome.storage.local.set({ [this.STORAGE_KEY]: updated });
    return updated;
  }

  static async stopTimer(): Promise<FocusTimerState> {
    await chrome.alarms.clear(this.ALARM_NAME);
    const resetState: FocusTimerState = {
      isActive: false,
      isPaused: false,
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      startTime: null
    };
    await chrome.storage.local.set({ [this.STORAGE_KEY]: resetState });
    return resetState;
  }

  static handleAlarmFired(alarm: chrome.alarms.Alarm) {
    if (alarm.name === this.ALARM_NAME) {
      this.stopTimer();
      // Notify user via Chrome notification if available
      try {
        if (chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Nexora AI — Focus Session Complete!',
            message: 'Great work! Take a 5-minute break.'
          });
        }
      } catch (err) {
        console.log('[FocusManager] Alarm completed:', err);
      }
    }
  }
}
