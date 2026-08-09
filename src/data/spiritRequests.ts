import type { QuestTier } from '../types/game'

export type SpiritRequestPage = {
  id: string
  spiritId: string
  spiritName: string
  candidateSpiritIds: string[]
  candidateMatchRates?: Partial<Record<string, number>>
  tier: QuestTier
  text: string
}

export const SPIRIT_REQUEST_PAGES: readonly SpiritRequestPage[] = [
  {
    id: 'req_spirit_soyo',
    spiritId: 'spirit_soyo',
    spiritName: '소요',
    candidateSpiritIds: ['spirit_soyo', 'spirit_nova'],
    tier: 'Easy',
    text: '밤하늘의 별빛이 점점 사라지고 있습니다. \n꽃잎에 깃든 신비로운 기운이 빛을 붙잡고 있는 걸까요, \n아니면 달빛 비친 호수에 별빛이 스며든 걸까요?',
  },
  {
    id: 'req_spirit_rua',
    spiritId: 'spirit_rua',
    spiritName: '루아',
    candidateSpiritIds: ['spirit_rua', 'spirit_porina'],
    tier: 'Easy',
    text: '탐험가는 안개 속에서 세 번이나 같은 길을 \n걸었습니다. 바람에 흔들리는 잎은 별빛과 \n함께 꽃향기는 작은 결정을 따라 \n길을 안내해준다고 합니다.',
  },
  {
    id: 'req_spirit_tera',
    spiritId: 'spirit_tera',
    spiritName: '테라',
    candidateSpiritIds: ['spirit_tera', 'spirit_solaris'],
    tier: 'Normal',
    text: '태양은 떠 있는데도 들판엔 꽃 한 송이 \n피지 않습니다. 따뜻한 햇살 아래 꺼져가는 \n불꽃과 작은 결정만 희미하게 빛나고 있습니다.',
  },
  {
    id: 'req_spirit_pleo',
    spiritId: 'spirit_pleo',
    spiritName: '플레오',
    candidateSpiritIds: ['spirit_pleo', 'spirit_erion'],
    tier: 'Easy',
    text: '밤마다 호수 위로 짙은 물안개가 번집니다.\n 달빛은 물결을 비추고, 희미한 별빛과 \n신비로운 기운이 길을 이어 준다고 합니다.',
  },
  {
    id: 'req_spirit_porina',
    spiritId: 'spirit_porina',
    spiritName: '포리나',
    candidateSpiritIds: ['spirit_porina', 'spirit_rua'],
    tier: 'Normal',
    text: '거센 바람 때문에 꽃향기가 길을 \n잃었습니다. 향기는 반짝이는 \n결정에 머물고, 바람에 흔들리는 잎은 \n별빛이 비치는 길을 알려준다고 합니다.',
  },
  {
    id: 'req_spirit_igni',
    spiritId: 'spirit_igni',
    spiritName: '이그니',
    candidateSpiritIds: ['spirit_igni', 'spirit_solaris'],
    tier: 'Hard',
    text: '대장장이의 화로가 식어 버렸습니다.\n 화로속에는 땅속의 열기와 오래된 마력이 \n아직 남아 있고, 태양빛을 머금은 \n결정도 희미하게 빛나고 있습니다.',
  },
  {
    id: 'req_spirit_nova',
    spiritId: 'spirit_nova',
    spiritName: '노바',
    candidateSpiritIds: ['spirit_nova', 'spirit_lumen'],
    tier: 'Normal',
    text: '호수 건너편으로 노랫소리가 들립니다. \n달빛은 잔잔한 물결을  따라 흐르고, \n별빛은 흩어진 마음을 이어 준다고 합니다.',
  },
  {
    id: 'req_spirit_lumen',
    spiritId: 'spirit_lumen',
    spiritName: '루멘',
    candidateSpiritIds: ['spirit_lumen', 'spirit_soyo'],
    tier: 'Normal',
    text: '[탐험 기록 일지 283]\n달의 호수 위에 희미한 별빛이 보임. \n그 아래에는 꽃잎 하나가 사라진 \n마법처럼 천천히 떠다니고 있음.',
  },
  {
    id: 'req_spirit_solaris',
    spiritId: 'spirit_solaris',
    spiritName: '솔라스',
    candidateSpiritIds: ['spirit_solaris', 'spirit_igni'],
    tier: 'Hard',
    text: '긴 겨울은 끝났지만 마을은 \n아직 차갑습니다. 태양을 품은 결정일까요, \n땅속 깊은 열기와 오래된 마력일까요?',
  },
  {
    id: 'req_spirit_nubi',
    spiritId: 'spirit_nubi',
    spiritName: '누비',
    candidateSpiritIds: ['spirit_nubi', 'spirit_orvis'],
    tier: 'Normal',
    text: '고대 서고의 사서가 헐레벌떡 달려왔습니다.\n“책의 글자가 하나씩 사라지고 있어요!” \n오래된 주문의 흔적과 신비한 기운, \n그리고 태양의 결정만이 기록을 붙잡고 있습니다.',
  },
  {
    id: 'req_spirit_erion',
    spiritId: 'spirit_erion',
    spiritName: '에리온',
    candidateSpiritIds: ['spirit_erion', 'spirit_nova'],
    tier: 'Hard',
    text: '노인의 기억 속 소중했던 \n얼굴이 점점 흐려지고 있습니다. \n달빛 호수에서는 신비로운 물결과 \n별빛이 잊혀진 기억을 비춘다고 합니다.',
  },
  {
    id: 'req_spirit_orvis',
    spiritId: 'spirit_orvis',
    spiritName: '오르비스',
    candidateSpiritIds: ['spirit_orvis', 'spirit_nubi'],
    tier: 'Special',
    text: '[탐험 기록 일지 217] \n고대 유적 봉인에 균열 발생.  \n오래된 주문의 흔적과 형태 없이 흐르던 기운, \n햇빛을 품은 결정의 광채도 사라지고 있음.',
  },
] as const
