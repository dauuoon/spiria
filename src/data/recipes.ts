import type { RecipeDef } from '../types/game'

// Generated from balance/Spiria_Game_spirit.xlsx (조합 순서 column).
export const RECIPES: readonly RecipeDef[] = [
  { id: 'recipe_spirit_soyo', resultItemId: 'spirit_soyo', ingredientIds: ['star', 'flower', 'magic'] },
  { id: 'recipe_spirit_rua', resultItemId: 'spirit_rua', ingredientIds: ['wind', 'leaf', 'star'] },
  { id: 'recipe_spirit_tera', resultItemId: 'spirit_tera', ingredientIds: ['light', 'soil', 'flower'] },
  { id: 'recipe_spirit_pleo', resultItemId: 'spirit_pleo', ingredientIds: ['water', 'moon', 'star'] },
  { id: 'recipe_spirit_porina', resultItemId: 'spirit_porina', ingredientIds: ['wind', 'flower', 'gem'] },
  { id: 'recipe_spirit_igni', resultItemId: 'spirit_igni', ingredientIds: ['fire', 'soil', 'magic'] },
  { id: 'recipe_spirit_nova', resultItemId: 'spirit_nova', ingredientIds: ['water', 'moon', 'star'] },
  { id: 'recipe_spirit_lumen', resultItemId: 'spirit_lumen', ingredientIds: ['moon', 'water', 'star'] },
  { id: 'recipe_spirit_solaris', resultItemId: 'spirit_solaris', ingredientIds: ['fire', 'light', 'gem'] },
  { id: 'recipe_spirit_nubi', resultItemId: 'spirit_nubi', ingredientIds: ['magic', 'ether', 'gem'] },
  { id: 'recipe_spirit_erion', resultItemId: 'spirit_erion', ingredientIds: ['water', 'moon', 'ether'] },
  { id: 'recipe_spirit_orvis', resultItemId: 'spirit_orvis', ingredientIds: ['magic', 'light', 'gem'] },
] as const
