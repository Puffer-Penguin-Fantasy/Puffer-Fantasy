import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level3: any = {
  ...parseLevel(3, 'g', COLORS.BLUE, 3, "The og", [
    "###########",
    "#_......S_#",
    "#B........#",
    "#..########",
    "#..########",
    "#..###.H..#",
    "#..###....#",
    "#..#####..#",
    "#..#####..#",
    "#........B#",
    "#_B......_#",
    "###########",
    "###########",
    "###########",
]),
  maxStrokes: 4,
  requiredNFTCount: 3,
  requirementText: "Hold at least 3 NFTs and finish within 4 strokes"
};
