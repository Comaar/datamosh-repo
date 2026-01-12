
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
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined && !state.isExploding) {
      const deltaTime = time - lastTimeRef.current;
      const cappedDelta = Math.min(deltaTime, 32); // Prevent huge jumps on tab return
      
      setOffsets(prevOffsets => {
        return prevOffsets.map((y, i) => {
          if (items[i].isLocked) return y;

          const item = items[i];
          const speed = item.speed * 0.15 * cappedDelta;
          let newY = y + speed;
          
          // Teleport to top (no transition in CSS means no shooting effect)
          if (newY > 1600) {
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
      className={`relative w-full h-full perspective-1000 transition-all duration-[3000ms] ease-in-out ${state.isExploding ? 'scale-150 rotate-1' : 'scale-100 rotate-0'}`}
      style={{
        filter: state.isExploding ? 'url(#datamosh-glitch)' : 'none'
      }}
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
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '150px 150px' }}></div>
      </div>
    </div>
  );
};
