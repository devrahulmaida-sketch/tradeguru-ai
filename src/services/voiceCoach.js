// Live Audio Voice Coach using Web Speech Synthesis API

class VoiceCoach {
  constructor() {
    this.isEnabled = false;
    this.isSpeaking = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.lastSpokenText = "";
    this.lastSpokeTime = 0;
  }

  enable() {
    this.isEnabled = true;
    this.speak("TradeGuru Voice Mentor activated. Market analysis is now streaming live.");
  }

  disable() {
    this.isEnabled = false;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  speak(text, priority = false) {
    if (!this.synth || !this.isEnabled) return;

    // Prevent echoing identical messages within 10 seconds
    const now = Date.now();
    if (!priority && this.lastSpokenText === text && now - this.lastSpokeTime < 10000) {
      return;
    }

    if (this.synth.speaking) {
      if (!priority) return;
      this.synth.cancel();
    }

    // Clean text for speech (remove markdown symbols like **, #, $)
    const cleanText = text
      .replace(/[\*\_#`~]/g, '')
      .replace(/₹/g, 'Rupees ')
      .replace(/EMA/g, 'E M A')
      .replace(/RSI/g, 'R S I')
      .replace(/VWAP/g, 'V-wap')
      .replace(/FVG/g, 'Fair Value Gap')
      .replace(/SL/g, 'Stop Loss')
      .replace(/TP/g, 'Target')
      .replace(/R:R/g, 'Risk to reward')
      .slice(0, 250); // keep spoken chunks crisp and immediate

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try finding an Indian English / Hindi voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) ||
                           voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) ||
                           voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    this.lastSpokenText = text;
    this.lastSpokeTime = now;
    this.synth.speak(utterance);
  }
}

export const voiceCoach = new VoiceCoach();
