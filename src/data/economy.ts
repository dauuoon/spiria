import type { CraftingCostTier, CraftingMaterialCost, EconomySettings } from '../types/game'
import { MAIN_COLOR, TOTAL_EXP_TO_MAX } from './constants'

export const ECONOMY: EconomySettings = {
  mainColor: MAIN_COLOR,
}

export const TOTAL_EXP_REQUIRED = TOTAL_EXP_TO_MAX
export const QUEST_REJECT_PENALTY_GOLD = 200 as const
export const CRAFT_SUCCESS_EXP_MIN = 20 as const
export const CRAFT_SUCCESS_EXP_MAX = 30 as const
export const CRAFT_SUCCESS_GOLD_MIN = 20 as const
export const CRAFT_SUCCESS_GOLD_MAX = 40 as const
export const CRAFT_SUCCESS_FIRST_DISCOVERY_GEM = 1 as const
export const CRAFT_FAILURE_FRAGMENT_AMOUNT = 5 as const
export const CRAFT_FAILURE_EXP = 10 as const
export const CRAFT_FAILURE_GOLD_MIN = 5 as const
export const CRAFT_FAILURE_GOLD_MAX = 10 as const
export const CRAFT_HINT_COSTS = [50, 100, 200] as const

export const LEVEL_UP_REWARD_TIERS = [
  { minLevel: 1, maxLevel: 19, gold: 100, mana: 2 },
  { minLevel: 20, maxLevel: 49, gold: 100, mana: 2 },
  { minLevel: 50, maxLevel: 79, gold: 100, mana: 2 },
  { minLevel: 80, maxLevel: 99, gold: 100, mana: 2 },
] as const

export function getLevelUpRewardsForLevel(level: number): { gold: number; mana: number } {
  const lv = Math.max(1, Math.min(99, Math.floor(level)))
  const fallback = LEVEL_UP_REWARD_TIERS[LEVEL_UP_REWARD_TIERS.length - 1]
  const range = LEVEL_UP_REWARD_TIERS.find((r) => lv >= r.minLevel && lv <= r.maxLevel) ?? fallback
  return { gold: range.gold, mana: range.mana }
}

export const CRAFTING_COST_TIERS: readonly CraftingCostTier[] = [
  { minLevel: 1, maxLevel: 19, requiredPerMaterial: 2, selectedMaterialKinds: 3 },
  { minLevel: 20, maxLevel: 49, requiredPerMaterial: 3, selectedMaterialKinds: 3 },
  { minLevel: 50, maxLevel: 79, requiredPerMaterial: 4, selectedMaterialKinds: 3 },
  { minLevel: 80, maxLevel: 99, requiredPerMaterial: 5, selectedMaterialKinds: 3 },
] as const

export function getSpiritCraftCostByLevel(level: number): CraftingMaterialCost {
  const lv = Math.max(1, Math.floor(level))
  const fallback = CRAFTING_COST_TIERS[CRAFTING_COST_TIERS.length - 1]
  const range = CRAFTING_COST_TIERS.find((r) => lv >= r.minLevel && lv <= r.maxLevel) ?? fallback

  return {
    minLevel: range.minLevel,
    maxLevel: range.maxLevel,
    requiredPerMaterial: range.requiredPerMaterial,
    selectedMaterialKinds: range.selectedMaterialKinds,
    totalMaterialCost: range.requiredPerMaterial * range.selectedMaterialKinds,
  }
}
