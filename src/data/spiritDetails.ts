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
	requestText: string
	keywords: string[]
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
		requestText: '밤하늘에 빌었던 아이들의 소원이 아침이 되면 모두 사라지고 있어요.\n작은 소원들을 반짝이는 꽃잎 속에 모아 오래 간직해 줄 정령이 필요해요.',
		keywords: ['밤하늘', '소원', '꽃잎', '보관', '반짝임'],
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
		requestText: '짙은 안개가 숲길을 뒤덮어 여행자들이 같은 자리를 맴돌고 있어요. \n흔들리는 잎과 하늘의 빛으로 안전한 길을 알려 줄 정령을 찾아 주세요.',
		keywords: ['숲길', '안개', '길 안내', '흔들림', '잎', '하늘빛'],
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
		requestText: '오랫동안 빛을 받지 못한 들판의 땅이 메말라 아무것도 자라지 않아요. \n굳은 땅을 깨우고 따뜻한 꽃을 피워 줄 정령이 필요해요.',
		keywords: ['메마른 땅', '생명', '회복', '따뜻함', '개화', '햇빛'],
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
		requestText: '밤마다 호수 위로 짙은 물안개가 번져 돌아오는 배들이 방향을 잃고 있어요. \n잔잔한 물결을 따라 달빛 길을 만들어 줄 정령을 찾아 주세요.',
		keywords: ['호수', '밤', '물안개', '달빛', '길', '안내'],
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
		requestText: '꽃이 피었지만 협곡의 거센 바람 때문에 향기가 마을까지 닿지 못하고 있어요. \n향기를 품고 반짝이는 바람길을 건너 줄 정령이 필요해요.',
		keywords: ['협곡', '꽃향기', '바람', '전달', '반짝임'],
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
		requestText: '마을의 마지막 화로가 점점 식어 가고 있어요. \n땅속에 남은 작은 열기를 찾아 꺼져 가는 불씨에 \n다시 숨을 불어넣어 줄 정령을 찾아 주세요.',
		keywords: ['불씨', '화로', '땅속 열기', '부활', '마력'],
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
		requestText: '호수 건너편으로 전하지 못한 노래가 밤마다 물결 위를 맴돌고 있어요. \n달빛을 타고 그 노래를 먼 곳까지 전해 줄 정령이 필요해요.',
		keywords: ['달빛', '노래', '물결', '전달', '밤하늘'],
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
		requestText: '소중했던 기억이 오래된 호수의 그림자처럼 조금씩 흐려지고 있어요. \n어두운 밤에도 잊힌 장면을 밝게 비춰 줄 정령을 찾아 주세요.',
		keywords: ['기억', '별빛', '달밤', '호수', '비춤'],
		craftCount: '미정',
		requestMatchRate: '95%',
		firstMetDate: '미정',
	},
	spirit_solaris: {
		typeLabel: '정령형',
		rarityLabel: '에픽',
		rarityKey: 'epic',
		themeLabel: '따뜻한 골드',
		story: '태양의 온기와 불꽃을 결정 안에 모아 두었다가\n추운 땅에 내보낸다. 솔라스가 지나가면\n얼음 아래 잠든 생명이 천천히 깨어난다.',
		requestText: '긴 추위로 얼어붙은 마을에서는 아침이 와도 햇살의 온기를 느낄 수 없어요. \n차가운 얼음을 녹이고 잠든 생명을 깨워 줄 강한 빛의 정령이 필요해요.',
		keywords: ['햇빛', '열기', '해빙', '생명', '광채'],
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
		requestText: '고대 서고의 글자들이 한 줄씩 희미해지며 사라지고 있어요. \n흩어지는 지식과 이야기를 단단한 결정 속에 기록해 줄 정령을 찾아 주세요.',
		keywords: ['고대', '기록', '지식', '보존', '결정', '신비', '힘'],
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
		requestText: '한 노인이 가장 소중했던 사람의 얼굴을 조금씩 잊어가고 있어요. \n사라지는 기억을 고요한 물결 속에 담아 오래 지켜 줄 정령이 필요해요.',
		keywords: ['기억', '보존', '고요함', '물결', '달빛', '그리움'],
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
		requestText: '오래된 유적 위로 빛과 어둠의 균열이 벌어지고 있어요. \n강한 빛을 품은 단단한 결정으로 균열을 봉인하고 \n세계의 경계를 지켜 줄 정령을 찾아 주세요.',
		keywords: ['고대', '유적', '균열', '봉인', '빛', '결정'],
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
	requestText: '의뢰서 내용이 준비 중입니다.',
	keywords: ['데이터 준비중'],
	craftCount: '-',
	requestMatchRate: '-',
	firstMetDate: '-',
}
