import React from 'react';
import { FaVolumeUp, FaEye, FaFont, FaCommentDots } from 'react-icons/fa';
import { useThreeDStore } from '../../stores/threeDStore';
import { useThemeStore } from '../../stores/themeStore';
import { useControls } from 'leva';
import { useCameraStore } from '../../stores/cameraStore';
import useToneStore from '../../stores/toneStore';

const LevaButtons: React.FC = () => {
  const { getThemeColors } = useThemeStore();
  const {
    toggleElement,
    showLeva,
    showToneControls,
    showToneAnimateControls,
    showPlaneControls,
    showASCIIControls,
    showASCIIPresets,
    showThemeControls,
    showChat,
    showChatContent,
    setShowChatContent,
  } = useThreeDStore();
  const { cycleCameraPosition } = useCameraStore();

  const { isPlaying } = useToneStore();

  const themeColors = getThemeColors();

  const buttonStyle = {
    fontSize: '32px',
    marginRight: '12px',
    cursor: 'pointer',
  };

  const switchToControl = (controlType: 'audio' | 'visuals' | 'text') => {
    const currentState = useThreeDStore.getState();

    // If chat is active, disable it first
    if (showChatContent) {
      setShowChatContent(false);
    }

    // First disable all controls except the ones we're switching to
    if (currentState.showToneControls && controlType !== 'audio') {
      toggleElement('showToneControls');
      toggleElement('showToneAnimateControls');
    }
    if (currentState.showPlaneControls && controlType !== 'visuals') {
      toggleElement('showPlaneControls');
    }
    if (
      (currentState.showASCIIControls ||
        currentState.showASCIIPresets ||
        currentState.showThemeControls) &&
      controlType !== 'text'
    ) {
      toggleElement('showASCIIControls');
      toggleElement('showASCIIPresets');
      toggleElement('showThemeControls');
    }

    // Then enable the new controls
    switch (controlType) {
      case 'audio':
        if (!showToneControls) {
          toggleElement('showToneControls');
          toggleElement('showToneAnimateControls');
        }
        break;
      case 'visuals':
        if (!showPlaneControls) {
          toggleElement('showPlaneControls');
        }
        break;
      case 'text':
        if (!showASCIIControls) {
          toggleElement('showASCIIControls');
          toggleElement('showASCIIPresets');
          toggleElement('showThemeControls');
        }
        break;
    }
  };

  const handleChatContentToggle = () => {
    const currentPosition = useCameraStore
      .getState()
      .getCurrentCameraPosition();

    if (!showChatContent) {
      switchToControl('text');
      // If we're at "Look At Computer", move forward to chat
      if (currentPosition?.name === 'Look At Computer') {
        cycleCameraPosition('next');
      }
      // If we're at "Look At Terminal", move backward to chat
      else if (currentPosition?.name === 'Look At Terminal') {
        cycleCameraPosition('previous');
      }
    }
    setShowChatContent(!showChatContent);
  };

  // Separate the audio icon color logic from the other buttons
  const getAudioButtonColor = () => {
    if (isPlaying) {
      return 'animate-pulse-slow';
    }
    return '';
  };

  const getAudioIconColor = () => {
    // Always use foreground color when playing, regardless of any other state
    if (isPlaying) return themeColors.foreground;
    // Otherwise follow normal state logic
    if (showChatContent) return themeColors.background;
    return showToneControls ? themeColors.foreground : themeColors.background;
  };

  // Keep the original function for other buttons
  const getButtonColor = (isActive: boolean) => {
    return showChatContent
      ? themeColors.background
      : isActive
      ? themeColors.foreground
      : themeColors.background;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button onClick={handleChatContentToggle} style={buttonStyle}>
        <FaCommentDots
          color={
            showChatContent ? themeColors.foreground : themeColors.background
          }
        />
      </button>
      {/* Move animation class check before any state checks */}
      <div
        className={`inline-flex items-center ${
          isPlaying ? 'animate-pulse-slow' : ''
        }`}
      >
        <button onClick={() => switchToControl('audio')} style={buttonStyle}>
          <FaVolumeUp color={getAudioIconColor()} />
        </button>
      </div>
      <button onClick={() => switchToControl('visuals')} style={buttonStyle}>
        <FaEye color={getButtonColor(showPlaneControls)} />
      </button>
      <button onClick={() => switchToControl('text')} style={buttonStyle}>
        <FaFont color={getButtonColor(showASCIIControls)} />
      </button>
    </div>
  );
};

export default LevaButtons;
