import type { HiddenStageReward, RegionTrace, SpiritFragment } from '../types/game'
import { SPIRITS } from './spirits'

export const SPIRIT_FRAGMENT_REQUIRED_AMOUNT = 50 as const
export const HIDDEN_STAGE_TRACE_REQUIRED_AMOUNT = 10 as const

export const SPIRIT_FRAGMENTS: readonly SpiritFragment[] = SPIRITS.map((spirit) => ({
  fragmentId: `fragment_${spirit.id}`,
  spiritId: spirit.id,
  ownedAmount: 0,
  requiredAmount: SPIRIT_FRAGMENT_REQUIRED_AMOUNT,
})) as readonly SpiritFragment[]

export const REGION_TRACES: readonly RegionTrace[] = [
  {
    regionId: 'starlight_forest',
    itemId: 'forest_trace',
    name: '숲의 잔향',
    hiddenStageRequiredAmount: HIDDEN_STAGE_TRACE_REQUIRED_AMOUNT,
    dropChance: 'TBD',
    dropAmount: 'TBD',
  },
  {
    regionId: 'wind_canyon',
    itemId: 'wind_trace',
    name: '바람의 메아리',
    hiddenStageRequiredAmount: HIDDEN_STAGE_TRACE_REQUIRED_AMOUNT,
    dropChance: 'TBD',
    dropAmount: 'TBD',
  },
  {
    regionId: 'frozen_lake',
    itemId: 'lake_trace',
    name: '설원의 기억',
    hiddenStageRequiredAmount: HIDDEN_STAGE_TRACE_REQUIRED_AMOUNT,
    dropChance: 'TBD',
    dropAmount: 'TBD',
  },
  {
    regionId: 'flame_ruins',
    itemId: 'ruins_trace',
    name: '화염의 잔재',
    hiddenStageRequiredAmount: HIDDEN_STAGE_TRACE_REQUIRED_AMOUNT,
    dropChance: 'TBD',
    dropAmount: 'TBD',
  },
  {
    regionId: 'dark_swamp',
    itemId: 'final_trace',
    name: '어둠의 흔적',
    hiddenStageRequiredAmount: HIDDEN_STAGE_TRACE_REQUIRED_AMOUNT,
    dropChance: 'TBD',
    dropAmount: 'TBD',
  },
] as const

export const HIDDEN_STAGE_REWARD_DRAFT: readonly HiddenStageReward[] = [
  {
    regionId: 'starlight_forest',
    guaranteedSpiritFragmentAmount: 'TBD',
    mana: 'TBD',
    gold: 'TBD',
    exp: 'TBD',
  },
  {
    regionId: 'wind_canyon',
    guaranteedSpiritFragmentAmount: 'TBD',
    mana: 'TBD',
    gold: 'TBD',
    exp: 'TBD',
  },
  {
    regionId: 'frozen_lake',
    guaranteedSpiritFragmentAmount: 'TBD',
    mana: 'TBD',
    gold: 'TBD',
    exp: 'TBD',
  },
  {
    regionId: 'flame_ruins',
    guaranteedSpiritFragmentAmount: 'TBD',
    mana: 'TBD',
    gold: 'TBD',
    exp: 'TBD',
  },
  {
    regionId: 'dark_swamp',
    guaranteedSpiritFragmentAmount: 'TBD',
    mana: 'TBD',
    gold: 'TBD',
    exp: 'TBD',
  },
] as const

export const SPIRIT_FRAGMENT_ITEM_BY_STAGE = {
  1: 'fragment_spirit_soyo',
  2: 'fragment_spirit_rua',
  3: 'fragment_spirit_pleo',
  4: 'fragment_spirit_stellio',
  5: 'fragment_spirit_porina',
} as const
