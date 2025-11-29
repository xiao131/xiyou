export enum CardType {
  ATTACK = 'ATTACK',
  SKILL = 'SKILL',
  POWER = 'POWER',
  CURSE = 'CURSE'
}

export enum TargetType {
  SINGLE = 'SINGLE',
  ALL_ENEMIES = 'ALL_ENEMIES',
  SELF = 'SELF'
}

export enum HeroClass {
  WUKONG = 'WUKONG',
  BAJIE = 'BAJIE',
  TANG = 'TANG'
}

export interface CardEffect {
  damage?: number;
  block?: number;
  draw?: number;
  heal?: number;
  status?: string; // e.g., "STUN", "VULNERABLE"
  statusValue?: number;
  special?: string; // e.g., "RECRUIT_BONUS"
}

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  target: TargetType;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY' | 'BOSS';
  effects: CardEffect;
  exhaust?: boolean;
  image?: string; // Fallback or class name for visual
}

export interface Entity {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  block: number;
  maxEnergy: number; // Enemies usually don't use energy, but heroes do
  energy: number;
  image: string;
  statuses: Record<string, number>;
}

export interface Enemy extends Entity {
  intent: 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'SPECIAL';
  intentValue: number;
  isElite?: boolean;
  isBoss?: boolean;
  recruitCardId?: string; // If recruited, which card does it become?
}

export interface Hero extends Entity {
  class: HeroClass;
  gold: number;
}

export type GameState = 'MENU' | 'MAP' | 'COMBAT' | 'REWARD' | 'GAME_OVER' | 'VICTORY';

export interface MapNode {
  id: number;
  type: 'COMBAT' | 'ELITE' | 'REST' | 'BOSS' | 'EVENT';
  completed: boolean;
  x: number;
  y: number;
  next: number[]; // Adjacency list
}