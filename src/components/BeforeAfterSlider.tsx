
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  title: string;
  master: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after, title, master }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div className="border border-white/5 bg-white/[0.02] p-4 group">
      <div 
        ref={containerRef}
        className="aspect-[4/5] overflow-hidden relative mb-4 cursor-col-resize select-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background) */}
        <img 
          src={after} 
          alt="After" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Before Image (Foreground with clip-path) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img 
            src={before} 
            alt="Before" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute inset-y-0 w-0.5 bg-gold z-20"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center shadow-xl border-4 border-dark">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-dark/50"></div>
              <div className="w-0.5 h-3 bg-dark/50"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 z-30 bg-dark/80 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-widest text-gold border border-gold/20">
          {title}
        </div>
        
        <div className="absolute bottom-4 left-4 z-30 px-2 py-1 bg-dark/60 backdrop-blur-sm text-[8px] uppercase tracking-widest text-white/60">
          Before
        </div>
        <div className="absolute bottom-4 right-4 z-30 px-2 py-1 bg-gold/80 backdrop-blur-sm text-[8px] uppercase tracking-widest text-dark font-bold">
          After
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-white/40 text-xs uppercase tracking-widest">Master: {master}</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-gold/20"></div>
          <div className="w-1 h-1 rounded-full bg-gold/40"></div>
          <div className="w-1 h-1 rounded-full bg-gold"></div>
        </div>
      </div>
    </div>
  );
};
