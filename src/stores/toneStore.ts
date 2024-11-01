import { create } from 'zustand';
import * as Tone from 'tone';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import { useButterChurnStore } from './butterchurnStore';
import { useCameraStore } from './cameraStore';
import { useASCIIUpdateStore } from './asciiUpdateStore';

// Define the types of audio sources and visualizer modes
export type AudioSourceType =
  | 'vocal'
  | 'background'
  | 'plane'
  | 'elevenLabs'
  | 'video'
  | 'voice'
  | 'music';
export type VisualizerMode = 'line' | 'circle' | 'butterchurn' | 'none';

interface MusicSetupConfig {
  introText: string;
  introAudio: string;
  songUrl: string;
  visualizer: {
    mode: 'butterchurn' | 'line' | 'circle' | 'none';
    preset: string;
    thresholds: {
      beatThreshold: number;
      noveltyThreshold?: number;
      energyThreshold?: number;
      frequencyThreshold?: number;
      cooldown?: number;
    };
    shaderEnabled: boolean;
    useThemeColors: boolean;
  };
}

// Interface for an audio source, encapsulating its URL, details, player, and analyser
interface AudioSource {
  url: string | null;
  details: { name: string; duration: number };
  player: Tone.Player | Tone.UserMedia | null;
  analyser: Tone.Analyser | null;
}

// Main state interface for the Tone.js store
interface ToneState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  pitch: number;
  activeSources: {
    [key in AudioSourceType]: AudioSource | null;
  };
  activeSourceType: AudioSourceType | null;
  masterGain: Tone.Gain | null;
  fft: Tone.FFT | null;
  waveform: Tone.Waveform | null;
  effects: {
    pitchShift: Tone.PitchShift | null;
  };
  effectsEnabled: {
    pitchShift: boolean;
  };
  linkSpeedAndPitch: boolean;
  visualizerMode: VisualizerMode;
  visualizerGui: 'bar' | 'circular' | 'none';
  isElevenLabsEnabled: boolean;
  isShaderVisualizerEnabled: boolean;
  useThemeColors: boolean;

  // Function declarations for state management
  setIsElevenLabsEnabled: (enabled: boolean) => void;
  setShaderVisualizerEnabled: (enabled: boolean) => void;
  setUseThemeColors: (use: boolean) => void;
  initializeAudio: () => Promise<void>;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setActiveAudioSource: (sourceType: AudioSourceType) => void;
  getActiveAudioSource: () => AudioSource | null;
  setAudioForSource: (
    sourceType: AudioSourceType,
    audio: Partial<AudioSource>,
  ) => void;
  cleanupAudioSource: (sourceType: AudioSourceType) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  cleanupAudio: () => void;
  getFFTData: () => Float32Array;
  getWaveformData: () => Float32Array;
  setEffectParameter: (
    effect: string,
    parameter: string,
    value: number,
  ) => void;
  setMasterGain: (value: number) => void;
  toggleEffect: (effect: string, enabled: boolean) => void;
  setLinkSpeedAndPitch: (link: boolean) => void;
  updateActiveSource: () => void;
  handleElevenLabsAudio: (audioUrl: string) => void;
  handleMusicSetup: (config: MusicSetupConfig) => Promise<Tone.Player>;
  initializeVoiceInput: () => Promise<void>;
  syncVideoPlaybackRate: (rate: number) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setVisualizerGui: (shape: 'bar' | 'circular' | 'none') => void;
  generateElevenLabsSpeech: (
    text: string,
    generateSpeechFunc: (text: string) => Promise<Blob>,
  ) => Promise<void>;
  replayAudio: (audioUrl: string) => Promise<null>;
  updateVisualizerSettings: (config: MusicSetupConfig) => void;
}

// Zustand store creation for managing audio state
const useToneStore = create<ToneState>((set, get) => ({
  // Initial state values
  isPlaying: false,
  currentTime: 0,
  playbackRate: 1,
  pitch: 0,
  activeSources: {
    vocal: null,
    background: null,
    elevenLabs: null,
    video: null,
    voice: null,
    plane: null,
    music: null,
  },
  activeSourceType: null,
  masterGain: null,
  fft: null,
  waveform: null,
  effects: {
    pitchShift: null,
  },
  effectsEnabled: {
    pitchShift: false,
  },
  linkSpeedAndPitch: false,
  visualizerMode: 'none',
  visualizerGui: 'bar',
  isElevenLabsEnabled: true, // Default to true
  isShaderVisualizerEnabled: true,
  useThemeColors: true,

  // Function to enable or disable ElevenLabs audio
  setIsElevenLabsEnabled: (enabled) => set({ isElevenLabsEnabled: enabled }),

  // Function to enable or disable shader visualizer
  setShaderVisualizerEnabled: (enabled) =>
    set({ isShaderVisualizerEnabled: enabled }),

  // Function to toggle theme colors usage
  setUseThemeColors: (use) => set({ useThemeColors: use }),

  // Initialize audio components and effects
  initializeAudio: async () => {
    await Tone.start();
    const masterGain = new Tone.Gain(1).toDestination();
    const fft = new Tone.FFT(1024);
    const waveform = new Tone.Waveform(1024);

    // Initialize audio effects
    const pitchShift = new Tone.PitchShift();

    // Connect master gain to FFT and waveform analysers
    masterGain.connect(fft);
    masterGain.connect(waveform);

    // Set initialized components in the state
    set({ masterGain, fft, waveform, effects: { pitchShift } });
  },

  // Generate speech using ElevenLabs and handle the audio
  generateElevenLabsSpeech: async (
    text: string,
    generateSpeechFunc: (text: string) => Promise<Blob>,
  ) => {
    const { isElevenLabsEnabled, handleElevenLabsAudio } = get();

    if (!isElevenLabsEnabled) {
      console.log('ElevenLabs Audio is disabled. Skipping speech generation.');
      return;
    }

    try {
      console.log('ElevenLabs Audio is enabled. Generating speech.');
      const audioBlob = await generateSpeechFunc(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      handleElevenLabsAudio(audioUrl);
    } catch (error) {
      console.error('Error generating ElevenLabs speech:', error);
    }
  },

  handleMusicSetup: async (config: MusicSetupConfig): Promise<Tone.Player> => {
    return new Promise((resolve, reject) => {
      const {
        setAudioForSource,
        setActiveAudioSource,
        setIsPlaying,
        updateActiveSource,
        cleanupAudioSource,
        setVisualizerMode,
        setShaderVisualizerEnabled,
        setUseThemeColors,
        setPitch,
        setPlaybackRate,
        updateVisualizerSettings,
      } = get();

      try {
        // Update visualizer settings before audio setup
        updateVisualizerSettings(config);

        // 1. Clean up ALL existing audio sources
        cleanupAudioSource('elevenLabs');
        cleanupAudioSource('music');
        setIsPlaying(false);

        // Reset camera position
        useCameraStore.getState().cycleCameraPosition('previous');

        // 2. Reset audio settings to defaults
        setPitch(1);
        setPlaybackRate(1);

        // 3. Set up visualizer
        if (config.visualizer) {
          setVisualizerMode(config.visualizer.mode);
          setShaderVisualizerEnabled(config.visualizer.shaderEnabled);
          setUseThemeColors(config.visualizer.useThemeColors);
          useASCIIUpdateStore.getState().setUpdateFontSize(false);
          useASCIIUpdateStore.getState().setUpdateCellSize(false);
          useASCIIUpdateStore.getState().setUpdateColor(true);
          useASCIIUpdateStore.getState().setUpdateBackgroundColor(false);
        }

        // 4. Create new player with explicit playback settings
        const newPlayer = new Tone.Player({
          url: config.songUrl,
          loop: false,
          autostart: false,
          playbackRate: 1,
          onload: () => {
            console.log('Music loaded successfully');
            const newAnalyser = new Tone.Analyser('waveform', 256);
            newPlayer.connect(newAnalyser);

            setAudioForSource('music', {
              url: config.songUrl,
              details: {
                name: config.songUrl,
                duration: newPlayer.buffer.duration,
              },
              player: newPlayer,
              analyser: newAnalyser,
            });

            setActiveAudioSource('music');
            updateActiveSource();

            // Ensure Tone.js is started with default settings
            Tone.start().then(() => {
              newPlayer.start();
              setIsPlaying(true);
              console.log('Music playback started');
              resolve(newPlayer);
            });
          },
          onerror: (error) => {
            console.error('Error loading music:', error);
            reject(error);
          },
        }).toDestination();
      } catch (error) {
        console.error('Error in handleMusicSetup:', error);
        reject(error);
      }
    });
  },

  // Handle audio from ElevenLabs, setting it as the active source
  // Modify handleElevenLabsAudio to return the player
  handleElevenLabsAudio: (audioUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      const {
        setAudioForSource,
        setActiveAudioSource,
        setIsPlaying,
        updateActiveSource,
        cleanupAudioSource,
        getActiveAudioSource,
        togglePlayPause,
      } = get();

      // First stop any currently playing audio
      const activeSource = getActiveAudioSource();
      if (activeSource?.player && activeSource.player instanceof Tone.Player) {
        activeSource.player.stop();
      }

      // Clean up ALL audio sources
      cleanupAudioSource('music');
      cleanupAudioSource('elevenLabs');
      setIsPlaying(false);

      const newPlayer = new Tone.Player({
        url: audioUrl,
        loop: false,
        autostart: false,
        onload: () => {
          const newAnalyser = new Tone.Analyser('waveform', 256);
          newPlayer.connect(newAnalyser);

          newPlayer.onstop = () => {
            setIsPlaying(false);
            resolve();
          };

          setAudioForSource('elevenLabs', {
            url: audioUrl,
            details: {
              name: 'ElevenLabs Audio',
              duration: newPlayer.buffer.duration,
            },
            player: newPlayer,
            analyser: newAnalyser,
          });

          setActiveAudioSource('elevenLabs');
          updateActiveSource();
          newPlayer.start();
          setIsPlaying(true);
        },
      }).toDestination();
    });
  },

  // Set audio for a plane source, typically used for video or audio elements
  setPlaneAudio: (audioElement: HTMLAudioElement | HTMLVideoElement) => {
    const { setAudioForSource, setActiveAudioSource, updateActiveSource } =
      get();

    // Create a ToneAudioBuffer from the audio element
    const buffer = new Tone.ToneAudioBuffer(audioElement.src, () => {
      const player = new Tone.Player({
        url: buffer,
        loop: true,
      }).toDestination();

      const analyser = new Tone.Analyser('waveform', 256);
      player.connect(analyser);

      setAudioForSource('plane', {
        url: audioElement.src,
        details: { name: 'Plane Audio', duration: audioElement.duration },
        player,
        analyser,
      });

      setActiveAudioSource('plane');
      updateActiveSource();
    });
  },

  // Set the playing state of the audio
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // Set the current playback time for the active audio source
  setCurrentTime: (time) => {
    const activeSource = get().getActiveAudioSource();
    if (activeSource?.player instanceof Tone.Player) {
      activeSource.player.seek(time);
    }
    set({ currentTime: time });
  },

  // Set the playback rate and optionally link it to pitch
  setPlaybackRate: (rate) => {
    const {
      getActiveAudioSource,
      linkSpeedAndPitch,
      setPitch,
      syncVideoPlaybackRate,
    } = get();
    const activeSource = getActiveAudioSource();
    if (activeSource?.player instanceof Tone.Player) {
      activeSource.player.playbackRate = rate;
      if (linkSpeedAndPitch) {
        const newPitch = Math.log2(rate) * 12;
        setPitch(newPitch);
      }
    }
    syncVideoPlaybackRate(rate);
    set({ playbackRate: rate });
  },

  // Set the pitch for the pitch shift effect
  setPitch: (pitch) => {
    const { effects, effectsEnabled, toggleEffect } = get();
    if (effects.pitchShift) {
      effects.pitchShift.pitch = pitch;
      // If pitch is 1 (neutral), disable the effect
      if (pitch === 1) {
        toggleEffect('pitchShift', false);
      } else if (!effectsEnabled.pitchShift) {
        toggleEffect('pitchShift', true);
      }
    }
    set({ pitch });
  },

  // Set the active audio source type
  setActiveAudioSource: (sourceType) => {
    set({ activeSourceType: sourceType });
    get().updateActiveSource();
  },

  // Retrieve the currently active audio source
  getActiveAudioSource: () => {
    const { activeSources, activeSourceType } = get();
    return activeSourceType ? activeSources[activeSourceType] : null;
  },

  // Set audio data for a specific source type
  setAudioForSource: (sourceType, audio) => {
    set((state) => ({
      activeSources: {
        ...state.activeSources,
        [sourceType]: { ...state.activeSources[sourceType], ...audio },
      },
    }));
  },

  // Clean up resources for a specific audio source
  cleanupAudioSource: (sourceType) => {
    const { activeSources } = get();
    const source = activeSources[sourceType];
    if (source) {
      if (source.player) source.player.dispose();
      if (source.analyser) source.analyser.dispose();
      set((state) => ({
        activeSources: {
          ...state.activeSources,
          [sourceType]: null,
        },
      }));
    }
  },

  // Toggle play/pause state for the active audio source
  togglePlayPause: () => {
    const { isPlaying, getActiveAudioSource, currentTime } = get();
    const activeSource = getActiveAudioSource();

    if (activeSource?.player) {
      if (isPlaying) {
        if (activeSource.player instanceof Tone.Player) {
          activeSource.player.stop(); // Changed from stop() to pause()
        } else if (activeSource.player instanceof Tone.UserMedia) {
          activeSource.player.close();
        }
      } else {
        if (activeSource.player instanceof Tone.Player) {
          if (activeSource.player.buffer && activeSource.player.buffer.loaded) {
            if (activeSource.player.state === 'started') {
              activeSource.player.start(); // Resume from current position
            } else {
              activeSource.player.start('+0.1', currentTime);
            }
          } else {
            console.warn('Buffer is not set or not loaded, skipping playback.');
          }
        } else if (activeSource.player instanceof Tone.UserMedia) {
          activeSource.player.open();
        }
      }
      set({ isPlaying: !isPlaying });
    }
  },

  // Seek to a specific time in the active audio source
  seekTo: (time) => {
    const { getActiveAudioSource, isPlaying } = get();
    const activeSource = getActiveAudioSource();
    if (activeSource?.player instanceof Tone.Player) {
      if (activeSource.player.buffer && activeSource.player.buffer.loaded) {
        if (isPlaying) {
          activeSource.player.stop();
          activeSource.player.start('+0.1', time);
        } else {
          activeSource.player.seek(time);
        }
        set({ currentTime: time });
      } else {
        console.warn('Buffer is not set or not loaded, skipping seek.');
      }
    }
  },

  // Clean up all audio resources
  cleanupAudio: () => {
    const { activeSources, masterGain } = get();
    Object.values(activeSources).forEach((source) => {
      if (source?.player) source.player.dispose();
      if (source?.analyser) source.analyser.dispose();
    });
    if (masterGain) masterGain.dispose();
    set({
      activeSources: {
        vocal: null,
        background: null,
        elevenLabs: null,
        video: null,
        voice: null,
        plane: null,
        music: null,
      },
      masterGain: null,
      fft: null,
      waveform: null,
      effects: {
        pitchShift: null,
      },
    });
  },

  // Update the active audio source connections
  updateActiveSource: () => {
    const {
      activeSourceType,
      activeSources,
      effects,
      effectsEnabled,
      masterGain,
    } = get();
    const activeSource = activeSourceType
      ? activeSources[activeSourceType]
      : null;
    if (activeSource?.player && masterGain) {
      // Disconnect only the active source
      if (
        activeSource.player instanceof Tone.Player ||
        activeSource.player instanceof Tone.UserMedia
      ) {
        activeSource.player.disconnect();
      }

      // Set up the active source
      const enabledEffects = Object.entries(effects)
        .filter(([key]) => effectsEnabled[key as keyof typeof effectsEnabled])
        .map(([, effect]) => effect) as Tone.ToneAudioNode[];

      if (enabledEffects.length > 0) {
        activeSource.player.chain(...enabledEffects, masterGain);
      } else {
        activeSource.player.connect(masterGain);
      }

      // Connect to the analyser
      if (activeSource.analyser) {
        activeSource.player.connect(activeSource.analyser);
      }
    }
  },

  // Retrieve FFT data for visualizations
  getFFTData: () => {
    const { fft } = get();
    return fft ? fft.getValue() : new Float32Array(1024);
  },

  // Retrieve waveform data for visualizations
  getWaveformData: () => {
    const { waveform } = get();
    return waveform ? waveform.getValue() : new Float32Array(1024);
  },

  // Set parameters for a specific audio effect
  setEffectParameter: (effect, parameter, value) => {
    const { effects } = get();
    if (effects[effect as keyof typeof effects]) {
      const effectInstance = effects[effect as keyof typeof effects];
      if (effectInstance) {
        if (parameter in effectInstance) {
          if (effectInstance[parameter] instanceof Tone.Param) {
            effectInstance[parameter].setValueAtTime(value, Tone.now());
          } else if (typeof effectInstance[parameter] === 'function') {
            effectInstance[parameter](value);
          } else {
            console.warn(
              `Cannot set property ${parameter} on effect ${effect}`,
            );
          }
        } else {
          console.warn(`Property ${parameter} not found on effect ${effect}`);
        }
      }
    }
  },

  // Set the master gain level
  setMasterGain: (value) => {
    const { masterGain } = get();
    if (masterGain) {
      masterGain.gain.value = value;
    }
  },

  // Toggle an audio effect on or off
  toggleEffect: (effect, enabled) => {
    const { activeSources, activeSourceType, effects, masterGain } = get();
    const activeSource = activeSourceType
      ? activeSources[activeSourceType]
      : null;
    if (
      effects[effect as keyof typeof effects] &&
      activeSource?.player &&
      masterGain
    ) {
      const effectInstance = effects[effect as keyof typeof effects];
      if (effectInstance) {
        if (enabled) {
          activeSource.player.disconnect();
          activeSource.player.chain(effectInstance, masterGain);
        } else {
          activeSource.player.disconnect();
          activeSource.player.connect(masterGain);
        }
      }
    }
    set((state) => ({
      effectsEnabled: {
        ...state.effectsEnabled,
        [effect]: enabled,
      },
    }));
  },

  // Link or unlink speed and pitch
  setLinkSpeedAndPitch: (link) => set({ linkSpeedAndPitch: link }),

  // Initialize voice input from the user's microphone
  initializeVoiceInput: async () => {
    const userMedia = new Tone.UserMedia();
    await userMedia.open();
    const analyser = new Tone.Analyser('waveform', 256);
    userMedia.connect(analyser);
    userMedia.connect(Tone.getDestination());
    set((state) => ({
      activeSources: {
        ...state.activeSources,
        voice: {
          url: null,
          details: { name: 'Microphone', duration: Infinity },
          player: userMedia,
          analyser,
        },
      },
    }));
  },

  // Sync the playback rate of video elements
  syncVideoPlaybackRate: (rate) => {
    console.log('Video playback rate synced:', rate);
  },

  // Set the visualizer mode
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),

  // Set the visualizer shape
  setVisualizerGui: (shape) => set({ visualizerGui: shape }),

  // Replay audio from a given URL
  replayAudio: async (audioUrl: string) => {
    const {
      togglePlayPause,
      isPlaying,
      getActiveAudioSource,
      handleElevenLabsAudio,
    } = get();

    // Stop any current playback
    const activeSource = getActiveAudioSource();
    if (activeSource?.player && isPlaying) {
      togglePlayPause();
    }

    // Play the stored audio
    await handleElevenLabsAudio(audioUrl);
    return null; // Add explicit null return
  },

  // Move updateVisualizerSettings inside the store definition
  updateVisualizerSettings: (config: MusicSetupConfig) => {
    const { visualizer } = config;

    // Update Butterchurn preset
    useButterChurnStore.getState().setPresetByName(visualizer.preset);

    // Update camera store thresholds
    const cameraStore = useCameraStore.getState();
    cameraStore.setBeatThreshold(visualizer.thresholds.beatThreshold);
    cameraStore.setNoveltyThreshold(
      visualizer.thresholds.noveltyThreshold || 0.5,
    );
    cameraStore.setBeatEnergyThreshold(
      visualizer.thresholds.energyThreshold || 0.5,
    );
    cameraStore.setFrequencyThreshold(
      visualizer.thresholds.frequencyThreshold || 4000,
    );
    cameraStore.setCameraChangeCooldown(visualizer.thresholds.cooldown || 100);

    // Enable sound animation
    cameraStore.setIsSoundAnimationEnabled(true);

    // Update visualizer mode and settings
    set({
      visualizerMode: visualizer.mode,
      isShaderVisualizerEnabled: visualizer.shaderEnabled,
      useThemeColors: visualizer.useThemeColors,
    });
  },
}));

export default useToneStore;
