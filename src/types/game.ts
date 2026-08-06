// Shared game data types for Spiria
// Truth source for numbers: balance Excel + src/data

export type HexColor = `#${string}`
export type BalanceValue = number | 'TBD' | 'Draft'

export interface LevelEntry {
  level: number
  expToNext: number // 0 for max level
  color: HexColor
}

export type QuestTier = 'Easy' | 'Normal' | 'Hard' | 'Special'

export interface QuestTierReward {
  tier: QuestTier
  exp: number
  gold: number
  special?: boolean // e.g., rare reward indicator
}

export interface DungeonBaseReward {
  exp: number
  gold: { min: number; max: number }
  materials: { min: number; max: number }
}

export interface ItemDef {
  id: string
  name: string
  category: '재료' | '기타'
  icon?: string // optional: inventory icon image path under public/assets
  // rarity, price, etc. are TBD and should be filled when confirmed in balance
  rarity?: string // TBD
  price?: number // TBD
}

export type MaterialCategory = 'nature' | 'element' | 'sky' | 'mystic'

export interface CraftingMaterial {
  id: string
  name: string
  englishName: string
  category: '재료'
  materialCategory: MaterialCategory
}

export type CurrencyType = 'exp' | 'gold' | 'mana'

export type SpiritRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface SpiritFragment {
  fragmentId: string
  spiritId: string
  ownedAmount: number
  requiredAmount: number
}

export interface RegionTrace {
  regionId: string
  itemId: string
  name: string
  hiddenStageRequiredAmount: number
  dropChance: BalanceValue
  dropAmount: BalanceValue
}

// Level title labels shown in UI (profile, badges, toasts)
export type LevelTitle =
  | '견습 빚음꾼'
  | '초급 빚음꾼'
  | '정령 빚음꾼'
  | '숙련 빚음꾼'
  | '정령 장인'
  | '마도 장인'
  | '대장인'
  | '정령 현자'
  | '대현자'
  | '별의 계승자'
  | '스피리아의 창조자'

export interface DropDef {
  id: string
  itemId: string
  // final drop rate is TBD; do not hardcode until confirmed
  dropRate?: number // TBD
}

export interface SpiritDef {
  id: string
  name: string
  rarity?: SpiritRarity
  // stats, growth cost are TBD
  // stats?: Record<string, number> // TBD
}

export interface RecipeDef {
  id: string
  resultItemId: string
  ingredientIds: string[]
  // crafting failure and success rates TBD
}

export interface OrderedCraftingRecipe {
  materialIds: [string, string, string]
  recipeKey: string
}

export interface EconomySettings {
  mainColor: HexColor
}

export interface CraftingCostTier {
  minLevel: number
  maxLevel: number
  requiredPerMaterial: number
  selectedMaterialKinds: number
}

export interface CraftingMaterialCost {
  minLevel: number
  maxLevel: number
  requiredPerMaterial: number
  selectedMaterialKinds: number
  totalMaterialCost: number
}

export interface HiddenStageReward {
  regionId: string
  guaranteedSpiritFragmentAmount: BalanceValue
  mana: BalanceValue
  gold: BalanceValue
  exp: BalanceValue
}

export interface RegionDropTableEntry {
  itemId: string
  weight: number
  minCount: number
  maxCount: number
}

export interface RegionEventTemplate {
  id: string
  kind: 'spirit' | 'regional' | 'treasure'
  gameType?: 'timing' | 'matching' | 'fortune'
  title: string
  description: string
  reward: Record<string, number | string | string[] | undefined>
}

export interface RegionDef {
  id: string
  name: string
  unlockLevel: number
  recommendedLevel: number
  manaCost: number
  exploreSteps: number
  traceItemId: string
  traceName: string
  hiddenStageRequiredAmount: number
  nextRegionId: string
  nextRegionUnlockLevel: number
  explorationRateWeights: {
    material: number
    spirit: number
    regional: number
    treasure: number
    merchant: number
  }
  discoveryTotals: {
    material: number
    spirit: number
    regional: number
    treasure: number
    merchant: number
  }
  dropTable: RegionDropTableEntry[]
  eventTemplates: RegionEventTemplate[]
  emptyEventTexts: string[]
}

// Dungeon definitions for Expedition
export interface DungeonDef {
  id: string
  name: string
  unlockLv: number
  recommendedLv: number
  manaCost: number
  baseExp: number
  goldReward: number
  materialDropCount: number
  rareMaterialChance: number // 0..1
}
