import * as tf from "@tensorflow/tfjs";
import { Game } from "../index";

/**
 * A reinforcement learning agent that uses a policy gradient to play pong.
 * The policy representation is a simple two layer neural net with 1 hidden layer
 * of 25 relu nodes and a sigmoid output layer.
 * TODO: talk about loss function and optimizer
 * TODO: hyperparameters
 */
export class HillClimberAgent {
  game: Game;
  player: string;
  actions: any = {
    'player1': [
      // up
      () => {
        this.game.setP1InputUp(true);
        this.game.setP1InputDown(false);
      },
      // down
      () => {
        this.game.setP1InputUp(false);
        this.game.setP1InputDown(true);
      }
    ],
    'player2': [
      // up
      () => {
        this.game.setP2InputUp(true);
        this.game.setP2InputDown(false);
      },
      // down
      () => {
        this.game.setP2InputUp(false);
        this.game.setP2InputDown(true);
      }
    ]
  }

  /** size of the policy network's hidden layer */
  hiddenUnits = 25;

  /** Policy network - outputs the probability of an action given the current state */
  policyNet = tf.sequential();
  /** hidden layer of the policy net */
  //  TODOs:
  //    hidden.config.inputShape = State.shape
  //    State.shape = paddleLen + paddlePos*2 + ballPos(x, y) + ballV, + ballRad
  hidden = tf.layers.dense({
    units: this.hiddenUnits, 
    activation: 'relu', 
    inputShape: [8],
    kernelInitializer: 'glorotUniform',
    name: 'hidden'
  });
  /** outputs the highest probability action given the observed prior state */
  //  switch activation to softmax to handle num actions > 2
  output = tf.layers.dense({units: 1, activation: 'sigmoid'});

  constructor(game: Game, player: string) {
    this.game = game;
    this.player = player;
    // build and compile the policy network
    this.policyNet.add(this.hidden);
    this.policyNet.add(this.output);

    // NOTE: try vanilla logLoss first but may need a custom loss function.
    // QUESTION: does the model need to be compiled with an optimizer and loss function
    // if we aren't using the built in model.train function? 
    // does it need to be compiled at all?
  }

  /** Stochastically determine the next action for the given state according to the policy */
  nextAction(state: Array<number>) {
    // set the output layer's activation to softmax and use tf.argmax() to handle more than 2 actions
    const prediction = tf.tidy(() => {
      const stateTensor = tf.tensor2d(state, [1, 8]);
      return this.policyNet.predict(stateTensor, {batchSize: 1});
    }) as tf.Tensor;
    // prediction.print(true);
    const action = tf.tidy(() => {
      const output = prediction.squeeze().dataSync()[0];
      return output;
    })
    // console.log(output);
    const choice = Math.random() < action ? 1 : 0;
    this.actions[this.player][choice]();
    prediction.dispose();
  }
}
