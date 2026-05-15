/**
 * game.service.ts
 * ─────────────────────────────────────────────────────────────
 * Business logic layer. Reads/writes GameStore.
 * Components call this service — never mutate the store directly.
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../store/game.store';
import { Cell, Mark, GameMode, MoveResult, ServerRoom, Screen } from '../models/game.models';
import { environment } from '../../environments/environment';

const GRID_START  = environment.gridStart;
const WIN_LENGTH  = environment.winLength;
const GRID_EXPAND = 2;

@Injectable({ providedIn: 'root' })
export class GameService {

  constructor(
    public  readonly store: GameStore,
    private readonly router: Router,
  ) {}

  /* ── Navigation helpers ─────────────────────────────────── */
  navigate(screen: Screen): void {
    this.store.patch({ screen });
    this.router.navigate(['/' + screen]);
  }

  /* ── Win detection ──────────────────────────────────────── */
  checkResult(board: Mark[], size: number): MoveResult {
    const DIRS: [number, number][] = [[0,1],[1,0],[1,1],[1,-1]];
    for (let idx = 0; idx < board.length; idx++) {
      const mark = board[idx];
      if (!mark) continue;
      const r = Math.floor(idx / size), c = idx % size;
      for (const [dr, dc] of DIRS) {
        const combo: number[] = [idx];
        for (let k = 1; k < WIN_LENGTH; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
          const ni = nr * size + nc;
          if (board[ni] !== mark) break;
          combo.push(ni);
        }
        if (combo.length === WIN_LENGTH) return { winner: mark as 'X'|'O', combo };
      }
    }
    if (board.every(c => c !== null)) return { winner: 'draw', combo: null };
    return { winner: null, combo: null };
  }

  /* ── Place mark (AI / local mode) ──────────────────────── */
  placeMarkLocal(index: number): MoveResult | null {
    const s = this.store.state();
    if (!s.gameActive || s.expanding || s.cells[index].mark) return null;

    const newCells = [...s.cells];
    newCells[index] = { ...newCells[index], mark: s.currentTurn, isNew: true };

    // Clear animation flag after animation duration
    setTimeout(() => {
      this.store.patch({
        cells: this.store.state().cells.map((c, i) =>
          i === index ? { ...c, isNew: false } : c
        ),
      });
    }, 350);

    const board  = newCells.map(c => c.mark);
    const result = this.checkResult(board, s.gridSize);

    if (result.winner) {
      this._applyResult(newCells, result);
      return result;
    }

    // Board full → expand grid
    if (board.every(m => m !== null)) {
      this.store.patch({ cells: newCells });
      setTimeout(() => this._expandGrid(), 500);
      return { winner: null, combo: null };
    }

    this.store.patch({
      cells:       newCells,
      currentTurn: s.currentTurn === 'X' ? 'O' : 'X',
    });
    return null;
  }

  /* ── Apply a server-validated board state ───────────────── */
  applyServerMove(board: Mark[], turn: 'X'|'O', result: MoveResult | null, scores?: any): void {
    const s = this.store.state();
    const newCells = s.cells.map((cell, i) => ({
      ...cell,
      mark:  board[i] ?? cell.mark,
      isNew: board[i] !== null && board[i] !== cell.mark,
    }));

    if (result?.winner) {
      this._applyResult(newCells, result);
      if (scores) this.syncServerScores(scores);
    } else {
      this.store.patch({ cells: newCells, currentTurn: turn });
    }
  }

  /* ── Grid expansion ─────────────────────────────────────── */
  private _expandGrid(): void {
    const s       = this.store.state();
    const oldSize = s.gridSize;
    const newSize = oldSize * GRID_EXPAND;
    const offset  = Math.floor((newSize - oldSize) / 2);

    this.store.patch({ expanding: true });

    setTimeout(() => {
      const newCells = this.store.buildCells(newSize);
      s.cells.forEach((cell, idx) => {
        if (cell.mark) {
          const r  = Math.floor(idx / oldSize), c = idx % oldSize;
          const ni = (r + offset) * newSize + (c + offset);
          newCells[ni] = { ...cell, isNew: false };
        }
      });
      this.store.patch({ gridSize: newSize, cells: newCells, expanding: false, gameActive: true });
    }, 700);
  }

  /* ── Server-side expand (multiplayer) ───────────────────── */
  applyServerExpand(gridSize: number, board: Mark[], turn: 'X'|'O'): void {
    this.store.patch({ expanding: true });
    setTimeout(() => {
      const cells = this.store.buildCells(gridSize);
      board.forEach((m, i) => { if (m) cells[i] = { ...cells[i], mark: m }; });
      this.store.patch({ gridSize, cells, currentTurn: turn, expanding: false, gameActive: true });
    }, 700);
  }

  /* ── Apply result helper ────────────────────────────────── */
  private _applyResult(cells: Cell[], result: MoveResult): void {
    const newCells = cells.map((c, i) => ({
      ...c,
      isWinner: result.combo?.includes(i) ?? false,
    }));
    const s  = this.store.state();
    const sc = { ...s.scores };
    if (result.winner === 'draw')     sc.draw++;
    else if (result.winner === 'X')   sc.p1++;
    else if (result.winner === 'O')   sc.p2++;

    this.store.patch({
      cells:      newCells,
      gameActive: false,
      winner:     result.winner,
      winCombo:   result.combo ?? [],
      scores:     sc,
    });
  }

  /* ── Sync server scores ─────────────────────────────────── */
  syncServerScores(sv: { X: number; O: number; draw: number }): void {
    this.store.patch({ scores: { p1: sv.X, draw: sv.draw, p2: sv.O } });
  }

  /* ── Game lifecycle ─────────────────────────────────────── */
  startGame(mode: GameMode, p1: string, p2: string, myMark: 'X'|'O' = 'X'): void {
    this.store.patch({
      mode, p1Name: p1, p2Name: p2, myMark,
      gridSize:    GRID_START,
      cells:       this.store.buildCells(GRID_START),
      currentTurn: 'X',
      gameActive:  true,
      winner:      null,
      winCombo:    [],
      expanding:   false,
      scores:      { p1: 0, draw: 0, p2: 0 },
      screen:      'game',
    });
    this.router.navigate(['/game']);
  }

  resetBoard(keepSize = false): void {
    const s    = this.store.state();
    const size = keepSize ? s.gridSize : GRID_START;
    this.store.patch({
      gridSize:    size,
      cells:       this.store.buildCells(size),
      currentTurn: 'X',
      gameActive:  true,
      winner:      null,
      winCombo:    [],
      expanding:   false,
    });
  }

  applyFullServerState(room: ServerRoom): void {
    const size  = room.gridSize || GRID_START;
    const cells = this.store.buildCells(size);
    room.board.forEach((m, i) => { if (m) cells[i] = { ...cells[i], mark: m }; });
    this.store.patch({ gridSize: size, cells, currentTurn: room.turn, gameActive: room.status === 'playing' });
  }

  /* ── Persistence ────────────────────────────────────────── */
  saveNickname(name: string): void {
    this.store.patch({ nickname: name });
    try { localStorage.setItem('ttt_nick', name); } catch (_) {}
  }

  loadNickname(): string {
    try { return localStorage.getItem('ttt_nick') || ''; } catch (_) { return ''; }
  }

  /* ── AI ─────────────────────────────────────────────────── */
  getBestMove(board: Mark[], size: number, aiMark: 'X'|'O'): number {
    const human: Mark = aiMark === 'X' ? 'O' : 'X';
    const empty = board.reduce<number[]>((a, v, i) => (v === null ? [...a, i] : a), []);
    if (empty.length === 0) return -1;

    for (const idx of empty) {
      board[idx] = aiMark;
      const r = this.checkResult(board, size);
      board[idx] = null;
      if (r.winner === aiMark) return idx;
    }
    for (const idx of empty) {
      board[idx] = human;
      const r = this.checkResult(board, size);
      board[idx] = null;
      if (r.winner === human) return idx;
    }

    let best = -Infinity, bestIdx = empty[Math.floor(empty.length / 2)];
    for (const idx of empty) {
      const sc = this._heuristic(board, idx, size, aiMark, human as 'X'|'O');
      if (sc > best) { best = sc; bestIdx = idx; }
    }
    return bestIdx;
  }

  private _heuristic(board: Mark[], idx: number, size: number, ai: 'X'|'O', human: 'X'|'O'): number {
    let score = 0;
    const DIRS: [number, number][] = [[0,1],[1,0],[1,1],[1,-1]];
    const r = Math.floor(idx / size), c = idx % size;
    for (const mark of [ai, human] as ('X'|'O')[]) {
      board[idx] = mark;
      for (const [dr, dc] of DIRS) {
        let count = 1;
        for (const d of [-1, 1]) {
          for (let k = 1; k < WIN_LENGTH; k++) {
            const nr = r + dr * d * k, nc = c + dc * d * k;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
            if (board[nr * size + nc] !== mark) break;
            count++;
          }
        }
        score += (mark === ai ? 10 : 8) ** (count - 1);
      }
      board[idx] = null;
    }
    const center = size / 2;
    score -= (Math.abs(r - center) + Math.abs(c - center)) * 0.5;
    return score;
  }
}
