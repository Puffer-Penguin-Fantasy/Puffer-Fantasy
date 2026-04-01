import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, RotateCcw, User, Check, Lock } from 'lucide-react';
import { GameState, LevelData } from '../../types';

interface GameOverlayProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentLevel: LevelData;
  countdownValue: number | null;
  LEVELS_LENGTH: number;
  userCount: number;
  meetsNFTRequirement: boolean;
  meetsTotalPointsRequirement: boolean;
  calculateLevelPoints: (strokes: number) => number;
  showsNextLevelWarning: boolean;
  nextLevelReqCount: number | null;
  nextLevelLoading: boolean;
  isEligibleToPlay: boolean;
  retryLevel: () => void;
  nextLevel: () => void;
  resetGame: () => void;
  totalPar: number;
  connected: boolean;
  arcticLoading: boolean;
  arcticData: any;
  shortAddress: string | null;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState, setGameState, currentLevel, countdownValue, LEVELS_LENGTH,
  userCount, meetsNFTRequirement, meetsTotalPointsRequirement, calculateLevelPoints,
  showsNextLevelWarning, nextLevelReqCount, nextLevelLoading, isEligibleToPlay,
  retryLevel, nextLevel, resetGame, totalPar, connected, arcticLoading, arcticData, shortAddress
}) => {
  const getScoreTerm = (strokes: number, par: number) => {
    if (strokes === 1) return { term: "Hole-in-one", color: "text-black" };
    const diff = strokes - par;
    if (diff === -1) return { term: "Birdie", color: "text-black" };
    if (diff === 0) return { term: "Par", color: "text-black" };
    if (diff === 1) return { term: "Bogey", color: "text-black" };
    if (diff === 2) return { term: "Double bogey", color: "text-black" };
    return null;
  };

  if (gameState.state === 'COUNTDOWN') {
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1200] backdrop-blur-sm pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={countdownValue}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-[12rem] sm:text-[18rem] font-gaming font-black text-white italic drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] leading-none">
                            {countdownValue || "GO!"}
                        </span>
                        <div className="h-2 w-48 sm:w-64 bg-white/20 rounded-full overflow-hidden mt-4">
                            <motion.div 
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 1, ease: "linear" }}
                                className="h-full bg-white shadow-[0_0_20px_white]"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    if (gameState.state === 'LEVEL_COMPLETE') {
        const scoreInfo = getScoreTerm(gameState.strokes, currentLevel.par);
        const isFinal = gameState.currentLevelIndex >= LEVELS_LENGTH - 1;
        
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-xl p-6 lg:p-[55px]">
                <div className="bg-black text-white px-6 lg:px-10 py-8 lg:py-[50px] rounded-3xl text-center w-full border border-white/20 animate-in fade-in zoom-in duration-200 flex flex-col items-center min-w-xs max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                    <h2 className="text-4xl lg:text-[48px] font-medium mb-4 lg:mb-6 leading-none tracking-tight">Nice shot</h2>
                    
                    <div className="flex flex-col items-center mb-10">
                        <p className="text-lg tracking-tight font-medium leading-none flex gap-1.5">{gameState.strokes} {gameState.strokes !== 1 ? "Strokes" : "Stroke"}
                        {scoreInfo && (
                            <><span>—</span><span>{scoreInfo.term}</span></>
                        )}
                        </p>

                        <div className="flex items-center gap-4 mt-8">
                           <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[130px] shadow-inner">
                               <span className="text-[10px] font-tech text-white/40 uppercase tracking-widest mb-1">Hole Points</span>
                               <span className="text-4xl font-tech font-black text-white">+{gameState.lastHolePoints}</span>
                           </div>
                           <div className="flex flex-col items-center p-4 bg-white/10 rounded-2xl border border-white/20 min-w-[130px] shadow-xl">
                               <span className="text-[10px] font-tech text-white/60 uppercase tracking-widest mb-1">Total Score</span>
                               <span className="text-4xl font-tech font-black text-white">{gameState.points.toLocaleString()}</span>
                           </div>
                        </div>
                    </div>

                    {/* Requirement Checklist */}
                    {currentLevel.requirementText && (
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left animate-in slide-in-from-bottom-2 duration-500">
                        <p className="text-[10px] font-tech text-white/40 uppercase tracking-[0.2em] mb-4">Advancement Requirements</p>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-tech text-white/80">
                                {currentLevel.maxNFTCount 
                                  ? `Hold ${currentLevel.requiredNFTCount}-${currentLevel.maxNFTCount} NFTs`
                                  : `Hold ${currentLevel.exactNFTMatch ? 'exactly ' : ''}${currentLevel.requiredNFTCount || 1} NFT${(currentLevel.requiredNFTCount || 1) !== 1 ? 's' : ''}`
                                } 
                                <span className="text-[10px] text-white/40 ml-1">(Wallet contains: {userCount})</span>
                              </span>
                              {meetsNFTRequirement ? <Check className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-red-500" />}
                            </div>
                          
                          {/* Point Requirement (if any) */}
                          {currentLevel.requiredTotalPoints ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-tech text-white/80">Require Lifetime Points ({currentLevel.requiredTotalPoints} pts)</span>
                              {meetsTotalPointsRequirement ? <Check className="w-4 h-4 text-green-400" /> : <div className="text-[10px] font-tech text-red-500 uppercase tracking-widest border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded">Current: {gameState.points}</div>}
                            </div>
                          ) : null}

                          {/* Hole Point Goal (if any) */}
                          {currentLevel.requiredPoints ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-tech text-white/80">Goal Score ({currentLevel.requiredPoints} pts)</span>
                              {calculateLevelPoints(gameState.strokes) >= currentLevel.requiredPoints ? <Check className="w-4 h-4 text-green-400" /> : <div className="text-[10px] font-tech text-red-500 uppercase tracking-widest">Not Met</div>}
                            </div>
                          ) : null}

                          {/* Stroke Requirement (if any) */}
                          {currentLevel.maxStrokes ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-tech text-white/80">Within {currentLevel.maxStrokes} Strokes</span>
                              {gameState.strokes <= currentLevel.maxStrokes ? <Check className="w-4 h-4 text-green-400" /> : <div className="text-[10px] font-tech text-red-500 uppercase tracking-widest">Not Met</div>}
                            </div>
                          ) : null}

                          {/* Bonus Point Objectives (if any) */}
                          {currentLevel.bonusObjectives && currentLevel.bonusObjectives.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10 w-full">
                              {currentLevel.bonusObjectives.sort((a, b) => a.maxStrokes - b.maxStrokes).map((bonus, idx) => {
                                 const earned = gameState.strokes <= bonus.maxStrokes;
                                 return (
                                   <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${earned ? 'bg-purple-500/10 border-purple-500/20 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/5'}`}>
                                     <span className={`text-xs font-tech font-bold uppercase ${earned ? 'text-purple-400' : 'text-white/40'}`}>
                                       {bonus.multiplier}x Points <span className="text-[9px] opacity-70">(&le;{bonus.maxStrokes} Hits)</span>
                                     </span>
                                     {earned ? (
                                       <span className="text-[10px] font-tech text-white uppercase tracking-widest bg-purple-500/80 px-2 py-0.5 rounded shadow-[0_0_10px_purple] animate-pulse">EARNED</span>
                                     ) : (
                                       <div className="text-[10px] font-tech text-white/40 uppercase tracking-widest px-2 py-0.5">Missed</div>
                                     )}
                                   </div>
                                 );
                              })}
                            </div>
                          )}
                        </div>
                        <p className="mt-4 text-[11px] font-tech text-white/40 italic leading-tight border-t border-white/5 pt-4">
                          "{currentLevel.requirementText}"
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-4 w-full">
                      {gameState.isEligibleToAdvance && showsNextLevelWarning && (
                        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                          <span className="text-red-400 font-tech font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2">⚠️ Not Enough NFTs</span>
                          <span className="text-red-400/80 font-tech text-xs text-center">The next level requires {nextLevelReqCount} or more NFTs to play. You will be locked out until you acquire more.</span>
                        </div>
                      )}
                      
                      {(() => {
                        const canAdvance = (gameState.performanceGoalMet && isEligibleToPlay) || gameState.completedLevels.includes(gameState.currentLevelIndex);
                        
                        return (
                          <button 
                            onClick={canAdvance ? nextLevel : retryLevel}
                            disabled={nextLevelLoading}
                            className={`w-full h-16 rounded-2xl font-tech font-bold text-lg flex items-center justify-center transition-all active:scale-95 shadow-lg border
                              ${canAdvance 
                                ? 'bg-[#1a1a1a] text-white hover:bg-[#252525] border-white/10' 
                                : 'bg-red-600/20 text-red-500 border-red-500/30 hover:bg-red-600/30'
                              }`}
                          >
                            {nextLevelLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              canAdvance 
                                ? (isFinal ? "View Results" : "Go to next level")
                                : "Restart Level"
                            )}
                          </button>
                        );
                      })()}

                      <button 
                        onClick={() => setGameState(prev => ({ ...prev, state: 'HOME_SCREEN', strokes: 0 }))}
                        className="w-full text-white/40 hover:text-white/60 font-tech text-xs uppercase tracking-widest transition-colors py-2"
                      >
                        Cancel and return to home
                      </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState.state === 'LEVEL_FAILED') {
      // NOTE (jsylvester): This state handles if the ball is sunk but under some fail condition (not used in current requirement schema but good for safety)
       return (
           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-3xl p-6 lg:p-[55px]">
               <div className="bg-[#0f0a0a] text-white px-6 lg:px-10 py-8 lg:py-[50px] rounded-3xl text-center w-full border border-red-500/30 animate-in fade-in zoom-in duration-200 flex flex-col items-center min-w-xs max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.15)] max-h-[90vh] overflow-y-auto">
                   <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 lg:mb-6 shadow-glow-red">
                     <RotateCcw className="w-8 lg:w-10 h-8 lg:h-10 text-red-500" />
                   </div>
                   
                   <h2 className="text-[40px] font-gaming mb-4 leading-none tracking-widest text-red-500 uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">Missed!</h2>
                   
                   <div className="flex flex-col items-center mb-10">
                       <p className="text-xl tracking-tight font-tech leading-none mb-4 text-white/80">{gameState.strokes} Strokes Taken</p>
                       <p className="text-sm text-red-400/60 font-tech uppercase tracking-widest bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10">Must meet goal requirements</p>
                   </div>
                   
                   <button 
                       onClick={retryLevel}
                       className="w-full h-[70px] bg-red-600 hover:bg-red-500 text-white font-tech rounded-2xl text-[18px] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] mb-4"
                   >
                       <RotateCcw className="w-5 h-5" />
                       RESTART LEVEL
                   </button>

                   <button 
                     onClick={() => setGameState(prev => ({ ...prev, state: 'HOME_SCREEN', strokes: 0 }))}
                     className="w-full text-white/40 hover:text-white/60 font-tech text-xs uppercase tracking-widest transition-colors py-2"
                   >
                     Cancel and return to home
                   </button>
               </div>
           </div>
       );
    }

    if (gameState.state === 'GAME_OVER') {
        const parDiff = gameState.totalScore - totalPar;
        const scoreText = parDiff === 0 ? "Even Par" : (parDiff > 0 ? `${parDiff} Over Par` : `${Math.abs(parDiff)} Under Par`);
        
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-xl p-6 lg:p-[55px]">
            <div className="bg-black text-white px-6 lg:px-10 py-8 lg:py-[50px] rounded-3xl text-center w-full border border-white/20 animate-in fade-in zoom-in duration-200 flex flex-col items-center min-w-xs max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-4xl lg:text-[48px] font-medium mb-4 lg:mb-6 leading-none tracking-tight">Course Complete</h2>

                {/* Player identity card */}
                {connected && (
                  <div className="flex items-center gap-3 mb-6 w-full justify-center">
                    <div className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                      {arcticLoading ? (
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                      ) : arcticData.hasNFT && arcticData.nftDetails?.image ? (
                        <img
                          src={arcticData.nftDetails.image}
                          alt={arcticData.nftDetails.name}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white/40" />
                      )}

                    </div>
                    <div className="text-left">
                      {arcticData.hasNFT && arcticData.nftDetails?.name ? (
                        <p className="text-sm font-semibold text-white leading-none mb-1">{arcticData.nftDetails.name}</p>
                      ) : null}
                      <p className="text-xs font-mono text-white/40 leading-none">{shortAddress}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center mb-10">
                    <p className="text-xl tracking-tight font-bold leading-none mb-2">{scoreText}</p>
                    <p className="text-lg text-[#9BA0A6] font-medium">Total Strokes: {gameState.totalScore} (Par {totalPar})</p>
                    <p className="text-sm text-white/50 mt-1">{gameState.points.toLocaleString()} points earned</p>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                      onClick={resetGame}
                      className="w-full bg-white text-black hover:opacity-80 leading-none py-[22px] px-[22px] min-w-[175px] lg:min-w-[206px] rounded-full font-medium flex items-center justify-center gap-2 transition-transform active:scale-95 mb-4"
                  >
                      Play again
                  </button>

                  <button 
                    onClick={() => setGameState(prev => ({ ...prev, state: 'HOME_SCREEN', strokes: 0, currentLevelIndex: 0 }))}
                    className="w-full text-white/40 hover:text-white/60 font-tech text-xs uppercase tracking-widest transition-colors py-2"
                  >
                    Back to menu
                  </button>
                </div>
            </div>
          </div>
        );
    }

    return null;
};

export default GameOverlay;
