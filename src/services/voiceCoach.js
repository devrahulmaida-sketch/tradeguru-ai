// Web Audio Chimes & Ultra-Clean Sound Engine (No annoying robotic speech by default)
class SoundEngine {
  constructor() {
    this.mode = "CHIMES_ONLY"; // "CHIMES_ONLY" | "MUTED" | "VOICE"
    this.audioCtx = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    return this.audioCtx;
  }

  // Institutional Audio Chime (Bloomberg / TradingView ping style)
  playChime(type = 'setup') {
    if (this.mode === 'MUTED') return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'profit') {
        // High pleasant cash / win chime (C5 -> E5 -> G5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'setup') {
        // Subtle dual alert ping (D5 -> A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'sl') {
        // Gentle low alert
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (_) {}
  }

  speak(text) {
    this.playChime('setup');
    if (this.mode !== 'VOICE' || !this.synth) return;

    if (this.synth.speaking) this.synth.cancel();

    // Natural short speech only
    const clean = text.replace(/[\*\_#`~]/g, '').slice(0, 100);
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 0.92;
    u.pitch = 0.95;

    const voices = this.synth.getVoices();
    const natural = voices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.lang.includes("en-IN"));
    if (natural) u.voice = natural;

    this.synth.speak(u);
  }

  setMode(newMode) {
    this.mode = newMode;
    if (newMode !== 'MUTED') {
      this.playChime('setup');
    }
  }
}

export const soundEngine = new SoundEngine();
export const voiceCoach = soundEngine; // backwards compatibility
