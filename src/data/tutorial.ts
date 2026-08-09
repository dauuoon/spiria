export type TutorialTargetType = 'none' | 'quest' | 'hint' | 'explore' | 'workshop' | 'codex' | 'materials' | 'exchange' | 'craft-slots' | 'ingredient-grid' | 'ingredient-row1'
export type ScreenType = 'craft' | 'main'

export type TutorialStep = {
  target: TutorialTargetType
  text: string
  screen: ScreenType
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: 'none',
    text: '새로운 정령 빚음꾼이군요.',
    screen: 'craft',
  },
  {
    target: 'quest',
    text: '먼저 의뢰서를 읽고\n어떤 재료가 필요한지 추론해 보세요.',
    screen: 'craft',
  },
  {
    target: 'hint',
    text: '어렵다면 힌트를 사용할 수 있습니다.\n힌트 사용 후, 의뢰서 취소를 해도\n사라지지 않으니 안심하세요',
    screen: 'craft',
  },
  {
    target: 'ingredient-row1',
    text: '재료 3개를 조합하면\n새로운 정령을 소환할 수 있습니다.',
    screen: 'craft',
  },
  {
    target: 'explore',
    text: '필요한 재료는\n탐험을 통해 모을 수 있습니다.',
    screen: 'main',
  },
  {
    target: 'exchange',
    text: '재료를 구하기가 어렵다면,\n교환소에서 골드와 재료를 교환해 보세요.',
    screen: 'main',
  },
  {
    target: 'codex',
    text: '새롭게 만난 정령은\n도감에 기록됩니다.',
    screen: 'main',
  },
  {
    target: 'none',
    text: '정령들은 당신을 기다리고 있습니다.\n이제 만나러 가볼까요?',
    screen: 'main',
  },
]
