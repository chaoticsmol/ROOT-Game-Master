import React, { useState, KeyboardEvent, FormEvent } from 'react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <textarea
        className={styles.textInput}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the Game Master..."
        disabled={disabled}
        rows={1}
        autoFocus
      />
    </form>
  );
}; 