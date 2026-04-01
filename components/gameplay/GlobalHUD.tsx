import React from 'react';
import { Loader2, User, Check, Lock } from 'lucide-react';
import { GameState, LevelData } from '../../types';

interface GlobalHUDProps {
  // ... (rest of the interface)
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentLevel: LevelData;
  isEligibleToPlay: boolean;
  meetsNFTRequirement: boolean;
  meetsTotalPointsRequirement: boolean;
  arcticLoading: boolean;
  arcticData: any;
  playForeground: (url: string) => void;
  getPath: (path: string) => string;
}

const GlobalHUD: React.FC<GlobalHUDProps> = ({
  gameState, setGameState, currentLevel, isEligibleToPlay, meetsNFTRequirement,
  meetsTotalPointsRequirement, arcticLoading, arcticData, playForeground, getPath
}) => {
  if (gameState.state === 'START_SCREEN' || gameState.state === 'HOME_SCREEN' || gameState.state === 'LEVEL_SELECT') return null;

    return (
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-[500] flex flex-col gap-2 sm:gap-4 pointer-events-none select-none max-w-[calc(100vw-32px)]">
        {/* Top Row: Identity and Points */}
        <div className="flex items-center">
          {/* Large Square PFP Frame */}
          <div className="relative z-20 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl rainbow-border animate-rotate-gradient p-0.5 flex items-center justify-center bg-[#0a0a0a] shadow-black/40 group overflow-hidden shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#0a0a0a] flex items-center justify-center border border-white/10 overflow-hidden">
              {arcticLoading ? (
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/40 animate-spin" />
              ) : (arcticData as any)?.hasNFT && (arcticData as any).nftDetails?.image ? (
                <img
                  src={(arcticData as any).nftDetails.image}
                  alt="NFT avatar"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover scale-110"
                />
              ) : (
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-white/40" />
              )}
            </div>
          </div>

          {/* Attached Point Block Card */}
          <div className="relative -ml-4 z-10 h-12 sm:h-16 pl-6 sm:pl-10 pr-4 sm:pr-8 flex flex-col justify-center bg-[#0a0a0a] border-y border-r border-white/10 rounded-r-2xl shadow-2xl">
            <div className="flex flex-col gap-0 sm:gap-0.5">
              <span className="text-[8px] sm:text-[10px] font-tech text-white/40 uppercase tracking-[0.2em] leading-none whitespace-nowrap">Total Points</span>
              <span className="text-xl sm:text-3xl font-tech font-black text-white leading-none drop-shadow-md">
                {gameState.points.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Eligibility Badge */}
        <div className="flex flex-col items-start gap-2">
          <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border shadow-lg transition-all duration-300 ${
            isEligibleToPlay 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex flex-col items-start gap-1 sm:gap-1.5 sm:min-w-[200px]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isEligibleToPlay ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                ) : (
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                )}
                <span className="text-[9px] sm:text-[11px] font-tech uppercase tracking-[0.2em] font-bold leading-none">
                  Status: {isEligibleToPlay ? 'Eligible' : 'Not Eligible'}
                </span>
                {!meetsNFTRequirement && <span className="text-[7px] text-red-500 uppercase font-tech tracking-widest leading-none ml-1">(NFT)</span>}
                {meetsNFTRequirement && !meetsTotalPointsRequirement && <span className="text-[7px] text-red-500 uppercase font-tech tracking-widest leading-none ml-1">(Points)</span>}
              </div>
              
              {currentLevel.requirementText && (
                <div className="mt-1 sm:mt-1.5 pt-1 sm:pt-1.5 border-t border-white/10 w-full">
                  <p className="text-[8px] sm:text-[10px] font-tech text-white/80 uppercase tracking-[0.1em] leading-tight">
                    Goal: {currentLevel.requirementText}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Level 5+ Challenge Prompt Box */}
          {gameState.state === 'PRE_LAUNCH' && currentLevel.maxTime !== undefined && (
            <div className="mt-2 p-4 rounded-xl bg-[#0a0a0a] border border-blue-500/30 shadow-2xl animate-in slide-in-from-top duration-500 max-w-[280px] pointer-events-auto">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 </div>
                 <span className="text-[10px] font-tech text-blue-400 font-black uppercase tracking-widest leading-none">How this Game works</span>
               </div>
               
               <p className="text-[10px] font-tech text-white/90 leading-relaxed mb-4 uppercase tracking-tighter">
                 SINK THE BALL WITHIN <span className="text-white font-bold">{currentLevel.maxStrokes} STROKES</span> AND <span className="text-white font-bold">{currentLevel.maxTime} SECONDS</span>. ONCE STARTED, THE CLOCK IS LIVE!
               </p>

               <div className="flex flex-col items-center">
                 <span className="text-[9px] font-tech text-white/40 uppercase tracking-[0.3em] mb-2 font-bold">Are you ready?</span>
                 <button 
                   onClick={() => {
                     playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
                     setGameState(prev => ({ ...prev, state: 'COUNTDOWN' }));
                   }}
                   className="w-full h-10 bg-white text-black hover:bg-white/90 rounded-lg font-tech font-black text-xs tracking-widest transition-all active:scale-95 shadow-xl shadow-white/10 uppercase"
                 >
                   Yes
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default GlobalHUD;
