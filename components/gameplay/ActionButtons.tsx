import React, { useState } from 'react';
import { RotateCcw, Loader2, Lock, MoreHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../../types';

interface ActionButtonsProps {
  gameState: GameState;
  showsNextLevelWarning: boolean;
  nextLevelReqCount: number | null;
  nextLevelLoading: boolean;
  isEligibleToPlay: boolean;
  prevLevel: () => void;
  retryLevel: () => void;
  nextLevel: () => void;
}

const btnBase =
  'h-9 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 flex items-center justify-end gap-1.5 transition-all active:scale-95 shadow-xl backdrop-blur-md font-tech font-bold text-[9px] uppercase tracking-widest whitespace-nowrap cursor-pointer w-full';

const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameState, showsNextLevelWarning, nextLevelReqCount, nextLevelLoading,
  isEligibleToPlay, prevLevel, retryLevel, nextLevel
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (
    gameState.state === 'START_SCREEN' ||
    gameState.state === 'HOME_SCREEN' ||
    gameState.state === 'LEVEL_SELECT'
  ) return null;

  const showPrev    = gameState.currentLevelIndex > 0 && gameState.state === 'AIMING';
  const showReplay  =
    (gameState.strokes > 0 || gameState.state === 'LEVEL_FAILED' || gameState.state === 'LEVEL_COMPLETE' || gameState.completedLevels.includes(gameState.currentLevelIndex)) &&
    (gameState.state === 'AIMING' || gameState.state === 'MOVING' || gameState.state === 'LEVEL_FAILED' || gameState.state === 'LEVEL_COMPLETE');
  const showNext    =
    (gameState.state === 'LEVEL_COMPLETE' && gameState.performanceGoalMet && isEligibleToPlay) ||
    gameState.completedLevels.includes(gameState.currentLevelIndex);
  const showGoalFailed = gameState.state === 'LEVEL_COMPLETE' && !gameState.isEligibleToAdvance;

  const hasAnyButton = showPrev || showReplay || showNext;

  // Ordered bottom→top: items at index 0 are closest to trigger
  const subButtons = [
    showPrev && {
      id: 'prev',
      label: 'Prev Level',
      icon: <ChevronLeft className="w-3 h-3" />,
      onClick: () => { prevLevel(); setMenuOpen(false); },
      bright: false,
    },
    showReplay && {
      id: 'replay',
      label: 'Replay',
      icon: <RotateCcw className="w-3 h-3" />,
      onClick: () => { retryLevel(); setMenuOpen(false); },
      bright: false,
    },
    showNext && {
      id: 'next',
      label: nextLevelLoading ? '' : 'Next Level',
      icon: nextLevelLoading
        ? <Loader2 className="animate-spin w-3 h-3" />
        : <ChevronRight className="w-3 h-3" />,
      onClick: () => { nextLevel(); setMenuOpen(false); },
      bright: true,
    },
  ].filter(Boolean) as {
    id: string; label: string; icon?: React.ReactNode;
    onClick: () => void; bright: boolean;
  }[];

  return (
    <div className="flex flex-col items-end gap-2 pointer-events-none">

      {/* Requirement Warning */}
      {showsNextLevelWarning && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] sm:text-[10px] font-tech uppercase tracking-widest px-3 py-1.5 rounded-lg backdrop-blur-md animate-pulse pointer-events-auto">
          ⚠️ Next level needs {nextLevelReqCount}+ NFTs
        </div>
      )}

      {/* ── DESKTOP (sm+): inline row ── */}
      {hasAnyButton && (
        <div className="hidden sm:flex flex-row gap-2 pointer-events-auto items-center">
          {showPrev && (
            <button onClick={prevLevel}
              className="h-10 px-6 bg-white/10 text-white hover:bg-white/20 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl font-tech font-bold text-[10px] uppercase tracking-widest border border-white/10 backdrop-blur-md">
              Previous Level
            </button>
          )}
          {showReplay && (
            <button onClick={retryLevel} title="Replay Level"
              className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 flex items-center gap-2 transition-all active:scale-95 shadow-xl backdrop-blur-md">
              <RotateCcw className="w-4 h-4" />
              <span className="text-[10px] font-tech uppercase tracking-widest font-bold">Replay</span>
            </button>
          )}
          {showNext && (
            <button onClick={nextLevel} disabled={nextLevelLoading}
              className="h-10 px-6 bg-white text-black hover:bg-white/90 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xl font-tech font-bold text-[10px] uppercase tracking-widest border border-white/20 cursor-pointer">
              {nextLevelLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Next Level'}
            </button>
          )}
        </div>
      )}

      {/* ── MOBILE: trigger + vertical stack above ── */}
      {hasAnyButton && (
        <div className="relative flex sm:hidden flex-col items-end pointer-events-auto">

          {/* Sub-button stack — pops UP above trigger */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="stack"
                className="absolute bottom-full mb-2 right-0 flex flex-col items-end gap-1.5"
                style={{ zIndex: 300 }}
              >
                {/* Render in reverse so top button is highest in DOM order */}
                {[...subButtons].reverse().map((btn, ri) => {
                  const i = subButtons.length - 1 - ri; // real index for stagger
                  return (
                    <motion.button
                      key={btn.id}
                      initial={{ opacity: 0, y: 12, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.9,
                              transition: { duration: 0.18, delay: i * 0.04 } }}
                      transition={{
                        duration: 0.35,
                        ease: [0.23, 1, 0.32, 1],
                        delay: (subButtons.length - 1 - i) * 0.07,
                      }}
                      onClick={btn.onClick}
                      className={
                        btn.bright
                          ? 'h-9 px-4 bg-white text-black hover:bg-white/90 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-2xl font-tech font-bold text-[9px] uppercase tracking-widest border border-white/20 whitespace-nowrap cursor-pointer'
                          : btnBase
                      }
                    >
                      {btn.icon}
                      {btn.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger */}
          <motion.button
            onClick={() => setMenuOpen(o => !o)}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-xl transition-colors cursor-pointer"
            style={{ zIndex: 210 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.span key="x"
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}>
                    <X className="w-4 h-4" />
                  </motion.span>
                : <motion.span key="dots"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}>
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      )}

      {/* Failure Indication */}
      {showGoalFailed && (
        <div className="h-8 sm:h-10 px-3 sm:px-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl flex items-center gap-1.5 sm:gap-2 backdrop-blur-md self-end pointer-events-auto">
          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-[8px] sm:text-[10px] font-tech uppercase tracking-widest font-bold">Goal Not Met</span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
