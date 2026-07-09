# 기술 스택 & 프로젝트 구조

## 스택 (Sagrada와 동일 — 검증됨)

| 영역 | 선택 | 이유 |
|---|---|---|
| Runtime | React 19 + TypeScript 6 strict + Vite 8 | Sagrada에서 안정적 |
| State | Zustand + Immer | Redux 없이 draft mutation, 학습 곡선 낮음 |
| UI | Tailwind CSS + framer-motion | 유틸 클래스 + 물리 애니메이션 |
| 3D | ❌ 안 씀 | 이번엔 2D UI 위주 |
| Test | Vitest | 도메인 코어 순수 함수 커버 |
| Build | `tsc -b && vite build` | 그대로 |
| Lint | oxlint | 그대로 |
| PWA | 정적 manifest + 아이콘 세트 | 서비스워커는 넣지 않음 (오프라인 셸만) |
| 배포 | Vercel (Static Vite 프리셋) | 무료, 빠름, SPA rewrites |

**Sagrada에서 빼는 것:**
- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `three` → 이번 프로젝트 불필요

---

## 프로젝트 구조 제안

```
randombattle-boardgame/     (혹은 새 이름)
├── CLAUDE.md               # 이 프로젝트 컨텍스트
├── README.md               # 공개 README
├── LICENSE                 # MIT
├── docs/
│   ├── RULES.md            # 원작 룰 정리
│   ├── DESIGN.md           # 솔로 모바일 재해석
│   ├── MVP.md              # 스코프
│   ├── TECH.md             # 이 파일
│   └── original-rulebook.pdf / .txt
├── public/
│   ├── manifest.webmanifest
│   ├── icon-*.png
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx             # 씬 라우팅
│   ├── index.css           # Tailwind
│   ├── game/               # 도메인 코어 (pure TS)
│   │   ├── types.ts
│   │   ├── cards.ts
│   │   ├── deck.ts
│   │   ├── match.ts
│   │   ├── effects.ts
│   │   ├── bench.ts
│   │   ├── tournament.ts
│   │   ├── robots.ts
│   │   ├── rng.ts
│   │   └── *.test.ts
│   ├── store/              # Zustand
│   │   ├── tournamentStore.ts
│   │   ├── matchStore.ts
│   │   └── uiStore.ts
│   ├── scenes/
│   │   ├── LobbyScene.tsx
│   │   ├── TournamentBoardScene.tsx
│   │   ├── DeckPhaseScene.tsx
│   │   ├── MatchPhaseScene.tsx
│   │   └── ResultScene.tsx
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── CardDetailSheet.tsx
│   │   ├── DeckStrip.tsx
│   │   ├── BenchSlots.tsx
│   │   ├── PowerCounter.tsx
│   │   ├── TrophyIcon.tsx
│   │   ├── LeaderBoard.tsx
│   │   ├── Sheet.tsx           # Sagrada에서 카피
│   │   └── SceneSwitcher.tsx   # Sagrada에서 카피
│   └── hooks/
│       └── usePWA.ts           # Sagrada에서 카피
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── .gitignore
```

---

## Sagrada에서 그대로 복사할 파일 목록

새 세션 첫 스텝에서 편하게 복사할 수 있게 정리:

| Sagrada 경로 | 복사 대상 | 수정 필요 |
|---|---|---|
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | 그대로 | 없음 |
| `vite.config.ts` | 그대로 | 없음 |
| `tailwind.config.js` | 그대로 | 색 팔레트만 이후에 |
| `postcss.config.js` | 그대로 | 없음 |
| `vercel.json` | 그대로 | 없음 |
| `.gitignore` | 그대로 | `.partykit`은 제거 가능 |
| `src/index.css` | 그대로 | 이후 팔레트 |
| `src/main.tsx` | 그대로 | 없음 |
| `src/ui/Sheet.tsx` | 그대로 | 없음 |
| `src/ui/SceneSwitcher.tsx` | 그대로 | 씬 리스트만 교체 |
| `src/hooks/usePWA.ts` | 그대로 | 없음 |
| `src/game/rng.ts` | 그대로 | 없음 |
| `public/manifest.webmanifest` | 이름/아이콘만 교체 | 있음 |

**참고 저장소:** https://github.com/devload/sagrada-online

---

## 초기 package.json (참고)

```json
{
  "name": "randombattle-boardgame",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "framer-motion": "^12.42.2",
    "immer": "^11.1.11",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "autoprefixer": "^10.5.2",
    "oxlint": "^1.71.0",
    "postcss": "^8.5.16",
    "tailwindcss": "^3.4.15",
    "typescript": "~6.0.2",
    "vite": "^8.1.1",
    "vitest": "^4.1.10"
  }
}
```

---

## 개발 워크플로우

1. `npm install`
2. `npm run dev` → localhost에서 개발
3. 도메인 로직 짤 때는 `npm test -- --watch`로 TDD
4. UI 확인은 크롬 dev tools의 iPhone 12 mini 프리셋
5. `npm run build` → 로컬 빌드 확인
6. `vercel --prod --yes` → 배포

---

## 유의사항

- **`tsc --strict` 완전 준수** (Sagrada와 동일)
- **`erasableSyntaxOnly` 유지** (Sagrada의 tsconfig 상속)
- **테스트 없이 도메인 코어 커밋 금지**
- **씬 컴포넌트는 300줄 넘으면 분리** (Sagrada GameScene 400줄 되어 유지보수 힘들었음)
- **React Router 도입 금지** — `scene` 상태 하나로 충분함이 Sagrada에서 검증됨
