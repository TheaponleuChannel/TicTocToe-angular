import { Component, ViewChild, ElementRef, OnDestroy, inject, effect } from '@angular/core';
import { GameStore } from '../../../store/game.store';

@Component({
  selector: 'app-confetti',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`canvas{position:fixed;inset:0;pointer-events:none;z-index:500;width:100%;height:100%;}`]
})
export class ConfettiComponent implements OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private store     = inject(GameStore);
  private particles: any[]  = [];
  private animId:   any     = null;
  private COLORS = ['#00dcff','#ff4da6','#ffd166','#fff','#7efcff','#ff9ef5'];

  private readonly winnerEffect = effect(() => {
    const w = this.store.winner();
    if (w && w !== 'draw') this.burst(130);
    else if (!w) this.stop();
  });

  ngOnDestroy(): void { this.stop(); }

  burst(count = 130): void {
    const c = this.canvasRef.nativeElement;
    c.width = window.innerWidth; c.height = window.innerHeight;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: c.width/2, y: c.height/3,
        vx: (Math.random()-.5)*12, vy: Math.random()*-12-4,
        g: .35, color: this.COLORS[~~(Math.random()*this.COLORS.length)],
        w: Math.random()*9+3, h: Math.random()*4+2,
        rot: Math.random()*Math.PI*2, rs: (Math.random()-.5)*.22,
        op: 1, decay: Math.random()*.012+.006,
      });
    }
    if (!this.animId) this.loop();
  }

  private loop(): void {
    const c   = this.canvasRef.nativeElement;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    this.particles = this.particles.filter(p => p.op > 0);
    for (const p of this.particles) {
      p.x+=p.vx; p.vy+=p.g; p.y+=p.vy; p.rot+=p.rs; p.op-=p.decay;
      ctx.save(); ctx.globalAlpha=Math.max(0,p.op);
      ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    }
    this.animId = this.particles.length > 0 ? requestAnimationFrame(()=>this.loop()) : null;
    if (!this.animId) ctx.clearRect(0,0,c.width,c.height);
  }

  stop(): void {
    this.particles=[];
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId=null; }
    if (!this.canvasRef) return;
    const c = this.canvasRef.nativeElement;
    c.getContext('2d')?.clearRect(0,0,c.width,c.height);
  }
}
