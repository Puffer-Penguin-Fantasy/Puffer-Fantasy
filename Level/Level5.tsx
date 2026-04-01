import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level5: any = {
  ...parseLevel(5, 'D', COLORS.GREEN, 3, "Puffer Run", [
    "#####################",
    "#...####....#_....._#",
    "#.S.####..2.#2....P.#",
    "#...####....#.......#",
    "#...###....##.......#",
    "#...###....##.......#",
    "#...###....##.......#",
    "#...##....###.......#",
    "#...##....###ZZZZZZZ#",
    "#...##....###ZZZZZZZ#",
    "#...#....####ZZZZZZZ#",
    "#.1.#.1..####...H...#",
    "#...#....####_....._#",
    "#####################",
], [{ angle: 270+25, boost: 1.5 }, { angle: 0, boost: 1.4 }]),
  maxStrokes: 4,
  maxTime: 20,
  requiredNFTCount: 2,
  requirementText: "Hold at least 2 NFTs, finish within 4 strokes & 20 seconds"
};
