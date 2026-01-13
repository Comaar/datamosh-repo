
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MediaItemData } from '../types';
import { MediaItem } from './MediaItem';

interface Slot {
  id: string; // Unique slot ID
  y: number;
  x: number;
  speed: number;
  mediaIndex: number; // Index into the items array
  parallax: number;
}

interface Props {
  items: MediaItemData[];
  anchoredId: string | null;
  onToggleAnchor: (id: string) => void;
}

const SLOT_COUNT = 12; // Number of items visible/falling at once

export const WaterfallContainer: React.FC<Props> = ({ items, anchoredId, onToggleAnchor }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const queueRef = useRef<number[]>([]);
  const itemsRef = useRef<MediaItemData[]>(items);

  // Sync refs
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Helper to get a shuffled array of indices
  const getShuffledIndices = useCallback(() => {
    const indices = Array.from({ length: itemsRef.current.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  // Helper to get the next index from the queue, ensuring no duplicates if anchored
  const getNextMediaIndex = useCallback((excludeMediaId?: string | null) => {
    if (queueRef.current.length === 0) {
      queueRef.current = getShuffledIndices();
    }

    let nextIdx = queueRef.current.shift()!;
    
    // If the next item is already anchored elsewhere, try to get another one 
    // to avoid the same content appearing twice (once anchored, once falling)
    if (excludeMediaId && itemsRef.current[nextIdx].id === excludeMediaId) {
      if (queueRef.current.length === 0) {
        queueRef.current = getShuffledIndices();
      }
      // Swap with next or just take next
      const temp = nextIdx;
      nextIdx = queueRef.current.shift()!;
      queueRef.current.push(temp); // Put the excluded one back at the end
    }

    return nextIdx;
  }, [getShuffledIndices]);

  // Initialize slots
  useEffect(() => {
    if (items.length === 0) return;
    
    // Fill initial queue
    queueRef.current = getShuffledIndices();
    
    const initialSlots: Slot[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const mediaIdx = getNextMediaIndex();
      const item = items[mediaIdx];
      return {
        id: `slot-${i}`,
        y: (i * -400) - 200, // Staggered start
        x: Math.random() * 85,
        speed: 0.8 + Math.random() * 1.2,
        mediaIndex: mediaIdx,
        parallax: 0.8 + Math.random() * 0.4,
      };
    });
    
    setSlots(initialSlots);
  }, [items.length]);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const cappedDelta = Math.min(deltaTime, 32); 
      
      setSlots(prevSlots => {
        return prevSlots.map(slot => {
          const mediaItem = itemsRef.current[slot.mediaIndex];
          
          // If this slot is the one currently anchored, it stays still
          if (mediaItem && mediaItem.id === anchoredId) {
            return slot;
          }

          const moveAmount = slot.speed * 0.18 * cappedDelta;
          let newY = slot.y + moveAmount;
          
          // Reset logic
          if (newY > 1200) {
            const nextIdx = getNextMediaIndex(anchoredId);
            return {
              ...slot,
              y: -600, // Reset to top
              x: Math.random() * 85,
              mediaIndex: nextIdx,
              speed: 0.8 + Math.random() * 1.2,
            };
          }
          
          return { ...slot, y: newY };
        });
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [anchoredId]);

  return (
    <div className="relative w-full h-full perspective-container">
      {slots.map((slot) => {
        const item = items[slot.mediaIndex];
        if (!item) return null;
        
        return (
          <MediaItem 
            key={slot.id} 
            data={{
              ...item,
              initialX: slot.x,
              parallax: slot.parallax
            }} 
            yOffset={slot.y} 
            isAnchored={item.id === anchoredId}
            onToggleAnchor={() => onToggleAnchor(item.id)}
          />
        );
      })}
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '120px 120px',
        }}></div>
      </div>
    </div>
  );
};
