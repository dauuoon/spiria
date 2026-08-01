import type { CraftingMaterial, ItemDef } from '../types/game'

export const CRAFTING_MATERIALS: readonly CraftingMaterial[] = [
	{ id: 'flower', name: '꽃', englishName: 'Flower', category: '재료', materialCategory: 'nature' },
	{ id: 'leaf', name: '잎', englishName: 'Leaf', category: '재료', materialCategory: 'nature' },
	{ id: 'soil', name: '흙', englishName: 'Soil', category: '재료', materialCategory: 'nature' },
	{ id: 'water', name: '물', englishName: 'Water', category: '재료', materialCategory: 'element' },
	{ id: 'fire', name: '불', englishName: 'Fire', category: '재료', materialCategory: 'element' },
	{ id: 'wind', name: '바람', englishName: 'Wind', category: '재료', materialCategory: 'element' },
	{ id: 'star', name: '별', englishName: 'Star', category: '재료', materialCategory: 'sky' },
	{ id: 'moon', name: '달', englishName: 'Moon', category: '재료', materialCategory: 'sky' },
	{ id: 'light', name: '태양', englishName: 'Sun', category: '재료', materialCategory: 'sky' },
	{ id: 'magic', name: '마법', englishName: 'Magic', category: '재료', materialCategory: 'mystic' },
	{ id: 'ether', name: '에테르', englishName: 'Aether', category: '재료', materialCategory: 'mystic' },
	{ id: 'gem', name: '보석', englishName: 'Gem', category: '재료', materialCategory: 'mystic' },
] as const

export const ETC_ITEMS: readonly ItemDef[] = [
	{ id: 'fragment_spirit_soyo', name: '소요의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_rua', name: '루아의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_pleo', name: '플레오의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_stellio', name: '스텔리오의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_porina', name: '포리나의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_nubi', name: '누비의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'forest_trace', name: '숲의 잔향', category: '기타', icon: 'assets/item/it/it_forestmap.png' },
	{ id: 'wind_trace', name: '바람의 메아리', category: '기타', icon: 'assets/item/it/it_windmap.png' },
	{ id: 'lake_trace', name: '설원의 기억', category: '기타', icon: 'assets/item/it/it_lakemap.png' },
	{ id: 'ruins_trace', name: '화염의 잔재', category: '기타', icon: 'assets/item/it/it_ruinsmap.png' },
	{ id: 'final_trace', name: '어둠의 흔적', category: '기타', icon: 'assets/item/it/it_finalmap.png' },
] as const

export const ITEMS: readonly ItemDef[] = [...CRAFTING_MATERIALS, ...ETC_ITEMS] as const

export const MATERIAL_ITEM_IDS = CRAFTING_MATERIALS.map((it) => it.id)
export const ETC_ITEM_IDS = ETC_ITEMS.map((it) => it.id)

export const TRACE_ITEM_BY_STAGE = {
	1: 'forest_trace',
	2: 'wind_trace',
	3: 'lake_trace',
	4: 'ruins_trace',
	5: 'final_trace',
} as const
