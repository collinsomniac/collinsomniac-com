import { create } from 'zustand';

interface ControlsState {
  activeControlPanel: 'none' | 'ascii' | 'tone' | 'plane' | 'theme';
  showTitleBarOnly: boolean;
  setActiveControlPanel: (panel: string) => void;
  setShowTitleBarOnly: (show: boolean) => void;
}

const useControlsStore = create<ControlsState>((set) => ({
  activeControlPanel: 'none',
  showTitleBarOnly: false,
  setActiveControlPanel: (panel) =>
    set({ activeControlPanel: panel as ControlsState['activeControlPanel'] }),
  setShowTitleBarOnly: (show) => set({ showTitleBarOnly: show }),
}));

export default useControlsStore;
