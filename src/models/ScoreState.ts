import { Player } from "./Player";

/** Score values for each player */
export interface ScoreState {
  [Player.P1]: number;
  [Player.P2]: number;
  max: number;
}
