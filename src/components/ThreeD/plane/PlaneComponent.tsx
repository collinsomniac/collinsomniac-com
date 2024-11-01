import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePlaneStore } from '../../../stores/planeStore';
import useToneStore from '../../../stores/toneStore';

interface PlaneComponentProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  geometry: {
    type: 'ellipse';
    width: number;
    height: number;
    segments?: number;
  };
  flipTexture?: boolean;
  splitTexture: boolean;
  isLeftHalf?: boolean;
}

const PlaneComponent: React.FC<PlaneComponentProps> = React.memo(
  ({
    position,
    rotation,
    scale,
    geometry,
    flipTexture = false,
    splitTexture,
    isLeftHalf = true,
  }) => {
    const {
      file,
      url,
      playing,
      showVisualizer,
      showVideoOnPlane, // Destructure showVideoOnPlane
      videoElement,
      currentTime,
      volume,
      updateVideoElement,
      setMediaType,
      setDuration,
      setPlaying,
      setFileDimensions,
    } = usePlaneStore();
    const { visualizerMode, getFFTData, getWaveformData } = useToneStore();
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [visualizerTexture, setVisualizerTexture] =
      useState<THREE.Texture | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [blendFactor, setBlendFactor] = useState(0);
    const lastFrameTimeRef = useRef(Date.now());
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const ellipseGeometry = useMemo(() => {
      const { width, height, segments = 64 } = geometry;
      const shape = new THREE.Shape();
      const vertices = [];
      const uvs = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = (Math.cos(theta) * width) / 2;
        const y = (Math.sin(theta) * height) / 2;
        vertices.push(new THREE.Vector3(x, y, 0));
        uvs.push(
          new THREE.Vector2(
            (Math.cos(theta) + 1) / 2,
            (Math.sin(theta) + 1) / 2,
          ),
        );
      }

      const geo = new THREE.BufferGeometry().setFromPoints(vertices);
      geo.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(
          uvs.flatMap((uv) => [uv.x, uv.y]),
          2,
        ),
      );
      geo.setIndex(
        Array.from({ length: segments }, (_, i) => [
          0,
          i + 1,
          i + 2 > segments ? 1 : i + 2,
        ]).flat(),
      );

      return geo;
    }, [geometry]);

    useEffect(() => {
      if (videoElement) {
        videoElement.volume = volume;
        if (playing) {
          videoElement.play().catch(console.error);
        } else {
          videoElement.pause();
        }
      }
    }, [playing, volume]);

    useEffect(() => {
      const setupTexture = (newTexture: THREE.Texture) => {
        if (texture) {
          texture.dispose();
        }
        setTexture(newTexture);
        newTexture.center.set(0.5, 0.5);
        newTexture.needsUpdate = true;
      };

      const loadTexture = async (source: {
        type: 'file' | 'url';
        data: File | string;
      }) => {
        if (texture) {
          texture.dispose();
        }

        if (source.type === 'file') {
          const file = source.data as File;
          const fileURL = URL.createObjectURL(file);
          if (file.type.startsWith('video')) {
            const video = document.createElement('video');
            video.src = fileURL;
            video.crossOrigin = 'Anonymous';
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.onloadeddata = () => {
              setDuration(video.duration);
              setFileDimensions({
                width: video.videoWidth,
                height: video.videoHeight,
              });
              const newTexture = new THREE.VideoTexture(video);
              newTexture.minFilter = THREE.LinearFilter;
              newTexture.magFilter = THREE.LinearFilter;
              newTexture.format = THREE.RGBFormat;
              setupTexture(newTexture);
              updateVideoElement(video);
              setMediaType('video');
              setPlaying(true);
            };
          }
        } else if (source.type === 'url') {
          const url = source.data as string;
          if (url.match(/\.(mp4|webm|ogg)$/)) {
            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = 'Anonymous';
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.onloadeddata = () => {
              setDuration(video.duration);
              setFileDimensions({
                width: video.videoWidth,
                height: video.videoHeight,
              });
              const newTexture = new THREE.VideoTexture(video);
              newTexture.minFilter = THREE.LinearFilter;
              newTexture.magFilter = THREE.LinearFilter;
              newTexture.format = THREE.RGBFormat;
              setupTexture(newTexture);
              updateVideoElement(video);
              setMediaType('video');
              setPlaying(true);
            };
          }
        }
      };

      if (file) {
        loadTexture({ type: 'file', data: file });
      } else if (url) {
        loadTexture({ type: 'url', data: url });
      }

      return () => {
        if (texture) {
          texture.dispose();
        }
        if (videoRef.current) {
          videoRef.current.src = '';
          videoRef.current = null;
        }
      };
    }, [
      file,
      url,
      updateVideoElement,
      setMediaType,
      setDuration,
      setPlaying,
      setFileDimensions,
    ]);

    useEffect(() => {
      if (texture) {
        if (flipTexture) {
          texture.repeat.set(-1, 1);
          texture.offset.set(flipTexture ? 1 : 0, 0);
        } else {
          texture.repeat.set(1, 1);
          texture.offset.set(0, 0);
        }

        if (splitTexture) {
          texture.repeat.set(texture.repeat.x * 0.5, texture.repeat.y);
          texture.offset.set(isLeftHalf ? 0 : 0.5, texture.offset.y);
        }

        texture.needsUpdate = true;
      }
    }, [flipTexture, splitTexture, isLeftHalf, texture]);

    useEffect(() => {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = 1024;
        canvasRef.current.height = 256;
      }

      if (showVisualizer) {
        visualizerCanvasRef.current = canvasRef.current;
        const newTexture = new THREE.CanvasTexture(canvasRef.current);
        setVisualizerTexture(newTexture);
      } else {
        setVisualizerTexture(null);
      }
    }, [showVisualizer]);

    const videoTexture = useMemo(() => {
      if (videoElement) {
        return new THREE.VideoTexture(videoElement);
      }
      return null;
    }, [videoElement]);

    if (!texture) return null;

    return (
      <mesh
        position={position}
        rotation={rotation}
        scale={scale}
        geometry={ellipseGeometry}
      >
        <meshBasicMaterial
          map={videoTexture}
          side={THREE.DoubleSide}
          transparent
          opacity={showVisualizer ? 1 - blendFactor : 1}
        />
        {showVisualizer && visualizerTexture && (
          <meshBasicMaterial
            map={visualizerTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={blendFactor}
            depthTest={false}
          />
        )}
      </mesh>
    );
  },
);

PlaneComponent.displayName = 'PlaneComponent';

export default React.memo(PlaneComponent);
