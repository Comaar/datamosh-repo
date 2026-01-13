import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION, EXPLOSION_DURATION } from './constants';
import { MediaItemData, WaterfallState } from './types';

const generateInitialItems = (): MediaItemData[] => {
  return MEDIA_COLLECTION.map((item, index) => ({
    ...item,
    id: item.id || `item-${index}`,
    width: item.type === 'video' ? 320 : 200 + Math.random() * 200,
    height: item.type === 'video' ? 180 : 250 + Math.random() * 300,
    initialX: Math.random() * 90,
    speed: 0.5 + Math.random() * 1.5,
    parallax: 0.8 + Math.random() * 0.4,
    isLocked: false,
  } as MediaItemData));
};

const App: React.FC = () => {
  const [items, setItems] = useState<MediaItemData[]>([]);
  const [state, setState] = useState<WaterfallState>({ isExploding: false, isRecovering: false });
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const initializedItems = generateInitialItems();
    setItems(initializedItems);
  }, []);

  const toggleLock = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isLocked: !item.isLocked } : item
    ));
  }, []);

  const triggerExplosion = useCallback(() => {
    if (state.isExploding) return;
    setState({ isExploding: true, isRecovering: false });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState({ isExploding: false, isRecovering: true });
      setTimeout(() => {
        setState(prev => ({ ...prev, isRecovering: false }));
      }, 1500);
    }, EXPLOSION_DURATION);
  }, [state.isExploding]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        triggerExplosion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerExplosion]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      <header className="fixed top-0 left-0 w-full z-[100] p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 
            className={`text-5xl font-black tracking-tighter uppercase italic text-white/95 mix-blend-difference transition-all duration-300
              ${state.isExploding ? 'mosh-pixelated animate-pixel-jitter' : ''}`}
            style={{ 
              filter: state.isExploding ? 'url(#pixel-cascade-filter)' : 'none' 
            }}
          >
            MARCO PICCOLO
          </h1>
        </div>
      </header>

      {items.length > 0 && (
        <WaterfallContainer items={items} state={state} onToggleLock={toggleLock} />
      )}

      <footer className="fixed bottom-0 left-0 w-full z-50 p-8 flex justify-end items-end pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div 
            onClick={triggerExplosion}
            className={`px-8 py-4 ${state.isExploding ? 'bg-red-500' : 'bg-white'} text-black font-bold text-sm uppercase tracking-[0.2em] flex items-center gap-4 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
          >
            <span>{state.isExploding ? 'DATAMOSHING' : 'LIQUID MOSH'}</span>
            <div className="w-12 h-6 bg-black/10 rounded flex items-center justify-center font-mono text-[10px] border border-black/5">SPACE</div>
          </div>
        </div>
      </footer>

      {state.isExploding && (
        <div className="absolute inset-0 z-40 pointer-events-none animate-pulse bg-cyan-500/5 mix-blend-screen" />
      )}
    </div>
  );
};

export default App;