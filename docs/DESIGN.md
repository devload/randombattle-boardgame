# 솔로 모바일 이식 디자인

## 핵심 방침

원작은 3~8인 파티 게임 (여러 테이블 병렬). 우리는 **1인 vs 로봇들**, 모바일 세로 화면, 5~10분 세션.

원작 요소의 이식 우선순위:
- ✅ **유지**: 7라운드 + 결승, 덱 페이즈(드래프트), 매치 페이즈(자동 진행), 벤치 6석 룰, 파워 합산, 효과 키워드 시스템, 로봇 상대
- 🔀 **재해석**: 병렬 매치 → 라운드별 1대1 (내가 이번 라운드 상대 봇과 매치, 다른 봇들끼리는 시뮬레이션)
- ❌ **제거/축소**: 물리 공간 이동, 대진표 페이퍼, 트로피 뒤집기 등의 물리 액션

---

## 씬 흐름 (5씬)

```
┌───────────┐
│ 1. LOBBY  │  ← 시작 화면. 새 토너먼트 시작 / 통계 / 룰
└─────┬─────┘
      ↓
┌───────────┐
│ 2. TOUR   │  ← 토너먼트 진행 상황판. 라운드 번호, 순위, 다음 상대 프리뷰
│  BOARD    │
└─────┬─────┘
      ↓ (라운드 시작)
┌───────────┐
│ 3. DECK   │  ← 카드 드래프트: 5장 중 픽, 리롤, 덱 제거
│   PHASE   │
└─────┬─────┘
      ↓ (내 덱 확정)
┌───────────┐
│ 4. MATCH  │  ← 자동 진행 대전. 애니메이션으로 카드 리빌
│   PHASE   │     플레이어는 관전 (혹은 tap-to-continue)
└─────┬─────┘
      ↓ (승패)
      ├─→ 라운드 <7 → TOUR BOARD로 복귀
      └─→ 라운드 7 후 → FINAL (조건 만족 시) → 
┌───────────┐
│ 5. RESULT │  ← 최종 결과. 팬 총합, 트로피, 리매치
└───────────┘
```

## 씬별 상세 설계

### 1. LOBBY

**요소:**
- 게임 타이틀 (Sagrada처럼 화려하게)
- 메인 CTA: "NEW TOURNAMENT"
- 서브: "STATS · RULES · SETTINGS"
- 최근 결과 요약 (최고 순위, 총 챔피언 횟수)

**Sagrada에서 재활용:** 로비 씬 구조 그대로 (배경 애니메이션만 교체)

### 2. TOURNAMENT BOARD

**요소:**
- 상단: 라운드 인디케이터 (1/7, 2/7, …)
- 중앙: 리더보드 (플레이어 + 로봇 7명, 팬 수 소팅)
- 하단: "이번 라운드 상대: [로봇 이름]" + 상대 성향 힌트
- 다음 라운드 열리는 **레벨 파일** 표시 (A / A+B / A+B+C)
- CTA: "ENTER THE ARENA →"

### 3. DECK PHASE

**요소:**
- 상단: 현재 덱 요약 (아이콘 스트립, 총 카드 수)
- 중앙: **드래프트 카드 5장** (가로 스크롤 또는 3-2 그리드)
- 카드 탭 → 확대 오버레이 (이름, 파워, 효과 텍스트)
- 하단 CTA: "PICK X CARDS" (1 또는 2장), 상단에 "REROLL" 버튼 (1회)
- 다 픽 후: **덱 제거 페이즈** (내 덱 카드들 표시, 원하는 카드 탭해서 제거)
- 완료 → "READY TO FIGHT" 버튼

**UX 원칙:**
- 카드는 항상 크게. 정보 다 안 넣고 아이콘 위주
- 드래그 안 씀 → 탭만
- 리롤은 눈에 잘 띄되 실수 방지 (컨펌 없이는 눌러도 리롤 안 되게 confirmation modal)

### 4. MATCH PHASE

**핵심 UX 문제:** 원작은 물리 카드 리빌 감성이 재미. 모바일에서도 그 감성을 살려야.

**레이아웃:**
```
┌──────────────────┐
│ ROBOT: 🤖 Alpha  │ ← 상대 정보 + 남은 덱 카운트
│ [bench slots x6] │ ← 상대 벤치
├──────────────────┤
│                  │
│  [flag possession│ ← 중앙: 현재 flag possession 카드 (큰 카드)
│      card]       │    옆에 총 파워 강조
│                  │
├──────────────────┤
│ [bench slots x6] │ ← 내 벤치
│ YOU: 👤 (덱 X)   │ ← 나 (남은 덱 카운트)
└──────────────────┘
    [TAP TO CONTINUE]
```

**진행:**
- 각 카드 리빌 시 **1초 슬라이드 인 애니메이션**
- 파워 숫자가 카운트업 애니메이션으로 갱신
- 총 파워가 넘어가면: **flag flip 애니메이션** (기존 flag possession 카드가 벤치로 밀림)
- 관전 모드 (auto play) / 탭투컨티뉴 모드 옵션
- 매치 종료 시 결과 팝업

**애니메이션 라이브러리:** framer-motion (Sagrada에서 검증됨)

### 5. RESULT

**요소:**
- 최종 챔피언 발표 (플레이어 or 로봇)
- 각자 팬 수 + 트로피 개수 랭킹
- CTA: "PLAY AGAIN" / "MAIN MENU"
- 통계 저장 (LocalStorage)

---

## 원작 카드 세트 → 우리 컨텐츠

원작 세트: Basic City + 6 세트 (Castle, Funfair, Outer Space, Film Studio, Haunted House, Shipwreck)

**MVP에서 우리는:**
- **Basic + 2 세트만** 만들기 (총 3 세트 = 3×20~40 카드)
- 세트 테마는 저작권 회피 위해 이름 재해석:
  - 원작 "Kraken" → 우리 "Sea Beast"
  - 원작 "Necromancer" → 우리 "Bone Caller"
  - (자세한 리네이밍은 별도 카드 스프레드시트에서 관리)

**카드 정보 구조 (예):**
```typescript
type Card = {
  id: string
  name: string
  set: 'basic' | 'castle' | 'funfair' | ...
  level: 'S' | 'A' | 'B' | 'C'
  basePower: number
  effects: Effect[]  // 키워드별 효과 정의
  rarity: 'common' | 'rare'
  icon: string  // 임시로 이모지
}

type Effect =
  | { trigger: 'immediate', kind: 'power-bonus', value: number }
  | { trigger: 'during-attack', kind: 'multiply', factor: number }
  | { trigger: 'from-bench', kind: 'ally-buff', target: string }
  | { trigger: 'in-flag', kind: 'reduce-opponent', value: number }
  | { trigger: 'flag-loss', kind: 'gain-fans', value: number }
```

---

## AI 상대 (로봇) 설계

원작 로봇은 그냥 랜덤 셔플된 고정 덱을 리빌만 함. 우리도 처음엔 그렇게.

**MVP:** 로봇마다 프리셋 덱 (레벨 1~5 커브 그대로 재현)

**확장:** 로봇 성격 (aggressive/defensive/high-roll)에 따라 덱 프리셋 차별화

---

## 저작권 관리

- 카드 아트: **자체 제작 이모지/아이콘/픽셀 아트** (원작 Jeff Harvey 일러스트 사용 금지)
- 카드 이름: **모두 리네이밍** (같은 컨셉 유지하되 다른 명명)
- 효과 문구: **재작성** (기능은 동일해도 텍스트는 우리 것)
- 게임 이름: **"Challengers"라는 단어 자체는 상표성 있으므로 피해서 명명** (예: "Arena Draft", "Auto Cup", "Bench Kings" 등)
- README에 Sagrada와 동일한 팬 리메이크 면책 명시

---

## Sagrada에서 재활용 가능한 것

| Sagrada 것 | 재활용 방식 |
|---|---|
| `SceneSwitcher` (개발 모드 디버그) | 그대로 |
| Zustand + Immer 스토어 패턴 | 그대로. `matchStore`, `tournamentStore`, `uiStore` |
| `Sheet` (bottom sheet) 컴포넌트 | 그대로. 카드 상세, 룰, 통계 오버레이 |
| Tailwind + 색 팔레트 | 재활용하되 성당 톤은 버리고 아레나 톤으로 (붉은/황금/네온) |
| framer-motion 애니메이션 훅 패턴 | 그대로 |
| PWA 설정 (manifest, 아이콘) | 아이콘만 교체 |
| Vitest 셋업 | 그대로 |
| Vercel 배포 설정 | 그대로 (`vercel.json` 카피) |
| `usePWA` 훅 | 그대로 |

**재활용 안 하는 것:**
- R3F/Three.js (2D UI만 씀)
- 스테인드글라스 관련 3D 렌더러
