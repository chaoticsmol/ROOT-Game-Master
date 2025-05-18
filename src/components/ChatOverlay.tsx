import { useState } from 'react';
import { MessageType } from './Message';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import styles from './ChatOverlay.module.css';

export type ChatOverlayProps = {
  history: MessageType[];
  awaitingResponse: boolean;
  userAskedQuestion: (transcript: string) => void;
}

export const ChatOverlay = ({ history, awaitingResponse, userAskedQuestion }: ChatOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOverlay = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className={`${styles.overlayContainer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay}>
        <button 
          className={styles.pullTab} 
          onClick={toggleOverlay}
          aria-label={isOpen ? "Close overlay" : "Open overlay"}
        >
          <div className={styles.tabIcon}>
            {isOpen ? '›' : '‹'}
          </div>
        </button>
        
        <div className={styles.overlayContent}>
          <h2 className={styles.overlayTitle}>{'Chat History'}</h2>
          <ChatHistory history={history} />
          <ChatInput onSendMessage={userAskedQuestion} disabled={awaitingResponse} />
        </div>
      </div>
    </div>
  );
}; 