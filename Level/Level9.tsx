import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level9: any = {
  ...parseLevel(9, 'e', COLORS.RED, 3, "Cactus jump", [
    "###################",
    "###B...B#####WWWWW#",
    "###2....T.###WWWWW#",
    "####*.ZZZB###WZZZW#",
    "#####.#######W.3.W#",
    "#####.##P#P##W...W#",
    "#####3#_P#P##W...W#",
    "#_._###...._#WzZzW#",
    "#B...1#1...2#WzZzW#",
    "#...._#...._#WH..W#",
    "#.S.*##_P#P##WZZZW#",
    "#_._####P#P##WWWWW#",
    "###################",
]),
  requiredNFTCount: 2,
  maxStrokes: 4,
  bonusObjectives: [
    { maxStrokes: 3, multiplier: 2 },
    { maxStrokes: 2, multiplier: 3 },
    { maxStrokes: 1, multiplier: 4 },
  ],
  requirementText: "Finish in 4 strokes. Faster finishes reward up to 4x points!",
};
