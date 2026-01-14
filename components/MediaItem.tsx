
import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { MediaItemData } from '../types';
import { Anchor, AlertCircle } from 'lucide-react';

interface Props {
  data: MediaItemData & { initialY: number };
  isAnchored: boolean;
  onToggleAnchor: () => void;
  onManualMove: (newX: number, newY: number) => void;
}

export const MediaItem = forwardRef<HTMLDivElement, Props>(({ data, isAnchored, onToggleAnchor, onManualMove }, ref) => {
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = { x: clientX, y: clientY };
    
    const rect = (ref as any).current?.getBoundingClientRect();
    if (rect) {
      elementStartPos.current = { x: rect.left, y: rect.top };
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved.current = true;
        // Anchor if not already anchored as soon as we move
        if (!isAnchored) {
          onToggleAnchor();
        }
      }

      const newX = elementStartPos.current.x + dx;
      const newY = elementStartPos.current.y + dy;

      if ((ref as any).current) {
        const leftPercent = (newX / window.innerWidth) * 100;
        // Directly set styles for performance
        (ref as any).current.style.left = `${leftPercent}%`;
        (ref as any).current.style.transform = `translate3d(0, ${newY}px, 0)`;
        // Update physics slot
        onManualMove(leftPercent, newY);
      }
    };

    const handleMouseUp = () => {
      if (!hasMoved.current) {
        // Pure click: toggle anchor
        onToggleAnchor();
      }
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isAnchored, onToggleAnchor, onManualMove, ref]);

  const outerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.initialX}%`,
    top: 0,
    width: data.width,
    height: data.height,
    zIndex: isAnchored ? 500 : Math.floor(data.parallax * 10),
    pointerEvents: 'auto',
    // Start at initialY if available to prevent jump on mount
    transform: `translate3d(0, ${data.initialY}px, 0)`, 
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    willChange: 'transform, left'
  };

  return (
    <div 
      ref={ref}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      className={`item-waterfall group ${isDragging ? 'z-[1000]' : ''}`}
      style={outerStyle}
    >
      <div 
        className={`w-full h-full relative bg-zinc-900 rounded-lg overflow-hidden border transition-all duration-700 ease-out
          ${isAnchored 
            ? 'border-[#FF6B00] scale-100 z-[600] shadow-[0_0_50px_rgba(255,107,0,0.15)]' 
            : 'border-white/10 scale-100 shadow-2xl group-hover:border-white/30'}`}
        style={{
          transition: isDragging ? 'none' : 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease'
        }}
      >
        {isAnchored && (
          <div className="absolute top-3 right-3 z-50 bg-[#FF6B00] text-black p-1 rounded-full shadow-lg pointer-events-none">
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
