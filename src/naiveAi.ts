import { Game } from "./index";
import { GameState } from "./models/GameState";
import { PlayerAction } from "./models/PlayerAction";

export class NaiveAi {
  chaseDistance = 20;

  update(state: GameState, setInput: Function) {
    if (state.ballY > state.playerPosition + this.chaseDistance) {
      setInput(PlayerAction.down);
    } else if (state.ballY < state.playerPosition - this.chaseDistance) {
      setInput(PlayerAction.up);
    } else {
      setInput(PlayerAction.stay);
    }
  }
}