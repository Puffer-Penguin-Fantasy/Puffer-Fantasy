import { LevelData } from '../types';
import { Level1 } from './Level1';
import { Level2 } from './Level2';
import { Level3 } from './Level3';
import { Level4 } from './Level4';
import { Level5 } from './Level5';
import { Level6 } from './Level6';
import { Level7 } from './Level7';
import { Level8 } from './Level8';
import { Level9 } from './Level9';

export const PORTRAIT_SCALE_OVERRIDES: Record<number, number> = {
  1: 1.3,
  2: 1.1,
  3: 1.0,
  4: 1.1,
  5: 1.1,
  6: 1.1,
  7: 1.1,
  9: 1.1,
};

export const LEVELS: LevelData[] = [
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
  Level7,
  Level8,
  Level9,
];
