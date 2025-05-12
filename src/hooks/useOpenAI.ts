import { useState, useCallback } from 'react';
import OpenAI from 'openai';
import { APP_CONFIG } from '../configuration';

export const useOpenAI = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Only for client-side applications
  });

  // Reset error state
  const resetError = useCallback(() => setError(null), []);
  
  const createThread = useCallback(async () => {
    try {
      const thread = await openai.beta.threads.create();
      return thread.id;
    } catch (err) {
      setError(`Error creating thread: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }, []);

  const askAssistant = useCallback(async (threadId: string, message: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add the user's message to the thread
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message
      });
      
      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: APP_CONFIG.assistantId
      });
      
      // Poll for the completion of the run
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        
        if (runStatus.status === 'failed') {
          throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
      }
      
      // Get the assistant's messages
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessages = messages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (assistantMessages.length === 0) {
        throw new Error('No response from assistant');
      }
      
      // Extract the text content
      const latestMessage = assistantMessages[0];
      const textContent = latestMessage.content
        .filter(content => content.type === 'text')
        .map(content => (content.type === 'text' ? content.text.value : ''))
        .join(' ');
      
      return textContent;
    } catch (err) {
      setError(`Error with assistant: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const generateSpeech = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const mp3 = await openai.audio.speech.create({
        model: APP_CONFIG.gameMasterVoice.model,
        voice: APP_CONFIG.gameMasterVoice.voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'coral',
        instructions: APP_CONFIG.gameMasterVoice.instructions,
        input: text,
        response_format: 'mp3',
        speed: 1.0,
      });
      
      const blob = await mp3.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      setError(`Error generating speech: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    resetError,
    createThread,
    askAssistant,
    generateSpeech
  };
}; 