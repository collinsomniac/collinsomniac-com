/* eslint-disable prettier/prettier */
import React from 'react';
import { useControls, button, folder } from 'leva';
import { usePlaneStore } from '../../../stores/planeStore';
import useToneStore from '../../../stores/toneStore';
import { useThreeDStore } from '../../../stores/threeDStore';

// Define the list of pre-defined media categorized into images and videos
const predefinedMedia = {
  images: [
    // Add images here if present in the new structure
    { name: 'Beach Image', type: 'image', url: '/media/beach.jpg' },
    { name: 'Sunset Image', type: 'image', url: '/media/sunset.jpg' },
  ],
  videos: [
    // Adding the new videos based on the provided screenshots
    {
      name: 'Ghost Melt (Bright)',
      type: 'video',
      url: '/media/skull_eyes/vids/ghostmelt-bright.mp4',
    },
    {
      name: 'Ghost Melt (Dim)',
      type: 'video',
      url: '/media/skull_eyes/vids/ghostmelt-dim.mp4',
    },
    {
      name: 'Ghost Melt (Soft)',
      type: 'video',
      url: '/media/skull_eyes/vids/ghostmelt-soft.mp4',
    },
    {
      name: 'Grid (7x7)',
      type: 'video',
      url: '/media/skull_eyes/vids/grid-7x7.mp4',
    },
    {
      name: 'Glitch Sphere (1)',
      type: 'video',
      url: '/media/skull_eyes/vids/glitchsphere-1.mp4',
    },
    {
      name: 'Glitch Sphere (2)',
      type: 'video',
      url: '/media/skull_eyes/vids/glitchsphere-2.mp4',
    },
    {
      name: 'Glitch Sphere (3)',
      type: 'video',
      url: '/media/skull_eyes/vids/glitchsphere-3.mp4',
    },
    {
      name: 'Glitch Sphere (4)',
      type: 'video',
      url: '/media/skull_eyes/vids/glitchsphere-4.mp4',
    },
    {
      name: 'Kaleidoscope Diamond (50%)',
      type: 'video',
      url: '/media/skull_eyes/vids/kaleidoscope-diamond-50.mp4',
    },
    {
      name: 'Kaleidoscope Diamond (100%)',
      type: 'video',
      url: '/media/skull_eyes/vids/kaleidoscope-diamond-100.mp4',
    },
    {
      name: 'Kaleidoscope Octogon (50%)',
      type: 'video',
      url: '/media/skull_eyes/vids/kaleidoscope-octogon-50.mp4',
    },
    {
      name: 'Kaleidoscope Octogon (100%)',
      type: 'video',
      url: '/media/skull_eyes/vids/kaleidoscope-octogon-100.mp4',
    },
    {
      name: 'Kaleidoscope (1)',
      type: 'video',
      url: '/media/skull_eyes/vids/kaleidoscope-diamond-50.mp4',
    },
    {
      name: 'Rorschach Kaleidoscope (50%)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-kaleidoscope-50.mp4',
    },
    {
      name: 'Rorschach Kaleidoscope (100%)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-kaleidoscope-100.mp4',
    },
    {
      name: 'Rorschach (Basic)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-basic.mp4',
    },
    {
      name: 'Rorschach (RGB)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-rgb.mp4',
    },
    {
      name: 'Rorschach (Spiral)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-spiral.mp4',
    },
    {
      name: 'Rorschach X (1)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-x-1.mp4',
    },
    {
      name: 'Rorschach X (2)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-x-2.mp4',
    },
    {
      name: 'Rorschach X (3)',
      type: 'video',
      url: '/media/skull_eyes/vids/rorschach-x-3.mp4',
    },
    {
      name: 'Wisps (50%)',
      type: 'video',
      url: '/media/skull_eyes/vids/wisps-50.mp4',
    },
    {
      name: 'Wisps (100%)',
      type: 'video',
      url: '/media/skull_eyes/vids/wisps-100.mp4',
    },
  ],
};

// Function to generate button controls for media items
const generateMediaButtons = (
  mediaItems: typeof predefinedMedia.images | typeof predefinedMedia.videos,
): Record<string, any> => {
  const buttons: Record<string, any> = {};
  mediaItems.forEach((media) => {
    buttons[media.name] = button(() => {
      // Reset existing media state
      usePlaneStore.getState().resetState();
      // Set the new media URL
      usePlaneStore.getState().setUrl(media.url);
    });
  });
  return buttons;
};

const PlaneConfig: React.FC = () => {
  const { flipTexture, splitTexture, setFlipTexture, setSplitTexture } =
    usePlaneStore();
  const { visualizerMode, setVisualizerMode } = useToneStore();
  const { showPlaneControls } = useThreeDStore();

  // Upload handler for media files
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      usePlaneStore.getState().resetState();
      usePlaneStore.getState().setFile(event.target.files[0]);
    }
  };

  // Button to trigger file upload
  const uploadButton = button(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = handleFileChange as any;
    input.click();
  });

  // Generate buttons for pre-defined images and videos
  const imageButtons = generateMediaButtons(predefinedMedia.images);
  const videoButtons = generateMediaButtons(predefinedMedia.videos);

  useControls(
    'Eye Presets',
    {
      ...videoButtons,
    },
    { collapsed: true },
  );

  return null;
};

export default PlaneConfig;
