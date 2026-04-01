import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level2: any = {
  ...parseLevel(2, 'G', COLORS.BLUE, 2, "The G", [
    "###############",
    "#######_....._#",
    "#*..._#.......#",
    "#...1.#.......#",
    "#.....#...H...#",
    "#.....#.......#",
    "#.S...#.......#",
    "#_...*#_......#",
    "#########*....#",
    "#########*....#",
    "#######_......#",
    "#######.1.....#",
    "#######_....._#",
    "###############",
]),
  maxStrokes: 4,
  requiredNFTCount: 2,
  requirementText: "Hold at least 2 NFTs and finish within 4 strokes"
};
