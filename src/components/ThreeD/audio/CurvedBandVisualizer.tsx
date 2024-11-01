import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useToneStore from '../../../stores/toneStore';

interface CurvedBandVisualizerProps {
  visualizerMode: 'line' | 'circle' | 'none';
}

const CurvedBandVisualizer: React.FC<CurvedBandVisualizerProps> = ({
  visualizerMode,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { getWaveformData, isPlaying } = useToneStore();

  const geometry = useMemo(() => {
    const radius = 20;
    const height = 15;
    const radialSegments = 128;
    const heightSegments = 1;
    const openEnded = true;
    const thetaStart = 0;
    const thetaLength = Math.PI;

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
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, -radius);
    return geo;
  }, []);

  const [lastActiveTime, setLastActiveTime] = useState(0);
  const [fadeStartTime, setFadeStartTime] = useState(0);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    canvasRef.current = canvas;

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.wrapS = THREE.ClampToEdgeWrapping;
    newTexture.wrapT = THREE.ClampToEdgeWrapping;
    newTexture.minFilter = THREE.LinearFilter;
    newTexture.magFilter = THREE.LinearFilter;
    textureRef.current = newTexture;

    if (meshRef.current) {
      meshRef.current.material = new THREE.MeshBasicMaterial({
        map: newTexture,
        side: THREE.DoubleSide,
        transparent: true,
      });
    }
  }, []);

  useFrame(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !textureRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (visualizerMode === 'none') {
      textureRef.current.needsUpdate = true;
      return;
    }

    const waveformData = getWaveformData();
    const currentTime = Date.now();

    if (isPlaying && lastActiveTime === 0) {
      setLastActiveTime(currentTime);
      setFadeStartTime(currentTime);
    } else if (!isPlaying && lastActiveTime !== 0) {
      setLastActiveTime(0);
      setFadeStartTime(currentTime);
    }

    const timeSinceFadeStart = (currentTime - fadeStartTime) / 1000; // Convert to seconds
    const fadeInOpacity = Math.min(1, timeSinceFadeStart / 0.6); // Fade in over 0.6 seconds
    const fadeOutOpacity = Math.max(0, 1 - timeSinceFadeStart / 1.6); // Fade out over 1.6 seconds
    const opacity = isPlaying ? fadeInOpacity : fadeOutOpacity;

    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (visualizerMode === 'line') {
      for (let i = 0; i < waveformData.length; i++) {
        const x = (i / waveformData.length) * canvas.width;
        const y = ((waveformData[i] + 1) / 2) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (visualizerMode === 'circle') {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      for (let i = 0; i < waveformData.length; i++) {
        const angle = (i / waveformData.length) * Math.PI * 2;
        const amplitude = waveformData[i] * radius * 0.5;
        const x = centerX + Math.cos(angle) * (radius + amplitude);
        const y = centerY + Math.sin(angle) * (radius + amplitude);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    textureRef.current.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[-0.05, 21, 0]}
      rotation={[-(Math.PI / 2), 0, Math.PI / 2]}
    >
      <meshBasicMaterial side={THREE.DoubleSide} transparent />
    </mesh>
  );
};

export default CurvedBandVisualizer;
