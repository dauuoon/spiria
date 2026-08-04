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
    candidateSpiritIds: ['spirit_soyo', 'spirit_lumen'],
    tier: 'Easy',
    text: '밤하늘에 빌었던 아이들의 소원이 \n아침이 되면 모두 사라지고 있어요.\n작은 소원들을 반짝이는 꽃잎 속에 모아 \n오래 간직해 줄 정령이 필요해요.',
  },
  {
    id: 'req_spirit_rua',
    spiritId: 'spirit_rua',
    spiritName: '루아',
    candidateSpiritIds: ['spirit_rua', 'spirit_porina'],
    tier: 'Easy',
    text: '짙은 안개가 숲길을 뒤덮어 \n여행자들이 같은 자리를 맴돌고 있어요. \n흔들리는 잎과 하늘의 빛으로 \n안전한 길을 알려 줄 정령을 찾아 주세요.',
  },
  {
    id: 'req_spirit_tera',
    spiritId: 'spirit_tera',
    spiritName: '테라',
    candidateSpiritIds: ['spirit_tera', 'spirit_solaris'],
    tier: 'Normal',
    text: '오랫동안 빛을 받지 못한 들판의 \n땅이 메말라 아무것도 자라지 않아요. \n굳은 땅을 깨우고 따뜻한 꽃을 피워주세요.',
  },
  {
    id: 'req_spirit_pleo',
    spiritId: 'spirit_pleo',
    spiritName: '플레오',
    candidateSpiritIds: ['spirit_pleo', 'spirit_erion'],
    tier: 'Easy',
    text: '밤마다 호수 위로 짙은 물안개가 번져 \n돌아오는 배들이 방향을 잃고 있어요. \n잔잔한 물결을 따라 달빛 길을 \n만들어 줄 정령을 찾아 주세요.',
  },
  {
    id: 'req_spirit_porina',
    spiritId: 'spirit_porina',
    spiritName: '포리나',
    candidateSpiritIds: ['spirit_porina', 'spirit_rua'],
    tier: 'Normal',
    text: '꽃이 피었지만 협곡의 거센 바람 때문에 \n향기가 마을까지 닿지 못하고 있어요. \n향기를 품고 반짝이는 바람길을 건너게 해주세요.',
  },
  {
    id: 'req_spirit_igni',
    spiritId: 'spirit_igni',
    spiritName: '이그니',
    candidateSpiritIds: ['spirit_igni', 'spirit_solaris'],
    tier: 'Hard',
    text: '마을의 마지막 화로가 점점 식어 가고 있어요. \n땅속에 남은 작은 열기를 찾아 꺼져 가는 불씨에 \n다시 숨을 불어넣어 줄 정령을 찾아 주세요.',
  },
  {
    id: 'req_spirit_nova',
    spiritId: 'spirit_nova',
    spiritName: '노바',
    candidateSpiritIds: ['spirit_nova', 'spirit_lumen'],
    tier: 'Normal',
    text: '호수 건너편으로 전하지 못한 노래가 \n밤마다 물결 위를 맴돌고 있어요. \n달빛을 타고 그 노래를 \n먼 곳까지 전해 줄 정령이 필요해요.',
  },
  {
    id: 'req_spirit_lumen',
    spiritId: 'spirit_lumen',
    spiritName: '루멘',
    candidateSpiritIds: ['spirit_lumen', 'spirit_soyo'],
    tier: 'Normal',
    text: '소중했던 기억이 오래된 호수의 \n그림자처럼 흐려져요. 어두운 밤에도 잊힌 장면을 \n밝게 비춰 줄 정령을 찾아 주세요.',
  },
  {
    id: 'req_spirit_solaris',
    spiritId: 'spirit_solaris',
    spiritName: '솔라스',
    candidateSpiritIds: ['spirit_solaris', 'spirit_igni'],
    tier: 'Hard',
    text: '긴 추위로 얼어붙은 마을에서는 아침이 와도 \n햇살의 온기를 느낄 수 없어요. \n차가운 얼음을 녹이고 잠든 생명을 깨워 줄 \n강한 빛의 정령이 필요해요.',
  },
  {
    id: 'req_spirit_nubi',
    spiritId: 'spirit_nubi',
    spiritName: '누비',
    candidateSpiritIds: ['spirit_nubi', 'spirit_orvis'],
    tier: 'Normal',
    text: '고대 서고의 글자들이 한 줄씩 희미해져서 \n사라지고 있어요. 흩어지는 지식과 이야기를 \n단단한 결정 속에 기록해 줄 정령을 찾아 주세요.',
  },
  {
    id: 'req_spirit_erion',
    spiritId: 'spirit_erion',
    spiritName: '에리온',
    candidateSpiritIds: ['spirit_erion', 'spirit_nova'],
    tier: 'Hard',
    text: '한 노인이 가장 소중했던 사람의 얼굴을 \n조금씩 잊어가고 있어요. 사라지는 기억을 \n고요한 물결 속에 담아 오래 지켜 줄 정령이 필요해요.',
  },
  {
    id: 'req_spirit_orvis',
    spiritId: 'spirit_orvis',
    spiritName: '오르비스',
    candidateSpiritIds: ['spirit_orvis', 'spirit_nubi'],
    tier: 'Special',
    text: '오래된 유적 위로 빛과 어둠의 균열이 \n벌어지고 있어요. 강한 빛을 품은 \n단단한 결정으로 균열을 봉인하고 \n세계의 경계를 지켜 줄 정령을 찾아 주세요.',
  },
] as const
