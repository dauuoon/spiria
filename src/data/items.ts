import type { CraftingMaterial, ItemDef } from '../types/game'

export const CRAFTING_MATERIALS: readonly CraftingMaterial[] = [
	{ id: 'flower', name: '꽃', category: '재료', englishName: 'Flower', materialCategory: 'nature' },
	{ id: 'leaf', name: '잎', category: '재료', englishName: 'Leaf', materialCategory: 'nature' },
	{ id: 'soil', name: '흙', category: '재료', englishName: 'Soil', materialCategory: 'nature' },
	{ id: 'water', name: '물', category: '재료', englishName: 'Water', materialCategory: 'element' },
	{ id: 'fire', name: '불', category: '재료', englishName: 'Fire', materialCategory: 'element' },
	{ id: 'wind', name: '바람', category: '재료', englishName: 'Wind', materialCategory: 'element' },
	{ id: 'star', name: '별', category: '재료', englishName: 'Star', materialCategory: 'sky' },
	{ id: 'moon', name: '달', category: '재료', englishName: 'Moon', materialCategory: 'sky' },
	{ id: 'light', name: '태양', category: '재료', englishName: 'Sun', materialCategory: 'sky' },
	{ id: 'magic', name: '마법', category: '재료', englishName: 'Magic', materialCategory: 'mystic' },
	{ id: 'ether', name: '에테르', category: '재료', englishName: 'Aether', materialCategory: 'mystic' },
	{ id: 'gem', name: '보석', category: '재료', englishName: 'Gem', materialCategory: 'mystic' },
] as const

export const ETC_ITEMS: readonly ItemDef[] = [
	{ id: 'fragment_spirit_soyo', name: '소요의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_rua', name: '루아의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_tera', name: '테라의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_pleo', name: '플레오의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_stellio', name: '스텔리오의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_porina', name: '포리나의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_igni', name: '이그니의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_nova', name: '노바의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_lumen', name: '루멘의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_solaris', name: '솔라스의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_nubi', name: '누비의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_erion', name: '에리온의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
	{ id: 'fragment_spirit_orvis', name: '오르비스의 조각', category: '기타', icon: 'assets/item/it/it_soul.png' },
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
