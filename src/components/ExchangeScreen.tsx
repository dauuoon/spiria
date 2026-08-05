import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import TopBar from './TopBar'
import ParticlesCanvas from './ParticlesCanvas'
import useAppStore, { EXCHANGE_MAX_REFRESH_PER_CYCLE, EXCHANGE_REFRESH_COSTS } from '../lib/store'
import { ITEMS } from '../data/items'
import { SPIRITS } from '../data/spirits'

type UiMessage = {
  id: number
  text: string
}

function formatRemaining(ms: number): string {
  const clamped = Math.max(0, ms)
  const totalSec = Math.floor(clamped / 1000)
  const hour = Math.floor(totalSec / 3600)
  const min = Math.floor((totalSec % 3600) / 60)
  const sec = totalSec % 60
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function ExchangeScreen() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const goldIcon = a('assets/particle/money.png')
  const brownButtonBg = a('assets/particle/btn_bg_brown.png')
  const silverButtonBg = a('assets/particle/btn_bg_sliver.png')
  const exchange = useAppStore((s) => s.exchange)
  const coins = useAppStore((s) => s.coins)
  const ensureExchangeCycle = useAppStore((s) => s.ensureExchangeCycle)
  const refreshExchangeOffers = useAppStore((s) => s.refreshExchangeOffers)
  const buyExchangeOffer = useAppStore((s) => s.buyExchangeOffer)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [message, setMessage] = useState<UiMessage | null>(null)
  const exchangeSfxRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    ensureExchangeCycle()
    const interval = window.setInterval(() => {
      setNowMs(Date.now())
      ensureExchangeCycle()
    }, 1000)
    return () => window.clearInterval(interval)
  }, [ensureExchangeCycle])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 1300)
    return () => window.clearTimeout(timer)
  }, [message])

  const byId = useMemo(() => {
    return new Map(ITEMS.map((item) => [item.id, item]))
  }, [])

  const spiritNameByFragmentId = useMemo(() => {
    return new Map(SPIRITS.map((spirit) => [`fragment_${spirit.id}`, spirit.name]))
  }, [])

  const nextRefreshCost = exchange.refreshUsedCount < EXCHANGE_MAX_REFRESH_PER_CYCLE
    ? EXCHANGE_REFRESH_COSTS[exchange.refreshUsedCount]
    : null
  const canRefresh = nextRefreshCost !== null && coins >= nextRefreshCost

  const materialOffers = exchange.offers.filter((offer) => offer.kind === 'material')
  const fragmentOffers = exchange.offers.filter((offer) => offer.kind === 'fragment')
  const remainText = formatRemaining(exchange.cycleEndsAt - nowMs)

  const playExchangeSfx = () => {
    try {
      if (!exchangeSfxRef.current) {
        exchangeSfxRef.current = new Audio(a('assets/sound/num_coin.mp3'))
      }
      exchangeSfxRef.current.currentTime = 0
      void exchangeSfxRef.current.play()
    } catch {
      // ignore sound playback errors
    }
  }

  const onRefresh = () => {
    playExchangeSfx()
    const result = refreshExchangeOffers()
    if (result.ok) {
      setMessage({ id: Date.now(), text: `새로고침 완료 (-${result.cost ?? 0}G)` })
      return
    }
    if (result.reason === 'limitReached') {
      setMessage({ id: Date.now(), text: '이번 주기의 새로고침을 모두 사용했습니다.' })
      return
    }
    if (result.reason === 'insufficientCoins') {
      setMessage({ id: Date.now(), text: '골드가 부족합니다.' })
      return
    }
    setMessage({ id: Date.now(), text: '새로고침에 실패했습니다.' })
  }

  const onBuy = (offerId: string) => {
    playExchangeSfx()
    const result = buyExchangeOffer(offerId)
    if (result.ok) {
      setMessage({ id: Date.now(), text: '교환이 완료되었습니다.' })
      return
    }
    if (result.reason === 'alreadyPurchased') {
      setMessage({ id: Date.now(), text: '이미 교환한 상품입니다.' })
      return
    }
    if (result.reason === 'insufficientCoins') {
      setMessage({ id: Date.now(), text: '골드가 부족합니다.' })
      return
    }
    setMessage({ id: Date.now(), text: '교환에 실패했습니다.' })
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <img
        src={a('assets/background/book.png')}
        alt="교환소 배경"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,212,143,0.18),rgba(5,8,18,0.86)_62%)]" />

      <div className="absolute inset-0 z-[3] opacity-50 pointer-events-none">
        <ParticlesCanvas density={0.00006} baseAlpha={0.16} swingAlpha={0.55} sizeScale={1.15} />
      </div>

      <TopBar title="교환소" />

      <div className="absolute inset-0 z-10 pt-[98px] px-4 pb-6 overflow-y-auto">
        <div className="mx-auto w-full max-w-[360px]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-1">
            <div className="text-left">
              <p className="text-[14px] text-[#f1cf95]">다음 교체까지</p>
              <p className="mt-1 text-[26px] font-bold tracking-widest text-[#ffe3bc] tabular-nums">{remainText}</p>
            </div>

            <div className="w-[142px]">
              <div className="text-right text-[12px] text-[#f1cf95]">
                새로고침 {exchange.refreshUsedCount}/{EXCHANGE_MAX_REFRESH_PER_CYCLE}
              </div>
              <button
                type="button"
                onClick={onRefresh}
                disabled={!canRefresh || nextRefreshCost === null}
                className={`mt-1.5 h-8 w-full rounded-[6px] px-2 text-[12px] font-semibold transition ${
                  canRefresh && nextRefreshCost !== null
                    ? 'bg-[#7f5c2a] text-[#ffe3bc] hover:bg-[#906a30]'
                    : 'bg-[#3a2b17] text-[#b89b74]'
                }`}
              >
                {nextRefreshCost === null ? '새로고침 완료' : (
                  <span className="inline-flex items-center gap-1">
                    <span>새로고침</span>
                    <img src={goldIcon} alt="골드" className="h-3.5 w-3.5 object-contain" />
                    <span>{nextRefreshCost}G</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          <section className="mt-[80px]">
            <h3 className="px-1 text-[14px] font-semibold text-[#f6d7ab]">재료 교환</h3>
            <div className="mt-2 space-y-2">
              {materialOffers.map((offer) => {
                const item = byId.get(offer.receiveItemId)
                return (
                  <OfferRow
                    key={offer.id}
                    kind="material"
                    goldIcon={goldIcon}
                    brownButtonBg={brownButtonBg}
                    silverButtonBg={silverButtonBg}
                    icon={item?.icon ? a(item.icon) : a(`assets/item/it/it_${offer.receiveItemId}.png`)}
                    name={item?.name ?? offer.receiveItemId}
                    amount={offer.receiveAmount}
                    cost={offer.costCoins}
                    purchased={offer.purchased}
                    disabled={offer.purchased || coins < offer.costCoins}
                    onBuy={() => onBuy(offer.id)}
                  />
                )
              })}
            </div>
          </section>

          <section className="mt-[35px]">
            <h3 className="px-1 text-[14px] font-semibold text-[#f6d7ab]">정령 조각 교환</h3>
            <div className="mt-2 space-y-2">
              {fragmentOffers.map((offer) => {
                const item = byId.get(offer.receiveItemId)
                const spiritName = spiritNameByFragmentId.get(offer.receiveItemId)
                return (
                  <OfferRow
                    key={offer.id}
                    kind="fragment"
                    goldIcon={goldIcon}
                    brownButtonBg={brownButtonBg}
                    silverButtonBg={silverButtonBg}
                    icon={item?.icon ? a(item.icon) : a('assets/item/it/it_soul.png')}
                    name={item?.name ?? `${spiritName ?? '정령'}의 조각`}
                    amount={offer.receiveAmount}
                    cost={offer.costCoins}
                    purchased={offer.purchased}
                    disabled={offer.purchased || coins < offer.costCoins}
                    onBuy={() => onBuy(offer.id)}
                  />
                )
              })}
            </div>
          </section>
        </div>
      </div>

      {message && (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute left-0 right-0 bottom-6 z-[30] mx-auto w-fit rounded-full border border-[#f8d5a4]/35 bg-[rgba(24,15,6,0.9)] px-4 py-2 text-[12px] text-[#ffe4bc]"
        >
          {message.text}
        </motion.div>
      )}
    </div>
  )
}

function OfferRow({
  kind,
  goldIcon,
  brownButtonBg,
  silverButtonBg,
  icon,
  name,
  amount,
  cost,
  purchased,
  disabled,
  onBuy,
}: {
  kind: 'material' | 'fragment'
  goldIcon: string
  brownButtonBg: string
  silverButtonBg: string
  icon: string
  name: string
  amount: number
  cost: number
  purchased: boolean
  disabled: boolean
  onBuy: () => void
}) {
  const activeButtonClass = kind === 'material'
    ? 'text-[#f4d98a]'
    : 'text-[#f4d98a]'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[rgba(9,12,26,0.62)] px-3 py-2">
      <img src={icon} alt={name} className="h-12 w-12 object-contain" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-[#f4d6ad]">{name} X{amount}</p>
      </div>
      <button
        type="button"
        onClick={onBuy}
        disabled={disabled}
        data-suppress-tap-sfx="true"
        className={`h-9 w-[106px] rounded-lg bg-cover bg-center bg-no-repeat px-2 text-[12px] font-semibold transition ${
          purchased
            ? 'text-[#d2d5da]'
            : disabled
              ? 'text-[#9f967f]'
              : activeButtonClass
        }`}
        style={{
          backgroundImage: `url(${purchased ? silverButtonBg : brownButtonBg})`,
          opacity: 1,
        }}
      >
        {purchased ? '완료' : (
          <span className="inline-flex items-center justify-center gap-1">
            <span>교환</span>
            <img src={goldIcon} alt="골드" className="h-3.5 w-3.5 object-contain" />
            <span>{cost}G</span>
          </span>
        )}
      </button>
    </div>
  )
}
