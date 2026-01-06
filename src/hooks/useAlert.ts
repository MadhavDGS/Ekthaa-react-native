/**
 * useAlert Hook - Easy to use custom alerts
 * Usage: const alert = useAlert();
 *        alert.show('Title', 'Message', 'success');
 */

import { useState } from 'react';

interface AlertState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  showCancel: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText: string;
  cancelText: string;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  const show = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertState({
      show: true,
      title,
      message,
      type,
      showCancel: false,
      onConfirm,
      confirmText: 'OK',
      cancelText: 'Cancel',
    });
  };

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setAlertState({
      show: true,
      title,
      message,
      type: 'warning',
      showCancel: true,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    });
  };

  const hide = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const handleConfirm = () => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    hide();
  };

  const handleCancel = () => {
    if (alertState.onCancel) {
      alertState.onCancel();
    }
    hide();
  };

  return {
    // State
    visible: alertState.show,
    title: alertState.title,
    message: alertState.message,
    type: alertState.type,
    showCancel: alertState.showCancel,
    confirmText: alertState.confirmText,
    cancelText: alertState.cancelText,
    // Methods
    show,
    confirm,
    hide,
    handleConfirm,
    handleCancel,
  };
};
