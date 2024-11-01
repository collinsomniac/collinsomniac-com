import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useToneStore from '../../../stores/toneStore';

interface CircularVisualizerProps {
  position: [number, number, number];
  scale: number;
}

const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  position,
  scale,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { getWaveformData } = useToneStore();

  useEffect(() => {
    if (meshRef.current) {
      const geometry = new THREE.CircleGeometry(3, 64);
      meshRef.current.geometry = geometry;
    }
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      const waveformData = getWaveformData();
      const positions = meshRef.current.geometry.attributes.position;
      const count = positions.count;

      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const index = Math.floor((i / count) * waveformData.length);
        const r = 3 + waveformData[index] * 0.9;
        positions.setXY(i, r * Math.cos(theta), r * Math.sin(theta));
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <meshBasicMaterial side={THREE.DoubleSide} wireframe color="white" />
    </mesh>
  );
};

export default CircularVisualizer;
