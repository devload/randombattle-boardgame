# ROADMAP — MVP 완주까지의 세부 태스크 체크리스트

> 이 문서는 `docs/MVP.md`의 개발 순서(1~9)를 **실행 가능한 체크리스트**로 쪼갠 것입니다.
> 각 마일스톤은 **명확한 완료 조건(Definition of Done)** 이 있고, 다음 마일스톤 진입 전에 검증합니다.

---

## 프로젝트 원칙 (확정)

- **톤**: SF / 사이버펑크
  - 로봇 상대라는 원작 설정과 자연스럽게 붙음
  - 컬러 팔레트: 네온 사이언(#00e5ff) / 마젠타(#ff2bd6) / 다크 배경(#0a0a14) / 강조 옐로(#ffe600)
  - 카드 컨셉: 해커·러너·AI 유닛·바이오 오그멘트·기업 병사 등
  - 아트: MVP는 이모지 + Tailwind 기반 카드 UI. 후에 자체 아이콘/픽셀 아트로 교체
- **카드**: 처음부터 MVP 셋 **Basic + 2 세트 (40~60장)** 전부 만들기
- **레퍼런스**: `github.com/devload/sagrada-online` — **기술 스택·구조만** 참고. 게임 컨셉/컴포넌트는 무관
- **이름**: 폴더는 `randombattle-boardgame` 임시 유지, 최종 프로덕트 이름은 M0에서 확정

---

## Sagrada 실측 재활용 표 (2026-07-08 검증)

로컬 `/Users/devload/sagrada-online`을 훑어서 확인한 실제 파일 기준:

| Sagrada 원본 | 우리 프로젝트 대상 | 수정 필요 | 우선순위 |
|---|---|---|---|
| `package.json` (스크립트/툴링) | `package.json` | R3F/three/rapier/puppeteer 제거, 이름 변경 | M1 |
| `tsconfig*.json` | 그대로 | 없음 | M1 |
| `vite.config.ts` | 그대로 | 없음 | M1 |
| `tailwind.config.js` / `postcss.config.js` | 그대로 | 색 팔레트 팔로우업 | M1 |
| `vercel.json` | 그대로 | 없음 | M1 |
| `src/index.css` | 그대로 | 사이버펑크 팔레트로 후속 교체 | M1 |
| `src/main.tsx` | 그대로 | 없음 | M1 |
| `src/App.tsx` (씬 스위치 패턴) | 씬 이름만 교체 | scene enum 5개로 | M1 |
| `src/hooks/usePWA.ts` | 그대로 | 없음 | M6 |
| `src/game/rng.ts` (35줄, mulberry32 + xmur3) | 그대로 | 없음 | M2 |
| `src/ui/SceneSwitcher.tsx` (개발 디버그) | 씬 리스트 교체 | 씬 목록만 | M1 |
| `src/ui/Sheet.tsx` (bottom sheet) | 그대로 | 없음 | M4 |
| `src/ui/AnimatedNumber.tsx` | 그대로 → `PowerCounter`의 베이스 | 없음 | M3 |
| `src/store/uiStore.ts` 패턴 | 새로 씀 (구조 참고) | scene 상태만 | M1 |
| `src/store/gameStore.ts` 패턴 | `tournamentStore`/`matchStore`로 재작성 | 완전 재작성 | M2~M5 |
| `public/manifest.webmanifest` | 이름/아이콘만 교체 | 있음 | M6 |
| `public/icon-*.png` / `apple-touch-icon.png` | 새로 만듦 | 있음 | M6 |

**제외 (안 씀):**
- `@react-three/*`, `three`, `@react-three/rapier` → 이번엔 2D
- `src/three/` 폴더 전체 → 안 씀
- `src/audio/` → V2에서 사운드 도입 시 참고

---

## Milestone 0 — 킥오프 (예상 0.5일)

**목표**: 코드 진입 전, 방향을 못박고 아트/네이밍 리스크 제거

- [ ] **프로덕트 이름 후보 3개 브레인스토밍** (Challengers 상표 회피, SF 톤)
  - 예: "Neon Draft", "Arena Zero", "RUNNER.exe", "Bench Kings"
- [ ] 폴더/repo 이름은 유지할지 리네임할지 결정
- [ ] `docs/WORLDBUILDING.md` 초안 (2페이지 이내)
  - 세계관 배경 (예: 202X년 기업 아레나 오토배틀 리그)
  - 3개 세트의 컨셉 (Basic City → 예: "Downtown", 세트 A → 예: "Corp Ops", 세트 B → 예: "Underground")
  - 카드 리네이밍 원칙: 원작 카드마다 새 이름 + 새 플레이버 텍스트 매핑 표 (스프레드시트 형태 or MD 표)
- [x] **비주얼 목업 (HTML)** — `mockups/` 폴더에 정적 목업 완료
  - `mockups/design-tokens.css` — 컬러/타이포/컴포넌트 CSS 토큰
  - `mockups/card-showcase.html` — S/A/B/C 4레벨 카드, 벤치, HUD 요소
  - `mockups/lobby.html`, `tourboard.html`, `deck.html`, `match.html`, `result.html` — 5씬
  - `mockups/index.html` — 전체 흐름을 iframe으로 나란히 보기
- [ ] 목업 리뷰 후 카드/씬 스타일 확정 (사용자 피드백 반영)
- [ ] 컬러 팔레트 확정 → Tailwind config에 CSS 변수로 등록할 계획

**DoD**: 이름/톤/팔레트/시각 방향이 문서·목업으로 확정되고, 다음 마일스톤에서 참조 가능한 상태

---

## Milestone 1 — 프로젝트 스캐폴딩 (예상 0.5일)

**목표**: Sagrada에서 뼈대만 뽑아 우리 프로젝트로 이식, 빈 로비 씬이 뜨는 상태

- [ ] `npm create vite@latest . -- --template react-ts` 또는 Sagrada에서 파일 카피 후 정리
- [ ] `package.json` 만들기 (`docs/TECH.md` 참고 구조, R3F 계열 제거 확인)
- [ ] `tsconfig*.json` / `vite.config.ts` / `tailwind.config.js` / `postcss.config.js` / `vercel.json` 카피
- [ ] `src/main.tsx` / `src/index.css` 카피
- [ ] `src/App.tsx` — 씬 스위치 패턴만 남기고 씬 이름 5개로: `lobby | tourboard | deck | match | result`
- [ ] `src/store/uiStore.ts` — scene 상태 하나
- [ ] `src/ui/SceneSwitcher.tsx` 카피 후 씬 리스트 교체 (개발 모드에서 씬 강제 전환)
- [ ] `src/scenes/*` — 5개 씬 모두 빈 컴포넌트로 스켈레톤만
- [ ] `src/hooks/usePWA.ts` 카피
- [ ] `npm run dev` → localhost에서 로비 씬(빈 화면)이 뜨고 SceneSwitcher로 5씬 전환 가능
- [ ] `npm run build` 성공
- [ ] `npm test` (아직 테스트 없음, `--passWithNoTests`)
- [ ] `.gitignore` + `git init` + 초기 커밋

**DoD**: `npm run dev`로 씬 5개 빈 화면을 개발 모드에서 왔다갔다 가능

---

## Milestone 2 — 도메인 코어 A: 카드·덱·매치 로직 (예상 2일)

**목표**: UI 0줄, 테스트 코드만으로 매치 시뮬레이션이 콘솔에서 도는 상태

### 파일 순서

- [ ] `src/game/rng.ts` — Sagrada에서 그대로 카피
- [ ] `src/game/types.ts` — `Card`, `Deck`, `MatchState`, `Effect`, `Trophy`, `Robot` 타입
  - 효과는 **디스크리미네이티드 유니언**, trigger 키워드별 분기
  - 이벤트 로그 타입 `MatchEvent` (리빌/파워증가/깃발획득/벤치이동/매치승리) — UI 재생용
- [ ] `src/game/cards.ts` — **먼저 10장만** (Basic S 카드 8종 + Level A 2종)
  - MVP 셋 전체는 M7에서 확장
  - 카드 데이터는 `readonly` 배열로 export
- [ ] `src/game/deck.ts` — 셔플, 드로우, 픽 규칙
  - `shuffle(deck, rng)`
  - `draft(pile, count, rng)` — 5장 드로우
  - `pickRule(round)` — 라운드별 A/B/C 파일 제한 반환
- [ ] `src/game/effects.ts` — 효과 발동 시점 해석기
  - `applyImmediate(card, state)`
  - `applyDuringAttack(card, state)`
  - `applyFromBench(bench, state)`
  - `applyFlagPossession(card, state)`
  - `applyFlagLoss(card, state)`
- [ ] `src/game/bench.ts` — 벤치 관리
  - `addToBench(bench, cards)` → 같은 이름 스택 처리
  - `isBenchOverflow(bench)` — 7종 감지
- [ ] `src/game/match.ts` — 매치 시뮬레이션 (순수 함수)
  - `simulateMatch(deckA, deckB, seed): MatchResult { winner, events }`
  - **UI 없이도 완전 실행 가능해야 함**
- [ ] `src/game/robots.ts` — 로봇 프리셋 3종 (Level 1/3/5) — 카드 확장은 M7에서

### 테스트 (24개 이상 목표)

- [ ] `deck.test.ts` — 셔플 결정론성(같은 시드=같은 결과), 드로우 카운트, 픽 규칙 (A×2, B×2 or C×1)
- [ ] `bench.test.ts` — 6석 정상, 같은 이름 스택, 7종 시 overflow=true
- [ ] `effects.test.ts` — 각 트리거별 발동 시점 (특히 flag-loss → flag-possession 순서)
- [ ] `match.test.ts` — 파워 부족 시 패배, 벤치 오버플로 시 패배, 결정론성

### 콘솔 검증 스크립트

- [ ] `src/game/__demo__.ts` — `npx tsx src/game/__demo__.ts`로 매치 1회 시뮬 → 이벤트 로그 출력

**DoD**:
- `npm test` 24개+ 통과
- 콘솔 데모 스크립트가 매치 결과와 이벤트 로그를 정상 출력
- **여기서 절대 UI 코드를 만지지 말 것** (분리 원칙)

---

## Milestone 3 — 매치 씬 (예상 2일)

**목표**: M2의 이벤트 로그를 순차 재생하는 씬. 게임 재미의 핵심.

- [ ] `src/store/matchStore.ts` — 현재 매치 상태 + 이벤트 큐 + 재생 인덱스
- [ ] `src/ui/Card.tsx` — small/medium/large 3사이즈
- [ ] `src/ui/BenchSlots.tsx` — 6석 벤치 (양쪽 플레이어)
- [ ] `src/ui/PowerCounter.tsx` — Sagrada `AnimatedNumber` 재활용
- [ ] `src/ui/CardDetailSheet.tsx` — Sagrada `Sheet` 위에서 구현
- [ ] `src/scenes/MatchPhaseScene.tsx`
  - 상단: 로봇 정보 + 벤치 + 남은 덱 카운트
  - 중앙: flag possession 카드 + 총 파워
  - 하단: 내 벤치 + 내 덱 카운트
  - 이벤트 하나씩 재생 (auto play or tap-to-continue 토글)
  - framer-motion으로 카드 슬라이드 인, 파워 카운트업, 깃발 플립
- [ ] 매치 종료 팝업 (승/패 표시)

**DoD**:
- SceneSwitcher로 매치 씬 진입 → 미리 만든 데모 매치가 애니메이션으로 재생됨
- iPhone 12 mini 세로 프리셋에서 레이아웃 안 깨짐

---

## Milestone 4 — 덱 페이즈 씬 (예상 1.5일)

**목표**: 드래프트 → 픽 → 리롤 → 덱 제거 → "준비 완료"

- [ ] `src/ui/DeckStrip.tsx` — 현재 덱 요약
- [ ] `src/scenes/DeckPhaseScene.tsx`
  - 5장 드로우 표시
  - 픽 룰: 라운드별 A×2 / B×2 or C×1
  - 카드 탭 → 상세 시트
  - 리롤 버튼 (컨펌 모달)
  - 픽 완료 후 덱 제거 페이즈
  - "READY TO FIGHT" → 매치 씬으로

**DoD**: SceneSwitcher로 덱 씬 → 드래프트 완주 → 매치 씬으로 매끄럽게 이동

---

## Milestone 5 — 토너먼트 진행 (예상 1.5일)

**목표**: 7라운드 + 결승까지 완주 가능

- [ ] `src/game/tournament.ts` — 라운드 진행, 트로피 팬 수 계산, 결승 자격 판정
- [ ] `src/store/tournamentStore.ts` — 라운드, 플레이어들 팬/트로피
- [ ] `src/ui/TrophyIcon.tsx` — 팬 수 뒷면
- [ ] `src/ui/LeaderBoard.tsx`
- [ ] `src/scenes/TournamentBoardScene.tsx`
  - 라운드 인디케이터, 리더보드, 다음 상대, 열리는 레벨 파일
- [ ] `src/scenes/ResultScene.tsx` — 최종 결과 + "PLAY AGAIN"
- [ ] 통계 LocalStorage 저장 (챔피언 횟수만)

**DoD**: 로비 → 토너먼트보드 → 덱 → 매치 × 7회 → 결승 → 결과 → 로비로 크래시 없이 완주

---

## Milestone 6 — 로비 · PWA · 배포 (예상 1일)

**목표**: 배포 링크로 폰에서 홈스크린 추가하고 오프라인 실행 가능

- [ ] `src/scenes/LobbyScene.tsx` — 타이틀, "NEW TOURNAMENT", "RULES/STATS" 서브
- [ ] `public/manifest.webmanifest` — 이름/색/아이콘 교체
- [ ] 아이콘 세트 (icon-192, icon-512, maskable-512, apple-touch-icon, favicon.svg)
- [ ] `public/manual/*` 필요 시 룰 요약 페이지
- [ ] `vercel.json` 확인
- [ ] Vercel 프리뷰 배포 성공
- [ ] iPhone 12 mini에서 홈스크린 추가 → 오프라인 실행 확인

**DoD**: 사용자가 폰에서 URL 접속 → 홈스크린 추가 → 오프라인에서 1라운드 플레이

---

## Milestone 7 — 카드 컨텐츠 확장 (예상 2일)

**목표**: 카드 40~60장 완성

- [ ] Basic 세트 20장 완성 (원작 매핑 리스트)
- [ ] 세트 A (Downtown or 다른 이름) 15~20장
- [ ] 세트 B (Corp Ops or 다른 이름) 15~20장
- [ ] 각 카드의 효과가 M2의 효과 시스템으로 표현 가능한지 검증
- [ ] 표현 불가한 카드는 리네이밍/재설계 (또는 V2로 이월)
- [ ] 카드 파워 상한 준수 (A≤3, B≤5, C≤10)
- [ ] 로봇 덱 프리셋 재조정 (레벨 1/3/5)

**DoD**: 카드 40장 이상 로드되고, 셔플/드래프트에서 다양성이 확보됨

---

## Milestone 8 — 밸런싱 & QA (예상 3~4일, MVP 시간의 40%)

**목표**: 3게임 이상 하고 싶은 상태

- [ ] 매치 시뮬레이션 자동 배치 (예: 1000회 봇 vs 봇 승률 측정 스크립트)
- [ ] 특정 카드 지배 여부 파악 → 파워/효과 조정
- [ ] 실기 플레이 세션 × 5회, 지루한 라운드 로그
- [ ] 애니메이션 속도 조정 (너무 느리면 답답, 너무 빠르면 감성 실종)
- [ ] iPhone SE 크기까지 터치 타깃 44pt 이상 확인
- [ ] 리팩터: 씬 컴포넌트 300줄 넘는 게 있으면 분리
- [ ] README에 팬 리메이크 면책 문구, 원작자 크레딧

**DoD**: MVP.md의 "성공 기준" 6개 항목 전부 체크

---

## 핵심 리스크 (미리 알아둬야 함)

1. **효과 시스템의 조합 폭발** — 카드 30장 넘어가면 상호작용 테스트가 어려움
   - **대응**: M2에서 효과를 완전히 데이터 기반으로. 하드코딩 금지. 새 카드 = 데이터 한 줄 추가로 끝나야 함
2. **매치 애니메이션 vs 로직 분리** — 섞이면 나중에 못 고침
   - **대응**: M2에서 `simulateMatch()`가 이벤트 로그를 반환, M3에서 씬이 그걸 순차 재생. 시뮬레이션이 씬을 몰라야 함
3. **밸런싱 시간** — MVP.md에 "40% 시간" 명시
   - **대응**: 카드 데이터는 별도 TS 상수 파일, hot reload로 즉시 반영. 자동 시뮬 스크립트를 M8 전에 준비
4. **원작 카드 표현 한계** — 일부 카드는 우리 효과 시스템으로 표현 불가할 수 있음
   - **대응**: M7에서 발견 시 리네이밍/재설계, 안 되면 V2로 이월. MVP는 40장이면 충분
5. **`erasableSyntaxOnly` 준수** — Sagrada tsconfig 그대로. enum·decorator 등 못 씀
   - **대응**: 유니언 타입 + as const로 대체

---

## 마일스톤 간 정지 체크포인트

각 마일스톤 완료 시 아래를 만족해야 다음 진입:

- [ ] 새 마일스톤 진입 전에 이전 DoD를 명시적으로 재확인
- [ ] `npm test` 통과
- [ ] `npm run build` 성공
- [ ] SceneSwitcher로 지금까지 만든 씬이 다 정상 동작

---

## 실제 진행 상황 (2026-07-08 업데이트)

- [x] **M0** — 톤 확정 (사이버펑크), 목업 완성, `docs/WORLDBUILDING.md` 작성
- [x] **M1** — Vite scaffold + Sagrada 재활용 (빌드 통과)
- [x] **M2** — 도메인 코어 완성, `__demo__.ts` 콘솔 검증 통과
- [x] **M3** — Vitest 66개 통과 (초기 목표 24+의 2.75배)
- [x] **M4** — 덱 페이즈 씬 완성, 브라우저 실기 검증
- [x] **M5** — 토너먼트 진행 + 결과 씬 완성
- [x] **M6** — 로비 + PWA manifest + Vercel 설정
- [x] **M7** — 카드 42장 확장 (Basic 14 + CorpOps 11 + Underground 13 + Starter 2), 로봇 5마리 프리셋
- [x] **M8** — 배치 시뮬레이션 스크립트 (`__batch__.ts`) 완성. 실행: `npx tsx src/game/__batch__.ts 200`

## 남은 폴리시 / V2 아이디어

- [ ] 실제 Vercel 배포 & 도메인 연결
- [ ] 카드 상세 시트에 플레이버 텍스트 추가
- [ ] 튜토리얼 온보딩 (첫 실행 시 5장 슬라이드)
- [ ] 사운드 (매치 리빌 클릭, 승리 스팅어)
- [ ] 커스텀 아트 (이모지 → 픽셀 or SVG 아이콘)
- [ ] 결승 라운드 (팬 1·2위) 룰 복원 — 원작 규칙
- [ ] 통계 대시보드 (챔피언 수, 총 매치, 카드별 사용률)
