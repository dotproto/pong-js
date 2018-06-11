import { Game, GameState } from "../index";

export class ReflexAgent {
  game: Game;
  state: GameState;
  chaseDistance = 10;

  constructor(game: Game) {
    this.game = game;
    this.state = game.getState();
  }

  next_action() {
    this.game.setP2InputUp(false);
    this.game.setP2InputDown(false);

    if (this.state.ballY > this.state.paddlePosition + this.chaseDistance) {
      this.game.setP2InputDown(true);
    } else if (this.state.ballY < this.state.paddlePosition - this.chaseDistance) {
      this.game.setP2InputUp(true);
    }
  }
}
