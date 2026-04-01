/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ScorePill from "./builds/ScorePill";
import { IconGolf, IconReset } from "./Icons";
import { GameState } from '../types';

interface FooterProps {
  gameState: GameState;
  numLevels: number;
}

const Footer: React.FC<FooterProps> = ({ gameState, numLevels }) => {
  return (
    <ScorePill>
      <div className="flex items-center gap-[4.5px] justify-center pr-4">
        <IconGolf size={20} />
        <span className="text-[16px] md:text-[18px]">Hole {gameState.currentLevelIndex + 1}/{numLevels}</span>
      </div>
    </ScorePill>
  );
};

export default Footer;
