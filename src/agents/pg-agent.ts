import * as tf from "@tensorflow/tfjs";
import { Game } from "../index";
import { Rank } from "@tensorflow/tfjs";

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
  learningRate = 0.001;
  beta1 = 0.9;
  beta2 = 0.999;
  /** Discount factor - */
  gamma = 0.99;
  /** the numbers of time steps to train on per gradient update */
  batchSize = 64;
  /** size of the policy network's hidden layer */
  hiddenUnits = 25;

  stateHistory: Array<Array<number>> = []; 
  actionHistory: Array<number> = [];
  rewardHistory: Array<number> = [];

  /** Policy network - outputs the probability of an action given the current state */
  /** hidden layer of the policy net */
  //  TODOs:
  //    hidden.config.inputShape = State.shape
  //    State.shape = paddleLen + paddlePos*2 + ballPos(x, y) + ballV, + ballRad
  optimizer = tf.train.adam(this.learningRate, this.beta1, this.beta2);

  input = tf.input({shape: [8]});

  hiddenLayer = tf.layers.dense({
    inputShape: [8],
    units: this.hiddenUnits, 
    activation: 'relu',
    kernelInitializer: 'glorotUniform',
    name: 'hidden'
  });

  /** outputs the highest probability action given the observed prior state */
  //  switch activation to softmax to handle num actions > 2
  outputLayer = tf.layers.dense({
    units: 1, 
    activation: 'sigmoid', 
    name: 'output'
  });

  policyNet = tf.model({
    inputs: this.input, 
    outputs: this.outputLayer.apply(this.hiddenLayer.apply(this.input)) as tf.SymbolicTensor
  });

  predict(state: any) {
    return tf.tidy(() => {
      return this.outputLayer.apply(this.hiddenLayer.apply(state)) as tf.Tensor;
    })
  }

  loss(predictions: tf.Tensor, actions: tf.Tensor, rewards: tf.Tensor) {
    return tf.tidy(() => {
      // add scalar to all rewards to prevent 0 rewards returning losses of NaN
      const adjustedRewards = rewards.add(tf.scalar(0.000001));
      return tf.losses.logLoss(actions, predictions, adjustedRewards, 0.000001);
    })
  }

  constructor(game: Game) {
    this.game = game;
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
    /** G is the `return` the cumulative discounted reward after time t */
    let G = 0;
    // loop from rewards.size to 0
    for (let t = rewards.length - 1; t >= 0; t--) {
      if (Math.abs(rewards[t]) === 10) {
        G = 0;
      }
        G = G * this.gamma + rewards[t];
        discountedRewards[t] = G;
    }
    return discountedRewards;
  }

  /** ... */
  train(epochs: number) {
    const numSamples = this.rewardHistory.length;
    // right now train is called after actionHistory gets updated and before
    // reward and state history are updated so you have to slice off the last action
    // TODO: stop calling updateActionHistory inside of nextAction and call it after train instead.
    const actionHistory = this.actionHistory.slice(0, -1);

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let t = 0; t < numSamples; t += this.batchSize) {

        const stateBatch = tf.tidy(() => {
          return tf.tensor2d(this.stateHistory.slice(t, t+this.batchSize));
        });
        const rewardBatch = tf.tidy(() => { 
          return tf.tensor1d(
            this.discountRewards(this.rewardHistory.slice(t, t+this.batchSize)));
        });
        const actionBatch = tf.tidy(() => { 
          return tf.tensor1d(actionHistory.slice(t, t+this.batchSize));
        });

        this.optimizer.minimize(() => {
          let predictions = this.predict(stateBatch) as tf.Variable<Rank.R1>;
          const loss = this.loss(
            actionBatch, 
            predictions.squeeze(),
            rewardBatch
          ) as tf.Tensor<Rank.R0>;

          loss.print();

          return loss;
        });

        rewardBatch.dispose();
        actionBatch.dispose();
        stateBatch.dispose();
      }
    }
  }

  /** Stochastically determine the next action for the given state according to the policy */
  nextAction(state: Array<number>) {
      // set the output layer's activation to softmax and use tf.argmax() to handle more than 2 actions
      const prediction = tf.tidy(() => {
        const stateTensor = tf.tensor2d(state, [1, 8]);
        return this.policyNet.predict(stateTensor);
      }) as tf.Tensor;
      // prediction.print(true);
      const action = tf.tidy(() => {
        return prediction.squeeze().dataSync()[0];
      })
      const choice = Math.random() < action ? 1 : 0;
      this.actions[choice]();
      this.updateActionHistory(choice);
      prediction.dispose();
  }
}
