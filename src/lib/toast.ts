// Toast notification system with global event dispatch
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds, 0 = indefinite
}

const TOAST_EVENT = 'aura:toast';

export const toast = {
  success: (message: string, duration = 3000) => {
    dispatchToast(message, 'success', duration);
  },
  error: (message: string, duration = 4000) => {
    dispatchToast(message, 'error', duration);
  },
  info: (message: string, duration = 3000) => {
    dispatchToast(message, 'info', duration);
  },
  warning: (message: string, duration = 3500) => {
    dispatchToast(message, 'warning', duration);
  },
};

function dispatchToast(message: string, type: ToastType, duration: number) {
  const id = Math.random().toString(36).substr(2, 9);
  const event = new CustomEvent(TOAST_EVENT, {
    detail: { id, message, type, duration },
  });
  window.dispatchEvent(event);
}

export const TOAST_EVENT_NAME = TOAST_EVENT;
