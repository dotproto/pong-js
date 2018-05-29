import { Game, GameState } from "../index";

export class RandomAgent {
    game: Game;
    state: GameState;

    actions = [
        // up
        () => {
            this.game.setP2InputUp(true);
            this.game.setP2InputDown(false);
        },
        // dont move
        () => {
            this.game.setP2InputUp(false);
            this.game.setP2InputDown(false);
        },
        // down
        () => {
            this.game.setP2InputUp(false);
            this.game.setP2InputDown(true);
        }
    ]

    constructor () {
    }
    take_action() {
      var choice = Math.floor(Math.random() * this.actions.length);
      return this.actions[choice];
    }
  }
