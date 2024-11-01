import { create } from 'zustand';
import * as THREE from 'three';

// Define specific prop types for each shape
type BoxProps = { width: number; height: number; depth: number };
type SphereProps = {
  radius: number;
  widthSegments: number;
  heightSegments: number;
};
type ConeProps = { radius: number; height: number; radialSegments: number };
type CylinderProps = {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
};
type TorusProps = {
  radius: number;
  tube: number;
  radialSegments: number;
  tubularSegments: number;
};
type TetrahedronProps = { radius: number; detail: number };
type OctahedronProps = { radius: number; detail: number };
type DodecahedronProps = { radius: number; detail: number };
type IcosahedronProps = { radius: number; detail: number };
type TorusKnotProps = {
  radius: number;
  tube: number;
  tubularSegments: number;
  radialSegments: number;
  p: number;
  q: number;
};

// Union type of all possible shape props
type ShapeProps =
  | BoxProps
  | SphereProps
  | ConeProps
  | CylinderProps
  | TorusProps
  | TetrahedronProps
  | OctahedronProps
  | DodecahedronProps
  | IcosahedronProps
  | TorusKnotProps;

// Define shape types
export const shapeTypes = [
  'Box',
  'Sphere',
  'Cone',
  'Cylinder',
  'Torus',
  'Tetrahedron',
  'Octahedron',
  'Dodecahedron',
  'Icosahedron',
  'TorusKnot',
] as const;

export type ShapeType = (typeof shapeTypes)[number];

// Define default props for each shape
const defaultShapeProps: Record<ShapeType, ShapeProps> = {
  Box: { width: 1, height: 1, depth: 1 },
  Sphere: { radius: 1, widthSegments: 32, heightSegments: 16 },
  Cone: { radius: 1, height: 1, radialSegments: 32 },
  Cylinder: { radiusTop: 1, radiusBottom: 1, height: 1, radialSegments: 32 },
  Torus: { radius: 1, tube: 0.4, radialSegments: 16, tubularSegments: 100 },
  Tetrahedron: { radius: 1, detail: 0 },
  Octahedron: { radius: 1, detail: 0 },
  Dodecahedron: { radius: 1, detail: 0 },
  Icosahedron: { radius: 1, detail: 0 },
  TorusKnot: {
    radius: 1,
    tube: 0.4,
    tubularSegments: 64,
    radialSegments: 8,
    p: 2,
    q: 3,
  },
};

// Function to create geometry based on shape type and props
export const createGeometry = (
  type: ShapeType,
  props: ShapeProps,
): THREE.BufferGeometry => {
  switch (type) {
    case 'Box':
      return new THREE.BoxGeometry(
        (props as BoxProps).width,
        (props as BoxProps).height,
        (props as BoxProps).depth,
      );
    case 'Sphere':
      return new THREE.SphereGeometry(
        (props as SphereProps).radius,
        (props as SphereProps).widthSegments,
        (props as SphereProps).heightSegments,
      );
    case 'Cone':
      return new THREE.ConeGeometry(
        (props as ConeProps).radius,
        (props as ConeProps).height,
        (props as ConeProps).radialSegments,
      );
    case 'Cylinder':
      return new THREE.CylinderGeometry(
        (props as CylinderProps).radiusTop,
        (props as CylinderProps).radiusBottom,
        (props as CylinderProps).height,
        (props as CylinderProps).radialSegments,
      );
    case 'Torus':
      return new THREE.TorusGeometry(
        (props as TorusProps).radius,
        (props as TorusProps).tube,
        (props as TorusProps).radialSegments,
        (props as TorusProps).tubularSegments,
      );
    case 'Tetrahedron':
      return new THREE.TetrahedronGeometry(
        (props as TetrahedronProps).radius,
        (props as TetrahedronProps).detail,
      );
    case 'Octahedron':
      return new THREE.OctahedronGeometry(
        (props as OctahedronProps).radius,
        (props as OctahedronProps).detail,
      );
    case 'Dodecahedron':
      return new THREE.DodecahedronGeometry(
        (props as DodecahedronProps).radius,
        (props as DodecahedronProps).detail,
      );
    case 'Icosahedron':
      return new THREE.IcosahedronGeometry(
        (props as IcosahedronProps).radius,
        (props as IcosahedronProps).detail,
      );
    case 'TorusKnot':
      return new THREE.TorusKnotGeometry(
        (props as TorusKnotProps).radius,
        (props as TorusKnotProps).tube,
        (props as TorusKnotProps).tubularSegments,
        (props as TorusKnotProps).radialSegments,
        (props as TorusKnotProps).p,
        (props as TorusKnotProps).q,
      );
    default:
      return new THREE.BoxGeometry();
  }
};

interface ShapeState {
  shapeType: ShapeType;
  shapeProps: ShapeProps;
  setShapeType: (type: ShapeType) => void;
  setShapeProps: <T extends ShapeProps>(props: Partial<T>) => void;
}

export const useShapeStore = create<ShapeState>((set) => ({
  shapeType: 'Box',
  shapeProps: defaultShapeProps['Box'],
  setShapeType: (type) =>
    set((state) => ({
      shapeType: type,
      shapeProps: defaultShapeProps[type],
    })),
  setShapeProps: (props) =>
    set((state) => ({
      shapeProps: { ...state.shapeProps, ...props },
    })),
}));
