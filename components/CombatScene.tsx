
import React, { useState, useEffect, useRef } from 'react';
import { Hero, Enemy, Card, CardType, TargetType, Relic } from '../types';
import { CARDS } from '../constants';
import CardComponent from './CardComponent';
import { Heart, Shield, Zap, Skull, Swords, Crown, Copy } from 'lucide-react';

interface CombatSceneProps {
  hero: Hero;
  enemies: Enemy[];
  deck: string[];
  onCombatEnd: (victory: boolean, recruitedEnemy?: Enemy) => void;
}

interface FloatingText {
    id: number;
    text: string;
    x: number; // percentage
    y: number; // percentage
    color: string;
    scale?: number;
}

interface VFX {
    id: number;
    type: 'SLASH' | 'IMPACT' | 'BLOCK' | 'BUFF';
    x: number;
    y: number;
    rotation?: number;
}

const CombatScene: React.FC<CombatSceneProps> = ({ hero: initialHero, enemies: initialEnemies, deck, onCombatEnd }) => {
  // Game State
  const [hero, setHero] = useState<Hero>(initialHero);
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);
  
  const [drawPile, setDrawPile] = useState<string[]>([]);
  const [hand, setHand] = useState<string[]>([]);
  const [discardPile, setDiscardPile] = useState<string[]>([]);
  const [exhaustPile, setExhaustPile] = useState<string[]>([]);

  const [turn, setTurn] = useState<number>(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  
  const [logs, setLogs] = useState<string[]>(["战斗开始！"]);
  
  // Special Mechanics State
  const [isDoubleCast, setIsDoubleCast] = useState(false); // For Clone card
  
  // VFX State
  const [vfxList, setVfxList] = useState<VFX[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isHeroHit, setIsHeroHit] = useState(false); // Red flash

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Combat
  useEffect(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDrawPile(shuffled);
    startTurn(shuffled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const triggerShake = (intensity: 'LOW' | 'HIGH' = 'LOW') => {
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), intensity === 'HIGH' ? 600 : 300);
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string = 'text-white', scale: number = 1) => {
      const id = Date.now() + Math.random();
      setFloatingTexts(prev => [...prev, { id, text, x, y, color, scale }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 1000);
  };

  const spawnVFX = (type: 'SLASH' | 'IMPACT' | 'BLOCK' | 'BUFF', x: number, y: number) => {
      const id = Date.now() + Math.random();
      const rotation = Math.random() * 360;
      setVfxList(prev => [...prev, { id, type, x, y, rotation }]);
      setTimeout(() => {
          setVfxList(prev => prev.filter(v => v.id !== id));
      }, 500);
  };

  const startTurn = (currentDrawPile: string[]) => {
    setIsPlayerTurn(true);
    setHero(prev => ({ ...prev, block: 0, energy: prev.maxEnergy })); 
    
    let newHand: string[] = [];
    let nextDrawPile = [...currentDrawPile];
    let nextDiscardPile = [...discardPile];

    for (let i = 0; i < 5; i++) {
        if (nextDrawPile.length === 0) {
            if (nextDiscardPile.length === 0) break;
            nextDrawPile = nextDiscardPile.sort(() => Math.random() - 0.5);
            nextDiscardPile = [];
        }
        const card = nextDrawPile.pop();
        if (card) newHand.push(card);
    }

    setDrawPile(nextDrawPile);
    setDiscardPile(nextDiscardPile);
    setHand(newHand);
  };

  const playCard = (cardId: string, targetIndex?: number) => {
    const cardData = CARDS[cardId];
    if (hero.energy < cardData.cost) {
      spawnFloatingText("法力不足", 50, 80, "text-stone-300");
      return;
    }

    setHero(prev => ({ ...prev, energy: prev.energy - cardData.cost }));
    
    // Determine number of casts (Clone mechanic)
    const casts = isDoubleCast && cardData.type === CardType.ATTACK ? 2 : 1;
    if (isDoubleCast && cardData.type === CardType.ATTACK) {
        spawnFloatingText("分身协同!", 50, 50, "text-amber-400", 1.5);
        setIsDoubleCast(false);
    }

    for (let c = 0; c < casts; c++) {
        executeCardEffects(cardData, targetIndex, c > 0); // c > 0 means clone cast
    }

    // Hand Management
    const handIdx = hand.findIndex(id => id === cardId);
    const newHand = [...hand];
    newHand.splice(handIdx, 1);
    setHand(newHand);

    if (cardData.exhaust) {
        setExhaustPile(prev => [...prev, cardId]);
        addLog(`${cardData.name} 已消耗`);
    } else {
        setDiscardPile(prev => [...prev, cardId]);
    }
    
    setSelectedCardIdx(null);

    // Check Win
    // We check this in a setTimeout to allow state to settle, 
    // but ideally we should check in useEffect or after setEnemies.
    // For now we check based on immediate calculation below or let effect handle it.
  };

  const executeCardEffects = (cardData: Card, targetIndex: number | undefined, isClone: boolean) => {
    
    const applyEffectToTarget = (target: Enemy, idx: number) => {
       if (target.hp <= 0) return;

       let damageDealt = 0;
       const targetX = 30 + idx * 12; // Adjusted spacing for enemies
       const targetY = 25; // Visual Y position for text

       if (cardData.effects.special === 'CLONE') {
           setIsDoubleCast(true);
           spawnVFX('BUFF', 20, 50);
           addLog("使用了身外身法！下一张攻击牌将双倍释放。");
       }

       if (cardData.effects.damage) {
         let dmg = cardData.effects.damage;
         if (target.statuses['VULNERABLE']) dmg = Math.floor(dmg * 1.5);
         if (hero.statuses['WEAK']) dmg = Math.floor(dmg * 0.75);

         let actualHpDmg = dmg;
         if (target.block > 0) {
             spawnVFX('BLOCK', targetX, targetY);
            if (target.block >= dmg) {
                target.block -= dmg;
                actualHpDmg = 0;
                spawnFloatingText("格挡", targetX, targetY - 5, "text-blue-300");
            } else {
                actualHpDmg = dmg - target.block;
                target.block = 0;
            }
         }
         
         if (actualHpDmg > 0) {
             target.hp = Math.max(0, target.hp - actualHpDmg);
             damageDealt = actualHpDmg;
             spawnVFX('SLASH', targetX, targetY);
             spawnFloatingText(`-${actualHpDmg}`, targetX, targetY - 10, "text-red-500 font-bold", 1.5);
             triggerShake();
         }
       }

       if (cardData.effects.status) {
         const currentVal = target.statuses[cardData.effects.status] || 0;
         target.statuses[cardData.effects.status] = currentVal + (cardData.effects.statusValue || 1);
         spawnFloatingText(cardData.effects.status, targetX, targetY - 15, "text-purple-400");
       }

       if (damageDealt > 0) {
           addLog(`${isClone ? '[分身] ' : ''}对 ${target.name} 造成 ${damageDealt} 伤害`);
       }
    };

    setEnemies(prevEnemies => {
        const newEnemies = prevEnemies.map(e => ({...e, statuses: {...e.statuses}}));
        
        if (cardData.target === TargetType.SINGLE && targetIndex !== undefined) {
            applyEffectToTarget(newEnemies[targetIndex], targetIndex);
        } else if (cardData.target === TargetType.ALL_ENEMIES) {
            newEnemies.forEach((e, i) => applyEffectToTarget(e, i));
        }

        // Check if any died
        if (newEnemies.every(e => e.hp <= 0)) {
            setTimeout(() => {
                const lastKilledElite = prevEnemies.find(e => (e.isElite || e.isBoss) && e.recruitCardId);
                onCombatEnd(true, lastKilledElite);
            }, 1000);
        }
        return newEnemies;
    });

    if (cardData.target === TargetType.SELF) {
       if (cardData.effects.block) {
         setHero(prev => ({ ...prev, block: prev.block + (cardData.effects.block || 0) }));
         spawnVFX('IMPACT', 15, 60); 
         spawnFloatingText(`+${cardData.effects.block} 护盾`, 15, 55, "text-blue-400");
         addLog(`获得 ${cardData.effects.block} 点格挡`);
       }
       if (cardData.effects.draw) {
           // Draw logic simplified
       }
    }
  }

  const endTurn = () => {
    setIsPlayerTurn(false);
    setDiscardPile(prev => [...prev, ...hand]);
    setHand([]);
    setIsDoubleCast(false);

    setTimeout(async () => {
        let currentHero = { ...hero };
        currentHero.block = 0; 
        
        // Relic Effects (Simple implementation)
        const cassock = hero.relics.find(r => r.id === 'cassock');
        if (cassock) {
            currentHero.block += 5;
            spawnFloatingText("袈裟庇护 +5", 15, 60, "text-amber-200");
        }
        
        // Enemy Turn
        const newEnemies = enemies.filter(e => e.hp > 0).map(e => ({ ...e, block: 0 }));

        for (const enemy of newEnemies) {
            let dmg = 0;
            let actionLog = "";
            
            if (enemy.intent === 'ATTACK') {
                dmg = 8 + turn;
                actionLog = `攻击造成 ${dmg} 伤害`;
                
                spawnVFX('SLASH', 15, 60); 
                
                let actualDmg = dmg;
                if (currentHero.block >= dmg) {
                    currentHero.block -= dmg;
                    actualDmg = 0;
                    spawnFloatingText("格挡", 15, 55, "text-blue-300");
                } else {
                    actualDmg = dmg - currentHero.block;
                    currentHero.block = 0;
                    currentHero.hp -= actualDmg;
                    
                    // Hit Feedback
                    setIsHeroHit(true);
                    setTimeout(() => setIsHeroHit(false), 400);
                    triggerShake('HIGH');
                    spawnFloatingText(`-${actualDmg}`, 15, 50, "text-red-600 font-bold", 2.5);
                }
            } else if (enemy.intent === 'DEFEND') {
                enemy.block += 10;
                actionLog = `强化防御`;
                const eIdx = enemies.indexOf(enemy);
                spawnFloatingText("+10 护盾", 30 + eIdx * 12, 20, "text-blue-300");
            } else if (enemy.intent === 'DEBUFF') {
                actionLog = `施加虚弱`;
                spawnFloatingText("虚弱", 15, 55, "text-purple-500");
            }
            
            addLog(`${enemy.name}: ${actionLog}`);
            await new Promise(r => setTimeout(r, 800));
        }

        setHero(currentHero);
        setEnemies(newEnemies);
        
        if (currentHero.hp <= 0) {
            onCombatEnd(false);
        } else {
            setTurn(t => t + 1);
            startTurn(drawPile);
        }
    }, 500);
  };

  return (
    <div className={`w-full h-full flex flex-col text-stone-100 relative overflow-hidden transition-all select-none ${isScreenShaking ? 'animate-shake' : ''}`}>
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-black">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/80"></div>
        </div>

        {/* Hero Hit Red Flash (Vignette) */}
        <div className={`absolute inset-0 bg-red-900/40 pointer-events-none transition-opacity duration-200 z-50 ${isHeroHit ? 'opacity-100' : 'opacity-0'}`} style={{boxShadow: 'inset 0 0 100px 50px rgba(153, 27, 27, 0.8)'}}></div>

        {/* Floating Texts Layer */}
        {floatingTexts.map(ft => (
            <div 
                key={ft.id}
                className={`absolute pointer-events-none animate-float-up ${ft.color} font-bold z-[60] text-shadow-md`}
                style={{ left: `${ft.x}%`, top: `${ft.y}%`, fontSize: `${1.5 * (ft.scale || 1)}rem` }}
            >
                {ft.text}
            </div>
        ))}

        {/* VFX Layer */}
        {vfxList.map(vfx => (
            <div 
                key={vfx.id}
                className="absolute pointer-events-none z-[55]"
                style={{ left: `${vfx.x}%`, top: `${vfx.y}%` }}
            >
                {vfx.type === 'SLASH' && (
                    <div className="slash-effect w-64 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ transform: `rotate(${vfx.rotation}deg)` }}></div>
                )}
                {vfx.type === 'IMPACT' && (
                    <div className="impact-ring w-32 h-32 rounded-full border-4 border-amber-200 opacity-50"></div>
                )}
                {vfx.type === 'BLOCK' && (
                    <div className="impact-ring w-20 h-20 rounded-full border-4 border-blue-400 opacity-70"></div>
                )}
                {vfx.type === 'BUFF' && (
                    <div className="impact-ring w-40 h-40 rounded-full border-4 border-purple-400 opacity-40"></div>
                )}
            </div>
        ))}

        {/* --- UI LAYOUT --- */}

        {/* Top Left: Hero Status & Relics */}
        <div className="absolute top-4 left-4 z-40 flex flex-col gap-3">
             {/* Hero Bar */}
            <div className="flex items-center space-x-3 bg-stone-950/80 p-2 pr-5 rounded-r-full border-l-4 border-amber-600 shadow-xl backdrop-blur-md">
                <div className="w-14 h-14 -ml-6 rounded-full bg-stone-800 flex items-center justify-center text-2xl border-2 border-amber-600 shadow-lg relative overflow-hidden">
                    <span className="z-10">{hero.image}</span>
                    <div className="absolute bottom-0 left-0 right-0 bg-red-900/50 transition-all duration-500" style={{ height: `${(hero.hp / hero.maxHp) * 100}%` }}></div>
                </div>
                <div>
                    <div className="text-lg h-font text-amber-500 font-bold tracking-widest leading-none">{hero.name}</div>
                    <div className="flex items-center space-x-3 text-xs mt-1 font-mono">
                        <span className="flex items-center text-red-400 font-bold bg-black/40 px-1.5 py-0.5 rounded"><Heart className="w-3 h-3 mr-1 fill-current" /> {hero.hp}/{hero.maxHp}</span>
                        <span className="flex items-center text-blue-400 font-bold bg-black/40 px-1.5 py-0.5 rounded"><Shield className="w-3 h-3 mr-1 fill-current" /> {hero.block}</span>
                    </div>
                </div>
            </div>

            {/* Relics Bar */}
            <div className="flex items-center gap-2 pl-2">
                {hero.relics.map(relic => (
                    <div key={relic.id} className="w-9 h-9 bg-stone-900 rounded-full border border-stone-600 flex items-center justify-center text-base hover:scale-110 transition-transform cursor-help group relative shadow-md">
                        {relic.image}
                        <div className="absolute top-10 left-0 w-48 bg-black/90 border border-stone-600 p-2 text-xs text-stone-300 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                            <strong className="text-amber-500 block mb-1">{relic.name}</strong>
                            {relic.description}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Clone Indicator */}
            {isDoubleCast && (
                <div className="flex items-center gap-2 text-amber-400 font-bold animate-pulse bg-black/50 px-3 py-1 rounded-full border border-amber-500/50 w-fit text-xs ml-2">
                    <Copy size={14}/> 分身协同中
                </div>
            )}
        </div>
        
        {/* Left Side: Combat Log - Adjusted Position */}
        <div className="absolute top-[35%] left-4 z-30 w-56 max-h-48 overflow-y-auto scrollbar-hide flex flex-col-reverse pointer-events-none mask-image-b">
            <div className="flex flex-col gap-1" ref={logContainerRef}>
                {logs.slice().reverse().map((log, i) => (
                    <div key={i} className={`p-1.5 rounded bg-black/60 backdrop-blur-sm border-l-2 border-stone-600 text-[10px] transition-opacity duration-500 ${i === 0 ? 'opacity-100 scale-100 border-amber-500 bg-amber-900/20' : 'opacity-70 scale-95'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>

        {/* Middle: Enemies (Moved UP significantly to prevent overlap) */}
        <div className="absolute top-[8%] left-0 right-0 flex items-start justify-center space-x-6 z-20 px-8 h-auto pointer-events-none">
            {enemies.map((enemy, idx) => (
                <div 
                    key={idx} 
                    onClick={() => selectedCardIdx !== null && CARDS[hand[selectedCardIdx]].target === TargetType.SINGLE ? playCard(hand[selectedCardIdx], idx) : null}
                    className={`
                        relative flex flex-col items-center justify-start w-36 transition-all duration-300 pointer-events-auto
                        ${enemy.hp <= 0 ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}
                        ${selectedCardIdx !== null && CARDS[hand[selectedCardIdx]].target === TargetType.SINGLE ? 'cursor-crosshair hover:scale-105 brightness-110 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]' : ''}
                    `}
                >
                    {/* Intent Bubble */}
                    <div className="absolute -top-10 animate-bounce bg-stone-950 border border-red-900 rounded-lg px-2 py-1 flex items-center gap-1 shadow-xl z-30">
                        {enemy.intent === 'ATTACK' && <Swords className="w-4 h-4 text-red-500" />}
                        {enemy.intent === 'DEFEND' && <Shield className="w-4 h-4 text-blue-400" />}
                        {enemy.intent === 'BUFF' && <Zap className="w-4 h-4 text-purple-400" />}
                        <span className="text-sm font-bold text-stone-100 cinzel-font leading-none">{enemy.intent === 'ATTACK' ? 8 + turn : ''}</span>
                    </div>

                    {/* Enemy Visual */}
                    <div className="w-32 h-32 relative group flex items-center justify-center bg-black/20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-2">
                         {/* Placeholder for enemy image or emoji */}
                         <div className="text-[5rem] filter drop-shadow-2xl hover:scale-105 transition-transform duration-200">
                             {enemy.image}
                         </div>
                    </div>
                    
                    {/* Enemy Stats Bar */}
                    <div className="w-full bg-stone-900 rounded border border-stone-600 overflow-hidden shadow-lg relative h-5">
                        <div className="h-full bg-stone-800 w-full relative">
                            <div className="h-full bg-red-700 transition-all duration-300" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                        </div>
                        <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] font-bold text-white shadow-black text-shadow-sm">
                            <span className="truncate max-w-[60px]">{enemy.name}</span>
                            <div className="flex space-x-1">
                                <span>{enemy.hp}</span>
                                {enemy.block > 0 && <span className="text-blue-300 flex items-center"><Shield size={8} className="mr-0.5"/>{enemy.block}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Bottom: Hand & Controls (Fixed to bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-64 z-30 flex flex-col justify-end pb-4 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent pointer-events-none">
            
            {/* Energy Orb */}
            <div className="absolute left-10 bottom-10 w-16 h-16 rounded-full bg-stone-900 border-[3px] border-amber-600/60 flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.3)] z-50 group pointer-events-auto">
                <div className="absolute inset-0 rounded-full border border-amber-500 opacity-50 animate-pulse"></div>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-amber-400 cinzel-font text-shadow group-hover:scale-110 transition-transform">{hero.energy}</span>
                    <span className="text-[7px] text-amber-700 font-bold uppercase tracking-wider">定力</span>
                </div>
            </div>

            {/* End Turn Button */}
            <button 
                onClick={endTurn}
                disabled={!isPlayerTurn}
                className="absolute right-10 bottom-10 bg-red-900/80 hover:bg-red-800 border-2 border-red-700 text-red-100 px-6 py-2 rounded shadow-[0_0_20px_rgba(153,27,27,0.4)] h-font text-base font-bold tracking-[0.2em] transition-all hover:scale-105 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed z-50 pointer-events-auto"
            >
                结束回合
            </button>

            {/* Deck Piles */}
            <div className="absolute left-6 bottom-32 text-[10px] text-stone-500 h-font flex flex-col gap-1 items-center pointer-events-auto">
                <div className="w-8 h-10 border border-stone-700 rounded bg-stone-900 flex items-center justify-center cinzel-font text-sm">{drawPile.length}</div>
                <span>牌库</span>
            </div>
            <div className="absolute right-6 bottom-32 text-[10px] text-stone-500 h-font flex flex-col gap-1 items-center pointer-events-auto">
                <div className="w-8 h-10 border border-stone-700 rounded bg-stone-900 flex items-center justify-center cinzel-font text-sm">{discardPile.length}</div>
                <span>弃牌</span>
            </div>

            {/* The Hand */}
            <div className="flex justify-center items-end -space-x-12 mb-2 w-full px-20 perspective-1000 pointer-events-none">
                {hand.map((cardId, idx) => {
                    const isSelected = idx === selectedCardIdx;
                    const cardData = CARDS[cardId];
                    const canAfford = hero.energy >= cardData.cost;
                    
                    // Arc calculation
                    const total = hand.length;
                    const centerIdx = (total - 1) / 2;
                    const offset = idx - centerIdx;
                    const rotate = offset * 4;
                    const translateY = Math.abs(offset) * 8;

                    return (
                        <div 
                            key={`${cardId}-${idx}`} 
                            style={{ 
                                transform: isSelected 
                                    ? 'translateY(-120px) scale(1.1) rotate(0deg)' 
                                    : `translateY(${translateY}px) rotate(${rotate}deg)`,
                                zIndex: isSelected ? 50 : 10 + idx,
                            }}
                            className="transition-all duration-300 origin-bottom hover:!translate-y-[-100px] hover:!scale-110 hover:!rotate-0 hover:z-50 pointer-events-auto pb-4"
                        >
                           <CardComponent 
                                card={cardData} 
                                disabled={!isPlayerTurn || !canAfford}
                                playable={true}
                                onClick={() => {
                                    if (cardData.target === TargetType.SINGLE) {
                                        setSelectedCardIdx(isSelected ? null : idx);
                                    } else {
                                        playCard(cardId);
                                    }
                                }}
                           /> 
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default CombatScene;
