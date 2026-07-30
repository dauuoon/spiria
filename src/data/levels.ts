import type { LevelEntry, HexColor } from '../types/game'
import { MAX_LEVEL } from './constants'

const ranges: Array<{ from: number; to: number; exp: number; color: HexColor }> = [
  { from: 1, to: 9, exp: 50, color: '#B8BEC9' },
  { from: 10, to: 19, exp: 80, color: '#79D8C6' },
  { from: 20, to: 29, exp: 120, color: '#6EBEFF' },
  { from: 30, to: 39, exp: 180, color: '#8ED46B' },
  { from: 40, to: 49, exp: 250, color: '#E5C46B' },
  { from: 50, to: 59, exp: 350, color: '#A894FF' },
  { from: 60, to: 69, exp: 500, color: '#866BFF' },
  { from: 70, to: 79, exp: 700, color: '#6A46E8' },
  { from: 80, to: 89, exp: 950, color: '#4E5EEA' },
  { from: 90, to: 98, exp: 1300, color: '#F6E7A8' },
]

const levels: LevelEntry[] = []
for (const r of ranges) {
  for (let lv = r.from; lv <= r.to; lv++) {
    levels.push({ level: lv, expToNext: r.exp, color: r.color })
  }
}
levels.push({ level: MAX_LEVEL, expToNext: 0, color: '#F6E7A8' }) // Lv.99 max

export const LEVELS = levels as readonly LevelEntry[]

export const LEVEL_COLORS = Object.freeze(
  levels.reduce<Record<number, HexColor>>((acc, cur) => {
    acc[cur.level] = cur.color
    return acc
  }, {})
)

export const EXP_TO_NEXT = Object.freeze(
  levels.reduce<Record<number, number>>((acc, cur) => {
    acc[cur.level] = cur.expToNext
    return acc
  }, {})
)
