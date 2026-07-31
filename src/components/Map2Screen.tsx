import AdventureMapScreen from './AdventureMapScreen'

export default function Map2Screen() {
  return (
    <AdventureMapScreen
      stage={2}
      backgroundSrc="assets/background/map2_back.png"
      circleSrc="assets/particle/map2_magic circl.png"
      footstepSrc="assets/sound/foot_stone.mp3"
    />
  )
}
