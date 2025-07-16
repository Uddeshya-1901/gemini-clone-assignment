import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../utils";
import { useAppDispatch } from "../../hooks/redux";
import { removeToast } from "../../store/slices/uiSlice";

const Toast = ({ toast }) => {
  const dispatch = useAppDispatch();

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100",
  };

  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div
      className={cn(
        "flex items-center p-4 mb-4 border rounded-lg shadow-sm animate-in slide-in-from-right",
        styles[toast.type]
      )}
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 min-w-[320px] max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
