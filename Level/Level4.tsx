import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level4: any = {
  ...parseLevel(4, 'l', COLORS.GREEN, 2, "the le", [
     "         ######",
    "         #_.._#",
    "#####    #....#",
    "#_._###  #.##.#",
    "#..zZZ####.#H.#",
    "#..zZZZ.P.....#",
    "#S...zzP......#",
    "#..........zZZ#",
    "#_.........zZZ#",
    "###############",
]),
  requiredNFTCount: 1,
  maxStrokes: 2,
  requirementText: "Hold at least 1 NFT and finish within 2 strokes"
};
