import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, HelpCircle, Layers, Menu, X, Lock, Loader2 } from 'lucide-react';
import { GameState } from '../../types';
import { LEVELS } from '../../Level';

interface HomeScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  playForeground: (url: string) => void;
  getPath: (path: string) => string;
  setShowInfo: (show: boolean) => void;
  hasNFT?: boolean;
  isLoading?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  gameState,
  setGameState,
  playForeground,
  getPath,
  setShowInfo,
  hasNFT = false,
  isLoading = false,
}) => {

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-[100] p-6 overflow-hidden"
    >
      {/* Background Image with subtle overlay */}
      <div className="fixed inset-0 z-[-1]">
        {/* Desktop Background */}
        <img 
          src="/assets/background.png" 
          alt="Desktop Background" 
          className="hidden lg:block w-full h-full object-cover"
        />
        {/* Mobile Background */}
        <img 
          src="/assets/mobilebg.png" 
          alt="Mobile Background" 
          className="block lg:hidden w-full h-full object-cover"
        />
      <div className="flex flex-col items-center text-center max-w-4xl w-full">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[36px] lg:text-[100px] font-gaming leading-tight tracking-wider text-white mb-16 select-none px-6 text-center break-words"
        >
          Puffer <span className="text-white">Fantasy</span>
        </motion.h1>

        {/* Bottom Center Content: Play Game Action */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <button
            disabled={!hasNFT || isLoading}
            onClick={() => {
              playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
              setGameState(prev => {
                const currentLvl = LEVELS[prev.currentLevelIndex];
                const needsPreLaunch = currentLvl.maxTime !== undefined && !prev.completedLevels.includes(prev.currentLevelIndex);
                return { ...prev, state: needsPreLaunch ? 'PRE_LAUNCH' : 'AIMING' };
              });
            }}
            className={`group flex items-center justify-center gap-4 py-5 px-10 rounded-full rainbow-border animate-rotate-gradient bg-black/80 transition-all active:scale-95 text-center w-full min-w-[280px] lg:min-w-[400px] font-tech shrink-0 shadow-2xl ${!hasNFT ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
               <Loader2 className="w-8 h-8 text-white animate-spin shrink-0" />
            ) : !hasNFT ? (
               <Lock className="w-8 h-8 text-white/60 shrink-0 drop-shadow-md" />
            ) : (
               <Play className="w-8 h-8 fill-current text-white shrink-0 drop-shadow-md" />
            )}
            
            <div className="flex flex-col items-start text-center w-full">
              <span className="text-xl lg:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg whitespace-nowrap w-full">
                {isLoading ? 'Checking NFT...' : !hasNFT ? 'NFT Required to Play' : 'Play Game'}
              </span>
            </div>
          </button>
        </div>
      </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#9BA0A6] font-tech text-xs tracking-widest text-center w-full px-6"
      >
        © 2026 Puffer Fantasy studios
      </motion.div>
    </motion.div>
  );
};

export default HomeScreen;
