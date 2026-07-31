type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag' | 'profile'

type Props = {
  screen: Screen
  onSelect: (s: Screen) => void
}

export default function DevRemote({ screen, onSelect }: Props) {
  if (!import.meta.env.DEV) return null

  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[60] select-none group">
      {/* Panel slides in on hover; a thin handle stays visible */}
      <div className="translate-x-[calc(100%-16px)] group-hover:translate-x-0 transition-all duration-300 rounded-l-xl bg-black/50 border border-white/10 backdrop-blur-md shadow-[0_6px_30px_rgba(0,0,0,0.35)] p-2 pr-3 flex flex-col gap-2 relative">
        {/* Handle */}
        <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[16px] h-12 bg-white/10 border border-white/15 border-r-0 rounded-l-md" />
        <div className="text-[10px] text-white/60 tracking-widest text-center">DEV</div>
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
