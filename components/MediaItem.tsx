
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
    const tx = (Math.sin(seed) * 1000);
    const ty = (Math.abs(Math.cos(seed)) * 1400) + 200;
    const r = (Math.sin(seed * 2) * 480);
    const s = 1.2 + Math.random() * 1.5;
    return `translate3d(${tx}px, ${ty}px, 400px) rotate(${r}deg) scale(${s})`;
  }, [data.id, data.isLocked, yOffset]);

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
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onToggleLock();
      }}
      className={`group overflow-hidden rounded-xl bg-zinc-900 ring-2 cursor-pointer shadow-2xl
        ${data.isLocked ? 'ring-cyan-400 ring-offset-4 ring-offset-black scale-105 z-[100]' : 'ring-white/10 hover:ring-white/50'}
        ${hasError ? 'ring-red-500 ring-4' : ''}
        ${isExploding ? 'item-exploding' : 'item-waterfall'}`}
      style={style}
    >
      {data.isLocked && (
        <div className="absolute top-4 right-4 z-50 bg-cyan-400 text-black p-1.5 rounded-full shadow-lg animate-float">
          <Anchor size={14} />
        </div>
      )}

      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-4 text-center">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-[10px] font-mono text-red-400 uppercase leading-tight">
            Load Error<br/>
            <span className="text-white/40 break-all">{data.url}</span>
          </p>
        </div>
      ) : (
        <>
          {data.type === 'image' ? (
            <img 
              src={data.url} 
              alt="" 
              onError={() => {
                console.error(`Failed to load image at: ${data.url}`);
                setHasError(true);
              }}
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
              onError={() => {
                console.error(`Failed to load video at: ${data.url}`);
                setHasError(true);
              }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] pointer-events-none"
            />
          )}
        </>
      )}
      
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${data.isLocked ? 'bg-cyan-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-mono text-white/60 tracking-[0.2em] uppercase">
            {data.isLocked ? 'LOCKED' : `ASSET_${data.id.slice(0, 4)}`}
          </span>
        </div>
      </div>
    </div>
  );
};
