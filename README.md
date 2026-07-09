# RandomBattle — Auto-Draft Arena

**보드게임 [Challengers!](https://boardgamegeek.com/boardgame/359970/challengers)의 1인 모바일 팬 리메이크**

사이버펑크 톤의 카드 오토배틀 토너먼트. 7라운드 + 결승, 세션 5~10분, 완전 오프라인(PWA).

---

## 지금 상태 (2026-07-08)

- ✅ 도메인 로직 (셔플/드래프트/매치 시뮬레이션/벤치/효과) — 순수 TS
- ✅ 5개 씬 (Lobby → TournamentBoard → DeckPhase → MatchPhase → Result)
- ✅ 사이버펑크 UI (Orbitron/Rajdhani/Share Tech Mono · 사이언·마젠타 팔레트)
- ✅ 카드 42장 (Basic + CorpOps + Underground 3세트)
- ✅ 5마리 로봇 프리셋 (Tier 1~5)
- ✅ 60+ Vitest 통과

---

## 시작하기

```bash
npm install
npm run dev       # → http://localhost:5173
npm test          # → Vitest 실행
npm run build     # → dist/ 프로덕션 빌드
```

## 목업 (설계 참고)

```
mockups/
├── index.html          # 5개 씬을 iframe으로 나란히
├── card-showcase.html  # 카드 시스템 (S/A/B/C 레벨별)
├── lobby.html
├── tourboard.html
├── deck.html
├── match.html
└── result.html
```

브라우저에서 `mockups/index.html`을 직접 열면 정적 목업 전체 흐름을 볼 수 있습니다.

## 개발 흐름 (콘솔)

도메인 로직만 검증하고 싶다면:

```bash
# 단일 매치 시뮬 (이벤트 로그 콘솔 출력)
npx tsx src/game/__demo__.ts

# 봇 vs 봇 승률 매트릭스 (밸런싱용)
npx tsx src/game/__batch__.ts 200
```

---

## 문서

| 문서 | 내용 |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Claude Code 세션용 프로젝트 컨텍스트 |
| [`docs/RULES.md`](./docs/RULES.md) | 원작 규칙 정리 |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | 솔로 모바일 이식 디자인 |
| [`docs/MVP.md`](./docs/MVP.md) | MVP 스코프 |
| [`docs/TECH.md`](./docs/TECH.md) | 기술 스택 · 구조 |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | M0~M8 마일스톤 체크리스트 |
| [`docs/WORLDBUILDING.md`](./docs/WORLDBUILDING.md) | 세계관 · 톤 · 카드 세트 컨셉 |

---

## 프로젝트 구조

```
randombattle-boardgame/
├── docs/               # 기획 문서
├── mockups/            # 정적 HTML 목업
├── public/             # PWA manifest, favicon
├── src/
│   ├── game/           # 순수 도메인 로직 (types, cards, deck, match, effects, bench, tournament, robots, rng)
│   ├── store/          # Zustand (uiStore, matchStore, tournamentStore)
│   ├── scenes/         # 5개 씬 컴포넌트
│   ├── ui/             # 재사용 UI (Card, BenchSlots, PowerCounter, Sheet, ...)
│   └── hooks/          # usePWA
├── tsconfig.json       # TS strict + erasableSyntaxOnly
├── vite.config.ts
├── tailwind.config.js  # 사이버펑크 팔레트
└── vercel.json
```

---

## 스택

React 19 + Vite 8 + TypeScript strict · Zustand + Immer · Tailwind · framer-motion · Vitest · PWA · Vercel 배포

## 면책

*Challengers!* 의 게임 디자인 저작권은 **Johannes Krenner & Markus Slawitscheck / 1 More Time Games / Z-Man Games**에 있습니다.

본 저장소는 학습 목적의 팬 리메이크이며, 카드 이름·플레이버·아트는 모두 재작성되었고, **어떠한 상업적 이용도 하지 않습니다.** 원작 IP 홀더의 요청 시 즉시 저장소를 비공개 전환합니다.
