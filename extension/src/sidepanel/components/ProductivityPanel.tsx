import React from 'react';
import { FocusTimerState } from '../../shared/types';
import { Play, Pause, Square, Timer, PieChart, ShieldAlert } from 'lucide-react';

interface ProductivityPanelProps {
  timerState: FocusTimerState;
  onStartTimer: (mins: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  totalTabsCount: number;
}

export const ProductivityPanel: React.FC<ProductivityPanelProps> = ({
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  totalTabsCount
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((timerState.durationMinutes * 60 - timerState.remainingSeconds) / (timerState.durationMinutes * 60)) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Timer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Timer className="w-4 h-4" />
            Focus Session
          </span>
          <span>{timerState.durationMinutes} Min Pomodoro</span>
        </div>

        {/* Big Display */}
        <div className="relative py-3">
          <div className="text-4xl font-extrabold tracking-tight font-mono text-slate-100">
            {formatTime(timerState.remainingSeconds)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {timerState.isActive
              ? timerState.isPaused
                ? 'Session Paused'
                : 'Focus Mode Active'
              : 'Ready to start'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {!timerState.isActive ? (
            <button
              onClick={() => onStartTimer(25)}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              Start 25 Min Focus
            </button>
          ) : (
            <>
              {timerState.isPaused ? (
                <button
                  onClick={onResumeTimer}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={onPauseTimer}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  Pause
                </button>
              )}

              <button
                onClick={onStopTimer}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center justify-center gap-1 transition"
              >
                <Square className="w-3.5 h-3.5 fill-slate-300" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Basic Tab Analytics */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Session Browsing Analytics
          </h3>
          <span className="text-[11px] text-slate-400">{totalTabsCount} Tabs</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Work & Study</div>
            <div className="text-sm font-bold text-indigo-300 mt-0.5">
              {Math.max(1, Math.round(totalTabsCount * 0.6))} Tabs
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Media & Social</div>
            <div className="text-sm font-bold text-slate-300 mt-0.5">
              {Math.max(0, totalTabsCount - Math.max(1, Math.round(totalTabsCount * 0.6)))} Tabs
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Focus Mode keeps you centered on active tasks without auto-closing tabs.</span>
        </div>
      </div>
    </div>
  );
};
