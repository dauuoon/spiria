import type { DungeonBaseReward, DungeonDef } from '../types/game'

export const DUNGEON_BASE_REWARD: DungeonBaseReward = {
  exp: 25,
  gold: { min: 15, max: 30 },
  materials: { min: 2, max: 4 },
} as const

// Ordered by stage for Expedition (1..5)
export const DUNGEONS: DungeonDef[] = [
  {
    id: 'forest_tbd',
    name: '별빛 숲속',
    unlockLv: 1,
    recommendedLv: 1,
    manaCost: 1,
    baseExp: 25,
    goldReward: 20,
    materialDropCount: 1,
    rareMaterialChance: 0.03,
  },
  {
    id: 'wind_canyon',
    name: '바람의 협곡',
    unlockLv: 5,
    recommendedLv: 5,
    manaCost: 1,
    baseExp: 35,
    goldReward: 28,
    materialDropCount: 1,
    rareMaterialChance: 0.05,
  },
  {
    id: 'frozen_lake',
    name: '얼어붙은 설원',
    unlockLv: 10,
    recommendedLv: 10,
    manaCost: 1,
    baseExp: 50,
    goldReward: 40,
    materialDropCount: 2,
    rareMaterialChance: 0.07,
  },
  {
    id: 'flame_ruins',
    name: '화염의 산맥',
    unlockLv: 15,
    recommendedLv: 15,
    manaCost: 1,
    baseExp: 70,
    goldReward: 56,
    materialDropCount: 2,
    rareMaterialChance: 0.09,
  },
  {
    id: 'dark_swamp',
    name: '어둠의 습지',
    unlockLv: 20,
    recommendedLv: 20,
    manaCost: 1,
    baseExp: 100,
    goldReward: 80,
    materialDropCount: 3,
    rareMaterialChance: 0.12,
  },
]
