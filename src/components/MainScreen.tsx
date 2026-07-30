export default function MainScreen() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* background image */}
      <img
        src={a('assets/background/main_back_em.png')}
        alt="Main background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* optional dim overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 text-center">
        <p className="text-white/90 text-lg">메인 화면 (임시)</p>
        <p className="text-white/50 text-xs mt-2">개발용 플레이스홀더입니다.</p>
      </div>
    </div>
  )
}
