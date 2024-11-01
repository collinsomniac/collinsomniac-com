import { create } from 'zustand';
import butterchurnPresets from 'butterchurn-presets';

// Define the structure of your store
interface ButterChurnState {
  presets: string[]; // List of preset names
  currentPresetIndex: number; // Index of the currently selected preset
  currentPreset: string; // Name of the current preset
  cycleNextPreset: () => void; // Function to cycle to the next preset
  cyclePreviousPreset: () => void; // Function to cycle to the previous preset
  setPresetByName: (presetName: string) => void; // Function to set preset by name
}

// Predefined list of desired presets
const predefinedPresets = [
  '_Mig_085',
  '_Rovastar + Geiss - Hurricane Nightmare (Posterize Mix)',
  'An AdamFX n Martin Infusion 2 flexi - Why The Sky Looks Diffrent Today - AdamFx n Martin Infusion - Tack Tile Disfunction B',
  'cope + martin - mother-of-pearl',
  'Cope - The Neverending Explosion of Red Liquid Fire',
  'Eo.S. + Phat - cubetrace - v2',
  'Zylot - Star Ornament',
  'Eo.S. + Zylot - skylight (Stained Glass Majesty mix)',
  'flexi + amandio c - organic12-3d-2.milk',
  'fiShbRaiN + Flexi - witchcraft 2.0',
  'Flexi + Martin - cascading decay swing',
  'Flexi + stahlregen - jelly showoff parade',
  'Flexi - mindblob mix',
  'flexi - patternton, district of media, capitol of the united abstractions of fractopia',
  'Flexi - predator-prey-spirals',
  'Flexi - smashing fractals [acid etching mix]',
  'flexi - swing out on the spiral',
  'flexi - what is the matrix',
  'Geiss + Flexi + Martin - disconnected',
  'Geiss - Thumb Drum',
  'Goody - The Wild Vort',
  'Milk Artist At our Best - FED - SlowFast Ft AdamFX n Martin - HD CosmoFX',
  'martin [shadow harlequins shape code] - fata morgana',
  'Martin - QBikal - Surface Turbulence IIb',
  'ORB - Waaa',
  'suksma - uninitialized variabowl (hydroponic chronic)',
  'Phat+fiShbRaiN+Eo.S_Mandala_Chasers_remix',
  "TonyMilkdrop - Leonardo Da Vinci's Balloon [Flexi - merry-go-round + techstyle]",
  '$$$ Royal - Mashup (220)',
  '_Geiss - Artifact 01',
];

// Helper to find the index of the default preset
const defaultPresetName = 'Goody - The Wild Vort';
const defaultPresetIndex = predefinedPresets.indexOf(defaultPresetName);

// Initialize the store with consistent index and preset
export const useButterChurnStore = create<ButterChurnState>((set, get) => ({
  presets: predefinedPresets,
  currentPresetIndex: defaultPresetIndex !== -1 ? defaultPresetIndex : 0,
  currentPreset:
    defaultPresetIndex !== -1
      ? predefinedPresets[defaultPresetIndex]
      : predefinedPresets[0],

  cycleNextPreset: () =>
    set((state) => {
      const nextIndex = (state.currentPresetIndex + 1) % state.presets.length;
      return {
        currentPresetIndex: nextIndex,
        currentPreset: state.presets[nextIndex],
      };
    }),

  cyclePreviousPreset: () =>
    set((state) => {
      const prevIndex =
        (state.currentPresetIndex - 1 + state.presets.length) %
        state.presets.length;
      return {
        currentPresetIndex: prevIndex,
        currentPreset: state.presets[prevIndex],
      };
    }),

  setPresetByName: (presetName: string) =>
    set((state) => {
      const index = state.presets.indexOf(presetName);
      if (index !== -1) {
        return {
          currentPresetIndex: index,
          currentPreset: presetName,
        };
      }
      return state;
    }),
}));
