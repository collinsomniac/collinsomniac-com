/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useThree, extend, useFrame } from '@react-three/fiber';
import { EffectComposer, RenderPass, EffectPass } from 'postprocessing';
import { ASCIIEffect } from './ASCIIEffect';

extend({ EffectComposer, RenderPass, EffectPass });

interface AsciiRendererProps {
  enabled: boolean;
  characters: string;
  invert: boolean;
  color: string;
  backgroundColor: string;
  showBackground: boolean;
  backgroundVisibility: number;
  charactersVisibility: number;
  fontSize: number;
  cellSize: number;
  useCanvasColor: boolean;
  canvasColor: string;
}

const AsciiRenderer = ({
  enabled,
  characters,
  invert,
  color,
  backgroundColor,
  showBackground,
  backgroundVisibility,
  charactersVisibility,
  fontSize,
  cellSize,
  useCanvasColor,
  canvasColor,
}: AsciiRendererProps) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer>();
  const asciiEffectRef = useRef<ASCIIEffect>();
  const effectPassRef = useRef<EffectPass | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);

  const memoizedComposer = useMemo(() => {
    if (!gl || !scene || !camera || isContextLost) return null;

    try {
      const composer = new EffectComposer(gl);
      composer.addPass(new RenderPass(scene, camera));

      const asciiEffect = new ASCIIEffect({
        characters,
        color,
        invert,
        backgroundColor,
        showBackground,
        backgroundVisibility,
        charactersVisibility,
        fontSize,
        cellSize,
        useCanvasColor,
        canvasColor,
      });

      asciiEffectRef.current = asciiEffect;

      const effectPass = new EffectPass(camera, asciiEffect);
      effectPassRef.current = effectPass;
      composer.addPass(effectPass);

      // Set initial size
      composer.setSize(size.width, size.height);
      asciiEffect.setSize(size.width, size.height);

      return composer;
    } catch (error) {
      console.error('Error creating EffectComposer:', error);
      return null;
    }
  }, [
    gl,
    scene,
    camera,
    isContextLost,
    characters,
    color,
    invert,
    backgroundColor,
    showBackground,
    backgroundVisibility,
    charactersVisibility,
    fontSize,
    cellSize,
    useCanvasColor,
    canvasColor,
    size,
  ]);

  useEffect(() => {
    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault();
      setIsContextLost(true);
      console.warn('WebGL context lost');
    };

    const handleContextRestored = () => {
      setIsContextLost(false);
      console.log('WebGL context restored');
    };

    gl.domElement.addEventListener('webglcontextlost', handleContextLost);
    gl.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
    );

    return () => {
      gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
      gl.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
      );
    };
  }, [gl]);

  useEffect(() => {
    if (memoizedComposer) {
      composerRef.current = memoizedComposer;
    }
    return () => {
      if (composerRef.current) {
        composerRef.current.dispose();
      }
    };
  }, [memoizedComposer]);

  useEffect(() => {
    if (composerRef.current && asciiEffectRef.current) {
      composerRef.current.setSize(size.width, size.height);
      asciiEffectRef.current.setSize(size.width, size.height);
    }
  }, [size]);

  useEffect(() => {
    if (effectPassRef.current) {
      effectPassRef.current.enabled = enabled;
    }
  }, [enabled]);

  useFrame(() => {
    if (composerRef.current && !isContextLost) {
      if (enabled) {
        composerRef.current.render();
      } else {
        // Render the scene directly when the effect is disabled
        gl.render(scene, camera);
      }
    }
  }, 1);

  return null;
};

export default AsciiRenderer;
