import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStore } from '../../store/game.store';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-wrap">
      <div class="loading-logo">
        <span class="load-x">X</span><span class="load-sep">·</span><span class="load-o">O</span>
      </div>
      <div class="game-name">NEON GOMOKU</div>
      <div class="bar-wrap"><div class="bar" [style.width.%]="progress"></div></div>
      <p class="status-text">{{ status }}</p>
    </div>`,
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  private store  = inject(GameStore);
  private router = inject(Router);
  progress = 0;
  status   = 'INITIALIZING...';
  private steps = ['LOADING ASSETS...','CHARGING NEON...','CALIBRATING AI...','READY!'];

  ngOnInit(): void {
    const iv = setInterval(() => {
      this.progress += Math.random() * 16 + 5;
      this.status = this.steps[Math.min(Math.floor(this.progress / 25), 3)];
      if (this.progress >= 100) {
        this.progress = 100; clearInterval(iv);
        setTimeout(() => { this.store.patch({ screen: 'menu' }); this.router.navigate(['/menu']); }, 400);
      }
    }, 80);
  }
}
