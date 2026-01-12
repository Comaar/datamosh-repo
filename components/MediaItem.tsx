
import React, { useMemo } from 'react';
import { MediaItemData } from '../types';
import { Anchor } from 'lucide-react';

interface Props {
  data: MediaItemData;
  yOffset: number;
  isExploding: boolean;
  onToggleLock: () => void;
}

export const MediaItem: React.FC<Props> = ({ data, yOffset, isExploding, onToggleLock }) => {
  const explosionTransform = useMemo(() => {
    // Locked items resist explosion entirely
    if (data.isLocked) {
      return `translate3d(0px, ${yOffset}px, 0px) rotate(0deg)`;
    }

    const seed = parseInt(data.id) * 137;
    // Explosion vectors: tx (sideways), ty (mostly downwards to simulate falling debris)
    const tx = (Math.sin(seed) * 1000);
    const ty = (Math.abs(Math.cos(seed)) * 1400) + 200; // Biased downwards
    const r = (Math.sin(seed * 2) * 480);
    const s = 1.2 + Math.random() * 1.5;
    
    return `translate3d(${tx}px, ${ty}px, 400px) rotate(${r}deg) scale(${s})`;
  }, [data.id, data.isLocked, yOffset]);

  // The critical fix: Transition is only applied when EXPLODING.
  // When in waterfall mode, transform is updated via RAF without CSS transition to allow instant resets.
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${data.initialX}%`,
    top: 0,
    width: data.width,
    height: data.height,
    transform: isExploding 
      ? explosionTransform 
      : `translate3d(0, ${yOffset}px, 0)`,
    zIndex: data.isLocked ? 100 : Math.floor(data.parallax * 10),
    opacity: isExploding && !data.isLocked ? 0.4 : 1,
    // Use the CSS class for transitions based on state
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onToggleLock();
      }}
      className={`group overflow-hidden rounded-xl bg-zinc-900 ring-2 cursor-pointer shadow-2xl
        ${data.isLocked ? 'ring-cyan-400 ring-offset-4 ring-offset-black scale-105 z-[100]' : 'ring-white/10 hover:ring-white/50'}
        ${isExploding ? 'item-exploding' : 'item-waterfall'}`}
      style={style}
    >
      {data.isLocked && (
        <div className="absolute top-4 right-4 z-50 bg-cyan-400 text-black p-1.5 rounded-full shadow-lg animate-float">
          <Anchor size={14} />
        </div>
      )}

      {data.type === 'image' ? (
        <img 
          src={data.url} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] pointer-events-none"
          loading="lazy"
        />
      ) : (
        <video 
          src={data.url} 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] pointer-events-none"
        />
      )}
      
      {/* Interaction Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${data.isLocked ? 'bg-cyan-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-mono text-white/60 tracking-[0.2em] uppercase">
            {data.isLocked ? 'LOCKED' : `ASSET_${data.id.padStart(3, '0')}`}
          </span>
        </div>
        <span className="text-xs text-white/80 font-medium">
          {data.isLocked ? 'Anchor Active' : 'Click to Anchor'}
        </span>
      </div>

      {/* Mosh Interference Layer */}
      {isExploding && (
        <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay animate-pulse pointer-events-none" />
      )}
    </div>
  );
};
