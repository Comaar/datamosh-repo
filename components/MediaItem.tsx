
import React, { useState } from 'react';
import { MediaItemData } from '../types';
import { Anchor, AlertCircle } from 'lucide-react';

interface Props {
  data: MediaItemData;
  yOffset: number;
  isAnchored: boolean;
  onToggleAnchor: () => void;
}

export const MediaItem: React.FC<Props> = ({ data, yOffset, isAnchored, onToggleAnchor }) => {
  const [hasError, setHasError] = useState(false);

  // We use a refined transition that handles the scale-up beautifully
  // while keeping the waterfall movement (translate3d) performant.
  const itemStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.initialX}%`,
    top: 0,
    width: data.width,
    height: data.height,
    // Scale is slightly larger (1.8x) to make the 'bigger' effect more dramatic as requested
    transform: `translate3d(0, ${yOffset}px, 0) scale(${isAnchored ? 1.8 : 1})`,
    zIndex: isAnchored ? 500 : Math.floor(data.parallax * 10),
    // Using a specific bezier curve for that premium "pop" feel when anchoring
    transition: isAnchored 
      ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease' 
      : 'transform 0.1s linear, box-shadow 0.2s ease', 
    pointerEvents: 'auto',
    willChange: 'transform'
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onToggleAnchor();
      }}
      className={`group cursor-pointer item-waterfall
        ${isAnchored ? 'z-[500]' : 'hover:z-[150]'}`}
      style={itemStyle}
    >
      <div 
        className={`w-full h-full relative bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden border-2 transition-all duration-500
          ${isAnchored ? 'border-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.6)]' : 'border-white/5 group-hover:border-white/20'}`}
      >
        {isAnchored && (
          <div className="absolute top-4 right-4 z-50 bg-cyan-400 text-black p-1.5 rounded-full shadow-xl animate-pulse">
            <Anchor size={16} />
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
          </div>
        )}
        
        {/* Subtle Overlay to help items blend in when not focused */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isAnchored ? 'opacity-0' : 'bg-black/10 opacity-0 group-hover:opacity-100'}`} />
      </div>

      {!isAnchored && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono text-white/0 group-hover:text-white/80 tracking-[0.5em] uppercase transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-black/60 px-3 py-1.5 rounded backdrop-blur-md">
            VIEW
          </span>
        </div>
      )}
    </div>
  );
};
