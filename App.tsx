
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION } from './constants';
import { MediaItemData, MediaType } from './types';

const App: React.FC = () => {
  const [anchoredId, setAnchoredId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');

  const totalToLoad = MEDIA_COLLECTION.length;

  const items: MediaItemData[] = useMemo(() => {
    return MEDIA_COLLECTION.map((item, index) => {
      const url = item.url || '';
      const lowerUrl = url.toLowerCase();
      
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

  useEffect(() => {
    if (totalToLoad === 0) {
      setIsReady(true);
      return;
    }

    let mounted = true;
    let processed = 0;

    const preloadAsset = (item: MediaItemData): Promise<void> => {
      return new Promise((resolve) => {
        if (!mounted) return resolve();
        
        setCurrentFile(item.url.split('/').pop() || '');

        const finish = (success: boolean) => {
          if (!success) console.error(`[404/Error] Failed to load: ${item.url}`);
          processed++;
          if (mounted) setLoadCount(processed);
          resolve();
        };

        if (item.type === 'image') {
          const img = new Image();
          img.onload = () => finish(true);
          img.onerror = () => finish(false);
          img.src = item.url;
        } else {
          const video = document.createElement('video');
          video.preload = 'metadata';
          // Use onloadedmetadata for speed, oncanplay for certainty
          video.onloadedmetadata = () => finish(true);
          video.onerror = () => finish(false);
          video.src = item.url;
        }
      });
    };

    const runPreload = async () => {
      // Load in chunks of 6 to avoid browser request limits
      const chunkSize = 6;
      for (let i = 0; i < items.length; i += chunkSize) {
        if (!mounted) break;
        const chunk = items.slice(i, i + chunkSize);
        await Promise.all(chunk.map(preloadAsset));
      }
      
      if (mounted) {
        setTimeout(() => setIsReady(true), 1000);
      }
    };

    runPreload();

    return () => { mounted = false; };
  }, [items, totalToLoad]);

  const handleToggleAnchor = useCallback((id: string) => {
    setAnchoredId(prev => (prev === id ? null : id));
  }, []);

  const progress = totalToLoad > 0 ? (loadCount / totalToLoad) * 100 : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] select-none">
      {!isReady && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center transition-opacity duration-1000">
          <div className="text-white font-black text-5xl italic tracking-tighter mb-2 uppercase">
            MARCO PICCOLO
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#FF6B00] mb-12 animate-pulse">
            INITIALIZING REPOSITORY
          </div>
          
          <div className="w-80 h-1.5 bg-white/5 rounded-full overflow-hidden relative mb-4">
            <div 
              className="h-full bg-[#FF6B00] transition-all duration-500 ease-out shadow-[0_0_20px_rgba(255,107,0,0.6)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              {loadCount} / {totalToLoad} ASSETS VERIFIED
            </div>
            <div className="text-[7px] font-mono uppercase tracking-[0.2em] text-[#FF6B00]/60 h-4">
              {currentFile && `CHECKING: ${currentFile}`}
            </div>
          </div>

          <div className="absolute bottom-12 text-[8px] font-mono text-white/10 uppercase tracking-[0.3em]">
            Nature’s living room, shaped by Seabass togetherness
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
          <span>{isReady ? 'Click to anchor' : 'Synchronizing...'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
