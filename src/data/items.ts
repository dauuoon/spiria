import type { ItemDef } from '../types/game'

// 12 confirmed base materials (names are Korean display names)
export const ITEMS: readonly ItemDef[] = [
	{ id: 'flower', name: '꽃' },
	{ id: 'leaf', name: '잎' },
	{ id: 'soil', name: '흙' },
	{ id: 'water', name: '물' },
	{ id: 'fire', name: '불' },
	{ id: 'wind', name: '바람' },
	{ id: 'star', name: '별' },
	{ id: 'moon', name: '달' },
	{ id: 'light', name: '태양' },
	{ id: 'magic', name: '마법' },
	{ id: 'ether', name: '에테르' },
	{ id: 'gem', name: '보석' },
] as const
