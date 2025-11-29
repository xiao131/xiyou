import React, { useState, useEffect, useRef } from 'react';
import { Hero, Enemy, Card, CardType, TargetType } from '../types';
import { CARDS } from '../constants';
import CardComponent from './CardComponent';
import { Heart, Shield, Zap, Skull, Swords } from 'lucide-react';

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
    type: 'SLASH' | 'IMPACT' | 'BLOCK';
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
  
  // VFX State
  const [vfxList, setVfxList] = useState<VFX[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isHeroHit, setIsHeroHit] = useState(false); // Red flash

  // Initialize Combat
  useEffect(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDrawPile(shuffled);
    startTurn(shuffled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

  const triggerShake = () => {
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 500);
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string = 'text-white', scale: number = 1) => {
      const id = Date.now() + Math.random();
      setFloatingTexts(prev => [...prev, { id, text, x, y, color, scale }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 1000);
  };

  const spawnVFX = (type: 'SLASH' | 'IMPACT' | 'BLOCK', x: number, y: number) => {
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
      addLog("法力不足！");
      spawnFloatingText("法力不足", 20, 70, "text-blue-300");
      return;
    }

    setHero(prev => ({ ...prev, energy: prev.energy - cardData.cost }));

    const applyEffectToTarget = (target: Enemy, idx: number) => {
       let damageDealt = 0;
       
       // VFX Coordinates
       // We approximate based on index: 3 enemies max roughly spaced
       // 40% is center, 20% left, 60% right
       const targetX = 35 + idx * 15; 
       const targetY = 40;

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

       addLog(`对 ${target.name} 使用 ${cardData.name}，造成 ${damageDealt || 0} 点伤害`);
    };

    const newEnemies = [...enemies];

    if (cardData.target === TargetType.SINGLE && targetIndex !== undefined) {
       applyEffectToTarget(newEnemies[targetIndex], targetIndex);
    } else if (cardData.target === TargetType.ALL_ENEMIES) {
       newEnemies.forEach((e, i) => applyEffectToTarget(e, i));
    } else if (cardData.target === TargetType.SELF) {
       if (cardData.effects.block) {
         setHero(prev => ({ ...prev, block: prev.block + (cardData.effects.block || 0) }));
         spawnVFX('IMPACT', 20, 50); // Hero pos approx
         spawnFloatingText(`+${cardData.effects.block} 护盾`, 20, 45, "text-blue-400");
         addLog(`获得 ${cardData.effects.block} 点格挡`);
       }
    }

    setEnemies(newEnemies);

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
    const remainingEnemies = newEnemies.filter(e => e.hp > 0);
    if (remainingEnemies.length === 0) {
      setTimeout(() => {
        const lastKilledElite = enemies.find(e => (e.isElite || e.isBoss) && e.recruitCardId);
        onCombatEnd(true, lastKilledElite);
      }, 1000);
    }
  };

  const endTurn = () => {
    setIsPlayerTurn(false);
    setDiscardPile(prev => [...prev, ...hand]);
    setHand([]);

    setTimeout(async () => {
        let currentHero = { ...hero };
        currentHero.block = 0; 
        
        const newEnemies = enemies.filter(e => e.hp > 0).map(e => ({ ...e, block: 0 }));

        for (const enemy of newEnemies) {
            // Calculate damage
            let dmg = 0;
            let actionLog = "";
            
            if (enemy.intent === 'ATTACK') {
                dmg = 8 + turn;
                actionLog = `攻击造成 ${dmg} 伤害`;
                
                // Visuals
                // Spawn attack effect on Hero
                spawnVFX('SLASH', 20, 50); 
                
                let actualDmg = dmg;
                if (currentHero.block >= dmg) {
                    currentHero.block -= dmg;
                    actualDmg = 0;
                    spawnFloatingText("格挡", 20, 45, "text-blue-300");
                } else {
                    actualDmg = dmg - currentHero.block;
                    currentHero.block = 0;
                    currentHero.hp -= actualDmg;
                    
                    // Hit Feedback
                    setIsHeroHit(true);
                    setTimeout(() => setIsHeroHit(false), 300);
                    triggerShake();
                    spawnFloatingText(`-${actualDmg}`, 20, 40, "text-red-600 font-bold", 2);
                }
            } else if (enemy.intent === 'DEFEND') {
                enemy.block += 10;
                actionLog = `强化防御`;
                const eIdx = enemies.indexOf(enemy);
                spawnFloatingText("+10 护盾", 35 + eIdx * 15, 35, "text-blue-300");
            } else if (enemy.intent === 'DEBUFF') {
                actionLog = `施加虚弱`;
                spawnFloatingText("虚弱", 20, 40, "text-purple-500");
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
    <div className={`w-full h-full flex flex-col text-stone-100 relative overflow-hidden transition-all ${isScreenShaking ? 'animate-shake' : ''}`}>
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-black transition-opacity duration-1000">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518047601542-79f18c655718?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
        </div>

        {/* Hero Hit Red Flash */}
        <div className={`absolute inset-0 bg-red-900/40 pointer-events-none transition-opacity duration-200 z-40 ${isHeroHit ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* Floating Texts Layer */}
        {floatingTexts.map(ft => (
            <div 
                key={ft.id}
                className={`absolute pointer-events-none animate-float-up ${ft.color} font-bold z-50 text-shadow-md`}
                style={{ left: `${ft.x}%`, top: `${ft.y}%`, fontSize: `${1.5 * (ft.scale || 1)}rem` }}
            >
                {ft.text}
            </div>
        ))}

        {/* VFX Layer */}
        {vfxList.map(vfx => (
            <div 
                key={vfx.id}
                className="absolute pointer-events-none z-40"
                style={{ left: `${vfx.x}%`, top: `${vfx.y}%` }}
            >
                {vfx.type === 'SLASH' && (
                    <div className="slash-effect w-64" style={{ transform: `rotate(${vfx.rotation}deg)` }}></div>
                )}
                {vfx.type === 'IMPACT' && (
                    <div className="impact-ring w-32 h-32 rounded-full border-4 border-white opacity-50"></div>
                )}
                {vfx.type === 'BLOCK' && (
                    <div className="impact-ring w-20 h-20 rounded-full border-4 border-blue-400 opacity-70"></div>
                )}
            </div>
        ))}

        {/* Top UI */}
        <div className="flex justify-between items-start p-6 z-30">
            {/* Hero Status */}
            <div className="flex items-center space-x-4 bg-stone-900/80 p-4 rounded-lg border border-stone-700 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-2xl border-2 border-amber-600 shadow-lg">
                    {hero.image}
                </div>
                <div>
                    <div className="text-xl h-font text-amber-500 font-bold">{hero.name}</div>
                    <div className="flex items-center space-x-4 text-sm mt-1">
                        <span className="flex items-center text-red-400 font-bold"><Heart className="w-4 h-4 mr-1 fill-current" /> {hero.hp}/{hero.maxHp}</span>
                        <span className="flex items-center text-blue-400 font-bold"><Shield className="w-4 h-4 mr-1 fill-current" /> {hero.block}</span>
                    </div>
                </div>
            </div>
            
            {/* Combat Logs */}
            <div className="flex flex-col items-end opacity-90 text-sm font-mono space-y-1 bg-black/40 p-2 rounded">
                {logs.map((log, i) => (
                    <div key={i} className={`h-font ${i === 0 ? 'text-white font-bold text-base' : 'text-stone-400'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>

        {/* Middle: Battlefield */}
        <div className="flex-grow flex items-center justify-center space-x-12 z-20 px-10 pt-10">
            {/* Enemies */}
            {enemies.map((enemy, idx) => (
                <div 
                    key={idx} 
                    onClick={() => selectedCardIdx !== null && CARDS[hand[selectedCardIdx]].target === TargetType.SINGLE ? playCard(hand[selectedCardIdx], idx) : null}
                    className={`
                        relative flex flex-col items-center justify-end w-48 h-64 transition-all duration-300
                        ${enemy.hp <= 0 ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}
                        ${selectedCardIdx !== null && CARDS[hand[selectedCardIdx]].target === TargetType.SINGLE ? 'cursor-crosshair hover:scale-105 brightness-110 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]' : ''}
                    `}
                >
                    {/* Intent Bubble */}
                    <div className="absolute -top-10 animate-bounce bg-stone-900 border border-red-900 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg z-20">
                        {enemy.intent === 'ATTACK' && <Swords className="w-4 h-4 text-red-500" />}
                        {enemy.intent === 'DEFEND' && <Shield className="w-4 h-4 text-blue-400" />}
                        {enemy.intent === 'BUFF' && <Zap className="w-4 h-4 text-purple-400" />}
                        <span className="text-sm font-bold text-stone-200 cinzel-font">{enemy.intent === 'ATTACK' ? 8 + turn : ''}</span>
                    </div>

                    {/* Enemy Image */}
                    <div className="w-40 h-40 relative group">
                        <div className="absolute inset-0 bg-stone-900 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                         {/* Using emoji as placeholder but wrapping in effect to look cooler, or replace with image if available */}
                         <div className="text-8xl w-full h-full flex items-center justify-center filter drop-shadow-2xl grayscale-[0.3] hover:grayscale-0 transition-all">
                             {enemy.image}
                         </div>
                    </div>
                    
                    {/* Enemy Stats Bar */}
                    <div className="w-full bg-stone-900/90 rounded border border-stone-600 mt-2 overflow-hidden shadow-lg">
                        <div className="h-1 bg-red-900 w-full relative">
                            <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center px-2 py-1">
                            <span className="font-bold text-stone-300 text-xs h-font">{enemy.name}</span>
                            <div className="flex space-x-2 text-xs font-bold cinzel-font">
                                <span className="text-red-400">{enemy.hp}</span>
                                {enemy.block > 0 && <span className="text-blue-400 flex items-center"><Shield size={10} className="mr-0.5"/>{enemy.block}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Player Avatar (Visual only for hit pos) */}
        <div className="absolute left-[20%] bottom-[30%] w-20 h-20 opacity-0 pointer-events-none" id="hero-pos"></div>

        {/* Bottom: Hand & Controls */}
        <div className="h-72 z-30 flex flex-col justify-end pb-6 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/95 to-transparent">
            
            {/* Energy Orb */}
            <div className="absolute left-10 bottom-12 w-24 h-24 rounded-full bg-stone-900 border-[3px] border-amber-600/60 flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.2)]">
                <div className="absolute inset-0 rounded-full border border-amber-500 opacity-50 animate-pulse"></div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-amber-400 cinzel-font text-shadow">{hero.energy}</span>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Energy</span>
                </div>
            </div>

            {/* End Turn Button */}
            <button 
                onClick={endTurn}
                disabled={!isPlayerTurn}
                className="absolute right-10 bottom-12 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 border border-red-700 text-red-100 px-8 py-3 rounded-sm shadow-xl h-font text-xl font-bold tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
            >
                <span className="group-hover:text-white transition-colors">结束回合</span>
            </button>

            {/* Piles */}
            <div className="absolute left-8 bottom-40 text-xs text-stone-500 h-font flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-10 border border-stone-700 rounded bg-stone-900 flex items-center justify-center cinzel-font">{drawPile.length}</div>
                    <span>牌库</span>
                </div>
            </div>
            <div className="absolute right-8 bottom-40 text-xs text-stone-500 h-font flex flex-col gap-1 items-end">
                <div className="flex items-center gap-2 flex-row-reverse">
                    <div className="w-8 h-10 border border-stone-700 rounded bg-stone-900 flex items-center justify-center cinzel-font">{discardPile.length}</div>
                    <span>弃牌</span>
                </div>
            </div>

            {/* The Hand */}
            <div className="flex justify-center items-end -space-x-12 mb-2 min-h-[250px] w-full px-20">
                {hand.map((cardId, idx) => {
                    const isSelected = idx === selectedCardIdx;
                    const cardData = CARDS[cardId];
                    const canAfford = hero.energy >= cardData.cost;
                    
                    // Dynamic positioning calculation
                    const total = hand.length;
                    const centerIdx = (total - 1) / 2;
                    const offset = idx - centerIdx;
                    const rotate = offset * 4;
                    const translateY = Math.abs(offset) * 8;

                    return (
                        <div 
                            key={`${cardId}-${idx}`} 
                            style={{ 
                                transform: isSelected ? 'translateY(-60px) scale(1.15) rotate(0deg)' : `rotate(${rotate}deg) translateY(${translateY}px)`,
                                zIndex: isSelected ? 50 : idx,
                                marginLeft: idx === 0 ? 0 : '-3rem'
                            }}
                            className="transition-transform duration-300 origin-bottom hover:z-40"
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