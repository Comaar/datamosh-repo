
import React, { useState, forwardRef } from 'react';
import { MediaItemData } from '../types';
import { Anchor, AlertCircle } from 'lucide-react';

interface Props {
  data: MediaItemData;
  isAnchored: boolean;
  onToggleAnchor: () => void;
}

export const MediaItem = forwardRef<HTMLDivElement, Props>(({ data, isAnchored, onToggleAnchor }, ref) => {
  const [hasError, setHasError] = useState(false);

  // Outer container is moved by the WaterfallContainer ref
  const outerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.initialX}%`,
    top: 0,
    width: data.width,
    height: data.height,
    zIndex: isAnchored ? 500 : Math.floor(data.parallax * 10),
    pointerEvents: 'auto',
    // We only apply translate3d here if it's NOT handled by the loop (e.g. first frame)
    transform: 'translate3d(0, -1000px, 0)', 
  };

  return (
    <div 
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onToggleAnchor();
      }}
      className="item-waterfall group cursor-pointer"
      style={outerStyle}
    >
      <div 
        className={`w-full h-full relative bg-zinc-900 rounded-lg overflow-hidden border transition-all duration-700 ease-out
          ${isAnchored 
            ? 'border-cyan-400 scale-100 z-[600] shadow-[0_0_50px_rgba(34,211,238,0.3)]' 
            : 'border-white/10 scale-100 shadow-2xl group-hover:border-white/30'}`}
        style={{
          // Removed scale-based zooming, keeping transitions for border and shadow
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
        }}
      >
        {isAnchored && (
          <div className="absolute top-3 right-3 z-50 bg-cyan-400 text-black p-1 rounded-full shadow-lg">
            <Anchor size={12} />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <AlertCircle className="text-red-500 opacity-20" size={24} />
          </div>
        ) : (
          <div className="w-full h-full pointer-events-none">
            {data.type === 'image' ? (
              <img 
                src={data.url} 
                alt="" 
                onError={() => setHasError(true)}
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
                onError={() => setHasError(true)}
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
