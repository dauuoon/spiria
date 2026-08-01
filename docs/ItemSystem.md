# Item System

## 1. 분류 체계

- Crafting Materials: 정령 제작 재료
- Currency and Progression: EXP, Gold, Mana
- Spirit Fragments: 정령 해금용 조각
- Region Traces: 지역 Hidden Stage 입장 재료

## 2. Crafting Materials (12종)

런타임 데이터: `src/data/items.ts`의 `CRAFTING_MATERIALS`

- Nature: 꽃(`flower`), 잎(`leaf`), 흙(`soil`)
- Element: 물(`water`), 불(`fire`), 바람(`wind`)
- Sky: 별(`star`), 달(`moon`), 태양(`light`)
- Mystic: 마법(`magic`), 에테르(`ether`), 보석(`gem`)

규칙:

- 카테고리는 데이터 관리/확장용이며 현재 UI에는 카테고리명을 노출하지 않는다.
- 제작 재료 보석은 `Gem / 보석 / gem`으로 통일한다.

## 3. Currency and Progression

런타임 데이터: `src/lib/store.ts`, `src/data/constants.ts`

- EXP: 레벨 성장에 사용, 인벤토리 아이템으로 저장하지 않음
- Gold: 일반 재화, 내부 ID `gold`
- Mana: 탐험 에너지, 내부 ID `mana`

Gem과 Mana 구분:

- `inventory.gem`: 제작 재료 젬
- `player.mana`(store state): 탐험 에너지

## 4. Spirit Fragments

런타임 데이터: `src/data/progression.ts`의 `SPIRIT_FRAGMENTS`

- 조각은 정령 단위로 관리한다.
- 각 조각은 `fragmentId`, `spiritId`, `ownedAmount`, `requiredAmount`를 가진다.
- 현재 해금 필요 수량은 모든 정령에 대해 100이다.

## 5. Region Traces

런타임 데이터: `src/data/progression.ts`의 `REGION_TRACES`

- 별빛 숲속: 숲의 잔향(`forest_trace`)
- 바람의 협곡: 바람의 메아리(`wind_trace`)
- 얼어붙은 설원: 설원의 기억(`lake_trace`)
- 화염의 산맥: 화염의 잔재(`ruins_trace`)
- 어둠의 습지: 어둠의 흔적(`final_trace`)

각 흔적은 Hidden Stage 입장 요구 수량 20을 사용한다.

## 6. 희귀도 토큰

런타임 데이터: `src/data/rarity.ts`의 `SPIRIT_RARITY_TOKENS`

- Common: main `#C2C7D1`, border `#B8BEC9`
- Rare: main `#5FBFFF`, border `#67B8FF`
- Epic: main `#A894FF`, border `#8A73F5`
- Legendary: main `#F6E7A8`, border `#E7C55B`

해당 토큰은 인벤토리/결과/정령 관련 UI에서 공통으로 사용한다.

## 7. 아이템 희귀도 규칙

런타임 데이터: `src/data/rarity.ts`의 `getRarityByItemId`

- 모든 재료 아이템은 Common(일반)이다.
- 정령 조각 아이템(`fragment_spirit_*`)은 Legendary(전설)이다.
- 숲의 잔향(`forest_trace`), 바람의 메아리(`wind_trace`)는 Rare(레어)다.
- 설원의 기억(`lake_trace`), 화염의 잔재(`ruins_trace`)는 Epic(에픽)이다.
- 어둠의 흔적(`final_trace`)은 Legendary(전설)다.

이 규칙은 인벤토리, 탐험 결과, 아이템 상세와 같은 기타 아이템 표시에 동일하게 적용한다.
