import AdventureMapScreen from './AdventureMapScreen'

export default function Map1Screen() {
  return (
    <AdventureMapScreen
      stage={1}
      backgroundSrc="assets/background/map1_back.png"
      circleSrc="assets/particle/map1_magic circl.png"
      footstepSrc="assets/sound/foot_grass.mp3"
    />
  )
}
