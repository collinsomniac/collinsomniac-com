import { create } from 'zustand';

interface FontSettingsState {
  text: string;
  fontName: string;
  animationCharacters: string;
  animationCharacterSpacing: number;
  animationDelay: number;
  animationDirection:
    | 'down'
    | 'up'
    | 'left'
    | 'right'
    | 'horizontal'
    | 'vertical';
  animationInterval: number;
  animationLoop: boolean;
  animationSpeed: number;
  fadeInOnly: boolean;
  isVisible: boolean;
  setFontSettings: (settings: Partial<FontSettingsState>) => void;
}

export const useFontSettings = create<FontSettingsState>((set) => ({
  text: 'sample_text',
  fontName: 'theEdge', // Default font set to 'theEdge'
  animationCharacters: '▒░█', // Default animation characters
  animationCharacterSpacing: 1,
  animationDelay: 2000,
  animationDirection: 'down',
  animationInterval: 100,
  animationLoop: true,
  animationSpeed: 30,
  fadeInOnly: true, // Default to fadeInOnly=true
  isVisible: false,
  setFontSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
