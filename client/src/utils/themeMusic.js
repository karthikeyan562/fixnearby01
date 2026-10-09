// FixNearby Ambient Theme Music Synthesizer (Web Audio API)
// Provides a modern, trustworthy, high-quality audio experience without external downloads.

class ThemeMusicPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.timerId = null;
    this.masterGain = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
  }

  play() {
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Harmonic chord progression for a trustworthy, uplifting brand vibe (Cmaj9 -> Am9 -> Fmaj7 -> Gsus4)
    const chords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
      [220.00, 261.63, 329.63, 392.00, 523.25], // Am9
      [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj7
      [196.00, 246.94, 293.66, 392.00, 587.33], // Gsus4
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      // Soft ambient synth pad
      currentChord.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle envelope (attack 1.2s, release 1.5s)
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.04 / (idx + 1), now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 4.0);
      });

      // Subtle warm bell accent melody
      const bellFreq = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
      const bellOsc = this.audioCtx.createOscillator();
      const bellGain = this.audioCtx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(bellFreq, now + 0.5);

      bellGain.gain.setValueAtTime(0, now + 0.5);
      bellGain.gain.linearRampToValueAtTime(0.03, now + 0.6);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      bellOsc.connect(bellGain);
      bellGain.connect(this.masterGain);

      bellOsc.start(now + 0.5);
      bellOsc.stop(now + 2.6);

      this.timerId = setTimeout(playNextChord, 4000);
    };

    playNextChord();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }
}

export const themeMusic = new ThemeMusicPlayer();
