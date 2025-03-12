"use client";

import { Monster, SoundProfile } from "../types/game";

// Create a mapping of note names to frequencies
const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 2
  C2: 65.41,
  "C#2": 69.3,
  D2: 73.42,
  "D#2": 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  G2: 98.0,
  "G#2": 103.83,
  A2: 110.0,
  "A#2": 116.54,
  B2: 123.47,

  // Octave 3
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  "D#3": 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,

  // Octave 4
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,

  // Octave 5
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880.0,
  "A#5": 932.33,
  B5: 987.77,
};

// Map of instruments to their audio characteristics
const INSTRUMENT_TYPES: Record<
  string,
  {
    waveType: OscillatorType;
    attackTime: number;
    decayTime: number;
    sustainLevel: number;
    releaseTime: number;
  }
> = {
  piano: {
    waveType: "triangle",
    attackTime: 0.02,
    decayTime: 0.1,
    sustainLevel: 0.7,
    releaseTime: 0.5,
  },
  bass: {
    waveType: "sawtooth",
    attackTime: 0.05,
    decayTime: 0.2,
    sustainLevel: 0.8,
    releaseTime: 0.2,
  },
  percussion: {
    waveType: "square",
    attackTime: 0.001,
    decayTime: 0.2,
    sustainLevel: 0.3,
    releaseTime: 0.1,
  },
  drums: {
    waveType: "square",
    attackTime: 0.001,
    decayTime: 0.1,
    sustainLevel: 0.3,
    releaseTime: 0.05,
  },
  flute: {
    waveType: "sine",
    attackTime: 0.1,
    decayTime: 0.1,
    sustainLevel: 0.8,
    releaseTime: 0.3,
  },
  synth: {
    waveType: "sawtooth",
    attackTime: 0.01,
    decayTime: 0.2,
    sustainLevel: 0.6,
    releaseTime: 0.4,
  },
  marimba: {
    waveType: "sine",
    attackTime: 0.01,
    decayTime: 0.1,
    sustainLevel: 0.5,
    releaseTime: 0.2,
  },
  shaker: {
    waveType: "triangle",
    attackTime: 0.001,
    decayTime: 0.05,
    sustainLevel: 0.2,
    releaseTime: 0.05,
  },
  saxophone: {
    waveType: "sawtooth",
    attackTime: 0.05,
    decayTime: 0.2,
    sustainLevel: 0.7,
    releaseTime: 0.3,
  },
  vocals: {
    waveType: "sine",
    attackTime: 0.05,
    decayTime: 0.1,
    sustainLevel: 0.8,
    releaseTime: 0.3,
  },
};

// Create an audio context when needed (lazy initialization)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate a sound for a monster based on its sound profile
export const generateMonsterSound = (monster: Monster): HTMLAudioElement => {
  // For now, we'll use placeholder audio files
  // In a full implementation, we would generate the audio using Web Audio API based on the monster's sound profile

  // Create new audio element
  const audio = new Audio();

  // Set source based on monster type (this would be dynamically generated in a real implementation)
  switch (monster.soundProfile.instrument) {
    case "percussion":
      audio.src = "/audio/msm/percussion_loop.mp3";
      break;
    case "vocals":
      audio.src = "/audio/msm/vocals_loop.mp3";
      break;
    case "piano":
      audio.src = "/audio/msm/piano_loop.mp3";
      break;
    case "flute":
      audio.src = "/audio/msm/flute_loop.mp3";
      break;
    case "bass":
      audio.src = "/audio/msm/bass_loop.mp3";
      break;
    case "synth":
      audio.src = "/audio/msm/synth_loop.mp3";
      break;
    case "marimba":
      audio.src = "/audio/msm/marimba_loop.mp3";
      break;
    case "drums":
      audio.src = "/audio/msm/drums_loop.mp3";
      break;
    case "shaker":
      audio.src = "/audio/msm/shaker_loop.mp3";
      break;
    case "saxophone":
      audio.src = "/audio/msm/saxophone_loop.mp3";
      break;
    default:
      // Default fallback sound
      audio.src = "/audio/msm/default_loop.mp3";
  }

  // Set volume based on monster's sound profile
  audio.volume = monster.soundProfile.volume;

  // Set to loop
  audio.loop = true;

  return audio;
};

// Combine multiple monster sounds into a cohesive musical piece
export const combineMonsterSounds = (
  audioElements: Record<string, HTMLAudioElement>,
  masterVolume: number
): void => {
  // In a real implementation, we would synchronize all the audio elements
  // to play in rhythm and adjust their volumes for balance

  // For now, simply ensure all are playing and adjust their volumes
  Object.values(audioElements).forEach((audio) => {
    // Apply master volume
    audio.volume = audio.volume * masterVolume;

    // Ensure audio is playing
    if (audio.paused) {
      audio.play().catch((err) => console.error("Error playing audio:", err));
    }
  });
};

// Generate a dynamic musical note based on parameters
export const generateNote = (
  note: string,
  instrumentType: string,
  duration: number = 0.5,
  volume: number = 0.7,
  effects: string[] = []
): void => {
  try {
    const ctx = getAudioContext();

    // Get the frequency for the note
    const frequency = NOTE_FREQUENCIES[note] || 440; // Default to A4 if note not found

    // Get instrument settings
    const instrument =
      INSTRUMENT_TYPES[instrumentType] || INSTRUMENT_TYPES.piano;

    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = instrument.waveType;
    oscillator.frequency.value = frequency;

    // Create gain node for volume control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Apply effects if available
    if (effects.includes("vibrato")) {
      const vibratoAmount = 5;
      const vibratoSpeed = 5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = vibratoSpeed;

      const vibratoGain = ctx.createGain();
      vibratoGain.gain.value = vibratoAmount;

      lfo.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      lfo.start();
    }

    if (effects.includes("reverb")) {
      // Simple delay-based reverb
      const delayNode = ctx.createDelay();
      delayNode.delayTime.value = 0.1;

      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.3;

      gainNode.connect(delayNode);
      delayNode.connect(reverbGain);
      reverbGain.connect(ctx.destination);
    }

    if (effects.includes("distortion")) {
      const distortion = ctx.createWaveShaper();
      const distortionAmount = 20;

      function makeDistortionCurve(amount: number) {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; ++i) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
      }

      distortion.curve = makeDistortionCurve(distortionAmount);
      distortion.oversample = "4x";

      gainNode.connect(distortion);
      distortion.connect(ctx.destination);
    }

    // Start the oscillator
    oscillator.start();

    // Apply ADSR envelope
    const now = ctx.currentTime;

    // Attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + instrument.attackTime);

    // Decay
    gainNode.gain.linearRampToValueAtTime(
      volume * instrument.sustainLevel,
      now + instrument.attackTime + instrument.decayTime
    );

    // Sustain happens automatically

    // Release
    gainNode.gain.linearRampToValueAtTime(
      0,
      now + duration + instrument.releaseTime
    );

    // Stop the oscillator after the note is done
    oscillator.stop(now + duration + instrument.releaseTime);
  } catch (error) {
    console.error("Error generating note:", error);
  }
};
