import { useState, useEffect, useCallback } from 'react';
import { FocusTimerState } from '../../shared/types';
import { FocusManager } from '../../background/focusManager';

export function useFocusTimer() {
  const [timerState, setTimerState] = useState<FocusTimerState>({
    isActive: false,
    isPaused: false,
    durationMinutes: 25,
    remainingSeconds: 25 * 60,
    startTime: null
  });

  const refreshState = useCallback(async () => {
    const current = await FocusManager.getTimerState();
    setTimerState(current);
  }, []);

  useEffect(() => {
    refreshState();
    const interval = setInterval(() => {
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused) return prev;
        const newSecs = prev.remainingSeconds - 1;
        if (newSecs <= 0) {
          FocusManager.stopTimer();
          return {
            ...prev,
            isActive: false,
            remainingSeconds: 0
          };
        }
        return {
          ...prev,
          remainingSeconds: newSecs
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshState]);

  const startTimer = async (minutes: number = 25) => {
    const updated = await FocusManager.startTimer(minutes);
    setTimerState(updated);
  };

  const pauseTimer = async () => {
    const updated = await FocusManager.pauseTimer();
    setTimerState(updated);
  };

  const resumeTimer = async () => {
    const updated = await FocusManager.resumeTimer();
    setTimerState(updated);
  };

  const stopTimer = async () => {
    const updated = await FocusManager.stopTimer();
    setTimerState(updated);
  };

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    refreshState
  };
}
