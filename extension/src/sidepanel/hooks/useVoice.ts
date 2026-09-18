import { useState, useCallback } from 'react';
import { SpeechService } from '../../services/speech';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback((onFinalTranscript: (text: string) => void, lang: string = 'en-IN') => {
    setError(null);
    setIsListening(true);
    setTranscript('');

    SpeechService.startListening(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          setIsListening(false);
          onFinalTranscript(text);
        }
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      lang
    );
  }, []);

  const stopListening = useCallback(() => {
    SpeechService.stopListening();
    setIsListening(false);
  }, []);

  const speakText = useCallback((text: string, lang: string = 'en-IN') => {
    SpeechService.speak(text, lang);
  }, []);

  const stopSpeaking = useCallback(() => {
    SpeechService.stopSpeaking();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isListening,
    transcript,
    error,
    clearError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    isSupported: SpeechService.isSpeechSupported()
  };
}
