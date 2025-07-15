import { useCallback } from 'react';
import { toast, ToastOptions, ToastPosition } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ExclamationIcon, InformationCircleIcon } from '@heroicons/react/outline';

// Extend the default toast options to include our custom types
type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';

interface NotificationOptions extends ToastOptions {
  /**
   * The position of the toast notification
   * @default 'top-center'
   */
  position?: ToastPosition;
  
  /**
   * Duration in milliseconds
   * @default 5000 for success/error/info/warning, Infinity for loading
   */
  duration?: number;
  
  /**
   * Whether to show a close button
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Custom styles for the toast
   */
  toastStyle?: React.CSSProperties;
  
  /**
   * Custom class names for the toast
   */
  className?: string;
  
  /**
   * Callback when the toast is clicked
   */
  onClick?: () => void;
}

// Default toast options
const DEFAULT_OPTIONS: ToastOptions = {
  position: 'top-center',
  duration: 5000,
  style: {
    background: 'var(--bg-color, #fff)',
    color: 'var(--text-color, #1f2937)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    maxWidth: '24rem',
  },
  className: 'font-medium',
};

// Icons for different notification types
const DEFAULT_ICONS = {
  success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  error: <XCircleIcon className="h-5 w-5 text-red-500" />,
  warning: <ExclamationIcon className="h-5 w-5 text-yellow-500" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
  loading: (
    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
  ),
};

/**
 * A custom hook for displaying toast notifications
 */
const useNotification = () => {
  /**
   * Show a notification
   * @param message The message to display
   * @param type The type of notification
   * @param options Additional options for the notification
   */
  const notify = useCallback(
    (
      message: React.ReactNode,
      type: NotificationType = 'info',
      options: NotificationOptions = {}
    ) => {
      const {
        position = DEFAULT_OPTIONS.position,
        duration = type === 'loading' ? Infinity : DEFAULT_OPTIONS.duration,
        showCloseButton = true,
        icon,
        toastStyle = {},
        className = '',
        onClick,
        ...restOptions
      } = options;

      // Determine the icon to display
      const notificationIcon = icon || (type in DEFAULT_ICONS ? DEFAULT_ICONS[type as keyof typeof DEFAULT_ICONS] : undefined);

      // Create the toast content
      const toastContent = (
        <div 
          className={`flex items-start ${onClick ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (onClick) {
              onClick();
              toast.dismiss();
            }
          }}
        >
          {notificationIcon && <div className="flex-shrink-0 mr-3">{notificationIcon}</div>}
          <div className="flex-1">{message}</div>
          {showCloseButton && (
            <button
              type="button"
              className="ml-4 -mr-2 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss();
              }}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      );

      // Show the toast based on type
      switch (type) {
        case 'success':
          return toast.success(toastContent, {
            ...DEFAULT_OPTIONS,
            position,
            duration,
            style: { ...DEFAULT_OPTIONS.style, ...toastStyle },
            className: `${DEFAULT_OPTIONS.className} ${className}`,
            ...restOptions,
          });
        case 'error':
          return toast.error(toastContent, {
            ...DEFAULT_OPTIONS,
            position,
            duration,
            style: { ...DEFAULT_OPTIONS.style, ...toastStyle },
            className: `${DEFAULT_OPTIONS.className} ${className}`,
            ...restOptions,
          });
        case 'loading':
          return toast.loading(toastContent, {
            ...DEFAULT_OPTIONS,
            position,
            duration,
            style: { ...DEFAULT_OPTIONS.style, ...toastStyle },
            className: `${DEFAULT_OPTIONS.className} ${className}`,
            ...restOptions,
          });
        case 'warning':
          return toast(toastContent, {
            ...DEFAULT_OPTIONS,
            position,
            duration,
            icon: notificationIcon,
            style: { ...DEFAULT_OPTIONS.style, ...toastStyle },
            className: `${DEFAULT_OPTIONS.className} ${className}`,
            ...restOptions,
          });
        case 'info':
        case 'custom':
        default:
          return toast(toastContent, {
            ...DEFAULT_OPTIONS,
            position,
            duration,
            icon: notificationIcon,
            style: { ...DEFAULT_OPTIONS.style, ...toastStyle },
            className: `${DEFAULT_OPTIONS.className} ${className}`,
            ...restOptions,
          });
      }
    },
    []
  );

  // Convenience methods for different notification types
  const success = useCallback(
    (message: React.ReactNode, options?: Omit<NotificationOptions, 'type'>) =>
      notify(message, 'success', options),
    [notify]
  );

  const error = useCallback(
    (message: React.ReactNode, options?: Omit<NotificationOptions, 'type'>) =>
      notify(message, 'error', options),
    [notify]
  );

  const warning = useCallback(
    (message: React.ReactNode, options?: Omit<NotificationOptions, 'type'>) =>
      notify(message, 'warning', options),
    [notify]
  );

  const info = useCallback(
    (message: React.ReactNode, options?: Omit<NotificationOptions, 'type'>) =>
      notify(message, 'info', options),
    [notify]
  );

  const loading = useCallback(
    (message: React.ReactNode, options?: Omit<NotificationOptions, 'type'>) =>
      notify(message, 'loading', options),
    [notify]
  );

  // Expose the toast methods for more control
  return {
    // Core methods
    notify,
    success,
    error,
    warning,
    info,
    loading,
    
    // Toast control methods
    dismiss: toast.dismiss,
    remove: toast.remove,
    promise: toast.promise,
    
    // Current state
    isActive: toast.isActive,
  };
};

export default useNotification;
