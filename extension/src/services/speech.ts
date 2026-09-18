export class SpeechService {
  private static recognition: any = null;

  static isSpeechSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  static async requestMicPermission(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
    } catch (err: any) {
      console.warn('[SpeechService] getUserMedia permission notice:', err?.message || err);
    }
    return true; // Fallback to direct SpeechRecognition initialization
  }

  static async startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: string = 'en-IN'
  ) {
    if (!this.isSpeechSupported()) {
      onError('Speech recognition is not supported in this browser environment.');
      onEnd();
      return;
    }

    // Clean up any existing recognition instance to prevent InvalidStateError
    this.stopListening();

    const hasPermission = await this.requestMicPermission();
    if (!hasPermission) {
      onError('Microphone permission denied. Please allow microphone access in Chrome settings.');
      onEnd();
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (finalText) {
          onResult(finalText, true);
        } else if (interimText) {
          onResult(interimText, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        let msg = '';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission denied. Please enable mic access in browser settings.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak clearly into your microphone.';
        } else if (event.error === 'network') {
          msg = 'Network connection issue for speech recognition.';
        } else if (event.error === 'audio-capture') {
          msg = 'No microphone device found. Please plug in a microphone.';
        } else if (event.error !== 'aborted') {
          msg = `Speech error: ${event.error}`;
        }
        if (msg) onError(msg);
      };

      this.recognition.onend = () => {
        this.recognition = null;
        onEnd();
      };

      this.recognition.start();
    } catch (err: any) {
      console.warn('[SpeechService] Recognition start error:', err);
      onError(`Microphone notice: ${err?.message || 'Could not start microphone'}`);
      this.recognition = null;
      onEnd();
    }
  }

  static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort();
      } catch (err) {
        console.log('[SpeechService] Stop listening cleanup:', err);
      } finally {
        this.recognition = null;
      }
    }
  }

  static speak(text: string, lang: string = 'en-IN') {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService] Speech synthesis error:', err);
    }
  }

  static stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
