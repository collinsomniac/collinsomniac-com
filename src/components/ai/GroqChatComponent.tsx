import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useElevenLabsAPI } from './apiElevenLabs';
import useToneStore from '../../stores/toneStore';
import { useThemeStore } from '../../stores/themeStore';
import { useThreeDStore } from '../../stores/threeDStore';
import { useASCIIUpdateStore } from '../../stores/asciiUpdateStore';
import { useSpring, animated } from '@react-spring/web';
import { useCameraStore } from '../../stores/cameraStore';
import { useChatStore } from '../../stores/chatStore';
import { GenerateTextResult, CoreTool } from 'ai';
import skullResponses from './skullResponses.json';
import skullMusic from './skullMusic.json';
import { FaForward } from 'react-icons/fa';
import { useASCIIStore } from '../../stores/asciiStore';

// Define our Tool interfaces
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResponse {
  content: string;
  toolAction: {
    type: 'music';
    config: {
      introText: string;
      introAudio: string;
      songUrl: string;
      visualizer: {
        mode: 'butterchurn' | 'line' | 'circle' | 'none';
        preset: string;
        thresholds: {
          beatThreshold: number;
          noveltyThreshold: number;
          energyThreshold: number;
          frequencyThreshold: number;
          cooldown: number;
        };
        shaderEnabled: boolean;
        useThemeColors: boolean;
      };
    };
  } | null;
}

interface Tools {
  [key: string]: CoreTool<any, any>;
}

// Add new interfaces
interface SkullResponse {
  text: string;
  audio: string;
}

interface SkullResponses {
  [key: string]: SkullResponse;
}

// Add new interface for character animation
interface AnimatingCharacter {
  finalChar: string;
  currentChar: string;
  startTime: number;
}

const MEDIA_PATHS = {
  SKULL_SPEECH: '/media/skull_speech',
  SKULL_MUSIC: '/media/skull_music',
} as const;

// Helper function to check if a file exists
const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

const GroqChatComponent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { generateSpeech } = useElevenLabsAPI();
  const {
    generateElevenLabsSpeech,
    isElevenLabsEnabled,
    handleMusicSetup,
    setPlaybackRate,
    setPitch,
  } = useToneStore();
  const {
    isShaderVisualizerEnabled,
    setShaderVisualizerEnabled,
    handleElevenLabsAudio,
  } = useToneStore();
  const { setTheme, getThemeColors, addCustomTheme } = useThemeStore();
  const {
    setUpdateColor,
    setUpdateBackgroundColor,
    setUpdateCellSize,
    setUpdateFontSize,
  } = useASCIIUpdateStore();
  const { showToneComponent } = useThreeDStore();
  const { showChat } = useThreeDStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  // Animation spring for fade transitions
  const [fadeSpring, fadeApi] = useSpring(() => ({
    opacity: 0,
    transform: 'translateY(20px)',
    config: { tension: 360, friction: 60 },
  }));

  const {
    messages,
    addMessage,
    updateLastMessage,
    hasInitialized,
    setHasInitialized,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamSpeed = 11; // characters per second

  // Ref to keep track of the current streaming interval
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add a ref to track the current streaming position
  const currentIndexRef = useRef<number>(0);

  // Add this state to store the complete response
  const [completeResponse, setCompleteResponse] = useState<string>('');

  // Add new state for animating characters
  const [animatingChars, setAnimatingChars] = useState<AnimatingCharacter[]>(
    [],
  );
  const { characters: asciiChars } = useASCIIStore();
  const cycleLength = 220; // Animation duration in milliseconds

  // Modify streamResponse function
  const streamResponse = useCallback(
    (text: string, speed: number = streamSpeed) => {
      setIsStreaming(true);
      currentIndexRef.current = 0;
      setAnimatingChars([]); // Reset animating characters

      const interval = setInterval(() => {
        if (currentIndexRef.current < text.length) {
          const newChar = text[currentIndexRef.current];

          if (newChar) {
            // Only animate non-space characters
            if (newChar !== ' ') {
              setAnimatingChars((prev) => [
                // Keep previous characters that are still animating
                ...prev.filter(
                  (char) => Date.now() - char.startTime < cycleLength,
                ),
                // Add new character
                {
                  finalChar: newChar,
                  currentChar: asciiChars[0],
                  startTime: Date.now(),
                },
              ]);
            }

            // Update the message content with the current progress
            const currentText = text.slice(0, currentIndexRef.current + 1);
            updateLastMessage(currentText);
          }

          currentIndexRef.current++;
        } else {
          clearInterval(interval);
          streamIntervalRef.current = null;
          setIsStreaming(false);
          // Ensure final text is set
          updateLastMessage(text);
        }
      }, 1000 / speed);

      streamIntervalRef.current = interval;
    },
    [asciiChars, updateLastMessage],
  );

  // Add animation frame loop
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setAnimatingChars((prev) => {
        const now = Date.now();
        return prev
          .map((char) => {
            const elapsed = now - char.startTime;

            if (elapsed >= cycleLength) {
              return { ...char, currentChar: char.finalChar };
            }

            // Calculate which ASCII character to show based on animation progress
            const progress = (elapsed / cycleLength) * asciiChars.length;
            const charIndex = Math.floor(progress) % asciiChars.length;
            return { ...char, currentChar: asciiChars[charIndex] };
          })
          .filter((char) =>
            char.currentChar === char.finalChar ? false : true,
          );
      });

      animationFrame = requestAnimationFrame(animate);
    };

    if (isStreaming) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isStreaming, asciiChars]);

  // Modify the message rendering to use animated characters
  const getDisplayText = useCallback(
    (message: string) => {
      if (!isStreaming) return message;

      // Get the stable part of the text (characters that are done animating)
      const stableText = message.slice(
        0,
        message.length - animatingChars.length,
      );

      // Get the portion that should be animated
      const animatingPortion = message.slice(
        message.length - animatingChars.length,
      );

      // Combine stable text with animated characters, preserving spaces
      let result = stableText;
      let animatingIndex = 0;

      for (let i = 0; i < animatingPortion.length; i++) {
        if (animatingPortion[i] === ' ') {
          result += ' ';
        } else {
          result +=
            animatingChars[animatingIndex]?.currentChar || animatingPortion[i];
          animatingIndex++;
        }
      }

      return result;
    },
    [animatingChars, isStreaming],
  );

  // Function to complete streaming quickly
  const completeStreaming = useCallback(() => {
    if (!isStreaming) return;

    // Stop any ongoing audio playback
    const { togglePlayPause, isPlaying, getActiveAudioSource } =
      useToneStore.getState();
    const activeSource = getActiveAudioSource();

    if (activeSource?.player && isPlaying) {
      togglePlayPause();
    }

    // Clear existing interval
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    // Use the stored complete response instead of the last message's content
    setStreamedText(completeResponse);
    updateLastMessage(completeResponse);
    setIsStreaming(false);
    currentIndexRef.current = completeResponse.length;
  }, [isStreaming, completeResponse, updateLastMessage]);

  // Modify playPredefinedResponse to wait for audio playback to begin before streaming
  const playPredefinedResponse = useCallback(
    async (responseKey: string) => {
      const response = (skullResponses as SkullResponses)[responseKey];
      if (!response) return;

      // Store the complete response
      setCompleteResponse(response.text);

      // Add empty message first
      addMessage({ role: 'assistant', content: '' });

      if (showToneComponent) {
        // Construct the audio path
        const audioPath = `${MEDIA_PATHS.SKULL_SPEECH}/${response.audio}`;

        try {
          // Check if pre-recorded audio exists
          const audioExists = await checkFileExists(audioPath);

          if (audioExists) {
            // Use pre-recorded audio
            const audioResponse = await fetch(audioPath);
            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Apply audio settings
            setPlaybackRate(1.18);
            setPitch(-0.6);
            setUpdateBackgroundColor(false);
            setUpdateColor(false);
            setUpdateCellSize(false);
            setUpdateFontSize(false);

            // Start streaming text
            streamResponse(response.text);

            // Play pre-recorded audio
            await handleElevenLabsAudio(audioUrl);
            URL.revokeObjectURL(audioUrl);
          } else if (isElevenLabsEnabled) {
            // Fallback to ElevenLabs
            console.log(
              'Pre-recorded audio not found, falling back to ElevenLabs',
            );
            const audioBlob = await generateSpeech(response.text);
            const audioUrl = URL.createObjectURL(audioBlob);

            streamResponse(response.text);
            await handleElevenLabsAudio(audioUrl);
            URL.revokeObjectURL(audioUrl);
          }
        } catch (error) {
          console.error('Error handling audio:', error);
          // Ensure text is still streamed even if audio fails
          streamResponse(response.text);
        }
      } else {
        // If audio is disabled, just stream the text
        streamResponse(response.text);
      }
    },
    [
      addMessage,
      showToneComponent,
      isElevenLabsEnabled,
      streamResponse,
      setPlaybackRate,
      setPitch,
      setUpdateBackgroundColor,
      setUpdateColor,
      setUpdateCellSize,
      setUpdateFontSize,
    ],
  );

  // Modify handleSubmit to properly sequence audio and streaming
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim() || isLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        // Add user message
        addMessage({ role: 'user', content: input });
        setInput('');

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: input }],
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch response');
        const data = await response.json();

        // Add empty assistant message first
        addMessage({ role: 'assistant', content: '' });

        if (data.toolAction) {
          // Store complete response for potential skipping
          setCompleteResponse(data.toolAction.config.introText);

          if (data.toolAction.type === 'music') {
            // For music responses, handle both intro text/audio and music
            const audioPath = `${MEDIA_PATHS.SKULL_SPEECH}/${data.toolAction.config.introAudio}`;

            try {
              // Check if pre-recorded intro audio exists
              const audioExists = await checkFileExists(audioPath);

              if (audioExists) {
                // Use pre-recorded audio
                const audioResponse = await fetch(audioPath);
                const audioBlob = await audioResponse.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // Start streaming intro text
                streamResponse(data.toolAction.config.introText);

                // Play pre-recorded intro audio
                await handleElevenLabsAudio(audioUrl);
                URL.revokeObjectURL(audioUrl);

                // After intro completes, handle music setup
                await handleMusicSetup(data.toolAction.config);
              } else if (showToneComponent && isElevenLabsEnabled) {
                // Fallback to ElevenLabs for intro
                const audioBlob = await generateSpeech(
                  data.toolAction.config.introText,
                );
                const audioUrl = URL.createObjectURL(audioBlob);

                streamResponse(data.toolAction.config.introText);
                await handleElevenLabsAudio(audioUrl);
                URL.revokeObjectURL(audioUrl);

                // After intro completes, handle music setup
                await handleMusicSetup(data.toolAction.config);
              }
            } catch (error) {
              console.error('Error handling music intro:', error);
              // If audio fails, still stream text and play music
              streamResponse(data.toolAction.config.introText);
              await handleMusicSetup(data.toolAction.config);
            }
          } else {
            // For regular tool responses
            const audioPath = `${MEDIA_PATHS.SKULL_SPEECH}/${data.toolAction.config.introAudio}`;

            try {
              // Check if pre-recorded audio exists
              const audioExists = await checkFileExists(audioPath);

              if (audioExists) {
                // Use pre-recorded audio
                const audioResponse = await fetch(audioPath);
                const audioBlob = await audioResponse.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // Apply standard audio settings
                setPlaybackRate(1.18);
                setPitch(-0.6);
                setUpdateBackgroundColor(false);
                setUpdateColor(false);
                setUpdateCellSize(false);
                setUpdateFontSize(false);

                // Start streaming text
                streamResponse(data.toolAction.config.introText);

                // Play pre-recorded audio
                await handleElevenLabsAudio(audioUrl);
                URL.revokeObjectURL(audioUrl);
              } else if (showToneComponent && isElevenLabsEnabled) {
                // Fallback to ElevenLabs
                const audioBlob = await generateSpeech(
                  data.toolAction.config.introText,
                );
                const audioUrl = URL.createObjectURL(audioBlob);

                streamResponse(data.toolAction.config.introText);
                await handleElevenLabsAudio(audioUrl);
                URL.revokeObjectURL(audioUrl);
              }
            } catch (error) {
              console.error('Error handling tool response:', error);
              streamResponse(data.toolAction.config.introText);
            }
          }
        } else {
          // Direct LLM response (no tool)
          setCompleteResponse(data.content);

          if (showToneComponent && isElevenLabsEnabled) {
            // Generate audio for direct responses
            try {
              const audioBlob = await generateSpeech(data.content);
              const audioUrl = URL.createObjectURL(audioBlob);

              // Apply standard audio settings
              setPlaybackRate(1.18);
              setPitch(-0.6);
              setUpdateBackgroundColor(false);
              setUpdateColor(false);
              setUpdateCellSize(true);
              setUpdateFontSize(true);

              // Start streaming text
              streamResponse(data.content);

              // Play generated audio
              await handleElevenLabsAudio(audioUrl);
              URL.revokeObjectURL(audioUrl);
            } catch (error) {
              console.error('Error generating audio:', error);
              streamResponse(data.content);
            }
          } else {
            streamResponse(data.content);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [
      messages,
      input,
      isLoading,
      showToneComponent,
      isElevenLabsEnabled,
      handleElevenLabsAudio,
      streamResponse,
      handleMusicSetup,
    ],
  );

  const handleSkip = useCallback(() => {
    completeStreaming();
  }, [completeStreaming]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showChat) {
      setIsAnimating(true);
      // Delay the entire animation to wait for camera movement
      const initialDelay = 220; // Adjust this value to match camera animation duration
      setTimeout(() => {
        fadeApi.start({
          opacity: 1,
          transform: 'translateY(0px)',
          onRest: () => setIsAnimating(false),
        });
      }, initialDelay);
    } else {
      // Start fade-out immediately when closing
      setIsAnimating(true);
      fadeApi.start({
        opacity: 0,
        transform: 'translateY(20px)',
        onRest: () => setIsAnimating(false),
      });
    }
  }, [showChat, fadeApi]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (showChat && !hasInitialized && !isAnimating) {
      const timer = setTimeout(() => {
        playPredefinedResponse('welcome-mortal');
        setHasInitialized(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [
    showChat,
    hasInitialized,
    isAnimating,
    playPredefinedResponse,
    setHasInitialized,
  ]);

  // Add a keydown handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // If there's no input and we're streaming, complete the stream
        if (!input.trim() && isStreaming) {
          e.preventDefault();
          completeStreaming();
        }
      }
    },
    [input, isStreaming, completeStreaming],
  );

  if (!isVisible && !showChat) return null;

  return (
    <>
      {/* Chat component with border */}
      <animated.div
        style={{
          ...fadeSpring,
          position: 'absolute',
          left: '385px',
          bottom: '125px',
          zIndex: 20,
          border: `2px solid ${getThemeColors().foreground}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex flex-col items-center max-w-[550px] min-w-[550px] h-[70vh] overflow-hidden p-2.5 rounded-lg shadow-lg"
          style={{ backgroundColor: getThemeColors().background }}
        >
          <div className="w-full flex-1 flex flex-col gap-2 overflow-auto">
            {messages.map((message, index) => (
              <div key={index} className="flex flex-col">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-t inline-block"
                  style={{
                    backgroundColor:
                      message.role === 'user'
                        ? getThemeColors().blue
                        : getThemeColors().red,
                    color: getThemeColors().background,
                  }}
                >
                  {message.role === 'user' ? 'User' : 'AI'}
                </span>
                <div
                  className="p-2 rounded-b whitespace-pre-wrap"
                  style={{
                    backgroundColor:
                      message.role === 'user'
                        ? `${getThemeColors().blue}33`
                        : `${getThemeColors().red}33`,
                    color: getThemeColors().foreground,
                  }}
                >
                  {index === messages.length - 1 &&
                  message.role === 'assistant' &&
                  isStreaming
                    ? getDisplayText(message.content)
                    : message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ color: getThemeColors().foreground }}>
                Loading...
              </div>
            )}
            {error && (
              <div style={{ color: getThemeColors().red }}>Error: {error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full flex justify-center mt-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="p-2 border-2 rounded focus:outline-none flex-grow"
              style={{
                borderColor: getThemeColors().background,
                color: getThemeColors().foreground,
                backgroundColor: getThemeColors().background,
              }}
            />
            {/* Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              disabled={!isStreaming}
              className="ml-2 p-2 rounded border-2 flex items-center justify-center h-[40px] w-[40px]"
              style={{
                backgroundColor: isStreaming
                  ? getThemeColors().foreground
                  : getThemeColors().gray,
                borderColor: getThemeColors().gray,
                color: getThemeColors().background,
                cursor: isStreaming ? 'pointer' : 'not-allowed',
              }}
              title="Skip"
            >
              <FaForward size={16} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="ml-2 flex-shrink-0 whitespace-nowrap px-4 h-[40px] rounded border-2"
              style={{
                backgroundColor: input.trim()
                  ? getThemeColors().foreground
                  : getThemeColors().gray,
                borderColor: getThemeColors().gray,
                color: getThemeColors().background,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
              title="Send"
            >
              Send
            </button>
          </form>
        </div>
      </animated.div>
    </>
  );
};

export default GroqChatComponent;
