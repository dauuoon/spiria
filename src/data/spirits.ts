import type { SpiritDef } from '../types/game'

export const SPIRITS: readonly SpiritDef[] = [
	{ id: 'spirit_soyo', name: '소요', rarity: 'common' },
	{ id: 'spirit_rua', name: '루아', rarity: 'common' },
	{ id: 'spirit_tera', name: '테라', rarity: 'rare' },
	{ id: 'spirit_pleo', name: '플레오', rarity: 'common' },
	{ id: 'spirit_porina', name: '포리나', rarity: 'rare' },
	{ id: 'spirit_igni', name: '이그니', rarity: 'epic' },
	{ id: 'spirit_nova', name: '노바', rarity: 'rare' },
	{ id: 'spirit_lumen', name: '루멘', rarity: 'rare' },
	{ id: 'spirit_solaris', name: '솔라스', rarity: 'epic' },
	{ id: 'spirit_nubi', name: '누비', rarity: 'rare' },
	{ id: 'spirit_erion', name: '에리온', rarity: 'epic' },
	{ id: 'spirit_orvis', name: '오르비스', rarity: 'legendary' },
] as const

// Discovery order from balance/Spiria_Game_spirit.xlsx (No. column).
export const SPIRIT_DISCOVERY_ORDER: Readonly<Record<string, number>> = Object.freeze({
	spirit_soyo: 1,
	spirit_rua: 2,
	spirit_tera: 3,
	spirit_pleo: 4,
	spirit_porina: 5,
	spirit_igni: 6,
	spirit_nova: 7,
	spirit_lumen: 8,
	spirit_solaris: 9,
	spirit_nubi: 10,
	spirit_erion: 11,
	spirit_orvis: 12,
})

export function sortSpiritsByDiscoveryOrder(spirits: readonly SpiritDef[]): SpiritDef[] {
	return [...spirits].sort((a, b) => {
		const aOrder = SPIRIT_DISCOVERY_ORDER[a.id] ?? Number.MAX_SAFE_INTEGER
		const bOrder = SPIRIT_DISCOVERY_ORDER[b.id] ?? Number.MAX_SAFE_INTEGER
		if (aOrder !== bOrder) return aOrder - bOrder
		return a.name.localeCompare(b.name, 'ko-KR')
	})
}

export function getSpiritArtworkPath(spiritId: string): string {
	if (spiritId === 'spirit_soyo') return 'assets/spirt/soyo1.png'
	return `assets/codex/${spiritId.replace(/^spirit_/, '')}.png`
}
