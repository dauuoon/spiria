import { AnimatePresence, animate, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import TopBar from './TopBar'
import useAppStore from '../lib/store'
import { CRAFT_FAILURE_EXP, CRAFT_FAILURE_FRAGMENT_AMOUNT, CRAFT_FAILURE_GOLD_MAX, CRAFT_FAILURE_GOLD_MIN, CRAFT_SUCCESS_EXP_MAX, CRAFT_SUCCESS_EXP_MIN, CRAFT_SUCCESS_FIRST_DISCOVERY_GEM, CRAFT_SUCCESS_GOLD_MAX, CRAFT_SUCCESS_GOLD_MIN } from '../data/economy'
import { ITEMS } from '../data/items'
import { RECIPES } from '../data/recipes'
import { getRarityByItemId, RESULT_RARITY_UI, SPIRIT_RARITY_TOKENS } from '../data/rarity'
import { getSpiritAnimationFrames, getSpiritArtworkPath, SPIRITS } from '../data/spirits'
import { DEFAULT_SPIRIT_DETAIL_META, SPIRIT_DETAIL_META } from '../data/spiritDetails'
import type { SpiritRarity } from '../types/game'
import { recordSpiritSummon } from '../lib/spiritSummonHistory'

const PAPER_SFX_PATH = 'assets/sound/paper.mp3'
const RESULT_POP_SFX_PATH = 'assets/sound/ex_resgult.mp3'
const RESULT_COUNT_SFX_PATH = 'assets/sound/num_coin.mp3'
const GAME_SUCCESS_SFX_PATH = 'assets/sound/gamesuccess.mp3'
const RESULT_VIDEO_PATH = 'assets/video/result.mp4'
const RESULT_ING_SFX_PATH = 'assets/sound/ing.mp3'
const RESULT_SUCCESS_ENTER_SFX_PATH = 'assets/sound/craft_success.mp3'
const RESULT_FAIL_ENTER_SFX_PATH = 'assets/sound/craft_fail.mp3'

type RewardItem = {
  id: string
  name: string
  count: number
  iconSrc: string
  category: '재료' | '기타'
  rarity: SpiritRarity
}

type RewardSummary = {
  spiritRevealLabel: string | null
  exp: number
  gold: number
  mana: number
  itemRewards: RewardItem[]
}

type PendingNavigationTarget = 'craft' | 'codex' | null
type ResultIntroStage = 'video' | 'flash' | 'content'

const resultContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

const resultSectionVariants = {
  hidden: { opacity: 0, y: -26, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      mass: 0.95,
    },
  },
}

function playSfx(path: string, volume = 0.78) {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`)
    audio.volume = volume
    void audio.play()
  } catch {
    // ignore audio failures
  }
}

function randomIntInclusive(min: number, max: number) {
  if (max <= min) return min
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function CraftResultScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const openSpiritDetail = useAppStore((s) => s.openSpiritDetail)
  const craftResult = useAppStore((s) => s.craftResult)
  const addItem = useAppStore((s) => s.addItem)
  const addCoins = useAppStore((s) => s.addCoins)
  const addMana = useAppStore((s) => s.addMana)
  const gainExp = useAppStore((s) => s.gainExp)
  const discoveredSpiritIds = useAppStore((s) => s.discoveredSpiritIds)
  const markSpiritDiscovered = useAppStore((s) => s.markSpiritDiscovered)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [isRequestPopupOpen, setIsRequestPopupOpen] = useState(false)
  const [rewardClaimed, setRewardClaimed] = useState(false)
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(null)
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<PendingNavigationTarget>(null)
  const [introStage, setIntroStage] = useState<ResultIntroStage>('video')
  const [resultEntrySfxPlayed, setResultEntrySfxPlayed] = useState(false)

  if (!craftResult) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        <img
          src={a('assets/background/make_back.png')}
          alt="정령 제작 배경"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <TopBar onBack={() => setScreen('craft')} />
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-[#f3e4ca]">
          <div className="rounded-2xl border border-white/15 bg-black/45 px-5 py-4 text-[14px]">제작 결과 데이터가 없습니다.</div>
        </div>
      </div>
    )
  }

  const craftedSpirit = craftResult.spiritId ? SPIRITS.find((s) => s.id === craftResult.spiritId) ?? null : null
  const spirit = craftedSpirit ?? SPIRITS[0]
  const meta = craftedSpirit ? SPIRIT_DETAIL_META[craftedSpirit.id] ?? DEFAULT_SPIRIT_DETAIL_META : DEFAULT_SPIRIT_DETAIL_META
  const craftedSpiritFrames = craftedSpirit ? getSpiritAnimationFrames(craftedSpirit.id) : []
  const hasAnimatedCraftedSpirit = craftedSpiritFrames.length === 3
  const isSoyo = craftedSpirit?.id === 'spirit_soyo'
  const isFailure = !craftResult.success
  const isAwakening = craftResult.resultMode === 'awakening'
  const spiritRarity = craftedSpirit?.rarity ?? 'common'
  const spiritTypeLabel = meta.typeLabel ?? '정령'
  const materialLabelById: Record<string, string> = {
    flower: '꽃',
    leaf: '잎',
    soil: '흙',
    water: '물',
    fire: '불',
    wind: '바람',
    star: '별',
    moon: '달',
    light: '태양',
    magic: '마법',
    ether: '에테르',
    gem: '보석',
  }
  const recipeMaterials = craftResult.materialIds.map((id) => materialLabelById[id] ?? id)
  const discoveredSpiritIdSet = new Set(discoveredSpiritIds)
  const candidateSpiritNames = craftResult.candidateSpiritIds
    .map((id) => {
      if (!discoveredSpiritIdSet.has(id)) return '???'
      return SPIRITS.find((spiritItem) => spiritItem.id === id)?.name ?? '???'
    })
  const themePalette: Record<string, { overlay: string; glow: string }> = {
    '따뜻한 골드': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(255, 215, 150, 0.26), rgba(11, 11, 11, 0.72) 60%)',
      glow: 'radial-gradient(circle, rgba(255,215,150,0.34) 0%, rgba(255,215,150,0.10) 54%, rgba(255,215,150,0) 74%)',
    },
    '차가운 푸른빛': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(140, 199, 255, 0.24), rgba(10, 18, 28, 0.74) 60%)',
      glow: 'radial-gradient(circle, rgba(140,199,255,0.30) 0%, rgba(140,199,255,0.10) 54%, rgba(140,199,255,0) 74%)',
    },
    '보라빛 신비': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(187, 152, 255, 0.24), rgba(22, 14, 32, 0.74) 60%)',
      glow: 'radial-gradient(circle, rgba(187,152,255,0.30) 0%, rgba(187,152,255,0.10) 54%, rgba(187,152,255,0) 74%)',
    },
    '붉은 불빛': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(255, 151, 94, 0.24), rgba(34, 14, 10, 0.76) 60%)',
      glow: 'radial-gradient(circle, rgba(255,151,94,0.30) 0%, rgba(255,151,94,0.10) 54%, rgba(255,151,94,0) 74%)',
    },
    '푸릇한 그린빛': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(140, 225, 140, 0.24), rgba(10, 24, 14, 0.74) 60%)',
      glow: 'radial-gradient(circle, rgba(140,225,140,0.30) 0%, rgba(140,225,140,0.10) 54%, rgba(140,225,140,0) 74%)',
    },
  }
  const themeStyle = themePalette[meta.themeLabel] ?? themePalette['따뜻한 골드']
  const headingColor = isFailure ? '#bcc3cf' : '#f7ddb2'
  const rarityToken = SPIRIT_RARITY_TOKENS[spiritRarity]
  const [animatedMatchRate, setAnimatedMatchRate] = useState(0)
  const numericMatchRate = useMemo(() => {
    if (isFailure) return 0
    if (typeof craftResult.matchRate === 'number' && !Number.isNaN(craftResult.matchRate)) {
      return Math.max(0, craftResult.matchRate)
    }
    const found = String(meta.requestMatchRate).match(/\d+(?:\.\d+)?/)
    if (!found) return null
    return Math.max(0, Number(found[0]))
  }, [craftResult.matchRate, isFailure, meta.requestMatchRate])

  const failureHint = useMemo(() => {
    if (!isFailure) return null

    const candidateRecipes = craftResult.candidateSpiritIds
      .map((candidateId) => RECIPES.find((recipe) => recipe.resultItemId === candidateId))
      .filter((recipe): recipe is (typeof RECIPES)[number] => Boolean(recipe))

    const matchedMaterialIds = craftResult.materialIds.filter((materialId, index, arr) => {
      if (arr.indexOf(materialId) !== index) return false
      return candidateRecipes.some((recipe) => recipe.ingredientIds.includes(materialId))
    })

    const matchedMaterialLabels = matchedMaterialIds.map((id) => materialLabelById[id] ?? id)
    const hasPerfectIngredientSet = candidateRecipes.some((recipe) => {
      const sortedCandidate = [...recipe.ingredientIds].sort().join('|')
      const sortedSelected = [...craftResult.materialIds].sort().join('|')
      return sortedCandidate === sortedSelected
    })
    const keywordPool = craftResult.candidateSpiritIds.flatMap((candidateId) => {
      const candidateMeta = SPIRIT_DETAIL_META[candidateId] ?? DEFAULT_SPIRIT_DETAIL_META
      return candidateMeta.keywords
    })
    const uniqueKeywords = keywordPool.filter((keyword, index) => keywordPool.indexOf(keyword) === index).slice(0, 3)

    const formatList = (items: string[]) => items.map((item) => `[${item}]`).join(',')

    if (hasPerfectIngredientSet && matchedMaterialLabels.length === 3) {
      return {
        firstLine: `${formatList(matchedMaterialLabels)}의 기운은 맞았지만···`,
        secondLine: '정령들은 순서도 중요하게 생각해!',
      }
    }

    if (matchedMaterialLabels.length > 0 && uniqueKeywords.length > 0) {
      return {
        firstLine: `${formatList(matchedMaterialLabels)}의 기운은 맞았지만···`,
        secondLine: `${formatList(uniqueKeywords)}에 관련된 것을 찾아보자!`,
      }
    }

    if (uniqueKeywords.length > 0) {
      return {
        firstLine: '아직 결정적인 기운이 부족한 것 같아···',
        secondLine: `${formatList(uniqueKeywords)}에 관련된 것을 찾아보자!`,
      }
    }

    return {
      firstLine: '아직 단서가 조금 부족한 것 같아...',
      secondLine: '재료의 조합을 다시 한 번 살펴보자!',
    }
  }, [craftResult.candidateSpiritIds, craftResult.materialIds, isFailure])

  useEffect(() => {
    setRewardClaimed(false)
    setRewardSummary(null)
    setPendingNavigationTarget(null)
    setIntroStage('video')
    setResultEntrySfxPlayed(false)
    setAnimatedMatchRate(0)
  }, [craftResult])

  useEffect(() => {
    if (introStage !== 'video') return
    window.dispatchEvent(new Event('spiria:pause-bgm-temp'))
    playSfx(RESULT_ING_SFX_PATH, 0.84)
    const fallback = window.setTimeout(() => setIntroStage('flash'), 5200)
    return () => window.clearTimeout(fallback)
  }, [introStage])

  useEffect(() => {
    if (introStage !== 'flash') return
    window.dispatchEvent(new Event('spiria:resume-bgm-temp'))
    const complete = window.setTimeout(() => setIntroStage('content'), 420)
    return () => window.clearTimeout(complete)
  }, [introStage])

  useEffect(() => {
    if (introStage !== 'content' || resultEntrySfxPlayed) return
    playSfx(isFailure ? RESULT_FAIL_ENTER_SFX_PATH : RESULT_SUCCESS_ENTER_SFX_PATH, 0.9)
    setResultEntrySfxPlayed(true)
  }, [introStage, isFailure, resultEntrySfxPlayed])

  useEffect(() => {
    return () => {
      window.dispatchEvent(new Event('spiria:resume-bgm-temp'))
    }
  }, [])

  const canClaimFirstDiscoveryMana = craftedSpirit && !discoveredSpiritIds.includes(craftedSpirit.id)
  const questRewardGold = Math.max(0, Math.floor(craftResult.questRewardGold ?? 0))

  const claimRewards = () => {
    if (rewardClaimed) return

    if (isFailure) {
      const fragmentSpirit = SPIRITS[Math.floor(Math.random() * SPIRITS.length)]
      const fragmentItemId = `fragment_${fragmentSpirit.id}`
      const fragmentItem = ITEMS.find((item) => item.id === fragmentItemId)
      const goldGain = randomIntInclusive(CRAFT_FAILURE_GOLD_MIN, CRAFT_FAILURE_GOLD_MAX)
      const totalGoldGain = goldGain + questRewardGold

      gainExp(CRAFT_FAILURE_EXP)
      addCoins(totalGoldGain)
      if (fragmentItem) addItem(fragmentItem.id, CRAFT_FAILURE_FRAGMENT_AMOUNT)

      // 실패 보상 수령 시 별도 실패 효과음은 재생하지 않음 (요구사항)
      setRewardSummary({
        spiritRevealLabel: null,
        exp: CRAFT_FAILURE_EXP,
        gold: totalGoldGain,
        mana: 0,
        itemRewards: fragmentItem
          ? [{
              id: fragmentItem.id,
              name: fragmentItem.name,
              count: CRAFT_FAILURE_FRAGMENT_AMOUNT,
              iconSrc: a(fragmentItem.icon ?? 'assets/item/it/it_soul.png'),
              category: fragmentItem.category,
              rarity: getRarityByItemId(fragmentItem.id, fragmentItem.category),
            }]
          : [],
      })
      setRewardClaimed(true)
      return
    }

    const expGain = randomIntInclusive(CRAFT_SUCCESS_EXP_MIN, CRAFT_SUCCESS_EXP_MAX)
    const goldGain = randomIntInclusive(CRAFT_SUCCESS_GOLD_MIN, CRAFT_SUCCESS_GOLD_MAX)
    const totalGoldGain = goldGain + questRewardGold
    const manaGain = canClaimFirstDiscoveryMana ? CRAFT_SUCCESS_FIRST_DISCOVERY_GEM : 0

    gainExp(expGain)
    addCoins(totalGoldGain)
    if (manaGain > 0) addMana(manaGain)
    if (craftedSpirit) {
      recordSpiritSummon(craftedSpirit.id)
      markSpiritDiscovered(craftedSpirit.id)
    }

    playSfx(GAME_SUCCESS_SFX_PATH, 0.88)
    setRewardSummary({
      spiritRevealLabel: craftedSpirit
        ? `[${SPIRIT_RARITY_TOKENS[spiritRarity].ko}] ${craftedSpirit.name} 등장!`
        : null,
      exp: expGain,
      gold: totalGoldGain,
      mana: manaGain,
      itemRewards: [],
    })
    setRewardClaimed(true)
  }

  useEffect(() => {
    if (numericMatchRate === null || Number.isNaN(numericMatchRate)) return
    setAnimatedMatchRate(0)
    const controls = animate(0, numericMatchRate, {
      duration: 1.65,
      ease: 'easeOut',
      onUpdate: (v) => setAnimatedMatchRate(Math.round(v)),
    })
    return () => controls.stop()
  }, [numericMatchRate, spirit.id, craftResult])

  const openRewardThenNavigate = (target: PendingNavigationTarget) => {
    if (!rewardClaimed) {
      setPendingNavigationTarget(target)
      claimRewards()
      return
    }

    if (target === 'codex' && craftedSpirit) {
      openSpiritDetail(craftedSpirit.id)
      return
    }

    setScreen('craft')
  }

  const goToCraftScreen = () => {
    openRewardThenNavigate('craft')
  }

  const goToCodex = () => {
    if (!craftedSpirit) return
    openRewardThenNavigate('codex')
  }

  const handleRewardModalClose = () => {
    setRewardSummary(null)
    if (pendingNavigationTarget) {
      const nextTarget = pendingNavigationTarget
      setPendingNavigationTarget(null)
      window.setTimeout(() => {
        if (nextTarget === 'codex' && craftedSpirit && !isFailure) {
          openSpiritDetail(craftedSpirit.id)
          return
        }

          setScreen('craft')
      }, 50)
    }
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <img
        src={a('assets/background/book.png')}
        alt="정령 제작 배경"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: themeStyle.overlay }} />
      {isFailure && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(26,30,38,0.52) 0%, rgba(43,48,58,0.44) 48%, rgba(14,16,20,0.68) 100%)',
          }}
        />
      )}

      <motion.div
        className="absolute inset-0 z-10"
        initial={false}
        animate={{ opacity: introStage === 'content' ? 1 : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ pointerEvents: introStage === 'content' ? 'auto' : 'none' }}
      >
        <TopBar onBack={() => openRewardThenNavigate('craft')} />

        <div className="absolute inset-0 overflow-y-auto px-5 pt-[90px] pb-20">
          <motion.div
            className="mx-auto mt-[20px] w-full max-w-[360px] text-center"
            variants={resultContainerVariants}
            initial="hidden"
            animate={introStage === 'content' ? 'visible' : 'hidden'}
          >
            <motion.div variants={resultSectionVariants}>
              <h2 className="mt-1 text-[38px] font-semibold tracking-wide" style={{ color: headingColor }}>
                {isFailure ? '정령 미각성' : craftedSpirit?.name ?? '알 수 없는 결과'}
              </h2>
              {!isFailure && craftedSpirit && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="inline-flex min-h-[28px] items-center justify-center rounded-full border border-white/14 bg-[rgba(255,255,255,0.08)] px-3 text-[12px] font-semibold text-[#efe4d3]">
                    {spiritTypeLabel}
                  </span>
                  <span
                    className="inline-flex min-h-[28px] items-center justify-center rounded-full border px-3 text-[12px] font-semibold"
                    style={{
                      color: rarityToken.mainColor,
                      borderColor: rarityToken.borderColor,
                      backgroundColor: `${rarityToken.mainColor}14`,
                    }}
                  >
                    {rarityToken.ko}
                  </span>
                </div>
              )}
              {isAwakening ? (
                <div className="mt-1 text-[22px] font-semibold tracking-wide" style={{ color: headingColor }}>
                  정령이 깨어났습니다.
                </div>
              ) : (
                <div className="mt-1 text-[26px] font-semibold tracking-wide" style={{ color: headingColor }}>
                  의뢰 일치율 {numericMatchRate === null ? meta.requestMatchRate : `${animatedMatchRate}%`}
                </div>
              )}

              {isFailure && candidateSpiritNames.length > 0 && (
                <>
                  <div className="mt-2 rounded-[14px] border border-white/15 bg-[rgba(96,102,118,0.35)] px-4 py-[6px] text-[13px] text-[#e6ebf3]">
                    <div className="translate-y-[1px] text-[12px] leading-[1.5]">
                      후보 정령: {candidateSpiritNames.join(' / ')}
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            <motion.div variants={resultSectionVariants} className="mt-4 relative mx-auto h-[250px] w-[250px]">
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.34, 0.2] }}
              transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
              style={{
                background: themeStyle.glow,
              }}
            />

            <motion.div
              className="relative z-[1] h-full w-full"
              animate={{ y: [10, 2, 10] }}
              transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
            >
              {isFailure ? (
                <>
                  <motion.img
                    src={a('assets/spirt/fail1.png')}
                    alt="실패 정령 프레임 1"
                    className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    draggable={false}
                    animate={{ opacity: [1, 0, 0, 0, 1] }}
                    transition={{ duration: 2.6, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a('assets/spirt/fail2.png')}
                    alt="실패 정령 프레임 2"
                    className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    draggable={false}
                    animate={{ opacity: [0, 1, 0, 1, 0] }}
                    transition={{ duration: 2.6, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a('assets/spirt/fail3.png')}
                    alt="실패 정령 프레임 3"
                    className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    draggable={false}
                    animate={{ opacity: [0, 0, 1, 0, 0] }}
                    transition={{ duration: 2.6, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                </>
              ) : hasAnimatedCraftedSpirit ? (
                <>
                  <motion.img
                    src={a(craftedSpiritFrames[0])}
                    alt={`${craftedSpirit?.name ?? '정령'} 프레임 1`}
                    className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    draggable={false}
                    animate={{ opacity: [1, 0, 0, 0, 1] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a(craftedSpiritFrames[1])}
                    alt={`${craftedSpirit?.name ?? '정령'} 프레임 2`}
                    className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    draggable={false}
                    animate={{ opacity: [0, 1, 0, 1, 0] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a(craftedSpiritFrames[2])}
                    alt={`${craftedSpirit?.name ?? '정령'} 프레임 3`}
                    className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    draggable={false}
                    animate={{ opacity: [0, 0, 1, 0, 0] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                </>
              ) : (
                <img
                  src={a(craftedSpirit ? getSpiritArtworkPath(craftedSpirit.id) : 'assets/codex/unknown.png')}
                  alt={craftedSpirit?.name ?? '알 수 없는 정령'}
                  className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
                  draggable={false}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = a('assets/codex/unknown.png')
                  }}
                />
              )}
            </motion.div>
            </motion.div>

            <motion.div variants={resultSectionVariants} className="mt-5 text-center">
              <div
                className="rounded-[16px] px-6 py-3"
                style={{ backgroundColor: isSoyo ? 'rgba(69, 47, 44, 0.5)' : 'rgba(8,10,20,0.5)' }}
              >
                <p className="whitespace-pre-line text-[15px] leading-[1.7] text-white/90 break-words overflow-wrap-anywhere">
                  {isFailure && failureHint ? `${failureHint.firstLine}\n${failureHint.secondLine}` : meta.story}
                </p>
                {!isFailure && meta.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {meta.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="h-[20px] rounded-full bg-transparent px-1 text-[12px] leading-[20px] text-[#d4b183]"
                        style={{ fontWeight: 600, letterSpacing: '0.02em' }}
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {!isAwakening && (
              <motion.div variants={resultSectionVariants} className="mt-3 rounded-[16px] bg-[rgba(12,12,20,0.6)] px-4 py-3 text-center">
                <div className="mb-2 text-[12px] font-semibold text-[#f0dcc2]">사용 재료</div>
                <div className="flex items-center justify-center gap-2">
                  {recipeMaterials.map((material, index) => (
                    <div key={`${material}-${index}`} className="inline-flex h-9 min-w-[54px] items-center justify-center rounded-full border border-white/15 bg-[rgba(255,255,255,0.05)] px-3 text-[12px] font-semibold text-[#eadcca]">
                      {material}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      playSfx(PAPER_SFX_PATH, 0.88)
                      setIsRequestPopupOpen(true)
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-white/15 bg-[rgba(255,255,255,0.06)] px-3"
                    aria-label="의뢰서 내용 보기"
                  >
                    <span className="text-[12px] font-semibold text-[#eadcca]">의뢰서</span>
                    <img src={a('assets/particle/history.png')} alt="의뢰서 열기" className="h-4 w-4 object-contain opacity-90" draggable={false} />
                  </button>
                </div>
              </motion.div>
            )}

            {isFailure && (
              <motion.div variants={resultSectionVariants} className="mt-2 rounded-[14px] bg-[rgba(240,220,194,0.05)] px-4 py-[6px] text-[13px] text-[#e6ebf3]">
                <div className="translate-y-[1px] inline-flex items-center justify-center gap-1 text-[12px] leading-[1.5]">
                  <img
                    src={a('assets/item/it/it_soul.png')}
                    alt="정령의 조각"
                    className="h-4 w-4 object-contain"
                    draggable={false}
                  />
                  <span>[확정] 정령의 조각 X5</span>
                </div>
              </motion.div>
            )}

            <motion.div variants={resultSectionVariants} className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={goToCraftScreen}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#c4c8d6]/45 bg-[rgba(76,82,98,0.62)] px-4 text-[14px] font-semibold text-[#e8edf9]"
                style={{ opacity: isFailure ? 0.56 : 1 }}
              >
                제작 화면으로
              </button>

              {isFailure ? (
                <button
                  type="button"
                  onClick={() => claimRewards()}
                  disabled={rewardClaimed}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#d6b88f]/45 bg-[rgba(90,66,34,0.55)] px-4 text-[14px] font-semibold text-[#f5e2c7]"
                  style={{ opacity: 0.9 }}
                >
                  <img src={a('assets/particle/money.png')} alt="보상받기 아이콘" className="h-4 w-4 object-contain mr-2" draggable={false} />
                  <span>{rewardClaimed ? '보상 수령 완료' : '보상받기'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToCodex}
                  disabled={!craftedSpirit}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#d6b88f]/45 bg-[rgba(90,66,34,0.55)] px-4 text-[14px] font-semibold text-[#f5e2c7] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  도감 보러가기
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {introStage !== 'content' && (
          <motion.div
            key={introStage}
            className="absolute inset-0 z-[40]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {introStage === 'video' && (
              <motion.video
                autoPlay
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
                src={a(RESULT_VIDEO_PATH)}
                onEnded={() => setIntroStage('flash')}
                onError={() => setIntroStage('content')}
              />
            )}
            {introStage === 'flash' && (
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(72,52,38,0.72)_0%,rgba(19,13,11,0.9)_52%,rgba(0,0,0,0.98)_100%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.08] }}
                transition={{ duration: 0.36, ease: 'easeInOut' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isRequestPopupOpen && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/55 px-6">
          <div className="w-full max-w-[320px] rounded-2xl border border-[#e3cfa9]/35 bg-[rgba(14,12,18,0.94)] px-5 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
            <div className="text-[13px] tracking-[0.15em] text-[#e8d5b3]/80">의뢰서 내용</div>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.65] text-[#f1e4cd]">{craftResult.requestText || meta.requestText}</p>
            <button
              type="button"
              onClick={() => setIsRequestPopupOpen(false)}
              className="mt-5 inline-flex h-10 min-w-[110px] items-center justify-center rounded-full border border-[#d6b88f]/45 bg-[rgba(104,78,44,0.56)] px-5 text-[13px] font-semibold text-[#f8e4c3]"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {rewardSummary && (
        <CraftRewardModal
          a={a}
          summary={rewardSummary}
          onClose={handleRewardModalClose}
        />
      )}
    </div>
  )
}

function CraftRewardModal({
  a,
  summary,
  onClose,
}: {
  a: (path: string) => string
  summary: RewardSummary
  onClose: () => void
}) {
  const [selectedLootId, setSelectedLootId] = useState<string | null>(null)

  useEffect(() => {
    playSfx(RESULT_POP_SFX_PATH, 0.9)
  }, [])

  const rows: Array<{ label: string; value: number; iconSrc?: string; rarity?: SpiritRarity }> = [
    ...(summary.spiritRevealLabel ? [{ label: summary.spiritRevealLabel, value: 1 }] : []),
    { label: '경험치', value: summary.exp, iconSrc: a('assets/particle/exp.png') },
    { label: '골드', value: summary.gold, iconSrc: a('assets/particle/money.png') },
    ...(summary.mana > 0 ? [{ label: '마나', value: summary.mana, iconSrc: a('assets/particle/gem.png') }] : []),
  ]

  return (
    <div className="absolute inset-0 z-[90] bg-black/70 backdrop-blur-[2px] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: -120, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20, mass: 1.15 }}
        className="relative w-full max-w-[436px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] text-center"
      >
        <img
          src={a('assets/background/paper_bg_dark_l_m.png')}
          alt="보상 결과 배경"
          className="block w-full h-auto"
          draggable={false}
        />

        <div className="absolute inset-0 p-5 flex flex-col items-center justify-center">
          <div className="relative z-[1] text-[#efd8ab] text-[18px] font-extrabold tracking-wide">보상 결과</div>

          <div className="relative z-[1] mt-[10px] w-full max-w-[360px] space-y-2 text-[14px]">
            {rows.map((row, idx) => (
              <CraftRewardRow
                key={`${row.label}-${idx}`}
                label={row.label}
                targetValue={row.value}
                iconSrc={row.iconSrc}
                rarity={row.rarity}
                delay={idx * 0.18}
              />
            ))}
          </div>

          {summary.itemRewards.length > 0 && (
            <div className="relative z-[1] mt-2 w-full max-w-[360px] rounded-md border border-white/20 bg-black/20 p-2">
              <div className="grid grid-cols-6 gap-1.5">
                {summary.itemRewards.map((loot) => (
                  <button
                    key={loot.id}
                    type="button"
                    onClick={() => setSelectedLootId((current) => (current === loot.id ? null : loot.id))}
                    className={`relative aspect-square rounded-sm px-1 py-1 flex items-center justify-center bg-center bg-cover bg-no-repeat ${RESULT_RARITY_UI[loot.rarity].lootClass}`}
                    style={{
                      backgroundImage: `url(${a('assets/background/item_bg.png')})`,
                      borderColor: RESULT_RARITY_UI[loot.rarity].borderColor,
                    }}
                  >
                    {selectedLootId === loot.id && (
                      <div className="absolute left-1/2 bottom-[calc(100%+6px)] z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border border-[#ead7ae]/35 bg-[rgba(9,10,24,0.94)] px-2.5 py-1 text-[11px] font-semibold text-[#f2dfb2] shadow-[0_10px_24px_rgba(0,0,0,0.38)]">
                        {loot.name}
                      </div>
                    )}
                    <img src={loot.iconSrc} alt="" className="w-[40px] h-[40px] object-contain" draggable={false} />
                    <span className="absolute right-[4px] bottom-[4px] min-w-[16px] px-1 h-[14px] rounded-full border border-[#b7afe1]/25 bg-[rgba(10,12,30,0.82)] text-[9px] font-semibold text-[#ebc8ab] leading-[12px] text-center pointer-events-none select-none tabular-nums">
                      {loot.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative z-[1] mt-3 w-full max-w-[360px] flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="relative h-11 w-[176px] max-w-full rounded-xl overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white transition-transform duration-100 active:scale-95"
            >
              <img
                src={a('assets/particle/btn_bg_brown.png')}
                alt="확인 버튼 이미지"
                className="absolute inset-0 w-full h-full object-cover opacity-62"
                draggable={false}
              />
              <span className="relative z-[1] inline-block -translate-y-[3px] text-[15px] font-bold tracking-wide">확인</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function CraftRewardRow({
  label,
  targetValue,
  iconSrc,
  rarity,
  delay,
}: {
  label: string
  targetValue: number
  iconSrc?: string
  rarity?: SpiritRarity
  delay: number
}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      playSfx(RESULT_COUNT_SFX_PATH, 0.78)
      const startAt = performance.now()
      const duration = 820
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startAt) / duration)
        const eased = 1 - (1 - progress) * (1 - progress)
        setValue(Math.round(targetValue * eased))
        if (progress < 1) window.requestAnimationFrame(tick)
      }
      window.requestAnimationFrame(tick)
    }, delay * 1000)

    return () => window.clearTimeout(timeout)
  }, [delay, targetValue])

  return (
    <div className={`rounded-md px-3 py-2 flex items-center justify-between ${rarity ? RESULT_RARITY_UI[rarity].rowClass : 'bg-white/[0.04] border border-white/10'}`}>
      <div className="flex items-center gap-2 min-w-0">
        {iconSrc && <img src={iconSrc} alt="" className="w-5 h-5 object-contain" draggable={false} />}
        <span className={`truncate text-left ${rarity ? RESULT_RARITY_UI[rarity].textClass : 'text-[#f4e1b4]'}`}>{label}</span>
      </div>
      <span className={`tabular-nums font-extrabold ${rarity ? RESULT_RARITY_UI[rarity].valueClass : 'text-white'}`}>+{value}</span>
    </div>
  )
}
