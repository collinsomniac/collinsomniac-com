import React, { useCallback, useEffect } from 'react';
import { useControls, button } from 'leva';
import * as Tone from 'tone';
import useToneStore from '../../../stores/toneStore';
import { usePlaneStore } from '../../../stores/planeStore';
import { useThreeDStore } from '../../../stores/threeDStore';
import { type AudioSourceType } from '../../../stores/toneStore';

interface ToneComponentControlsProps {
  handleAudioUpload: (file: File, sourceType: AudioSourceType) => void;
}

const ToneComponentControls: React.FC<ToneComponentControlsProps> = ({
  handleAudioUpload,
}) => {
  const {
    isPlaying,
    currentTime,
    activeSourceType,
    togglePlayPause,
    seekTo,
    setMasterGain,
  } = useToneStore();

  const { videoElement, duration, volume, setVolume, setVideoTime, mediaType } =
    usePlaneStore();

  const { showToneComponent, showToneControls } = useThreeDStore();

  const { audioDetails } = useToneStore((state) => ({
    audioDetails: state.activeSources[state.activeSourceType]?.details,
  }));

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = useCallback(() => {
    togglePlayPause();
    if (activeSourceType === 'plane' && videoElement) {
      if (!isPlaying) {
        videoElement.play().catch(console.error);
      } else {
        videoElement.pause();
      }
    }
  }, [togglePlayPause, activeSourceType, videoElement, isPlaying]);

  const handleTimeChange = useCallback(
    (value: number) => {
      seekTo(value);
      if (activeSourceType === 'plane' && videoElement) {
        setVideoTime(value);
      }
    },
    [seekTo, activeSourceType, videoElement, setVideoTime],
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      setVolume(value);
      setMasterGain(value);
      if (videoElement) {
        videoElement.volume = value;
      }
    },
    [setVolume, setMasterGain, videoElement],
  );

  useControls(
    'Playback Controls',
    () => ({
      'Play/Pause': button(handlePlayPause),
      Volume: {
        value: volume,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: handleVolumeChange,
      },
      Playhead: {
        value: currentTime,
        min: 0,
        max: audioDetails?.duration || duration || 100,
        step: 0.1,
        onChange: handleTimeChange,
      },
      Playtime: {
        value: `${formatTime(currentTime)} / ${formatTime(
          audioDetails?.duration || duration || 0,
        )}`,
        editable: false,
      },
    }),
    { collapsed: false },
  );

  return null;
};

export default ToneComponentControls;
