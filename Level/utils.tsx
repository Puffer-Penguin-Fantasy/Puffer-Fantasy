import { LevelData, PortalExitConfig } from '../types';

export const parseLevel = (
  id: number,
  letter: string,
  color: string,
  par: number,
  name: string,
  grid: string[],
  portalExitConfigs?: PortalExitConfig[]
): LevelData => ({
  id,
  letter,
  color,
  par,
  name,
  grid,
  portalExitConfigs
});
