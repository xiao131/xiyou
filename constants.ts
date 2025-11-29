import { Card, CardType, HeroClass, TargetType, Enemy, MapNode } from './types';

// --- CARD DATABASE ---

export const CARDS: Record<string, Card> = {
  // Wukong Cards
  'wk_strike': {
    id: 'wk_strike', name: '行者棍', cost: 1, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 6 点伤害。获得 1 点定力。', rarity: 'COMMON', effects: { damage: 6 }
  },
  'wk_defend': {
    id: 'wk_defend', name: '铜头铁臂', cost: 1, type: CardType.SKILL, target: TargetType.SELF,
    description: '获得 5 点格挡。', rarity: 'COMMON', effects: { block: 5 }
  },
  'wk_cudgel': {
    id: 'wk_cudgel', name: '定海神针', cost: 2, type: CardType.ATTACK, target: TargetType.ALL_ENEMIES,
    description: '对所有敌人造成 8 点伤害。', rarity: 'RARE', effects: { damage: 8 }
  },
  'wk_hair': {
    id: 'wk_hair', name: '身外身法', cost: 0, type: CardType.SKILL, target: TargetType.SELF,
    description: '抽取 2 张牌。消耗。', rarity: 'RARE', exhaust: true, effects: { draw: 2 }
  },
  'wk_ult': {
    id: 'wk_ult', name: '大圣残躯', cost: 3, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 30 点伤害并眩晕目标。消耗。', rarity: 'LEGENDARY', exhaust: true, effects: { damage: 30, status: 'STUN', statusValue: 1 }
  },

  // Tang Monk Cards
  'tg_chant': {
    id: 'tg_chant', name: '诵经', cost: 1, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 4 点伤害。获得 3 点格挡。', rarity: 'COMMON', effects: { damage: 4, block: 3 }
  },
  'tg_meditate': {
    id: 'tg_meditate', name: '禅定', cost: 1, type: CardType.SKILL, target: TargetType.SELF,
    description: '获得 8 点格挡。', rarity: 'COMMON', effects: { block: 8 }
  },
  'tg_mantra': {
    id: 'tg_mantra', name: '紧箍咒', cost: 2, type: CardType.SKILL, target: TargetType.SINGLE,
    description: '给予敌人 3 层虚弱。', rarity: 'RARE', effects: { status: 'WEAK', statusValue: 3 }
  },

  // Monster Cards (Recruitable)
  'm_tiger': {
    id: 'm_tiger', name: '猛虎下山', cost: 2, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 12 点伤害。施加 2 层易伤。消耗。', rarity: 'BOSS', exhaust: true, effects: { damage: 12, status: 'VULNERABLE', statusValue: 2 }
  },
  'm_ghost': {
    id: 'm_ghost', name: '幽冥照路', cost: 1, type: CardType.SKILL, target: TargetType.ALL_ENEMIES,
    description: '对所有敌人施加 4 层灼烧。', rarity: 'BOSS', effects: { status: 'BURN', statusValue: 4 }
  }
};

// --- STARTING DECKS ---

export const STARTING_DECKS: Record<HeroClass, string[]> = {
  [HeroClass.WUKONG]: ['wk_strike', 'wk_strike', 'wk_strike', 'wk_strike', 'wk_defend', 'wk_defend', 'wk_defend', 'wk_defend', 'wk_cudgel'],
  [HeroClass.BAJIE]: ['wk_strike'], // Placeholder
  [HeroClass.TANG]: ['tg_chant', 'tg_chant', 'tg_chant', 'tg_meditate', 'tg_meditate', 'tg_meditate', 'tg_mantra', 'tg_mantra']
};

// --- ENEMIES ---

export const ENEMIES: Record<string, Partial<Enemy>> = {
  'skeleton': { name: '白骨卒', maxHp: 20, image: '💀', recruitCardId: undefined },
  'rat_archer': { name: '鼠弩手', maxHp: 18, image: '🐀', recruitCardId: undefined },
  'tiger_vanguard': { 
    name: '虎先锋', 
    maxHp: 80, 
    isElite: true, 
    image: '🐯',
    recruitCardId: 'm_tiger'
  },
  'black_bear': {
    name: '黑熊精',
    maxHp: 150,
    isBoss: true,
    image: '🐻',
    recruitCardId: 'm_ghost' // Placeholder reward
  }
};

// --- MAP GENERATION HELPER ---
// Simplified linear map for prototype
export const GENERATE_MAP = (): MapNode[] => {
  return [
    { id: 0, type: 'COMBAT', completed: false, x: 10, y: 50, next: [1] },
    { id: 1, type: 'COMBAT', completed: false, x: 30, y: 50, next: [2] },
    { id: 2, type: 'REST', completed: false, x: 50, y: 30, next: [3] },
    { id: 3, type: 'ELITE', completed: false, x: 70, y: 50, next: [4] },
    { id: 4, type: 'REST', completed: false, x: 85, y: 50, next: [5] },
    { id: 5, type: 'BOSS', completed: false, x: 95, y: 50, next: [] },
  ];
};