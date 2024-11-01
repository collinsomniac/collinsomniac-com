import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  memo,
} from 'react';
import { useAsciiText } from 'react-ascii-text';
import { getFont } from './fontUtils';

interface AsciiProps {
  text: string;
  fontName: string;
  animationCharacters: string;
  animationCharacterSpacing: number;
  animationDelay: number;
  animationDirection:
    | 'down'
    | 'up'
    | 'left'
    | 'right'
    | 'horizontal'
    | 'vertical';
  animationInterval: number;
  animationLoop: boolean;
  animationSpeed: number;
  isVisible: boolean;
}

interface AsciiContextType {
  asciiProps: AsciiProps;
  setAsciiProps: (props: Partial<AsciiProps>) => void;
  toggleVisibility: () => void;
}

const defaultAsciiProps: AsciiProps = {
  text: 'sample_text',
  fontName: 'fireFontS',
  animationCharacters: '▒░█',
  animationCharacterSpacing: 1,
  animationDelay: 2000,
  animationDirection: 'right',
  animationInterval: 100,
  animationLoop: true,
  animationSpeed: 30,
  isVisible: true,
};

const AsciiContext = createContext<AsciiContextType>({
  asciiProps: defaultAsciiProps,
  setAsciiProps: () => {},
  toggleVisibility: () => {},
});

const AsciiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [asciiProps, setAsciiPropsState] =
    useState<AsciiProps>(defaultAsciiProps);

  const setAsciiProps = (props: Partial<AsciiProps>) => {
    setAsciiPropsState((prevProps) => ({
      ...prevProps,
      ...props,
    }));
  };

  const toggleVisibility = useCallback(() => {
    setAsciiPropsState((prevProps) => ({
      ...prevProps,
      isVisible: !prevProps.isVisible,
    }));
  }, []);

  useEffect(() => {
    const handleRenderAsciiText = (event: CustomEvent) => {
      setAsciiProps(event.detail);
    };

    window.addEventListener('renderAsciiText', handleRenderAsciiText);

    return () => {
      window.removeEventListener('renderAsciiText', handleRenderAsciiText);
    };
  }, []);

  const contextValue = {
    asciiProps,
    setAsciiProps,
    toggleVisibility,
  };

  return (
    <AsciiContext.Provider value={contextValue}>
      {children}
    </AsciiContext.Provider>
  );
};

export const useAscii = () => useContext(AsciiContext);

export default AsciiContext;
