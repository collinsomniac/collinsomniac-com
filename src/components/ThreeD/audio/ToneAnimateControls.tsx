import React from 'react';
import { useEffect } from 'react';
import { useControls, folder } from 'leva';
import { useASCIIUpdateStore } from '../../../stores/asciiUpdateStore';
import useToneStore from '../../../stores/toneStore';
import { useThreeDStore } from '../../../stores/threeDStore';
import { useCameraStore } from '../../../stores/cameraStore';
import { useButterChurnStore } from '../../../stores/butterchurnStore';

const ToneAnimateControls: React.FC = () => {
  const { visualizerMode, setVisualizerMode } = useToneStore();

  const { presets, currentPreset, setPresetByName } = useButterChurnStore();

  const {
    cameraChangeCooldown,
    setCameraChangeCooldown,
    beatThreshold,
    setBeatThreshold,
    noveltyThreshold,
    setNoveltyThreshold,
    beatEnergyThreshold,
    setBeatEnergyThreshold,
    frequencyThreshold,
    setFrequencyThreshold,
  } = useCameraStore();

  const {
    updateFontSize,
    updateCellSize,
    updateColor,
    updateBackgroundColor,
    setUpdateFontSize,
    setUpdateCellSize,
    setUpdateColor,
    setUpdateBackgroundColor,
  } = useASCIIUpdateStore();

  const [controls, setControls] = useControls(
    'Visualization',
    () => ({
      'Visualizer Mode': {
        value: visualizerMode,
        options: ['line', 'circle', 'butterchurn', 'none'],
        onChange: (value) =>
          setVisualizerMode(
            value as 'line' | 'circle' | 'butterchurn' | 'none',
          ),
      },
      'Butterchurn Preset': {
        value: currentPreset,
        options: presets,
        onChange: setPresetByName,
        render: (get) => get('Visualization.Visualizer Mode') === 'butterchurn',
      },
      'ASCII Updates': folder({
        'Update Font Size': {
          value: updateFontSize,
          onChange: setUpdateFontSize,
        },
        'Update Cell Size': {
          value: updateCellSize,
          onChange: setUpdateCellSize,
        },
        'Update Color': {
          value: updateColor,
          onChange: setUpdateColor,
        },
        'Update Background': {
          value: updateBackgroundColor,
          onChange: setUpdateBackgroundColor,
        },
      }),
      'View Config': folder({
        'Cooldown (ms)': {
          value: cameraChangeCooldown,
          min: 20,
          max: 2000,
          step: 5,
          onChange: setCameraChangeCooldown,
        },
        'Beat Threshold': {
          value: beatThreshold,
          min: 0.05,
          max: 0.99,
          step: 0.01,
          onChange: setBeatThreshold,
        },
        'Novelty Threshold': {
          value: noveltyThreshold,
          min: 0.05,
          max: 0.99,
          step: 0.01,
          onChange: setNoveltyThreshold,
        },
        'Energy Threshold': {
          value: beatEnergyThreshold,
          min: 0.05,
          max: 0.99,
          step: 0.01,
          onChange: setBeatEnergyThreshold,
        },
        'Frequency Threshold': {
          value: frequencyThreshold,
          min: 20,
          max: 20000,
          step: 5,
          onChange: setFrequencyThreshold,
        },
      }),
    }),
    { collapsed: true },
  );

  // Update controls when store values change
  useEffect(() => {
    setControls({
      'Visualizer Mode': visualizerMode,
      'Butterchurn Preset': currentPreset,
    });
  }, [visualizerMode, currentPreset, setControls]);

  return null;
};

export default ToneAnimateControls;
