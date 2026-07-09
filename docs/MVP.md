# MVP 스코프

## 목표

**"내가 처음 만나서 재미있게 3게임 이상 하고 싶은" 최소 버전**

- 완전한 1인 토너먼트 (7라운드 + 결승)
- 로봇 상대 4명 이상 (총 5~7명 파티 시뮬레이션)
- 카드 40~60장 (Basic + 2 세트)
- 벤치 룰 완전 구현
- 로컬 저장, 오프라인 실행

---

## MVP에 반드시 들어갈 것

### 도메인 로직 (`src/game/`)

- [ ] `types.ts` — Card, Deck, Match, Trophy, Effect 타입
- [ ] `cards.ts` — 카드 데이터 (Basic + Set A + Set B)
- [ ] `deck.ts` — 셔플, 드로우, 픽 로직 (Level A/B/C 드래프트)
- [ ] `match.ts` — 매치 시뮬레이션 (어택/방어/파워 계산/벤치)
- [ ] `effects.ts` — 효과 키워드별 해석기 (immediate / during-attack / bench / flag-poss / flag-loss)
- [ ] `bench.ts` — 벤치 종류 카운트, 7종 초과 감지
- [ ] `tournament.ts` — 7라운드 진행, 트로피 팬 수 계산, 결승 자격 판정
- [ ] `robots.ts` — 로봇 프리셋 덱 (레벨 1~5)
- [ ] `rng.ts` — Sagrada에서 이식 (mulberry32 + xmur3)

### 도메인 테스트

- [ ] `deck.test.ts` — 드래프트 룰 (5장 드로우, 2/2/1 픽)
- [ ] `match.test.ts` — 파워 합산, flag possession 획득
- [ ] `bench.test.ts` — 6석 룰, 7종 초과 시 패배
- [ ] `effects.test.ts` — 각 키워드 발동 시점

### 상태 (`src/store/`)

- [ ] `tournamentStore.ts` — 라운드, 플레이어들 팬/트로피, 진행 상태
- [ ] `matchStore.ts` — 현재 매치의 덱/벤치/flag possession/애니메이션 큐
- [ ] `uiStore.ts` — 씬 라우팅, 오버레이

### 씬 (`src/scenes/`)

- [ ] `LobbyScene.tsx` — 시작 화면
- [ ] `TournamentBoardScene.tsx` — 라운드 상황판, 리더보드, 다음 상대
- [ ] `DeckPhaseScene.tsx` — 드래프트 UI + 덱 제거
- [ ] `MatchPhaseScene.tsx` — 자동 진행 대전 + 애니메이션
- [ ] `ResultScene.tsx` — 최종 결과

### UI 컴포넌트 (`src/ui/`)

- [ ] `Card.tsx` — 카드 뷰 (small/medium/large 3사이즈)
- [ ] `CardDetailSheet.tsx` — 카드 탭 시 확대
- [ ] `DeckStrip.tsx` — 현재 덱 요약 (아이콘만)
- [ ] `BenchSlots.tsx` — 6석 벤치 슬롯 표시
- [ ] `PowerCounter.tsx` — 애니메이션되는 파워 숫자
- [ ] `TrophyIcon.tsx` — 팬 수 뒷면 있는 트로피
- [ ] `LeaderBoard.tsx` — 플레이어/로봇 순위

### PWA & 배포

- [ ] `manifest.webmanifest` (Sagrada 카피 후 이름/아이콘 교체)
- [ ] 아이콘 세트 (icon-192, icon-512, maskable)
- [ ] `vercel.json` (Sagrada 카피)

---

## MVP에서 뺄 것 (V2 이후)

- ❌ 여러 아트 스타일 세트 (Outer Space, Haunted House 등)
- ❌ Outer Space의 "when picked" 효과 (특수 시점)
- ❌ 계정/클라우드 저장
- ❌ 통계 대시보드 (기본 카운터만)
- ❌ 온보딩 튜토리얼 (룰 문서 링크만)
- ❌ 사운드 (V2에서 추가)
- ❌ 리플레이/공유
- ❌ 커스텀 로봇 성격
- ❌ 애니메이션 사운드 효과
- ❌ 카드 커스텀 아트 (이모지 위주 MVP)

---

## 개발 순서 제안

1. **Vite scaffold + 폴더 구조** (Sagrada 기반)
2. **`types.ts` + `cards.ts`** — 카드 몇 장 만들어보고 데이터 모양 잡기
3. **`match.ts` + 테스트** — 매치 시뮬레이션 로직 (UI 없이 콘솔로 검증)
4. **`MatchPhaseScene`** — 시뮬레이션 결과를 애니메이션으로 재생
5. **`deck.ts` + `DeckPhaseScene`** — 드래프트 UI
6. **`tournament.ts` + `TournamentBoardScene`** — 라운드 진행
7. **`LobbyScene` + PWA** — 진입점 완성
8. **카드 컨텐츠 확장** (30~60장으로)
9. **밸런싱 & 튜닝** (여기가 40% 시간 필요)

---

## 성공 기준 (MVP done)

- [ ] 로비 → 토너먼트 → 7라운드 → 결승 → 결과까지 크래시 없이 완주
- [ ] 매 매치에서 벤치 6석/7종 룰이 정확히 작동
- [ ] 로봇 상대가 최소 3난이도 (레벨 1/3/5 프리셋)
- [ ] 모바일 세로 화면(iPhone 12 mini 이하 포함)에서 손가락으로 조작 가능
- [ ] 오프라인 실행 가능 (PWA)
- [ ] 24개 이상의 단위 테스트 통과
- [ ] Vercel 프리뷰 배포 성공
