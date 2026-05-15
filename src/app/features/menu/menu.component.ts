import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameStore } from '../../store/game.store';
import { SocketService } from '../../services/socket.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  private game   = inject(GameService);
  private store  = inject(GameStore);
  private socket = inject(SocketService);
  private router = inject(Router);

  typeText = '';
  private phrases = ['NEON GRID EDITION','5 IN A ROW TO WIN','OUTSMART THE MACHINE','CLAIM THE GRID'];
  private pi = 0; private ci = 0; private del = false; private timer: any;

  ngOnInit(): void { this.socket.connect(); this.tick(); }
  ngOnDestroy(): void { clearTimeout(this.timer); }

  private tick(): void {
    const phrase = this.phrases[this.pi];
    if (!this.del) {
      this.typeText = phrase.slice(0, ++this.ci);
      if (this.ci === phrase.length) { this.timer = setTimeout(()=>{this.del=true;this.tick();},2200); return; }
    } else {
      this.typeText = phrase.slice(0, --this.ci);
      if (this.ci===0) { this.del=false; this.pi=(this.pi+1)%this.phrases.length; }
    }
    this.timer = setTimeout(()=>this.tick(), this.del?40:85);
  }

  startAI(): void {
    const nick = this.game.loadNickname() || 'YOU';
    this.game.startGame('ai', nick, 'AI', 'X');
  }

  goFriend(): void {
    const saved = this.game.loadNickname();
    if (saved) { this.store.patch({ nickname: saved }); this.router.navigate(['/lobby']); }
    else this.router.navigate(['/auth']);
  }

  openGuide(): void { this.router.navigate(['/guide']); }
}
