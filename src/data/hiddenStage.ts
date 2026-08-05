// Hidden-stage runtime balance values.
// Source of truth: balance/Spiria_Game_Balance_v1.0.xlsx (09_Economy hidden_stage_* keys)

export type HiddenStageClearReward = {
  fragmentAmount: number
  exp: number
  gold: number
  materialTotalMin: number
  materialTotalMax: number
}

export const HIDDEN_STAGE_BALANCE = {
  entryTraceCost: 10,
  manaBonusAmount: 1,
  manaBonusChance: 0.05,
  firstClear: {
    fragmentAmount: 30,
    exp: 230,
    gold: 200,
    materialTotalMin: 5,
    materialTotalMax: 5,
  },
  repeatClear: {
    fragmentAmount: 20,
    exp: 120,
    gold: 100,
    materialTotalMin: 3,
    materialTotalMax: 5,
  },
} as const satisfies {
  entryTraceCost: number
  manaBonusAmount: number
  manaBonusChance: number
  firstClear: HiddenStageClearReward
  repeatClear: HiddenStageClearReward
}
