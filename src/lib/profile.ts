export const PROFILE_NICKNAME_STORAGE_KEY = 'spiria.profile.nickname' as const
export const DEFAULT_NICKNAME = '스피리아홧팅' as const

const ASCII_WEIGHT = 1
const NON_ASCII_WEIGHT = 5 / 3
const NICKNAME_MAX_UNITS = 10

function getNicknameUnit(char: string): number {
  return /^[\x00-\x7F]$/.test(char) ? ASCII_WEIGHT : NON_ASCII_WEIGHT
}

export function clampNicknameInput(value: string): string {
  let totalUnits = 0
  let result = ''

  for (const char of value) {
    const nextUnits = totalUnits + getNicknameUnit(char)
    if (nextUnits > NICKNAME_MAX_UNITS + 1e-9) break
    totalUnits = nextUnits
    result += char
  }

  return result
}

export function loadStoredNickname(): string {
  try {
    const raw = localStorage.getItem(PROFILE_NICKNAME_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    const saved = typeof parsed === 'string' ? clampNicknameInput(parsed.trim()) : ''
    return saved || DEFAULT_NICKNAME
  } catch {
    return DEFAULT_NICKNAME
  }
}

export function saveStoredNickname(value: string): string {
  const next = clampNicknameInput(value.trim()) || DEFAULT_NICKNAME
  try {
    localStorage.setItem(PROFILE_NICKNAME_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage errors
  }
  return next
}