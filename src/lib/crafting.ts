import type { OrderedCraftingRecipe } from '../types/game'

export function buildOrderedRecipe(materialIds: [string, string, string]): OrderedCraftingRecipe {
  return {
    materialIds,
    recipeKey: materialIds.join('>'),
  }
}
