/* eslint-disable prettier/prettier */
// geometries.ts
import * as THREE from 'three';

// Array of available shape types
export const shapeTypes = [
  'Box',
  'Sphere',
  'Cone',
  'Cylinder',
  'Torus',
  'Tetrahedron',
  'Octahedron',
  'Icosahedron',
  'Dodecahedron',
  'TorusKnot',
] as const;

export type ShapeType = (typeof shapeTypes)[number];

// Function to create a geometry based on the shape type and arguments
export const createGeometry = (type: ShapeType, args: number[]) => {
  switch (type) {
    case 'Box':
      return new THREE.BoxGeometry(...args);
    case 'Sphere':
      return new THREE.SphereGeometry(...args);
    case 'Cone':
      return new THREE.ConeGeometry(...args);
    case 'Cylinder':
      return new THREE.CylinderGeometry(...args);
    case 'Torus':
      return new THREE.TorusGeometry(...args);
    case 'Tetrahedron':
      return new THREE.TetrahedronGeometry(...args);
    case 'Octahedron':
      return new THREE.OctahedronGeometry(...args);
    case 'Icosahedron':
      return new THREE.IcosahedronGeometry(...args);
    case 'Dodecahedron':
      return new THREE.DodecahedronGeometry(...args);
    case 'TorusKnot':
      return new THREE.TorusKnotGeometry(...args);
    default:
      return new THREE.BoxGeometry(...args);
  }
};

// Ensure all shape types have corresponding default props
export const defaultShapeProps: Record<ShapeType, Record<string, number>> = {
  Box: { width: 1, height: 1, depth: 1 },
  Sphere: { radius: 1, widthSegments: 32, heightSegments: 16 },
  Cone: { radius: 1, height: 1, radialSegments: 8, heightSegments: 1 },
  Cylinder: {
    radiusTop: 1,
    radiusBottom: 1,
    height: 1,
    radialSegments: 8,
    heightSegments: 1,
  },
  Torus: { radius: 1, tube: 0.4, radialSegments: 8, tubularSegments: 64 },
  Tetrahedron: { radius: 1, detail: 0 },
  Octahedron: { radius: 1, detail: 0 },
  Icosahedron: { radius: 1, detail: 0 },
  Dodecahedron: { radius: 1, detail: 0 },
  TorusKnot: {
    radius: 1,
    tube: 0.4,
    tubularSegments: 64,
    radialSegments: 8,
    p: 2,
    q: 3,
  },
};
