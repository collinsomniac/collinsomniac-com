import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { FaWindowMinimize, FaWindowMaximize } from 'react-icons/fa';
import { useAsciiText, standard, theEdge } from 'react-ascii-text';

interface AsciiTextProps {
  text: string;
  font?: any;
  color: string;
  // Add all additional animation parameters
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

const AsciiText: React.FC<AsciiTextProps> = ({
  text,
  font = theEdge,
  color,
  animationDirection = 'horizontal',
  animationCharacters = '▒░█',
  animationCharacterSpacing = 1,
  animationDelay = 500,
  animationInterval = 1000,
  animationIteration = 1,
  animationLoop = false,
  animationSpeed = 20,
  fadeInOnly = true,
  fadeOutOnly = false,
  isAnimated = true,
  isPaused = false,
}) => {
  const asciiTextRef = useAsciiText({
    font,
    text,
    animationDirection,
    animationCharacters,
    animationCharacterSpacing,
    animationDelay,
    animationInterval,
    animationIteration,
    animationLoop,
    animationSpeed,
    fadeInOnly,
    fadeOutOnly,
    isAnimated,
    isPaused,
  });

  return <pre ref={asciiTextRef} style={{ color, margin: 0 }}></pre>;
};
