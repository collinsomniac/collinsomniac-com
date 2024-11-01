import { create } from 'zustand';

interface ASCIIUpdateState {
  updateFontSize: boolean;
  updateCellSize: boolean;
  updateColor: boolean;
  updateBackgroundColor: boolean;
  setUpdateFontSize: (value: boolean) => void;
  setUpdateCellSize: (value: boolean) => void;
  setUpdateColor: (value: boolean) => void;
  setUpdateBackgroundColor: (value: boolean) => void;
}

export const useASCIIUpdateStore = create<ASCIIUpdateState>((set) => ({
  updateFontSize: false,
  updateCellSize: false,
  updateColor: false,
  updateBackgroundColor: false,
  setUpdateFontSize: (value) => set({ updateFontSize: value }),
  setUpdateCellSize: (value) => set({ updateCellSize: value }),
  setUpdateColor: (value) => set({ updateColor: value }),
  setUpdateBackgroundColor: (value) => set({ updateBackgroundColor: value }),
}));
