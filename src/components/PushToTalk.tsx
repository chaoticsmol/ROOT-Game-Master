import { useState, useRef } from "react";
import styles from './PushToTalk.module.css';
import OpenAI from 'openai';

export type PushToTalkProps = {
  onRecordingComplete: (transcript: string) => void;
}

type recordingState = 'idle' | 'recording' | 'transcribing';

export const PushToTalk = ({ onRecordingComplete }: PushToTalkProps) => {
  const [recordingState, setRecordingState] = useState<recordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      setRecordingState('recording');
      console.log('Started recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all audio tracks
        const stream = mediaRecorderRef.current?.stream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
    console.log('Stopped recording');
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Create a proper audio file that OpenAI can process
      const audioFile = new File([audioBlob], 'recording.webm', { 
        type: 'audio/webm' 
      });
      
      setRecordingState('transcribing');
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'gpt-4o-mini-transcribe',
      });
      
      onRecordingComplete(response.text);
      console.log('Transcription:', response.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setRecordingState('idle');
    }
  };

  const handlePushToTalk = () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'idle') {
      startRecording();
    } else {
      // Do nothing
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${recordingState === 'recording' ? styles.recording : ''} ${recordingState === 'transcribing' ? styles.transcribing : ''}`}
        onMouseDown={handlePushToTalk}
        onTouchStart={handlePushToTalk}
        disabled={recordingState === 'transcribing'}
      >
        <div className={`${styles.indicator} ${recordingState === 'transcribing' ? styles.spinner : ''}`} />
        <span className={styles.text}>
          {recordingState === 'recording' ? 'Push to stop recording' : recordingState === 'transcribing' ? 'Transcribing...' : 'Push to talk'}
        </span>
      </button>
    </div>
  );
};
