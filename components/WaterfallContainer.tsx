
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MediaItemData } from '../types';
import { MediaItem } from './MediaItem';

interface SlotData {
  id: string;
  y: number;
  x: number;
  speed: number;
  mediaIndex: number;
  parallax: number;
}

interface Props {
  items: MediaItemData[];
  anchoredId: string | null;
  onToggleAnchor: (id: string) => void;
}

// User requested to start with 4 images
const SLOT_COUNT = 4; 

export const WaterfallContainer: React.FC<Props> = ({ items, anchoredId, onToggleAnchor }) => {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  
  // Strict queue management
  const queueRef = useRef<number[]>([]);
  const slotsRef = useRef<SlotData[]>([]);
  const itemsRef = useRef<MediaItemData[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const getShuffledIndices = useCallback(() => {
    const indices = Array.from({ length: itemsRef.current.length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  const getNextMediaIndex = useCallback(() => {
    // If queue is empty, fill it with all available indices shuffled
    if (queueRef.current.length === 0) {
      queueRef.current = getShuffledIndices();
    }
    return queueRef.current.shift()!;
  }, [getShuffledIndices]);

  // Initial slot setup
  useEffect(() => {
    if (items.length === 0) return;
    
    // Clear and refill initial queue
    queueRef.current = getShuffledIndices();
    
    const initialSlots: SlotData[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const mediaIdx = getNextMediaIndex();
      return {
        id: `slot-${i}`,
        // Increased vertical stagger from 500 to 700 to accommodate bigger items
        y: -400 - (i * 700), 
        x: 5 + Math.random() * 70, // Slightly narrower X range to keep bigger items from clipping sides too much
        speed: 0.7 + Math.random() * 0.8, 
        mediaIndex: mediaIdx,
        parallax: 0.9 + Math.random() * 0.3,
      };
    });
    
    slotsRef.current = initialSlots;
    setSlots(initialSlots);
  }, [items.length]);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const cappedDelta = Math.min(deltaTime, 32);

      const updatedSlots = [...slotsRef.current];
      let hasResetted = false;

      updatedSlots.forEach((slot) => {
        const mediaItem = itemsRef.current[slot.mediaIndex];
        const element = itemRefs.current[slot.id];
        
        if (!element || !mediaItem) return;

        // Skip movement if anchored
        if (mediaItem.id === anchoredId) return;

        // Move DOWN (Y increases)
        const moveAmount = slot.speed * 0.065 * cappedDelta;
        slot.y += moveAmount;

        // Reset if it goes past the bottom (increased threshold for larger items)
        if (slot.y > window.innerHeight + 800) {
          slot.y = -900; // Reset well above the top
          slot.x = 5 + Math.random() * 70;
          slot.mediaIndex = getNextMediaIndex();
          slot.speed = 0.7 + Math.random() * 0.8;
          hasResetted = true;
        }

        // Apply transform directly to bypass React render for movement
        element.style.transform = `translate3d(0, ${slot.y}px, 0)`;
      });

      if (hasResetted) {
        slotsRef.current = updatedSlots;
        setSlots(updatedSlots);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [anchoredId, items.length]);

  return (
    <div className="relative w-full h-full perspective-container overflow-hidden bg-[#050505]">
      {slots.map((slot) => {
        const item = items[slot.mediaIndex];
        if (!item) return null;
        return (
          <MediaItem 
            key={slot.id} 
            ref={(el) => { itemRefs.current[slot.id] = el; }}
            data={{ ...item, initialX: slot.x, parallax: slot.parallax }} 
            isAnchored={item.id === anchoredId}
            onToggleAnchor={() => onToggleAnchor(item.id)}
          />
        );
      })}
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '200px 200px',
        }}></div>
      </div>
    </div>
  );
};
