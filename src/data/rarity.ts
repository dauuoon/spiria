import type { HexColor, SpiritRarity } from '../types/game'

export type SpiritRarityToken = {
  key: SpiritRarity
  ko: '일반' | '레어' | '에픽' | '전설'
  en: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  mainColor: HexColor
  borderColor: HexColor
}

export const SPIRIT_RARITY_TOKENS: Record<SpiritRarity, SpiritRarityToken> = {
  common: {
    key: 'common',
    ko: '일반',
    en: 'Common',
    mainColor: '#C2C7D1',
    borderColor: '#B8BEC9',
  },
  rare: {
    key: 'rare',
    ko: '레어',
    en: 'Rare',
    mainColor: '#5FBFFF',
    borderColor: '#67B8FF',
  },
  epic: {
    key: 'epic',
    ko: '에픽',
    en: 'Epic',
    mainColor: '#A894FF',
    borderColor: '#8A73F5',
  },
  legendary: {
    key: 'legendary',
    ko: '전설',
    en: 'Legendary',
    mainColor: '#F6E7A8',
    borderColor: '#E7C55B',
  },
}

export function getRarityByItemId(itemId: string, category: '재료' | '기타'): SpiritRarity {
  if (category === '재료') return 'common'
  if (itemId.startsWith('fragment_spirit_')) return 'legendary'
  if (itemId === 'final_trace') return 'legendary'
  if (itemId === 'lake_trace' || itemId === 'ruins_trace') return 'epic'
  if (itemId === 'forest_trace' || itemId === 'wind_trace') return 'rare'
  return 'common'
}

export const INVENTORY_RARITY_UI: Record<SpiritRarity, { badgeClass: string; titleClass: string; bgImage: string }> = {
  common: {
    badgeClass: 'text-[#C2C7D1] bg-[#C2C7D1]/12 border-[#B8BEC9]/35',
    titleClass: 'text-[#C2C7D1]',
    bgImage: 'assets/background/item_common_bg.png',
  },
  rare: {
    badgeClass: 'text-[#5FBFFF] bg-[#5FBFFF]/12 border-[#67B8FF]/35',
    titleClass: 'text-[#5FBFFF]',
    bgImage: 'assets/background/item_rare_bg.png',
  },
  epic: {
    badgeClass: 'text-[#A894FF] bg-[#A894FF]/12 border-[#8A73F5]/35',
    titleClass: 'text-[#A894FF]',
    bgImage: 'assets/background/item_epic_bg.png',
  },
  legendary: {
    badgeClass: 'text-[#F6E7A8] bg-[#F6E7A8]/12 border-[#E7C55B]/35',
    titleClass: 'text-[#F6E7A8]',
    bgImage: 'assets/background/item_lehendary_bg.png',
  },
}

export const RESULT_RARITY_UI: Record<SpiritRarity, { rowClass: string; textClass: string; valueClass: string; lootClass: string; borderColor: string }> = {
  common: {
    rowClass: 'bg-white/[0.04] border border-white/10',
    textClass: 'text-[#C2C7D1]',
    valueClass: 'text-[#C2C7D1]',
    lootClass: 'border border-[#B8BEC9]/35 bg-[#C2C7D1]/10',
    borderColor: '#B8BEC9',
  },
  rare: {
    rowClass: 'bg-[#5FBFFF]/15 border border-[#67B8FF]/50',
    textClass: 'text-[#5FBFFF]',
    valueClass: 'text-[#67B8FF]',
    lootClass: 'border border-[#67B8FF]/50 bg-[#5FBFFF]/16',
    borderColor: '#67B8FF',
  },
  epic: {
    rowClass: 'bg-[#A894FF]/15 border border-[#8A73F5]/50',
    textClass: 'text-[#A894FF]',
    valueClass: 'text-[#8A73F5]',
    lootClass: 'border border-[#8A73F5]/50 bg-[#A894FF]/16',
    borderColor: '#8A73F5',
  },
  legendary: {
    rowClass: 'bg-[#F6E7A8]/15 border border-[#E7C55B]/55',
    textClass: 'text-[#F6E7A8]',
    valueClass: 'text-[#E7C55B]',
    lootClass: 'border border-[#E7C55B]/55 bg-[#F6E7A8]/16',
    borderColor: '#E7C55B',
  },
}
