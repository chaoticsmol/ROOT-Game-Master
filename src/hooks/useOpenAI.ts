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
  
  const askAssistant = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);

    const prompt = `${APP_CONFIG.gameMasterBehaviour}
    
    User question: ${message}

    Answer in a concise manner, avoiding unnecessary verbosity.
    Instead of listing multiple rules, provide a single, concise answer.
    Avoid repeating the same information in the answer.
    `;
    
    try {
      const response = await openai.responses.create({
        model: 'gpt-4o-mini-2024-07-18',
        input: prompt,
        tools: [{
          type: 'file_search',
          vector_store_ids: [APP_CONFIG.vectorStoreId]
        }]
      });

      return response.output_text;
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
      const response = await openai.audio.speech.create({
        model: APP_CONFIG.gameMasterVoice.model,
        voice: APP_CONFIG.gameMasterVoice.voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'coral',
        instructions: APP_CONFIG.gameMasterVoice.instructions,
        input: text,
        response_format: 'mp3',
        speed: 1.0,
      });
     
      const blob = await response.blob();
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
    askAssistant,
    generateSpeech
  };
}; 