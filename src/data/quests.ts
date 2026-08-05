import type { QuestTierReward, QuestTier } from '../types/game'

export const QUEST_REWARDS: readonly QuestTierReward[] = [
  { tier: 'Easy', exp: 35, gold: 40 },
  { tier: 'Normal', exp: 58, gold: 70 },
  { tier: 'Hard', exp: 92, gold: 120 },
  { tier: 'Special', exp: 138, gold: 200, special: true },
] as const

export const QUEST_TIER_WEIGHTS: Readonly<Record<QuestTier, number>> = Object.freeze({
  'Easy': 45,
  'Normal': 35,
  'Hard': 15,
  'Special': 5,
})
