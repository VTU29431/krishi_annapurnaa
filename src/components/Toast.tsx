import React from 'react';
import { Megaphone, X, Bell } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'announcement' | 'notification' | 'reroute';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto p-4 rounded-xl shadow-xl border border-slate-700 bg-slate-900 text-white flex items-start space-x-3 transition-all transform translate-y-0"
        >
          {t.type === 'announcement' ? (
            <Megaphone className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0 animate-bounce" />
          ) : (
            <Bell className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          )}

          <div className="flex-1 text-xs">
            <h4 className="font-extrabold text-white text-xs">{t.title}</h4>
            <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">{t.message}</p>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
