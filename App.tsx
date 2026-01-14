
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION } from './constants';
import { MediaItemData, MediaType } from './types';

const App: React.FC = () => {
  const [anchoredId, setAnchoredId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const totalToPreload = Math.min(15, MEDIA_COLLECTION.length);

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

  // Preloading logic
  useEffect(() => {
    if (totalToPreload === 0) {
      setIsReady(true);
      return;
    }

    let mounted = true;
    let loaded = 0;

    const incrementLoad = () => {
      loaded++;
      if (mounted) {
        setLoadCount(loaded);
        if (loaded >= totalToPreload) setIsReady(true);
      }
    };

    const safetyTimer = setTimeout(() => {
      if (mounted && !isReady) setIsReady(true);
    }, 4000);

    items.slice(0, totalToPreload).forEach((item) => {
      if (item.type === 'image') {
        const img = new Image();
        img.src = item.url;
        img.onload = incrementLoad;
        img.onerror = incrementLoad;
      } else {
        const video = document.createElement('video');
        video.src = item.url;
        video.onloadedmetadata = incrementLoad;
        video.onerror = incrementLoad;
        video.preload = 'metadata';
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, [items, totalToPreload, isReady]);

  const handleToggleAnchor = useCallback((id: string) => {
    setAnchoredId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {!isReady && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center transition-opacity duration-1000">
          <div className="text-white font-black text-5xl italic tracking-tighter mb-6 uppercase">
            MARCO PICCOLO
          </div>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FF6B00] transition-all duration-300" 
              style={{ width: totalToPreload > 0 ? `${(loadCount / totalToPreload) * 100}%` : '100%' }}
            />
          </div>
          <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            Gathering the living room...
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
          <span>Click an item</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
