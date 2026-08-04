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

const SPIRIT_ANIMATION_FRAMES: Readonly<Record<string, readonly [string, string, string]>> = Object.freeze({
	spirit_soyo: ['assets/spirt/soyo1.png', 'assets/spirt/soyo2.png', 'assets/spirt/soyo3.png'],
	spirit_rua: ['assets/spirt/lua1.png', 'assets/spirt/lua2.png', 'assets/spirt/lua3.png'],
	spirit_tera: ['assets/spirt/tera1.png', 'assets/spirt/tera2.png', 'assets/spirt/tera3.png'],
	spirit_pleo: ['assets/spirt/pleo1.png', 'assets/spirt/pleo2.png', 'assets/spirt/pleo3.png'],
	spirit_porina: ['assets/spirt/porina1.png', 'assets/spirt/porina2.png', 'assets/spirt/porina3.png'],
	spirit_igni: ['assets/spirt/ageuni1.png', 'assets/spirt/ageuni2.png', 'assets/spirt/ageuni3.png'],
	spirit_nova: ['assets/spirt/nova1.png', 'assets/spirt/nova2.png', 'assets/spirt/nova3.png'],
	spirit_lumen: ['assets/spirt/lumen1.png', 'assets/spirt/lumen2.png', 'assets/spirt/lumen3.png'],
	spirit_solaris: ['assets/spirt/solas1.png', 'assets/spirt/solas2.png', 'assets/spirt/solas3.png'],
	spirit_nubi: ['assets/spirt/nubi1.png', 'assets/spirt/nubi2.png', 'assets/spirt/nubi3.png'],
	spirit_erion: ['assets/spirt/erion1.png', 'assets/spirt/erion2.png', 'assets/spirt/erion3.png'],
	spirit_orvis: ['assets/spirt/orbis1.png', 'assets/spirt/orbis2.png', 'assets/spirt/orbis3.png'],
})

export function getSpiritAnimationFrames(spiritId: string): readonly string[] {
	return SPIRIT_ANIMATION_FRAMES[spiritId] ?? []
}

export function getSpiritArtworkPath(spiritId: string): string {
	const frames = getSpiritAnimationFrames(spiritId)
	if (frames.length > 0) return frames[0]
	return `assets/codex/${spiritId.replace(/^spirit_/, '')}.png`
}
