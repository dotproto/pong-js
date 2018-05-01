// ESM syntax is supported.

interface PlayerState {
  position: number;
}

interface GameHistory {
  player1: PlayerState;
  player2: PlayerState;
}

interface GameBoard {
  height: number;
  width: number;
}

abstract class GameState {
  volley: number;

  /** Size of the ball. Effects bounce calculation & rendering properties. */
  ballSize: number;
  ballX: number;
  ballY: number;
}

interface GameConfig {
  board: GameBoard;
  velocity: number;
  keepHistory: boolean;
  volley: number;
}

export class PongEngine {
  config: GameConfig;
  history: GameHistory[];

  constructor (config: GameConfig, history: GameHistory[] = []) {
    this.config = config;
    this.history = history;
  }
}
