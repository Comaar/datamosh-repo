
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
  
  // Reset error state when the URL changes (crucial for recycled slots)
  useEffect(() => {
    setHasError(false);
  }, [data.url]);

  const filename = data.url.split('/').pop() || 'Untitled';

  const handleError = () => {
    if (!hasError) {
      console.error(`Media failed to load: ${data.url}`);
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

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-4 text-center">
            <AlertCircle className="text-red-500 opacity-40 mb-2" size={24} />
            <span className="text-[10px] font-mono text-white/40 break-all uppercase tracking-tight">
              {filename}
            </span>
            <div className="mt-1 px-2 py-0.5 border border-red-500/20 rounded text-[7px] font-mono text-red-500/60 uppercase">
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
                src={data.url} 
                autoPlay 
                muted 
                loop 
                playsInline
                preload="metadata"
                onError={handleError}
                className="w-full h-full object-cover"
              >
                {/* Standard sources for better cross-browser detection */}
                <source src={data.url} type={data.url.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
              </video>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MediaItem.displayName = 'MediaItem';
