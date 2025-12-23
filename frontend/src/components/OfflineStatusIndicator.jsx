import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * OfflineStatusIndicator - Visual component showing offline/online sync status
 *
 * Features:
 * - Real-time network status
 * - Sync state visualization
 * - Smooth transitions
 * - Auto-hide when synced and online
 */
const OfflineStatusIndicator = ({ status, className = '' }) => {
  const [visible, setVisible] = useState(true);
  const [autoHideTimer, setAutoHideTimer] = useState(null);

  useEffect(() => {
    // Clear existing timer
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }

    // Always show when offline or not synced
    if (!status.online || !status.synced) {
      setVisible(true);
      return;
    }

    // Auto-hide after 3 seconds when online and synced
    if (status.online && status.synced) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      setAutoHideTimer(timer);
    }

    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [status.online, status.synced]);

  // Don't render if hidden
  if (!visible && status.online && status.synced) {
    return null;
  }

  const getStatusConfig = () => {
    if (!status.online) {
      return {
        icon: WifiOff,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        label: 'Offline',
        message: status.message || 'Working offline - changes saved locally'
      };
    }

    if (!status.synced) {
      return {
        icon: Cloud,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-200',
        borderColor: 'border-blue-300 dark:border-blue-700',
        label: 'Syncing',
        message: status.message || 'Synchronizing with server...',
        animate: true
      };
    }

    if (status.error) {
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-200',
        borderColor: 'border-red-300 dark:border-red-700',
        label: 'Error',
        message: status.message || 'Sync error - retrying...'
      };
    }

    return {
      icon: CheckCircle,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-200',
      borderColor: 'border-green-300 dark:border-green-700',
      label: 'Synced',
      message: status.message || 'All changes saved'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        flex items-center gap-2 px-4 py-2
        rounded-lg border shadow-lg
        transition-all duration-300 ease-in-out
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <Icon
        className={`w-5 h-5 ${config.animate ? 'animate-pulse' : ''}`}
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{config.label}</span>
        <span className="text-xs opacity-80">{config.message}</span>
      </div>

      {/* Close button (only when synced) */}
      {status.online && status.synced && (
        <button
          onClick={() => setVisible(false)}
          className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;
