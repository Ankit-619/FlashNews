
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  // Browsers suspend the context until user interaction
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

interface ToneOptions {
  freq: number;
  endFreq?: number;
  duration: number;
  volume?: number;
  type?: OscillatorType;
  delay?: number;
}

function playTone({
  freq,
  endFreq,
  duration,
  volume = 0.06,
  type = "sine",
  delay = 0,
}: ToneOptions) {
  try {
    const ctx = getCtx();
    const startTime = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
    }

    // Smooth attack-decay envelope for pleasant sound
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  } catch {
    // Audio unsupported or blocked — fail silently
  }
}

// ---------- Named sounds ----------
export const sounds = {
  /**
   * Warm three-note ascending chime.
   * Plays the first time the user interacts with the page.
   */
  enter: () => {
    playTone({ freq: 523.25, duration: 0.5, volume: 0.05 }); // C5
    playTone({ freq: 783.99, duration: 0.6, volume: 0.04, delay: 0.14 }); // G5
    playTone({ freq: 1046.5, duration: 0.9, volume: 0.035, delay: 0.3 }); // C6
  },

  /** Soft tick for generic buttons */
  click: () => {
    playTone({ freq: 800, endFreq: 500, duration: 0.07, volume: 0.04 });
  },

  /** Brighter tap for category pills */
  select: () => {
    playTone({ freq: 660, endFreq: 990, duration: 0.11, volume: 0.055 });
  },

  /** Richer two-tone chime for the main CTA */
  primary: () => {
    playTone({ freq: 440, endFreq: 660, duration: 0.16, volume: 0.07 });
    playTone({ freq: 660, endFreq: 880, duration: 0.22, volume: 0.05, delay: 0.08 });
  },

  /** Satisfying ping for successful actions */
  success: () => {
    playTone({ freq: 880, duration: 0.16, volume: 0.05 });
    playTone({ freq: 1318.5, duration: 0.32, volume: 0.045, delay: 0.1 });
  },

  /** Pop for saving an article */
  pop: () => {
    playTone({ freq: 880, endFreq: 440, duration: 0.16, volume: 0.055 });
  },
};