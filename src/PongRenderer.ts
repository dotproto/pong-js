import { Player } from "./models/Player";
import { PongRendererConfig } from "./models/PongRendererConfig";
import { BoardSettings } from "./models/BoardSettings";
import { PaddleSettings } from "./models/PaddleSettings";
import { PlayerState } from "./models/PlayerState";
import { BallState } from "./models/BallState";
import { ScoreState } from "./models/ScoreState";

export class PongRenderer {

  canvasEl: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: PongRendererConfig;

  board: BoardSettings;
  paddle: PaddleSettings;
  scoreSize: number;
  playerPosition: PlayerState;
  ball: BallState;
  score: ScoreState;

  constructor(config: PongRendererConfig) {
    this.board = config.board;
    this.scoreSize = config.scoreSize;
    this.paddle = config.paddle;
    this.playerPosition = config.playerPosition;
    this.ball = config.ball;
    this.score = config.score;

    this.initCanvas();
  }

  initCanvas() {
    // Prep the canvas
    this.canvasEl = document.getElementById('pong') as HTMLCanvasElement;

    this.canvasEl.height = this.board.height + this.board.yPadding * 2;
    this.canvasEl.width = this.board.width + this.board.xPadding * 2;

    // Get the context for drawing
    this.ctx = this.canvasEl.getContext('2d');
    this.ctx.font = `${this.scoreSize}px monospace`;
  }

  render() {
    this.ctx.fillStyle = 'black';

    const height = this.board.height + this.board.yPadding * 2;
    const width = this.board.width + this.board.xPadding * 2;

    // Clear out the canvas
    // this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    // Draw the board background
    // this.ctx.globalAlpha = 0.05;
    this.ctx.fillRect(0, 0, width, height);
    // this.ctx.globalAlpha = 1;

    // Draw the game objects
    this.drawBoundaries();
    this.drawScore();
    this.drawBall();
    this.drawPaddles();
  }

  drawPaddles() {

    this.ctx.fillStyle = '#444';

    // P1 (left) background
    this.ctx.fillRect(
      this.board.xPadding - this.paddle.width,
      this.board.yPadding,

      this.paddle.width,
      this.board.height
    );

    // P2 (right) background
    this.ctx.fillRect(
      this.board.xPadding + this.board.width,
      this.board.yPadding,

      this.paddle.width,
      this.board.height
    );


    this.ctx.fillStyle = 'white';

    // player 1
    this.ctx.fillRect(
      this.board.xPadding - this.paddle.width,
      this.board.yPadding + this.playerPosition[Player.P1] - this.paddle.height / 2,

      this.paddle.width,
      this.paddle.height
    );

    // player 2
    this.ctx.fillRect(
      this.board.xPadding + this.board.width,
      this.board.yPadding + this.playerPosition[Player.P2] - this.paddle.height / 2 ,

      this.paddle.width,
      this.paddle.height
    );
  }

  drawBall() {
    this.ctx.fillStyle = 'white';

    this.ctx.fillRect(
      this.board.xPadding + this.ball.x - this.ball.size,
      this.board.yPadding + this.ball.y - this.ball.size,
      this.ball.size * 2,
      this.ball.size * 2,
    );

    this.ctx.fill();
  }

  drawBoundaries() {
    this.ctx.fillStyle = 'white';
    // Top edge
    this.ctx.fillRect(
      this.board.xPadding - this.board.boundarySize,
      this.board.yPadding - this.board.boundarySize,

      this.board.width + this.board.boundarySize * 2,
      this.board.boundarySize
    );

    // Bottom edge
    this.ctx.fillRect(
      this.board.xPadding - this.board.boundarySize,
      this.board.yPadding + this.board.height,

      this.board.width + this.board.boundarySize * 2,
      this.board.boundarySize
    );

  }

  drawScore() {
    this.ctx.fillStyle = 'gray';
    const yOffset = this.board.yPadding + this.scoreSize;
    const xOffset = this.board.xPadding + this.board.width / 2;
    this.ctx.textAlign = 'right';
    this.ctx.fillText('' + this.score[Player.P1], xOffset - this.scoreSize/2, yOffset);
    this.ctx.textAlign = 'left';
    this.ctx.fillText('' + this.score[Player.P2], xOffset + this.scoreSize/2, yOffset);
  }
}