import { IngredientType } from './constants';

export interface Player {
  id: number;
  name: string;
  color: string;
  coins: number;
  score: number;
  slots: { type: IngredientType; nums: number[] }[];
  hand: Partial<Record<IngredientType, number>>;
  customer: any; // Using any for now to simplify, could be typed further
  surprises: any[];
  isAuto: boolean;
}

export interface GameState {
  players: Player[];
  cur: number;
  bank: Partial<Record<IngredientType, number>>;
  custDeck: any[];
  srpDeck: any[];
  phase: 'setup' | 'waiting' | 'roll' | 'pick7' | 'action' | 'gameover';
  dice: [number, number];
  rolled: boolean;
  lastRoll: { sum: number; results: { playerIdx: number; type: IngredientType }[] } | null;
  round: number;
  extraTurn: boolean;
  winMode: 'score' | 'bank';
  sidePanelOpen: boolean;
  actionsDrawerOpen: boolean;
}

export interface RoomPlayer {
  socketId: string;
  name: string;
}
