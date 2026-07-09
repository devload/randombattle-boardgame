import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const KEY = 'rb.onboarded.v7'

export function openTutorial() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('rb:openTutorial'))
}

/* ============================================================
   Visual atoms
   ============================================================ */

function MiniCard({
  level, icon, power, name, highlight = false, dim = false, small = false, banner,
}: {
  level: 'S' | 'A' | 'B' | 'C'
  icon: string
  power: number | string
  name: string
  highlight?: boolean
  dim?: boolean
  small?: boolean
  banner?: string
}) {
  const border =
    level === 'S' ? 'border-lvl-s' :
    level === 'A' ? 'border-lvl-a' :
    level === 'B' ? 'border-lvl-b' : 'border-lvl-c'
  const text =
    level === 'S' ? 'text-lvl-s' :
    level === 'A' ? 'text-lvl-a' :
    level === 'B' ? 'text-lvl-b' : 'text-lvl-c'
  const size = small ? 'w-14 h-20 p-1' : 'w-[70px] h-[100px] p-1'
  return (
    <div className={`relative ${size} rounded border ${border}
                     bg-gradient-to-b from-arena-panel2 to-arena-panel
                     flex flex-col items-center
                     ${highlight ? 'ring-2 ring-neon-yellow ring-offset-2 ring-offset-arena-void' : ''}
                     ${dim ? 'opacity-40' : ''}`}>
      {banner && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10
                        bg-neon-yellow text-arena-void
                        font-display font-black text-[9px] tracking-widest
                        px-1.5 py-0.5 rounded-sm whitespace-nowrap">
          {banner}
        </div>
      )}
      <div className={`absolute top-0.5 right-1 text-[8px] font-mono px-1 border ${border} ${text} rounded-sm`}>
        {level}
      </div>
      <div className={`${small ? 'text-lg' : 'text-2xl'} leading-none mt-1`}>{icon}</div>
      <div className={`font-display font-black ${small ? 'text-base' : 'text-lg'} text-white leading-none mt-0.5`}
           style={{ textShadow: '0 0 6px currentColor' }}>
        {power}
      </div>
      <div className={`font-display font-bold ${small ? 'text-[7px]' : 'text-[8px]'} text-white mt-auto pt-1 border-t border-arena-lineDim w-full text-center tracking-wider truncate`}>
        {name}
      </div>
    </div>
  )
}

function BenchStrip({ items, warn = false }: {
  items: ({ icon: string; count?: number; level: 'S'|'A'|'B'|'C' } | null)[]
  warn?: boolean
}) {
  return (
    <div className={`grid grid-cols-6 gap-1 p-1.5 rounded border ${warn ? 'border-neon-red bg-neon-red/5' : 'border-dashed border-arena-lineDim bg-black/40'} max-w-[280px] mx-auto`}
         style={warn ? { boxShadow: '0 0 12px rgba(255,51,85,0.3)' } : undefined}>
      {Array.from({ length: 6 }, (_, i) => items[i] ?? null).map((f, i) => f ? (
        <div key={i} className={`relative aspect-[2/3] border rounded-sm bg-gradient-to-b from-arena-panel2 to-arena-panel flex items-center justify-center text-base
          ${f.level === 'S' ? 'border-lvl-s' : f.level === 'A' ? 'border-lvl-a' : f.level === 'B' ? 'border-lvl-b' : 'border-lvl-c'}`}>
          {f.icon}
          {f.count && f.count > 1 && (
            <div className="absolute bottom-0.5 right-0.5 font-mono text-[8px] text-neon-yellow"
                 style={{ textShadow: '0 0 4px rgba(255,230,0,0.8)' }}>×{f.count}</div>
          )}
        </div>
      ) : (
        <div key={i} className="aspect-[2/3] border border-dashed border-arena-lineDim/60 rounded-sm flex items-center justify-center font-mono text-[8px] text-arena-textMuted">·</div>
      ))}
    </div>
  )
}

function Callout({ tone, children }: { tone: 'good' | 'bad' | 'info'; children: React.ReactNode }) {
  const style =
    tone === 'good' ? 'border-neon-green bg-neon-green/10 text-neon-green' :
    tone === 'bad' ? 'border-neon-red bg-neon-red/10 text-neon-red' :
    'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
  const icon = tone === 'good' ? '✓' : tone === 'bad' ? '✕' : '💡'
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded font-display font-bold text-sm ${style}`}>
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center gap-2 flex-wrap">{children}</div>
}

/* ============================================================
   Slides
   ============================================================ */

// 01 · Welcome
const S01 = () => (
  <div className="text-center">
    <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,43,214,0.5)]">👋</div>
    <div className="font-display font-black text-3xl tracking-wider text-holo">안녕하세요, 러너!</div>
    <div className="font-body text-base text-white/85 mt-4 max-w-xs mx-auto leading-relaxed">
      당신은 사이버 도시의 <span className="text-neon-cyan font-bold">오토배틀 선수</span>입니다.
      챔피언이 되기 위해 첫 대회에 나갑니다.
    </div>
  </div>
)

// 02 · Fans = final score
const S02 = () => (
  <div className="text-center">
    <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,230,0,0.5)]">⭐</div>
    <div className="font-display font-black text-2xl text-neon-yellow"
         style={{ textShadow: '0 0 12px rgba(255,230,0,0.6)' }}>팬 (FANS)</div>
    <div className="font-body text-base text-white/85 mt-3 max-w-xs mx-auto">
      팬은 이 게임의 <span className="text-neon-yellow font-bold">점수</span>예요.
      팬을 가장 많이 모은 사람이 <span className="text-neon-cyan font-bold">챔피언</span>이 됩니다.
    </div>
    <div className="font-mono text-[11px] text-arena-textDim mt-3">
      Q. 팬은 어떻게 모으나? → 다음 슬라이드에서
    </div>
  </div>
)

// 03 · Trophy = fan container
const S03 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="font-display font-black text-lg text-white mb-1">
      팬을 얻는 방법 = <span className="text-neon-yellow">트로피</span>
    </div>
    <div className="w-full max-w-xs p-3 border border-arena-lineDim rounded bg-black/40">
      <div className="flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,230,0,0.5)]">🏆</div>
          <div className="font-mono text-[9px] text-arena-textDim mt-1">트로피</div>
        </div>
        <div className="text-neon-cyan text-2xl">=</div>
        <div className="text-center">
          <div className="font-display font-black text-3xl text-neon-yellow"
               style={{ textShadow: '0 0 12px rgba(255,230,0,0.6)' }}>N⭐</div>
          <div className="font-mono text-[9px] text-arena-textDim mt-1">팬 N개</div>
        </div>
      </div>
      <div className="font-mono text-[10px] text-neon-cyan tracking-widest mt-3 mb-1">
        // 라운드별 트로피 팬 수
      </div>
      <div className="font-body text-xs text-white/85 text-left space-y-0.5">
        <div>R1 트로피 → <span className="text-neon-yellow font-bold">2팬</span></div>
        <div>R2 트로피 → <span className="text-neon-yellow font-bold">3팬</span></div>
        <div className="opacity-60">...</div>
        <div>R7 트로피 → <span className="text-neon-yellow font-bold">8팬</span> (가장 큼)</div>
      </div>
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      매치 이기면 <span className="text-neon-cyan font-bold">트로피 획득</span>.
      트로피에 붙어있는 팬만큼 내 점수가 올라요.
    </div>
    <Callout tone="info">후반 라운드일수록 트로피가 값짐</Callout>
  </div>
)

// 03b · Also fans from cards
const S03b = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-5xl">🎴</div>
    <div className="font-display font-black text-lg text-white">
      카드로도 팬을 얻어요
    </div>
    <div className="w-full max-w-xs p-3 border border-neon-magenta bg-neon-magenta/5 rounded">
      <div className="flex items-center gap-2 justify-center mb-2">
        <MiniCard level="C" icon="👹" power={8} name="DAEMON" small />
        <div className="text-neon-cyan text-xl">→</div>
        <div className="text-center">
          <div className="font-display font-black text-2xl text-neon-yellow"
               style={{ textShadow: '0 0 8px rgba(255,230,0,0.6)' }}>+3⭐</div>
          <div className="font-mono text-[9px] text-arena-textDim">뺏길 때</div>
        </div>
      </div>
      <div className="font-body text-[11px] text-white/85">
        <span className="font-mono text-[10px] px-1 py-0.5 border border-neon-red text-neon-red rounded-sm">깃발 뺏김</span> 능력이 있는 카드는
        <span className="font-bold"> 뺏겨도 팬을 줘요</span>.
      </div>
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      결국 <span className="text-neon-yellow font-bold">최종 팬</span> = <br/>
      트로피 팬 총합 + 카드 효과 팬
    </div>
  </div>
)

// 04 · Match = 1v1 bot
const S04 = () => (
  <div className="text-center">
    <Row>
      <div className="text-5xl">👤</div>
      <div className="font-display font-black text-4xl text-neon-magenta"
           style={{ textShadow: '0 0 12px rgba(255,43,214,0.55)' }}>VS</div>
      <div className="text-5xl">🤖</div>
    </Row>
    <div className="font-display font-black text-xl text-white mt-4">매치 = 봇과 1대1</div>
    <div className="font-body text-sm text-white/80 mt-2 max-w-xs mx-auto">
      대회에는 <span className="text-neon-cyan font-bold">7번의 매치</span>가 있어요.
      매치마다 다른 봇과 붙습니다.
    </div>
  </div>
)

// 05 · Card = my unit
const S05 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <MiniCard level="A" icon="🥷" power={3} name="GHOST" />
    <div className="font-display font-black text-xl text-white">
      카드 = 내 전투 유닛
    </div>
    <div className="font-body text-sm text-white/80 max-w-xs">
      큰 숫자는 <span className="text-neon-cyan font-bold">기본 파워</span>.
      클수록 유리해요.
    </div>
  </div>
)

// 05b · Base power + bonus = actual power
const S05b = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="font-display font-black text-lg text-white">
      실제 파워 = 기본 + 옵션
    </div>
    <div className="w-full max-w-xs p-3 border border-neon-cyan bg-neon-cyan/5 rounded">
      <div className="flex items-center justify-center gap-2 mb-2">
        <MiniCard level="A" icon="💻" power={1} name="KIDDIE" small />
        <div className="text-2xl text-neon-cyan">+</div>
        <div className="text-center">
          <span className="font-mono text-[10px] px-1.5 py-0.5 border border-neon-yellow text-neon-yellow rounded-sm">즉시</span>
          <div className="font-display font-black text-lg text-neon-yellow mt-0.5">+2</div>
        </div>
        <div className="text-2xl text-neon-cyan">=</div>
        <div className="text-center">
          <div className="font-display font-black text-3xl text-neon-cyan"
               style={{ textShadow: '0 0 8px rgba(0,229,255,0.55)' }}>3</div>
          <div className="font-mono text-[9px] text-arena-textDim">실제 파워</div>
        </div>
      </div>
      <div className="font-body text-[11px] text-white/85 text-left mt-2 pt-2 border-t border-arena-lineDim">
        SCRIPT KIDDIE는 <span className="text-neon-cyan font-bold">기본 1</span>이지만
        <span className="text-neon-yellow"> 즉시 +2</span> 옵션이 있어 <span className="font-bold">실전 파워 3</span>
      </div>
    </div>
    <Callout tone="info">카드 아래 옵션 텍스트를 꼭 확인하세요</Callout>
  </div>
)

// 06 · Levels (등급, 라운드 진행 시 파일이 열림)
const S06 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <Row>
      <MiniCard level="S" icon="👤" power={1} name="스타터" small />
      <MiniCard level="A" icon="🥷" power={3} name="A" small />
      <MiniCard level="B" icon="🤖" power={5} name="B" small />
      <MiniCard level="C" icon="👹" power={8} name="C" small />
    </Row>
    <div className="font-display font-black text-lg text-white">
      레벨 = 카드의 <span className="text-neon-cyan">등급</span>
    </div>
    <Callout tone="bad">"레벨업" 개념은 없어요 (카드는 그대로)</Callout>
    <div className="w-full max-w-xs p-3 border border-arena-lineDim rounded bg-black/40 space-y-1 text-left">
      <div className="font-mono text-[10px] text-neon-cyan tracking-widest mb-1">
        // 라운드마다 파일이 열립니다
      </div>
      <div className="font-body text-xs text-white/85 space-y-0.5">
        <div>· <span className="text-lvl-s font-bold">S</span> — 시작 덱 (뽑을 수 없음)</div>
        <div>· <span className="text-lvl-a font-bold">A</span> — R1부터 뽑을 수 있음</div>
        <div>· <span className="text-lvl-b font-bold">B</span> — R2부터 열림</div>
        <div>· <span className="text-lvl-c font-bold">C</span> — R5부터 열림</div>
      </div>
    </div>
  </div>
)

// 07 · How match plays (auto + random shuffle)
const S07 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-6xl">🎲</div>
    <div className="font-display font-black text-xl text-white">매치는 자동 진행</div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      매치 시작 시 <span className="text-neon-magenta font-bold">덱이 완전히 랜덤 셔플</span>됩니다.
    </div>
    <div className="w-full max-w-xs p-3 border border-neon-magenta bg-neon-magenta/5 rounded">
      <div className="font-mono text-[10px] text-neon-magenta tracking-widest mb-1">// 오토배틀 감성</div>
      <div className="font-body text-xs text-white/85 text-left space-y-1">
        <div>· 어떤 카드가 <span className="font-bold">먼저 나올지 모름</span></div>
        <div>· 순서 <span className="font-bold">조작 불가</span></div>
        <div>· 플레이어는 <span className="font-bold">관전</span> (또는 TAP 모드)</div>
      </div>
    </div>
    <div className="font-body text-xs text-white/70 max-w-xs">
      랜덤이니까 <span className="text-neon-yellow font-bold">덱 구성</span>이 승부를 좌우해요.
    </div>
  </div>
)

// 08 · Flag possession
const S08 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="relative">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl"
           style={{ filter: 'drop-shadow(0 0 8px rgba(255,230,0,0.6))' }}>🚩</div>
      <MiniCard level="B" icon="🤖" power={5} name="SYNTH" highlight />
    </div>
    <div className="font-display font-black text-xl text-white mt-2">
      먼저 낸 카드가 <span className="text-neon-yellow">깃발</span>을 받아요
    </div>
    <div className="font-body text-sm text-white/80 max-w-xs">
      상대는 이 카드의 <span className="font-bold">파워를 넘어야</span> 뺏을 수 있어요.
    </div>
  </div>
)

// 09 · Reveal sequence: keep revealing until you breach
const S09 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="font-display font-black text-lg text-white">
      깃발 파워를 <span className="text-neon-yellow">넘을 때까지</span> 한 장씩!
    </div>
    <div className="w-full max-w-xs p-3 border border-arena-lineDim rounded bg-black/40 space-y-2">
      <div className="font-mono text-[10px] text-neon-red mb-1">
        상대 깃발 파워 = <span className="text-3xl font-display text-neon-red font-black align-middle"
                              style={{ textShadow: '0 0 6px rgba(255,51,85,0.55)' }}>7</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MiniCard level="S" icon="👤" power={1} name="1장" small dim />
          <span className="font-mono text-[11px] text-arena-textDim">파워 1 &lt; 7 · 계속</span>
        </div>
        <div className="flex items-center gap-2">
          <MiniCard level="A" icon="💊" power={2} name="2장" small dim />
          <span className="font-mono text-[11px] text-arena-textDim">누적 3 &lt; 7 · 계속</span>
        </div>
        <div className="flex items-center gap-2">
          <MiniCard level="B" icon="⚡" power={5} name="3장" small highlight />
          <span className="font-mono text-[11px] text-neon-yellow font-bold"
                style={{ textShadow: '0 0 4px rgba(255,230,0,0.5)' }}>누적 8 ≥ 7 · 뺏김!</span>
        </div>
      </div>
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      파워가 <span className="font-bold">넘어서는 순간</span> 리빌 중단.
      약한 카드부터 나오면 <span className="text-neon-red font-bold">여러 장 소진</span>돼요.
    </div>
  </div>
)

// 09b · Flag power is CUMULATIVE (all revealed cards stack)
const S09b = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="relative">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl"
           style={{ filter: 'drop-shadow(0 0 8px rgba(255,230,0,0.6))' }}>🚩</div>
      <div className="flex gap-1">
        <MiniCard level="A" icon="🥷" power={3} name="GHOST" small />
        <MiniCard level="A" icon="💊" power={2} name="STIM" small />
        <MiniCard level="B" icon="⚡" power={5} name="OVER" small highlight />
      </div>
    </div>
    <div className="font-display font-black text-lg text-neon-yellow"
         style={{ textShadow: '0 0 8px rgba(255,230,0,0.6)' }}>
      깃발 파워 = 3 + 2 + 5 = <span className="text-2xl">10</span>
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      깃발 뺏을 때 <span className="font-bold">여러 장 리빌하면 그 카드들이 모두 새 깃발</span>이 됩니다.
      상대는 <span className="text-neon-red font-bold">전체 합산 파워</span>를 넘어야 뺏을 수 있어요.
    </div>
    <Callout tone="info">많이 쌓을수록 깃발이 강해짐 (하지만 내 덱은 빨리 소진)</Callout>
  </div>
)

// 10 · Loser puts cards on their bench
const S10 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <BenchStrip items={[
      { icon: '🤖', level: 'B' },
      { icon: '🥷', level: 'A' },
      null, null, null, null,
    ]} />
    <div className="font-display font-black text-lg text-white mt-1">
      뺏긴 카드는 <span className="text-neon-magenta">벤치</span>로 밀립니다
    </div>
    <div className="font-body text-sm text-white/80 max-w-xs">
      깃발을 <span className="text-neon-red font-bold">잃은 사람</span>이
      뺏긴 카드들을 자기 벤치(6칸)에 놓습니다.
    </div>
  </div>
)

// 11 · ★ Same name = same slot (KEY MECHANIC!)
const S11 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-4xl">✨</div>
    <div className="font-display font-black text-2xl text-neon-yellow"
         style={{ textShadow: '0 0 12px rgba(255,230,0,0.7)' }}>
      핵심! 같은 이름 = 한 칸
    </div>
    <BenchStrip items={[
      { icon: '👤', count: 3, level: 'S' },
      { icon: '🥷', count: 2, level: 'A' },
      null, null, null, null,
    ]} />
    <div className="font-body text-sm text-white/85 max-w-xs">
      벤치에 <span className="font-bold">같은 이름</span> 카드가 오면 <span className="text-neon-yellow font-bold">한 칸에 쌓여요</span>.
      위 예시는 5장인데 <span className="text-neon-yellow font-bold">2칸만</span> 사용.
    </div>
  </div>
)

// 12 · Bench 7 = defeat
const S12 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <BenchStrip warn items={[
      { icon: '👤', level: 'S' },
      { icon: '🥷', level: 'A' },
      { icon: '🤖', level: 'B' },
      { icon: '💼', level: 'A' },
      { icon: '❄️', level: 'C' },
      { icon: '💊', level: 'A' },
    ]} />
    <div className="text-4xl">💥</div>
    <div className="font-display font-black text-lg text-neon-red"
         style={{ textShadow: '0 0 8px rgba(255,51,85,0.55)' }}>
      벤치 6종 = 매우 위험!
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      벤치에 <span className="font-bold">서로 다른 이름 카드 7종</span>이 되는 순간 매치 패배.
    </div>
  </div>
)

// 13 · ★ Bad vs Good deck scenario
const S13 = () => (
  <div className="text-center flex flex-col items-center gap-4">
    <div className="font-display font-black text-lg text-white">
      그래서 어떤 덱이 유리할까?
    </div>

    <div className="flex flex-col gap-3 w-full max-w-sm">
      {/* Bad */}
      <div className="p-3 border border-neon-red bg-neon-red/5 rounded">
        <div className="flex items-center gap-2 mb-2">
          <div className="font-display font-bold text-neon-red text-sm">✕ 이런 덱은 위험</div>
        </div>
        <BenchStrip warn items={[
          { icon: '🥷', level: 'A' },
          { icon: '💊', level: 'A' },
          { icon: '🗡️', level: 'A' },
          { icon: '🔫', level: 'A' },
          { icon: '💼', level: 'A' },
          { icon: '💨', level: 'A' },
        ]} />
        <div className="font-body text-[11px] text-white/80 mt-2">
          이름 다 다른 6장 → <span className="text-neon-red font-bold">다음 카드가 7종째 = 패배</span>
        </div>
      </div>

      {/* Good */}
      <div className="p-3 border border-neon-green bg-neon-green/5 rounded">
        <div className="flex items-center gap-2 mb-2">
          <div className="font-display font-bold text-neon-green text-sm">✓ 이런 덱은 안전</div>
        </div>
        <BenchStrip items={[
          { icon: '🥷', count: 3, level: 'A' },
          { icon: '💊', count: 2, level: 'A' },
          null, null, null, null,
        ]} />
        <div className="font-body text-[11px] text-white/80 mt-2">
          같은 이름끼리 스택 → <span className="text-neon-green font-bold">벤치 4칸 남음 = 여유</span>
        </div>
      </div>
    </div>
  </div>
)

// 14 · ★ Draft strategy: pick same name
const S14 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-5xl">🎯</div>
    <div className="font-display font-black text-xl text-neon-cyan">
      카드 뽑는 요령
    </div>
    <div className="flex gap-2 items-end justify-center">
      <MiniCard level="A" icon="🥷" power={3} name="GHOST" small highlight banner="이미 있음!" />
      <MiniCard level="A" icon="🥷" power={3} name="GHOST" small highlight />
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      드래프트 화면에서 <span className="text-neon-yellow font-bold">"덱에 N장"</span> 뱃지가 뜨면
      이미 갖고 있는 카드예요. <span className="font-bold">같이 뽑으면 벤치에서 스택</span> = 유리!
    </div>
  </div>
)

// 15 · ★ Bench synergy (from-bench)
const S15 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-5xl">🔗</div>
    <div className="font-display font-black text-xl text-white">
      벤치 시너지도 있어요
    </div>
    <div className="p-3 border border-lvl-b bg-lvl-b/5 rounded max-w-xs">
      <div className="flex items-center gap-3 mb-2">
        <MiniCard level="B" icon="🤖" power={4} name="SYNTH" small />
        <div className="text-left">
          <div className="font-mono text-[10px] text-lvl-b">벤치</div>
          <div className="font-body text-[11px] text-white/85">
            다른 SYNTH 1명당 파워 +1
          </div>
        </div>
      </div>
      <div className="font-body text-[11px] text-white/70">
        SYNTH 3장 벤치 → 서로 +2 파워씩 부스트!
      </div>
    </div>
    <div className="font-body text-xs text-white/70 max-w-xs">
      <span className="text-neon-yellow font-bold">"시너지!" 뱃지</span> 카드는
      기존 덱과 콤보가 있다는 뜻이에요.
    </div>
  </div>
)

// 15b · No "loadout" — full deck fights automatically
const S15b = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-5xl">🃏</div>
    <div className="font-display font-black text-lg text-white">
      "골라서 나갈 수 있나요?" 아니요
    </div>
    <div className="p-3 border border-neon-cyan bg-neon-cyan/5 rounded max-w-xs">
      <div className="font-mono text-[11px] text-neon-cyan tracking-widest mb-2">
        내 덱 전체가 자동 참여
      </div>
      <ul className="font-body text-xs text-white/85 text-left leading-relaxed space-y-1">
        <li>· 시작 카드 <span className="text-neon-yellow font-bold">6장</span></li>
        <li>· 매 라운드 <span className="text-neon-yellow font-bold">2~3장</span> 추가</li>
        <li>· R7까지 최대 <span className="text-neon-yellow font-bold">약 27장</span></li>
        <li>· 매치마다 <span className="font-bold">전체 덱이 셔플</span>돼 자동 리빌</li>
      </ul>
    </div>
    <div className="font-body text-xs text-white/70 max-w-xs">
      약한 스타터 카드가 많으면 방해돼요. <span className="text-neon-magenta font-bold">덱 정리</span> 단계에서 뺄 수 있어요.
    </div>
  </div>
)

// 15c · Card codex
const S15c = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="text-5xl">🎴</div>
    <div className="font-display font-black text-lg text-white">
      전체 카드는 <span className="text-neon-magenta">도감</span>에서
    </div>
    <div className="flex gap-1.5">
      <MiniCard level="A" icon="🥷" power={3} name="A" small />
      <MiniCard level="B" icon="🤖" power={5} name="B" small />
      <MiniCard level="C" icon="👹" power={8} name="C" small />
    </div>
    <div className="font-body text-sm text-white/85 max-w-xs">
      게임에는 총 <span className="text-neon-cyan font-bold">42장</span>의 카드가 있어요.
      로비의 <span className="text-neon-magenta font-bold">🎴 카드 도감</span> 버튼으로 언제든 전체를 볼 수 있습니다.
    </div>
  </div>
)

// 16 · Draft flow — 뽑기 vs 픽
const S16 = () => (
  <div className="text-center flex flex-col items-center gap-3">
    <div className="font-display font-black text-lg text-white mb-1">
      "뽑기" vs "픽"
    </div>
    <div className="w-full max-w-xs p-3 border border-arena-lineDim rounded bg-black/40 space-y-3">
      <div>
        <div className="font-mono text-[10px] text-neon-cyan mb-1">STEP 1 · 뽑기</div>
        <div className="flex gap-1 justify-center">
          {['🥷','💊','🗡️','🔫','💨'].map((icon, i) => (
            <MiniCard key={i} level="A" icon={icon} power={2} name="" small />
          ))}
        </div>
        <div className="font-body text-[11px] text-white/75 mt-1">
          한 파일에서 무작위 <span className="font-bold">5장</span> 뽑힘
        </div>
      </div>
      <div className="text-2xl text-neon-cyan">↓</div>
      <div>
        <div className="font-mono text-[10px] text-neon-yellow mb-1">STEP 2 · 픽</div>
        <div className="flex gap-1 justify-center">
          <MiniCard level="A" icon="🥷" power={3} name="" small highlight />
          <MiniCard level="A" icon="🗡️" power={3} name="" small highlight />
        </div>
        <div className="font-body text-[11px] text-white/75 mt-1">
          그중 <span className="font-bold">정해진 개수</span>만 골라 내 덱에 추가
        </div>
      </div>
    </div>
    <div className="font-body text-xs text-white/70 max-w-xs">
      R1은 A파일에서 <span className="font-bold">1번</span>. R2+는 A + (B 또는 C) <span className="font-bold">2번</span> 뽑아요.
    </div>
  </div>
)

// 17 · Card effects
const S17 = () => (
  <div className="text-center flex flex-col items-center gap-2">
    <div className="font-display font-black text-lg text-white mb-1">
      카드마다 <span className="text-neon-cyan">특수 능력</span>
    </div>
    <div className="flex flex-col gap-1.5 max-w-[300px] w-full">
      <div className="flex items-center gap-2 p-2 border border-arena-lineDim rounded bg-black/40 text-left">
        <span className="font-mono text-[10px] px-2 py-0.5 border border-neon-yellow text-neon-yellow rounded-sm shrink-0">즉시</span>
        <span className="font-body text-xs text-white/85">뒤집자마자 파워 +1</span>
      </div>
      <div className="flex items-center gap-2 p-2 border border-arena-lineDim rounded bg-black/40 text-left">
        <span className="font-mono text-[10px] px-2 py-0.5 border border-lvl-a text-lvl-a rounded-sm shrink-0">벤치</span>
        <span className="font-body text-xs text-white/85">같은 이름 벤치에 있으면 파워 +1</span>
      </div>
      <div className="flex items-center gap-2 p-2 border border-arena-lineDim rounded bg-black/40 text-left">
        <span className="font-mono text-[10px] px-2 py-0.5 border border-neon-red text-neon-red rounded-sm shrink-0">깃발 뺏김</span>
        <span className="font-body text-xs text-white/85">깃발 뺏겨도 팬 +3 획득 (지는 매치에서도 이득)</span>
      </div>
    </div>
    <Callout tone="info">덱 페이즈에서 카드 탭 → 상세 힌트 확인</Callout>
  </div>
)

// 18 · Champion
const S18 = () => (
  <div className="text-center">
    <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,230,0,0.7)]">👑</div>
    <div className="font-display font-black text-3xl text-holo tracking-wider mb-3">챔피언</div>
    <div className="font-body text-base text-white/85 max-w-xs mx-auto">
      7라운드 후 <span className="text-neon-yellow font-bold">팬 1·2위</span>가 결승을 치릅니다.
      결승 승자가 <span className="text-neon-cyan font-bold">챔피언</span>.
    </div>
    <div className="text-[11px] font-mono text-arena-textDim mt-4">
      팬 격차 11 이상 벌어지면 즉시 우승!
    </div>
  </div>
)

// 19 · Ready
const S19 = () => (
  <div className="text-center">
    <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">🎮</div>
    <div className="font-display font-black text-3xl text-holo">준비 완료!</div>
    <div className="font-body text-base text-white/85 mt-3 max-w-xs mx-auto">
      이제 <span className="text-neon-cyan font-bold">NEW TOURNAMENT</span>를 눌러 첫 대회를 시작하세요.
    </div>
    <div className="mt-4 flex flex-col gap-1 items-center">
      <Callout tone="good">같은 이름 카드 여러 장 뽑기 = 유리</Callout>
      <Callout tone="info">"내 덱 보기"로 지금 뭐 있는지 확인</Callout>
    </div>
  </div>
)

type Slide = {
  eyebrow: string
  key?: boolean  // 중요 슬라이드 마킹
  render: () => React.ReactElement
}

const SLIDES: Slide[] = [
  { eyebrow: '// 01 · 인사', render: S01 },
  { eyebrow: '// 02 · 팬 = 점수', render: S02 },
  { eyebrow: '// 03 · 팬 얻는 법 ★', key: true, render: S03 },
  { eyebrow: '// 04 · 카드 효과 팬', render: S03b },
  { eyebrow: '// 05 · 매치', render: S04 },
  { eyebrow: '// 06 · 카드', render: S05 },
  { eyebrow: '// 07 · 실제 파워 계산 ★', key: true, render: S05b },
  { eyebrow: '// 08 · 레벨', render: S06 },
  { eyebrow: '// 09 · 자동 진행', render: S07 },
  { eyebrow: '// 10 · 깃발', render: S08 },
  { eyebrow: '// 11 · 뺏기', render: S09 },
  { eyebrow: '// 12 · 깃발 파워 = 합산 ★', key: true, render: S09b },
  { eyebrow: '// 13 · 벤치로', render: S10 },
  { eyebrow: '// 14 · 핵심 원리 ★', key: true, render: S11 },
  { eyebrow: '// 15 · 벤치 오버플로', render: S12 },
  { eyebrow: '// 16 · 어떤 덱이 유리? ★', key: true, render: S13 },
  { eyebrow: '// 17 · 픽 요령 ★', key: true, render: S14 },
  { eyebrow: '// 18 · 벤치 시너지', render: S15 },
  { eyebrow: '// 19 · 덱 전체 자동 참여 ★', key: true, render: S15b },
  { eyebrow: '// 20 · 카드 도감', render: S15c },
  { eyebrow: '// 21 · 뽑기 vs 픽 ★', key: true, render: S16 },
  { eyebrow: '// 22 · 특수 능력', render: S17 },
  { eyebrow: '// 23 · 챔피언', render: S18 },
  { eyebrow: '// 24 · 시작', render: S19 },
]

export function OnboardingOverlay() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem(KEY) !== '1' } catch { return false }
  })
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const handler = () => { setIdx(0); setOpen(true) }
    window.addEventListener('rb:openTutorial', handler)
    return () => window.removeEventListener('rb:openTutorial', handler)
  }, [])

  if (!open) return null

  const slide = SLIDES[idx]!
  const isLast = idx === SLIDES.length - 1
  const isKey = slide.key === true

  function close() {
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-arena-void/95 backdrop-blur scene-scroll"
      >
        <div className="cyber-grid scene-bg opacity-40" />

        <div className="relative min-h-full flex flex-col justify-between p-5 pt-safe pb-safe z-10 gap-4 max-w-md mx-auto">

          {/* Progress + skip */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-0.5">
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1 flex-1 rounded-sm transition-all ${
                    i < idx ? 'bg-neon-cyan/60'
                    : i === idx
                      ? (s.key ? 'bg-neon-yellow shadow-neon-yellow' : 'bg-neon-cyan shadow-neon-cyan')
                    : (s.key ? 'bg-neon-yellow/30' : 'bg-arena-lineDim')
                  }`}
                  aria-label={`슬라이드 ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={close}
              className="font-mono text-[10px] tracking-widest text-arena-textDim hover:text-white"
            >
              건너뛰기 ×
            </button>
          </div>

          {/* Slide body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-center gap-3 py-4"
            >
              <div className={`font-mono text-[11px] tracking-widest text-center
                             ${isKey ? 'text-neon-yellow' : 'text-neon-magenta'}`}>
                {slide.eyebrow}
              </div>
              {slide.render()}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex gap-2 items-center">
            {idx > 0 && (
              <button
                onClick={() => setIdx(idx - 1)}
                className="px-4 py-3 clip-cyber border border-neon-cyan/60 text-neon-cyan
                           font-display font-bold text-xs tracking-widest"
              >
                ←
              </button>
            )}
            <button
              onClick={() => (isLast ? close() : setIdx(idx + 1))}
              className="flex-1 py-3 clip-cyber font-display font-bold text-sm tracking-widest
                         bg-holo-gradient text-arena-void shadow-neon-cyan"
            >
              {isLast ? '시작하기 ▶' : `다음 (${idx + 1}/${SLIDES.length})`}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
