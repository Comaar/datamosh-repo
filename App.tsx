import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WaterfallContainer } from './components/WaterfallContainer';
import { MEDIA_COLLECTION, EXPLOSION_DURATION } from './constants';
import { MediaItemData, WaterfallState } from './types';
import { Info, Share2, Command } from 'lucide-react';

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
    console.group('Flux Repository: Asset Loading Status');
    console.log('Total Assets registered:', initializedItems.length);
    initializedItems.forEach(item => {
      console.log(`Checking path for ID ${item.id}:`, item.url);
    });
    console.groupEnd();
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
      <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white/90 mix-blend-difference">
            Flux Repository
          </h1>
          <p className="text-xs font-mono uppercase text-white/40 mt-1">
            v3.1.2-anchor // protocol_debug_active
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all group">
            <Share2 size={18} className="group-hover:scale-110 transition-transform text-white" />
          </button>
          <button className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all group">
            <Info size={18} className="group-hover:scale-110 transition-transform text-white" />
          </button>
        </div>
      </header>

      {items.length > 0 && (
        <WaterfallContainer items={items} state={state} onToggleLock={toggleLock} />
      )}

      <footer className="fixed bottom-0 left-0 w-full z-50 p-8 flex flex-col md:flex-row justify-between items-end pointer-events-none">
        <div className="max-w-xs space-y-2 pointer-events-auto bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-white/60">
            <Command size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Anchor System Online</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed italic">
            Visual streams are procedurally generated. Click assets to <span className="text-cyan-400">Lock in Position</span>. Space to disrupt temporal flow.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-4 pointer-events-auto">
          <div 
            onClick={triggerExplosion}
            className={`px-6 py-3 ${state.isExploding ? 'bg-red-500' : 'bg-white'} text-black font-bold text-xs uppercase tracking-widest flex items-center gap-3 rounded-full hover:scale-105 transition-all cursor-pointer`}
          >
            <span>{state.isExploding ? 'Datamoshing...' : 'Trigger Liquid Mosh'}</span>
            <div className="w-10 h-5 bg-black/10 rounded flex items-center justify-center font-mono text-[10px]">SPACE</div>
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