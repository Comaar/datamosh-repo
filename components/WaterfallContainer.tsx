import React, { useEffect, useRef, useState } from 'react';
import { MediaItemData, WaterfallState } from '../types';
import { MediaItem } from './MediaItem';

interface Props {
  items: MediaItemData[];
  state: WaterfallState;
  onToggleLock: (id: string) => void;
}

export const WaterfallContainer: React.FC<Props> = ({ items, state, onToggleLock }) => {
  const [offsets, setOffsets] = useState<number[]>(new Array(items.length).fill(-100));
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined && !state.isExploding) {
      const deltaTime = time - lastTimeRef.current;
      const cappedDelta = Math.min(deltaTime, 32); 
      
      setOffsets(prevOffsets => {
        return prevOffsets.map((y, i) => {
          if (items[i].isLocked) return y;

          const item = items[i];
          const speed = item.speed * 0.18 * cappedDelta;
          let newY = y + speed;
          
          if (newY > 1500) {
            return -item.height - 400;
          }
          return newY;
        });
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    setOffsets(items.map((it, idx) => (idx * -380) - 200));
  }, [items.length]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [state.isExploding, items]);

  return (
    <div 
      className={`relative w-full h-full perspective-1000 transition-transform duration-[4000ms] ease-out ${state.isExploding ? 'scale-[1.02]' : 'scale-100'}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {items.map((item, index) => (
        <MediaItem 
          key={item.id} 
          data={item} 
          yOffset={offsets[index]} 
          isExploding={state.isExploding}
          onToggleLock={() => onToggleLock(item.id)}
        />
      ))}
      
      {/* Optimized Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '120px 120px',
        }}></div>
      </div>

      {state.isExploding && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-[60] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      )}
    </div>
  );
};