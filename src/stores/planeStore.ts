// planeStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import * as Tone from 'tone';
import useToneStore from './toneStore';

interface PlanePosition {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  geometry: {
    type: 'ellipse';
    width: number;
    height: number;
    segments?: number;
  };
}

interface PlaneSettings {
  flipTexture: boolean;
  splitTexture: boolean;
  isLeftHalf: boolean;
  showVideoOnPlane: boolean;
}

interface PlaneState {
  planes: Record<string, PlaneSettings>;
  flipTexture: boolean;
  splitTexture: boolean;
  file: File | null;
  url: string;
  videoElement: HTMLVideoElement | null;
  currentTime: number;
  duration: number;
  volume: number;
  playing: boolean;
  mediaType: 'image' | 'video' | null;
  isPictureInPicture: boolean;
  fileDimensions: { width: number; height: number } | null;
  planePositions: {
    default: PlanePosition;
    computer: PlanePosition;
    skull: PlanePosition;
    computerAndSkull: PlanePosition;
  };
  currentPositionKey: 'default' | 'computer' | 'skull' | 'computerAndSkull';
  showVisualizer: boolean;
  showVideoOnPlane: boolean;
  registerPlane: () => string;
  unregisterPlane: (id: string) => void;
  setFlipTexture: (flip: boolean) => void;
  setSplitTexture: (split: boolean) => void;
  setFile: (file: File | null) => void;
  setUrl: (url: string) => void;
  setVideoElement: (videoElement: HTMLVideoElement | null) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
  setMediaType: (mediaType: 'image' | 'video' | null) => void;
  setPictureInPicture: (isPiP: boolean) => void;
  setFileDimensions: (
    dimensions: { width: number; height: number } | null,
  ) => void;
  togglePlayPause: () => void;
  togglePictureInPicture: () => Promise<void>;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  resetState: () => void;
  updateVideoElement: (videoElement: HTMLVideoElement | null) => void;
  setVideoTime: (time: number) => void;
  setCurrentPositionKey: (
    key: 'default' | 'computer' | 'skull' | 'computerAndSkull',
  ) => void;
  setShowVisualizer: (show: boolean) => void;
  startPlaying: () => void;
  setShowVideoOnPlane: (show: boolean) => void;
}

export const usePlaneStore = create<PlaneState>((set, get) => ({
  planes: {},
  flipTexture: false,
  splitTexture: false,
  file: null,
  url: '/media/skull_eyes/vids/ghostmelt-bright.mp4',
  videoElement: null,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playing: false,
  mediaType: null,
  isPictureInPicture: false,
  fileDimensions: null,
  planePositions: {
    default: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      geometry: { type: 'ellipse', width: 1, height: 1 },
    },
    computer: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [2, 2, 2],
      geometry: { type: 'ellipse', width: 1, height: 1 },
    },
    skull: {
      position: [-0.31, 0.08, -0.6],
      rotation: [-0.08, 0.36, 0.03],
      scale: [0.6, 0.6, 0.6],
      geometry: { type: 'ellipse', width: 0.81, height: 0.62, segments: 28 },
    },
    computerAndSkull: {
      position: [-0.31, 0.08, -0.6],
      rotation: [-0.08, 0.36, 0.03],
      scale: [0.6, 0.6, 0.6],
      geometry: { type: 'ellipse', width: 0.81, height: 0.62, segments: 28 },
    },
  },
  currentPositionKey: 'default',
  showVisualizer: false,
  showVideoOnPlane: false,

  registerPlane: () => {
    const id = uuidv4();
    set((state) => ({
      planes: {
        ...state.planes,
        [id]: { flipTexture: false, splitTexture: false, isLeftHalf: true },
      },
    }));
    return id;
  },

  unregisterPlane: (id: string) => {
    set((state) => {
      const newPlanes = { ...state.planes };
      delete newPlanes[id];
      return { planes: newPlanes };
    });
  },

  setFlipTexture: (flip) => set({ flipTexture: flip }),

  setSplitTexture: (split) => set({ splitTexture: split }),

  setFile: (file) => {
    if (get().file !== file) {
      get().resetState();
      set({
        file,
        mediaType: file
          ? file.type.startsWith('video')
            ? 'video'
            : 'image'
          : null,
      });
      if (file && file.type.startsWith('video')) {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        get().updateVideoElement(video);
      }
    }
  },

  setUrl: (url) => {
    if (get().url !== url) {
      get().resetState();
      const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
      set({
        url,
        mediaType: url ? (isVideo ? 'video' : 'image') : null,
      });
      if (isVideo) {
        const video = document.createElement('video');
        video.src = url;
        get().updateVideoElement(video);
      } else {
        set({ mediaType: 'image' });
      }
    }
  },

  setVideoElement: (videoElement) => set({ videoElement }),
  setDuration: (duration) => set({ duration }),
  setPlaying: (playing) => set({ playing }),
  setMediaType: (mediaType) => set({ mediaType }),
  setPictureInPicture: (isPiP) => set({ isPictureInPicture: isPiP }),
  setFileDimensions: (dimensions) => set({ fileDimensions: dimensions }),
  togglePlayPause: () => {
    const { videoElement, playing } = get();
    if (videoElement) {
      if (playing) {
        videoElement.pause();
        useToneStore.getState().setIsPlaying(false);
      } else {
        videoElement.play().catch(console.error);
        useToneStore.getState().setIsPlaying(true);
      }
      set({ playing: !playing });
    }
  },
  togglePictureInPicture: async () => {
    const { videoElement, playing } = get();
    if (videoElement) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          set({ isPictureInPicture: false });
          if (playing) {
            videoElement.play().catch(console.error);
            useToneStore.getState().setIsPlaying(true);
          }
        } else {
          await videoElement.requestPictureInPicture();
          set({ isPictureInPicture: true });
          if (playing) {
            useToneStore.getState().setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error('Failed to toggle Picture-in-Picture mode:', error);
      }
    }
  },
  setVolume: (vol: number) => {
    set({ volume: vol });
    const { getActiveAudioSource } = useToneStore.getState();
    const activeSource = getActiveAudioSource();
    if (activeSource?.player && 'volume' in activeSource.player) {
      activeSource.player.volume.value = Tone.gainToDb(vol);
    }
  },
  setCurrentTime: (time: number) => {
    const { videoElement } = get();
    if (videoElement) {
      videoElement.currentTime = time;
    }
    set({ currentTime: time });
    useToneStore.getState().setCurrentTime(time);
  },
  resetState: () => {
    const { videoElement, isPictureInPicture } = get();
    if (videoElement && isPictureInPicture) {
      document.exitPictureInPicture().catch(console.error);
    }
    set({
      file: null,
      url: '',
      videoElement: null,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playing: false,
      mediaType: null,
      isPictureInPicture: false,
      fileDimensions: null,
      flipTexture: false,
      splitTexture: false,
    });
    useToneStore.getState().setAudioForSource('plane', {
      url: null,
      details: null,
      player: null,
      analyser: null,
    });
  },

  updateVideoElement: (videoElement) => {
    set({ videoElement });

    if (videoElement) {
      videoElement.volume = get().volume;

      // Only create new audio source if one doesn't exist
      const currentSource = useToneStore.getState().getActiveAudioSource();
      if (!currentSource?.player) {
        const { setAudioForSource } = useToneStore.getState();
        const player = new Tone.Player({
          url: videoElement.src,
          loop: true,
          autostart: false,
          onload: () => {
            const analyser = new Tone.Analyser('waveform', 256);
            player.connect(analyser);
            setAudioForSource('plane', {
              url: videoElement.src,
              details: { name: 'Video Audio', duration: videoElement.duration },
              player,
              analyser,
            });
          },
        }).toDestination();
      }
    }
  },

  setVideoTime: (time: number) => {
    const { videoElement } = get();
    if (videoElement) {
      videoElement.currentTime = time;
    }
    set({ currentTime: time });
    useToneStore.getState().setCurrentTime(time);
  },
  setCurrentPositionKey: (key) => set({ currentPositionKey: key }),
  setShowVisualizer: (show) => set({ showVisualizer: show }),

  startPlaying: () => {
    const { videoElement, playing } = get();
    if (videoElement && !playing) {
      videoElement.play().catch(console.error);
      set({ playing: true });
      useToneStore.getState().setIsPlaying(true);
    }
  },
  setShowVideoOnPlane: (show: boolean) => set({ showVideoOnPlane: show }),
}));
