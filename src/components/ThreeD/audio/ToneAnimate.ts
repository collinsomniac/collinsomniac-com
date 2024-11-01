import { useEffect, useMemo, useRef, useCallback } from 'react';
import useToneStore from '../../../stores/toneStore';
import { useASCIIStore } from '../../../stores/asciiStore';
import { useASCIIUpdateStore } from '../../../stores/asciiUpdateStore';
import { useThemeStore } from '../../../stores/themeStore';
import { useCameraStore } from '../../../stores/cameraStore';

let previousSpectrum: Float32Array | null = null;
let beatEnergy = 0;
let noveltyScore = 0;

const calculateAmplitude = (waveformData: Float32Array): number => {
  const sum = waveformData.reduce((acc, val) => acc + Math.abs(val), 0);
  return sum / waveformData.length;
};

const calculateDominantFrequency = (fftData: Float32Array): number => {
  const maxIndex = Array.from(fftData).indexOf(
    Math.max(...Array.from(fftData)),
  );
  return (maxIndex / fftData.length) * 441000; // Assuming 44.1kHz sample rate
};

const mapAmplitudeToSize = (
  amplitude: number,
  min: number,
  max: number,
): number => {
  const scale = Math.pow((Math.sin(amplitude * Math.PI) + 1) / 2, 2); // Quadratic scaling for more pronounced effect
  return min + (max - min) * scale;
};

const mapFrequencyToColor = (
  frequency: number,
  useThemeColors: boolean,
  isBackground: boolean = false,
): string => {
  const minFreq = Math.log(535);
  const maxFreq = Math.log(600);
  const normalizedFreq = Math.max(
    0,
    Math.min(
      1,
      (Math.log(Math.max(20, Math.min(20000, frequency))) - minFreq) /
        (maxFreq - minFreq),
    ),
  );

  if (useThemeColors) {
    const { getThemeColors, theme, variant } = useThemeStore.getState();
    const themeColors = getThemeColors();
    const colors = [
      themeColors.blue,
      themeColors.green,
      themeColors.yellow,
      themeColors.red,
    ].filter(Boolean);

    if (colors.length === 0) {
      return '#000000'; // Return a default color if no valid theme colors are found
    }

    if (isBackground) {
      // Offset the colors by two positions for the background
      colors.push(colors.shift()!, colors.shift()!);
    }

    const index = Math.floor(normalizedFreq * (colors.length - 1));
    const t = normalizedFreq * (colors.length - 1) - index;
    return interpolateHexColor(
      colors[index],
      colors[index + 1] || colors[index],
      t,
    );
  } else {
    const hue = Math.round(normalizedFreq * 360);
    return `hsl(${hue}, 100%, 50%)`;
  }
};

const interpolateHexColor = (
  color1: string,
  color2: string,
  t: number,
): string => {
  // Ensure both colors are valid hex strings
  if (
    !color1 ||
    !color2 ||
    !color1.startsWith('#') ||
    !color2.startsWith('#')
  ) {
    return '#000000'; // Return a default color if input is invalid
  }

  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const getContrastingColor = (color: string): string => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
  } else {
    const hue = parseInt(color.match(/hsl\((\d+)/)?.[1] || '0');
    const contrastHue = (hue + 180) % 360;
    return `hsl(${contrastHue}, 100%, 50%)`;
  }
};

const SILENCE_THRESHOLD = 0.01; // Adjust this value as needed

const calculateSpectralCentroid = (fftData: Float32Array): number => {
  let weightedSum = 0;
  let sum = 0;
  for (let i = 0; i < fftData.length; i++) {
    weightedSum += i * fftData[i];
    sum += fftData[i];
  }
  return weightedSum / sum;
};

const detectADSR = (
  waveformData: Float32Array,
): { attack: number; decay: number; sustain: number; release: number } => {
  const waveformArray = Array.from(waveformData);
  const maxAmplitude = Math.max(...waveformArray);
  const attackIndex = waveformArray.findIndex((v) => v >= maxAmplitude * 0.9);
  const releaseIndex =
    waveformArray.length -
    1 -
    waveformArray.reverse().findIndex((v) => v >= maxAmplitude * 0.1);

  return {
    attack: attackIndex / waveformData.length,
    decay: ((releaseIndex - attackIndex) / waveformData.length) * 0.2,
    sustain: ((releaseIndex - attackIndex) / waveformData.length) * 0.3,
    release: (waveformData.length - releaseIndex) / waveformData.length,
  };
};

let lastBeatTime = 0;

const analyzeFrequencyBands = (
  fftData: Float32Array,
): { low: number; mid: number; high: number } => {
  const lowEnd = Math.floor(fftData.length * 0.1);
  const midEnd = Math.floor(fftData.length * 0.5);

  const lowSum = fftData.slice(0, lowEnd).reduce((sum, val) => sum + val, 0);
  const midSum = fftData
    .slice(lowEnd, midEnd)
    .reduce((sum, val) => sum + val, 0);
  const highSum = fftData.slice(midEnd).reduce((sum, val) => sum + val, 0);

  const total = lowSum + midSum + highSum;

  return {
    low: lowSum / total,
    mid: midSum / total,
    high: highSum / total,
  };
};

const calculateSpectralFlux = (
  currentSpectrum: Float32Array,
  previousSpectrum: Float32Array | null,
): number => {
  if (!previousSpectrum) return 0;
  return currentSpectrum.reduce((flux, value, index) => {
    const diff = value - previousSpectrum[index];
    return flux + (diff > 0 ? diff : 0);
  }, 0);
};

const calculateNovelty = (spectralFlux: number): number => {
  // Implement a moving average or exponential moving average for spectral flux
  noveltyScore = 0.8 * noveltyScore + 0.2 * spectralFlux;
  return spectralFlux - noveltyScore;
};

const createToneAnimator = (
  toneStore: ReturnType<typeof useToneStore.getState>,
) => {
  let lastCharacterColor = '#000000';
  let lastBackgroundColor = '#ffffff';

  const movingAverageBuffer = {
    fontSize: [] as number[],
    cellSize: [] as number[],
    color: [] as string[],
    backgroundColor: [] as string[],
  };
  const BUFFER_SIZE = 3;

  const addToMovingAverage = (key: string, value: number | string) => {
    movingAverageBuffer[key].push(value);
    if (movingAverageBuffer[key].length > BUFFER_SIZE) {
      movingAverageBuffer[key].shift();
    }
  };

  const getMovingAverage = (key: string) => {
    const buffer = movingAverageBuffer[key];
    if (buffer.length === 0) return null;
    if (typeof buffer[0] === 'number') {
      return (
        buffer.reduce((sum, val) => sum + (val as number), 0) / buffer.length
      );
    } else {
      return buffer[Math.floor(buffer.length / 2)]; // Median for colors
    }
  };

  const { cycleSoundCameraPosition, isSoundAnimationEnabled } =
    useCameraStore.getState();

  const calculateAudioParams = () => {
    const {
      getWaveformData,
      getFFTData,
      getActiveAudioSource,
      isPlaying,
      useThemeColors,
    } = toneStore;
    const { theme, variant } = useThemeStore.getState(); // Add this line to get current theme and variant
    const activeSource = getActiveAudioSource();

    if (activeSource && activeSource.analyser && isPlaying) {
      const waveformData = getWaveformData();
      const fftData = getFFTData();

      const amplitude = calculateAmplitude(waveformData);
      const dominantFrequency = calculateDominantFrequency(fftData);
      const spectralCentroid = calculateSpectralCentroid(fftData);
      const adsr = detectADSR(waveformData);
      const frequencyBands = analyzeFrequencyBands(fftData);

      const fftDataArray = activeSource.analyser.getValue() as Float32Array;
      const spectralFlux = calculateSpectralFlux(
        fftDataArray,
        previousSpectrum,
      );
      const novelty = calculateNovelty(spectralFlux);
      previousSpectrum = fftDataArray;

      // Dynamic beat detection
      const currentBeatEnergy = calculateAmplitude(waveformData);
      beatEnergy = 0.98 * beatEnergy + 0.02 * currentBeatEnergy;

      // Get the current threshold values from the store
      const {
        beatThreshold,
        beatEnergyThreshold,
        noveltyThreshold,
        frequencyThreshold,
        cycleSoundCameraPosition,
        isSoundAnimationEnabled,
      } = useCameraStore.getState();

      // Use the dynamic beatThreshold instead of the constant BEAT_THRESHOLD
      const isBeat = detectBeat(waveformData, beatThreshold);

      let fontSize, cellSize;
      if (amplitude < SILENCE_THRESHOLD) {
        fontSize = 64;
        cellSize = 5;
      } else {
        fontSize = Math.round(
          mapAmplitudeToSize(amplitude * (1 + adsr.attack), 64, 78),
        );
        cellSize = Math.round(
          mapAmplitudeToSize(amplitude * (1 + frequencyBands.low), 5, 12),
        );
      }

      const newCharacterColor = mapFrequencyToColor(
        spectralCentroid,
        useThemeColors,
      );
      const newBackgroundColor = useThemeColors
        ? mapFrequencyToColor(spectralCentroid, useThemeColors, true)
        : getContrastingColor(newCharacterColor);

      // Smooth color transitions
      const characterColor = useThemeColors
        ? newCharacterColor
        : interpolateHSLColor(lastCharacterColor, newCharacterColor, 0.9);
      const backgroundColor = useThemeColors
        ? newBackgroundColor
        : interpolateHSLColor(lastBackgroundColor, newBackgroundColor, 0.9);

      lastCharacterColor = characterColor;
      lastBackgroundColor = backgroundColor;

      addToMovingAverage('fontSize', fontSize);
      addToMovingAverage('cellSize', cellSize);
      addToMovingAverage('color', characterColor);
      addToMovingAverage('backgroundColor', backgroundColor);

      // Use the dynamic frequencyThreshold for direction determination
      const direction =
        dominantFrequency > frequencyThreshold ? 'next' : 'previous';

      // Trigger camera animation if sound animation is enabled
      if (isSoundAnimationEnabled && (isBeat || novelty > noveltyThreshold)) {
        cycleSoundCameraPosition(direction);
      }

      return {
        fontSize: getMovingAverage('fontSize') as number,
        cellSize: getMovingAverage('cellSize') as number,
        color: getMovingAverage('color') as string,
        backgroundColor: getMovingAverage('backgroundColor') as string,
        isBeat,
        frequencyBands,
        spectralFlux,
        novelty,
        dominantFrequency,
      };
    }

    return null;
  };

  // Update the detectBeat function to use the dynamic threshold
  const detectBeat = (
    waveformData: Float32Array,
    threshold: number,
  ): boolean => {
    const currentAmplitude = calculateAmplitude(waveformData);
    const currentTime = performance.now();
    if (currentAmplitude > threshold && currentTime - lastBeatTime > 10) {
      lastBeatTime = currentTime;
      return true;
    }
    return false;
  };

  return { calculateAudioParams };
};

export const useToneAnimator = () => {
  const toneStore = useToneStore();
  const asciiStore = useASCIIStore();
  const { isShaderVisualizerEnabled, useThemeColors } = toneStore;
  const { updateFontSize, updateCellSize, updateColor, updateBackgroundColor } =
    useASCIIUpdateStore();
  const { theme, variant } = useThemeStore();

  const toneAnimator = useMemo(
    () => createToneAnimator(toneStore),
    [toneStore],
  );
  const latestParamsRef = useRef(null);
  const frameCountRef = useRef(0);
  const shouldUpdateStoreRef = useRef(false);
  const animationFrameIdRef = useRef<number | null>(null);

  const calculateAudioParams = useCallback(() => {
    return toneAnimator.calculateAudioParams();
  }, [toneAnimator]);

  const updateAudioParams = useCallback(() => {
    if (isShaderVisualizerEnabled) {
      frameCountRef.current += 1;

      const newParams = calculateAudioParams();
      if (newParams) {
        latestParamsRef.current = newParams;
        shouldUpdateStoreRef.current = true;
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(updateAudioParams);
  }, [isShaderVisualizerEnabled, calculateAudioParams]);

  const updateStore = useCallback(() => {
    if (shouldUpdateStoreRef.current && latestParamsRef.current) {
      const { fontSize, cellSize, color, backgroundColor } =
        latestParamsRef.current;
      if (updateFontSize && fontSize !== asciiStore.fontSize)
        asciiStore.setFontSize(fontSize);
      if (updateCellSize && cellSize !== asciiStore.cellSize)
        asciiStore.setCellSize(cellSize);
      if (updateColor && color !== asciiStore.color) asciiStore.setColor(color);
      if (
        updateBackgroundColor &&
        backgroundColor !== asciiStore.backgroundColor
      )
        asciiStore.setBackgroundColor(backgroundColor);
      shouldUpdateStoreRef.current = false;
    }
  }, [
    asciiStore,
    updateFontSize,
    updateCellSize,
    updateColor,
    updateBackgroundColor,
  ]);

  useEffect(() => {
    if (isShaderVisualizerEnabled) {
      updateAudioParams();
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    isShaderVisualizerEnabled,
    updateAudioParams,
    useThemeColors,
    theme,
    variant,
  ]);

  useEffect(() => {
    const intervalId = setInterval(updateStore, 10);
    return () => clearInterval(intervalId);
  }, [updateStore]);

  return null;
};

const interpolateHSLColor = (
  color1: string,
  color2: string,
  t: number,
): string => {
  const parseHSL = (color: string) => {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : [0, 0, 0];
  };

  const [h1, s1, l1] = parseHSL(color1);
  const [h2, s2, l2] = parseHSL(color2);

  const h = Math.round(h1 + (h2 - h1) * t);
  const s = Math.round(s1 + (s2 - s1) * t);
  const l = Math.round(l1 + (l2 - l1) * t);

  return `hsl(${h}, ${s}%, ${l}%)`;
};
