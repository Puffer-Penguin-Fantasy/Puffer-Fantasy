import * as React from 'react';
import { motion } from 'motion/react';
import { GameState, LevelData } from '../../types';
import { LEVELS } from '../../Level';
import GameCanvas from '../GameCanvas';
import { Lock } from 'lucide-react';

interface LevelSelectProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  playForeground: (url: string) => void;
  getPath: (path: string) => string;
  userCount: number;
}

/**
 * Determines whether a level is locked based on:
 * 1. Sequential completion (must beat previous level)
 * 2. NFT count requirement (requiredNFTCount, exactNFTMatch, maxNFTCount)
 * 3. Total points requirement (requiredTotalPoints)
 */
function isLevelLocked(
  index: number,
  level: LevelData,
  gameState: GameState,
  userCount: number
): boolean {
  // Level 0 is always unlocked
  if (index === 0) return false;

  // Must have completed the previous level sequentially
  if (!gameState.completedLevels.includes(index - 1)) return true;

  // NFT count check
  const requiredCount = level.requiredNFTCount || 1;
  const maxCount = level.maxNFTCount;
  const isExact = level.exactNFTMatch || false;

  let nftMet = isExact ? userCount === requiredCount : userCount >= requiredCount;
  if (maxCount !== undefined) {
    nftMet = nftMet && userCount <= maxCount;
  }
  if (!nftMet) return true;

  // Total points check
  if (level.requiredTotalPoints && gameState.points < level.requiredTotalPoints) return true;

  return false;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  gameState,
  setGameState,
  playForeground,
  getPath,
  userCount,
}) => {
  return (
    <motion.div
      key="level-select"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-[110] flex flex-col overflow-hidden"
    >
      {/* Semi-transparent background so canvas VOID holes show transparently */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Back button – sits in top-right corner */}
      <button
        onClick={() => {
          playForeground(getPath('/media/audio/sfx/global/buttonclick.mp3'));
          setGameState(prev => ({ ...prev, state: 'HOME_SCREEN' }));
        }}
        className="absolute top-6 right-6 z-10 px-5 py-2 rounded-full border border-white/20 text-white text-sm font-tech tracking-wide hover:bg-white/10 transition-all active:scale-95"
      >
        Back
      </button>

      {/* Select Course heading */}
      <div className="relative z-10 px-4 pt-5 pb-2">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-gaming text-white tracking-widest leading-tight">
          Select <span className="text-white">course</span>
        </h2>
      </div>

      {/* Scrollable grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 pb-4">
          {LEVELS.map((level, index) => {
            const locked = isLevelLocked(index, level, gameState, userCount);
            const completed = gameState.completedLevels.includes(index);
            const current = gameState.currentLevelIndex === index;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => {
                  if (locked) return;
                  playForeground(getPath('/media/audio/sfx/global/buttonclick.mp3'));
                  setGameState(prev => {
                    const selectedLvl = LEVELS[index];
                    const needsPreLaunch =
                      selectedLvl.maxTime !== undefined &&
                      !prev.completedLevels.includes(index);
                    return {
                      ...prev,
                      currentLevelIndex: index,
                      strokes: 0,
                      state: needsPreLaunch ? 'PRE_LAUNCH' : 'AIMING',
                    };
                  });
                }}
                className={`relative h-28 sm:h-36 overflow-hidden rounded-xl transition-all border border-white/10
                  ${locked ? 'cursor-not-allowed' : 'cursor-pointer hover:border-white/40 hover:ring-2 hover:ring-white/40 active:scale-95'}
                  ${current && !locked ? 'ring-2 ring-white border-white/60' : ''}
                  ${completed && !locked ? 'ring-1 ring-green-500/60 border-green-500/30' : ''}
                `}
              >
                {/* Canvas preview – fills the entire cell */}
                <div className="absolute inset-0">
                  <GameCanvas
                    level={level}
                    onStroke={() => {}}
                    onHole={() => {}}
                    disabled={true}
                    isPreview={true}
                  />
                </div>

                {/* Lock overlay */}
                {locked && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white/60" />
                    </div>
                  </div>
                )}

                {/* Completed badge */}
                {completed && !locked && (
                  <div className="absolute bottom-1.5 right-1.5 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default LevelSelect;
