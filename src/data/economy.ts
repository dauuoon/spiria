import type { CraftingMaterialCost, CraftingMaterialCostRange, EconomySettings } from '../types/game'
import { MAIN_COLOR, TOTAL_EXP_TO_MAX } from './constants'

export const ECONOMY: EconomySettings = {
  mainColor: MAIN_COLOR,
}

export const TOTAL_EXP_REQUIRED = TOTAL_EXP_TO_MAX

export const CRAFT_MATERIAL_COST_RANGES: readonly CraftingMaterialCostRange[] = [
  { minLevel: 1, maxLevel: 19, requiredPerMaterial: 2, materialKinds: 3 },
  { minLevel: 20, maxLevel: 49, requiredPerMaterial: 3, materialKinds: 3 },
  { minLevel: 50, maxLevel: 79, requiredPerMaterial: 4, materialKinds: 3 },
  { minLevel: 80, maxLevel: 99, requiredPerMaterial: 5, materialKinds: 3 },
] as const

export function getSpiritCraftCostByLevel(level: number): CraftingMaterialCost {
  const lv = Math.max(1, Math.floor(level))
  const fallback = CRAFT_MATERIAL_COST_RANGES[CRAFT_MATERIAL_COST_RANGES.length - 1]
  const range = CRAFT_MATERIAL_COST_RANGES.find((r) => lv >= r.minLevel && lv <= r.maxLevel) ?? fallback

  return {
    minLevel: range.minLevel,
    maxLevel: range.maxLevel,
    requiredPerMaterial: range.requiredPerMaterial,
    materialKinds: range.materialKinds,
    totalRequired: range.requiredPerMaterial * range.materialKinds,
  }
}
