import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import ChatMessage from '../components/ChatMessage';

interface AIChatContainerProps {
  onTasksUpdated?: () => void;
}

const AIChatContainer: React.FC<AIChatContainerProps> = ({ onTasksUpdated }) => {
  const {
    messages,
    sendMessage,
    isLoading,
    requiresConfirmation,
    handleConfirmation,
  } = useAIChat(onTasksUpdated);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading || requiresConfirmation) return;

    // Send message to AI backend
    await sendMessage(inputValue);

    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full border border-dark-700 rounded-xl shadow-lg bg-dark-800/70 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="bg-dark-700/50 px-4 py-3 border-b border-dark-600 rounded-t-xl">
        <h3 className="font-semibold text-dark-100">AI Todo Assistant</h3>
        <p className="text-xs text-dark-400">Ask me to manage your tasks using natural language</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-dark-900/30" style={{ maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-dark-400 italic mt-8">
            Start a conversation with the AI assistant to manage your tasks...
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onConfirm={message.requiresConfirmation ? (confirmed) => handleConfirmation(confirmed) : undefined}
              isConfirming={isLoading}
            />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-dark-700 text-dark-200 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation Modal - shown when confirmation is required */}
      {requiresConfirmation && (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-dark-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-dark-600">
            <h4 className="text-lg font-semibold text-dark-100 mb-2">Confirm Action</h4>
            <p className="text-dark-300 mb-4">Are you sure you want to proceed with this action?</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-dark-300 bg-dark-700 border border-dark-600 rounded-lg hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => handleConfirmation(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-500 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={() => handleConfirmation(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-dark-600 p-4 bg-dark-700/30 rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me to manage your tasks (e.g., 'Add a task to buy groceries')"
            className="flex-1 border border-dark-600 rounded-lg px-4 py-2 bg-dark-700 text-dark-50 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading || requiresConfirmation}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || requiresConfirmation}
            className={`px-4 py-2 rounded-lg ${
              inputValue.trim() && !isLoading && !requiresConfirmation
                ? 'bg-primary-600 text-white hover:bg-primary-500'
                : 'bg-dark-600 text-dark-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </form>
        <p className="text-xs text-dark-400 mt-2">
          Examples: "Add a task to buy groceries", "Mark my meeting as complete", "Show high-priority tasks"
        </p>
      </div>
    </div>
  );
};

export default AIChatContainer;