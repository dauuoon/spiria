import type { DungeonBaseReward } from '../types/game'

export const DUNGEON_BASE_REWARD: DungeonBaseReward = {
  exp: 25,
  gold: { min: 15, max: 30 },
  materials: { min: 2, max: 4 },
} as const
