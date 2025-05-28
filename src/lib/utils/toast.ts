/**
 * Toast utility wrapper
 * Provides a unified API for showing toast notifications
 */

import { toast as toasterToast } from '@/components/ui/toaster';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

/**
 * Show a toast notification
 */
export function toast(options: ToastOptions) {
  const { title, description, variant, duration } = options;
  
  // Map variant to toast type
  const type = variant === 'destructive' ? 'error' : 'info';
  
  // Use the appropriate toast method
  switch (type) {
    case 'error':
      toasterToast.error(title, description, duration);
      break;
    default:
      toasterToast.info(title, description, duration);
      break;
  }
}

// Export convenience methods that match the toaster API
toast.success = toasterToast.success;
toast.error = toasterToast.error;
toast.warning = toasterToast.warning;
toast.info = toasterToast.info;