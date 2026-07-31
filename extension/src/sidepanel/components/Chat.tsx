import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ActionResponse } from '../../shared/types';
import { Send, Mic, MicOff, Volume2, Copy, Check, Sparkles, User, Bot, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSpeak: (text: string) => void;
  onConfirmAction: (action: ActionResponse) => void;
  isLoading: boolean;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isListening,
  onStartListening,
  onStopListening,
  onSpeak,
  onConfirmAction,
  isLoading
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickCommands = [
    { label: '🎵 Search YouTube Lofi', command: 'Open YouTube & play lofi music' },
    { label: '📄 Summarize Page', command: 'Summarize this page' },
    { label: '🌐 Open Meta-Wiki', command: 'Open Meta-Wiki' },
    { label: '📂 Group Open Tabs', command: 'Group open tabs' },
    { label: '⏱️ Start Focus Timer', command: 'Start 25 min focus timer' },
    { label: '🧹 Close Duplicate Tabs', command: 'Close duplicate tabs' },
    { label: '🔇 Mute Current Tab', command: 'Mute current tab' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-185px)] justify-between space-y-3">
      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">How can I assist your browsing?</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Ask questions, control browser tabs, summarize articles, or draft WhatsApp Web replies.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs space-y-2 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Structured Summary Render */}
                {msg.summaryData && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-slate-300">
                    <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      Key Takeaways
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      {msg.summaryData.keyPoints?.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structured WhatsApp Reply Render */}
                {msg.whatsappReply && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold">Drafted WhatsApp Reply ({msg.whatsappReply.tone})</span>
                    </div>
                    <p className="bg-slate-950/80 p-2 rounded-lg text-slate-100 font-mono text-[11px]">
                      "{msg.whatsappReply.reply}"
                    </p>
                  </div>
                )}

                {/* Claim Analysis Render */}
                {msg.claimAnalysis && (
                  <div className={`mt-2 p-2.5 rounded-xl border text-xs space-y-2 ${
                    msg.claimAnalysis.classification === 'POTENTIALLY_SUSPICIOUS'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Status: {msg.claimAnalysis.classification}
                      </span>
                      <span>{msg.claimAnalysis.confidence}% Match</span>
                    </div>
                    {msg.claimAnalysis.warningSignals?.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {msg.claimAnalysis.warningSignals.map((ws: string, i: number) => (
                          <li key={i}>{ws}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[11px] font-medium pt-1 border-t border-slate-700/50">
                      💡 {msg.claimAnalysis.recommendedAction}
                    </p>
                  </div>
                )}

                {/* Confirmation prompt for actions */}
                {msg.actionPayload?.requiresConfirmation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                    <p className="text-[11px] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      {msg.actionPayload.confirmationDetails || 'Action requires user confirmation.'}
                    </p>
                    <button
                      onClick={() => onConfirmAction(msg.actionPayload!)}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition"
                    >
                      Confirm Action
                    </button>
                  </div>
                )}

                {/* Message controls */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => onSpeak(msg.content)}
                      className="hover:text-slate-200 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      Speak
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Commands */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {quickCommands.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(chip.command)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition font-medium"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening to voice command...' : 'Talk to your browser...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 pl-3.5 pr-20 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`p-1.5 rounded-xl transition ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isListening ? 'Stop listening' : 'Start push-to-talk voice'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
