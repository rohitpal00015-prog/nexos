export class SpeechService {
  private static recognition: any = null;

  static isSpeechSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  static async requestMicPermission(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop stream tracks immediately after permission is granted
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      return true;
    } catch (err: any) {
      console.warn('[SpeechService] Mic permission notice:', err.message);
      return false;
    }
  }

  static async startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: string = 'en-IN'
  ) {
    if (!this.isSpeechSupported()) {
      onError('Speech recognition is not supported in this browser.');
      onEnd();
      return;
    }

    // Explicitly request microphone access first
    const hasPermission = await this.requestMicPermission();
    if (!hasPermission) {
      onError('Microphone permission denied. Please allow microphone access in Chrome.');
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
        let msg = 'Speech recognition notice.';
        if (event.error === 'not-allowed') msg = 'Microphone permission denied. Click mic again to grant permission.';
        if (event.error === 'no-speech') msg = 'No speech detected. Please speak louder into your microphone.';
        onError(msg);
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
    } catch (err: any) {
      onError(`Microphone error: ${err.message}`);
      onEnd();
    }
  }

  static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.log('[SpeechService] Stop listening error:', err);
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
