
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION } from './constants';
import { MediaItemData } from './types';

const App: React.FC = () => {
  const [anchoredId, setAnchoredId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const totalToPreload = Math.min(30, MEDIA_COLLECTION.length);

  // Normalize the collection
  const items: MediaItemData[] = useMemo(() => {
    return MEDIA_COLLECTION.map((item, index) => {
      const url = item.url?.toLowerCase() || '';
      const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || item.type === 'video';
      
      // Sizing logic: 
      // Videos are the largest (landscape 16:9 feel)
      // Images are "a bit bigger" than previous versions but still smaller than videos
      const width = isVideo ? 760 : 360 + (index % 3) * 40; 
      const height = isVideo ? 428 : 480 + (index % 3) * 60;

      return {
        ...item,
        id: item.id || `item-${index}`,
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
    let mounted = true;
    let loaded = 0;

    const incrementLoad = () => {
      loaded++;
      if (mounted) {
        setLoadCount(loaded);
        if (loaded >= totalToPreload) {
          setIsReady(true);
        }
      }
    };

    items.slice(0, totalToPreload).forEach((item) => {
      if (item.type === 'image') {
        const img = new Image();
        img.src = item.url;
        img.onload = incrementLoad;
        img.onerror = incrementLoad;
      } else {
        const video = document.createElement('video');
        video.src = item.url;
        video.onloadeddata = incrementLoad;
        video.onerror = incrementLoad;
        video.preload = 'auto';
      }
    });

    return () => {
      mounted = false;
    };
  }, [items, totalToPreload]);

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
              style={{ width: `${(loadCount / totalToPreload) * 100}%` }}
            />
          </div>
          <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            Gathering the living room... {loadCount}/{totalToPreload}
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
          <span>Click an item to focus</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
