import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GameState } from '../../types';
import SplashScreen from './SplashScreen';
import HomeScreen from './HomeScreen';
import LevelSelect from './LevelSelect';
import { User, Wallet, Layers, HelpCircle, LogOut, Check, Loader2 } from 'lucide-react';
import { useWallet, ConnectModal } from '@razorlabs/razorkit';
import { useArcticPenguin } from '../../hooks/useArcticPenguin';
import { db } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface OnboardingProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  playForeground: (url: string) => void;
  getPath: (path: string) => string;
  setShowInfo: (show: boolean) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({
  gameState,
  setGameState,
  playForeground,
  getPath,
  setShowInfo,
}) => {
  const { connected, address, disconnect } = useWallet();
  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const { data: arcticData, isLoading: arcticLoading } = useArcticPenguin(address);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  // Close modal when connected
  React.useEffect(() => {
    if (connected) {
      setShowWalletModal(false);
    }
  }, [connected]);

  // Only handle states related to onboarding/navigation
  const onboardingStates = ['START_SCREEN', 'HOME_SCREEN', 'LEVEL_SELECT'];
  
  if (!onboardingStates.includes(gameState.state)) {
    return null;
  }

  const showHeader = ['HOME_SCREEN'].includes(gameState.state);

  return (
    <div className="relative w-full h-full">
      {/* Header HUD */}
      <AnimatePresence>
        {showHeader && (
          <motion.header
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-8 left-8 z-[150] flex flex-col items-start gap-4 pointer-events-none"
          >
            {/* Profile & Wallet Row */}
            <div className="flex items-center gap-4 pointer-events-auto mb-2">
              {/* PFP Frame */}
              <div 
                onClick={() => {
                  if (connected && !arcticData.hasNFT) {
                    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
                    window.open('https://movement.tradeport.xyz', '_blank');
                  }
                }}
                className={`relative w-20 h-20 rounded-xl rainbow-border animate-rotate-gradient p-0.5 flex items-center justify-center bg-black/60 shadow-lg shadow-black/20 group transition-transform active:scale-95 ${connected && !arcticData.hasNFT ? 'cursor-pointer' : ''}`}
              >
                <div className="w-full h-full rounded-xl bg-[#0d0d0d] flex items-center justify-center border border-white/5 overflow-hidden">
                  {arcticLoading ? (
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                  ) : arcticData.hasNFT && arcticData.nftDetails?.image && arcticData.nftDetails.image !== '' ? (
                    <img 
                      src={arcticData.nftDetails.image} 
                      alt="PFP" 
                      crossOrigin="anonymous" 
                      className="w-full h-full object-cover scale-110" 
                    />
                  ) : (
                    <User className="w-8 h-8 text-white/40 group-hover:text-white/80 transition-colors" />
                  )}
                </div>


              </div>

              {/* Connect/Disconnect Wallet Button */}
              {connected ? (
                <button
                  onClick={() => {
                    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
                    disconnect();
                  }}
                  className="group flex items-center gap-3 py-3 px-6 rounded-full rainbow-border animate-rotate-gradient bg-black/60 font-tech text-xs tracking-widest uppercase text-emerald-400 shadow-xl shadow-black/40 transition-all active:scale-95 hover:brightness-110"
                >
                  <Check className="w-4 h-4" />
                  <span>{shortAddress || 'Connected'}</span>
                  <div className="w-px h-3 bg-white/20 mx-1" />
                  <LogOut className="w-4 h-4 opacity-60 group-hover:opacity-100 text-white transition-opacity" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
                    setShowWalletModal(true);
                  }}
                  className="flex items-center gap-3 py-3 px-6 rounded-full rainbow-border animate-rotate-gradient bg-black/60 font-tech text-xs tracking-widest uppercase text-white shadow-xl shadow-black/40 transition-all active:scale-95 hover:brightness-110"
                >
                  <Wallet className="w-4 h-4 text-white/90" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Navigation Stack */}
            <div className="flex flex-col gap-3 pointer-events-auto">
              {gameState.state !== 'LEVEL_SELECT' && (
                <button
                  disabled={!arcticData.hasNFT}
                  onClick={() => {
                    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
                    setGameState(prev => ({ ...prev, state: 'LEVEL_SELECT' }));
                  }}
                  className={`group flex items-center justify-start gap-4 py-3 px-6 rounded-full rainbow-border animate-rotate-gradient bg-black/60 transition-all active:scale-95 text-left w-full min-w-[200px] font-tech ${!arcticData.hasNFT ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <Layers className={`w-5 h-5 shrink-0 ${!arcticData.hasNFT ? 'text-white/40' : 'text-purple-500'}`} />
                  <span className="text-sm font-medium text-white leading-tight uppercase tracking-wider">
                    {arcticData.hasNFT ? 'Levels' : 'Levels Locked'}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
                  setShowInfo(true);
                }}
                className="group flex items-center justify-start gap-4 py-3 px-6 rounded-full rainbow-border animate-rotate-gradient bg-black/60 transition-all active:scale-95 text-left w-full min-w-[200px] font-tech"
              >
                <HelpCircle className="w-5 h-5 text-teal-500 shrink-0" />
                <span className="text-sm font-medium text-white leading-tight uppercase tracking-wider">How to Play</span>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState.state === 'START_SCREEN' && (
          <SplashScreen 
            key="splash" 
            setGameState={setGameState} 
          />
        )}

        {gameState.state === 'HOME_SCREEN' && (
          <HomeScreen
            key="home"
            gameState={gameState}
            setGameState={setGameState}
            playForeground={playForeground}
            getPath={getPath}
            setShowInfo={setShowInfo}
            hasNFT={arcticData.hasNFT}
            isLoading={arcticLoading}
          />
        )}

        {gameState.state === 'LEVEL_SELECT' && (
          <LevelSelect
            key="level-select"
            gameState={gameState}
            setGameState={setGameState}
            playForeground={playForeground}
            getPath={getPath}
            userCount={(arcticData as any)?.count || 0}
          />
        )}
      </AnimatePresence>

      {showWalletModal && (
        <ConnectModal 
          open={showWalletModal} 
          onOpenChange={setShowWalletModal}
        />
      )}
    </div>
  );
};

export default Onboarding;
