import React from 'react';
import { useAsciiText } from 'react-ascii-text';
import { getFont } from './fontUtils';
import { useFontSettings } from './fontSettings';

const AsciiTextAnimations: React.FC = () => {
  const {
    text,
    fontName,
    animationCharacters,
    animationCharacterSpacing,
    animationDelay,
    animationDirection,
    animationInterval,
    animationLoop,
    animationSpeed,
    fadeInOnly,
    isVisible,
  } = useFontSettings();

  const font = getFont(fontName);

  const asciiTextRef = useAsciiText({
    text,
    font,
    animationCharacters,
    animationCharacterSpacing,
    animationDelay,
    animationDirection,
    animationInterval,
    animationLoop,
    animationSpeed,
    fadeInOnly, // Incorporate fadeInOnly
  });

  return isVisible ? <pre ref={asciiTextRef}></pre> : null;
};

export default AsciiTextAnimations;
