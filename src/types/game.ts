// Shared game data types for Spiria
// Truth source for numbers: balance Excel + src/data

export type HexColor = `#${string}`

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
  // rarity, price, etc. are TBD and should be filled when confirmed in balance
  rarity?: string // TBD
  price?: number // TBD
}

export interface DropDef {
  id: string
  itemId: string
  // final drop rate is TBD; do not hardcode until confirmed
  dropRate?: number // TBD
}

export interface SpiritDef {
  id: string
  name: string
  // grade, stats, growth cost are TBD
  grade?: string // TBD
  // stats?: Record<string, number> // TBD
}

export interface RecipeDef {
  id: string
  resultItemId: string
  ingredientIds: string[]
  // crafting failure and success rates TBD
}

export interface EconomySettings {
  mainColor: HexColor
}
