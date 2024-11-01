/* eslint-disable prettier/prettier */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls, folder } from 'leva';
import {
  createGeometry,
  ShapeType,
  useShapeStore,
} from '../../../stores/shapeStore';
import * as THREE from 'three';
import { useThreeDStore } from '../../../stores/threeDStore';

type ShapeProps = {
  position: [number, number, number];
  color: string;
};

const Shape = ({ position, color }: ShapeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { shapeType, shapeProps, setShapeProps, setShapeType } =
    useShapeStore();
  const { showShapes } = useThreeDStore();

  // Leva controls for rotation speeds
  const { x, y, z } = useControls('Rotation Speeds', {
    x: { value: 0.01, min: -0.1, max: 0.1, step: 0.001 },
    y: { value: 0.01, min: -0.1, max: 0.1, step: 0.001 },
    z: { value: 0.01, min: -0.1, max: 0.1, step: 0.001 },
  });

  // Conditional controls for shape type and properties
  useControls(
    'Shape Controls',
    () => {
      if (!showShapes) return {};

      return {
        shapeType: {
          value: shapeType,
          options: ['Box', 'Sphere', 'Cone', 'Cylinder', 'Torus', 'TorusKnot'],
          onChange: (value: ShapeType) => setShapeType(value),
        },
        ...Object.entries(shapeProps).reduce((acc, [key, value]) => {
          acc[key] = {
            value: value,
            min: 0.1,
            max: 25,
            step: 0.1,
            onChange: (v: number) => setShapeProps({ [key]: v }),
          };
          return acc;
        }, {} as Record<string, any>),
      };
    },
    [showShapes, shapeType, shapeProps],
  );

  // Update rotation of the mesh based on frame updates
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += x;
      meshRef.current.rotation.y += y;
      meshRef.current.rotation.z += z;
    }
  });

  // Create geometry based on the type and arguments
  const geometry = createGeometry(shapeType, shapeProps);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Shape;
