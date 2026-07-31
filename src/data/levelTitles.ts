import type { LevelTitle } from '../types/game'

// Mapping of level ranges to their display titles
export type LevelRange = { min: number; max: number; title: LevelTitle }

export const LEVEL_TITLE_RANGES: readonly LevelRange[] = [
  { min: 1,  max: 9,  title: '견습 빚음꾼' },
  { min: 10, max: 19, title: '초급 빚음꾼' },
  { min: 20, max: 29, title: '정령 빚음꾼' },
  { min: 30, max: 39, title: '숙련 빚음꾼' },
  { min: 40, max: 49, title: '정령 장인' },
  { min: 50, max: 59, title: '마도 장인' },
  { min: 60, max: 69, title: '대장인' },
  { min: 70, max: 79, title: '정령 현자' },
  { min: 80, max: 89, title: '대현자' },
  { min: 90, max: 98, title: '별의 계승자' },
  { min: 99, max: 99, title: '스피리아의 창조자' },
] as const

/**
 * Returns the title for the given level based on LEVEL_TITLE_RANGES.
 * If level is out of range, it clamps into [1, 99].
 */
export function getLevelTitle(level: number): LevelTitle {
  const lv = Math.max(1, Math.min(99, Math.floor(level)))
  for (const r of LEVEL_TITLE_RANGES) {
    if (lv >= r.min && lv <= r.max) return r.title
  }
  // Fallback (should not hit)
  return '견습 빚음꾼'
}

/**
 * Formats as: `Lv.{n} {title}` e.g., `Lv.45 정령 장인`
 */
export function formatLevelLabel(level: number): string {
  return `Lv.${Math.max(1, Math.min(99, Math.floor(level)))}` + ' ' + getLevelTitle(level)
}

/**
 * Compact format for profile: just the numeric level without the "Lv." prefix.
 */
export function formatLevelNumber(level: number): string {
  return String(Math.max(1, Math.min(99, Math.floor(level))))
}
