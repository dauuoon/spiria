import type { ItemDef } from '../types/game'

// 12 base craft materials + etc progression items.
export const ITEMS: readonly ItemDef[] = [
	{ id: 'flower', name: '꽃', category: '재료' },
	{ id: 'leaf', name: '잎', category: '재료' },
	{ id: 'soil', name: '흙', category: '재료' },
	{ id: 'water', name: '물', category: '재료' },
	{ id: 'fire', name: '불', category: '재료' },
	{ id: 'wind', name: '바람', category: '재료' },
	{ id: 'star', name: '별', category: '재료' },
	{ id: 'moon', name: '달', category: '재료' },
	{ id: 'light', name: '태양', category: '재료' },
	{ id: 'magic', name: '마법', category: '재료' },
	{ id: 'ether', name: '에테르', category: '재료' },
	{ id: 'gem', name: '보석', category: '재료' },
	{ id: 'soul', name: '정령의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'forest_trace', name: '숲의 잔향', category: '기타', icon: 'assets/item/it/it_forestmap.png' },
	{ id: 'wind_trace', name: '바람의 메아리', category: '기타', icon: 'assets/item/it/it_windmap.png' },
	{ id: 'lake_trace', name: '설원의 기억', category: '기타', icon: 'assets/item/it/it_lakemap.png' },
	{ id: 'ruins_trace', name: '화염의 잔재', category: '기타', icon: 'assets/item/it/it_ruinsmap.png' },
	{ id: 'final_trace', name: '어둠의 흔적', category: '기타', icon: 'assets/item/it/it_finalmap.png' },
] as const

export const MATERIAL_ITEM_IDS = ITEMS.filter((it) => it.category === '재료').map((it) => it.id)
export const ETC_ITEM_IDS = ITEMS.filter((it) => it.category === '기타').map((it) => it.id)

export const TRACE_ITEM_BY_STAGE = {
	1: 'forest_trace',
	2: 'wind_trace',
	3: 'lake_trace',
	4: 'ruins_trace',
	5: 'final_trace',
} as const

// Progression thresholds are centralized so unlock features can consume the same values.
export const SOUL_UNLOCK_THRESHOLD = 20
export const TRACE_UNLOCK_THRESHOLD = 10
