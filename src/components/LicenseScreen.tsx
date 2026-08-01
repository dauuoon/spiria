import TopBar from './TopBar'
import useAppStore from '../lib/store'

const LICENSE_SECTIONS = [
  {
    title: 'Game Design',
    items: ['OpenAI GPT-5.5'],
  },
  {
    title: 'Game Artwork',
    items: ['OpenAI GPT-Image', 'Seedream 5 Pro', 'Adobe Firefly'],
  },
  {
    title: 'Game Development',
    items: ['GitHub Copilot (Auto)', 'GPT-5.3-Codex', 'GPT-5.4', 'GPT-5.4 mini', 'MAI-Code-1-Flash'],
  },
  {
    title: 'Game Music',
    items: ['Suno AI'],
  },
  {
    title: 'Sound Effects',
    items: ['Pixabay (Pixabay Content License)'],
  },
] as const

export default function LicenseScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  return (
    <div className="relative w-full h-full bg-black">
      <img
        src={a('assets/background/paper_bg_light_v.png')}
        alt="라이선스 배경"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-0 bg-[rgba(255,248,236,0.18)]" />

      <TopBar onBack={() => setScreen('main')} hideResources />

      <div className="absolute inset-0 px-7 pt-[108px] pb-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-[420px] text-[#5c4334]">
          <h1 className="text-left text-[28px] font-extrabold tracking-[0.06em]">라이선스</h1>
          <div className="mt-5 text-[15px] leading-7 font-medium">
            <p>The following AI tools were used during the development of Spiria.</p>
            <p>All outputs were reviewed, edited, and refined through iterative design and development.</p>
          </div>
          <div className="mt-7 space-y-6 text-[15px] leading-7 font-medium">
            {LICENSE_SECTIONS.map((section) => (
              <section key={section.title}>
                <div className="font-extrabold tracking-[0.04em]">■ {section.title}</div>
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-8 text-[15px] leading-7 font-medium">
            <div className="font-extrabold tracking-[0.04em]">[Credits]</div>
            <div className="mt-4 space-y-4">
              <section>
                <div className="font-extrabold tracking-[0.04em]">■ Woon</div>
                <p>Game Design · UI Design · Sound Design · Game Balancing</p>
              </section>
              <section>
                <div className="font-extrabold tracking-[0.04em]">■ Hwan</div>
                <p>Game Design · Character Design · Character Illustration · Game Balancing</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}