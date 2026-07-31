# Item System

## 1) 아이템 구조
- 재료 아이템(12종): 정령 조합 재료
- 기타 아이템:
  - 정령의 조각 (`soul`): 대표 이미지 1개 사용
    - 이미지: `public/assets/item/it/it_soul.png`
  - 지역의 흔적(히든 스테이지 진입용 누적 아이템)
    - 별빛 숲속 -> 숲의 잔향 (`forest_trace`)
      - 이미지: `public/assets/item/it/it_forestmap.png`
    - 바람의 협곡 -> 바람의 메아리 (`wind_trace`)
      - 이미지: `public/assets/item/it/it_windmap.png`
    - 얼어붙은 설원 -> 설원의 기억 (`lake_trace`)
      - 이미지: `public/assets/item/it/it_lakemap.png`
    - 화염의 산맥 -> 화염의 잔재 (`ruins_trace`)
      - 이미지: `public/assets/item/it/it_ruinsmap.png`
    - 어둠의 습지 -> 어둠의 흔적 (`final_trace`)
      - 이미지: `public/assets/item/it/it_finalmap.png`

## 2) 보상 반영 로직
- 탐색 완료(10회) 시 보상 생성:
  - 재료: 12종 중 1종 랜덤 + 수량
  - 기타: 현재 스테이지의 지역 흔적 + 확률 기반 정령의 조각
- 생성된 보상은 즉시 인벤토리에 누적 반영
- 탐색 결과창 하단 보상 박스는 실제 획득한 아이템 이미지를 표시

## 3) 인벤토리(가방) 표시 규칙
- 4x4 그리드 배치
- 모든 아이템 타일은 `item_bg` 위에 아이템 이미지를 오버레이
- 수량은 둥근 배지(숫자)로 표기
- 아이템명은 이미지 하단 4px 아래에 표기

## 4) 제작 화면 규칙
- 제작 화면 재료는 기존 상태 이미지(`in_<id>_on/off/dis`)를 유지
- 제작 화면에서는 `item_bg`를 사용하지 않음

## 5) 테스트 환경
- 개발 모드(`import.meta.env.DEV`)에서 인벤토리에 샘플 아이템이 자동 주입되어 가방 UI/필터/표시를 빠르게 검증할 수 있음
- 샘플 값은 `src/lib/store.ts`의 `createInitialInventory()`에서 관리

## 6) 확장 포인트
- 조각/흔적 누적 임계치는 데이터 상수로 관리
  - `SOUL_UNLOCK_THRESHOLD`
  - `TRACE_UNLOCK_THRESHOLD`
- 실제 정령 해금/히든 스테이지 입장 판정은 위 상수를 기준으로 연결 가능
