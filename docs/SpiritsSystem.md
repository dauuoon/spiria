# Spirits System

## 목적

- 정령 정의(기본 메타)와 정령 조각 기반 해금 구조를 분리 관리한다.

## 데이터 소스

- 정령 기본 목록: `src/data/spirits.ts`
- 정령 조각 메타: `src/data/progression.ts`의 `SPIRIT_FRAGMENTS`

## 조각 해금 규칙

- 각 조각은 특정 `spiritId`에 귀속된다.
- 동일 정령 조각 100개를 모으면 즉시 해금 가능하다.
- 해금 시 조각 100개를 차감한다.
- 이미 해금한 정령 조각의 재획득 처리 방식은 TBD다.

## 희귀도

- 정령 희귀도는 Common/Rare/Epic/Legendary 4단계를 사용한다.
- 색상 토큰은 `src/data/rarity.ts`에서 중앙 관리한다.
