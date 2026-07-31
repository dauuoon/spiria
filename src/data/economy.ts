import type { CraftingCostTier, CraftingMaterialCost, EconomySettings } from '../types/game'
import { MAIN_COLOR, TOTAL_EXP_TO_MAX } from './constants'

export const ECONOMY: EconomySettings = {
  mainColor: MAIN_COLOR,
}

export const TOTAL_EXP_REQUIRED = TOTAL_EXP_TO_MAX

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
