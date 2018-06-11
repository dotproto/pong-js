import { Game, GameState } from "../index";

export class RandomAgent {
  game: Game;
  state: GameState;

  actions = [
    // up
    () => {
        this.game.setP1InputUp(true);
        this.game.setP1InputDown(false);
    },
    // hold
    () => {
        this.game.setP1InputUp(false);
        this.game.setP1InputDown(false);
    },
    // down
    () => {
        this.game.setP1InputUp(false);
        this.game.setP1InputDown(true);
    }
  ]

  constructor (game: Game) {
    this.game = game;
    this.state = game.getState();
  }
  next_action() {
    var choice = Math.floor(Math.random() * this.actions.length);
    this.actions[choice]();
  }
}
