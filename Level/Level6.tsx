import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level6: any = {
  ...parseLevel(6, 'I/O', COLORS.YELLOW, 3, "I/O", [
    "         #####",
    "         #.._#",
    "         #.H.#",
    "         #...#",
    "   #########.#",
    "   #wWWWWw##.#",
    "   #zZZZZz#*.#",
    "  #..........#",
    "##*.........P#",
    "#............#",
    "#............#",
    "#.S..*###*...#",
    "#....#   #...#",
    "*#####   #####",
    "*#####   #####",
]),
  requiredNFTCount: 6,
  maxStrokes: 3,
  requirementText: "Hold at least 6 NFTs, Finish within 3 strokes",
};
