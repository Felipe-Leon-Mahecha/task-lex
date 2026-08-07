export type SoundId = 'none' | 'white' | 'rain' | 'strings' | 'lofi'

export const SOUND_OPTIONS: { id: Exclude<SoundId, 'none'>; label: string }[] = [
  { id: 'white', label: 'Ruido blanco' },
  { id: 'rain', label: 'Lluvia' },
  { id: 'strings', label: 'Violín' },
  { id: 'lofi', label: 'Lo-fi' },
]

type Node = AudioScheduledSourceNode

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

export class AmbientPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private sources: Node[] = []
  private gains: GainNode[] = []
  private mods: OscillatorNode[] = []
  private timer: number | null = null
  private volume = 0.5

  private ensureCtx(): AudioContext {
    if (this.ctx) return this.ctx
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctor()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.volume
    this.master.connect(this.ctx.destination)
    return this.ctx
  }

  start(type: Exclude<SoundId, 'none'>) {
    this.stop()
    const ctx = this.ensureCtx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    switch (type) {
      case 'white':
        this.buildWhite(ctx)
        break
      case 'rain':
        this.buildRain(ctx)
        break
      case 'strings':
        this.buildStrings(ctx)
        break
      case 'lofi':
        this.buildLofi(ctx)
        break
    }
  }

  stop() {
    if (this.timer != null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    this.mods.forEach((o) => {
      try {
        o.stop()
      } catch {}
    })
    this.mods = []
    this.sources.forEach((s) => {
      try {
        s.stop()
      } catch {}
    })
    this.sources = []
    this.gains.forEach((g) => {
      try {
        g.disconnect()
      } catch {}
    })
    this.gains = []
  }

  setVolume(v: number) {
    this.volume = v
    if (this.master) this.master.gain.value = v
  }

  private noise(ctx: AudioContext, kind: 'white' | 'pink' | 'brown'): AudioBuffer {
    const len = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let b0 = 0
    let b1 = 0
    let b2 = 0
    let last = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      if (kind === 'white') {
        data[i] = w
      } else if (kind === 'pink') {
        b0 = 0.997 * b0 + 0.029 * w
        b1 = 0.985 * b1 + 0.05 * w
        b2 = 0.95 * b2 + 0.09 * w
        data[i] = (b0 + b1 + b2 + w * 0.25) * 0.22
      } else {
        last = (last + 0.02 * w) / 1.02
        data[i] = last * 3.5
      }
    }
    return buf
  }

  private source(ctx: AudioContext, buffer: AudioBuffer, loop = true, detune = 0) {
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = loop
    src.detune.value = detune
    return src
  }

  private route(src: Node, gain: number, filter?: BiquadFilterNode) {
    const ctx = this.ctx!
    const g = ctx.createGain()
    g.gain.value = gain
    src.connect(g)
    if (filter) {
      g.connect(filter)
      filter.connect(this.master!)
    } else {
      g.connect(this.master!)
    }
    this.sources.push(src)
    this.gains.push(g)
    src.start()
  }

  private buildWhite(ctx: AudioContext) {
    const buf = this.noise(ctx, 'white')
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    this.route(this.source(ctx, buf), 0.12, lp)
  }

  private buildRain(ctx: AudioContext) {
    const buf = this.noise(ctx, 'brown')
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 420
    this.route(this.source(ctx, buf), 0.6, hp)
    const drip = this.noise(ctx, 'white')
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2600
    bp.Q.value = 1.4
    const g = ctx.createGain()
    g.gain.value = 0
    const src = this.source(ctx, drip)
    src.connect(g)
    g.connect(bp)
    bp.connect(this.master!)
    this.sources.push(src)
    this.gains.push(g)
    src.start()
    this.timer = window.setInterval(() => {
      const now = ctx.currentTime
      g.gain.cancelScheduledValues(now)
      const peak = 0.05 + Math.random() * 0.1
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(peak, now + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    }, 120 + Math.random() * 160)
  }

  private buildStrings(ctx: AudioContext) {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1300
    lp.Q.value = 0.4
    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.16
    lp.connect(masterGain)
    masterGain.connect(this.master!)
    const base = midi(57)
    ;[-7, 0, 4, 9].forEach((semi, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = base * Math.pow(2, semi / 12)
      const oGain = ctx.createGain()
      oGain.gain.value = semi === 0 ? 0.5 : 0.35 / (i + 1)
      osc.connect(oGain)
      oGain.connect(lp)
      const vibrato = ctx.createOscillator()
      vibrato.frequency.value = 4.5 + i * 0.2
      const vGain = ctx.createGain()
      vGain.gain.value = 6
      vibrato.connect(vGain)
      vGain.connect(osc.detune)
      this.mods.push(vibrato)
      this.sources.push(osc)
      this.gains.push(oGain, vGain)
      osc.start()
      vibrato.start()
    })
  }

  private buildLofi(ctx: AudioContext) {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 850
    lp.Q.value = 0.3
    lp.connect(this.master!)
    const vinyl = this.noise(ctx, 'white')
    const vinylGain = ctx.createGain()
    vinylGain.gain.value = 0.012
    const vinylSrc = this.source(ctx, vinyl)
    vinylSrc.connect(vinylGain)
    vinylGain.connect(lp)
    this.sources.push(vinylSrc)
    this.gains.push(vinylGain)
    vinylSrc.start()

    const chords: number[][] = [
      [45, 48, 52, 55],
      [41, 45, 48, 52],
      [48, 52, 55, 59],
      [43, 47, 50, 54],
    ]
    let idx = 0
    const play = () => {
      const now = ctx.currentTime
      const chord = chords[idx % chords.length]
      chord.forEach((m, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = midi(m) * Math.pow(2, Math.round(Math.random() * 2 - 1) / 12)
        osc.detune.value = (Math.random() - 0.5) * 9
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.0001, now)
        g.gain.linearRampToValueAtTime(0.09 - i * 0.012, now + 0.9)
        g.gain.setValueAtTime(0.09 - i * 0.012, now + 1.9)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6)
        osc.connect(g)
        g.connect(lp)
        this.sources.push(osc)
        this.gains.push(g)
        osc.start(now)
        osc.stop(now + 2.7)
      })
      idx++
    }
    play()
    this.timer = window.setInterval(play, 2600)
  }
}
