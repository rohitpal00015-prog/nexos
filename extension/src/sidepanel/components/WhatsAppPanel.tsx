import React, { useState } from 'react';
import { WhatsAppContext, ClaimAnalysisResult } from '../../shared/types';
import { MessageSquare, Send, ShieldAlert, Sparkles, RefreshCw, CornerDownLeft, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

interface WhatsAppPanelProps {
  whatsappContext: WhatsAppContext;
  onRefreshWhatsApp: () => void;
  onGenerateReply: (tone: string, customInst?: string) => void;
  onInsertReply: (replyText: string, autoSend: boolean) => void;
  onAnalyseClaim: (text: string) => void;
  replyDraft: string;
  setReplyDraft: (text: string) => void;
  claimResult: ClaimAnalysisResult | null;
  isLoading: boolean;
}

export const WhatsAppPanel: React.FC<WhatsAppPanelProps> = ({
  whatsappContext,
  onRefreshWhatsApp,
  onGenerateReply,
  onInsertReply,
  onAnalyseClaim,
  replyDraft,
  setReplyDraft,
  claimResult,
  isLoading
}) => {
  const [selectedTone, setSelectedTone] = useState<string>('Friendly');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const { isListening, transcript, startListening, stopListening } = useVoice();

  const tones = ['Friendly', 'Hinglish', 'Professional', 'Concise', 'Polite'];

  const incomingMessage = whatsappContext.latestMessage || 'Hlo rohit';
  const chatName = whatsappContext.chatName || 'Praveen Singh';

  const handleVoiceReply = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setReplyDraft(transcript);
        onInsertReply(transcript, true);
      }
    } else {
      startListening((text) => {
        setReplyDraft(text);
        onInsertReply(text, true);
      });
    }
  };

  const handleDynamicHinglishSend = () => {
    let dynamicReply = `Hi ${chatName}! Badhiya chal raha hai sab. Tum batao kya haal hai?`;
    const lowerMsg = incomingMessage.toLowerCase();

    if (lowerMsg.includes('hlo') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      dynamicReply = `Hi ${chatName}! Haan bolo, kaise ho?`;
    } else if (lowerMsg.includes('kaisa') || lowerMsg.includes('kaise')) {
      dynamicReply = `Main badhiya hoon ${chatName}! Tum batao kaisa chal raha hai?`;
    }

    setReplyDraft(dynamicReply);
    onInsertReply(dynamicReply, true);
  };

  return (
    <div className="space-y-4">
      {/* Active WhatsApp Chat Card */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-300">WhatsApp Web Active</span>
          </div>
          <button
            onClick={onRefreshWhatsApp}
            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Read Message
          </button>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Incoming Message ({chatName})
          </div>
          <p className="text-xs text-slate-200 font-medium">"{incomingMessage}"</p>
        </div>
      </div>

      {/* Voice Reply & Type Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Voice Dictation & Composer Auto-Send
        </h3>

        {/* Live Speech Feedback Box */}
        {isListening && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs animate-pulse">
            <span className="font-semibold">🎙️ Listening...</span> {transcript || 'Speak your reply now...'}
          </div>
        )}

        {/* Big Voice Mic Button */}
        <button
          onClick={handleVoiceReply}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Stop Listening & Send' : '🎙️ Click to Speak Reply & Auto-Send'}
        </button>

        {/* 1-Click Dynamic Auto-Send Button */}
        <button
          onClick={handleDynamicHinglishSend}
          className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
        >
          ⚡ 1-Click Smart Reply to "{incomingMessage.slice(0, 15)}..."
        </button>

        {/* Tone AI Reply Generator */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] uppercase font-semibold text-slate-400">Or Select AI Reply Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTone(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedTone === t
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onGenerateReply(selectedTone, customPrompt)}
          disabled={isLoading}
          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Generate AI {selectedTone} Reply
        </button>

        {/* Reply Preview & Controls */}
        {replyDraft && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-[10px] uppercase font-semibold text-slate-400">Drafted Message</label>
            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/80 transition"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onInsertReply(replyDraft, false)}
                className="py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                Type in Composer
              </button>

              <button
                onClick={() => onInsertReply(replyDraft, true)}
                className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-md shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                Type & Send Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Claim & Scam Checker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Analyze Message / Claim
          </h3>
        </div>

        <button
          onClick={() => onAnalyseClaim(incomingMessage)}
          disabled={isLoading}
          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
        >
          Check Message for Scams & Urgency
        </button>

        {claimResult && (
          <div className={`p-3 rounded-xl border text-xs space-y-2 ${
            claimResult.classification === 'POTENTIALLY_SUSPICIOUS'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Status: {claimResult.classification}
              </span>
              <span>{claimResult.confidence}% Confidence</span>
            </div>

            {claimResult.warningSignals?.length > 0 && (
              <ul className="list-disc list-inside text-[11px] space-y-0.5">
                {claimResult.warningSignals.map((sig, i) => (
                  <li key={i}>{sig}</li>
                ))}
              </ul>
            )}

            <p className="text-[11px] pt-1 border-t border-slate-700/50">
              💡 {claimResult.recommendedAction}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
