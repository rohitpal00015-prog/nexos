import React from 'react';
import { PageContext } from '../../shared/types';
import { Globe, FileText, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface PageCardProps {
  pageContext: PageContext | null;
  isRestrictedPage: boolean;
  onSummarize: () => void;
  onExplainSelection: () => void;
  onAskAboutPage: () => void;
  isLoading: boolean;
}

export const PageCard: React.FC<PageCardProps> = ({
  pageContext,
  isRestrictedPage,
  onSummarize,
  onExplainSelection,
  onAskAboutPage,
  isLoading
}) => {
  if (!pageContext) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-200 truncate" title={pageContext.title}>
              {pageContext.title || 'Untitled Page'}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {pageContext.domain || 'Local Browser Context'}
            </p>
          </div>
        </div>

        {pageContext.selectedText && (
          <span className="shrink-0 text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Text Selected
          </span>
        )}
      </div>

      {isRestrictedPage ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Chrome internal pages restricted. Open a standard webpage to extract page summaries.</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={onSummarize}
            disabled={isLoading}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition text-[11px] font-medium disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Summarize
          </button>

          <button
            onClick={onExplainSelection}
            disabled={isLoading || !pageContext.selectedText}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-medium transition ${
              pageContext.selectedText
                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300'
                : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title={pageContext.selectedText ? 'Explain highlighted text' : 'Select text on the webpage first'}
          >
            <FileText className="w-3.5 h-3.5" />
            Explain Text
          </button>

          <button
            onClick={onAskAboutPage}
            disabled={isLoading}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-300 hover:text-slate-100 transition text-[11px] font-medium disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Ask Page
          </button>
        </div>
      )}
    </div>
  );
};
