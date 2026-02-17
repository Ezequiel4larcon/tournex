import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (message) => addToast({ message, type: 'success' }),
    error: (message) => addToast({ message, type: 'error', duration: 6000 }),
    info: (message) => addToast({ message, type: 'info' }),
    warning: (message) => addToast({ message, type: 'warning', duration: 5000 }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

const toastStyles = {
  success: {
    bg: 'bg-green-500/10 border-green-500/30',
    text: 'text-green-500',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-destructive/10 border-destructive/30',
    text: 'text-destructive',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-primary/10 border-primary/30',
    text: 'text-primary',
    icon: Info,
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    text: 'text-yellow-500',
    icon: AlertCircle,
  },
};

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto ${style.bg} border rounded-xl p-4 shadow-lg backdrop-blur-sm animate-fade-in-up flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5`} />
            <p className="text-sm text-foreground flex-1">{toast.message}</p>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-muted-foreground hover:text-foreground transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
