import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useThree, useFrame } from '@react-three/fiber';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import useToneStore from '../../../stores/toneStore';
import { useButterChurnStore } from '../../../stores/butterchurnStore';

const TEXTURE_WIDTH = 1024; // Power of 2
const TEXTURE_HEIGHT = 512; // Power of 2

const ButterChurnVisualizer: React.FC = () => {
  // Extract necessary state from the Tone store
  const { masterGain, visualizerMode } = useToneStore();

  // Access Three.js WebGL renderer properties
  const { gl } = useThree();

  // Refs to manage ButterChurn visualizer instances and canvas
  const butterChurnRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create a memoized texture that only updates when canvas dimensions change
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_WIDTH;
    canvas.height = TEXTURE_HEIGHT;
    canvasRef.current = canvas;

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.minFilter = THREE.LinearFilter;
    newTexture.magFilter = THREE.LinearFilter;
    return newTexture;
  }, []);

  // Subscribe to the current preset from butterchurnStore
  const currentPreset = useButterChurnStore((state) => state.currentPreset);

  // Initialize the ButterChurn Visualizer once when the component mounts
  useEffect(() => {
    if (visualizerMode !== 'butterchurn' || !masterGain) return;

    // Retrieve the raw AudioContext from Tone.js for ButterChurn
    const audioContext = Tone.getContext().rawContext as AudioContext;

    // Initialize the ButterChurn Visualizer if it doesn't exist
    if (!butterChurnRef.current) {
      const visualizer = butterchurn.createVisualizer(
        audioContext,
        canvasRef.current!,
        {
          width: canvasRef.current!.width,
          height: canvasRef.current!.height,
          pixelRatio: window.devicePixelRatio || 1,
          textureRatio: 1,
        },
      );
      butterChurnRef.current = visualizer;

      // Connect the visualizer to the master gain node for audio input
      visualizer.connectAudio(masterGain);

      // Load the initial preset
      const presets = butterchurnPresets.getPresets();
      const preset =
        presets[currentPreset] ||
        presets['Goody - The Wild Vort'] ||
        Object.values(presets)[0];

      if (preset) {
        const blendTime = 0.0; // No blending on initial load
        visualizer.loadPreset(preset, blendTime);
      }
    }

    // Cleanup function to dispose of the visualizer when the component unmounts
    return () => {
      if (butterChurnRef.current) {
        butterChurnRef.current = null;
      }
    };
  }, [visualizerMode, masterGain]);

  // Handle resizing in a separate useEffect
  useEffect(() => {
    if (butterChurnRef.current && canvasRef.current) {
      // Update canvas dimensions
      canvasRef.current.width = TEXTURE_WIDTH;
      canvasRef.current.height = TEXTURE_HEIGHT;

      // Update visualizer dimensions
      butterChurnRef.current.setRendererSize(TEXTURE_WIDTH, TEXTURE_HEIGHT);

      // Force texture update
      if (texture) {
        texture.needsUpdate = true;
      }
    }
  }, [gl.domElement.clientWidth, gl.domElement.clientHeight]);

  // Load or change the preset whenever currentPreset changes
  useEffect(() => {
    if (visualizerMode !== 'butterchurn' || !butterChurnRef.current) return;

    const presets = butterchurnPresets.getPresets();
    const preset =
      presets[currentPreset] ||
      presets['Goody - The Wild Vort'] ||
      Object.values(presets)[0];

    if (preset) {
      // Load the selected preset into the visualizer with a blending duration
      const blendTime = 1.0; // Adjust blend time as needed
      butterChurnRef.current.loadPreset(preset, blendTime);
    }
  }, [currentPreset, visualizerMode]);

  // Function to render the visualizer and update the texture
  const renderVisualizer = () => {
    if (butterChurnRef.current && texture) {
      butterChurnRef.current.render();
      texture.needsUpdate = true;
    }
  };

  // Use react-three-fiber's useFrame to integrate with the render loop
  useFrame(() => {
    renderVisualizer();
  });

  // Define the curved semi-circular geometry similar to CurvedBandVisualizer.tsx
  const geometry = useMemo(() => {
    const radius = 20;
    const height = 25;
    const radialSegments = 128;
    const heightSegments = 1;
    const openEnded = true;
    const thetaStart = 0;
    const thetaLength = Math.PI; // Half-circle

    const geo = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength,
    );
    geo.rotateX(Math.PI / 2); // Rotate to align vertically
    geo.translate(0, 0, -radius); // Adjust position to create a semi-circular plane
    return geo;
  }, []);

  // Render a mesh with the visualizer's texture applied
  return (
    <mesh
      geometry={geometry}
      position={[-0.05, 21, 0]}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      scale={[1, 1, 1]}
    >
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};

export default ButterChurnVisualizer;
