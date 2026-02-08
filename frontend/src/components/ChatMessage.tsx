import React from 'react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'ai'; // Supporting both formats
    content: string;
    timestamp: string | Date; // Supporting both formats
    requiresConfirmation?: boolean;
    actionPlan?: any;
  };
  onConfirm?: (confirmed: boolean) => void;
  isConfirming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onConfirm, isConfirming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-dark-700 text-dark-200 rounded-bl-none border border-dark-600'
        }`}
      >
        <div className="text-sm">{message.content}</div>
        {message.requiresConfirmation && onConfirm && (
          <div className="mt-2 space-y-2">
            <div className="text-xs bg-yellow-500/20 text-yellow-300 p-2 rounded border border-yellow-500/30">
              ⚠️ This action requires confirmation
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onConfirm(true)}
                disabled={isConfirming}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isConfirming ? 'Confirming...' : 'Yes'}
              </button>
              <button
                onClick={() => onConfirm(false)}
                disabled={isConfirming}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="text-xs opacity-70 mt-1">
          {typeof message.timestamp === 'string'
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;