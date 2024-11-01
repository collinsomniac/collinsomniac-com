/* eslint-disable prettier/prettier */
import React from 'react';
import { useControls, button } from 'leva';
import { useASCIIStore } from '../../../stores/asciiStore';
import { useThreeDStore } from '../../../stores/threeDStore';

const ASCIIPresets: React.FC = () => {
  const ascii = useASCIIStore();
  const { showASCIIPresets } = useThreeDStore();

  useControls(
    'ASCII Presets',
    () => ({
      DEFAULT: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' .-:;=+*#%@');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(5);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      REVEAL: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' .-:;=+*#%@');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(true);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(5);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      FUCKS: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' FUCKFUCKFUCKFUCK!');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(12);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      COLLINSOMNIAC: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' .IIILLLCCCOOOAAANNNMMMSSS');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(12);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      MATH: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(
          ' ∙∘∗∴∵∷∸∹∺≁∿∞≀∻∾∝≈≏∊∍≂≃≄∀∃∈∋∡∢∣∤∥∦∧∨∩∪≅≌≆≊≇∉∌∁∂∄∅∆∇∏∐∑∓∔√∛∜∫≋∬∭∮∯∰∱∲∳',
        );
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(68);
        ascii.setCellSize(12);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      DOTS: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters('  ⡀⡀⢀⢀⠠⠠⠄⠄⠔⠂⠂⠐⠐⠘⠈⠈⠁⠁⠅');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(68);
        ascii.setCellSize(9);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      BRAILLE: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(
          ' ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿',
        );
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(68);
        ascii.setCellSize(12);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      LINES: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' ─│┌┐└┘├┤┬┴┼╭╮╯╰╴╵╶╷╸╹╺╻╼╽╾╿');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(12);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      VERTICAL: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' ▏▎▍▌▋▊');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(9);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      HORIZONTAL: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' ▂▂▃▃▅▅▆▆▇▇▉▉');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(64);
        ascii.setCellSize(9);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      ESCHER: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters('  ╗╚╝╠╣╦╩╬═║');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(180);
        ascii.setCellSize(16);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      HALFTONE: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' ░░░░░▒▒▒▒▓▓▓▓▓');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(87);
        ascii.setCellSize(18);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      HOLOGRAPH: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' .-:;=+*#%@');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(206.7);
        ascii.setCellSize(1.4);
        ascii.setBackgroundVisibility(1);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
      GLITCH: button(() => {
        ascii.setEnabled(true);
        ascii.setCharacters(' .-:;=+*#%@');
        ascii.setInvert(false);
        ascii.setColor(ascii.color);
        ascii.setBackgroundColor(ascii.backgroundColor);
        ascii.setUseCanvasColor(false);
        ascii.setCanvasColor(ascii.backgroundColor);
        ascii.setFontSize(224);
        ascii.setCellSize(20);
        ascii.setBackgroundVisibility(0);
        ascii.setCharactersVisibility(1);
        ascii.setShowBackground(true);
      }),
    }),
    { collapsed: true, render: () => showASCIIPresets },
  );

  return null;
};

export default ASCIIPresets;
