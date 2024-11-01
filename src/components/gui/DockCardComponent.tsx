/* eslint-disable prettier/prettier */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useSpring,
  animated,
  config,
  useSpringRef,
  to,
} from '@react-spring/web';
import { useThemeStore } from '../../stores/themeStore';
import { useThreeDStore } from '../../stores/threeDStore';
import {
  //Used Icon Imports
  FaVolumeUp,
  FaDesktop,
  FaSkull,
  FaEye,
  FaCommentDots,
  FaFont,
  FaLongArrowAltRight,
  FaCode,
  FaPalette,
  FaPaintRoller,
  FaShapes,
  FaCog,

  //Unused Icon Imports
  FaKeyboard,
  FaImage,
  FaDownload,
  FaVideo,
  FaSquare,
  FaCube,
  FaSlidersH,
  FaShare,
  FaGithub,
  FaSoundcloud,
  FaYoutube,
  FaCoffee,
  FaPatreon,
  FaMoneyBill,
  FaMusic,
  FaUpload,
  FaTree,
  FaICursor,
} from 'react-icons/fa';

interface DockCardProps {
  icon: React.ReactNode;
  state: string;
  onClick?: () => void;
}

const DockCard: React.FC<DockCardProps> = function DockCard({
  icon,
  state,
  onClick,
}) {
  const { getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();

  const {
    showChat,
    showToneComponent,
    showTalkingSkull,
    showPlane,
    toggleElement,
  } = useThreeDStore();

  const isActive = useThreeDStore(
    (store) => store[state as keyof typeof store] === true,
  );

  const [{ scale, color }, api] = useSpring(() => ({
    scale: 1.07,
    color: themeColors.background,
    config: { mass: 1, tension: 1000, friction: 50 },
  }));

  const handleClick = useCallback(() => {
    // Trigger the click animation
    api.start({
      from: { scale: 1, color: themeColors.background },
      to: [
        { scale: 1.07, color: themeColors.green },
        { scale: 1, color: themeColors.background },
      ],
      config: { duration: 80 },
    });

    if (onClick) {
      onClick();
    } else {
      switch (state) {
        case 'showTalkingSkull':
          toggleElement('showTalkingSkull');
          if (!showTalkingSkull) {
            if (!showToneComponent) toggleElement('showToneComponent');
            if (!showPlane) toggleElement('showPlane');
          }
          break;
        default:
          toggleElement(state);
      }
    }
  }, [
    onClick,
    toggleElement,
    state,
    api,
    themeColors,
    showToneComponent,
    showTalkingSkull,
    showPlane,
  ]);

  return (
    <animated.div
      style={{
        width: 60,
        height: 40,
        margin: '5px',
        borderRadius: '6px',
        backgroundColor: themeColors.red,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '10px',
        border: `2px solid ${isActive ? themeColors.green : themeColors.red}`,
        transform: scale.to((s) => `scale(${s})`),
      }}
      onClick={handleClick}
    >
      <animated.span
        style={{
          fontSize: '30px',
          color:
            state === 'move'
              ? color
              : isActive
              ? themeColors.green
              : themeColors.background,
          display: 'inline-block',
        }}
      >
        {icon}
      </animated.span>
    </animated.div>
  );
};

const DockCardComponent: React.FC = function DockCardComponent() {
  const [position, setPosition] = useState(0);
  const { getThemeColors, theme, variant } = useThemeStore();
  const themeColors = useMemo(
    () => getThemeColors(),
    [theme, variant, getThemeColors],
  );
  const springRef = useSpringRef();

  const dockItems = useMemo(
    () => [
      { icon: <FaCode />, state: 'showTerminal' }, //show/hide terminal (animate computer desk to fullscreen and shows terminal)
      //    { icon: <FaCamera />, state: 'null' }, //show/hide 3D scene camera, controls, and their settings
      { icon: <FaShapes />, state: 'showShapes' }, //show/hide 3D scene shapes and their controls
      { icon: <FaDesktop />, state: 'showComputerDesk' }, //show/hide 3D scene computer desk
      { icon: <FaSkull />, state: 'showTalkingSkull' }, //show/hide 3D scene Talking Skull mode
      { icon: <FaCommentDots />, state: 'showChat' }, //show/hide Groq Chat Component
      { icon: <FaEye />, state: 'showPlane' }, //show/hide 3D scene plane controls relevant to Talking Skull model "eyes"
      { icon: <FaVolumeUp />, state: 'showToneComponent' }, //show/hide Tone.js component responsible for audio
      { icon: <FaFont />, state: 'showASCIIControls' },
      { icon: <FaPalette />, state: 'showASCIIPresets' },
      { icon: <FaPaintRoller />, state: 'showThemeControls' },
      { icon: <FaCog />, state: 'showLeva' }, //show/hide Leva GUI
      //    { icon: <FaUpload />, state: 'showUploadControls' }, //show/hide plane config and upload controls
    ],
    [],
  );

  const rotateDock = useCallback(() => {
    springRef.start({
      from: {
        scale: 1,
        color: themeColors.background,
        borderColor: themeColors.red,
      },
      to: [
        {
          scale: 1.07,
          color: themeColors.green,
          borderColor: themeColors.green,
        },
      ],
      config: { duration: 80, mass: 1, tension: 500, friction: 5 },
      onRest: () => {
        setPosition((prev) => (prev + 1) % 4);
        springRef.start({
          from: {
            scale: 1.07,
            color: themeColors.green,
            borderColor: themeColors.green,
          },
          to: [
            {
              scale: 1,
              color: themeColors.background,
              borderColor: themeColors.red,
            },
          ],
          config: { duration: 300, mass: 1, tension: 500, friction: 5 },
        });
      },
    });
  }, [themeColors, springRef]);

  const [{ scale, color, borderColor }, springApi] = useSpring(() => ({
    scale: 1,
    color: themeColors.background,
    borderColor: themeColors.red,
    config: { mass: 0.5, tension: 500, friction: 5 },
    ref: springRef,
  }));

  // Add this useEffect to update spring values when theme colors change
  useEffect(() => {
    springApi.start({
      color: themeColors.background,
      borderColor: themeColors.red,
    });
  }, [themeColors, springApi]);

  const dockStyle = useMemo(() => {
    const baseStyle = {
      position: 'fixed' as const,
      display: 'flex',
      alignItems: 'center',
      padding: '6px',
      backgroundColor: themeColors.background,
      color: themeColors.foreground,
      borderRadius: '10px',
      border: `2px solid ${themeColors.foreground}`,
      zIndex: 1000,
    };

    const positionStyles = [
      { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
      { left: '60px', top: '50%', transform: 'translateY(-50%)' },
      { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      { right: '60px', top: '50%', transform: 'translateY(-50%)' },
    ];

    return {
      ...baseStyle,
      ...positionStyles[position],
      flexDirection:
        position % 2 === 0 ? ('row' as const) : ('column' as const),
    };
  }, [position, themeColors]);

  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const [{ y, x, opacity }, animationApi] = useSpring(() => ({
    y: 80,
    x: 0,
    opacity: 0,
    config: { mass: 0.6, tension: 800, friction: 40 },
  }));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      let shouldShow = false;

      switch (position) {
        case 0: // Bottom
          shouldShow = clientY > innerHeight * 0.8;
          break;
        case 1: // Left
          shouldShow = clientX < innerWidth * 0.2;
          break;
        case 2: // Top
          shouldShow = clientY < innerHeight * 0.2;
          break;
        case 3: // Right
          shouldShow = clientX > innerWidth * 0.8;
          break;
      }

      if (timeoutId) clearTimeout(timeoutId);

      setTimeoutId(
        setTimeout(() => {
          setIsVisible(shouldShow);
          animationApi.start({
            y: shouldShow
              ? 0
              : position === 0
              ? 100
              : position === 2
              ? -100
              : 0,
            x: shouldShow
              ? 0
              : position === 1
              ? -100
              : position === 3
              ? 100
              : 0,
            opacity: shouldShow ? 1 : 0,
            immediate: false,
          });
        }, 15),
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [position, animationApi, timeoutId]);

  return (
    <animated.div
      style={{
        ...dockStyle,
        opacity,
        transform: to([x, y], (x, y) => {
          const baseTransform =
            position % 2 === 0 ? 'translateX(-50%)' : 'translateY(-50%)';
          const animationTransform =
            position % 2 === 0 ? `translateY(${y}px)` : `translateX(${x}px)`;
          return `${baseTransform} ${animationTransform}`;
        }),
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {dockItems.map((item) => (
        <DockCard key={item.state} icon={item.icon} state={item.state} />
      ))}
      <animated.div
        style={{
          width: 60,
          height: 40,
          margin: '4px',
          borderRadius: '6px',
          backgroundColor: themeColors.red,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '10px',
          border: borderColor.to((bc) => `2px solid ${bc}`),
          transform: scale.to((s) => `scale(${s})`),
        }}
        onClick={rotateDock}
      >
        <animated.span
          style={{
            fontSize: '38px',
            color: color,
            display: 'inline-block',
          }}
        >
          <FaLongArrowAltRight />
        </animated.span>
      </animated.div>
    </animated.div>
  );
};

export default DockCardComponent;
