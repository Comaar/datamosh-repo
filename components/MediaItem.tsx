
import React, { useState, forwardRef, useEffect } from 'react';
import { MediaItemData } from '../types';
import { Anchor, AlertCircle } from 'lucide-react';

interface Props {
  data: MediaItemData & { initialY: number };
  isAnchored: boolean;
  onToggleAnchor: () => void;
}

export const MediaItem = forwardRef<HTMLDivElement, Props>(({ data, isAnchored, onToggleAnchor }, ref) => {
  const [hasError, setHasError] = useState(false);
  
  // Important: Always reset error when URL changes due to pool recycling
  useEffect(() => {
    setHasError(false);
  }, [data.url]);

  const filename = data.url.split('/').pop() || 'Untitled';

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  const outerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.initialX}%`,
    top: 0,
    width: data.width,
    height: data.height,
    zIndex: isAnchored ? 500 : Math.floor(data.parallax * 10),
    pointerEvents: 'auto',
    transform: `translate3d(0, ${data.initialY}px, 0)`, 
    cursor: 'pointer',
    touchAction: 'manipulation',
    willChange: 'transform'
  };

  return (
    <div 
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onToggleAnchor();
      }}
      className="item-waterfall group"
      style={outerStyle}
    >
      <div 
        className={`w-full h-full relative bg-[#0a0a0a] rounded-lg overflow-hidden border transition-all duration-700 ease-out
          ${isAnchored 
            ? 'border-[#FF6B00] scale-100 z-[600] shadow-[0_0_60px_rgba(255,107,0,0.2)]' 
            : 'border-white/10 scale-100 shadow-2xl group-hover:border-white/30'}`}
      >
        {isAnchored && (
          <div className="absolute top-3 right-3 z-50 bg-[#FF6B00] text-black p-1.5 rounded-full shadow-lg pointer-events-none">
            <Anchor size={14} />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center border-2 border-dashed border-red-500/10">
            <AlertCircle className="text-red-500/40 mb-3" size={32} strokeWidth={1.5} />
            <div className="text-[10px] font-mono text-white/30 break-all uppercase tracking-tight leading-tight mb-2">
              {filename}
            </div>
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-mono text-red-500/60 uppercase tracking-widest">
              404 NOT FOUND
            </div>
          </div>
        ) : (
          <div className="w-full h-full pointer-events-none">
            {data.type === 'image' ? (
              <img 
                src={data.url} 
                alt={filename}
                onError={handleError}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <video 
                key={data.url}
                src={data.url} 
                autoPlay 
                muted 
                loop 
                playsInline
                preload="auto"
                onError={handleError}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MediaItem.displayName = 'MediaItem';
