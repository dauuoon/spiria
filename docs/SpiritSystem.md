# Spirit System

## 개요

정령 시스템은 정령 본체 데이터, 희귀도 토큰, 정령 조각 해금 규칙을 함께 관리한다.

- 정령 기본 데이터: `src/data/spirits.ts`
- 희귀도 토큰: `src/data/rarity.ts`
- 정령 조각 데이터: `src/data/progression.ts`의 `SPIRIT_FRAGMENTS`

## 목적

- 정령 정의(기본 메타)와 정령 조각 기반 해금 구조를 분리 관리한다.
- 정령 카드, 도감, 인벤토리, 제작 결과, 상세, 정령 조각 UI에서 동일한 희귀도 기준을 사용한다.

## Spirit Fragments

정령 조각은 정령 단위로 관리한다.

필수 필드:

- `fragmentId`
- `spiritId`
- `ownedAmount`
- `requiredAmount`

현재 규칙:

- `requiredAmount = 100`
- 조각 100개 수집 시 정령 즉시 해금 가능
- 해금 시 조각 100개 차감
- 이미 해금한 정령 조각의 재획득 처리 방식은 TBD

## Rarity

희귀도는 Common / Rare / Epic / Legendary 4단계를 사용한다.

- Common (일반): main `#C2C7D1`, border `#B8BEC9`
- Rare (레어): main `#5FBFFF`, border `#67B8FF`
- Epic (에픽): main `#A894FF`, border `#8A73F5`
- Legendary (전설): main `#F6E7A8`, border `#E7C55B`

해당 토큰은 정령 카드/도감/인벤토리/제작 결과/상세/정령 조각 UI에 동일 기준으로 적용한다.
