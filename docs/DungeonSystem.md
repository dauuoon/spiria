# Dungeon System

## 1. 목적

탐사는 제작 재료, 지역 흔적, 진행 재화를 수급하는 핵심 루프다.

플레이어는 Mana를 사용해 탐험에 입장한다.

## 2. Mana 규칙

런타임 데이터: `src/lib/store.ts`, `src/data/constants.ts`

- 최대치: 5
- 시작치: 5
- 탐험 1회당 1 소모
- 20분마다 1 회복
- 5 도달 시 회복 중지
- 5 미만이 되는 순간부터 다음 회복 타이머 시작
- 오프라인 경과 시간 반영
- 최대치 도달 후 초과 시간 이월 없음

## 3. Region Traces

런타임 데이터: `src/data/progression.ts`의 `REGION_TRACES`

- 별빛 숲속: 숲의 잔향
- 바람의 협곡: 바람의 메아리
- 얼어붙은 설원: 설원의 기억
- 화염의 산맥: 화염의 잔재
- 어둠의 습지: 어둠의 흔적

Hidden Stage 입장 규칙:

- 동일 지역 흔적 20개 필요
- 입장 시 흔적 20개 차감
- 자동 입장 없음, 플레이어 수동 선택

## 4. Hidden Stage 보상

런타임 데이터: `src/data/progression.ts`의 `HIDDEN_STAGE_REWARD_DRAFT`

- 해당 지역 정령 중 하나의 정령 조각 확정
- Mana 대량 지급
- Gold 대량 지급
- EXP 대량 지급

현재 수치 상태:

- 정령 조각 수량: TBD
- Mana 수량: TBD
- Gold 수량: TBD
- EXP 수량: TBD

## 5. 일반 탐험 드랍 상태

런타임 데이터: `src/data/drops.ts`의 `EXPEDITION_REWARD_DRAFT`

- trace/fragment/mana 보상은 현재 Draft 값으로 운용
- 최종 확정 전까지 밸런스 원본 시트와 동기화하여 조정
