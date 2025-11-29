
import React from 'react';
import { Card, CardType } from '../types';
import { Skull } from 'lucide-react';

interface CardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  playable?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, disabled, playable }) => {
  
  // Use specific image from card definition, or a safe fallback texture
  const bgImage = card.image || 'https://images.unsplash.com/photo-1533158307587-828f0a76ef93?auto=format&fit=crop&w=300&q=80';

  const getBorderColor = (type: CardType) => {
    switch(type) {
        case CardType.ATTACK: return 'border-red-900';
        case CardType.SKILL: return 'border-blue-900';
        case CardType.POWER: return 'border-amber-700';
        case CardType.CURSE: return 'border-purple-900';
        default: return 'border-stone-600';
    }
  }

  const getFrameGradient = (type: CardType) => {
    switch (type) {
      case CardType.ATTACK: return 'bg-gradient-to-b from-stone-800 to-red-950';
      case CardType.SKILL: return 'bg-gradient-to-b from-stone-800 to-blue-950';
      case CardType.POWER: return 'bg-gradient-to-b from-stone-800 to-amber-950';
      default: return 'bg-stone-800';
    }
  };

  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-40 h-60 rounded-xl border-[3px] select-none transition-all duration-300
        flex flex-col shadow-2xl overflow-hidden group
        ${getBorderColor(card.type)} ${getFrameGradient(card.type)}
        ${playable && !disabled ? 'cursor-pointer card-glow z-10 brightness-110' : 'brightness-75 cursor-not-allowed scale-95'}
      `}
    >
       {/* Card Top Header */}
       <div className="relative h-7 flex items-center justify-between px-2 bg-stone-950/80 border-b border-white/10 z-20">
            <span className={`text-[10px] font-bold tracking-widest h-font text-stone-300`}>
                {card.type === CardType.ATTACK ? '攻击' : card.type === CardType.SKILL ? '技能' : '能力'}
            </span>
            {/* Cost Orb */}
            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full 
                bg-gradient-to-br from-amber-300 to-amber-700 
                border-2 border-stone-900 shadow-lg -mr-3 -mt-3 z-30
            `}>
                <span className="text-lg font-bold text-stone-900 cinzel-font">{card.cost}</span>
            </div>
       </div>

      {/* Card Image Area */}
      <div className="relative h-28 w-full bg-stone-800 overflow-hidden border-y border-stone-800 group-hover:h-32 transition-all duration-300">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
             style={{ backgroundImage: `url('${bgImage}')` }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {card.rarity === 'BOSS' && <div className="absolute top-1 left-1 text-red-500 bg-black/50 rounded-full p-1"><Skull size={12}/></div>}
      </div>

      {/* Card Name Ribbon */}
      <div className="relative -mt-3 mx-1 py-1 bg-stone-900/95 border-y border-amber-800/60 shadow-md text-center z-10">
        <div className="text-xs font-bold text-amber-100 h-font tracking-widest text-shadow-sm truncate px-1">
            {card.name}
        </div>
      </div>

      {/* Card Description */}
      <div className="flex-grow p-2 flex flex-col items-center justify-start pt-3 relative bg-black/20">
        <div className="absolute inset-0 texture-paper opacity-10 pointer-events-none"></div>
        <p className="text-[10px] text-stone-200 font-serif leading-snug text-center relative z-10 drop-shadow-md">
          {card.description}
        </p>
        
        {card.exhaust && (
            <div className="mt-auto mb-1 text-[9px] font-bold text-red-400 border border-red-900/50 px-2 py-0.5 rounded bg-black/60">
                消耗
            </div>
        )}
      </div>

      {/* Rarity Indicator (Bottom Gem) */}
      <div className="h-3 w-full bg-stone-950 flex justify-center items-center border-t border-white/5">
         <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px] 
            ${card.rarity === 'COMMON' ? 'bg-stone-500 shadow-stone-500' : ''}
            ${card.rarity === 'RARE' ? 'bg-blue-400 shadow-blue-400' : ''}
            ${card.rarity === 'LEGENDARY' ? 'bg-amber-400 shadow-amber-400' : ''}
            ${card.rarity === 'BOSS' ? 'bg-red-600 shadow-red-600' : ''}
         `}></div>
      </div>
    </div>
  );
};

export default CardComponent;
