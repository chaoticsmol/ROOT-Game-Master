import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Message.module.css';

export interface MessageProps {
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

export type MessageType = Omit<MessageProps, 'timestamp'> & {
  id: string;
  timestamp: Date;
};

export const createMessage = (text: string, isUser: boolean): MessageType => {
  return {
    id: Date.now().toString(),
    text,
    isUser,
    timestamp: new Date()
  };
};

export const Message: React.FC<MessageProps> = ({ 
  text, 
  isUser, 
  timestamp = new Date() 
}) => {
  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.messageContent}>
        <span className={styles.sender}>{isUser ? 'You' : 'Game Master'}</span>
        {isUser ? (
          <p className={styles.text}>{text}</p>
        ) : (
          <div className={styles.markdownContent}>
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
        <span className={styles.timestamp}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}; 