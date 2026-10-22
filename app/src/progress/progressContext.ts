import { createContext } from 'react';
import type { AchievementId, LevelInfo } from '../data/achievements';

export interface ProgressState {
  xp: number;
  badges: AchievementId[];
  // Free-form counters and sets used to evaluate achievements
  stats: Record<string, number>;
  seen: Record<string, string[]>;
}

export interface ProgressApi {
  state: ProgressState;
  levelInfo: LevelInfo;
  addXp: (amount: number, reason?: string, silent?: boolean) => void;
  unlock: (id: AchievementId) => void;
  // Increments a counter and returns the new value
  bump: (stat: string, by?: number) => number;
  // Adds a value to a named set and returns the set size
  markSeen: (set: string, value: string) => number;
  celebrate: () => void;
  reset: () => void;
}

export const ProgressContext = createContext<ProgressApi | null>(null);
