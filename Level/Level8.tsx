import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level8: any = {
  ...parseLevel(8, 'I', COLORS.BLUE, 5, "PufferIO", [
    "####################",
    "#_P._#1#############",
    "#....#.######_.P.._#",
    "#..#...######.P....#",
    "#..###.#..P_#...P..#",
    "#B.._#H#....B......#",
    "#_...###S..........#",
    "##*..*###.#...*#*.*#",
    "##*P..###Z#...###.##",
    "#_P..B###Z#...###.##",
    "#...*####Z#...###1##",
    "#...*####Z#...*#####",
    "#........Zz...zZZZ##",
    "#B.......zZZZZZZZZ##",
    "####################",
]),
  requiredNFTCount: 2,
  maxStrokes: 3,
  bonusObjectives: [
    { maxStrokes: 2, multiplier: 2 }
  ],
  requirementText: "Finish in 3 strokes. 2x points if done in 2!",
};


