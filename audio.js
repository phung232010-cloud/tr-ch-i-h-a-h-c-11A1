// Quản lý âm thanh Web Audio API & Phát âm tiếng Anh (Web Speech Synthesis)
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.speechEnabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  playClick() {
    this.playTone(600, 'sine', 0.05, 0.05);
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.18, 0.08);
      }, idx * 60);
    });
  }

  playWrong() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    this.playTone(180, 'sawtooth', 0.25, 0.12);
    setTimeout(() => {
      this.playTone(130, 'sawtooth', 0.3, 0.12);
    }, 120);
  }

  playMatch() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [587.33, 880.0]; // D5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.2, 0.09);
      }, idx * 100);
    });
  }

  playCombo(count) {
    if (!this.soundEnabled) return;
    const baseFreq = Math.min(1200, 440 + count * 60);
    this.playTone(baseFreq, 'triangle', 0.2, 0.1);
  }

  playWin() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    melody.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.35, 0.1);
      }, idx * 110);
    });
  }

  // Phát âm tiếng Anh chuẩn IUPAC
  speak(text) {
    if (!this.speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop current speech
    
    // Clean text: e.g. "hydrogen carbonate / bicarbonate" -> "hydrogen carbonate"
    let cleanText = text.split('/')[0].trim();
    // remove parentheses if any
    cleanText = cleanText.replace(/\(.*?\)/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // clear, slightly slower for learners
    utterance.pitch = 1.0;

    // Select suitable English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

const soundManager = new SoundManager();
