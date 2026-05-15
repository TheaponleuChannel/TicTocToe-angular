/**
 * game.models.ts
 * All TypeScript interfaces and types used across the app.
 */

export type Mark     = 'X' | 'O' | null;
export type GameMode = 'ai' | 'mp' | null;
export type Screen   = 'loading' | 'menu' | 'auth' | 'lobby' | 'waiting' | 'game' | 'guide';
export type RoomRole = 'host' | 'guest' | null;

export interface Cell {
  index:     number;
  mark:      Mark;
  isWinner:  boolean;
  isNew:     boolean;
}

export interface GameState {
  screen:      Screen;
  mode:        GameMode;
  nickname:    string;
  myMark:      'X' | 'O';
  gridSize:    number;
  cells:       Cell[];
  currentTurn: 'X' | 'O';
  gameActive:  boolean;
  winner:      Mark | 'draw';
  winCombo:    number[];
  p1Name:      string;
  p2Name:      string;
  scores:      ScoreBoard;
  connected:   boolean;
  room:        RoomInfo;
  expanding:   boolean;
}

export interface ScoreBoard {
  p1:   number;
  draw: number;
  p2:   number;
}

export interface RoomInfo {
  code: string | null;
  role: RoomRole;
}

export interface MoveResult {
  winner: 'X' | 'O' | 'draw' | null;
  combo:  number[] | null;
}

export interface ServerRoom {
  code:     string;
  players:  RoomPlayer[];
  board:    Mark[];
  turn:     'X' | 'O';
  status:   'waiting' | 'playing' | 'done';
  scores:   ServerScores;
  gridSize: number;
}

export interface RoomPlayer {
  nickname: string;
  mark:     'X' | 'O';
}

export interface ServerScores {
  X:    number;
  O:    number;
  draw: number;
}

export interface Toast {
  id:      number;
  message: string;
  type:    ToastType;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info' | '';

export interface NavRoute {
  path:  string;
  label: string;
  icon?: string;
}
