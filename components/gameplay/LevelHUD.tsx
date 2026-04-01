import * as React from 'react';
import { LogOut } from 'lucide-react';
import { LevelData } from '../../types';

interface LevelHUDProps {
  level: LevelData;
  strokes: number;
  timeLeft: number | null;
  exitCourse: () => void;
}

const LevelHUD: React.FC<LevelHUDProps> = ({ level, strokes, timeLeft, exitCourse }) => {
  return (
    <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-[500] flex flex-col items-end gap-2 pointer-events-none select-none">

      {/* HUD Row: [Desktop exit] [Level Card] [Letter Square] */}
      <div className="flex items-center shadow-2xl">

        {/* Desktop: Exit button sits to the left of the Level Card (before par number) */}
        <button
          onClick={exitCourse}
          className="hidden sm:flex pointer-events-auto mr-2 items-center justify-center gap-2 h-12 sm:h-16 w-20 sm:w-24 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all active:scale-95 flex-col shadow-lg"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[7px] sm:text-[8px] font-tech uppercase tracking-widest leading-none">Exit</span>
        </button>

        {/* Level Card */}
        <div className="relative -mr-4 h-12 sm:h-16 min-w-[110px] sm:min-w-[160px] pl-4 sm:pl-10 pr-6 sm:pr-10 flex flex-col justify-center bg-white/5 backdrop-blur-2xl border-y border-l border-white/10 rounded-l-2xl">
          <div className="flex flex-col gap-0 sm:gap-0.5 items-end text-right">
            <span className="text-[8px] sm:text-[10px] font-tech text-white/40 uppercase tracking-[0.2em] leading-none whitespace-nowrap">
              {level.name}
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-3xl font-tech font-black text-white leading-none drop-shadow-md">
                {strokes}
              </span>
              <span className="text-[10px] sm:text-xs font-tech text-white/40 uppercase tracking-widest">/ Par {level.par}</span>
            </div>

            {timeLeft !== null && (
              <div className={`mt-1 flex items-center gap-1.5 transition-all duration-300 ${timeLeft <= 5 ? 'text-red-500 scale-110' : 'text-white/60'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-[10px] sm:text-xs font-tech font-bold tracking-wider">
                  {Math.ceil(timeLeft)}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Letter Square */}
        <div className="relative z-10 w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl rainbow-border animate-rotate-gradient p-0.5 flex items-center justify-center bg-white/5 shadow-black/40 overflow-hidden shrink-0">
          <div className="w-full h-full rounded-xl sm:rounded-2xl bg-black/20 flex items-center justify-center border border-white/10 overflow-hidden">
            <span className="text-2xl sm:text-4xl font-gaming text-white/80 drop-shadow-lg">
              {level.letter}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: Exit button below the letter square – same width as the square (w-16) */}
      <button
        onClick={exitCourse}
        className="sm:hidden pointer-events-auto flex items-center justify-center gap-1.5 w-16 h-7 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all active:scale-95 shadow-lg"
      >
        <LogOut className="w-3 h-3" />
        <span className="text-[8px] font-tech uppercase tracking-wider leading-none">Exit</span>
      </button>

    </div>
  );
};

export default LevelHUD;
