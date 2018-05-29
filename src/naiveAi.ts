import { Game, GameState } from "./index";

export class NaiveAi {
  game: Game;
  state: GameState;
  chaseDistance = 4;

  constructor(game: Game) {
    this.game = game;
    this.state = game.getState();
  }

  update() {
    this.game.setP2InputUp(false);
    this.game.setP2InputDown(false);

    if (this.state.ballY > this.state.paddlePosition + this.chaseDistance) {
      this.game.setP2InputDown(true);
    } else if (this.state.ballY < this.state.paddlePosition - this.chaseDistance) {
      this.game.setP2InputUp(true);
    }
  }
}