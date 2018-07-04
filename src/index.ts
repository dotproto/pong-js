import { BallState } from "./models/BallState";
import { BoardSettings } from "./models/BoardSettings";
import { GameState } from "./models/GameState";
import { PaddleSettings } from "./models/PaddleSettings";
import { Player, P2, P1 } from "./models/Player";
import { PlayerInputState } from "./models/PlayerInput";
import { PlayerState } from "./models/PlayerState";
import { PongRendererConfig } from "./models/PongRendererConfig";
import { ScoreState } from "./models/ScoreState";
import { NaiveAi } from './naiveAi';
import { PongRenderer } from './PongRenderer';
import { mirrorX, mirrorY, PI } from './trig';
import { PlayerAction, up, down, stay } from './models/PlayerAction';

const raf = window.requestAnimationFrame;

export class Game {

  /** Height and width units */
  board: BoardSettings = {
    /** Height of the playable area */
    height: 400,
    /** Width of the playable area */
    width: 600,
    /** Padding on a single edge of the board */
    yPadding: 50,
    /** Size of each goal */
    xPadding: 50,
    boundarySize: 10,
  };

  private gameState: GameState;

  /** Units per second - default value used at the beginning of each round */
  velocityInitial = 5;
  velocityScale = 1.05;
  velocityMax = 20;

  pendingInputs: {
    [P1]: PlayerInputState,
    [P2]: PlayerInputState,
  } = {
    [P1]: {
      up: false,
      down: false,
    },
    [P2]: {
      up: false,
      down: false,
    },
  };

  ball: BallState = {
    /** Ball radius in game units */
    size: 7,
    /** Position of the ball in the playable board area */
    x: 0,
    y: 0,
    /** Velocity used for the current round */
    velocity: this.velocityInitial,
    /** Degrees */
    angle: 0, // hits both paddles
    // angle: 2 * PI / 17, // misses right paddle
    // angle: 15 * PI / 17, // misses left paddle
    // angle: 1.45 * PI / 180, // a couple direct paddle hits
  };

  /** Paddle height in game units */
  paddle: PaddleSettings = {
    height: 60,
    width: 8,
    speed: 4,
    /** Range of possible reflections */
    range: PI * 3/4,
  };

  /** Position of the player's paddles in the playable game area */
  playerPosition: PlayerState = {
    [P1]: 0,
    [P2]: 0,
  }

  score: ScoreState = {
    [P1]: 0,
    [P2]: 0,
    max: 10,
  }

  fontSize = 60;

  ai: NaiveAi;
  renderer: PongRenderer;

  constructor() {
    const rendererConfig: PongRendererConfig = {
      board: this.board,
      paddle: this.paddle,
      scoreSize: this.fontSize,
      playerPosition: this.playerPosition,
      ball: this.ball,
      score: this.score,
    };

    this.renderer = new PongRenderer(rendererConfig);
    this.initGameState();
    this.initEventHandlers();

    const game = this;
    this.gameState = Object.freeze({
      get ballY(): number {
        return game.ball.y;
      },
      get ballX(): number {
        return game.ball.x;
      },
      get ballAngle(): number {
        return game.ball.angle;
      },
      get ballVelocity(): number {
        return game.ball.velocity;
      },
      get playerPosition(): number {
        return game.playerPosition[P2];
      },
      get opponentPosition(): number {
        return game.playerPosition[P1];
      }
    });

    let playing = true;
    const setInput = this.setInput.bind(this);
    const gameLoop = () => {
      if (this.ai) {
        this.ai.update(this.gameState, setInput);
      }

      // Update game state
      this.update();
      // Re-render the game world
      this.renderer.render();

      if (playing) {
        return raf(gameLoop);
      }
    };
    gameLoop();
  }

  setInput(action: PlayerAction) {
    switch (action) {
      case up: {
        this.setInputUp(P2, true);
        this.setInputDown(P2, false);
      } break;
      case down: {
        this.setInputUp(P2, false);
        this.setInputDown(P2, true);
      } break;
      case stay: {
        this.setInputUp(P2, false);
        this.setInputDown(P2, false);
      } break;
      default: {
        console.error('Unknown player action');
      }
    }
  }

  setAi(aiInstance: NaiveAi) {
    this.ai = aiInstance;
  }

  initGameState() {
    this.initGameObjectPosition();
  }

  initGameObjectPosition() {
    const middleX = this.board.width / 2;
    const middleY = this.board.height / 2;

    // Set up player positions
    this.playerPosition[P1] = middleY + 1;
    this.playerPosition[P2] = middleY + 1;

    // Set initial ball position (middle)
    this.ball.x = middleX;
    this.ball.y = middleY;

    this.ball.velocity = this.velocityInitial;
  }

  resetGameObjectPosition() {
    const middleX = this.board.width / 2;
    const middleY = this.board.height / 2;

    // Set initial ball position (middle)
    this.ball.x = middleX;
    this.ball.y = middleY;

    this.ball.velocity = this.velocityInitial;
  }

  initEventHandlers() {
    // P1: q (81) = up, a (65) = down
    // P2: [ (219) = up, ' (222) = down
    document.addEventListener('keydown', event => {
      const key = event.which;

      if (event.repeat) {
        return;
      }

      switch (key) {
        // Player 1 keys
        case 81:
          return this.setInputUp(P1, true);
        case 65:
          return this.setInputDown(P1, true);

        // Player 2 keys
        case 219:
          return this.setInputUp(P2, true);
        case 222:
          return this.setInputDown(P2, true);
        default:
          // Unknown input
      }
    });

    document.addEventListener('keyup', event => {
      const key = event.which;

      if (event.repeat) {
        return;
      }

      switch (key) {
        // Player 1 keys
        case 81:
          return this.setInputUp(P1, false);
        case 65:
          return this.setInputDown(P1, false);

        // Player 2 keys
        case 219:
          return this.setInputUp(P2, false);
        case 222:
          return this.setInputDown(P2, false);
        default:
          // Unknown input
      }
    });
  }

  setInputUp(player: Player, input: boolean = false) {
    this.pendingInputs[player].up = input;
  }
  setInputDown(player: Player, input: boolean = false) {
    this.pendingInputs[player].down = input;
  }

  setP1InputUp(input: boolean = false) {
    this.pendingInputs[P1].up = input;
  }
  setP1InputDown(input: boolean = false) {
    this.pendingInputs[P1].down = input;
  }

  setP2InputUp(input: boolean = false) {
    this.pendingInputs[P2].up = input;
  }
  setP2InputDown(input: boolean = false) {
    this.pendingInputs[P2].down = input;
  }

  update() {
    this.updatePaddles();
    this.updateBall();
  }

  updatePaddles() {
    // Top edge
    const minHeight = this.paddle.height / 2;
    // Bottom edge
    const maxHeight = this.board.height - this.paddle.height / 2;

    // Update P1
    if (this.pendingInputs[P1].up && !this.pendingInputs[P1].down) {
      this.playerPosition[P1] = Math.max(minHeight, -this.paddle.speed + this.playerPosition[P1]);
    } else if (!this.pendingInputs[P1].up && this.pendingInputs[P1].down) {
      this.playerPosition[P1] = Math.min(maxHeight, this.paddle.speed + this.playerPosition[P1]);
    }
    // Update P2
    if (this.pendingInputs[P2].up && !this.pendingInputs[P2].down) {
      this.playerPosition[P2] = Math.max(minHeight, -this.paddle.speed + this.playerPosition[P2])
    } else if (!this.pendingInputs[P2].up && this.pendingInputs[P2].down) {
      this.playerPosition[P2] = Math.min(maxHeight, this.paddle.speed + this.playerPosition[P2])
    }

  }

  updateBall() {
    const deltaX = Math.cos(this.ball.angle) * this.ball.velocity;
    /** Invert sin to match canvas coordinate system */
    const deltaY = Math.sin(this.ball.angle) * this.ball.velocity * -1;

    let projectedX = this.ball.x + deltaX;
    let projectedY = this.ball.y + deltaY;

    // First, determine if the ball is going towards the top or bottom edge
    if (deltaY > 0) {
      // Bottom
      if (projectedY + this.ball.size > this.board.height) {
        const overshoot = this.board.height - this.ball.size * 2 - projectedY;
        projectedY = this.board.height + overshoot;
        this.ball.angle = mirrorX(this.ball.angle);
      }
      // else: Everythign is fine - Y travels normally
    } else {
      // Top
      if (projectedY - this.ball.size < 0) {
        // Intersected with the edge of the board
        const overshoot = projectedY - this.ball.size * 2;
        projectedY = 0 - overshoot;
        this.ball.angle = mirrorX(this.ball.angle);
      }
      // else: Everything is fine - Y travels normally
    }

    if (deltaX > 0) {
      // Right
      if (projectedX + this.ball.size > this.board.width) {
        /** Multiply by -1 to convert from cartisian to canvas coordinates */
        const collisionY = Math.tan(this.ball.angle) * -1 * ((this.board.width - this.ball.size) - this.ball.x) + this.ball.y;

        const paddleCollisionPoint = this.paddleCollisionCheck(this.playerPosition[P2], collisionY);
        if (paddleCollisionPoint !== null) {

          const collisionScalar = (paddleCollisionPoint + this.ball.size) / (this.paddle.height + this.ball.size * 2);

          // Ball hit the paddle, reflect!
          const overshoot = projectedX + this.ball.size - this.board.width;
          projectedX = this.board.width - this.ball.size - overshoot;
          this.ball.angle = mirrorY(this.paddle.range * collisionScalar - this.paddle.range / 2);

          this.increaseVelocity();
        } else {
          return this.endVolley(P1);
        }
      }
    } else {
      // Left
      if (projectedX - this.ball.size < 0) {
        /** Multiply by -1 to convert from cartisian to canvas coordinates */
        const collisionY = Math.tan(this.ball.angle) * -1 * ((0 + this.ball.size) - this.ball.x) + this.ball.y;

        const paddleCollisionPoint = this.paddleCollisionCheck(this.playerPosition[P1], collisionY);

        if (paddleCollisionPoint !== null) {
          const collisionScalar = (paddleCollisionPoint + this.ball.size) / (this.paddle.height + this.ball.size * 2);

          // Ball hit the paddle, reflect!
          const overshoot = projectedX - this.ball.size
          projectedX = 0 - overshoot + this.ball.size;
          this.ball.angle = this.paddle.range * collisionScalar - this.paddle.range / 2;

          this.increaseVelocity();
        } else {
          return this.endVolley(P2);
        }
      }
    }

    this.ball.x = projectedX;
    this.ball.y = projectedY;
  }

  increaseVelocity(): void {
    this.ball.velocity *= this.velocityScale;
    if (this.ball.velocity > this.velocityMax) {
      this.ball.velocity = this.velocityMax;
    }
  }

  paddleCollisionCheck(paddleY: number, ballY: number): number | null {
    const paddleTop = paddleY - this.paddle.height / 2 - this.ball.size;
    const paddleBottom = paddleY + this.paddle.height / 2 + this.ball.size;

    if (ballY > paddleTop && ballY < paddleBottom) {
      return paddleBottom - ballY - this.ball.size;
    } else {
      return null;
    }
  }

  endVolley(winner: Player) {
    this.updateScore(winner);
    if (winner === P1) {
      this.ball.angle = PI;
    } else {
      this.ball.angle = 0;
    }
    this.resetGameObjectPosition();
  }

  updateScore(winner: Player) {
    this.score[winner] += 1;
    if (this.score[winner] === this.score.max) {

      this.score[P1] = 0;
      this.score[P2] = 0;

      this.resetGameObjectPosition();
    }
  }

  getState(): GameState {
    return this.gameState;
  }
}

class Main {

  game: Game;
  ai: NaiveAi;

  constructor() {
    this.game = new Game();
    this.game.setAi(new NaiveAi());
  }

}

const main = new Main();
