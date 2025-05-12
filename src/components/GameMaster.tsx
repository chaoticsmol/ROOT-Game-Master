import { PushToTalk } from './PushToTalk';
import { ChatOverlay } from './ChatOverlay';
import styles from './GameMaster.module.css';
import { useState, useEffect, useRef } from 'react';
import { MessageType, createMessage } from './Message';
import { useOpenAI } from '../hooks/useOpenAI';

export const GameMaster = () => {
  const gameMasterImagePath = '/assets/gamemaster.png';
  const [chatHistory, setChatHistory] = useState<MessageType[]>([]);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [isPondering, setIsPondering] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const threadInitializedRef = useRef(false);
  
  const { createThread, askAssistant, generateSpeech, loading, error } = useOpenAI();

  useEffect(() => {
    // Create a thread only once when the component mounts
    const initializeThread = async () => {
      // Only create a thread if we haven't done so already
      if (!threadInitializedRef.current) {
        threadInitializedRef.current = true;
        try {
          const newThreadId = await createThread();
          setThreadId(newThreadId);
          console.log('Thread created:', newThreadId);
        } catch (error) {
          console.error('Failed to create thread:', error);
          threadInitializedRef.current = false; // Reset so we can try again
        }
      }
    };

    initializeThread();
    
    // Create audio element
    audioRef.current = new Audio();
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array means this only runs once on mount

  const appendMessage = (transcript: string, { isUser = true }: { isUser?: boolean } = {}) => {
    setChatHistory(prevHistory => [...prevHistory, createMessage(transcript, isUser)]);
  };

  const userAskedQuestion = async (transcript: string) => {
    if (!threadId) {
      console.error('No thread ID available');
      return;
    }
    
    // Add user message to chat
    appendMessage(transcript, { isUser: true });
    setAwaitingResponse(true);
    setIsPondering(true);
    
    try {
      // Get response from assistant
      const responseText = await askAssistant(threadId, transcript);
      
      // Generate speech from the response
      const audioUrl = await generateSpeech(responseText);
      
      // Stop pondering once we have both the text and audio
      setIsPondering(false);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
      
      // Add assistant message to chat
      appendMessage(responseText, { isUser: false });
    } catch (error) {
      console.error('Error processing question:', error);
      appendMessage('Sorry, I encountered an error processing your question.', { isUser: false });
      setIsPondering(false);
    } finally {
      setAwaitingResponse(false);
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.gameMasterBackground}
        style={{ backgroundImage: `url(${gameMasterImagePath})` }}
      >
        <div className={styles.overlay}>
          <PushToTalk onRecordingComplete={userAskedQuestion} />
          {isPondering && (
            <div className={styles.ponderingIndicator}>
              <div className={styles.ponderingDots}>
                <div className={styles.ponderingDot}></div>
                <div className={styles.ponderingDot}></div>
                <div className={styles.ponderingDot}></div>
              </div>
              <span>Game Master is pondering...</span>
            </div>
          )}
        </div>
      </div>
      <ChatOverlay history={chatHistory} userAskedQuestion={userAskedQuestion} awaitingResponse={awaitingResponse || loading} />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}; 