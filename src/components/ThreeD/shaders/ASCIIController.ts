/* eslint-disable prettier/prettier */
import { useASCIIStore } from '../../../stores/asciiStore';
import useToneStore from '../../../stores/toneStore';

export interface ASCIIInstruction {
  characterColor: string;
  backgroundColor: string;
  charactersVisibility: number;
  backgroundVisibility: number;
  fontSize: number;
  cellSize: number;
  invert: boolean;
  useCanvasColor: boolean;
  characters: string;
}

export const createASCIIController = () => {
  const asciiStore = useASCIIStore.getState();
  const toneStore = useToneStore.getState();

  const interpolateValue = (start: number, end: number, progress: number) => {
    return start + (end - start) * progress;
  };

  const interpolateColor = (start: string, end: string, progress: number) => {
    const startRGB = parseInt(start.slice(1), 16);
    const endRGB = parseInt(end.slice(1), 16);
    const r = Math.round(
      interpolateValue((startRGB >> 16) & 255, (endRGB >> 16) & 255, progress),
    );
    const g = Math.round(
      interpolateValue((startRGB >> 8) & 255, (endRGB >> 8) & 255, progress),
    );
    const b = Math.round(
      interpolateValue(startRGB & 255, endRGB & 255, progress),
    );
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const applyASCIIInstructions = (
    instructions: ASCIIInstruction[],
    totalDuration: number,
  ) => {
    let startTime: number | null = null;
    let animationFrameId: number | null = null;

    const updateASCII = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / totalDuration, 1);

      const index = Math.floor(progress * (instructions.length - 1));
      const nextIndex = Math.min(index + 1, instructions.length - 1);
      const segmentProgress = (progress * (instructions.length - 1)) % 1;

      const current = instructions[index];
      const next = instructions[nextIndex];

      asciiStore.setColor(
        interpolateColor(
          current.characterColor,
          next.characterColor,
          segmentProgress,
        ),
      );
      asciiStore.setBackgroundColor(
        interpolateColor(
          current.backgroundColor,
          next.backgroundColor,
          segmentProgress,
        ),
      );
      asciiStore.setCharactersVisibility(
        interpolateValue(
          current.charactersVisibility,
          next.charactersVisibility,
          segmentProgress,
        ),
      );
      asciiStore.setBackgroundVisibility(
        interpolateValue(
          current.backgroundVisibility,
          next.backgroundVisibility,
          segmentProgress,
        ),
      );
      asciiStore.setFontSize(
        Math.round(
          interpolateValue(current.fontSize, next.fontSize, segmentProgress),
        ),
      );
      asciiStore.setCellSize(
        Math.round(
          interpolateValue(current.cellSize, next.cellSize, segmentProgress),
        ),
      );
      asciiStore.setInvert(current.invert);
      asciiStore.setUseCanvasColor(current.useCanvasColor);
      asciiStore.setCharacters(current.characters);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateASCII);
      } else {
        // Reset to default values or initial state when animation is complete
        asciiStore.setColor('#ffffff');
        asciiStore.setBackgroundColor('#000000');
        asciiStore.setCharactersVisibility(1);
        asciiStore.setBackgroundVisibility(1);
        asciiStore.setFontSize(64);
        asciiStore.setCellSize(5);
        asciiStore.setInvert(false);
        asciiStore.setUseCanvasColor(false);
        asciiStore.setCharacters(' .-:;=+*#%@');
        asciiStore.setEnabled(true);
      }
    };

    asciiStore.setEnabled(true);
    animationFrameId = requestAnimationFrame(updateASCII);

    // Return a function to cancel the animation if needed
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      asciiStore.setEnabled(false);
    };
  };

  return { applyASCIIInstructions };
};
