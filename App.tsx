
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION } from './constants';
import { MediaItemData, MediaType } from './types';

const App: React.FC = () => {
  const [anchoredId, setAnchoredId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const totalToLoad = MEDIA_COLLECTION.length;

  // Normalize the collection with robust type detection
  const items: MediaItemData[] = useMemo(() => {
    return MEDIA_COLLECTION.map((item, index) => {
      const url = item.url || '';
      const lowerUrl = url.toLowerCase();
      
      // If type isn't explicitly provided, guess from extension
      let detectedType: MediaType = item.type as MediaType;
      if (!detectedType) {
        detectedType = (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.webm')) 
          ? 'video' 
          : 'image';
      }

      const isVideo = detectedType === 'video';
      const width = isVideo ? 760 : 280 + (index % 3) * 30; 
      const height = isVideo ? 428 : 380 + (index % 3) * 40;

      return {
        ...item,
        id: item.id || `item-${index}`,
        type: detectedType,
        width,
        height,
        initialX: 0, 
        speed: 1,    
        parallax: 1, 
      } as MediaItemData;
    });
  }, []);

  // Comprehensive Preloading logic
  useEffect(() => {
    if (totalToLoad === 0) {
      setIsReady(true);
      return;
    }

    let mounted = true;
    let processedCount = 0;

    const markAsProcessed = () => {
      processedCount++;
      if (mounted) {
        setLoadCount(processedCount);
        if (processedCount >= totalToLoad) {
          // Small delay for smooth transition
          setTimeout(() => {
            if (mounted) setIsReady(true);
          }, 500);
        }
      }
    };

    console.log(`Starting preload for ${totalToLoad} assets...`);

    items.forEach((item) => {
      if (item.type === 'image') {
        const img = new Image();
        img.onload = markAsProcessed;
        img.onerror = () => {
          console.warn(`[Preload Error] Image not found: ${item.url}`);
          markAsProcessed();
        };
        img.src = item.url;
      } else {
        const video = document.createElement('video');
        video.onloadedmetadata = markAsProcessed;
        video.onerror = () => {
          console.warn(`[Preload Error] Video not found or incompatible: ${item.url}`);
          markAsProcessed();
        };
        video.preload = 'metadata';
        video.src = item.url;
      }
    });

    // Safety timeout: don't get stuck forever if an asset is totally broken
    const safetyTimer = setTimeout(() => {
      if (mounted && !isReady) {
        console.warn("Preload safety timeout reached. Starting app with partial assets.");
        setIsReady(true);
      }
    }, 15000); // 15 seconds max wait

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, [items, totalToLoad]);

  const handleToggleAnchor = useCallback((id: string) => {
    setAnchoredId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] select-none">
      {!isReady && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center transition-opacity duration-1000">
          <div className="text-white font-black text-5xl italic tracking-tighter mb-2 uppercase">
            MARCO PICCOLO
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#FF6B00] mb-8 animate-pulse">
            LOADING COLLECTION
          </div>
          
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[#FF6B00] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(255,107,0,0.5)]" 
              style={{ width: `${(loadCount / totalToLoad) * 100}%` }}
            />
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-1">
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/30">
              {loadCount} of {totalToLoad} items verified
            </div>
            <div className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/10">
              Please wait while we prepare the living room
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full z-[100] p-10 flex flex-col justify-start items-start pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-start">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white/95 mix-blend-difference">
            MARCO PICCOLO
          </h1>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/50 mt-2 mix-blend-difference max-w-xs leading-relaxed">
            Nature’s living room, shaped by Seabass togetherness
          </p>
        </div>
      </header>

      {isReady && (
        <WaterfallContainer 
          items={items} 
          anchoredId={anchoredId} 
          onToggleAnchor={handleToggleAnchor} 
        />
      )}

      <footer className="fixed bottom-0 left-0 w-full z-50 p-8 flex justify-end items-end pointer-events-none">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
          <span>Click an item to anchor</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
