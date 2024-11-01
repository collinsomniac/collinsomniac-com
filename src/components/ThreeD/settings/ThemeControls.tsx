import React, { useEffect, useMemo } from 'react';
import { useControls, button } from 'leva';
import { useASCIIStore } from '../../../stores/asciiStore';
import { useThemeStore } from '../../../stores/themeStore';
import { useThreeDStore } from '../../../stores/threeDStore';
import themes from '../../../../themes.json';

const ThemeControls: React.FC = () => {
  const ascii = useASCIIStore();
  const { theme, variant, setTheme, getThemeColors, customThemes } =
    useThemeStore();
  const { showThemeControls } = useThreeDStore();

  const themeColors = getThemeColors();

  const availableThemes = useMemo(() => {
    return [...Object.keys(themes), ...Object.keys(customThemes)];
  }, [customThemes]);

  const [_, setLevaControls] = useControls(
    'Theme Controls',
    () => ({
      themeSelector: {
        value: theme,
        options: availableThemes,
        label: 'Theme',
        onChange: (newTheme) => {
          const currentState = useThemeStore.getState();
          setTheme({
            themeName: newTheme,
            variantName: currentState.variant,
          });
        },
      },
      variantSelector: {
        value: variant,
        options: ['light', 'dark'],
        label: 'Variant',
        onChange: (newVariant) => {
          const currentState = useThemeStore.getState();
          setTheme({
            themeName: currentState.theme,
            variantName: newVariant,
          });
        },
      },
      foreground: {
        value: themeColors?.foreground || '#E9E9E9',
        label: 'Foreground Color',
      },
      background: {
        value: themeColors?.background || '#000000',
        label: 'Background Color',
      },
      yellow: {
        value: themeColors?.yellow || '#AFAFAF',
        label: 'Yellow Color',
      },
      green: { value: themeColors?.green || '#A3A3A3', label: 'Green Color' },
      gray: { value: themeColors?.gray || '#868686', label: 'Gray Color' },
      blue: { value: themeColors?.blue || '#4E4E4E', label: 'Blue Color' },
      red: { value: themeColors?.red || '#282828', label: 'Red Color' },
      'Sync Theme Colors': button(() => {
        const latestThemeColors = getThemeColors();
        if (latestThemeColors) {
          ascii.setColor(latestThemeColors.foreground);
          ascii.setBackgroundColor(latestThemeColors.background);
          ascii.setCanvasColor(latestThemeColors.background);
          setLevaControls({
            foreground: latestThemeColors.foreground,
            background: latestThemeColors.background,
            yellow: latestThemeColors.yellow,
            green: latestThemeColors.green,
            gray: latestThemeColors.gray,
            blue: latestThemeColors.blue,
            red: latestThemeColors.red,
          });
        }
      }),
    }),
    { collapsed: true, render: () => showThemeControls },
  );

  useEffect(() => {
    const latestThemeColors = getThemeColors();
    if (latestThemeColors) {
      setLevaControls({
        themeSelector: theme,
        variantSelector: variant,
        foreground: latestThemeColors.foreground,
        background: latestThemeColors.background,
        yellow: latestThemeColors.yellow,
        green: latestThemeColors.green,
        gray: latestThemeColors.gray,
        blue: latestThemeColors.blue,
        red: latestThemeColors.red,
      });
    }
  }, [theme, variant, setLevaControls, getThemeColors]);

  return null;
};

export default ThemeControls;
