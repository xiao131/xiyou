
import React, { useState } from 'react';
import { GameState, Hero, HeroClass, MapNode, Enemy } from './types';
import { GENERATE_MAP, STARTING_DECKS, CARDS, RELICS, generateEnemies } from './constants';
import MapScene from './components/MapScene';
import CombatScene from './components/CombatScene';
import { Scroll, Info, RefreshCw } from 'lucide-react';
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
    const startRelic = selectedClass === HeroClass.WUKONG ? RELICS['golden_hoop'] : RELICS['cassock'];
    
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
        statuses: {},
        relics: [startRelic]
    };
    
    setHero(baseHero);
    setDeck([...STARTING_DECKS[selectedClass]]);
    setMap(GENERATE_MAP());
    setCurrentNodeId(-1);
    setGameState('MAP');
  };

  const handleNodeSelect = (node: MapNode) => {
    setCurrentNodeId(node.id);
    
    if (node.type === 'COMBAT' || node.type === 'ELITE' || node.type === 'BOSS') {
        const enemies = generateEnemies(node.type);
        setCurrentEnemies(enemies);
        setGameState('COMBAT');
    } else if (node.type === 'REST') {
        // Simple auto-heal for prototype
        if (hero) setHero({ ...hero, hp: Math.min(hero.maxHp, hero.hp + 20) });
        completeNode(node.id);
    } 
  };

  const handleCombatEnd = (victory: boolean, recruited?: Enemy) => {
    if (victory) {
        if (recruited) {
            setRecruitableEnemy(recruited);
            setGameState('REWARD');
        } else {
            setRecruitableEnemy(undefined); // Reset
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
        {/* Immersive Background: Dark Mountains / Fog */}
        <div className="absolute inset-0 bg-stone-900 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate-pulse-slow"></div>
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-stone-950/80"></div>
        
        <div className="z-10 text-center mb-12 relative">
             <div className="absolute -inset-10 bg-black/40 blur-3xl rounded-full"></div>
            <h1 className="relative text-7xl text-amber-500 mb-4 h-font tracking-[0.2em] drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] font-bold">西游回响</h1>
            <p className="relative text-xl text-stone-300 italic h-font tracking-widest border-t border-b border-stone-600 py-2 inline-block bg-black/20 px-8">"真经无字 · 轮回崩毁"</p>
        </div>

        <div className="grid grid-cols-2 gap-12 z-10 max-w-4xl w-full px-8">
          {/* Wukong Selection Card */}
          <button 
            onClick={() => startGame(HeroClass.WUKONG)}
            className="group relative h-96 bg-stone-800 border-2 border-stone-700 hover:border-amber-600 transition-all p-0 flex flex-col items-center overflow-hidden shadow-2xl hover:scale-105 duration-500"
          >
            {/* Image: Golden Monkey Statue / Intense */}
            <div className="absolute inset-0 bg-stone-800 bg-[url('https://images.unsplash.com/photo-1636570640822-482c356f96b6?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div className="relative z-10 mt-auto mb-8 text-center px-6 w-full">
                <h3 className="text-4xl h-font text-stone-100 group-hover:text-amber-400 font-bold mb-2 transition-colors drop-shadow-md">孙悟空</h3>
                <div className="h-0.5 w-12 bg-amber-600 mx-auto mb-4 group-hover:w-full transition-all duration-500"></div>
                <p className="text-stone-200 text-sm h-font leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 bg-black/60 p-2 rounded">
                    手持如意金箍棒。<br/>高爆发伤害，灵动身法，分身幻影。
                </p>
            </div>
            <div className="absolute top-4 right-4 px-2 py-1 bg-amber-900/80 border border-amber-600 text-xs text-amber-100 font-bold">难度: 普通</div>
          </button>

          {/* Tang Monk Selection Card */}
          <button 
             onClick={() => startGame(HeroClass.TANG)}
             className="group relative h-96 bg-stone-800 border-2 border-stone-700 hover:border-blue-500 transition-all p-0 flex flex-col items-center overflow-hidden shadow-2xl hover:scale-105 duration-500"
          >
             {/* Image: Buddha Statue / Temple */}
             <div className="absolute inset-0 bg-stone-800 bg-[url('https://images.unsplash.com/photo-1581451368968-382a98f1f435?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
             
             <div className="relative z-10 mt-auto mb-8 text-center px-6 w-full">
                <h3 className="text-4xl h-font text-stone-100 group-hover:text-blue-400 font-bold mb-2 transition-colors drop-shadow-md">唐三藏</h3>
                <div className="h-0.5 w-12 bg-blue-600 mx-auto mb-4 group-hover:w-full transition-all duration-500"></div>
                <p className="text-stone-200 text-sm h-font leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 bg-black/60 p-2 rounded">
                    精通真言与法器。<br/>控制战场，感化妖魔，防御反击。
                </p>
             </div>
             <div className="absolute top-4 right-4 px-2 py-1 bg-blue-900/80 border border-blue-600 text-xs text-blue-100 font-bold">难度: 困难</div>
          </button>
        </div>
        
        {/* Footer Credit */}
        <div className="absolute bottom-4 text-stone-600 text-xs opacity-50">
            Project Echoes of the West
        </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-red-600 relative overflow-hidden">
              {/* Game Over BG: Desolate Wasteland */}
              <div className="absolute inset-0 bg-stone-950 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale contrast-125"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80"></div>

              <h1 className="text-8xl h-font mb-4 z-10 animate-pulse font-bold tracking-widest text-shadow drop-shadow-[0_0_25px_rgba(220,38,38,0.8)]">败北</h1>
              <p className="text-stone-400 mb-12 h-font text-xl z-10 bg-black/50 px-6 py-2 rounded">你的灵魂回归虚空，等待下一次轮回。</p>
              <button 
                onClick={() => setGameState('MENU')}
                className="z-10 flex items-center gap-3 px-8 py-4 border-2 border-stone-600 bg-stone-900 hover:bg-red-950 text-stone-200 h-font text-lg transition-all hover:border-red-600 hover:scale-105 shadow-xl"
              >
                  <RefreshCw size={24}/> 再次轮回
              </button>
          </div>
      )
  }

  if (gameState === 'REWARD') {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100 relative overflow-hidden">
              {/* Reward BG: Ancient Temple Treasure */}
              <div className="absolute inset-0 bg-stone-950 bg-[url('https://images.unsplash.com/photo-1599739485077-4b77d6110903?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/80 to-stone-950"></div>
              
              <h2 className="text-5xl h-font text-amber-500 mb-12 z-10 tracking-[0.2em] font-bold drop-shadow-md">战斗胜利</h2>
              
              {recruitableEnemy && recruitableEnemy.recruitCardId ? (
                  <div className="flex flex-col items-center z-10 w-full max-w-4xl animate-float-up">
                      <div className="bg-stone-900/90 border border-amber-900/50 p-8 rounded-lg backdrop-blur-md flex items-center gap-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                          {/* Shine Effect */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                          {/* Left: The Card */}
                          <div className="flex flex-col items-center gap-4">
                             <div className="transform scale-125 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                <CardComponent card={CARDS[recruitableEnemy.recruitCardId]} />
                             </div>
                          </div>
                          
                          {/* Right: Action */}
                          <div className="flex flex-col gap-6 max-w-md">
                              <div>
                                  <h3 className="text-2xl h-font text-stone-200 mb-2 border-b border-stone-700 pb-2">降妖招安</h3>
                                  <p className="text-stone-400 h-font leading-relaxed">
                                      你击败了 <span className="text-red-400 font-bold text-lg mx-1">{recruitableEnemy.name}</span>。
                                      它的执念已化为力量，是否将其招入麾下？
                                  </p>
                              </div>

                              <button 
                                onClick={handleRecruit}
                                className="group w-full px-6 py-4 bg-gradient-to-r from-amber-900 to-amber-950 border border-amber-700 hover:from-amber-800 hover:to-amber-900 text-amber-100 h-font text-xl shadow-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                              >
                                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                  <span className="group-hover:scale-125 transition-transform duration-300">👺</span> 招安妖灵
                              </button>
                              
                              <div className="flex items-center gap-2 text-xs text-stone-500 justify-center">
                                  <Info size={14}/> 将此卡牌永久加入你的牌组
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                <div className="z-10 text-stone-400 mb-8 h-font bg-stone-900/50 px-6 py-4 rounded border border-stone-800">
                    获得了一些金币和阅历。（原型版暂无战利品）
                </div>
              )}

              <button 
                onClick={handleSkipReward}
                className="z-10 mt-12 px-8 py-3 border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600 transition-all h-font uppercase tracking-widest text-sm bg-black/40 hover:bg-stone-900"
              >
                  继续旅程 &rarr;
              </button>
          </div>
      )
  }

  return (
    <div className="h-screen w-screen bg-stone-950 overflow-hidden relative font-serif text-shadow-sm">
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
            <button className="bg-stone-900/90 border border-stone-600 p-3 rounded-full hover:bg-stone-800 text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-all shadow-lg group">
                <Scroll size={24} className="group-hover:rotate-12 transition-transform"/>
            </button>
        </div>
    </div>
  );
};

export default App;
