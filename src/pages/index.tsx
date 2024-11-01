import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import config from '../../config.json';
import { Input } from '../components/input';
import { ThemeProvider } from '../components/theme/ThemeContext';
import { useHistory } from '../components/history/hook';
import { History } from '../components/history/History';
import { banner } from '../utils/bin';
import { usePlaneStore } from '../stores/planeStore';
import { useThreeDStore } from '../stores/threeDStore';
import { useThemeStore } from '../stores/themeStore';
import { Canvas } from '@react-three/fiber';
import GlobalKeyHandler from '../components/gui/GlobalKeyhandler';

// Dynamic imports with SSR disabled
const StartOverlay = dynamic(() => import('../components/gui/StartOverlay'), {
  ssr: false,
});

const ThreeDEngine = dynamic(
  () => import('../components/ThreeD/ThreeDEngine'),
  {
    ssr: false,
  },
);

const IndexPage: React.FC<{ inputRef: React.RefObject<HTMLInputElement> }> = ({
  inputRef,
}) => {
  const { showTerminal, showEngine } = useThreeDStore();
  const [cameraControls, setCameraControls] = useState(false);
  const { setFile, setUrl } = usePlaneStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const threeDEngineRef = useRef<HTMLDivElement>(null);
  const {
    history,
    command,
    lastCommandIndex,
    setCommand,
    setHistory,
    clearHistory,
    setLastCommandIndex,
  } = useHistory();

  const {
    theme,
    variant,
    getThemeColors,
    initializeFromLocalStorage,
    isInitialized,
  } = useThemeStore();

  useEffect(() => {
    if (history.length === 0) {
      setHistory(banner());
    }
    if (!isInitialized) {
      initializeFromLocalStorage();
    }
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const themeColors = getThemeColors();

  return (
    <ThemeProvider>
      <GlobalKeyHandler />
      <Head>
        <title>{config.title}</title>
      </Head>
      <div className="relative w-screen h-screen overflow-hidden">
        {/* Overlay */}
        <div className="z-2000">
          <StartOverlay />
        </div>
        <>
          {showEngine && (
            <div
              ref={threeDEngineRef}
              className="fixed inset-0 z-10 overflow-hidden"
            >
              <ThreeDEngine onCanvasClick={handleCanvasClick} />
            </div>
          )}
          {showTerminal && (
            <div
              className="absolute inset-0 p-8 overflow-hidden rounded"
              style={{
                borderColor: themeColors.yellow,
                color: themeColors.foreground,
                backgroundColor: themeColors.background,
              }}
            >
              <div ref={containerRef} className="overflow-y-auto h-full">
                <History history={history} />
                <Input
                  inputRef={inputRef}
                  containerRef={containerRef}
                  command={command}
                  history={history}
                  lastCommandIndex={lastCommandIndex}
                  setCommand={setCommand}
                  setHistory={setHistory}
                  setLastCommandIndex={setLastCommandIndex}
                  clearHistory={clearHistory}
                />
              </div>
            </div>
          )}
        </>
      </div>
    </ThemeProvider>
  );
};

export default IndexPage;
