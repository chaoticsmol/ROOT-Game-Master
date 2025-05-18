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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { askAssistant, generateSpeech, loading, error } = useOpenAI();

  useEffect(() => {
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
    // Add user message to chat
    appendMessage(transcript, { isUser: true });
    setAwaitingResponse(true);
    setIsPondering(true);
    
    try {
      // Get response from assistant
      const responseText = await askAssistant(transcript);
      
      // Add assistant message to chat
      appendMessage(responseText, { isUser: false });
      
      // Generate speech from the response
      //const audioUrl = await generateSpeech(responseText);
      const audioUrl = await generateSpeech(responseText);
      
      // Stop pondering once we have both the text and audio
      setIsPondering(false);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
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