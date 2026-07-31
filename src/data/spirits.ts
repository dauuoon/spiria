import type { SpiritDef } from '../types/game'

export const SPIRITS: readonly SpiritDef[] = [
	{ id: 'spirit_soyo', name: '소요', rarity: 'common' },
	{ id: 'spirit_rua', name: '루아', rarity: 'rare' },
	{ id: 'spirit_pleo', name: '플레오', rarity: 'rare' },
	{ id: 'spirit_stellio', name: '스텔리오', rarity: 'epic' },
	{ id: 'spirit_porina', name: '포리나', rarity: 'epic' },
	{ id: 'spirit_nubi', name: '누비', rarity: 'legendary' },
] as const
