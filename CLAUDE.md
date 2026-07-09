# 프로젝트 컨텍스트 (새 Claude 세션용)

## 무엇을 만드는가

**Challengers! (오토배틀 챌린저스)** 보드게임의 **1인 모바일 웹 팬 리메이크**입니다.
Sagrada 프로젝트의 후속 토이 프로젝트로, 같은 스택(React 19 + Vite + PWA)을 재활용합니다.

- 원작: [Challengers!](https://boardgamegeek.com/boardgame/359970/challengers) (Johannes Krenner & Markus Slawitscheck, 1 More Time Games / Z-Man Games, 2022)
- 대상 플랫폼: **모바일 세로 · 터치 온리**
- 세션 길이: 5~10분 (7라운드 + 결승)
- 상업적 이용 없음. IP 요청 시 즉시 비공개.

## 문서 읽는 순서

1. **`docs/RULES.md`** — 원작 규칙 정리 (한글). 게임 메커니즘의 정답지
2. **`docs/DESIGN.md`** — 솔로 모바일 이식 시 어떻게 재해석할지, UX 원칙, 스크린 흐름
3. **`docs/MVP.md`** — 첫 릴리즈에 담을 최소 범위 + 뺄 것들 명세
4. **`docs/TECH.md`** — 기술 스택 · 프로젝트 구조 · Sagrada에서 재활용할 것

원본 룰북 원문은 `docs/original-rulebook.pdf` / `.txt`에 있습니다.

## 개발 원칙 (Sagrada에서 배운 것)

- **도메인 코어를 순수 TypeScript로 분리** (`src/game/`). React·렌더러 의존 X → Vitest로 단위 테스트 쉽게
- **씬 라우팅은 상태 하나(`scene`)로** — React Router 없이 conditional render
- **Zustand + Immer** 조합. Redux 안 씀
- **R3F 안 씀 (이번엔)** — 2D UI 위주. framer-motion으로 카드 애니메이션
- **PWA 유지** — manifest, 아이콘, 오프라인 셸
- **Vercel 배포**. AWS 안 씀 (요금 이슈)

## 아직 결정 안 한 것 (사용자와 논의 필요)

- 폴더/프로젝트 이름 (현재 `randombattle-boardgame` 임시)
- 카드/캐릭터 리네이밍 방향 (원작 그대로 vs 재해석)
- 아트 스타일 (이모지·아이콘 MVP → 후에 커스텀)
- AI 상대(로봇) 난이도 커브

## 시작할 때 첫 질문

새 세션 첫 턴에서는 `docs/` 파일들을 훑어보고, **"어디부터 시작할까요?"**로 사용자에게 옵션 제시하는 게 좋습니다:
- (A) 프로젝트 초기화 (Vite scaffold + 폴더 구조)
- (B) 도메인 코어부터 (rules.ts / cards.ts / match.ts 순수 로직)
- (C) 씬 프로토타입 (Lobby → Deck Phase → Match Phase 3화면 정적 목업)
