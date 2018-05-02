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
  }

  /** Units per second - default value used at the beginning of each round */
  initialVelocity = 10;

  /** Velocity used for the current round */
  velocity: number;

  /** Ball diameter in game units */
  ballSize = 8;

  /** Position of the ball in the playable board area */
  ballPoisition = {
    x: 0,
    y: 0,
  };

  /** Padle height in game units */
  padle = {
    height: 50,
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

    this.render();
  }

  initGameState() {
    const middleX = this.board.width / 2;
    const middleY = this.board.height / 2;

    // Set up player positions
    this.player.one = middleY;
    this.player.two = middleY;

    // Set initial ball position (middle)
    this.ballPoisition.x = middleX;
    this.ballPoisition.y = middleY;
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
    
  }

  render() {
    this.ctx.fillStyle = 'black';

    const height = this.board.height + this.board.yPadding * 2;
    const width = this.board.width + this.board.xPadding * 2;

    // Draw the board background
    this.ctx.fillRect(0, 0, width , height);

    // Draw the game objects
    this.drawPadles();
    this.drawBall();
    // this.drawScore();
    // this.drawBoundaries();

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
    
    this.ctx.arc(
      this.board.xPadding + this.ballPoisition.x,
      this.board.yPadding + this.ballPoisition.y,

      this.ballSize / 2,
      0,
      2 * Math.PI
    );
    
    this.ctx.fill();
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
