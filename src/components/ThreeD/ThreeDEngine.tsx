import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useRef,
} from 'react';
import { Canvas, extend } from '@react-three/fiber';
import { Environment, Stats, Html } from '@react-three/drei';
import { useControls, button, Leva, folder } from 'leva';
import { EffectComposer, RenderPass } from 'postprocessing';
import * as Tone from 'tone';
import * as THREE from 'three';
import { FaCog } from 'react-icons/fa';
import { useSpring, animated } from '@react-spring/web';
import { type AudioSourceType } from '../../stores/toneStore';

// Import components
import Shape from './shapes/Shapes';
import TalkingSkull from './models/TalkingSkullModel';
import ComputerDesk from './models/ComputerDeskModel';
import CurvedBandVisualizer from './audio/CurvedBandVisualizer';
import ButterChurnVisualizer from './audio/ButterChurnVisualizer';
import AsciiRenderer from './shaders/ASCIIRenderer';
import CameraWithControls from './settings/CameraAndControlSettings';
import PlaneComponent from './plane/PlaneComponent';
import PlanePlayer from './plane/PlanePlayer';
import PlaneConfig from './plane/PlaneConfig';
import GroqChatComponent from '../ai/GroqChatComponent';

// Import custom hooks and stores
import { useThemeStore } from '../../stores/themeStore';
import { useASCIIStore } from '../../stores/asciiStore';
import { usePlaneStore } from '../../stores/planeStore';
import { useThreeDStore } from '../../stores/threeDStore';
import { useShapeStore } from '../../stores/shapeStore';
import useToneStore from '../../stores/toneStore';
import { useToneAnimator } from './audio/ToneAnimate';

// Import new separate control components
import ASCIIControls from './settings/ASCIIControls';
import ASCIIPresets from './settings/ASCIIPresets';
import ThemeControls from './settings/ThemeControls';
import ToneComponentControls from './audio/ToneComponentControls';
import ToneAnimateControls from './audio/ToneAnimateControls';
import LevaButtons from '../gui/LevaButtons';

extend({ EffectComposer, RenderPass });

interface ThreeDEngineProps {
  onCanvasClick: () => void;
}

const ThreeDEngine: React.FC<ThreeDEngineProps> = ({ onCanvasClick }) => {
  const ascii = useASCIIStore();
  const {
    initializeAudio,
    isPlaying,
    currentTime,
    playbackRate,
    pitch,
    activeSourceType,
    togglePlayPause,
    seekTo,
    setPlaybackRate,
    setPitch,
    setActiveAudioSource,
    setAudioForSource,
    visualizerMode,
    setVisualizerMode,
    isElevenLabsEnabled,
    setIsElevenLabsEnabled,
    generateElevenLabsSpeech,
    visualizerGui,
  } = useToneStore();
  const {
    toggleElement,
    showLeva,
    showTerminal,
    showChat,
    showChatContent,
    showShapes,
    showComputerDesk,
    showTalkingSkull,
    showPlane,
    showPlaneControls,
    showToneComponent,
    showToneControls,
    showToneAnimateControls,
    cameraControls,
    showASCIIControls,
    showThemeControls,
    showASCIIPresets,
    isAny3DElementActive,
  } = useThreeDStore();
  const { getThemeColors, theme, variant } = useThemeStore();

  // Local state
  const [audioAnalyser, setAudioAnalyser] = useState<Tone.Analyser | null>(
    null,
  );
  const [windowDimensions, setWindowDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { showVisualizer, showVideoOnPlane } = usePlaneStore();
  const { shapeProps } = useShapeStore();

  const cpuScreenRef = useRef<THREE.Mesh>(null);

  // Create Leva theme based on current theme colors
  const levaTheme = useMemo(() => {
    const themeColors = getThemeColors();
    return {
      colors: {
        elevation1: themeColors.red,
        elevation2: themeColors.background,
        elevation3: themeColors.blue,
        accent1: themeColors.green,
        accent2: themeColors.yellow,
        accent3: themeColors.red,
        highlight1: themeColors.background,
        highlight2: themeColors.foreground,
        highlight3: themeColors.blue,
      },
      fonts: {
        mono: 'monospace',
      },
      space: {
        md: '12px',
      },
      shadows: {
        level1: 'none',
        level2: 'none',
      },
    };
  }, [getThemeColors, theme, variant]);

  useEffect(() => {
    // Dedicated useEffect for updating Leva border
    const themeColors = getThemeColors();
    document.documentElement.style.setProperty(
      '--foreground',
      themeColors.foreground,
    );
  }, [getThemeColors, theme, variant]);

  // Use plane store to manage plane position
  const { setCurrentPositionKey } = usePlaneStore();

  useEffect(() => {
    if (showComputerDesk && showTalkingSkull) {
      setCurrentPositionKey('computerAndSkull');
    } else if (showComputerDesk) {
      setCurrentPositionKey('computer');
    } else if (showTalkingSkull) {
      setCurrentPositionKey('skull');
    } else {
      setCurrentPositionKey('default');
    }
  }, [showComputerDesk, showTalkingSkull, setCurrentPositionKey]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLCanvasElement && showTerminal === false) {
      //      toggleElement('showChat');
    }
  };

  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const [isSuspenseReady, setIsSuspenseReady] = useState(false); // New state for Suspense readiness

  useEffect(() => {
    const delaySuspense = setTimeout(() => {
      setIsSuspenseReady(true);
    }, 20); // 20ms delay before loading Suspense content

    return () => clearTimeout(delaySuspense);
  }, []);

  // Call useToneAnimator to set up the audio-reactive animation
  useToneAnimator();

  // Move these hooks up, after the existing state declarations (around line 110)
  const [levaSpring, levaApi] = useSpring(() => ({
    opacity: 0,
    transform: 'translateY(20px)',
    config: { tension: 280, friction: 60 },
  }));

  // Move the handleAudioUpload callback up as well
  const handleAudioUpload = useCallback(
    (file: File, sourceType: AudioSourceType) => {
      if (file) {
        const url = URL.createObjectURL(file);
        const player = new Tone.Player({
          url,
          loop: true,
          onload: () => {
            const analyser = new Tone.Analyser('waveform', 256);
            player.connect(analyser);
            setAudioAnalyser(analyser);

            // Map the source type based on file type
            const mappedSourceType: AudioSourceType = file.type.startsWith(
              'video/',
            )
              ? 'video'
              : file.type.startsWith('audio/')
              ? 'music'
              : sourceType;

            setAudioForSource(mappedSourceType, {
              url,
              details: { name: file.name, duration: player.buffer.duration },
              player,
              analyser,
            });
            setActiveAudioSource(mappedSourceType);
          },
        }).toDestination();
      }
    },
    [setAudioForSource, setActiveAudioSource, setAudioAnalyser],
  );

  // Move the useEffect for Leva animation up as well
  useEffect(() => {
    // Always start invisible
    levaApi.start({
      opacity: 0,
      transform: 'translateY(20px)',
      immediate: true,
    });

    // Delay fade-in for all cases
    const initialDelay = 220;
    setTimeout(() => {
      if (!showTerminal) {
        levaApi.start({
          opacity: 1,
          transform: 'translateY(0px)',
          immediate: false,
        });
      }
    }, initialDelay);
  }, [showChat, showTerminal, levaApi]);

  if (!isAny3DElementActive) {
    return null;
  }

  // can go under "ambientLight" for additional lighting, <directionalLight position={[1, 2.5, 5]} intensity={2}/>

  return (
    <>
      <div className="fixed inset-0 z-10">
        {isSuspenseReady && (
          <Canvas ref={canvasRef} onClick={handleCanvasClick} shadows={true}>
            <Suspense
              fallback={
                <Html center>
                  <div>Loading...</div>
                </Html>
              }
            >
              <CameraWithControls
                enabled={cameraControls}
                onCreated={() => setIsLoading(false)}
              >
                <Environment preset={'dawn'} />
                <ambientLight intensity={0.4} />
                {showComputerDesk && (
                  <directionalLight position={[5, 2, 5]} intensity={2.5} />
                )}
                {showComputerDesk && (
                  <ComputerDesk
                    position={[0, -8.76, -2]}
                    rotation={[0, 4.72, 0]}
                    scale={[22 / 100, 22 / 100, 22 / 100]}
                    audioAnalyser={audioAnalyser}
                    cpuScreenRef={cpuScreenRef}
                  />
                )}
                {showTalkingSkull && (
                  <TalkingSkull
                    renderAs2D={showComputerDesk}
                    cpuScreenRef={cpuScreenRef}
                    showTerminal={showTerminal}
                    showChat={showChat}
                  />
                )}
                {visualizerMode === 'butterchurn' && <ButterChurnVisualizer />}
                {(visualizerMode === 'line' || visualizerMode === 'circle') && (
                  <CurvedBandVisualizer visualizerMode={visualizerMode} />
                )}
              </CameraWithControls>
              <AsciiRenderer
                enabled={ascii.enabled}
                characters={ascii.characters}
                invert={ascii.invert}
                color={ascii.color}
                fontSize={ascii.fontSize}
                cellSize={ascii.cellSize}
                backgroundColor={ascii.backgroundColor}
                showBackground={ascii.showBackground}
                backgroundVisibility={ascii.backgroundVisibility}
                charactersVisibility={ascii.charactersVisibility}
                useCanvasColor={ascii.useCanvasColor}
                canvasColor={ascii.canvasColor}
              />
            </Suspense>
          </Canvas>
        )}
        {showChat && <GroqChatComponent />}
      </div>
      {/* Animated Leva GUI */}
      <animated.div
        style={{
          ...levaSpring,
          position: 'fixed',
          top: showChat ? '100px' : '10px',
          right: showChat ? 'auto' : '10px',
          left: showChat ? '395px' : 'auto',
          width: showChat ? '554px' : '380px',
          height: showChat ? '70vh' : 'auto',
          zIndex: 21,
        }}
      >
        <Leva
          isRoot={true}
          theme={{
            ...levaTheme,
            fontSizes: {
              root: '80%',
              toolTip: '80%',
            },
            fontWeights: {
              label: 'bold',
              folder: 'bold',
              button: 'normal',
            },
            sizes: {
              rootWidth: showChat ? '554px' : '380px',
              titleBarHeight: '48px', // Fixed height
              controlWidth: showChat ? '350px' : '150px',
              numberInputMinWidth: '50px',
              scrubberWidth: '7px',
              scrubberHeight: '18px',
              rowHeight: '22px',
              folderTitleHeight: '22px',
              checkboxSize: '16px',
              colorPickerWidth: '128px',
              colorPickerHeight: '128px',
            },
          }}
          titleBar={{
            title: <LevaButtons />,
            drag: false,
            filter: false,
          }}
          collapsed={{
            collapsed: showChatContent,
            onChange: (collapsed) => {
              // Only toggle if we're not in chat content mode
              if (!showChatContent || !collapsed) {
                toggleElement('showChatContent');
              }
            },
          }}
        />
      </animated.div>
      {showASCIIControls && showLeva && <ASCIIControls />}
      {showASCIIPresets && showLeva && <ASCIIPresets />}
      {showThemeControls && showLeva && <ThemeControls />}
      {showPlaneControls && showLeva && (
        <>
          <PlaneConfig />
        </>
      )}
      {showToneAnimateControls && showLeva && <ToneAnimateControls />}
      {showLeva && (
        <ToneComponentControls handleAudioUpload={handleAudioUpload} />
      )}
    </>
  );
};

export default React.memo(ThreeDEngine);
