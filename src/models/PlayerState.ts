import { Player } from "./Player";

/** Y positions of each player */
export interface PlayerState {
  [Player.P1]: number;
  [Player.P2]: number;
}
