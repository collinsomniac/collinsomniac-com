import { create } from 'zustand';
import { useThemeStore } from './themeStore';

interface ASCIIState {
  enabled: boolean;
  characters: string;
  invert: boolean;
  color: string;
  backgroundColor: string;
  showBackground: boolean;
  backgroundVisibility: number;
  charactersVisibility: number;
  fontSize: number;
  cellSize: number;
  useCanvasColor: boolean;
  canvasColor: string;
  moveColor: string;
  clickColor: string;
  mouseMoveVisibility: number;
  mouseClickVisibility: number;
  mousePosition: { x: number; y: number };
  mouseClicked: boolean;
  setEnabled: (enabled: boolean) => void;
  setCharacters: (characters: string) => void;
  setInvert: (invert: boolean) => void;
  setColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setShowBackground: (show: boolean) => void;
  setBackgroundVisibility: (visibility: number) => void;
  setCharactersVisibility: (visibility: number) => void;
  setFontSize: (size: number) => void;
  setCellSize: (size: number) => void;
  setUseCanvasColor: (use: boolean) => void;
  setCanvasColor: (color: string) => void;
  setMoveColor: (color: string) => void;
  setClickColor: (color: string) => void;
  setMouseMoveVisibility: (visibility: number) => void;
  setMouseClickVisibility: (visibility: number) => void;
  setMousePosition: (x: number, y: number) => void;
  setMouseClicked: (clicked: boolean) => void;
  updateColorsFromTheme: () => void;
}

const getInitialState = () => {
  const themeColors = useThemeStore.getState().getThemeColors();
  return {
    enabled: true,
    characters: ' .-:;=+*#%@',
    invert: false,
    color: themeColors.foreground || '#ffffff',
    backgroundColor: themeColors.background || '#000000',
    showBackground: true,
    backgroundVisibility: 1,
    charactersVisibility: 1,
    fontSize: 64,
    cellSize: 5,
    useCanvasColor: false,
    canvasColor: themeColors.background || '#000000',
    moveColor: '#00ff00',
    clickColor: '#ff0000',
    mouseMoveVisibility: 0,
    mouseClickVisibility: 0,
    mousePosition: { x: 0, y: 0 },
    mouseClicked: false,
  };
};

export const useASCIIStore = create<ASCIIState>((set, get) => ({
  ...getInitialState(),
  setEnabled: (enabled) => set({ enabled }),
  setCharacters: (characters) => set({ characters }),
  setInvert: (invert) => set({ invert }),
  setColor: (color) => set({ color }),
  setBackgroundColor: (backgroundColor) =>
    set({ backgroundColor, canvasColor: backgroundColor }),
  setShowBackground: (showBackground) => set({ showBackground }),
  setBackgroundVisibility: (backgroundVisibility) =>
    set({ backgroundVisibility }),
  setCharactersVisibility: (charactersVisibility) =>
    set({ charactersVisibility }),
  setFontSize: (fontSize) => set({ fontSize }),
  setCellSize: (cellSize) => set({ cellSize }),
  setUseCanvasColor: (useCanvasColor) => set({ useCanvasColor }),
  setCanvasColor: (canvasColor) => set({ canvasColor }),
  setMoveColor: (moveColor) => set({ moveColor }),
  setClickColor: (clickColor) => set({ clickColor }),
  setMouseMoveVisibility: (mouseMoveVisibility) => set({ mouseMoveVisibility }),
  setMouseClickVisibility: (mouseClickVisibility) =>
    set({ mouseClickVisibility }),
  setMousePosition: (x, y) => set({ mousePosition: { x, y } }),
  setMouseClicked: (mouseClicked) => set({ mouseClicked }),
  updateColorsFromTheme: () => {
    const themeColors = useThemeStore.getState().getThemeColors();
    const backgroundColor = themeColors.background || '#000000';
    set({
      color: themeColors.foreground || '#ffffff',
      backgroundColor: backgroundColor,
      canvasColor: backgroundColor,
    });
  },
}));

// Set up theme subscription
useThemeStore.subscribe((state) => {
  if (state.theme + state.variant) {
    useASCIIStore.getState().updateColorsFromTheme();
  }
});
