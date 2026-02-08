/**
 * NotificationIndicator Component
 * Shows the status of browser notifications
 * Phase 5: Advanced Cloud-Native Event-Driven Deployment
 */

import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationIndicatorProps {
  className?: string;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({ className = '' }) => {
  const { permission, isSupported } = useNotifications();

  if (!isSupported) {
    return (
      <div className={`flex items-center text-xs text-gray-400 ${className}`}>
        <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
        Notifications not supported
      </div>
    );
  }

  let statusText = '';
  let statusColor = '';

  switch (permission) {
    case 'granted':
      statusText = 'Notifications enabled';
      statusColor = 'bg-green-500';
      break;
    case 'denied':
      statusText = 'Notifications blocked';
      statusColor = 'bg-red-500';
      break;
    case 'default':
      statusText = 'Notifications not enabled';
      statusColor = 'bg-yellow-500';
      break;
    default:
      statusText = 'Unknown';
      statusColor = 'bg-gray-500';
  }

  return (
    <div className={`flex items-center text-xs ${className}`}>
      <span className={`inline-block w-2 h-2 ${statusColor} rounded-full mr-2`}></span>
      {statusText}
    </div>
  );
};

export default NotificationIndicator;