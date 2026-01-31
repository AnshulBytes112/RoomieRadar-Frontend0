import { useState } from 'react';
import { type ToastType } from '../components/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
  showLoading?: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'success', duration?: number, showLoading?: boolean) => {
    setToast({ message, type, isVisible: true, showLoading });
    
    // Auto-hide after duration (default 3 seconds)
    if (duration !== 0) {
      setTimeout(() => {
        hideToast();
      }, duration || 3000);
    }
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const showSuccessToast = (message: string, duration?: number) => {
    showToast(message, 'success', duration);
  };

  const showErrorToast = (message: string, duration?: number) => {
    showToast(message, 'error', duration);
  };

  const showWarningToast = (message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  };

  const showInfoToast = (message: string, duration?: number, showLoading?: boolean) => {
    showToast(message, 'info', duration, showLoading);
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };
};
