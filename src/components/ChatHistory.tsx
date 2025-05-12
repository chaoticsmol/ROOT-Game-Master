import { Message, MessageType } from "./Message";
import styles from './ChatHistory.module.css';

type ChatHistoryProps = {
  history: MessageType[];
}

export const ChatHistory = ({ history }: ChatHistoryProps) => { 
  return (
    <div className={styles.messagesContainer}>
      {history.map((message: MessageType) => (
        <Message
          key={message.id}
          text={message.text}
          isUser={message.isUser}
          timestamp={message.timestamp}
        />
      ))}
    </div>
  );
}