import type { SpiritRarity } from '../types/game'

export type SpiritThemeLabel =
	| '따뜻한 골드'
	| '차가운 푸른빛'
	| '보라빛 신비'
	| '붉은 불빛'
	| '푸릇한 그린빛'

export type SpiritDetailMeta = {
	typeLabel: string
	rarityLabel: string
	rarityKey: SpiritRarity
	themeLabel: SpiritThemeLabel
	story: string
	storyBoxColor: string
	requestText: string
	keywords: string[]
	conversationLines: [string, string, string]
	craftCount: string
	requestMatchRate: string
	firstMetDate: string
}

export const SPIRIT_DETAIL_META: Record<string, SpiritDetailMeta> = {
	spirit_soyo: {
		typeLabel: '식물형',
		rarityLabel: '일반',
		rarityKey: 'common',
		themeLabel: '따뜻한 골드',
		story: '별빛을 머금은 꽃잎에 사람들의\n작은 소원을 모아 간직한다. 소원이 이루어지면 \n꽃잎 하나를 밤하늘로 돌려보낸다.',
		storyBoxColor: '#452f2c',
		requestText: '밤하늘에 빌었던 아이들의 소원이 \n아침이 되면 모두 사라지고 있어요.\n작은 소원들을 반짝이는 꽃잎 속에 모아 \n오래 간직해 줄 정령이 필요해요.',
		keywords: ['밤하늘', '소원', '꽃잎', '반짝임'],
		conversationLines: ['오늘은 꽃잎이 더 반짝여요.', '작은 소원 하나를 맡겨도 될까요?', '별빛이 닿는 곳까지 함께 걸어요.'],
		craftCount: '미정',
		requestMatchRate: '94%',
		firstMetDate: '미정',
	},
	spirit_rua: {
		typeLabel: '식물형',
		rarityLabel: '일반',
		rarityKey: 'common',
		themeLabel: '푸릇한 그린빛',
		story: '잎맥에 바람이 지나간 방향을 기록한다. \n숲에서 길을 잃은 이가 나타나면 \n잎을 흔들어 별빛이 비치는 길을 알려준다.',
		storyBoxColor: '#1c4d35',
		requestText: '짙은 안개가 숲길을 뒤덮어 \n여행자들이 같은 자리를 맴돌고 있어요. \n흔들리는 잎과 하늘의 빛으로 \n안전한 길을 알려 줄 정령을 찾아 주세요.',
		keywords: ['숲길', '흔들림', '꽃잎', '반짝임'],
		conversationLines: ['잎사귀가 길을 기억하고 있어요.', '바람 소리를 잘 들으면 길이 보여요.', '길을 잃으면 제 이름을 불러 주세요.'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_tera: {
		typeLabel: '식물형',
		rarityLabel: '레어',
		rarityKey: 'rare',
		themeLabel: '따뜻한 골드',
		story: '굳어버린 땅속에서 작은 온기를 찾아 \n꽃의 뿌리로 전달한다. 테라가 머문 자리에는\n메마른 계절에도 한 송이의 꽃이 피어난다.',
		storyBoxColor: '#312714',
		requestText: '오랫동안 빛을 받지 못한 들판의 \n땅이 메말라 아무것도 자라지 않아요. \n굳은 땅을 깨우고 따뜻한 꽃을 피워주세요.',
		keywords: ['메마른 땅', '생명', '에너지', '개화', '가치'],
		conversationLines: ['메마른 흙에도 숨은 온기가 있어요.', '작은 씨앗도 포기하지 않아요.', '다음엔 더 큰 꽃을 피워 볼게요.'],
		craftCount: '미정',
		requestMatchRate: '93%',
		firstMetDate: '미정',
	},
	spirit_pleo: {
		typeLabel: '동물형',
		rarityLabel: '일반',
		rarityKey: 'common',
		themeLabel: '보라빛 신비',
		story: '달빛이 비친 물가에 나타나는 작은 정령이다. \n꼬리에 맺힌 별빛을 물결 위에 놓아\n안전한 길을 만든다.',
		storyBoxColor: '#4e4268',
		requestText: '밤마다 호수 위로 짙은 물안개가 번져 \n돌아오는 배들이 방향을 잃고 있어요. \n잔잔한 물결을 따라 달빛 길을 \n만들어 줄 정령을 찾아 주세요.',
		keywords: ['호수', '밤', '하늘', '달빛', '공간'],
		conversationLines: ['달빛이 물결 위에서 춤추고 있어요.', '안개가 짙어도 길은 사라지지 않아요.', '당신의 마음이 닿는 쪽으로 이끌게요.'],
		craftCount: '미정',
		requestMatchRate: '94%',
		firstMetDate: '미정',
	},
	spirit_porina: {
		typeLabel: '동물형',
		rarityLabel: '레어',
		rarityKey: 'rare',
		themeLabel: '따뜻한 골드',
		story: '꽃향기를 날개에 머금고\n협곡과 숲 사이를 오가는 정령이다. \n몸 주변의 작은 결정이\n향기가 흩어지지 않도록 붙잡아 준다.',
		storyBoxColor: '#452f2c',
		requestText: '꽃이 피었지만 협곡의 거센 바람 때문에 \n향기가 마을까지 닿지 못하고 있어요. \n향기를 품고 반짝이는 바람길을 건너게 해주세요.',
		keywords: ['성장', '향기', '자유', '전달', '광', '빛'],
		conversationLines: ['향기가 오늘은 멀리 퍼질 것 같아요.', '반짝이는 바람결을 잡아볼까요?', '꽃이 웃는 소리가 들리지 않나요?'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_igni: {
		typeLabel: '동물형',
		rarityLabel: '에픽',
		rarityKey: 'epic',
		themeLabel: '붉은 불빛',
		story: '땅속에 숨은 열기를 찾아내는 정령이다. \n꺼진 불씨 주변을 돌며 마력을 \n불어넣어 다시 타오르게 한다.',
		storyBoxColor: '#5e4037',
		requestText: '마을의 마지막 화로가 점점 식어 가고 있어요. \n땅속에 남은 작은 열기를 찾아 꺼져 가는 불씨에 \n다시 숨을 불어넣어 줄 정령을 찾아 주세요.',
		keywords: ['열정', '수정', '땅속 열기', '부활', '마력'],
		conversationLines: ['꺼진 불씨도 다시 살아날 수 있어요.', '열기를 잃지 않으면 길이 열려요.', '필요하면 제 불꽃을 나눠 드릴게요.'],
		craftCount: '미정',
		requestMatchRate: '96%',
		firstMetDate: '미정',
	},
	spirit_nova: {
		typeLabel: '정령형',
		rarityLabel: '레어',
		rarityKey: 'rare',
		themeLabel: '보라빛 신비',
		story: '밤의 호수에 머물던 노래가\n달빛을 만나 태어난 정령이다. \n물결 위에 별빛 음표를 띄워 \n멀리 떨어진 이에게 마음을 전한다.',
		storyBoxColor: '#614e73',
		requestText: '호수 건너편으로 전하지 못한 노래가 \n밤마다 물결 위를 맴돌고 있어요. \n달빛을 타고 그 노래를 \n먼 곳까지 전해 줄 정령이 필요해요.',
		keywords: ['달빛', '파동', '물결', '밤하늘'],
		conversationLines: ['밤의 노래가 오늘은 맑게 울려요.', '물결에 마음을 띄워 보내 볼까요?', '당신의 목소리도 별이 되어 반짝여요.'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_lumen: {
		typeLabel: '정령형',
		rarityLabel: '레어',
		rarityKey: 'rare',
		themeLabel: '차가운 푸른빛',
		story: '호수에 비친 별빛과 달빛을 모아 \n흐려진 기억을 다시 비춘다. \n말로 떠올리지 못하는 장면도 \n물 위의 빛으로 보여준다.',
		storyBoxColor: '#414766',
		requestText: '소중했던 기억이 오래된 호수의 \n그림자처럼 흐려져요. 어두운 밤에도 잊힌 장면을 \n밝게 비춰 줄 정령을 찾아 주세요.',
		keywords: ['유동', '별빛', '달밤', '만개', '기적'],
		conversationLines: ['흐려진 기억도 빛으로 되찾을 수 있어요.', '천천히 떠올리면 더 선명해져요.', '잊고 싶지 않은 장면을 지켜 드릴게요.'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_solaris: {
		typeLabel: '정령형',
		rarityLabel: '에픽',
		rarityKey: 'epic',
		themeLabel: '따뜻한 골드',
		story: '호수에 비친 별빛과 달빛을 모아 \n흐려진 기억을 다시 비춘다. \n말로 떠올리지 못하는 장면도 \n물 위의 빛으로 보여준다.',
		storyBoxColor: '#7d5544',
		requestText: '긴 추위로 얼어붙은 마을에서는 아침이 와도 \n햇살의 온기를 느낄 수 없어요. \n차가운 얼음을 녹이고 잠든 생명을 깨워 줄 \n강한 빛의 정령이 필요해요.',
		keywords: ['햇빛', '열기', '근원', '생명', '광채'],
		conversationLines: ['얼어붙은 곳에 아침빛을 내릴게요.', '따뜻함은 생각보다 가까이에 있어요.', '당신의 용기가 햇살처럼 번지고 있어요.'],
		craftCount: '미정',
		requestMatchRate: '94%',
		firstMetDate: '미정',
	},
	spirit_nubi: {
		typeLabel: '고대형',
		rarityLabel: '레어',
		rarityKey: 'rare',
		themeLabel: '보라빛 신비',
		story: '오래된 주문과 기록이 뭉쳐 태어난 고대 정령이다.\n사라지는 글자와 이야기를\n작은 결정에 새겨 잊히지 않게 보존한다.',
		storyBoxColor: '#4b425c',
		requestText: '고대 서고의 글자들이 한 줄씩 희미해져서 \n사라지고 있어요. 흩어지는 지식과 이야기를 \n단단한 결정 속에 기록해 줄 정령을 찾아 주세요.',
		keywords: ['광휘', '지식', '보존', '결정', '신비', '힘'],
		conversationLines: ['사라지는 글자들을 붙잡아 두었어요.', '지식은 나눌수록 더 단단해져요.', '오늘의 기록도 빛나는 조각이 될 거예요.'],
		craftCount: '미정',
		requestMatchRate: '94%',
		firstMetDate: '미정',
	},
	spirit_erion: {
		typeLabel: '고대형',
		rarityLabel: '에픽',
		rarityKey: 'epic',
		themeLabel: '차가운 푸른빛',
		story: '사라지는 기억을 고요한 물결 속에\n봉인하는 고대 수호 정령이다.\n달이 뜨는 밤이면 보존된 기억을 잠시 비춰준다.',
		storyBoxColor: '#363c5a',
		requestText: '한 노인이 가장 소중했던 사람의 얼굴을 \n조금씩 잊어가고 있어요. 사라지는 기억을 \n고요한 물결 속에 담아 오래 지켜 줄 정령이 필요해요.',
		keywords: ['무한', '소원', '물결', '달빛', '그리움'],
		conversationLines: ['고요한 물결에 기억을 보관해 둘게요.', '그리움도 언젠가 힘이 돼요.', '달이 뜨면 다시 꺼내 보여 드릴게요.'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_orvis: {
		typeLabel: '고대형',
		rarityLabel: '전설',
		rarityKey: 'legendary',
		themeLabel: '따뜻한 골드',
		story: '오래된 세계의 경계를 지키도록\n만들어진 수정 수호 정령이다.\n태양빛을 결정에 응축해 균열과 어둠을 봉인한다.',
		storyBoxColor: '#6d513a',
		requestText: '오래된 유적 위로 빛과 어둠의 균열이 \n벌어지고 있어요. 강한 빛을 품은 \n단단한 결정으로 균열을 봉인하고 \n세계의 경계를 지켜 줄 정령을 찾아 주세요.',
		keywords: ['고대', '유적', '봉인', '빛', '결정', '원소'],
		conversationLines: ['균열의 울림이 조금 잦아들었어요.', '빛과 어둠의 경계를 함께 지켜요.', '세계의 숨결이 안정될 때까지 곁에 있을게요.'],
		craftCount: '미정',
		requestMatchRate: '98%',
		firstMetDate: '미정',
	},
}

export const DEFAULT_SPIRIT_DETAIL_META: SpiritDetailMeta = {
	typeLabel: '정령형',
	rarityLabel: '일반',
	rarityKey: 'common',
	themeLabel: '따뜻한 골드',
	story: '정령 소개 데이터가 준비 중입니다.',
	storyBoxColor: 'rgba(8,10,20,0.5)',
	requestText: '의뢰서 내용이 준비 중입니다.',
	keywords: ['데이터 준비중'],
	conversationLines: ['안녕하세요, 오늘도 함께해요.', '조용히 반짝이는 기운이 느껴져요.', '다음에 또 이야기해요.'],
	craftCount: '-',
	requestMatchRate: '-',
	firstMetDate: '-',
}
