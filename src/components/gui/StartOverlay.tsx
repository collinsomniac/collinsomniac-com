import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useThemeStore } from '../../stores/themeStore';
import { FaInfoCircle } from 'react-icons/fa';
import {
  useAsciiText,
  deltaCorpsPriest1,
  smallKeyboard,
  bloody,
  theEdge,
  epic,
} from 'react-ascii-text';
import { usePlaneStore } from '../../stores/planeStore'; // Import the store
import useToneStore from '../../stores/toneStore';
import { useThreeDStore } from '../../stores/threeDStore';

interface AsciiTextProps {
  text: string;
  font?: any;
  color: string;
  animationDirection?:
    | 'down'
    | 'up'
    | 'left'
    | 'right'
    | 'horizontal'
    | 'vertical';
  animationCharacters?: string;
  animationCharacterSpacing?: number;
  animationDelay?: number;
  animationInterval?: number;
  animationIteration?: number;
  animationLoop?: boolean;
  animationSpeed?: number;
  fadeInOnly?: boolean;
  fadeOutOnly?: boolean;
  isAnimated?: boolean;
  isPaused?: boolean;
}

const AsciiText: React.FC<AsciiTextProps> = (props) => {
  const asciiTextRef = useAsciiText(props);
  return (
    <pre
      ref={asciiTextRef}
      style={{ color: props.color, margin: 0, display: 'inline' }}
    ></pre>
  );
};

const StartOverlay: React.FC = () => {
  const { theme, variant, getThemeColors } = useThemeStore();
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [currentThemeColors, setCurrentThemeColors] = useState(
    getThemeColors(),
  );
  const { toggleElement } = useThreeDStore();
  const [animationStep, setAnimationStep] = useState<
    | 'dot'
    | 'height'
    | 'width'
    | 'ready'
    | 'typing'
    | 'fading_out_text'
    | 'deleting'
    | 'fading_out_border'
    | 'completed'
  >('dot');

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isOverlayTransparent, setIsOverlayTransparent] = useState(false);

  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const typingIndexRef = useRef(0);
  const deletingIndexRef = useRef(0);

  const typingSpeed = 90; // milliseconds per character
  const deletingSpeed = 45; // milliseconds per character
  const fullText = 'click to enter...';

  const startPlaying = usePlaneStore((state) => state.startPlaying);

  // Handle window resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Update theme colors on theme or variant change
  useEffect(() => {
    setCurrentThemeColors(getThemeColors());
  }, [theme, variant, getThemeColors]);

  // Overlay border animation sequence
  const borderSpring = useSpring({
    from: {
      width: '0%',
      height: '0%',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    },
    to: async (next) => {
      if (animationStep === 'dot') {
        await next({
          height: '100%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        });
        setAnimationStep('height');
      }
      if (animationStep === 'height') {
        await next({
          width: '100%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        });
        setAnimationStep('width');
      }
      if (animationStep === 'width') {
        await next({ left: '0%', top: '0%', transform: 'translate(0%, 0%)' });
        setAnimationStep('ready');
      }
    },
    config: { tension: 2400, friction: 200 },
  });

  // Border opacity animation
  const borderOpacity = useSpring({
    opacity:
      animationStep === 'fading_out_border' || animationStep === 'completed'
        ? 0
        : 1,
    config: { duration: 1200 },
    onRest: () => {
      if (animationStep === 'fading_out_border') {
        setAnimationStep('completed');
      }
    },
  });

  // Handle click to start post-click animations
  const setShowVideoOnPlane = usePlaneStore(
    (state) => state.setShowVideoOnPlane,
  );

  const handleEnterClick = useCallback(() => {
    if (animationStep === 'typing') {
      setAnimationStep('fading_out_text');
      startPlaying();
      setIsOverlayTransparent(true);
      setShowVideoOnPlane(true);
    }
  }, [animationStep, startPlaying, setShowVideoOnPlane]);

  // Manage animation steps
  useEffect(() => {
    const runAnimationSequence = async () => {
      if (animationStep === 'ready') {
        // Start typing after a short delay to ensure welcome texts are displayed
        const typingDelay = 2400; // Adjust as needed
        await new Promise((resolve) => setTimeout(resolve, typingDelay));
        setAnimationStep('typing');
      }

      if (animationStep === 'fading_out_text') {
        const fadeOutDuration = 20; // Duration for fading out text
        await new Promise((resolve) => setTimeout(resolve, fadeOutDuration));
        setAnimationStep('deleting');
      }

      if (animationStep === 'deleting') {
        // Allow time for deletion animation to complete
        const deletionDuration = fullText.length * deletingSpeed;
        await new Promise((resolve) => setTimeout(resolve, deletionDuration));
        setAnimationStep('fading_out_border');
      }
    };
    runAnimationSequence();
  }, [animationStep]);

  // Handle typing and deleting animations
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;
    let deletingInterval: NodeJS.Timeout;

    if (animationStep === 'typing') {
      setDisplayedText('');
      setShowCursor(true);
      typingIndexRef.current = 0;

      typingInterval = setInterval(() => {
        if (typingIndexRef.current < fullText.length) {
          const nextChar = fullText.charAt(typingIndexRef.current);
          if (nextChar) {
            setDisplayedText((prev) => prev + nextChar);
          }
          typingIndexRef.current++;
        } else {
          clearInterval(typingInterval);
        }
      }, typingSpeed);

      // Cursor blinking
      cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
    }

    if (animationStep === 'deleting') {
      clearInterval(cursorInterval);
      setShowCursor(true);
      deletingIndexRef.current = fullText.length;

      deletingInterval = setInterval(() => {
        if (deletingIndexRef.current > 0) {
          deletingIndexRef.current--;
          setDisplayedText(fullText.substring(0, deletingIndexRef.current));
        } else {
          clearInterval(deletingInterval);
        }
      }, deletingSpeed);

      // Cursor blinking during deletion
      cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
    }

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
      clearInterval(deletingInterval);
    };
  }, [animationStep]);

  if (!windowSize) {
    return null;
  }

  return (
    <>
      {/* Static Fullscreen Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: currentThemeColors.background,
          zIndex: 999,
          transition: 'opacity 1.2s',
          opacity: animationStep === 'completed' ? 0 : 1,
          pointerEvents: isOverlayTransparent ? 'none' : 'auto', // Allow clicks to pass through
        }}
      />

      {/* Animated Border */}
      <animated.div
        style={{
          position: 'fixed',
          left: borderSpring.left,
          top: borderSpring.top,
          width: borderSpring.width,
          height: borderSpring.height,
          transform: borderSpring.transform,
          border: `2px solid ${currentThemeColors.foreground}`,
          backgroundColor: 'transparent', // Invisible interior
          boxSizing: 'border-box',
          boxShadow: 'none',
          zIndex: 1000,
          cursor: animationStep === 'typing' ? 'pointer' : 'default',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: isOverlayTransparent ? 'none' : 'auto', // Allow clicks to pass through
          opacity: borderOpacity.opacity,
        }}
        onClick={animationStep === 'typing' ? handleEnterClick : undefined}
      >
        {/* Content */}
        {['ready', 'typing', 'fading_out_text', 'deleting'].includes(
          animationStep,
        ) && (
          <div
            style={{
              textAlign: 'center',
              width: '100%',
              height: '55%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: `${Math.min(16, window.innerWidth / 100)}px`,
              lineHeight: '1.4em',
              justifyContent: 'center',
              padding: '0 20px',
            }}
          >
            {/* Welcome Text */}
            <AsciiText
              key="welcome"
              text="Welcome  to"
              font={epic}
              color={currentThemeColors.foreground}
              animationDirection="down"
              animationCharacters="▒░█"
              animationCharacterSpacing={1}
              animationDelay={2}
              animationInterval={20}
              animationIteration={1}
              animationLoop={false}
              animationSpeed={30}
              fadeInOnly={animationStep === 'ready'}
              fadeOutOnly={animationStep === 'fading_out_text'}
              isAnimated={true}
              isPaused={false}
            />
            <AsciiText
              key="sitename"
              text="collinsomniac . com"
              font={epic}
              color={currentThemeColors.foreground}
              animationDirection="down"
              animationCharacters="▒░█"
              animationCharacterSpacing={1}
              animationDelay={2}
              animationInterval={1200}
              animationIteration={1}
              animationLoop={false}
              animationSpeed={30}
              fadeInOnly={animationStep === 'ready'}
              fadeOutOnly={animationStep === 'fading_out_text'}
              isAnimated={true}
              isPaused={false}
            />

            {/* Custom Typing and Deletion Effect for "click to enter..." */}
            {['typing', 'fading_out_text', 'deleting'].includes(
              animationStep,
            ) && (
              <>
                <br />
                <br />
                <div
                  style={{
                    color: currentThemeColors.foreground,
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <span>{displayedText}</span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      visibility: showCursor ? 'visible' : 'hidden',
                    }}
                  >
                    |
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </animated.div>

      {/* Tooltip Icon and Content */}
      {animationStep === 'completed' && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '24px',
            zIndex: 1000,
          }}
        >
          {/* Tooltip Icon */}
          <div
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            style={{ cursor: 'pointer', color: currentThemeColors.foreground }}
          >
            <FaInfoCircle size={24} />
          </div>

          {/* Tooltip Content */}
          {isTooltipVisible && (
            <div
              style={{
                marginTop: '10px',
                backgroundColor: currentThemeColors.background,
                color: currentThemeColors.foreground,
                padding: '15px',
                borderRadius: '8px',
                border: `2px solid ${currentThemeColors.foreground}`,
                alignContent: 'center',
                width: '100%',
              }}
            >
              <div
                className="text-sm flex flex-col items-start"
                style={{ fontSize: '16px' }}
              >
                <span style={{ color: currentThemeColors.foreground }}>
                  Keyboard Controls:
                </span>
                <ul style={{ listStyleType: 'none', padding: '10px 0 0 0' }}>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={100}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      isAnimated={true}
                      isPaused={false}
                      text="<"
                      color={currentThemeColors.blue}
                    />
                    <span
                      style={{
                        color: currentThemeColors.foreground,
                        fontSize: '24px',
                      }}
                    >
                      &nbsp;&amp;&nbsp;
                    </span>
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={225}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      isAnimated={true}
                      isPaused={false}
                      text=">"
                      color={currentThemeColors.blue}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          color: currentThemeColors.foreground,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        to change
                      </span>
                      <span
                        style={{
                          color: currentThemeColors.blue,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        theme
                      </span>
                    </div>
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '5px',
                    }}
                  >
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={350}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      isAnimated={true}
                      isPaused={false}
                      text="<"
                      color={currentThemeColors.red}
                    />
                    <span
                      style={{
                        color: currentThemeColors.foreground,
                        fontSize: '24px',
                      }}
                    >
                      &nbsp;+&nbsp;
                    </span>
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={475}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      isAnimated={true}
                      isPaused={false}
                      text=">"
                      color={currentThemeColors.red}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          color: currentThemeColors.foreground,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        to toggle
                      </span>
                      <span
                        style={{
                          color: currentThemeColors.red,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        variant
                      </span>
                    </div>
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '16px',
                    }}
                  >
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={600}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      isAnimated={true}
                      isPaused={false}
                      text="^"
                      color={currentThemeColors.yellow}
                    />
                    <span
                      style={{
                        color: currentThemeColors.foreground,
                        fontSize: '24px',
                      }}
                    >
                      &nbsp;&amp;&nbsp;
                    </span>
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={725}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      isAnimated={true}
                      isPaused={false}
                      text="v"
                      color={currentThemeColors.yellow}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          color: currentThemeColors.foreground,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        to change
                      </span>
                      <span
                        style={{
                          color: currentThemeColors.yellow,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        view
                      </span>
                    </div>
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AsciiText
                        font={smallKeyboard}
                        animationDirection="down"
                        animationCharacters=" .-:;=+*#%@"
                        animationCharacterSpacing={1}
                        animationDelay={2}
                        animationInterval={850}
                        animationIteration={1}
                        animationLoop={false}
                        animationSpeed={30}
                        fadeInOnly={true}
                        fadeOutOnly={false}
                        isAnimated={true}
                        isPaused={false}
                        text="C"
                        color={currentThemeColors.green}
                      />
                      <span
                        style={{
                          color: currentThemeColors.green,
                          fontSize: '14px',
                          marginLeft: '-2px',
                          fontFamily: 'monospace',
                        }}
                      >
                        trl
                      </span>
                    </div>
                    <span
                      style={{
                        color: currentThemeColors.foreground,
                        fontSize: '24px',
                      }}
                    >
                      &nbsp;+&nbsp;
                    </span>
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={975}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      text="<"
                      color={currentThemeColors.green}
                    />
                    <span
                      style={{
                        color: currentThemeColors.foreground,
                        fontSize: '24px',
                      }}
                    >
                      &nbsp;&amp;&nbsp;
                    </span>
                    <AsciiText
                      font={smallKeyboard}
                      animationDirection="down"
                      animationCharacters=" .-:;=+*#%@"
                      animationCharacterSpacing={1}
                      animationDelay={2}
                      animationInterval={1100}
                      animationIteration={1}
                      animationLoop={false}
                      animationSpeed={30}
                      fadeInOnly={true}
                      fadeOutOnly={false}
                      text=">"
                      color={currentThemeColors.green}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          color: currentThemeColors.foreground,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        to change
                      </span>
                      <span
                        style={{
                          color: currentThemeColors.green,
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                      >
                        visualizer
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StartOverlay;
