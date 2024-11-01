import React, { useEffect } from 'react';
import { useControls, button } from 'leva';
import { useASCIIStore } from '../../../stores/asciiStore';
import { useThreeDStore } from '../../../stores/threeDStore';

const ASCIIControls: React.FC = () => {
  const ascii = useASCIIStore();
  const { showASCIIControls } = useThreeDStore();

  const [asciiControls, setAsciiControls] = useControls(
    'ASCII Effect',
    () => ({
      Enable: { value: ascii.enabled, onChange: ascii.setEnabled },
      Characters: { value: ascii.characters, onChange: ascii.setCharacters },
      FontSize: {
        label: 'Font',
        value: ascii.fontSize,
        min: 0.1,
        max: 500,
        step: 0.1,
        onChange: ascii.setFontSize,
      },
      CellSize: {
        label: 'Cells',
        value: ascii.cellSize,
        min: 0.1,
        max: 250,
        step: 0.1,
        onChange: ascii.setCellSize,
      },
      Color: {
        label: 'Foreground',
        value: ascii.color,
        onChange: ascii.setColor,
      },
      BackgroundColor: {
        label: 'Background',
        value: ascii.backgroundColor,
        onChange: ascii.setBackgroundColor,
      },
      CanvasColor: {
        label: 'Canvas',
        value: ascii.canvasColor,
        onChange: ascii.setCanvasColor,
      },
      Invert: { value: ascii.invert, onChange: ascii.setInvert },
      UseCanvasColor: {
        label: 'Real Color',
        value: ascii.useCanvasColor,
        onChange: ascii.setUseCanvasColor,
      },
      ShowBackground: {
        label: 'Show Background',
        value: ascii.showBackground,
        onChange: ascii.setShowBackground,
      },
      CharactersVisibility: {
        label: 'Opacity',
        value: ascii.charactersVisibility,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: ascii.setCharactersVisibility,
      },
    }),
    { collapsed: true, render: () => showASCIIControls },
  );

  useEffect(() => {
    setAsciiControls({
      Color: ascii.color,
      BackgroundColor: ascii.backgroundColor,
      CanvasColor: ascii.canvasColor,
      FontSize: ascii.fontSize,
      CellSize: ascii.cellSize,
    });
  }, [
    ascii.color,
    ascii.backgroundColor,
    ascii.canvasColor,
    ascii.fontSize,
    ascii.cellSize,
    setAsciiControls,
  ]);

  return null;
};

export default ASCIIControls;
