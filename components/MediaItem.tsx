
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
  
  const filename = data.url.split('/').pop() || 'Untitled';

  const handleError = () => {
    if (!hasError) {
      console.error(`Failed to load media: ${data.url}. Check if the file exists in /public/media/ and the filename matches exactly (case-sensitive).`);
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
        className={`w-full h-full relative bg-zinc-900 rounded-lg overflow-hidden border transition-all duration-700 ease-out
          ${isAnchored 
            ? 'border-[#FF6B00] scale-100 z-[600] shadow-[0_0_50px_rgba(255,107,0,0.15)]' 
            : 'border-white/10 scale-100 shadow-2xl group-hover:border-white/30'}`}
      >
        {isAnchored && (
          <div className="absolute top-3 right-3 z-50 bg-[#FF6B00] text-black p-1 rounded-full shadow-lg pointer-events-none">
            <Anchor size={12} />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 truncate block">
            {filename}
          </span>
        </div>

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 text-center">
            <AlertCircle className="text-red-500 opacity-40 mb-2" size={24} />
            <span className="text-[8px] font-mono text-white/20 break-all">{filename}</span>
          </div>
        ) : (
          <div className="w-full h-full pointer-events-none">
            {data.type === 'image' ? (
              <img 
                src={data.url} 
                alt="" 
                onError={handleError}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <video 
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
