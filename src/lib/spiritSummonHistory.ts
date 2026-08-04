const SPIRIT_SUMMON_HISTORY_STORAGE_KEY = 'spiria.spirit-summon-history.v1'

export type SpiritSummonHistoryEntry = {
  craftCount: number
  firstMetDate: string
}

type SpiritSummonHistoryById = Record<string, SpiritSummonHistoryEntry>

function formatDateToYmd(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}.${month}.${day}`
}

function loadAllSummonHistory(): SpiritSummonHistoryById {
  try {
    const raw = localStorage.getItem(SPIRIT_SUMMON_HISTORY_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SpiritSummonHistoryById
    if (!parsed || typeof parsed !== 'object') return {}

    const normalized: SpiritSummonHistoryById = {}
    for (const [spiritId, value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object') continue
      const craftCount = Math.max(0, Math.floor((value as SpiritSummonHistoryEntry).craftCount ?? 0))
      const firstMetDate = String((value as SpiritSummonHistoryEntry).firstMetDate ?? '').trim()
      if (!firstMetDate) continue
      normalized[spiritId] = { craftCount, firstMetDate }
    }
    return normalized
  } catch {
    return {}
  }
}

function saveAllSummonHistory(history: SpiritSummonHistoryById) {
  try {
    localStorage.setItem(SPIRIT_SUMMON_HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    // ignore storage failures
  }
}

export function recordSpiritSummon(spiritId: string, when: Date = new Date()): SpiritSummonHistoryEntry {
  const allHistory = loadAllSummonHistory()
  const current = allHistory[spiritId]
  const today = formatDateToYmd(when)

  const nextEntry: SpiritSummonHistoryEntry = {
    craftCount: (current?.craftCount ?? 0) + 1,
    firstMetDate: current?.firstMetDate || today,
  }

  allHistory[spiritId] = nextEntry
  saveAllSummonHistory(allHistory)
  return nextEntry
}

export function getSpiritSummonHistory(spiritId: string): SpiritSummonHistoryEntry | null {
  const allHistory = loadAllSummonHistory()
  return allHistory[spiritId] ?? null
}

export function clearSpiritSummonHistory() {
  try {
    localStorage.removeItem(SPIRIT_SUMMON_HISTORY_STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}
