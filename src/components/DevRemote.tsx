import useAppStore from '../lib/store'
import { EXP_TO_NEXT } from '../data/levels'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag' | 'profile' | 'map1' | 'map2' | 'map3' | 'map4' | 'map5'

type Props = {
  screen: Screen
  onSelect: (s: Screen) => void
}

export default function DevRemote({ screen, onSelect }: Props) {
  const level = useAppStore(s => s.level)
  const setLevel = useAppStore(s => s.setLevel)
  const expInLevel = useAppStore(s => s.expInLevel)
  const setExpInLevel = useAppStore(s => s.setExpInLevel)
  const expToNext = EXP_TO_NEXT[level] ?? 0

  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[60] select-none group">
      {/* Panel slides in on hover; a thin handle stays visible */}
      <div className="translate-x-[calc(100%-16px)] group-hover:translate-x-0 transition-all duration-300 rounded-l-xl bg-black/50 border border-white/10 backdrop-blur-md shadow-[0_6px_30px_rgba(0,0,0,0.35)] p-2 pr-3 flex flex-col gap-2 relative">
        {/* Handle */}
        <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[16px] h-12 bg-white/10 border border-white/15 border-r-0 rounded-l-md" />
        <div className="text-[10px] text-white/60 tracking-widest text-center">DEV</div>
        <div className="mt-1 rounded-md border border-white/15 bg-white/5 px-2 py-2">
          <div className="text-[10px] text-white/70 text-center">USER LV</div>
          <div className="mt-1 text-[12px] font-bold text-white text-center">{level}</div>
          <div className="mt-1 text-[10px] text-white/60 text-center">다음 레벨 필요 EXP {expToNext}</div>
          <div className="mt-1 text-[10px] text-white/50 text-center">현재 레벨 EXP {expInLevel}</div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setLevel(level - 1)}
              className="px-2 py-1 rounded text-[11px] border bg-white/10 text-white/85 hover:bg-white/15 border-white/20"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => setLevel(level + 1)}
              className="px-2 py-1 rounded text-[11px] border bg-white/10 text-white/85 hover:bg-white/15 border-white/20"
            >
              +1
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setExpInLevel(Math.max(0, expInLevel - 10))}
              className="px-2 py-1 rounded text-[11px] border bg-white/10 text-white/85 hover:bg-white/15 border-white/20"
            >
              EXP -10
            </button>
            <button
              type="button"
              onClick={() => setExpInLevel(expInLevel + 10)}
              className="px-2 py-1 rounded text-[11px] border bg-white/10 text-white/85 hover:bg-white/15 border-white/20"
            >
              EXP +10
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect('loading')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'loading'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Loading
        </button>
        <button
          type="button"
          onClick={() => onSelect('main')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'main'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Main
        </button>
        <button
          type="button"
          onClick={() => onSelect('book')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'book'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Book
        </button>
        <button
          type="button"
          onClick={() => onSelect('expedition')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'expedition'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Expedition
        </button>
        <button
          type="button"
          onClick={() => onSelect('craft')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'craft'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Craft
        </button>
        <button
          type="button"
          onClick={() => onSelect('bag')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'bag'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Bag
        </button>
        <button
          type="button"
          onClick={() => onSelect('map1')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'map1'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Map1
        </button>
        <button
          type="button"
          onClick={() => onSelect('map2')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'map2'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Map2
        </button>
        <button
          type="button"
          onClick={() => onSelect('map3')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'map3'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Map3
        </button>
        <button
          type="button"
          onClick={() => onSelect('map4')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'map4'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Map4
        </button>
        <button
          type="button"
          onClick={() => onSelect('map5')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'map5'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Map5
        </button>
        <button
          type="button"
          onClick={() => onSelect('profile')}
          className={`px-3 py-1 rounded text-[11px] border transition ${
            screen === 'profile'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border-white/20'
          }`}
        >
          Profile
        </button>
      </div>
    </div>
  )
}
