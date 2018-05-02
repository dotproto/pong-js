// ESM syntax is supported.

abstract class GameState {
  position: {
    player1: number;
    player2: number;
  }
  
  ballVelocity: number;
  volley: number;
  ballX: number;
  ballY: number;
}

interface GameConfig {
  /** Width of the game's playable aread */
  height: number;
  
  /** Width of the game's playable aread */
  width: number;

  /** Padel size as measured from the top edge to bottom edge of the padel */
  padelSize: number;

  /** Diameter of the ball */
  ballSize: number;

  /**  */
  initialVelocity: number;
}

export class PongEngine {
  config: GameConfig;
  history: GameState[];

  constructor (config: GameConfig, history: GameState[] = []) {
    this.config = config;
    this.history = history;
  }
}
