# Economy System

## 1. Currency and Progression

경제 핵심 자원은 아래 3종이다.

- EXP: 레벨 성장 재화 (인벤토리 미저장)
- Gold: 일반 재화 (`gold`)
- Mana: 탐험 에너지 (`mana`)

Gem과 Mana 구분:

- Gem(`gem`): 제작 재료, 인벤토리 저장
- Mana(`mana`): 탐험 에너지, 플레이어 상태로 별도 관리

## 2. Mana 운영 규칙

런타임 데이터: `src/lib/store.ts`, `src/data/constants.ts`

- 최대 5
- 시작 5
- 탐험 1회당 1 소모
- 20분마다 1 회복
- 최대 도달 시 회복 중지
- 최대 도달 후 초과 시간 이월 없음
- 오프라인 복귀 시 경과 시간 반영

## 3. 제작 비용 연동

런타임 데이터: `src/data/economy.ts`

| 레벨 구간 | 재료 1종당 필요 | 선택 재료 수 | 총 소모 |
|---|---:|---:|---:|
| 1~19 | 2 | 3 | 6 |
| 20~49 | 3 | 3 | 9 |
| 50~79 | 4 | 3 | 12 |
| 80~99 | 5 | 3 | 15 |

규칙:

- 의뢰 제작/자유 제작 모두 동일 비용 함수 사용
- 제작 성공 확정 시에만 차감
- 실패/취소/중복 요청 시 차감 금지

## 4. 조각/흔적 경제 규칙

런타임 데이터: `src/data/progression.ts`

- Spirit Fragment 해금 필요량: 정령별 100
- Region Trace Hidden Stage 입장 필요량: 지역별 20
- Hidden Stage 보상 수치: TBD

## 5. 현재 TBD 항목

- Hidden Stage 정령 조각 지급 수량
- Hidden Stage Mana/Gold/EXP 지급 수량
- 일반 탐험의 지역 흔적 드랍 확률
- 일반 탐험의 지역 흔적 1회 드랍 수량
