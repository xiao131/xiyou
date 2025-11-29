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
  
  // Define keywords for Unsplash images based on card name/type
  const getImageKeyword = (card: Card) => {
    if (card.image) return card.image;
    if (card.name.includes('行者棍')) return 'staff,martial arts';
    if (card.name.includes('铜头')) return 'armor,iron';
    if (card.name.includes('定海')) return 'ocean,tsunami';
    if (card.name.includes('毛')) return 'monkey,fur';
    if (card.name.includes('大圣')) return 'king,gold';
    if (card.name.includes('诵经')) return 'buddha,scroll';
    if (card.name.includes('禅')) return 'meditation,lotus';
    if (card.name.includes('紧箍')) return 'gold ring,headache';
    if (card.name.includes('虎')) return 'tiger,claw';
    if (card.name.includes('幽冥')) return 'lantern,ghost';
    return card.type === CardType.ATTACK ? 'weapon,fight' : 'magic,spell';
  };

  const imageUrl = `https://source.unsplash.com/featured/?${getImageKeyword(card)}`;
  // Fallback to static IDs if source.unsplash is flaky, but for now we rely on keywords or specific urls if passed in card.image.
  // Ideally in production we map specific IDs. For this demo, let's use a reliable placeholder service logic or a static map if needed.
  // Using a more consistent image service for demo:
  const getSafeImage = (keyword: string) => {
      const map: Record<string, string> = {
          '行者棍': 'https://images.unsplash.com/photo-1535581652167-3d6b98c364c3?auto=format&fit=crop&w=300&q=80',
          '铜头铁臂': 'https://images.unsplash.com/photo-1598556776374-3ad9392c6360?auto=format&fit=crop&w=300&q=80',
          '定海神针': 'https://images.unsplash.com/photo-1551092825-2633df04cb9c?auto=format&fit=crop&w=300&q=80',
          '身外身法': 'https://images.unsplash.com/photo-1628146765790-2c3584852c03?auto=format&fit=crop&w=300&q=80',
          '大圣残躯': 'https://images.unsplash.com/photo-1637823616295-2070094b9df0?auto=format&fit=crop&w=300&q=80',
          '诵经': 'https://images.unsplash.com/photo-1601633512330-1c0957dc5894?auto=format&fit=crop&w=300&q=80',
          '禅定': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80',
          '紧箍咒': 'https://images.unsplash.com/photo-1616091093745-f0490b0e5170?auto=format&fit=crop&w=300&q=80',
          '猛虎下山': 'https://images.unsplash.com/photo-1505567745926-ba89000d255a?auto=format&fit=crop&w=300&q=80',
          '幽冥照路': 'https://images.unsplash.com/photo-1510598852355-6b328a2b535d?auto=format&fit=crop&w=300&q=80',
      };
      return map[card.name] || 'https://images.unsplash.com/photo-1533158307587-828f0a76ef93?auto=format&fit=crop&w=300&q=80';
  }

  const bgImage = getSafeImage(card.name);

  const getBorderColor = (type: CardType) => {
    switch(type) {
        case CardType.ATTACK: return 'border-red-800';
        case CardType.SKILL: return 'border-blue-800';
        case CardType.POWER: return 'border-amber-600';
        case CardType.CURSE: return 'border-purple-900';
        default: return 'border-stone-600';
    }
  }

  const getFrameGradient = (type: CardType) => {
    switch (type) {
      case CardType.ATTACK: return 'bg-gradient-to-br from-stone-800 via-red-950 to-stone-900';
      case CardType.SKILL: return 'bg-gradient-to-br from-stone-800 via-blue-950 to-stone-900';
      case CardType.POWER: return 'bg-gradient-to-br from-stone-800 via-amber-950 to-stone-900';
      default: return 'bg-stone-800';
    }
  };

  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-48 h-72 rounded-xl border-[3px] select-none transition-all duration-300
        flex flex-col shadow-2xl overflow-hidden group
        ${getBorderColor(card.type)} ${getFrameGradient(card.type)}
        ${playable && !disabled ? 'cursor-pointer card-glow z-10' : 'opacity-80 grayscale-[0.5] cursor-not-allowed scale-95'}
      `}
    >
       {/* Card Top Header */}
       <div className="relative h-8 flex items-center justify-between px-2 bg-stone-950/60 border-b border-white/10 z-20">
            <span className={`text-xs font-bold tracking-widest h-font text-stone-200`}>
                {card.type === CardType.ATTACK ? '攻击' : card.type === CardType.SKILL ? '技能' : '能力'}
            </span>
            {/* Cost Orb */}
            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full 
                bg-gradient-to-br from-amber-400 to-amber-700 
                border-2 border-stone-800 shadow-lg -mr-4 -mt-4 z-30
            `}>
                <span className="text-xl font-bold text-stone-900 cinzel-font">{card.cost}</span>
            </div>
       </div>

      {/* Card Image Area */}
      <div className="relative h-32 w-full bg-black overflow-hidden border-y border-stone-800">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
             style={{ backgroundImage: `url('${bgImage}')` }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {card.rarity === 'BOSS' && <div className="absolute top-1 left-1 text-red-500"><Skull size={16}/></div>}
      </div>

      {/* Card Name Ribbon */}
      <div className="relative -mt-3 mx-2 py-1 bg-stone-900 border border-amber-900/50 shadow-md text-center z-10">
        <div className="text-sm font-bold text-amber-100 h-font tracking-widest text-shadow-sm">
            {card.name}
        </div>
      </div>

      {/* Card Description */}
      <div className="flex-grow p-3 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 texture-paper opacity-10 pointer-events-none"></div>
        <p className="text-xs text-stone-300 font-serif leading-relaxed text-center relative z-10">
          {card.description}
        </p>
        {card.exhaust && (
            <span className="mt-2 text-[10px] font-bold text-red-400 border border-red-900/50 px-2 py-0.5 rounded bg-black/40">
                消耗
            </span>
        )}
      </div>

      {/* Rarity Indicator (Bottom Gem) */}
      <div className="h-4 w-full bg-stone-950 flex justify-center items-center border-t border-white/5">
         <div className={`w-2 h-2 rounded-full shadow-[0_0_5px] 
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