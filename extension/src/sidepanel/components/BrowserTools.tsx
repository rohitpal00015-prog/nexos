import React from 'react';
import { LayoutGrid, CopyX, VolumeX, Volume2, XCircle, RotateCw, ExternalLink } from 'lucide-react';

interface BrowserToolsProps {
  totalTabsCount: number;
  duplicateCount: number;
  onExecuteLocalAction: (actionName: string, params?: any) => void;
  isLoading: boolean;
}

export const BrowserTools: React.FC<BrowserToolsProps> = ({
  totalTabsCount,
  duplicateCount,
  onExecuteLocalAction,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      {/* Quick Overview Card */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Active Tab Manager</h2>
          <p className="text-lg font-bold text-slate-100 mt-0.5">{totalTabsCount} Open Tabs</p>
        </div>
        {duplicateCount > 0 ? (
          <button
            onClick={() => onExecuteLocalAction('CLOSE_DUPLICATE_TABS')}
            disabled={isLoading}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Click to clean duplicate tabs"
          >
            <CopyX className="w-3.5 h-3.5" />
            <span>{duplicateCount} Duplicates</span>
            <span className="font-bold underline ml-1">Clean Now</span>
          </button>
        ) : (
          <button
            onClick={() => onExecuteLocalAction('CLEAN_SESSION')}
            disabled={isLoading}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Click to run full session cleanup"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-once" />
            <span>Clean Session</span>
          </button>
        )}
      </div>

      {/* Primary Actions Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tab Organization</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onExecuteLocalAction('GROUP_TABS')}
            disabled={isLoading}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Group Tabs</div>
              <div className="text-[10px] text-slate-400">Categorize by domain</div>
            </div>
          </button>

          <button
            onClick={() => onExecuteLocalAction('CLOSE_DUPLICATE_TABS')}
            disabled={isLoading || duplicateCount === 0}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition group ${
              duplicateCount > 0
                ? 'bg-rose-950/20 hover:bg-rose-900/30 border-rose-500/30'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition">
              <CopyX className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Close Duplicates</div>
              <div className="text-[10px] text-slate-400">{duplicateCount} duplicate tabs</div>
            </div>
          </button>
        </div>
      </div>

      {/* Active Tab Quick Controls */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tab Controls</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onExecuteLocalAction('MUTE_CURRENT_TAB')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition text-[11px]"
            title="Mute current tab"
          >
            <VolumeX className="w-4 h-4 mb-1 text-slate-400" />
            Mute
          </button>

          <button
            onClick={() => onExecuteLocalAction('UNMUTE_CURRENT_TAB')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition text-[11px]"
            title="Unmute current tab"
          >
            <Volume2 className="w-4 h-4 mb-1 text-slate-400" />
            Unmute
          </button>

          <button
            onClick={() => onExecuteLocalAction('REFRESH_TAB')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition text-[11px]"
            title="Refresh current page"
          >
            <RotateCw className="w-4 h-4 mb-1 text-slate-400" />
            Refresh
          </button>

          <button
            onClick={() => onExecuteLocalAction('CLOSE_CURRENT_TAB')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition text-[11px]"
            title="Close active tab"
          >
            <XCircle className="w-4 h-4 mb-1 text-rose-400" />
            Close
          </button>
        </div>
      </div>

      {/* Open Common Destinations */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Destinations</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onExecuteLocalAction('OPEN_URL', { url: 'https://www.youtube.com' })}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition"
          >
            <span>Open YouTube</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => onExecuteLocalAction('OPEN_URL', { url: 'https://mail.google.com' })}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition"
          >
            <span>Open Gmail</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => onExecuteLocalAction('OPEN_URL', { url: 'https://web.whatsapp.com' })}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition"
          >
            <span>Open WhatsApp Web</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
