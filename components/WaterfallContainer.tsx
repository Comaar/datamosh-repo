
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MediaItemData } from '../types';
import { MediaItem } from './MediaItem';

interface SlotData {
  id: string;
  y: number;
  x: number; // percentage
  speed: number;
  mediaIndex: number;
  parallax: number;
}

interface Props {
  items: MediaItemData[];
  anchoredId: string | null;
  onToggleAnchor: (id: string) => void;
}

const SLOT_COUNT = 7; 

export const WaterfallContainer: React.FC<Props> = ({ items, anchoredId, onToggleAnchor }) => {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  
  const queueRef = useRef<number[]>([]);
  const slotsRef = useRef<SlotData[]>([]);
  const itemsRef = useRef<MediaItemData[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const getShuffledIndices = useCallback(() => {
    const indices = Array.from({ length: itemsRef.current.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  const getNextMediaIndex = useCallback(() => {
    if (queueRef.current.length === 0) {
      queueRef.current = getShuffledIndices();
    }
    return queueRef.current.shift()!;
  }, [getShuffledIndices]);

  useEffect(() => {
    if (items.length === 0) return;
    
    queueRef.current = getShuffledIndices();
    
    const initialSlots: SlotData[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const mediaIdx = getNextMediaIndex();
      return {
        id: `slot-${i}`,
        y: (i * 300) - 400, 
        x: 5 + Math.random() * 70,
        speed: 0.8 + Math.random() * 0.7, 
        mediaIndex: mediaIdx,
        parallax: 0.9 + Math.random() * 0.3,
      };
    });
    
    slotsRef.current = initialSlots;
    setSlots(initialSlots);
  }, [items.length]);

  const handleManualMove = useCallback((slotId: string, newX: number, newY: number) => {
    const slotIndex = slotsRef.current.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      slotsRef.current[slotIndex].x = newX;
      slotsRef.current[slotIndex].y = newY;
      // We don't call setSlots here to avoid 60fps React renders during drag, 
      // but the ref is updated so the animation loop and next render will pick it up.
    }
  }, []);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const cappedDelta = Math.min(deltaTime, 32);

      const updatedSlots = slotsRef.current;
      let needsStateUpdate = false;

      updatedSlots.forEach((slot) => {
        const mediaItem = itemsRef.current[slot.mediaIndex];
        const element = itemRefs.current[slot.id];
        
        if (!element || !mediaItem) return;
        
        // If anchored, skip physics movement but sync the DOM if needed 
        // (though manual move already updates DOM directly)
        if (mediaItem.id === anchoredId) {
            // Keep the element at its current slot position (which might be being updated by a drag)
            element.style.left = `${slot.x}%`;
            element.style.transform = `translate3d(0, ${slot.y}px, 0)`;
            return;
        }

        const moveAmount = slot.speed * 0.08 * cappedDelta;
        slot.y += moveAmount;

        // Recycle slots
        if (slot.y > window.innerHeight + 1000) {
          slot.y = -800; 
          slot.x = 5 + Math.random() * 70;
          slot.mediaIndex = getNextMediaIndex();
          slot.speed = 0.8 + Math.random() * 0.7;
          needsStateUpdate = true;
          element.style.left = `${slot.x}%`;
        }

        element.style.transform = `translate3d(0, ${slot.y}px, 0)`;
      });

      if (needsStateUpdate) {
        setSlots([...updatedSlots]);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [anchoredId, getNextMediaIndex]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="relative w-full h-full perspective-container overflow-hidden bg-[#050505]">
      {slots.map((slot) => {
        const item = items[slot.mediaIndex];
        if (!item) return null;
        return (
          <MediaItem 
            key={slot.id} 
            ref={(el) => { itemRefs.current[slot.id] = el; }}
            data={{ ...item, initialX: slot.x, parallax: slot.parallax, initialY: slot.y }} 
            isAnchored={item.id === anchoredId}
            onToggleAnchor={() => onToggleAnchor(item.id)}
            onManualMove={(nx, ny) => handleManualMove(slot.id, nx, ny)}
          />
        );
      })}
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '150px 150px',
        }}></div>
      </div>
    </div>
  );
};
