import { create } from 'zustand';
import themes from '../../themes.json';
import { useEffect } from 'react';

interface ThemeState {
  theme: string;
  variant: string;
  customThemes: Record<string, Record<string, Record<string, string>>>;
  themeOrder: string[]; // Ordered list of theme names
  currentThemeIndex: number; // Current index in the themeOrder
  setTheme: (theme: { themeName: string; variantName?: string }) => void;
  getThemeColors: () => Record<string, string>;
  addCustomTheme: (
    themeName: string,
    themeColors: Record<string, Record<string, string>>,
  ) => void;
  initializeFromLocalStorage: () => void;
  isInitialized: boolean;
  cycleNextTheme: () => void;
  cyclePreviousTheme: () => void;
  toggleVariant: () => void;
}

const defaultColors = {
  foreground: '#E9E9E9',
  background: '#000000',
  yellow: '#AFAFAF',
  green: '#A3A3A3',
  gray: '#868686',
  blue: '#4E4E4E',
  red: '#282828',
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'grayscale',
  variant: 'dark',
  customThemes: {},
  isInitialized: false,
  themeOrder: Object.keys(themes), // Initialize themeOrder with predefined themes
  currentThemeIndex: 0, // Start at the first theme

  setTheme: ({ themeName, variantName = 'light' }) => {
    const { customThemes } = get();
    let themeToApply =
      customThemes[themeName]?.[variantName] ||
      themes[themeName]?.[variantName];

    if (!themeToApply) {
      console.error(
        `Theme "${themeName}" or variant "${variantName}" not found.`,
      );
      console.log('Available custom themes:', customThemes);
      console.log('Available predefined themes:', themes);
      return;
    }

    set({ theme: themeName, variant: variantName });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themeName);
      localStorage.setItem('variant', variantName);
    }
  },

  getThemeColors: () => {
    const { theme, variant, customThemes } = get();
    const themeColors =
      customThemes[theme]?.[variant] || themes[theme]?.[variant];
    const colors = themeColors
      ? { ...defaultColors, ...themeColors }
      : defaultColors;
    return colors;
  },

  addCustomTheme: (themeName, themeColors) => {
    set((state) => {
      const newCustomThemes = {
        ...state.customThemes,
        [themeName]: themeColors,
      };
      return { customThemes: newCustomThemes };
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('customThemes', JSON.stringify(get().customThemes));
    }
  },

  initializeFromLocalStorage: () => {
    if (get().isInitialized) return;

    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      const storedVariant = localStorage.getItem('variant');
      const storedCustomThemes = localStorage.getItem('customThemes');
      const storedThemeOrder = localStorage.getItem('themeOrder');
      const storedThemeIndex = localStorage.getItem('currentThemeIndex');

      set((state) => {
        const newState: Partial<ThemeState> = { isInitialized: true };

        if (storedTheme && storedVariant) {
          newState.theme = storedTheme;
          newState.variant = storedVariant;
        }

        if (storedCustomThemes) {
          newState.customThemes = JSON.parse(storedCustomThemes);
        }

        if (storedThemeOrder) {
          newState.themeOrder = JSON.parse(storedThemeOrder);
        }

        if (storedThemeIndex) {
          newState.currentThemeIndex = parseInt(storedThemeIndex, 10);
        }

        return newState;
      });
    }
  },

  // Method to cycle to the next theme
  cycleNextTheme: () => {
    const { themeOrder, currentThemeIndex } = get();
    const nextIndex = (currentThemeIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];

    set({ currentThemeIndex: nextIndex });
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentThemeIndex', nextIndex.toString());
    }

    // Set the next theme with the current variant
    get().setTheme({ themeName: nextTheme, variantName: get().variant });
  },

  // Method to cycle to the previous theme
  cyclePreviousTheme: () => {
    const { themeOrder, currentThemeIndex } = get();
    const prevIndex =
      (currentThemeIndex - 1 + themeOrder.length) % themeOrder.length;
    const prevTheme = themeOrder[prevIndex];

    set({ currentThemeIndex: prevIndex });
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentThemeIndex', prevIndex.toString());
    }

    // Set the previous theme with the current variant
    get().setTheme({ themeName: prevTheme, variantName: get().variant });
  },

  toggleVariant: () => {
    const currentVariant = get().variant;
    const newVariant = currentVariant === 'light' ? 'dark' : 'light';
    get().setTheme({ themeName: get().theme, variantName: newVariant });
  },
}));

// Add this hook to initialize the theme on the client side
export const useInitializeTheme = () => {
  const initializeFromLocalStorage = useThemeStore(
    (state) => state.initializeFromLocalStorage,
  );

  useEffect(() => {
    initializeFromLocalStorage();
  }, []);
};
