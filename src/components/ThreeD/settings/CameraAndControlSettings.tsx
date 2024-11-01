import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '../../../stores/cameraStore';
import { useControls, folder, button } from 'leva';
import { debounce } from 'lodash';
import { useASCIIStore } from '../../../stores/asciiStore';
import { useThreeDStore } from '../../../stores/threeDStore';
import { toggleElement } from '../../../utils/bin';
import { SpringValue, useSpring, animated } from '@react-spring/three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraWithControlsProps {
  children: React.ReactNode;
  isPlaneComponent?: boolean;
  enabled?: boolean;
  onCreated?: () => void;
}

const CameraWithControls: React.FC<CameraWithControlsProps> = ({
  children,
  isPlaneComponent = false,
  enabled = true,
  onCreated,
}) => {
  const {
    position,
    target,
    controlType,
    fullscreenEnabled,
    fov,
    animateTransitions,
    enableRotate,
    enablePan,
    cycleCameraPosition, // Utilize the store's function
    setPosition,
    setTarget,
    setFullscreenEnabled,
    setFov,
    setAnimateTransitions,
    updateCameraPositionAndTarget: storeUpdateCameraPositionAndTarget,
  } = useCameraStore();

  const { setShowBackground, setCharactersVisibility } = useASCIIStore();
  const { gl, camera } = useThree();

  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Existing spring for camera position and target
  const springConfig = {
    mass: 0.2,
    tension: 375,
    precision: 0.01,
  };

  interface SpringProps {
    pos: SpringValue<[number, number, number]>;
    tar: SpringValue<[number, number, number]>;
  }

  const [springProps, api] = useSpring<SpringProps>(
    () => ({
      pos: position,
      tar: target,
      config: springConfig,
      immediate: isUserInteracting || !animateTransitions,
      onChange: ({ value }: { value: SpringProps }) => {
        if (!isUserInteracting && orbitControlsRef.current) {
          orbitControlsRef.current.object.position.set(
            value.pos[0],
            value.pos[1],
            value.pos[2],
          );
          orbitControlsRef.current.target.set(
            value.tar[0],
            value.tar[1],
            value.tar[2],
          );
          orbitControlsRef.current.update();
        }
      },
    }),
    [position, target, isUserInteracting, animateTransitions],
  );

  // New spring for OrbitControls interactions
  const [orbitSpring, orbitApi] = useSpring<{
    pos: [number, number, number];
    tar: [number, number, number];
  }>(() => ({
    pos: position,
    tar: target,
    config: {
      mass: 1,
      tension: 500,
      friction: 50,
    },
  }));

  // Debounced setters for performance optimization
  const debouncedSetPosition = useCallback(
    debounce((newPosition: [number, number, number]) => {
      setPosition(newPosition);
    }, 2),
    [setPosition],
  );

  const debouncedSetTarget = useCallback(
    debounce((newTarget: [number, number, number]) => {
      setTarget(newTarget);
    }, 2),
    [setTarget],
  );

  // Function to update camera position and target with animations
  const updateCameraPositionAndTarget = useCallback(
    (
      newPosition: [number, number, number],
      newTarget: [number, number, number],
    ) => {
      return new Promise<void>((resolve) => {
        if (animateTransitions && !isUserInteracting) {
          api.start({
            pos: newPosition,
            tar: newTarget,
            onRest: () => resolve(),
          });
        } else {
          api.set({ pos: newPosition, tar: newTarget });
          resolve();
        }
        // Update the store values immediately
        setPosition(newPosition);
        setTarget(newTarget);
      });
    },
    [animateTransitions, isUserInteracting, api, setPosition, setTarget],
  );

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    if (mounted) {
      cycleCameraPosition('next');
      timer = setTimeout(() => {
        if (mounted) {
          cycleCameraPosition('previous');
        }
      }, 1000);
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [cycleCameraPosition]);

  // Call onCreated when component is mounted
  useEffect(() => {
    if (onCreated) {
      onCreated();
    }
  }, [onCreated]);

  /**
   * Render OrbitControls with added spring physics
   */
  const renderControls = () => {
    return (
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enabled={enabled}
        enablePan={enablePan}
        enableZoom={false}
        enableRotate={enableRotate}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        onStart={() => {
          setIsUserInteracting(true);
          api.stop(); // Stop existing camera spring during user interaction
        }}
        onEnd={() => {
          setIsUserInteracting(false);
          if (orbitControlsRef.current) {
            const newPosition =
              orbitControlsRef.current.object.position.toArray() as [
                number,
                number,
                number,
              ];
            const newTarget = orbitControlsRef.current.target.toArray() as [
              number,
              number,
              number,
            ];
            // Update both springs to maintain consistency
            api.start({ pos: newPosition, tar: newTarget });
            orbitApi.start({ pos: newPosition, tar: newTarget });
            updateCameraPositionAndTarget(newPosition, newTarget);
          }
        }}
        onChange={() => {
          if (orbitControlsRef.current && isUserInteracting) {
            const newPosition =
              orbitControlsRef.current.object.position.toArray() as [
                number,
                number,
                number,
              ];
            const newTarget = orbitControlsRef.current.target.toArray() as [
              number,
              number,
              number,
            ];
            // Update positions using both springs
            api.start({ pos: newPosition, tar: newTarget });
            orbitApi.start({ pos: newPosition, tar: newTarget });
            debouncedSetPosition(newPosition);
            debouncedSetTarget(newTarget);
          }
        }}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        // Additional properties to allow scrolling
        enableDamping={false}
        listenToKeyEvents={null}
        screenSpacePanning={false}
      />
    );
  };

  return (
    <>
      {renderControls()}
      <PerspectiveCamera
        makeDefault
        fov={fov}
        position={[springProps.pos[0], springProps.pos[1], springProps.pos[2]]}
      />
      <animated.group position={springProps.tar} />
      {children}
    </>
  );
};

export default CameraWithControls;
