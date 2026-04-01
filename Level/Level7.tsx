import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level7: any = {
  ...parseLevel(7, 'I', COLORS.BLUE, 4, "bridge", [
    "          ##### ",
    "         ##2### ",
    "     #####W.WW# ",
    "    #_.S.#W.WW# ",
    "    #.....Z.WW##",
    "    #.......ZW##",
    "    #1..#..BZW##",
    "############### ",
    "#Zz**1##########",
    "#Zz...###*.H..B#",
    "#Z...*###......#",
    "#Z...*#####..ZZ#",
    "#Zz..........B##",
    "#ZZ#.B....#2####",
    "################",
    "################",
]),
  requiredNFTCount: 1,
  requiredTotalPoints: 15,
  maxStrokes: 4,
  requirementText: "Accumulate 15+ Total Points & finish within 4 strokes",
};
