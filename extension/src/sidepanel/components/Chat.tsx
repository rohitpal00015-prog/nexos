import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ActionResponse } from '../../shared/types';
import { Send, Mic, MicOff, Bot, User, Copy, Check, Volume2, Sparkles, AlertTriangle, Search, Layers, Compass, Zap } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSpeak: (text: string) => void;
  onConfirmAction: (actionPayload: ActionResponse) => void;
  isLoading: boolean;
  voiceError: string | null;
  onClearVoiceError?: () => void;
}

type SuggestionCategory = 'all' | 'page' | 'tools' | 'search';

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isListening,
  onStartListening,
  onStopListening,
  onSpeak,
  onConfirmAction,
  isLoading,
  voiceError,
  onClearVoiceError
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  // Rich categorized suggestions so user never needs to write manually!
  const allSuggestions = [
    { category: 'page', label: '📄 30s Summary', command: 'Summarize this page in 30 seconds' },
    { category: 'page', label: '🌐 Hindi me Samjhao', command: 'Is page ko aasan Hindi me explain karo' },
    { category: 'page', label: '💡 5 Key Takeaways', command: 'Give me 5 key bullet takeaways from this page' },
    { category: 'page', label: '🔍 "Wiki" count karo', command: 'mere page per wiki kitani time likha huaa h' },
    { category: 'tools', label: '🧹 Close Duplicate Tabs', command: 'Close duplicate tabs' },
    { category: 'tools', label: '📂 Group Open Tabs', command: 'Group open tabs' },
    { category: 'tools', label: '⏱️ 25m Focus Timer', command: 'Start 25 min focus timer' },
    { category: 'tools', label: '🔇 Mute Active Tab', command: 'Mute current tab' },
    { category: 'search', label: '🎵 Play Lo-Fi Music', command: 'Open YouTube and play relaxing lofi music' },
    { category: 'search', label: '🔎 Search Free Meeting', command: 'go to web and search free meeting' },
    { category: 'search', label: '📈 Trending AI News', command: 'go to web and search latest artificial intelligence news' },
    { category: 'tools', label: '🔄 Reload Tab', command: 'Refresh active page' }
  ];

  const filteredSuggestions = selectedCategory === 'all'
    ? allSuggestions
    : allSuggestions.filter(s => s.category === selectedCategory);

  return (
    <div className="flex flex-col h-[calc(100vh-190px)] justify-between space-y-2">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center space-y-4 py-4 px-1">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xs font-bold text-slate-100">Nexora AI Copilot</h2>
              <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto">
                Direct in-browser AI. Click any card below or speak to execute instantly.
              </p>
            </div>

            {/* Instant Quick Starter Cards */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSendMessage('Summarize this page in 30 seconds')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                  <Layers className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                  30s Summary
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Instant core takeaways of this page</p>
              </button>

              <button
                onClick={() => onSendMessage('Is page ko aasan Hindi me explain karo')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <Compass className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                  Hindi Explanation
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Page ko saral Hindi me samjhe</p>
              </button>

              <button
                onClick={() => onSendMessage('Close duplicate tabs')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                  <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                  Clean Duplicates
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Free browser memory & tabs</p>
              </button>

              <button
                onClick={() => onSendMessage('Open YouTube and play relaxing lofi music')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                  <Search className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                  Play Lo-Fi Music
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Focus & study background beats</p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 text-xs animate-in fade-in ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-br-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap selection:bg-indigo-400 selection:text-slate-900 text-[11.5px]">
                  {msg.content}
                </div>

                {/* Structured Page Summary Render */}
                {msg.summaryData && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="font-semibold text-indigo-300 text-[10.5px] uppercase tracking-wider">
                      🎯 Executive Summary
                    </div>
                    {msg.summaryData.keyPoints && msg.summaryData.keyPoints.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                        {msg.summaryData.keyPoints.map((kp: string, i: number) => (
                          <li key={i}>{kp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Confirmation prompt for actions */}
                {msg.actionPayload?.requiresConfirmation && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                    <p className="text-[11px] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {msg.actionPayload.confirmationDetails || 'Action requires confirmation.'}
                    </p>
                    <button
                      onClick={() => onConfirmAction(msg.actionPayload!)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Confirm Execution
                    </button>
                  </div>
                )}

                {/* Action Bar (Copy & Speak) */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-3 mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSpeak(msg.content)}
                      className="hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Categorized Suggestions Bar */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
        {/* Category Pills */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded-md transition ${selectedCategory === 'all' ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40' : 'hover:text-slate-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('page')}
            className={`px-2 py-0.5 rounded-md transition ${selectedCategory === 'page' ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40' : 'hover:text-slate-200'}`}
          >
            Page Insights
          </button>
          <button
            onClick={() => setSelectedCategory('tools')}
            className={`px-2 py-0.5 rounded-md transition ${selectedCategory === 'tools' ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40' : 'hover:text-slate-200'}`}
          >
            Browser Controls
          </button>
          <button
            onClick={() => setSelectedCategory('search')}
            className={`px-2 py-0.5 rounded-md transition ${selectedCategory === 'search' ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40' : 'hover:text-slate-200'}`}
          >
            Search & Media
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {filteredSuggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(chip.command)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-full text-[10.5px] bg-slate-900/90 hover:bg-indigo-600/25 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition font-medium active:scale-95 disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Error Notification with 1-Click Permission Helper */}
      {voiceError && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex flex-col gap-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span>🎙️ {voiceError}</span>
            {onClearVoiceError && (
              <button onClick={onClearVoiceError} className="font-bold underline text-[10px] ml-2 text-amber-300 hover:text-amber-100">
                Dismiss
              </button>
            )}
          </div>
          {voiceError.toLowerCase().includes('denied') && (
            <button
              type="button"
              onClick={() => {
                if (chrome.tabs && chrome.tabs.create) {
                  chrome.tabs.create({ url: chrome.runtime.getURL('permission.html') });
                } else {
                  window.open(chrome.runtime.getURL('permission.html'), '_blank');
                }
                if (onClearVoiceError) onClearVoiceError();
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold w-fit transition shadow"
            >
              👉 Click to Enable Mic Access (1-Click)
            </button>
          )}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 pt-0.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening to voice command...' : 'Type or tap suggestions above...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 pl-3.5 pr-20 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition shadow-inner"
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
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-40 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
