/**
 * Web Audio synth SFX. No audio files — everything is generated on the fly
 * from oscillators so nothing hits the network and cold-start is instant.
 *
 * Enable/disable via `sfx.setEnabled()`. Persisted in localStorage.
 */

const KEY = 'rb.sfx.enabled.v1'

let ctx: AudioContext | null = null
let enabled = true
let masterGain: GainNode | null = null

function loadEnabled() {
  try {
    const v = localStorage.getItem(KEY)
    if (v === '0') enabled = false
  } catch { /* ignore */ }
}
loadEnabled()

function ac(): AudioContext {
  if (!ctx) {
    const Ctor = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? window.AudioContext
    ctx = new Ctor()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.35
    masterGain.connect(ctx.destination)
  }
  // Some browsers pause the context until user gesture; resume best-effort.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone({
  freq,
  attack = 0.005,
  decay = 0.15,
  type = 'square',
  gain = 0.4,
  freqEnd,
  when = 0,
}: {
  freq: number
  attack?: number
  decay?: number
  type?: OscillatorType
  gain?: number
  freqEnd?: number
  when?: number
}) {
  if (!enabled) return
  const c = ac()
  const t0 = c.currentTime + when
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + decay)
  }
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + attack + decay)
  osc.connect(g).connect(masterGain!)
  osc.start(t0)
  osc.stop(t0 + attack + decay + 0.05)
}

function noiseBurst(duration = 0.08, gain = 0.2) {
  if (!enabled) return
  const c = ac()
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration))
  const buf = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  g.gain.value = gain
  src.connect(g).connect(masterGain!)
  src.start()
}

/* --------------------------------------------------------
   Named SFX
   -------------------------------------------------------- */

export const sfx = {
  isEnabled: () => enabled,
  setEnabled(v: boolean) {
    enabled = v
    try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* ignore */ }
  },
  /** Card reveal blip (short mid tone). */
  reveal() {
    tone({ freq: 720, freqEnd: 900, type: 'square', decay: 0.09, gain: 0.28 })
  },
  /** Card picked (higher pitched, sparkly). */
  pick() {
    tone({ freq: 1000, freqEnd: 1500, type: 'triangle', decay: 0.12, gain: 0.32 })
  },
  /** Flag taken (impact chord). */
  flagTaken() {
    tone({ freq: 220, freqEnd: 55, type: 'sawtooth', decay: 0.28, gain: 0.4 })
    noiseBurst(0.12, 0.15)
    tone({ freq: 440, type: 'square', decay: 0.2, gain: 0.28, when: 0.03 })
  },
  /** UI tap. */
  tap() {
    tone({ freq: 900, type: 'square', decay: 0.04, gain: 0.15 })
  },
  /** Victory stinger. */
  win() {
    tone({ freq: 523, type: 'square', decay: 0.25, gain: 0.35 })              // C5
    tone({ freq: 659, type: 'square', decay: 0.25, gain: 0.35, when: 0.14 })  // E5
    tone({ freq: 784, type: 'square', decay: 0.3, gain: 0.35, when: 0.28 })   // G5
    tone({ freq: 1046, type: 'triangle', decay: 0.6, gain: 0.4, when: 0.42 }) // C6
  },
  /** Defeat stinger. */
  lose() {
    tone({ freq: 330, freqEnd: 165, type: 'sawtooth', decay: 0.5, gain: 0.35 })
    tone({ freq: 220, type: 'square', decay: 0.4, gain: 0.25, when: 0.2 })
  },
  /** Match intro. */
  intro() {
    tone({ freq: 200, freqEnd: 800, type: 'sawtooth', decay: 0.35, gain: 0.3 })
    tone({ freq: 800, type: 'triangle', decay: 0.2, gain: 0.25, when: 0.3 })
  },
}
