import React, { useMemo, useState } from 'react';
import { MediaItemData } from '../types';
import { Anchor, AlertCircle } from 'lucide-react';

interface Props {
  data: MediaItemData;
  yOffset: number;
  isExploding: boolean;
  onToggleLock: () => void;
}

export const MediaItem: React.FC<Props> = ({ data, yOffset, isExploding, onToggleLock }) => {
  const [hasError, setHasError] = useState(false);

  const explosionTransform = useMemo(() => {
    if (data.isLocked) {
      return `translate3d(0px, ${yOffset}px, 0px) rotate(0deg)`;
    }
    const seed = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Extreme downward travel for the cascade run
    const tx = (Math.sin(seed) * 12); 
    const ty = yOffset + 4000; 
    const r = (Math.sin(seed) * 6);
    
    return `translate3d(${tx}px, ${ty}px, 0px) rotate(${r}deg)`;
  }, [data.id, data.isLocked, yOffset]);

  const itemStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.initialX}%`,
    top: 0,
    width: data.width,
    height: data.height,
    transform: isExploding 
      ? explosionTransform 
      : `translate3d(0, ${yOffset}px, 0)`,
    zIndex: data.isLocked ? 100 : Math.floor(data.parallax * 10),
    // Overflow visible is key: the parent container lets the filter results "bleed" out
    overflow: 'visible', 
    filter: isExploding && !data.isLocked ? 'url(#pixel-cascade-filter)' : 'none',
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onToggleLock();
      }}
      className={`group cursor-pointer transition-opacity duration-500
        ${data.isLocked ? 'ring-2 ring-cyan-400 z-[100] rounded-2xl' : ''}
        ${isExploding ? 'item-exploding mosh-pixelated animate-pixel-jitter' : 'item-waterfall'}`}
      style={itemStyle}
    >
      <div 
        className="w-full h-full relative bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden"
        style={{ 
          // Internal secondary filter for texture mixing
          filter: isExploding && !data.isLocked ? 'url(#pixel-mix-filter)' : 'none' 
        }}
      >
        {data.isLocked && (
          <div className="absolute top-4 right-4 z-50 bg-cyan-400 text-black p-1.5 rounded-full shadow-xl">
            <Anchor size={14} />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-950">
            <AlertCircle className="text-red-500 opacity-20" size={24} />
          </div>
        ) : (
          <div className="w-full h-full">
            {data.type === 'image' ? (
              <img 
                src={data.url} 
                alt="" 
                onError={() => setHasError(true)}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            ) : (
              <video 
                src={data.url} 
                autoPlay 
                muted 
                loop 
                playsInline
                onError={() => setHasError(true)}
                className="w-full h-full object-cover pointer-events-none"
              />
            )}
            
            {isExploding && !data.isLocked && (
               <div className="absolute inset-0 bg-cyan-400/10 mix-blend-color animate-pulse" />
            )}
          </div>
        )}
      </div>

      {!isExploding && !data.isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-mono text-white/0 group-hover:text-white/30 tracking-[0.5em] uppercase transition-all">
            LOCKED
          </span>
        </div>
      )}
    </div>
  );
};