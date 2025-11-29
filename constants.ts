
import { Card, CardType, HeroClass, TargetType, Enemy, MapNode, Relic } from './types';

// --- IMAGE LIBRARY (Stable URLs) ---
export const CARD_IMAGES: Record<string, string> = {
    // Wukong (Aggressive, Weapon, Gold, Fur)
    'wk_strike': 'https://images.unsplash.com/photo-1582654326886-53d9e8df311c?q=80&w=600&auto=format&fit=crop', // Wooden Staff / Martial Arts weapon
    'wk_defend': 'https://images.unsplash.com/photo-1535067267243-c3564cd661f8?q=80&w=600&auto=format&fit=crop', // Iron / Armor Texture
    'wk_cudgel': 'https://images.unsplash.com/photo-1628965907474-51e605d83637?q=80&w=600&auto=format&fit=crop', // Dynamic Staff Movement
    'wk_hair': 'https://images.unsplash.com/photo-1520698184852-09405d45d946?q=80&w=600&auto=format&fit=crop', // Golden Fur Texture
    'wk_ult': 'https://images.unsplash.com/photo-1605218427368-35b0d877c08a?q=80&w=600&auto=format&fit=crop', // Explosion / Impact / Gold

    // Tang (Mystic, Scroll, Lotus, Light)
    'tg_chant': 'https://images.unsplash.com/photo-1507643179173-7b953c9429af?q=80&w=600&auto=format&fit=crop', // Old Scroll / Text
    'tg_meditate': 'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=600&auto=format&fit=crop', // Lotus Flower
    'tg_mantra': 'https://images.unsplash.com/photo-1596521764658-293674996906?q=80&w=600&auto=format&fit=crop', // Golden Ring / Abstract
    
    // Monsters (Darker, Creature focused)
    'm_tiger': 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?q=80&w=600&auto=format&fit=crop', // Roaring Tiger
    'm_ghost': 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?q=80&w=600&auto=format&fit=crop', // Dark Fog / Mist
    'm_spider': 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=600&auto=format&fit=crop', // Spider Web
};

// --- RELICS ---
export const RELICS: Record<string, Relic> = {
    'golden_hoop': {
        id: 'golden_hoop',
        name: '紧箍圈',
        description: '战斗开始时，获得 1 点力量（未实装）。',
        image: '👑'
    },
    'cassock': {
        id: 'cassock',
        name: '锦襕袈裟',
        description: '每回合结束时，保留 5 点格挡。',
        image: '👘'
    }
};

// --- CARD DATABASE ---

export const CARDS: Record<string, Card> = {
  // Wukong Cards
  'wk_strike': {
    id: 'wk_strike', name: '行者棍', cost: 1, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 6 点伤害。获得 1 点定力。', rarity: 'COMMON', effects: { damage: 6 },
    image: CARD_IMAGES['wk_strike']
  },
  'wk_defend': {
    id: 'wk_defend', name: '铜头铁臂', cost: 1, type: CardType.SKILL, target: TargetType.SELF,
    description: '获得 5 点格挡。若受到攻击，下回合+2定力。', rarity: 'COMMON', effects: { block: 5 },
    image: CARD_IMAGES['wk_defend']
  },
  'wk_cudgel': {
    id: 'wk_cudgel', name: '定海神针', cost: 2, type: CardType.ATTACK, target: TargetType.ALL_ENEMIES,
    description: '对所有敌人造成 8 点伤害。', rarity: 'RARE', effects: { damage: 8 },
    image: CARD_IMAGES['wk_cudgel']
  },
  'wk_hair': {
    id: 'wk_hair', name: '身外身法', cost: 0, type: CardType.SKILL, target: TargetType.SELF,
    description: '下一次攻击将触发两次。消耗。', rarity: 'RARE', exhaust: true, effects: { special: 'CLONE' },
    image: CARD_IMAGES['wk_hair']
  },
  'wk_ult': {
    id: 'wk_ult', name: '大圣残躯', cost: 3, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 30 点伤害并眩晕目标。消耗所有定力。', rarity: 'LEGENDARY', exhaust: true, effects: { damage: 30, status: 'STUN', statusValue: 1 },
    image: CARD_IMAGES['wk_ult']
  },

  // Tang Monk Cards
  'tg_chant': {
    id: 'tg_chant', name: '诵经', cost: 1, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 4 点伤害。获得 3 点格挡。', rarity: 'COMMON', effects: { damage: 4, block: 3 },
    image: CARD_IMAGES['tg_chant']
  },
  'tg_meditate': {
    id: 'tg_meditate', name: '禅定', cost: 1, type: CardType.SKILL, target: TargetType.SELF,
    description: '获得 8 点格挡。进入【禅定】状态。', rarity: 'COMMON', effects: { block: 8 },
    image: CARD_IMAGES['tg_meditate']
  },
  'tg_mantra': {
    id: 'tg_mantra', name: '紧箍咒', cost: 2, type: CardType.SKILL, target: TargetType.SINGLE,
    description: '给予敌人 3 层虚弱。', rarity: 'RARE', effects: { status: 'WEAK', statusValue: 3 },
    image: CARD_IMAGES['tg_mantra']
  },

  // Monster Cards (Recruitable)
  'm_tiger': {
    id: 'm_tiger', name: '猛虎下山', cost: 2, type: CardType.ATTACK, target: TargetType.SINGLE,
    description: '造成 12 点伤害。施加 2 层易伤。消耗。', rarity: 'BOSS', exhaust: true, effects: { damage: 12, status: 'VULNERABLE', statusValue: 2 },
    image: CARD_IMAGES['m_tiger']
  },
  'm_ghost': {
    id: 'm_ghost', name: '幽冥照路', cost: 1, type: CardType.SKILL, target: TargetType.ALL_ENEMIES,
    description: '对所有敌人施加 4 层灼烧。', rarity: 'BOSS', effects: { status: 'BURN', statusValue: 4 },
    image: CARD_IMAGES['m_ghost']
  },
  'm_spider_web': {
      id: 'm_spider_web', name: '盘丝结', cost: 1, type: CardType.SKILL, target: TargetType.SINGLE,
      description: '使一名敌人眩晕，并造成 3 点中毒。消耗。', rarity: 'BOSS', exhaust: true, effects: { status: 'STUN', statusValue: 1 },
      image: CARD_IMAGES['m_spider']
  }
};

// --- STARTING DECKS ---

export const STARTING_DECKS: Record<HeroClass, string[]> = {
  [HeroClass.WUKONG]: ['wk_strike', 'wk_strike', 'wk_strike', 'wk_strike', 'wk_defend', 'wk_defend', 'wk_defend', 'wk_defend', 'wk_cudgel'],
  [HeroClass.BAJIE]: ['wk_strike'], 
  [HeroClass.TANG]: ['tg_chant', 'tg_chant', 'tg_chant', 'tg_meditate', 'tg_meditate', 'tg_meditate', 'tg_mantra', 'tg_mantra']
};

// --- ENEMIES & GENERATION ---

export const ENEMIES: Record<string, Partial<Enemy>> = {
  // Tier 1: Small Mobs
  'skeleton': { name: '白骨卒', maxHp: 18, image: '💀', recruitCardId: undefined },
  'rat_archer': { name: '鼠弩手', maxHp: 16, image: '🐀', recruitCardId: undefined },
  'bat': { name: '夜蝙蝠', maxHp: 12, image: '🦇', recruitCardId: undefined },
  'snake': { name: '青蛇精', maxHp: 22, image: '🐍', recruitCardId: undefined },
  
  // Tier 2: Tough Mobs
  'bull_guard': { name: '牛卫士', maxHp: 35, image: '🐂', recruitCardId: undefined },
  'corrupt_monk': { name: '疯魔僧', maxHp: 28, image: '👺', recruitCardId: undefined },

  // Elites
  'tiger_vanguard': { 
    name: '虎先锋', 
    maxHp: 80, 
    isElite: true, 
    image: '🐯',
    recruitCardId: 'm_tiger'
  },
  'hundred_eyes': {
      name: '百眼魔君',
      maxHp: 75,
      isElite: true,
      image: '🕸️',
      recruitCardId: 'm_spider_web'
  },

  // Bosses
  'black_bear': {
    name: '黑熊精',
    maxHp: 160,
    isBoss: true,
    image: '🐻',
    recruitCardId: 'm_ghost' 
  },
  'yellow_wind': {
      name: '黄风大圣',
      maxHp: 150,
      isBoss: true,
      image: '🌪️',
      recruitCardId: 'm_tiger' // Placeholder
  }
};

// Encounter Tables
const COMBAT_POOLS = [
    ['skeleton', 'skeleton'], // Basic
    ['rat_archer', 'skeleton'], // Mixed Ranged
    ['bat', 'bat', 'bat'], // Swarm
    ['snake', 'rat_archer'], // Poison Duo
    ['bull_guard'], // Single Tank
    ['corrupt_monk', 'skeleton'], // Healer + DPS
    ['bull_guard', 'bat'] // Tank + Fast
];

const ELITE_POOLS = [
    ['tiger_vanguard'],
    ['hundred_eyes']
];

const BOSS_POOLS = [
    ['black_bear'],
    ['yellow_wind']
];

export const generateEnemies = (nodeType: 'COMBAT' | 'ELITE' | 'BOSS'): Enemy[] => {
    let pool = COMBAT_POOLS;
    if (nodeType === 'ELITE') pool = ELITE_POOLS;
    if (nodeType === 'BOSS') pool = BOSS_POOLS;

    // Pick a random encounter from the pool
    const encounterKeys = pool[Math.floor(Math.random() * pool.length)];

    return encounterKeys.map((key, index) => {
        const base = ENEMIES[key];
        return {
            ...base,
            id: `${key}_${Date.now()}_${index}`, // Unique ID
            hp: base.maxHp,
            block: 0,
            energy: 0,
            statuses: {},
            intent: 'ATTACK', // Default, will be randomized in CombatScene
            intentValue: 0
        } as Enemy;
    });
};

// --- MAP GENERATION HELPER ---
export const GENERATE_MAP = (): MapNode[] => {
  return [
    { id: 0, type: 'COMBAT', completed: false, x: 10, y: 50, next: [1, 2] },
    { id: 1, type: 'COMBAT', completed: false, x: 25, y: 30, next: [3] },
    { id: 2, type: 'COMBAT', completed: false, x: 25, y: 70, next: [3] },
    { id: 3, type: 'REST', completed: false, x: 45, y: 50, next: [4, 5] },
    { id: 4, type: 'COMBAT', completed: false, x: 60, y: 30, next: [6] },
    { id: 5, type: 'ELITE', completed: false, x: 60, y: 70, next: [6] },
    { id: 6, type: 'REST', completed: false, x: 80, y: 50, next: [7] },
    { id: 7, type: 'BOSS', completed: false, x: 95, y: 50, next: [] },
  ];
};
