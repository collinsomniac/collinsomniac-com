/* eslint-disable prettier/prettier */
import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useControls, button } from 'leva';
import { usePlaneStore } from '../../../stores/planeStore';
import useToneStore from '../../../stores/toneStore';
import { useStore } from 'zustand';
import { debounce } from 'lodash';
import { useThreeDStore } from '../../../stores/threeDStore';

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const PlanePlayer = () => {
  const { showLeva, showPlane } = useThreeDStore();

  const videoElement = useStore(usePlaneStore, (state) => state.videoElement);
  const currentTime = useStore(usePlaneStore, (state) => state.currentTime);
  const setCurrentTime = useStore(
    usePlaneStore,
    (state) => state.setCurrentTime,
  );
  const duration = useStore(usePlaneStore, (state) => state.duration);
  const volume = useStore(usePlaneStore, (state) => state.volume);
  const setVolume = useStore(usePlaneStore, (state) => state.setVolume);
  const mediaType = useStore(usePlaneStore, (state) => state.mediaType);
  const togglePictureInPicture = useStore(
    usePlaneStore,
    (state) => state.togglePictureInPicture,
  );
  const updateVideoElement = useStore(
    usePlaneStore,
    (state) => state.updateVideoElement,
  );
  const setVideoTime = useStore(usePlaneStore, (state) => state.setVideoTime);

  const { togglePlayPause, activeSourceType, setActiveAudioSource } =
    useToneStore();

  const [isPlayheadDragging, setIsPlayheadDragging] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(currentTime);

  const debouncedSetVideoTime = useMemo(
    () =>
      debounce((time: number) => {
        if (videoElement) {
          videoElement.currentTime = time;
        }
        setVideoTime(time);
        useToneStore.getState().seekTo(time); // Sync with ToneStore
      }, 4),
    [setVideoTime, videoElement],
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      setVolume(value);
      if (videoElement) {
        videoElement.volume = value;
      }
      useToneStore.getState().setPlaybackRate(value); // Adjust playback rate if necessary
    },
    [setVolume, videoElement],
  );

  const handlePlayheadChange = useCallback(
    (value: number) => {
      setLocalCurrentTime(value);
      if (!isPlayheadDragging) {
        debouncedSetVideoTime(value);
        useToneStore.getState().setCurrentTime(value);
      }
    },
    [isPlayheadDragging, debouncedSetVideoTime],
  );

  const handleTogglePlayPause = useCallback(() => {
    // First ensure plane is the active audio source
    if (activeSourceType !== 'plane') {
      setActiveAudioSource('plane');
    }

    // Use existing togglePlayPause from toneStore
    togglePlayPause();

    // Sync video playback with toneStore state
    if (videoElement) {
      const { isPlaying } = useToneStore.getState();
      if (isPlaying) {
        videoElement.play().catch(console.error);
      } else {
        videoElement.pause();
      }
    }
  }, [togglePlayPause, activeSourceType, setActiveAudioSource, videoElement]);

  const [controls, setControls] = useControls(
    () => ({
      'Play/Pause': button(handleTogglePlayPause, {
        disabled: mediaType !== 'video',
      }),
      'Reset to Start': button(
        () => {
          setVideoTime(0);
          setCurrentTime(0);
          useToneStore.getState().setCurrentTime(0);
        },
        { disabled: mediaType !== 'video' },
      ),
      Volume: {
        value: volume,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: handleVolumeChange,
        disabled: mediaType !== 'video',
      },
      Playhead: {
        value: localCurrentTime,
        min: 0,
        max: duration,
        step: 0.1,
        onChange: handlePlayheadChange,
        disabled: mediaType !== 'video',
      },
      Playtime: {
        value: `${formatTime(localCurrentTime)} / ${formatTime(duration)}`,
        editable: false,
        disabled: mediaType !== 'video',
      },
      //    'Picture-in-Picture': button(() => togglePictureInPicture(), { disabled: mediaType !== 'video' }),
    }),
    [
      mediaType,
      handleTogglePlayPause,
      togglePictureInPicture,
      handleVolumeChange,
      handlePlayheadChange,
      localCurrentTime,
      duration,
    ],
  );

  useEffect(() => {
    setControls({
      Playhead: localCurrentTime,
      Playtime: `${formatTime(localCurrentTime)} / ${formatTime(duration)}`,
    });
  }, [localCurrentTime, duration, setControls]);

  useEffect(() => {
    if (videoElement && videoElement !== videoElement) {
      updateVideoElement(videoElement);
    }
  }, [videoElement, updateVideoElement]);

  const handlePlayheadDragStart = useCallback(
    () => setIsPlayheadDragging(true),
    [],
  );
  const handlePlayheadDragEnd = useCallback(() => {
    setIsPlayheadDragging(false);
    if (videoElement) {
      debouncedSetVideoTime(videoElement.currentTime);
    }
  }, [debouncedSetVideoTime, videoElement]);

  useEffect(() => {
    const playheadElement = document.querySelector('[id$="Playhead"]');
    if (playheadElement) {
      playheadElement.addEventListener('mousedown', handlePlayheadDragStart);
      playheadElement.addEventListener('mouseup', handlePlayheadDragEnd);
      playheadElement.addEventListener('mouseleave', handlePlayheadDragEnd);
    }

    return () => {
      if (playheadElement) {
        playheadElement.removeEventListener(
          'mousedown',
          handlePlayheadDragStart,
        );
        playheadElement.removeEventListener('mouseup', handlePlayheadDragEnd);
        playheadElement.removeEventListener(
          'mouseleave',
          handlePlayheadDragEnd,
        );
      }
    };
  }, [handlePlayheadDragStart, handlePlayheadDragEnd]);

  return null;
};

export default React.memo(PlanePlayer);
