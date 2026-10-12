import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Bell, MessageSquare, 
  Sparkles, X, ArrowRight 
} from 'lucide-react';

export default function ToastNotification({ onNavigate }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const toastData = event.detail;
      if (!toastData) return;

      const newToast = {
        id: toastData.id || 'toast-' + Date.now() + '-' + Math.random(),
        title: toastData.title || 'Notification',
        message: toastData.message || '',
        type: toastData.type || 'info',
        actionLabel: toastData.actionLabel,
        onAction: toastData.onAction,
        createdAt: Date.now()
      };

      setToasts(prev => [newToast, ...prev.slice(0, 3)]); // Keep max 4 toasts

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('campushare-toast', handleToastEvent);
    return () => window.removeEventListener('campushare-toast', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'NEW_REQUEST':
      case 'request':
        return <span className="text-lg">🤝</span>;
      case 'REQUEST_ACCEPTED':
      case 'success':
        return <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />;
      case 'REQUEST_REJECTED':
      case 'error':
        return <XCircle size={20} className="text-rose-500 shrink-0" />;
      case 'NEW_MESSAGE':
      case 'message':
        return <MessageSquare size={19} className="text-blue-500 shrink-0" />;
      case 'EXCHANGE_COMPLETED':
      case 'complete':
        return <Sparkles size={20} className="text-amber-500 shrink-0" />;
      default:
        return <Bell size={19} className="text-terracotta shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'NEW_REQUEST': return 'border-amber-400 bg-amber-50/95';
      case 'REQUEST_ACCEPTED': return 'border-emerald-400 bg-emerald-50/95';
      case 'REQUEST_REJECTED': return 'border-rose-400 bg-rose-50/95';
      case 'NEW_MESSAGE': return 'border-blue-400 bg-blue-50/95';
      case 'EXCHANGE_COMPLETED': return 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50';
      default: return 'border-stone-300 bg-white/95';
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[200] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border backdrop-blur-md text-stone-800 transition-all transform animate-in slide-in-from-top-4 duration-300 flex items-start gap-3 ${getBorderColor(toast.type)}`}
        >
          <div className="mt-0.5 shrink-0">
            {getToastIcon(toast.type)}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-stone-900 leading-tight">
              {toast.title}
            </h4>
            <p className="text-[11px] text-stone-600 font-medium mt-0.5 line-clamp-2 leading-snug">
              {toast.message}
            </p>

            {toast.actionLabel && (
              <button
                onClick={() => {
                  if (toast.onAction) toast.onAction();
                  else if (onNavigate) onNavigate('requests');
                  removeToast(toast.id);
                }}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-terracotta hover:underline"
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors shrink-0"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
