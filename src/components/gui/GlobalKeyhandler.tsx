import { useEffect, useRef } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useCameraStore } from '../../stores/cameraStore';
import { useButterChurnStore } from '../../stores/butterchurnStore'; // Import the ButterChurn store

const GlobalKeyHandler: React.FC = () => {
  const pressedKeys = useRef<Set<string>>(new Set());

  const cycleNextTheme = useThemeStore((state) => state.cycleNextTheme);
  const cyclePreviousTheme = useThemeStore((state) => state.cyclePreviousTheme);
  const toggleVariant = useThemeStore((state) => state.toggleVariant);

  const cycleCameraPosition = useCameraStore(
    (state) => state.cycleCameraPosition,
  );

  // ButterChurn store actions
  const cycleNextPreset = useButterChurnStore((state) => state.cycleNextPreset);
  const cyclePreviousPreset = useButterChurnStore(
    (state) => state.cyclePreviousPreset,
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle specific keys for theme and camera controls
    if (
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault(); // Prevent default only for these specific keys
      pressedKeys.current.add(event.key);

      if (event.key === 'ArrowLeft') {
        cyclePreviousTheme();
      } else if (event.key === 'ArrowRight') {
        cycleNextTheme();
      } else if (event.key === 'ArrowUp') {
        cycleCameraPosition('next');
      } else if (event.key === 'ArrowDown') {
        cycleCameraPosition('previous');
      }

      if (
        pressedKeys.current.has('ArrowLeft') &&
        pressedKeys.current.has('ArrowRight')
      ) {
        toggleVariant();
      }
    }

    // Handle bracket keys for ButterChurn preset cycling
    if (event.key === '[') {
      cyclePreviousPreset();
    }

    if (event.key === ']') {
      cycleNextPreset();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    pressedKeys.current.delete(event.key);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    cycleNextTheme,
    cyclePreviousTheme,
    toggleVariant,
    cycleCameraPosition,
    cycleNextPreset,
    cyclePreviousPreset,
  ]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Find the scrollable container in index.tsx
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTop += event.deltaY;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return null;
};

export default GlobalKeyHandler;
