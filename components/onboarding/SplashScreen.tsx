import * as React from 'react';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../../types';

interface SplashScreenProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ setGameState }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(prev => ({ ...prev, state: 'HOME_SCREEN' }));
    }, 7000); // 7 seconds splash as requested
    return () => clearTimeout(timer);
  }, [setGameState]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
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
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="flex flex-col items-center text-center max-w-2xl">
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="text-[48px] lg:text-[140px] font-gaming leading-tight tracking-wider text-white mb-8 select-none px-6 text-center break-words"
        >
          Puffer <span className="text-white">Fantasy</span>
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "120px" }}
          transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-12 text-[#9BA0A6] font-tech flex items-center gap-6 text-xs lg:text-sm tracking-wide"
      >
        <span>Minigolf reimagined</span>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
