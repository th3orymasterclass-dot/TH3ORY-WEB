import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, AlertCircle, Info, AlertTriangle, Loader2, X, WifiOff, Copy
} from 'lucide-react';

const UIStatusContext = createContext(null);

export function UIStatusProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addToast({
        id: Date.now(),
        type: 'success',
        title: 'Connection Restored',
        message: 'You are back online.',
        duration: 3000
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      addToast({
        id: Date.now(),
        type: 'error',
        title: 'No Internet Connection',
        message: 'You are currently offline. Viewing cached content.',
        duration: 0
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToast = useCallback((toast) => {
    const id = toast.id || Date.now() + Math.random();
    const newToast = { id, duration: 4000, type: 'info', ...toast };
    
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = '', duration = 4000) => {
    addToast({ title, message, type, duration });
  }, [addToast]);

  const showSuccess = useCallback((message, title = 'Success') => {
    showToast(message, 'success', title);
  }, [showToast]);

  const showError = useCallback((message, title = 'Error') => {
    showToast(message, 'error', title, 6000);
  }, [showToast]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showToast(message, 'warning', title, 5000);
  }, [showToast]);

  const showInfo = useCallback((message, title = 'Info') => {
    showToast(message, 'info', title);
  }, [showToast]);

  const copyToClipboard = useCallback(async (text, label = 'Item') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showSuccess(`${label} copied to clipboard!`, 'Copy Successful');
    } catch (err) {
      showError('Failed to copy to clipboard.', 'Copy Error');
    }
  }, [showSuccess, showError]);

  const triggerSessionExpired = useCallback(() => {
    setSessionExpired(true);
    showError('Your session has expired. Please log in again.', 'Session Expired');
  }, [showError]);

  return (
    <UIStatusContext.Provider
      value={{
        isOffline,
        toasts,
        addToast,
        removeToast,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        copyToClipboard,
        globalLoading,
        setGlobalLoading,
        loadingMessage,
        setLoadingMessage,
        sessionExpired,
        setSessionExpired,
        triggerSessionExpired,
        maintenanceMode,
        setMaintenanceMode
      }}
    >
      {children}

      {/* Global Offline Top Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Viewing cached content mode.</span>
        </div>
      )}

      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs">
              {toast.title && <h4 className="font-bold mb-0.5 tracking-wide">{toast.title}</h4>}
              <p className="opacity-90 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close Toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </UIStatusContext.Provider>
  );
}

export function useUIStatus() {
  const context = useContext(UIStatusContext);
  if (!context) {
    throw new Error('useUIStatus must be used within a UIStatusProvider');
  }
  return context;
}
