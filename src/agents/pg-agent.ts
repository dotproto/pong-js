import * as tf from "@tensorflow/tfjs";
import { Game } from "../index";

/**
 * A reinforcement learning agent that uses a policy gradient to play pong.
 * The policy representation is a simple two layer neural net with 1 hidden layer
 * of 25 relu nodes and a sigmoid output layer.
 * TODO: talk about loss function and optimizer
 * TODO: hyperparameters
 */
export class PGAgent {
  game: Game;

  actions = [
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
  ]

  /** Learning rate - */
  alpha = 1e-4;
  /** Discount factor - */
  gamma = 0.99;
  /** size of the policy network's hidden layer */
  hiddenUnits = 25;

  stateHistory: Array<Array<number>> = []; 
  actionHistory: Array<number> = [];
  rewardHistory: Array<number> = [];

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

  constructor(game: Game) {
    this.game = game;

    // build and compile the policy network
    this.policyNet.add(this.hidden);
    this.policyNet.add(this.output);

    // NOTE: try vanilla logLoss first but may need a custom loss function.
    this.policyNet.compile({optimizer: tf.train.adam(this.alpha), loss: tf.losses.logLoss});
  }

  updateRewardHistory(reward: number) {
    this.rewardHistory.push(reward);
  }

  updateStateHistory(state: Array<number>) {
    this.stateHistory.push(state);
  }

  updateActionHistory(action: number) {
    this.actionHistory.push(action);
  }

  discountRewards(rewards: Array<number>) {
    let discountedRewards: Array<number> = Array.apply(null, Array(rewards.length)).map(() => 0);
    // discounted_rewards.fill(0); 
    /** G is the `return` the cumulative discounted reward after time t */
    let G = 0.0;
    // loop from rewards.size to 0
    for (let t = rewards.length; t >= 0; t--) {
      if (Math.abs(rewards[t]) === 10) {
        G = 0.0;
      }
        G = G * this.gamma + rewards[t];
        discountedRewards[t] = G;
    }
    return discountedRewards;
  }

  /** ... */
  async train() {
    const x = tf.tidy(() => { 
      const stateTensor = tf.tensor2d(this.stateHistory);
      return tf.variable(stateTensor);
    });
    const y = tf.tidy(() => {
      const actionTensor = tf.tensor1d(this.actionHistory.slice(0, -1));
      return tf.variable(actionTensor);
    });
    const w = tf.tidy(() => {
      const rewardTensor = tf.tensor1d(this.rewardHistory);
      return tf.variable(rewardTensor);
    });
    const response = await this.policyNet.fit(x, y, {sampleWeight: w});
    console.log(response.history.loss[0]);
    x.dispose();
    y.dispose();
    w.dispose();
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
      this.actions[choice]();
      this.updateActionHistory(choice);
      prediction.dispose();
  }
}
