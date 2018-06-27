import { BallState } from "./BallState";
import { BoardSettings } from "./BoardSettings";
import { PaddleSettings } from "./PaddleSettings";
import { PlayerState } from "./PlayerState";
import { ScoreState } from "./ScoreState";

export interface PongRendererConfig {
  board: BoardSettings;
  paddle: PaddleSettings;
  scoreSize: number;
  playerPosition: PlayerState;
  ball: BallState;
  score: ScoreState;
}
