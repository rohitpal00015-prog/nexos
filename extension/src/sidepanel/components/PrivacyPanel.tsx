import React from 'react';
import { UserSettings } from '../../services/storage';
import { Shield, Mic, Lock, Database, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrivacyPanelProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearData: () => void;
}

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({
  settings,
  onUpdateSettings,
  onClearData
}) => {
  return (
    <div className="space-y-4">
      {/* Privacy Shield Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold">Privacy & Security Defaults</h3>
            <p className="text-[11px] text-slate-400">User remains in full control at all times.</p>
          </div>
        </div>

        <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Deterministic local commands run directly in browser without API calls.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Sensitive actions (inserting text, closing multiple tabs) require user confirmation.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>No automatic WhatsApp message sending or background eavesdropping.</span>
          </li>
        </ul>
      </div>

      {/* Permissions & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Granted Extension Controls</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Push-to-Talk Microphone</div>
                <div className="text-[10px] text-slate-400">Active only when holding/clicking mic</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.micEnabled}
              onChange={(e) => onUpdateSettings({ micEnabled: e.target.checked })}
              className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">WhatsApp Web Helper</div>
                <div className="text-[10px] text-slate-400">Limit context extraction to active chat</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.whatsappIntegrationEnabled}
              onChange={(e) => onUpdateSettings({ whatsappIntegrationEnabled: e.target.checked })}
              className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Local Chat History</div>
                <div className="text-[10px] text-slate-400">Persist recent chat in chrome.storage.local</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.localHistoryEnabled}
              onChange={(e) => onUpdateSettings({ localHistoryEnabled: e.target.checked })}
              className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Clear Data */}
      <div className="pt-2">
        <button
          onClick={onClearData}
          className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/40 text-rose-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Local Extension Data
        </button>
      </div>
    </div>
  );
};
