import React, { useState } from 'react';
import { PageContext } from '../../shared/types';
import { Globe, FileText, Sparkles, Languages, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface PageCardProps {
  pageContext: PageContext | null;
  isRestrictedPage: boolean;
  onSummarize: () => void;
  onExplainHindi: () => void;
  onExplainSelection: () => void;
  onAskAboutPage: () => void;
  isLoading: boolean;
}

export const PageCard: React.FC<PageCardProps> = ({
  pageContext,
  isRestrictedPage,
  onSummarize,
  onExplainHindi,
  onExplainSelection,
  onAskAboutPage,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pageContext) return null;

  // Calculate approximate words and reading time
  const wordsCount = (pageContext.mainText || '').trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordsCount / 220));

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 shadow-md backdrop-blur-md space-y-2.5 transition-all">
      {/* Top Title & Metadata Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-slate-100 truncate" title={pageContext.title}>
              {pageContext.title || 'Active Webpage'}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="truncate max-w-[120px] font-medium text-slate-300">
                {pageContext.domain || 'web'}
              </span>
              <span>•</span>
              <span>~{wordsCount.toLocaleString()} words</span>
              <span>•</span>
              <span className="text-indigo-400">{readingTimeMinutes} min read</span>
            </div>
          </div>
        </div>

        {/* Selected text indicator badge */}
        {pageContext.selectedText ? (
          <span className="shrink-0 text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
            Text Selected
          </span>
        ) : (
          pageContext.headings && pageContext.headings.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition"
              title={isExpanded ? 'Hide topics' : 'Show key page headings'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )
        )}
      </div>

      {/* Expandable Key Topics list */}
      {isExpanded && pageContext.headings && pageContext.headings.length > 0 && (
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300 space-y-1 animate-in fade-in">
          <div className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            Key Headings on Page
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
            {pageContext.headings.slice(0, 4).map((h, i) => (
              <li key={i} className="truncate">{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 1-Click High-Utility Action Chips */}
      {!isRestrictedPage && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={onSummarize}
            disabled={isLoading}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-200 transition text-[11px] font-medium disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            30s Summary
          </button>

          <button
            onClick={onExplainHindi}
            disabled={isLoading}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition text-[11px] font-medium disabled:opacity-50 active:scale-95"
          >
            <Languages className="w-3 h-3 text-emerald-400" />
            Hindi me Samjhao
          </button>

          <button
            onClick={onAskAboutPage}
            disabled={isLoading}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/60 border border-slate-700 text-slate-300 transition text-[11px] font-medium disabled:opacity-50 active:scale-95"
          >
            <FileText className="w-3 h-3 text-slate-400" />
            5 Key Points
          </button>

          {pageContext.selectedText && (
            <button
              onClick={onExplainSelection}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition text-[11px] font-medium active:scale-95"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              Explain Selected
            </button>
          )}
        </div>
      )}
    </div>
  );
};
