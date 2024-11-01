import { useEffect, useRef } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useCameraStore } from '../../stores/cameraStore';
import { useButterChurnStore } from '../../stores/butterchurnStore';
import useToneStore from '../../stores/toneStore';
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';
import { useDeviceDetect } from './useDeviceDetect';

const GlobalKeyHandler: React.FC = () => {
  const pressedKeys = useRef<Set<string>>(new Set());
  const { isMobile } = useDeviceDetect();

  // Store actions
  const cycleNextTheme = useThemeStore((state) => state.cycleNextTheme);
  const cyclePreviousTheme = useThemeStore((state) => state.cyclePreviousTheme);
  const toggleVariant = useThemeStore((state) => state.toggleVariant);
  const cycleCameraPosition = useCameraStore(
    (state) => state.cycleCameraPosition,
  );
  const cycleNextPreset = useButterChurnStore((state) => state.cycleNextPreset);
  const cyclePreviousPreset = useButterChurnStore(
    (state) => state.cyclePreviousPreset,
  );

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  // Keyboard handler
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      !isMobile &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault();
      pressedKeys.current.add(event.key);

      if (event.ctrlKey) {
        if (event.key === 'ArrowLeft') cyclePreviousPreset();
        else if (event.key === 'ArrowRight') cycleNextPreset();
      } else {
        if (event.key === 'ArrowLeft') cyclePreviousTheme();
        else if (event.key === 'ArrowRight') cycleNextTheme();
        else if (event.key === 'ArrowUp') cycleCameraPosition('next');
        else if (event.key === 'ArrowDown') cycleCameraPosition('previous');
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

  // Gesture binding for mobile
  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], touches, last, cancel, event }) => {
        if (!isMobile) return;

        // Prevent default touch behavior
        if (event) event.preventDefault();

        const threshold = 50;
        const isTwoFingers = touches === 2;

        if (last) {
          // Reset position
          api.start({ x: 0, y: 0 });
          return;
        }

        if (Math.abs(mx) < threshold && Math.abs(my) < threshold) {
          return;
        }

        // Update visual feedback
        api.start({ x: mx, y: my });

        if (Math.abs(mx) > Math.abs(my)) {
          // Horizontal swipe
          if (isTwoFingers) {
            mx > 0 ? cycleNextPreset() : cyclePreviousPreset();
          } else {
            mx > 0 ? cycleNextTheme() : cyclePreviousTheme();
          }
        } else {
          // Vertical swipe
          my > 0
            ? cycleCameraPosition('previous')
            : cycleCameraPosition('next');
        }
      },
    },
    {
      drag: {
        filterTaps: true,
        threshold: 50,
        delay: 0,
      },
    },
  );

  // Add touch event prevention
  useEffect(() => {
    if (isMobile) {
      const preventDefault = (e: TouchEvent) => e.preventDefault();
      document.body.addEventListener('touchmove', preventDefault, {
        passive: false,
      });
      return () =>
        document.body.removeEventListener('touchmove', preventDefault);
    }
  }, [isMobile]);

  // Keyboard event listeners
  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [
    isMobile,
    cycleNextTheme,
    cyclePreviousTheme,
    toggleVariant,
    cycleCameraPosition,
    cycleNextPreset,
    cyclePreviousPreset,
  ]);

  return isMobile ? (
    <animated.div
      {...bind()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        touchAction: 'none',
        transform: x.to((x) => `translateX(${x}px)`),
      }}
    />
  ) : null;
};

export default GlobalKeyHandler;
