import type { DropDef } from '../types/game'

// TBD: final region/item-specific drop rates
export const DROPS: readonly DropDef[] = [] as const

// Draft runtime values used until balance is finalized.
export const EXPEDITION_REWARD_DRAFT = {
	traceDropAmountMin: 1,
	traceDropAmountMax: 2,
	spiritFragmentDropChance: 0.72,
	spiritFragmentDropAmountMin: 1,
	spiritFragmentDropAmountMax: 2,
	manaRewardMin: 0,
	manaRewardMax: 1,
	resultRevealDelayMs: 700,
} as const
