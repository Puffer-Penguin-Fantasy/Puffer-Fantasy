/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import GameCanvas from './components/GameCanvas';
import { LEVELS } from './Level';
import { GameState } from './types';
import { ENABLE_DEV_TOOLS } from './constants';
import { Loader2, RotateCcw, FastForward, Edit, User, Check, Wallet, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon } from './components/Icons';
import Footer from './components/Footer';
import GlobalHUD from './components/gameplay/GlobalHUD';
import ActionButtons from './components/gameplay/ActionButtons';
import GameOverlay from './components/gameplay/GameOverlay';
import LevelHUD from './components/gameplay/LevelHUD';
import useAudio from "./hooks/useAudio";
import { getPath } from "./utils/path";
import InfoDialog from './components/builds/infoDialog'
import Onboarding from './components/onboarding/Onboarding';
import { useWallet } from '@razorlabs/razorkit';
import { useArcticPenguin } from './hooks/useArcticPenguin';
import { calculateLevelPoints } from './utils/points';
import { db } from './services/firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevelIndex: 0,
    strokes: 0,
    totalScore: 0,
    points: 0,
    lastHolePoints: 0,
    state: 'START_SCREEN',
    bestScores: {},
    levelPoints: {},
    completedLevels: [],
    resetUnlocked: false,
    isEligibleToAdvance: false,
    performanceGoalMet: false,
  });
  
  const [retryCount, setRetryCount] = useState(0);
  const [nextLevelLoading, setNextLevelLoading] = useState(false);
  const [caddyDismissed, setCaddyDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  const { connected, address } = useWallet();
  const { data: arcticData, isLoading: arcticLoading } = useArcticPenguin(address);

  const currentLevel = LEVELS[gameState.currentLevelIndex];

  // Persist current level across page reloads

  // Initialize/Reset Timer when level changes or is retried
  useEffect(() => {
    if (currentLevel.maxTime !== undefined) {
      if (gameState.state === 'COUNTDOWN') {
        setTimeLeft(currentLevel.maxTime);
      }
    } else {
      setTimeLeft(null);
    }
  }, [gameState.currentLevelIndex, retryCount, gameState.state]);

  // Pre-game Countdown Logic (3, 2, 1, GO!)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (gameState.state === 'COUNTDOWN') {
      setCountdownValue(3);
      let count = 3;
      // Play first countdown tick immediately
      playForeground(getPath("/media/audio/sfx/global/countdown.mp3"), 0.6);
      
      interval = setInterval(() => {
        count -= 1;
        if (count === 0) {
          setCountdownValue(null);
          setGameState(prev => ({ ...prev, state: 'AIMING' }));
        } else {
          setCountdownValue(count);
          playForeground(getPath("/media/audio/sfx/global/countdown.mp3"), 0.6);
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [gameState.state]);

  // Main Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // Timer only runs during active gameplay
    const isActive = gameState.state === 'AIMING' || gameState.state === 'MOVING';
    
    if (isActive && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 0) return prev - 1;
          return 0;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Time's up! Fail the level only if we are still active
      setGameState(prev => ({ ...prev, state: 'LEVEL_FAILED' }));
    }

    return () => { if (interval) clearInterval(interval); };
  }, [gameState.state, timeLeft]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const userCount = (arcticData as any)?.count || 0;
  const meetsNFTRequirement = useMemo(() => {
    const requiredCount = currentLevel.requiredNFTCount || 1;
    const maxCount = currentLevel.maxNFTCount;
    const isExact = currentLevel.exactNFTMatch || false;
    
    let isMet = isExact ? userCount === requiredCount : userCount >= requiredCount;
    if (maxCount !== undefined) {
      isMet = isMet && userCount <= maxCount;
    }
    
    // Strict debug logging to trace the bug
    console.log(`[Level ${gameState.currentLevelIndex}] NFT Check: userCount=${userCount}, min=${requiredCount}, max=${maxCount}, exact=${isExact} -> Met=${isMet}`);
    return isMet;
  }, [currentLevel, arcticData, userCount, gameState.currentLevelIndex]);

  const meetsTotalPointsRequirement = useMemo(() => {
    if (!currentLevel.requiredTotalPoints) return true;
    return gameState.points >= currentLevel.requiredTotalPoints;
  }, [currentLevel, gameState.points]);

  const isEligibleToPlay = meetsNFTRequirement && meetsTotalPointsRequirement;

  const nextLevelReqCount = useMemo(() => {
    if (gameState.currentLevelIndex >= LEVELS.length - 1) return null;
    const nxt = LEVELS[gameState.currentLevelIndex + 1];
    return nxt?.requiredNFTCount || 1;
  }, [gameState.currentLevelIndex]);

  const showsNextLevelWarning = nextLevelReqCount !== null && userCount < nextLevelReqCount;

  const totalPar = LEVELS.reduce((acc, l) => acc + l.par, 0);

  const { playForeground, playBackground, preloadCache } = useAudio();

  const audioFiles = [
    getPath("/media/audio/sfx/global/lose.mp3"),
    getPath("/media/audio/sfx/global/win.mp3"),
    getPath("/media/audio/sfx/global/buttonclick.mp3"),
    getPath("/media/audio/sfx/global/countdown.mp3"),
    getPath("/media/audio/sfx/minigolf/goal.mp3"),
    getPath("/media/audio/sfx/minigolf/hitwall.mp3"),
    getPath("/media/audio/sfx/minigolf/intohole.mp3"),
    getPath("/media/audio/sfx/minigolf/outofholehole.mp3"),
    getPath("/media/audio/sfx/minigolf/putt.mp3"),
    getPath("/media/audio/sfx/minigolf/watersplash.mp3"),
    getPath("/media/audio/sfx/minigolf/sand.mp3"),
    getPath("/media/audio/music/background.mp3"),
  ];

  // Handle Background Music
  useEffect(() => {
    if (gameState.state === 'HOME_SCREEN' || gameState.state === 'LEVEL_SELECT') {
      playBackground(getPath("/media/audio/music/background.mp3"), 0.3);
    } else if (gameState.state === 'AIMING' || gameState.state === 'MOVING' || gameState.state === 'COUNTDOWN') {
      playBackground(getPath("/media/audio/music/background.mp3"), 0.2);
    }
  }, [gameState.state, playBackground]);

  useEffect(() => {
    preloadCache(audioFiles);
  }, []);

  const totalBestDiffInfo = useMemo(() => {
    let totalDiff = 0;
    let playedCount = 0;
    LEVELS.forEach((level, index) => {
      const best = gameState.bestScores[index];
      if (best !== undefined) {
        totalDiff += (best - level.par);
        playedCount++;
      }
    });
    const diffString = playedCount === 0 ? "—" : (totalDiff === 0 ? "Par" : (totalDiff > 0 ? `+${totalDiff}` : totalDiff.toString()));
    return { totalDiff, diffString, playedCount };
  }, [gameState.bestScores]);

  // Sync lifetime points from Firestore on connection
  useEffect(() => {
    if (connected && address) {
      const fetchPoints = async () => {
        try {
          const userDoc = doc(db, 'users', address);
          const snap = await getDoc(userDoc);
          
          if (snap.exists()) {
            const data = snap.data();
            if (data.totalPoints !== undefined) {
              setGameState(prev => ({ ...prev, points: data.totalPoints }));
              console.log("Total points loaded from Firestore:", data.totalPoints);
            }
            if (data.levelPoints !== undefined) {
              setGameState(prev => ({ ...prev, levelPoints: data.levelPoints }));
            }
            if (data.completedLevels !== undefined) {
              setGameState(prev => ({ ...prev, completedLevels: data.completedLevels }));
            }
            if (data.bestScores !== undefined) {
              setGameState(prev => ({ ...prev, bestScores: data.bestScores }));
            }
            // Update lastSeen separately
            await updateDoc(userDoc, { lastSeen: serverTimestamp() });
          } else {
            // New user initialization
            await setDoc(userDoc, {
              address,
              totalPoints: 0,
              completedLevels: [],
              bestScores: {},
              levelPoints: {},
              lastSeen: serverTimestamp(),
              connected: true
            });
          }
        } catch (error) {
          console.error("Error syncing with Firestore:", error);
        }
      };
      fetchPoints();
    }
  }, [connected, address]);


  useEffect(() => {
    setCaddyDismissed(false);
  }, [gameState.currentLevelIndex, retryCount]); 

  const handleStroke = () => {
    setGameState(prev => ({
      ...prev,
      strokes: prev.strokes + 1,
      state: 'MOVING'
    }));
  };
  const handleHole = useCallback(() => {
    const finalStrokes = gameState.strokes;
    const currentLvlIndex = gameState.currentLevelIndex;
    let holePointsRaw = calculateLevelPoints(finalStrokes);
    
    // Apply best bonus multiplier if eligible
    if (currentLevel.bonusObjectives && currentLevel.bonusObjectives.length > 0) {
        const sorted = [...currentLevel.bonusObjectives].sort((a, b) => a.maxStrokes - b.maxStrokes);
        for (const obj of sorted) {
            if (finalStrokes <= obj.maxStrokes) {
                holePointsRaw *= obj.multiplier;
                break;
            }
        }
    }
    
    // Evaluate goals
    const hasRequiredPoints = currentLevel.requiredPoints ? holePointsRaw >= currentLevel.requiredPoints : true;
    const hasRequiredStrokes = currentLevel.maxStrokes ? finalStrokes <= currentLevel.maxStrokes : true;
    const hasRequiredTime = currentLevel.maxTime ? (timeLeft !== null && timeLeft > 0) : true;
    
    const isEligibleToAdvance = hasRequiredPoints && hasRequiredStrokes && hasRequiredTime && isEligibleToPlay;
    const isFinalHole = currentLvlIndex >= (LEVELS.length - 1);
    
    // Final points awarded only if requirements (including time) are met
    const holePoints = isEligibleToAdvance ? holePointsRaw : 0;

    if (holePoints === 0 && !isEligibleToAdvance) {
      playForeground(getPath("/media/audio/sfx/global/lose.mp3"));
      setGameState(prev => ({ ...prev, state: 'LEVEL_FAILED' }));
      return;
    }

    // Update Local State once - no side effects should be inside here
    setGameState(prev => {
        const newBestScores = { ...prev.bestScores };
        const currentBest = newBestScores[currentLvlIndex];
        if (currentBest === undefined || finalStrokes < currentBest) {
          newBestScores[currentLvlIndex] = finalStrokes;
        }

        const newCompletedLevels = [...prev.completedLevels];
        const newLevelPoints = { ...prev.levelPoints };
        
        if (isEligibleToAdvance) {
            if (!newCompletedLevels.includes(currentLvlIndex)) {
                newCompletedLevels.push(currentLvlIndex);
            }
            newLevelPoints[currentLvlIndex] = holePoints;
        }

        return { 
          ...prev, 
          state: isFinalHole ? 'GAME_OVER' : 'LEVEL_COMPLETE', 
          points: prev.points + holePoints,
          levelPoints: newLevelPoints,
          lastHolePoints: holePoints,
          bestScores: newBestScores,
          completedLevels: newCompletedLevels,
          totalScore: isFinalHole ? prev.totalScore + finalStrokes : prev.totalScore,
          resetUnlocked: isFinalHole ? true : prev.resetUnlocked,
          performanceGoalMet: hasRequiredPoints && hasRequiredStrokes,
          isEligibleToAdvance
        };
    });

    // Sync to Firestore outside state callback to prevent double-increments during React's double-render in dev
    if (connected && address) {
        const userDoc = doc(db, 'users', address);
        const updateData: any = {
            totalPoints: increment(holePoints),
            lastSeen: serverTimestamp()
        };

        // If this level was completed successfully, add it to the completed set and save granular points
        if (isEligibleToAdvance) {
            if (!gameState.completedLevels.includes(currentLvlIndex)) {
                updateData.completedLevels = [...gameState.completedLevels, currentLvlIndex];
            }
            updateData[`levelPoints.${currentLvlIndex}`] = holePoints;
            // Explicitly store Par and Hit for verification
            updateData[`levelStats.${currentLvlIndex}.par`] = currentLevel.par;
            updateData[`levelStats.${currentLvlIndex}.hit`] = finalStrokes;
        }

        // Track best scores
        const currentBest = gameState.bestScores[currentLvlIndex];
        if (currentBest === undefined || finalStrokes < currentBest) {
            updateData[`bestScores.${currentLvlIndex}`] = finalStrokes;
        }

        updateDoc(userDoc, updateData).catch(e => console.error("Error updating Firestore points:", e));
    }

    playForeground(getPath("/media/audio/sfx/minigolf/goal.mp3"));
  }, [currentLevel, gameState.strokes, gameState.currentLevelIndex, playForeground, connected, address, arcticData?.hasNFT]);

  // Handle late-stage NFT eligibility (if user gets NFT while looking at success screen)
  useEffect(() => {
    const currentIdx = gameState.currentLevelIndex;
    if (gameState.state === 'LEVEL_COMPLETE' && gameState.performanceGoalMet && meetsNFTRequirement && !gameState.completedLevels.includes(currentIdx)) {
      let holePoints = calculateLevelPoints(gameState.strokes);
      
      const levelObj = LEVELS[currentIdx];
      if (levelObj.bonusObjectives && levelObj.bonusObjectives.length > 0) {
          const sorted = [...levelObj.bonusObjectives].sort((a, b) => a.maxStrokes - b.maxStrokes);
          for (const obj of sorted) {
              if (gameState.strokes <= obj.maxStrokes) {
                  holePoints *= obj.multiplier;
                  break;
              }
          }
      }
      
      setGameState(prev => {
        if (prev.completedLevels.includes(currentIdx)) return prev;
        const newCompletedLevels = [...prev.completedLevels, currentIdx];
        const newLevelPoints = { ...prev.levelPoints, [currentIdx]: holePoints };
        return {
          ...prev,
          completedLevels: newCompletedLevels,
          levelPoints: newLevelPoints,
          points: prev.points + holePoints,
          isEligibleToAdvance: true
        };
      });

        if (connected && address) {
          const userDoc = doc(db, 'users', address);
          updateDoc(userDoc, {
            totalPoints: increment(holePoints),
            [`levelPoints.${currentIdx}`]: holePoints,
            [`levelStats.${currentIdx}.par`]: levelObj.par,
            [`levelStats.${currentIdx}.hit`]: gameState.strokes,
            completedLevels: [...gameState.completedLevels, currentIdx],
            lastSeen: serverTimestamp()
          }).catch(e => console.error("Error updating Firestore points for late NFT:", e));
        }
    }
  }, [meetsNFTRequirement, gameState.state, gameState.performanceGoalMet, gameState.currentLevelIndex, connected, address]);

  const nextLevel = async () => {
    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));

    if (gameState.currentLevelIndex >= LEVELS.length - 1) {
        setGameState(prev => ({ 
            ...prev, 
            state: 'GAME_OVER',
            totalScore: prev.totalScore + prev.strokes,
            resetUnlocked: true
        }));
        return;
    }

    setNextLevelLoading(true);
    const nextIndex = gameState.currentLevelIndex + 1;
    
    setGameState(prev => ({
        ...prev,
        currentLevelIndex: nextIndex,
        totalScore: prev.totalScore + prev.strokes,
        strokes: 0,
        state: (LEVELS[nextIndex].maxTime !== undefined && !prev.completedLevels.includes(nextIndex)) ? 'PRE_LAUNCH' : 'AIMING',
    }));
    
    setNextLevelLoading(false);
  };

  const prevLevel = () => {
    if (gameState.currentLevelIndex > 0) {
      playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
      setGameState(prev => ({
        ...prev,
        currentLevelIndex: prev.currentLevelIndex - 1,
        strokes: 0,
        state: (LEVELS[prev.currentLevelIndex - 1].maxTime !== undefined && !prev.completedLevels.includes(prev.currentLevelIndex - 1)) ? 'PRE_LAUNCH' : 'AIMING',
      }));
    }
  };

  const resetGame = async () => {
    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
    setGameState(prev => ({
        ...prev,
        currentLevelIndex: 0,
        strokes: 0,
        totalScore: 0,
        points: 0,
        state: (LEVELS[0].maxTime !== undefined && !prev.completedLevels.includes(0)) ? 'PRE_LAUNCH' : 'AIMING',
    }));
    setRetryCount(0);
  };

  const retryLevel = () => {
    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
    
    const currentLvlIndex = gameState.currentLevelIndex;
    const oldLevelPoints = gameState.levelPoints[currentLvlIndex] || 0;

    // Reset points AND Firestore data on replay as requested
    if (connected && address) {
      const userDoc = doc(db, 'users', address);
      
      // Filter out the current level from the completed set
      const updatedCompletedLevels = gameState.completedLevels.filter(idx => idx !== currentLvlIndex);
      const updatedLevelPoints = { ...gameState.levelPoints };
      delete updatedLevelPoints[currentLvlIndex];

      updateDoc(userDoc, {
        totalPoints: increment(-oldLevelPoints), // Subtract this level's points
        completedLevels: updatedCompletedLevels,
        [`levelPoints.${currentLvlIndex}`]: 0, // Explicitly clear it or set to 0
        lastSeen: serverTimestamp()
      }).catch(e => console.error("Error resetting Firestore data:", e));
    }

    setGameState(prev => {
        const newLevelPoints = { ...prev.levelPoints };
        delete newLevelPoints[currentLvlIndex];
        
        return {
            ...prev,
            strokes: 0,
            points: Math.max(0, prev.points - oldLevelPoints),
            levelPoints: newLevelPoints,
            lastHolePoints: 0,
            completedLevels: prev.completedLevels.filter(idx => idx !== currentLvlIndex),
            state: currentLevel.maxTime !== undefined ? 'PRE_LAUNCH' : 'AIMING',
        }
    });
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    if (gameState.state === 'GAME_OVER') {
      playForeground(getPath("/media/audio/sfx/global/win.mp3"));
    } else if (gameState.state === 'LEVEL_COMPLETE') {
      playForeground(getPath("/media/audio/sfx/minigolf/goal.mp3"));
    }
  }, [gameState.state, playForeground]);

  const mulligan = () => {
    playForeground(getPath("/media/audio/sfx/global/buttonclick.mp3"));
    setGameState(prev => ({
      ...prev,
      strokes: prev.strokes + 1, 
      state: 'AIMING',
    }));
    setRetryCount(prev => prev + 1);
  };

  return (
    <>
    <Onboarding 
      gameState={gameState}
      setGameState={setGameState}
      playForeground={playForeground}
      getPath={getPath}
      setShowInfo={setShowInfo}
    />

    <GlobalHUD 
      gameState={gameState}
      setGameState={setGameState}
      currentLevel={currentLevel}
      isEligibleToPlay={isEligibleToPlay}
      meetsNFTRequirement={meetsNFTRequirement}
      meetsTotalPointsRequirement={meetsTotalPointsRequirement}
      arcticLoading={arcticLoading}
      arcticData={arcticData}
      playForeground={playForeground}
      getPath={getPath}
    />
    {gameState.state !== 'START_SCREEN' && gameState.state !== 'HOME_SCREEN' && gameState.state !== 'LEVEL_SELECT' && (
      <LevelHUD 
        level={currentLevel} 
        strokes={gameState.strokes} 
        timeLeft={['AIMING', 'MOVING', 'COUNTDOWN', 'PRE_LAUNCH'].includes(gameState.state) ? timeLeft : null}
        exitCourse={() => {
          playForeground(getPath('/media/audio/sfx/global/buttonclick.mp3'));
          setGameState(prev => ({ ...prev, state: 'HOME_SCREEN', strokes: 0 }));
        }}
      />
    )}

    {(gameState.state !== 'START_SCREEN' && gameState.state !== 'HOME_SCREEN' && gameState.state !== 'LEVEL_SELECT') && (
      <>
        <div className="w-full h-[calc(100dvh-100px)] bg-black font-sans overflow-hidden relative flex flex-col items-center justify-center">
          <GameCanvas 
              key={`${currentLevel.id}-${retryCount}`}
              level={currentLevel}
              onStroke={handleStroke}
              onHole={handleHole}
              disabled={
                (gameState.completedLevels.includes(gameState.currentLevelIndex) && gameState.state !== 'LEVEL_COMPLETE') || 
                (!isEligibleToPlay && !arcticLoading && connected)
              }
          />
          
          {/* Missing NFT Lock Overlay */}
          {!meetsNFTRequirement && !arcticLoading && connected && gameState.state === 'AIMING' && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50">
               <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mb-2 sm:mb-4" />
               <h3 className="text-xl sm:text-2xl font-gaming text-white tracking-widest uppercase mb-1 sm:mb-2">Level Locked</h3>
               <p className="text-white/80 font-tech text-xs sm:text-base">You must hold {currentLevel.exactNFTMatch ? 'exactly' : 'at least'} {currentLevel.requiredNFTCount || 1} NFT{(currentLevel.requiredNFTCount || 1) !== 1 ? 's' : ''} to play this level.</p>
             </div>
          )}

          <GameOverlay
            gameState={gameState}
            setGameState={setGameState}
            currentLevel={currentLevel}
            countdownValue={countdownValue}
            LEVELS_LENGTH={LEVELS.length}
            userCount={userCount}
            meetsNFTRequirement={meetsNFTRequirement}
            meetsTotalPointsRequirement={meetsTotalPointsRequirement}
            calculateLevelPoints={calculateLevelPoints}
            showsNextLevelWarning={showsNextLevelWarning}
            nextLevelReqCount={nextLevelReqCount}
            nextLevelLoading={nextLevelLoading}
            isEligibleToPlay={isEligibleToPlay}
            retryLevel={retryLevel}
            nextLevel={nextLevel}
            resetGame={resetGame}
            totalPar={totalPar}
            connected={connected}
            arcticLoading={arcticLoading}
            arcticData={arcticData}
            shortAddress={shortAddress}
            playForeground={playForeground}
            getPath={getPath}
          />
        </div>

        {/* Bottom bar: Hole pill (left) + Action Buttons (right) */}
        <div className="fixed bottom-0 left-0 right-0 h-[100px] flex items-center justify-between px-4 z-[150] pointer-events-none">
          <div className="pointer-events-auto">
            <Footer
              gameState={gameState}
              numLevels={LEVELS.length}
            />
          </div>
          <ActionButtons
            gameState={gameState}
            showsNextLevelWarning={showsNextLevelWarning}
            nextLevelReqCount={nextLevelReqCount}
            nextLevelLoading={nextLevelLoading}
            isEligibleToPlay={isEligibleToPlay}
            prevLevel={prevLevel}
            retryLevel={retryLevel}
            nextLevel={nextLevel}
            playForeground={playForeground}
            getPath={getPath}
          />
        </div>
      </>
    )}

    {showInfo && (
      <InfoDialog 
        title="Can you get a hole in one?" 
        goal="Line up your shot and take a swing! Watch out for obstacles and test your skills." 
        onClose={() => setShowInfo(false)} 
      />
    )}
    </>
  );
};

export default App;
