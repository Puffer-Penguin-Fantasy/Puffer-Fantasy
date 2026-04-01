import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onJoystickStart: () => void;
  onJoystickMove: (dx: number, dy: number) => void;
  onJoystickEnd: () => void;
  radius?: number;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ 
  onJoystickStart, 
  onJoystickMove, 
  onJoystickEnd, 
  radius = 60 
}) => {
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const centerRef = useRef({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);

  // Store callbacks in refs to avoid stale closures in event listeners
  const callbacksRef = useRef({ onJoystickMove, onJoystickEnd });
  useEffect(() => {
    callbacksRef.current = { onJoystickMove, onJoystickEnd };
  }, [onJoystickMove, onJoystickEnd]);

  const calculateKnobPos = (clientX: number, clientY: number) => {
    let dx = clientX - centerRef.current.x;
    let dy = clientY - centerRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }
    return { x: dx, y: dy };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only process primary interactions
    if (!e.isPrimary) return;
    
    // Prevent default touch behaviors like scrolling
    e.preventDefault();
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    setActive(true);
    setKnobPos({ x: 0, y: 0 });
    onJoystickStart();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!active || !e.isPrimary) return;
    e.preventDefault();
    const pos = calculateKnobPos(e.clientX, e.clientY);
    setKnobPos(pos);
    callbacksRef.current.onJoystickMove(pos.x, pos.y);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!active || !e.isPrimary) return;
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    callbacksRef.current.onJoystickEnd();
  };

  useEffect(() => {
    if (active) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [active]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[200] touch-none select-none md:hidden" style={{ pointerEvents: 'auto' }}>
      <div 
        ref={baseRef}
        className="relative flex items-center justify-center rounded-full border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl"
        style={{ width: radius * 2, height: radius * 2 }}
        onPointerDown={handlePointerDown}
      >
        {/* Subtle inner marking */}
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute w-2 h-2 rounded-full bg-white/20" />
        
        {/* Thumb stick */}
        <div 
          className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_0_15px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-center"
          style={{ 
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: active ? 'none' : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Stick inner grip */}
          <div className="w-6 h-6 rounded-full border border-white/10 bg-black/40" />
        </div>
        
        {/* Glow effect when active */}
        <div 
          className="absolute w-14 h-14 rounded-full bg-white/10 blur-xl pointer-events-none"
          style={{ 
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            opacity: active ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        />
      </div>
    </div>
  );
};

export default VirtualJoystick;
