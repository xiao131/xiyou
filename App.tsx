import React, { useState } from 'react';
import { GameState, Hero, HeroClass, MapNode, Enemy } from './types';
import { GENERATE_MAP, STARTING_DECKS, ENEMIES, CARDS } from './constants';
import MapScene from './components/MapScene';
import CombatScene from './components/CombatScene';
import { Ghost, Scroll, Info, RefreshCw } from 'lucide-react';
import CardComponent from './components/CardComponent';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [hero, setHero] = useState<Hero | null>(null);
  const [deck, setDeck] = useState<string[]>([]);
  const [map, setMap] = useState<MapNode[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<number>(-1);
  const [currentEnemies, setCurrentEnemies] = useState<Enemy[]>([]);
  
  // Reward State
  const [recruitableEnemy, setRecruitableEnemy] = useState<Enemy | undefined>(undefined);

  // --- ACTIONS ---

  const startGame = (selectedClass: HeroClass) => {
    const baseHero: Hero = {
        id: 'hero_1',
        name: selectedClass === HeroClass.WUKONG ? '孙悟空' : '唐三藏',
        class: selectedClass,
        maxHp: selectedClass === HeroClass.WUKONG ? 70 : 50,
        hp: selectedClass === HeroClass.WUKONG ? 70 : 50,
        block: 0,
        maxEnergy: 3,
        energy: 3,
        image: selectedClass === HeroClass.WUKONG ? '🐵' : '🙏',
        gold: 100,
        statuses: {}
    };
    
    setHero(baseHero);
    setDeck([...STARTING_DECKS[selectedClass]]);
    setMap(GENERATE_MAP());
    setCurrentNodeId(-1);
    setGameState('MAP');
  };

  const handleNodeSelect = (node: MapNode) => {
    setCurrentNodeId(node.id);
    
    if (node.type === 'COMBAT') {
        setCurrentEnemies([
            { ...ENEMIES['skeleton'] as Enemy, id: 'e1', hp: 20, block: 0, energy: 0, statuses: {}, intent: 'ATTACK' },
            { ...ENEMIES['rat_archer'] as Enemy, id: 'e2', hp: 18, block: 0, energy: 0, statuses: {}, intent: 'BUFF' }
        ]);
        setGameState('COMBAT');
    } else if (node.type === 'ELITE') {
        setCurrentEnemies([
            { ...ENEMIES['tiger_vanguard'] as Enemy, id: 'elite1', hp: 80, block: 0, energy: 0, statuses: {}, intent: 'ATTACK' }
        ]);
        setGameState('COMBAT');
    } else if (node.type === 'REST') {
        // Simple auto-heal for prototype
        if (hero) setHero({ ...hero, hp: Math.min(hero.maxHp, hero.hp + 20) });
        completeNode(node.id);
    } else if (node.type === 'BOSS') {
         setCurrentEnemies([
            { ...ENEMIES['black_bear'] as Enemy, id: 'boss1', hp: 150, block: 0, energy: 0, statuses: {}, intent: 'ATTACK' }
        ]);
        setGameState('COMBAT');
    }
  };

  const handleCombatEnd = (victory: boolean, recruited?: Enemy) => {
    if (victory) {
        if (recruited) {
            setRecruitableEnemy(recruited);
            setGameState('REWARD');
        } else {
            // Standard reward
            setGameState('REWARD');
        }
    } else {
        setGameState('GAME_OVER');
    }
  };

  const completeNode = (nodeId: number) => {
    const newMap = map.map(n => n.id === nodeId ? { ...n, completed: true } : n);
    setMap(newMap);
    setGameState('MAP');
  };

  const handleRecruit = () => {
     if (recruitableEnemy && recruitableEnemy.recruitCardId) {
        setDeck([...deck, recruitableEnemy.recruitCardId]);
        setRecruitableEnemy(undefined);
        completeNode(currentNodeId);
     }
  };

  const handleSkipReward = () => {
    setRecruitableEnemy(undefined);
    completeNode(currentNodeId);
  }

  // --- RENDERERS ---

  if (gameState === 'MENU') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100 relative overflow-hidden">
        {/* Immersive Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542256840-3b690040bc1c?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-30 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950"></div>
        
        <div className="z-10 text-center mb-12">
            <h1 className="text-7xl text-amber-500 mb-4 h-font tracking-[0.2em] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">西游回响</h1>
            <p className="text-xl text-stone-400 italic h-font tracking-widest border-t border-b border-stone-800 py-2 inline-block">"真经无字 · 轮回崩毁"</p>
        </div>

        <div className="grid grid-cols-2 gap-12 z-10 max-w-4xl w-full px-8">
          <button 
            onClick={() => startGame(HeroClass.WUKONG)}
            className="group relative h-96 bg-stone-900/80 border-2 border-stone-700 hover:border-amber-600 transition-all p-0 flex flex-col items-center overflow-hidden shadow-2xl hover:scale-105 duration-500"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615672917615-d2436c4c6888?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-all duration-700 grayscale group-hover:grayscale-0 transform group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            
            <div className="relative z-10 mt-auto mb-8 text-center px-6 w-full">
                <h3 className="text-4xl h-font text-stone-100 group-hover:text-amber-400 font-bold mb-2 transition-colors">孙悟空</h3>
                <div className="h-0.5 w-12 bg-amber-600 mx-auto mb-4 group-hover:w-full transition-all duration-500"></div>
                <p className="text-stone-300 text-sm h-font leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    手持如意金箍棒。<br/>高爆发伤害，灵动身法，分身幻影。
                </p>
            </div>
            <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 border border-stone-600 text-xs text-stone-400">难度: 普通</div>
          </button>

          <button 
             onClick={() => startGame(HeroClass.TANG)}
             className="group relative h-96 bg-stone-900/80 border-2 border-stone-700 hover:border-blue-500 transition-all p-0 flex flex-col items-center overflow-hidden shadow-2xl hover:scale-105 duration-500"
          >
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-all duration-700 grayscale group-hover:grayscale-0 transform group-hover:scale-110"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
             
             <div className="relative z-10 mt-auto mb-8 text-center px-6 w-full">
                <h3 className="text-4xl h-font text-stone-100 group-hover:text-blue-400 font-bold mb-2 transition-colors">唐三藏</h3>
                <div className="h-0.5 w-12 bg-blue-600 mx-auto mb-4 group-hover:w-full transition-all duration-500"></div>
                <p className="text-stone-300 text-sm h-font leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    精通真言与法器。<br/>控制战场，感化妖魔，防御反击。
                </p>
             </div>
             <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 border border-stone-600 text-xs text-stone-400">难度: 困难</div>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-red-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518047601542-79f18c655718?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
              <h1 className="text-8xl h-font mb-4 z-10 animate-pulse font-bold tracking-widest">败北</h1>
              <p className="text-stone-400 mb-12 h-font text-xl z-10">你的灵魂回归虚空，等待下一次轮回。</p>
              <button 
                onClick={() => setGameState('MENU')}
                className="z-10 flex items-center gap-3 px-8 py-4 border border-stone-600 bg-stone-900/80 hover:bg-red-900/20 text-stone-200 h-font text-lg transition-all hover:border-red-600"
              >
                  <RefreshCw size={24}/> 再次轮回
              </button>
          </div>
      )
  }

  if (gameState === 'REWARD') {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507692049790-de58293a469d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950"></div>
              
              <h2 className="text-5xl h-font text-amber-500 mb-12 z-10 tracking-[0.2em] font-bold">战斗胜利</h2>
              
              {recruitableEnemy && recruitableEnemy.recruitCardId && (
                  <div className="flex flex-col items-center z-10 w-full max-w-4xl animate-float-up">
                      <div className="bg-stone-900/80 border border-amber-900/50 p-8 rounded-lg backdrop-blur-md flex items-center gap-12 shadow-2xl">
                          {/* Left: The Card */}
                          <div className="flex flex-col items-center gap-4">
                             <div className="transform scale-125 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                                <CardComponent card={CARDS[recruitableEnemy.recruitCardId]} />
                             </div>
                          </div>
                          
                          {/* Right: Action */}
                          <div className="flex flex-col gap-6 max-w-md">
                              <div>
                                  <h3 className="text-2xl h-font text-stone-200 mb-2">降妖招安</h3>
                                  <p className="text-stone-400 h-font leading-relaxed">
                                      你击败了 <span className="text-red-400 font-bold">{recruitableEnemy.name}</span>。
                                      它的执念已化为力量，是否将其招入麾下？
                                  </p>
                              </div>

                              <button 
                                onClick={handleRecruit}
                                className="group w-full px-6 py-4 bg-gradient-to-r from-amber-900 to-amber-950 border border-amber-700 hover:from-amber-800 hover:to-amber-900 text-amber-100 h-font text-xl shadow-lg transition-all flex items-center justify-center gap-3"
                              >
                                  <span className="group-hover:scale-110 transition-transform">👹</span> 招安妖灵
                              </button>
                              
                              <div className="flex items-center gap-2 text-xs text-stone-500 justify-center">
                                  <Info size={14}/> 将此卡牌永久加入你的牌组
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              <button 
                onClick={handleSkipReward}
                className="z-10 mt-12 px-8 py-3 border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600 transition-all h-font uppercase tracking-widest text-sm"
              >
                  继续旅程 &rarr;
              </button>
          </div>
      )
  }

  return (
    <div className="h-screen w-screen bg-stone-950 overflow-hidden relative font-serif">
        {gameState === 'MAP' && hero && (
            <MapScene 
                mapNodes={map} 
                currentNodeId={currentNodeId} 
                onNodeSelect={handleNodeSelect} 
            />
        )}
        
        {gameState === 'COMBAT' && hero && (
            <CombatScene 
                hero={hero} 
                enemies={currentEnemies} 
                deck={deck} 
                onCombatEnd={handleCombatEnd} 
            />
        )}

        {/* Global Deck View Button (Top Right) */}
        <div className="absolute top-6 right-6 z-50">
            <button className="bg-stone-900/90 border border-stone-600 p-3 rounded-full hover:bg-stone-800 text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-all shadow-lg">
                <Scroll size={24} />
            </button>
        </div>
    </div>
  );
};

export default App;