function toRadians (degrees: number) { return degrees * (Math.PI / 180);}
function toDegrees (radians: number) { return radians * (180 / Math.PI);}


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
  initialVelocity = 2;  

  ball = {
    /** Ball diameter in game units */
    size: 8,
    /** Position of the ball in the playable board area */
    x: 0,
    y: 0,
    /** Velocity used for the current round */
    velocity: this.initialVelocity,
    /** Degrees */
    angle: 45,

  }
  /** Padle height in game units */
  padle = {
    height: 30,
    width: 4
  };

  /** Position of the player's padles in the playable game area */
  player = {
    one: 0,
    two: 0,
  }

  ballDirection: 'left' | 'right' = 'right';
  
  score = {
    p1: 0,
    p2: 0,
    max: 10,
  }

  canvasEl: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor() {
    this.initCanvas();
    this.initGameState();

    let playing = true;
    const gameLoop = () => {
      this.update();
      this.render();
      
      if (playing) {
        window.requestAnimationFrame(() => window.requestAnimationFrame(gameLoop));
      }
    };
    gameLoop();
  }

  initGameState() {
    const middleX = this.board.width / 2;
    const middleY = this.board.height / 2;

    // Set up player positions
    this.player.one = middleY;
    this.player.two = middleY;

    // Set initial ball position (middle)

    this.ball.x = middleX;
    this.ball.y = middleY;
  }

  initCanvas() {
    // Prep the canvas
    this.canvasEl = document.getElementById('pong') as HTMLCanvasElement;

    this.canvasEl.height = this.board.height + this.board.yPadding * 2;
    this.canvasEl.width = this.board.width + this.board.xPadding * 2;

    // Get the context for drawing
    this.ctx = this.canvasEl.getContext('2d');
  }

  bindEventHandlers() {

  }

  update() {

    const deltaX = Math.cos(toRadians(this.ball.angle)) * this.ball.velocity;
    const deltaY = Math.sin(toRadians(this.ball.angle)) * this.ball.velocity * -1;

    let projectedX = this.ball.x + deltaX;
    let projectedY = this.ball.y + deltaY;

    const ballRadius = this.ball.size / 2;

    console.log(projectedX, projectedY);

    // First, determine if the ball is going towards the top or bottom edge
    if (deltaY > 0) {
      // Bottom
      if (projectedY + ballRadius > this.board.height) {
        const over = projectedY - ballRadius - this.board.height;
        projectedY = this.board.height + over;
        this.ball.angle = (360 - this.ball.angle) % 360;
      }
      // else: Everythign is fine - Y travels normally
    } else {
      // Top
      if (projectedY - ballRadius < 0) {
        // Intersected with the edge of the board
        const overshoot = projectedY - ballRadius;
        this.ball.angle = (360 - this.ball.angle) % 360;
      }
      // else: Everything is fine - Y travels normally
    }

    if (deltaX > 0) {
      // Right
      if (projectedX + ballRadius > this.board.width) {
        // Intersect with the right edge of the board
        const overshoot = projectedX + ballRadius - this.board.width;
        projectedX = this.board.width - ballRadius - overshoot;
        this.ball.angle = ((180 + this.ball.angle) * -1) % 360;
        // this.ball.angle = (360 - this.ball.angle) % 360
      }
    } else {
      if (projectedX - ballRadius < 0) {
        const overshoot = projectedX - ballRadius
        projectedX = 0 - overshoot + ballRadius;
        this.ball.angle = ((180 + this.ball.angle) * -1) % 360;
      }
    }

    this.ball.x = projectedX;
    this.ball.y = projectedY;
  }

  render() {
    this.ctx.fillStyle = 'black';

    const height = this.board.height + this.board.yPadding * 2;
    const width = this.board.width + this.board.xPadding * 2;
    
    // Clear out the canvas
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    // Draw the board background
    this.ctx.fillRect(0, 0, width, height);

    // Draw the game objects
    this.drawPadles();
    this.drawBall();
    this.drawBoundaries();
    // this.drawScore();
  }

  drawPadles() {
    this.ctx.fillStyle = 'white';

    // player 1
    this.ctx.fillRect(
      this.board.xPadding - this.padle.width,
      this.board.yPadding + this.player.one - this.padle.height / 2,

      this.padle.width,
      this.padle.height
    );

    // player 2
    this.ctx.fillRect(
      this.board.xPadding  + this.board.width,
      this.board.yPadding + this.player.two - this.padle.height / 2 ,

      this.padle.width,
      this.padle.height
    );
  }

  drawBall() {
    this.ctx.fillStyle = 'white';
    
    this.ctx.beginPath();
    this.ctx.arc(
      this.board.xPadding + this.ball.x,
      this.board.yPadding + this.ball.y,

      this.ball.size / 2,
      0,
      2 * Math.PI
    );
    
    this.ctx.fill();
  }

  drawBoundaries() {
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

  getPlayableArea() {
    return [{
        x: this.board.xPadding,
        y: this.board.yPadding,
      }, {
        y: this.board.xPadding + this.board.width,
        x: this.board.yPadding + this.board.height,
      }
    ]
  }
}


class Main {

  game: any;

  constructor() {
    this.game = new Game();
  }

}

const main = new Main();
