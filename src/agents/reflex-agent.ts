import { Game, GameState } from "../index";

export class ReflexAgent {
  game: Game;
  state: GameState;
  chaseDistance = 10;

  constructor(game: Game) {
    this.game = game;
    this.state = game.getState();
  }

  nextAction() {
    this.game.setP2InputUp(false);
    this.game.setP2InputDown(false);

    if (this.state.ballY > this.state.player2Position + this.chaseDistance) {
      this.game.setP2InputDown(true);
    } else if (this.state.ballY < this.state.player2Position - this.chaseDistance) {
      this.game.setP2InputUp(true);
    }
  }
}
