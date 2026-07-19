// Generative ambient audio engine (Web Audio API) — no audio files needed.
// Each "tone" preset layers slow sine drones, a gentle LFO, and filtered
// noise so every session actually plays sound out of the box. Swap this for
// real narration/audio tracks when you have licensed recordings.

const PRESETS = {
  bright:   { base: 220, ratios: [1, 1.5, 2.0], noise: 0.015, cutoff: 900 },
  lavender: { base: 174, ratios: [1, 1.498, 2.0], noise: 0.02, cutoff: 700 },
  dusk:     { base: 110, ratios: [1, 1.5, 2.997], noise: 0.03, cutoff: 450 },
};

export class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.nodes = [];
    this.playing = false;
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
  }

  start(tone = "lavender") {
    this._ensureContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    this.stopLayers();
    const p = PRESETS[tone] || PRESETS.lavender;
    const now = this.ctx.currentTime;

    p.ratios.forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = p.base * ratio;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.08 / (i + 1);

      // Slow amplitude wobble so the drone breathes
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.025 / (i + 1);
      lfo.connect(lfoGain).connect(gain.gain);

      osc.connect(gain).connect(this.master);
      osc.start(now);
      lfo.start(now);
      this.nodes.push(osc, lfo, gain, lfoGain);
    });

    // Soft filtered noise bed (rain-like texture)
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = p.cutoff;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = p.noise;
    noise.connect(filter).connect(noiseGain).connect(this.master);
    noise.start(now);
    this.nodes.push(noise, filter, noiseGain);

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(1, now + 2.5);
    this.playing = true;
  }

  chime() {
    // Gentle bell on step transitions
    this._ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 660;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 2.4);
  }

  pause() {
    if (this.ctx && this.playing) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.4);
      setTimeout(() => this.ctx?.suspend(), 450);
      this.playing = false;
    }
  }

  resume() {
    if (this.ctx) {
      this.ctx.resume();
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(1, now + 1);
      this.playing = true;
    }
  }

  stopLayers() {
    this.nodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        n.disconnect();
      } catch { /* already stopped */ }
    });
    this.nodes = [];
  }

  destroy() {
    this.stopLayers();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.playing = false;
  }
}
