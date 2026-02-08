/**
 * useNotifications Hook
 * Handles browser notifications for due dates and time reminders
 * Phase 5: Advanced Cloud-Native Event-Driven Deployment
 */

import { useState, useEffect, useCallback } from 'react';

interface UseNotificationsResult {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options: NotificationOptions) => void;
  isSupported: boolean;
}

export function useNotifications(): UseNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const isSupported = typeof Notification !== 'undefined';

  // Request notification permission from user
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  // Show a notification to the user
  const showNotification = useCallback((title: string, options: NotificationOptions) => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    if (permission !== 'granted') {
      console.warn('Notifications not granted, cannot show notification');
      return;
    }

    try {
      // Close any existing notifications with the same tag
      if (options.tag) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.getNotifications({ tag: options.tag }).then(notifications => {
              notifications.forEach(notification => notification.close());
            });
          });
        });
      }

      // Create new notification
      new Notification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [isSupported, permission]);

  // Update permission state when it changes externally
  useEffect(() => {
    if (!isSupported) return;

    const handlePermissionChange = () => {
      setPermission(Notification.permission);
    };

    // Check for permission changes (though this is limited in most browsers)
    // We can at least update when the component mounts
    setPermission(Notification.permission);

    return () => {
      // Cleanup if needed
    };
  }, [isSupported]);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported
  };
}