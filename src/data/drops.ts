import type { DropDef } from '../types/game'

// TBD: final region/item-specific drop rates
export const DROPS: readonly DropDef[] = [] as const

// Draft runtime values aligned with the exploration system spec.
export const EXPEDITION_REWARD_DRAFT = {
  traceDropAmountMin: 1,
  traceDropAmountMax: 2,
  spiritFragmentDropChance: 0.72,
  spiritFragmentDropAmountMin: 1,
  spiritFragmentDropAmountMax: 2,
  manaSingleDropChancePerExpedition: 0.0001,
  manaRewardMin: 0,
  manaRewardMax: 1,
  resultRevealDelayMs: 700,
  exploreSteps: 10,
  baseExpMin: 15,
  baseExpMax: 25,
  baseGoldMin: 10,
  baseGoldMax: 25,
  eventProbabilities: {
    material: 0.48,
    spirit: 0.18,
    regional: 0.14,
    treasure: 0.1,
    trace: 0.04,
    none: 0.09,
  },
} as const
