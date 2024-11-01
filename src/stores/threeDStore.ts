import { create } from 'zustand';

interface ThreeDState {
  showChat: boolean;
  showChatContent: boolean;
  showLeva: boolean;
  cameraControls: boolean;
  showTerminal: boolean;
  showEngine: boolean;
  showShapes: boolean;
  showComputerDesk: boolean;
  showTalkingSkull: boolean;
  showToneComponent: boolean;
  showToneControls: boolean;
  showToneAnimateControls: boolean;
  showPlane: boolean;
  showPlaneControls: boolean;
  showASCIIControls: boolean;
  showASCIIPresets: boolean;
  showThemeControls: boolean;
  isAny3DElementActive: boolean;
  isChatFading: boolean;
  guiScale: number;
  guiPosition: { x: number; y: number };
  viewportDimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  toggleElement: (element: string) => void;
  setCameraControls: (enabled: boolean) => void;
  setShowToneComponent: (enabled: boolean) => void;
  setChatFading: (enabled: boolean) => void;
  setShowChatContent: (show: boolean) => void;
  setGuiScale: (scale: number) => void;
  setGuiPosition: (position: { x: number; y: number }) => void;
  setViewportDimensions: (dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  }) => void;
}

export const useThreeDStore = create<ThreeDState>((set, get) => ({
  showChat: false,
  showChatContent: false,
  showLeva: false,
  cameraControls: true,
  showTerminal: false,
  showEngine: true,
  showShapes: true,
  showComputerDesk: true,
  showTalkingSkull: true,
  showToneComponent: true, // Always true
  showToneControls: true,
  showToneAnimateControls: false,
  showPlane: true, // Always true
  showPlaneControls: false,
  showASCIIControls: false,
  showASCIIPresets: false,
  showThemeControls: false,
  isAny3DElementActive: true,
  isChatFading: false,
  guiScale: 1,
  guiPosition: { x: 0, y: 0 },
  viewportDimensions: {
    width: 0,
    height: 0,
    aspectRatio: 1,
  },
  setChatFading: (isFading: boolean) => set({ isChatFading: isFading }),
  toggleElement: (element: keyof ThreeDState) =>
    set((state) => {
      const newState = { [element]: !state[element] };
      if (
        [
          'showShapes',
          'showComputerDesk',
          'showTalkingSkull',
          'showPlaneControls',
          'showToneControls',
          'showToneAnimateControls',
          'showASCIIControls',
          'showASCIIPresets',
          'showThemeControls',
          'showLeva',
        ].includes(element)
      ) {
        newState.showEngine = true;
      }
      const updatedState = { ...state, ...newState };
      updatedState.isAny3DElementActive = [
        'showShapes',
        'showComputerDesk',
        'showTalkingSkull',
        'showPlaneControls',
        'showToneControls',
        'showToneAnimateControls',
        'showASCIIControls',
        'showASCIIPresets',
        'showThemeControls',
        'showLeva',
      ].some((key) => updatedState[key as keyof ThreeDState]);
      return updatedState;
    }),
  setCameraControls: (enabled: boolean) => set({ cameraControls: enabled }),
  setShowToneComponent: (enabled: boolean) =>
    set({ showToneComponent: enabled }),
  setShowChatContent: (show) => set({ showChatContent: show }),
  setGuiScale: (scale: number) => set({ guiScale: scale }),
  setGuiPosition: (position: { x: number; y: number }) =>
    set({ guiPosition: position }),
  setViewportDimensions: (dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  }) => set({ viewportDimensions: dimensions }),
}));
