import React from 'react';
import { ActionResponse } from '../../shared/types';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  actionPayload: ActionResponse | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  actionPayload,
  onConfirm,
  onCancel
}) => {
  if (!actionPayload) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center gap-3 text-amber-400">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Confirmation Required</h3>
            <p className="text-[11px] text-slate-400">Nexora action confirmation</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
          {actionPayload.confirmationDetails ||
            `Are you sure you want to perform "${actionPayload.action?.name || 'this action'}"?`}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-lg shadow-amber-500/20"
          >
            <Check className="w-3.5 h-3.5" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
