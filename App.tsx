
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION } from './constants';
import { MediaItemData } from './types';

const App: React.FC = () => {
  const [anchoredId, setAnchoredId] = useState<string | null>(null);

  // Normalize the collection once
  const items: MediaItemData[] = useMemo(() => {
    return MEDIA_COLLECTION.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`,
      width: item.type === 'video' ? 320 : 220 + (index % 5) * 40,
      height: item.type === 'video' ? 180 : 300 + (index % 3) * 100,
      initialX: 0, // Will be managed by slots
      speed: 1,    // Will be managed by slots
      parallax: 1, // Will be managed by slots
    } as MediaItemData));
  }, []);

  const handleToggleAnchor = useCallback((id: string) => {
    setAnchoredId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      <header className="fixed top-0 left-0 w-full z-[100] p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white/95 mix-blend-difference">
            MARCO PICCOLO
          </h1>
        </div>
      </header>

      <WaterfallContainer 
        items={items} 
        anchoredId={anchoredId} 
        onToggleAnchor={handleToggleAnchor} 
      />

      <footer className="fixed bottom-0 left-0 w-full z-50 p-8 flex justify-end items-end pointer-events-none">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
          <span>Click an item to focus • Cycle repeats once all items shown</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
