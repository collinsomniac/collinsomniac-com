import { useEffect, useRef } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useCameraStore } from '../../stores/cameraStore';
import { useButterChurnStore } from '../../stores/butterchurnStore';
import useToneStore from '../../stores/toneStore';

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

  // Add volume control from ToneStore
  const setMasterGain = useToneStore((state) => state.setMasterGain);
  const masterGain = useToneStore((state) => state.masterGain);

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle specific keys for theme and camera controls
    if (
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault(); // Prevent default only for these specific keys
      pressedKeys.current.add(event.key);

      // Handle arrow keys with Ctrl modifier for ButterChurn presets
      if (event.ctrlKey) {
        if (event.key === 'ArrowLeft') {
          cyclePreviousPreset();
        } else if (event.key === 'ArrowRight') {
          cycleNextPreset();
        }
      } else {
        // Normal arrow key behavior without Ctrl
        if (event.key === 'ArrowLeft') {
          cyclePreviousTheme();
        } else if (event.key === 'ArrowRight') {
          cycleNextTheme();
        } else if (event.key === 'ArrowUp') {
          cycleCameraPosition('next');
        } else if (event.key === 'ArrowDown') {
          cycleCameraPosition('previous');
        }
      }

      if (
        pressedKeys.current.has('ArrowLeft') &&
        pressedKeys.current.has('ArrowRight')
      ) {
        toggleVariant();
      }
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
    setMasterGain,
    masterGain,
  ]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
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
