enum Player {
  P1 = 'p1',
  P2 = 'p2',
}

enum Move {
  UP = 'up',
  DOWN = 'down',
}

/** Math.PI is too long :( */
  const PI = Math.PI;

/** Math.PI * 2 is even longer. Plus we shouldn't re-calculate that value every time we need it */
const TAU = Math.PI * 2;

/** Reflect the input angle across the X axis */
const mirrorX = (radians:number) =>
    TAU - radians;

/** Reflect the input angle across the Y axis */
const mirrorY = (radians:number) =>
  radians < PI
    ? PI - radians
    : PI * 3 - radians;

class Game {

  /** Height and width units */
  board = {
    /** Height of the playable area */
    height: 200,
    /** Width of the playable area */
    width: 300,
    /** Padding on a single edge of the board */
    yPadding: 50,
    /** Size of each goal */
    xPadding: 50,
    boundarySize: 5,
  }

  /** Units per second - default value used at the beginning of each round */
  velocityInitial = 4;
  velocityScale = 1.1;

  pendingInputs: {
    [Player.P1]: Move | null,
    [Player.P2]: Move | null,
  } = {
    [Player.P1]: null,
    [Player.P2]: null,
  }

  ball = {
    /** Ball radius in game units */
    size: 4,
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

  }
  /** Paddle height in game units */
  paddle = {
    height: 40,
    width: 4,
    speed: 4,
    /** Range of possible reflections */
    range: PI * 3/4,
  };

  /** Position of the player's paddles in the playable game area */
  playerPosition = {
    [Player.P1]: 0,
    [Player.P2]: 0,
  }

  ballDirection: 'left' | 'right' = 'right';

  score = {
    [Player.P1]: 0,
    [Player.P2]: 0,
    max: 10,
  }

  fontSize = 48;

  canvasEl: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor() {
    this.initCanvas();
    this.initGameState();
    this.initEventHandlers();

    let playing = true;
    const gameLoop = () => {
      // Update game state
      this.update();
      // Re-render the game world
      this.render();

      if (playing) {
        return window.requestAnimationFrame(gameLoop);
      }
    };
    gameLoop();
  }

  initGameState() {
    this.initGameObjectPosition();
  }

  initGameObjectPosition() {
    const middleX = this.board.width / 2;
    const middleY = this.board.height / 2;

    // Set up player positions
    this.playerPosition[Player.P1] = middleY;
    this.playerPosition[Player.P2] = middleY;

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

  initCanvas() {
    // Prep the canvas
    this.canvasEl = document.getElementById('pong') as HTMLCanvasElement;

    this.canvasEl.height = this.board.height + this.board.yPadding * 2;
    this.canvasEl.width = this.board.width + this.board.xPadding * 2;

    // Get the context for drawing
    this.ctx = this.canvasEl.getContext('2d');
    this.ctx.font = `${this.fontSize}px monospace`;
  }

  initEventHandlers() {
    // P1: q (81) = up, a (65) = down
    // P2: [ (219) = up, ' (222) = down
    document.addEventListener('keydown', event => {
      const key = event.which;

      if (event.repeat) {
        return;
      }

      // Player 1 keys
      if (key === 81 || key === 65) {
        this.pendingInputs[Player.P1] = key === 81 ? Move.UP : Move.DOWN;
        return;

        // Player 2 keys
      } else if (key === 219 || key === 222) {
        this.pendingInputs[Player.P2] = key === 219 ? Move.UP : Move.DOWN;
        return;
      }
    });

    document.addEventListener('keyup', event => {
      const key = event.which;

      if (event.repeat) {
        return;
      }

      // Player 1 keys
      if (key === 81 || key === 65) {
        this.pendingInputs[Player.P1] = null;

        // Player 2 keys
      } else if (key === 219 || key === 222) {
        this.pendingInputs[Player.P2] = null;
      }
    });
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
    if (this.pendingInputs[Player.P1]) {
      this.playerPosition[Player.P1] = this.pendingInputs[Player.P1] === Move.UP ?
        Math.max(minHeight, -this.paddle.speed + this.playerPosition[Player.P1]) :
        Math.min(maxHeight, this.paddle.speed + this.playerPosition[Player.P1]);
    }

    // Update P2
    if (this.pendingInputs[Player.P2]) {
      this.playerPosition[Player.P2] = this.pendingInputs[Player.P2] === Move.UP ?
        Math.max(minHeight, -this.paddle.speed + this.playerPosition[Player.P2]) :
        Math.min(maxHeight, this.paddle.speed + this.playerPosition[Player.P2]);
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

        const paddleCollisionPoint = this.paddleCollisionCheck(this.playerPosition[Player.P2], collisionY);
        if (paddleCollisionPoint !== null) {

          const collisionScalar = (paddleCollisionPoint + this.ball.size) / (this.paddle.height + this.ball.size * 2);

          // Ball hit the paddle, reflect!
          const overshoot = projectedX + this.ball.size - this.board.width;
          projectedX = this.board.width - this.ball.size - overshoot;
          this.ball.angle = mirrorY(this.paddle.range * collisionScalar - this.paddle.range / 2);

          this.ball.velocity *= this.velocityScale;
        } else {
          return this.endVolley(Player.P1);
        }
      }
    } else {
      // Left
      if (projectedX - this.ball.size < 0) {
        /** Multiply by -1 to convert from cartisian to canvas coordinates */
        const collisionY = Math.tan(this.ball.angle) * -1 * ((0 + this.ball.size) - this.ball.x) + this.ball.y;

        const paddleCollisionPoint = this.paddleCollisionCheck(this.playerPosition[Player.P1], collisionY);

        if (paddleCollisionPoint !== null) {
          const collisionScalar = (paddleCollisionPoint + this.ball.size) / (this.paddle.height + this.ball.size * 2);

          // Ball hit the paddle, reflect!
          const overshoot = projectedX - this.ball.size
          projectedX = 0 - overshoot + this.ball.size;
          this.ball.angle = this.paddle.range * collisionScalar - this.paddle.range / 2;

          // this.ball.angle = mirrorY(this.ball.angle);
          this.ball.velocity *= this.velocityScale;
        } else {
          return this.endVolley(Player.P2);
        }
      }
    }

    this.ball.x = projectedX;
    this.ball.y = projectedY;
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
    if (winner === Player.P1) {
      this.ball.angle = PI;
    } else {
      this.ball.angle = 0;
    }
    this.resetGameObjectPosition();
  }

  updateScore(winner: Player) {
    this.score[winner] += 1;
    if (this.score[winner] === this.score.max) {

      this.score[Player.P1] = 0;
      this.score[Player.P2] = 0;

      this.resetGameObjectPosition();
    }
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

    this.ctx.beginPath();
    this.ctx.arc(
      this.board.xPadding + this.ball.x,
      this.board.yPadding + this.ball.y,

      this.ball.size,
      0,
      2 * Math.PI
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
    const yOffset = this.board.yPadding + this.fontSize;
    const xOffset = this.board.xPadding + this.board.width / 2;
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${this.score[Player.P1]}`, xOffset - this.fontSize/2, yOffset);
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${this.score[Player.P2]}`, xOffset + this.fontSize/2, yOffset);
  }
}


class Main {

  game: Game;

  constructor() {
    this.game = new Game();
  }

}

const main = new Main();
