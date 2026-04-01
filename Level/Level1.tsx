import { parseLevel } from './utils';
import { COLORS } from '../constants';

export const Level1: any = {
  ...parseLevel(1, 'P', COLORS.GREEN, 2, "Puffer Hill", [
    "               ",
    " ############# ",
    " #_........._# ",
    " #S......P.H.# ",
    " #_........._# ",
    " ############# ",
    "               ",
]),
  requiredNFTCount: 1,
  requirementText: "Hold at least 1 NFT to play this level"
};
