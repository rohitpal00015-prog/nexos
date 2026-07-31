import React from 'react';
import { AssistantStatus } from '../../shared/types';
import { Sparkles, Shield, Mic, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  status: AssistantStatus;
  activeSection: 'chat' | 'tools' | 'productivity' | 'whatsapp' | 'privacy';
  setActiveSection: (sec: 'chat' | 'tools' | 'productivity' | 'whatsapp' | 'privacy') => void;
  isWhatsAppActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeSection,
  setActiveSection,
  isWhatsAppActive
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'Listening':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            <Mic className="w-3 h-3 text-rose-400" />
            Listening...
          </span>
        );
      case 'Thinking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Thinking...
          </span>
        );
      case 'Executing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Bot className="w-3 h-3 text-indigo-400" />
            Executing...
          </span>
        );
      case 'Waiting for confirmation':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            Confirm
          </span>
        );
      case 'Error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Ready
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 p-3.5 space-y-3">
      {/* Top Title & Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              Nexora AI
              <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                Copilot
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Intelligent Browser Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={() => setActiveSection('privacy')}
            title="Privacy Settings"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav className="flex items-center justify-between gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveSection('chat')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeSection === 'chat'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveSection('tools')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeSection === 'tools'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveSection('productivity')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeSection === 'productivity'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Focus
        </button>
        {isWhatsAppActive && (
          <button
            onClick={() => setActiveSection('whatsapp')}
            className={`flex-1 py-1.5 rounded-lg text-center transition relative ${
              activeSection === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
            }`}
          >
            WhatsApp
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>
        )}
      </nav>
    </header>
  );
};
