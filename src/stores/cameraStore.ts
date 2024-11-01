import { create } from 'zustand';
import { toggleElement } from '../utils/bin';
import { useThreeDStore } from './threeDStore';
import { useASCIIStore } from './asciiStore';

type Vector3 = [number, number, number];

interface CameraPosition {
  position: Vector3;
  target: Vector3;
  name: string;
  fov: number;
  showChat?: boolean;
  lookTrack?: boolean;
  hoverIdle?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  lampOn?: boolean;
  speakersPopped?: boolean;
  cropView?: boolean;
}

// Updated cameraPositions with fov, lookTrack, and hoverIdle
const cameraPositions: CameraPosition[] = [
  //  { position: [0, 5.00, 30], target: [0, -5.0, -1], name: 'View At Distance', fov: 45, lookTrack: true, hoverIdle: false, enableRotate: false, enablePan: false, lampOn: true, speakersPopped: false },
  //  { position: [0, 1.00, 7.5], target: [0, -1.6, -1], name: 'Look At Desk', fov: 45, lookTrack: true, hoverIdle: true, enableRotate: true, enablePan: false, lampOn: true, speakersPopped: false },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lookTrack: true,
    hoverIdle: true,
    enableRotate: false,
    enablePan: false,
    lampOn: true,
    speakersPopped: false,
  },
  {
    position: [0, 0.08, 1.8],
    target: [0, -0.04, -1.8],
    name: 'Look At Chat',
    fov: 45,
    lookTrack: true,
    hoverIdle: true,
    enableRotate: false,
    enablePan: false,
    lampOn: true,
    speakersPopped: false,
  },
  {
    position: [0, 0.08, 0.5],
    target: [0, -0.04, -2.5],
    name: 'Look At Terminal',
    fov: 45,
    lookTrack: true,
    hoverIdle: true,
    enableRotate: false,
    enablePan: false,
    lampOn: true,
    speakersPopped: false,
  },
  //  { position: [0, 0.20, -0.20], target: [0, 0.15, -2.5], name: 'Look At Eyes', fov: 45, lookTrack: false, hoverIdle: true, enableRotate: false, enablePan: false, lampOn: true, speakersPopped: false },
  // Add more positions as needed
];

const soundCameraPositions: CameraPosition[] = [
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  //  { position: [2, 0.08, 1.8], target: [-0.5, -0.04, -1.8], name: 'Look At Computer Left1', fov: 45, lampOn: true, speakersPopped: true },
  {
    position: [2, 0.08, 1.8],
    target: [-0.5, -0.04, -1.8],
    name: 'Look At Computer Left1',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  //  { position: [-2, 0.08, 1.8], target: [0.5, -0.04, -1.8], name: 'Look At Computer Right1', fov: 45, lampOn: true, speakersPopped: true },
  {
    position: [-2, 0.08, 1.8],
    target: [0.5, -0.04, -1.8],
    name: 'Look At Computer Right1',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, 0.08, 1.8],
    target: [0, -0.04, -1.8],
    name: 'Look At Screen/Skull',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, 0.08, 1.8],
    target: [0, -0.04, -1.8],
    name: 'Look At Screen/Skull',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer Lampoff',
    fov: 45,
    lampOn: false,
    speakersPopped: false,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -1.75, 6],
    target: [0, -1.21, -1],
    name: 'Look Up At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, -0.75, 6],
    target: [0, -1.21, -1],
    name: 'Look At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  {
    position: [0, 1.25, 6],
    target: [0, -1.3, -1],
    name: 'Look Down At Computer',
    fov: 45,
    lampOn: true,
    speakersPopped: true,
  },
  //  { position: [0, 0.20, -0.20], target: [0, 0.15, -2.5], name: 'Look At Eyes', fov: 45, lookTrack: false, hoverIdle: true, enableRotate: false, enablePan: false },
];

interface CameraState {
  cameraPositions: CameraPosition[];
  soundCameraPositions: CameraPosition[];
  currentPositionIndex: number;
  currentSoundPositionIndex: number;
  position: Vector3;
  target: Vector3;
  controlType: 'OrbitControls' | 'PointerLockControls';
  cameraControlsEnabled: boolean;
  fullscreenEnabled: boolean;
  isZoomed: boolean;
  zoomTarget: Vector3 | null;
  fov: number;
  animateTransitions: boolean;
  isAnimating: boolean;
  isSoundAnimationEnabled: boolean;
  lookTrack: boolean;
  hoverIdle: boolean;
  enableRotate: boolean;
  enablePan: boolean;
  triggerFrequencies: number[];
  isLampOn: boolean;
  speakersPopped: boolean;
  beatThreshold: number;
  noveltyThreshold: number;
  beatEnergyThreshold: number;
  frequencyThreshold: number;
  lastCameraChangeTime: number;
  cameraChangeCooldown: number;
  lastDirectionChangeTime: number;
  directionChangeCooldown: number;
  skullRotationSpeed: number;
  setSpeakersPopped: (popped: boolean) => void;
  setIsLampOn: (isOn: boolean) => void;
  setPosition: (position: Vector3) => void;
  setTarget: (target: Vector3) => void;
  setControlType: (
    controlType: 'OrbitControls' | 'PointerLockControls',
  ) => void;
  setCameraControlsEnabled: (enabled: boolean) => void;
  setFullscreenEnabled: (enabled: boolean) => void;
  setIsZoomed: (isZoomed: boolean) => void;
  setZoomTarget: (target: Vector3 | null) => void;
  updateCamera: (position: Vector3, target: Vector3) => void;
  updateCameraSettings: (
    position: Vector3,
    target: Vector3,
    fov: number,
  ) => void;
  resetCamera: () => void;
  setFov: (fov: number) => void;
  setAnimateTransitions: (animate: boolean) => void;
  updateCameraPositionAndTarget: (
    position: Vector3,
    target: Vector3,
    animate: boolean,
  ) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  disableCameraControlsAfterAnimation: () => void;
  setLookTrack: (value: boolean) => void;
  setHoverIdle: (value: boolean) => void;
  setIsSoundAnimationEnabled: (enabled: boolean) => void;
  setTriggerFrequencies: (frequencies: number[]) => void;
  cycleCameraPosition: (direction: 'next' | 'previous') => void;
  cycleSoundCameraPosition: (direction: 'next' | 'previous') => void;
  setCameraChangeCooldown: (cooldown: number) => void;
  setBeatThreshold: (value: number) => void;
  setNoveltyThreshold: (value: number) => void;
  setBeatEnergyThreshold: (value: number) => void;
  setFrequencyThreshold: (value: number) => void;
  setDirectionChangeCooldown: (cooldown: number) => void;
  resetCameraState: () => void;
  getCurrentCameraPosition: () => CameraPosition | null;
  addCameraPosition: (payload: CameraPosition) => void;
  removeCameraPosition: (index: number) => void;
  setSkullRotationSpeed: (speed: number) => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  cameraPositions,
  soundCameraPositions,
  currentPositionIndex: 0,
  currentSoundPositionIndex: 0,
  position: [0, -1, 65],
  target: [0, -2, -1],
  controlType: 'OrbitControls',
  cameraControlsEnabled: true,
  fullscreenEnabled: false,
  isZoomed: false,
  zoomTarget: null,
  fov: 45,
  animateTransitions: true,
  isAnimating: false,
  isSoundAnimationEnabled: true,
  lookTrack: false,
  hoverIdle: false,
  enableRotate: false,
  enablePan: false,
  triggerFrequencies: [700, 5000, 30000],
  isLampOn: true,
  speakersPopped: false,
  beatThreshold: 0.99, // high threshold to disable on startup
  noveltyThreshold: 0.5,
  beatEnergyThreshold: 0.5,
  frequencyThreshold: 4000,
  lastCameraChangeTime: 0,
  cameraChangeCooldown: 60,
  lastDirectionChangeTime: 0,
  directionChangeCooldown: 60,
  skullRotationSpeed: 0,

  // Setters for various state properties
  setSpeakersPopped: (popped) => set({ speakersPopped: popped }),
  setIsLampOn: (isOn) => set({ isLampOn: isOn }),
  setPosition: (position) => set({ position }),
  setTarget: (target) => set({ target }),
  setControlType: (controlType) => set({ controlType }),
  setCameraControlsEnabled: (enabled) =>
    set({ cameraControlsEnabled: enabled }),
  setFullscreenEnabled: (enabled) => set({ fullscreenEnabled: enabled }),
  setIsZoomed: (isZoomed) => set({ isZoomed }),
  setZoomTarget: (target) => set({ zoomTarget: target }),
  updateCamera: (position, target) => set({ position, target }),
  updateCameraSettings: (position, target, fov) =>
    set({ position, target, fov }),
  resetCamera: () =>
    set({
      position: [0, -0.75, 6],
      target: [0, -1.21, -1],
      controlType: 'OrbitControls',
      cameraControlsEnabled: true,
      fullscreenEnabled: false,
      isZoomed: false,
      zoomTarget: null,
      fov: 45,
      lookTrack: false,
      hoverIdle: false,
    }),
  setFov: (fov) => set({ fov }),
  setAnimateTransitions: (animate) => set({ animateTransitions: animate }),
  updateCameraPositionAndTarget: (position, target, animate) =>
    set((state) => ({
      position,
      target,
      isAnimating: animate && state.animateTransitions,
    })),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  disableCameraControlsAfterAnimation: () =>
    set((state) => ({
      cameraControlsEnabled: false,
      isAnimating: false,
    })),
  setLookTrack: (value) => set({ lookTrack: value }),
  setHoverIdle: (value) => set({ hoverIdle: value }),
  setIsSoundAnimationEnabled: (enabled) =>
    set({ isSoundAnimationEnabled: enabled }),
  setTriggerFrequencies: (frequencies) =>
    set({ triggerFrequencies: frequencies }),

  // Cycle through camera positions
  cycleCameraPosition: (direction) => {
    const { currentPositionIndex } = get();
    let newIndex: number | null = null;

    if (direction === 'next') {
      if (currentPositionIndex < cameraPositions.length - 1) {
        newIndex = currentPositionIndex + 1;
      } else {
        console.warn('Already at the last camera position.');
        return;
      }
    } else if (direction === 'previous') {
      if (currentPositionIndex > 0) {
        newIndex = currentPositionIndex - 1;
      } else {
        console.warn('Already at the first camera position.');
        return;
      }
    }

    if (newIndex !== null) {
      set({ currentPositionIndex: newIndex });
      const newPosition = cameraPositions[newIndex];
      const threeDStore = useThreeDStore.getState();
      const currentShowTerminal = threeDStore.showTerminal;
      const currentShowChat = threeDStore.showChat;
      const {
        updateCameraPositionAndTarget,
        setFov,
        setLookTrack,
        setHoverIdle,
      } = get();
      const { setShowBackground, setCharactersVisibility } =
        useASCIIStore.getState();

      // Update FOV
      setFov(newPosition.fov);

      // Update LookTrack and HoverIdle
      setLookTrack(newPosition.lookTrack ?? false);
      setHoverIdle(newPosition.hoverIdle ?? false);

      // Update enableRotate and enablePan
      set({
        enableRotate: newPosition.enableRotate,
        enablePan: newPosition.enablePan,
      });

      // Update isLampOn and speakersPopped based on newPosition
      if (newPosition.lampOn !== undefined) {
        set({ isLampOn: newPosition.lampOn });
      }

      if (newPosition.speakersPopped !== undefined) {
        set({ speakersPopped: newPosition.speakersPopped });
      }

      if (newPosition.name === 'Look At Terminal') {
        if (!currentShowTerminal) {
          toggleElement('showTerminal');
        }
        if (currentShowChat) {
          toggleElement('showChat'); // Reset chat if active
        }
        threeDStore.setShowChatContent(false); // Ensure chat content is hidden
        Promise.resolve(
          updateCameraPositionAndTarget(
            newPosition.position,
            newPosition.target,
            true,
          ),
        ).then(() => {
          setShowBackground(false);
          setCharactersVisibility(1.0);
        });
      } else if (newPosition.name === 'Look At Chat') {
        if (!currentShowChat) {
          toggleElement('showChat');
        }
        if (currentShowTerminal) {
          toggleElement('showTerminal'); // Reset terminal if active
        }
        threeDStore.setShowChatContent(true); // Show chat content when entering chat view
        Promise.resolve(
          updateCameraPositionAndTarget(
            newPosition.position,
            newPosition.target,
            true,
          ),
        ).then(() => {
          setShowBackground(true);
          setCharactersVisibility(1.0);
        });
      } else {
        // Reset both states when in other positions
        if (currentShowTerminal) {
          toggleElement('showTerminal');
        }
        if (currentShowChat) {
          toggleElement('showChat');
        }
        threeDStore.setShowChatContent(false); // Ensure chat content is hidden
        updateCameraPositionAndTarget(
          newPosition.position,
          newPosition.target,
          true,
        );
        setShowBackground(true);
        setCharactersVisibility(1.0);
      }
    }
  },

  // Cycle through sound camera positions
  cycleSoundCameraPosition: (direction) => {
    const {
      currentSoundPositionIndex,
      isSoundAnimationEnabled,
      updateCameraPositionAndTarget,
      setFov,
      lastCameraChangeTime,
      cameraChangeCooldown,
      lastDirectionChangeTime,
      directionChangeCooldown,
    } = get();

    const currentTime = Date.now();
    if (
      !isSoundAnimationEnabled ||
      currentTime - lastCameraChangeTime < cameraChangeCooldown ||
      currentTime - lastDirectionChangeTime < directionChangeCooldown
    )
      return;

    let newIndex: number;

    if (direction === 'next') {
      newIndex = (currentSoundPositionIndex + 1) % soundCameraPositions.length;
    } else {
      newIndex =
        (currentSoundPositionIndex - 1 + soundCameraPositions.length) %
        soundCameraPositions.length;
    }

    const newPosition = soundCameraPositions[newIndex];

    set({
      currentSoundPositionIndex: newIndex,
      lastCameraChangeTime: currentTime,
      lastDirectionChangeTime: currentTime,
      isLampOn: newPosition.lampOn,
      speakersPopped: newPosition.speakersPopped,
    });
    setFov(newPosition.fov);
    updateCameraPositionAndTarget(
      newPosition.position,
      newPosition.target,
      true,
    );
  },

  // Set cooldown for camera changes
  setCameraChangeCooldown: (cooldown) =>
    set({ cameraChangeCooldown: cooldown }),

  // Set thresholds
  setBeatThreshold: (value) => set({ beatThreshold: value }),
  setNoveltyThreshold: (value) => set({ noveltyThreshold: value }),
  setBeatEnergyThreshold: (value) => set({ beatEnergyThreshold: value }),
  setFrequencyThreshold: (value) => set({ frequencyThreshold: value }),

  // Set cooldown for direction changes
  setDirectionChangeCooldown: (cooldown) =>
    set({ directionChangeCooldown: cooldown }),

  // Reset camera state
  resetCameraState: () =>
    set({
      currentSoundPositionIndex: 0,
      lastCameraChangeTime: 0,
      // Reset other relevant states if needed
    }),

  // Get the current camera position safely
  getCurrentCameraPosition: () => {
    const { cameraPositions, currentPositionIndex } = get();

    if (
      Array.isArray(cameraPositions) &&
      currentPositionIndex >= 0 &&
      currentPositionIndex < cameraPositions.length
    ) {
      return cameraPositions[currentPositionIndex];
    } else {
      console.warn(
        `getCurrentCameraPosition: currentPositionIndex (${currentPositionIndex}) is out of bounds.`,
      );
      return null;
    }
  },

  // Add a new camera position
  addCameraPosition: (payload: CameraPosition) => {
    set((state) => ({
      cameraPositions: [...state.cameraPositions, payload],
    }));
  },

  setSkullRotationSpeed: (speed) => set({ skullRotationSpeed: speed }),

  // Remove a camera position by index
  removeCameraPosition: (index: number) => {
    set((state) => {
      if (index < 0 || index >= state.cameraPositions.length) {
        console.warn(`removeCameraPosition: Invalid index ${index}`);
        return state;
      }

      const newCameraPositions = state.cameraPositions.filter(
        (_, i) => i !== index,
      );
      let newCurrentPositionIndex = state.currentPositionIndex;

      if (newCurrentPositionIndex >= newCameraPositions.length) {
        newCurrentPositionIndex = newCameraPositions.length - 1;
      }

      if (newCurrentPositionIndex < 0) {
        newCurrentPositionIndex = 0;
      }

      return {
        cameraPositions: newCameraPositions,
        currentPositionIndex: newCurrentPositionIndex,
      };
    });
  },
}));
