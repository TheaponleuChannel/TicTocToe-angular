/**
 * game.store.ts
 * ─────────────────────────────────────────────────────────────
 * Single reactive store built with Angular 18 Signals.
 * All game state lives here — components read via computed()
 * and update via the GameService API, never directly.
 *
 * Pattern: Signal Store (no NgRx/Akita dependency)
 */
import { Injectable, signal, computed } from '@angular/core';
import { GameState, Cell, Mark, Screen, GameMode, MoveResult } from '../models/game.models';
import { environment } from '../../environments/environment';

const GRID_START  = environment.gridStart;
const WIN_LENGTH  = environment.winLength;
const GRID_EXPAND = 2;

@Injectable({ providedIn: 'root' })
export class GameStore {

  /* ── Private writable signal ───────────────────────────── */
  private readonly _state = signal<GameState>(this.createInitialState());

  /* ── Public read-only surface ──────────────────────────── */
  readonly state       = this._state.asReadonly();
  readonly screen      = computed(() => this._state().screen);
  readonly cells       = computed(() => this._state().cells);
  readonly gridSize    = computed(() => this._state().gridSize);
  readonly currentTurn = computed(() => this._state().currentTurn);
  readonly gameActive  = computed(() => this._state().gameActive);
  readonly winner      = computed(() => this._state().winner);
  readonly scores      = computed(() => this._state().scores);
  readonly p1Name      = computed(() => this._state().p1Name);
  readonly p2Name      = computed(() => this._state().p2Name);
  readonly myMark      = computed(() => this._state().myMark);
  readonly mode        = computed(() => this._state().mode);
  readonly room        = computed(() => this._state().room);
  readonly expanding   = computed(() => this._state().expanding);
  readonly connected   = computed(() => this._state().connected);
  readonly nickname    = computed(() => this._state().nickname);

  /* ── Derived computed ──────────────────────────────────── */
  readonly isMyTurn = computed(() => {
    const s = this._state();
    if (s.mode === 'ai')  return s.currentTurn === 'X';
    if (s.mode === 'mp')  return s.myMark === s.currentTurn;
    return false;
  });

  readonly turnPlayerName = computed(() => {
    const s = this._state();
    return s.currentTurn === 'X' ? s.p1Name : s.p2Name;
  });

  readonly boardFlat = computed(() => this._state().cells.map(c => c.mark));

  /* ── State mutations (all go through patch) ────────────── */
  patch(partial: Partial<GameState>): void {
    this._state.update(s => ({ ...s, ...partial }));
  }

  /* ── Board helpers ─────────────────────────────────────── */
  buildCells(size: number): Cell[] {
    return Array.from({ length: size * size }, (_, i) => ({
      mark: null, isWinner: false, isNew: false, index: i,
    }));
  }

  private createInitialState(): GameState {
    return {
      screen:      'loading',
      mode:        null,
      nickname:    '',
      myMark:      'X',
      gridSize:    GRID_START,
      cells:       this.buildCells(GRID_START),
      currentTurn: 'X',
      gameActive:  false,
      winner:      null,
      winCombo:    [],
      p1Name:      'YOU',
      p2Name:      'AI',
      scores:      { p1: 0, draw: 0, p2: 0 },
      connected:   false,
      room:        { code: null, role: null },
      expanding:   false,
    };
  }

  resetToInitial(): void {
    this._state.set(this.createInitialState());
  }
}
