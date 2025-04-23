import { useNotifications } from '@toolpad/core/useNotifications';
import { useEffect } from 'react';

interface NotificacionErrorProps {
  error: string | null;
  severity?: 'error' | 'warning' | 'info' | 'success';
  autoHideDuration?: number;
}

export function NotificacionError({
  error,
  severity = 'error',
  autoHideDuration = 4000
}: NotificacionErrorProps) {
  const notifications = useNotifications();

  useEffect(() => {
    if (error) {
      const key = notifications.show(error, {
        severity,
        autoHideDuration,
      });

      return () => {
        notifications.close(key);
      };
    }
  }, [error, notifications, severity, autoHideDuration]);

  return null;
}