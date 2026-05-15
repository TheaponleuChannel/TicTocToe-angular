import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private ctx: AudioContext | null = null;
  private _enabled = true;

  private get audioCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  get enabled(): boolean { return this._enabled; }
  toggle(): void { this._enabled = !this._enabled; }

  playPlace(mark: 'X' | 'O'): void {
    if (!this._enabled) return;
    const ctx  = this.audioCtx;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(mark === 'X' ? 660 : 440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(mark === 'X' ? 880 : 330, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.type = 'sine';
    osc.start(); osc.stop(ctx.currentTime + 0.18);
  }

  playWin(): void {
    if (!this._enabled) return;
    const ctx = this.audioCtx;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'triangle';
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    });
  }

  playDraw(): void {
    if (!this._enabled) return;
    const ctx = this.audioCtx; const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.type = 'sawtooth'; osc.start(); osc.stop(ctx.currentTime + 0.4);
  }

  playExpand(): void {
    if (!this._enabled) return;
    const ctx = this.audioCtx; const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  }

  playError(): void {
    if (!this._enabled) return;
    const ctx = this.audioCtx; const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 160; osc.type = 'square';
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }
}
