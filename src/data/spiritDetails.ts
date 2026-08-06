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
	conversationLines: string[]
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
		requestText: '밤하늘의 별빛이 점점 사라지고 있습니다. \n꽃잎에 머무른 빛일까요, \n달빛 비친 호수에 스며든 빛일까요?',
		keywords: ['밤하늘', '소원', '꽃잎', '반짝임'],
		conversationLines: ['“아직 이루어지지 않았다고 사라진 건 아니야.”', '“오늘도 작은 소원 하나가 꽃잎에 내려앉았어.”', '“네 소원도 잠시 내가 간직해 줄까?”'],
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
		requestText: '탐험가는 안개 속에서 세 번이나 같은 길을 \n걸었습니다. 바람에 흔들리는 잎은 별빛과 \n함께 꽃향기는 작은 결정을 따라 \n길을 안내해준다고 합니다.',
		keywords: ['숲길', '흔들림', '꽃잎', '반짝임'],
		conversationLines: ['“길을 잃었다면 잠시 멈춰 봐. \n잎이 흔들리는 쪽을 알려 줄게.”', '“바람이 지나간 길은 잎맥에 오래 남아 있어.”', '“천천히 걸어도 괜찮아. \n올바른 길은 사라지지 않으니까.”'],
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
		requestText: '태양은 떠 있는데도 들판엔 꽃 한 송이 \n피지 않습니다. 따뜻한 햇살 아래 꺼져가는 \n불꽃과 작은 결정만 희미하게 빛나고 있습니다.',
		keywords: ['메마른 땅', '생명', '에너지', '개화', '가치'],
		conversationLines: ['“아무것도 자라지 않는 것처럼 보여도, \n뿌리는 조용히 준비하고 있어.”', '“메마른 땅속에도 아직 작은 온기가 남아 있어.”', '“오늘은 네 마음에 어떤 꽃을 피워 볼까?”'],
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
		requestText: '밤마다 호수 위로 짙은 물안개가 번집니다.\n 달빛은 물결을 비추고, 희미한 별빛과 \n신비로운 기운이 길을 이어 준다고 합니다.',
		keywords: ['호수', '밤', '하늘', '달빛', '공간'],
		conversationLines: ['“길이 잘 보이지 않아도 괜찮아. \n내가 물결 위에 하나씩 놓아 줄게.”', '“물안개가 짙어지면 내 꼬리의 별빛을 따라와.”', '“멀리 보이지 않는 밤에는, \n바로 앞의 작은 빛만 따라가도 돼.”'],
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
		requestText: '거센 바람 때문에 꽃향기가 길을 \n잃었습니다. 향기는 반짝이는 \n결정에 머물고, 바람에 흔들리는 잎은 \n별빛이 비치는 길을 알려준다고 합니다.',
		keywords: ['성장', '향기', '자유', '전달', '광', '빛'],
		conversationLines: ['“오늘 네 마음에 좋은 향기가 머물렀으면 좋겠어.”', '“꽃향기는 사라지는 게 아니라 \n새로운 곳으로 여행하는 거야.”', '“바람에 흔들려도, \n네가 가진 향기까지 잃는 건 아니야.”'],
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
		requestText: '대장장이의 화로가 식어 버렸습니다.\n 화로속에는 땅속의 열기와 오래된 마력이 \n아직 남아 있고, 태양빛을 머금은 \n결정도 희미하게 빛나고 있습니다.',
		keywords: ['열정', '수정', '땅속 열기', '부활', '마력'],
		conversationLines: ['“꺼진 줄 알았던 불씨도 가까이 보면 아직 따뜻해.”', '“조금 지쳤어? \n내가 네 곁에서 작은 온기를 지켜 줄게.”', '“다시 타오르기 위해 잠시 작아지는 불꽃도 있어.”'],
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
		requestText: '호수 건너편으로 노랫소리가 들립니다. \n달빛은 잔잔한 물결을  따라 흐르고, \n별빛은 흩어진 마음을 이어 준다고 합니다.',
		keywords: ['달빛', '파동', '물결', '밤하늘'],
		conversationLines: ['“전하지 못한 마음은 \n밤의 물결 위에서 계속 노래하고 있어.”', '“네가 하고 싶었던 말, 내가 별빛에 실어 보내 줄까?”', '“진심은 늦게 도착해도 결국 누군가의 마음에 닿아.”'],
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
		requestText: '[탐험 기록 일지 283]\n달의 호수 위에 희미한 별빛이 보임. \n그 아래에는 꽃잎 하나가 사라진 \n기억처럼 천천히 떠다니고 있음.',
		keywords: ['유동', '별빛', '달밤', '만개', '기적'],
		conversationLines: ['“흐려진 기억도 네 마음에 남긴 \n온기까지 사라지진 않아.”', '“잊었다고 생각한 장면도 \n빛을 비추면 다시 떠오를 수 있어.”', '“오늘 기억하고 싶은 순간이 있다면 내게 보여 줘.”'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_solaris: {
		typeLabel: '정령형',
		rarityLabel: '에픽',
		rarityKey: 'epic',
		themeLabel: '따뜻한 골드',
		story: '태양의 빛을 몸속 결정에 담아 \n식어 가는 불씨를 다시 밝히는 정령이다. \n오래 잠든 화로를 찾아다니며 \n사라져 가는 온기를 세상에 되돌려 준다.',
		storyBoxColor: '#7d5544',
		requestText: '긴 겨울은 끝났지만 마을은 \n아직 차갑습니다. 태양을 품은 결정일까요, \n땅속 깊은 열기와 오래된 마력일까요?',
		keywords: ['햇빛', '온기', '점화', '생명', '빛'],
		conversationLines: ['“추운 하루였지? 내가 조금 따뜻하게 밝혀 줄게.”', '“태양의 빛은 작은 결정 속에서도 오래 머물 수 있어.”', '“따뜻함은 크기보다 오래 지켜 주는 마음에서 생겨.”'],
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
		requestText: '고대 서고의 사서가 헐레벌떡 달려왔습니다. \n"책의 글자가 사라지고 있어요!" \n신비로운 기운과 작은 태양의 결정만이 \n책을 지키고 있습니다.',
		keywords: ['광휘', '지식', '보존', '결정', '신비', '힘'],
		conversationLines: ['“사라지는 이야기는 \n내가 작은 결정에 새겨 두고 있어.”', '“잊고 싶지 않은 말이 있다면 천천히 들려줘.”', '“기록하지 못한 순간도 \n네 안에서는 의미를 잃지 않아.”'],
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
		requestText: '노인의 기억 속 소중했던 얼굴이 \n점점 흐려지고 있습니다. 달빛 호수에서는 \n별빛과 신비로운 물결이 \n잊혀진 기억을 비춘다고 합니다.',
		keywords: ['무한', '소원', '물결', '달빛', '그리움'],
		conversationLines: ['“기억이 흐려져도 \n그 사람을 아꼈던 마음은 남아 있어.”', '“소중한 기억은 고요한 물결 속에 \n잠시 쉬고 있을 뿐이야.”', '“오늘 떠오른 얼굴이 있다면 \n내가 달빛으로 비춰 줄게.”'],
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
		requestText: '[탐험 기록 일지 217]\n고대 유적 봉인에 균열 발생. 결정은 \n남아 있으나 빛이 약해지고, \n오래된 주문의 흔적도 함께 사라짐.',
		keywords: ['고대', '유적', '봉인', '빛', '결정', '원소'],
		conversationLines: ['“강하다는 건 무너지지 않는 게 아니라, \n다시 세우는 일이야.”', '“아주 작은 균열도 오래 두면 \n어둠이 스며들 수 있어.”', '“네가 지키고 싶은 것이 있다면 \n내 결정 곁에 맡겨 둬.”'],
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
