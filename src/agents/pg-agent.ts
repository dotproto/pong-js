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
      const p = tf.mul(predictions, actions)
      const logp = tf.log(tf.sum(p, 1))
      const loss = tf.neg(tf.sum(tf.mul(rewards, logp)))
      return loss
    })
  }

  constructor(game: Game) {
    this.game = game;

    // build and compile the policy network

    // NOTE: try vanilla logLoss first but may need a custom loss function.
    // QUESTION: does the model need to be compiled with an optimizer and loss function
    // if we aren't using the built in model.train function? 
    // does it need to be compiled at all?
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
  train() {
    const numSamples = this.rewardHistory.length;
    // right now train is called after actionHistory gets updated and before
    // reward and state history are updated so you have to slice off the last action
    // TODO: stop calling updateActionHistory inside of nextAction and call it after train instead.
    const actionHistory = this.actionHistory.slice(0, -1);

    for (let t = 0; t < numSamples; t += this.batchSize) {

      const stateBatch = tf.tensor2d(this.stateHistory.slice(t, t+this.batchSize));

      let rewardBatch = tf.tidy(() => { 
        return tf.tensor1d(this.rewardHistory.slice(t, t+this.batchSize));
      });
      let actionBatch = tf.tidy(() => { 
        return tf.tensor1d(actionHistory.slice(t, t+this.batchSize));
      });

      this.optimizer.minimize(() => {

        // let predictionVar = tf.variable(this.policyNet.predict(stateBatch)as tf.Tensor) as tf.Variable;
        // predictionVar.print(true);
        // console.log(tf.losses.logLoss(actionBatch, predictionVar.squeeze(), rewardBatch, 0.0001).print());
        // return tf.losses.logLoss(actionBatch, predictionVar.squeeze(), rewardBatch, 0.0001);

        let predictions = this.predict(stateBatch) as tf.Variable<Rank.R1>;
        console.log('******************START PREDICTIONS ******************')
        predictions.print(true);
        console.log('******************END PREDICTIONS ******************')
        const loss = this.loss(
          actionBatch, 
          predictions,
          rewardBatch, 
        ) as tf.Tensor<Rank.R0>

        loss.print();

        return loss;
      });
      // predictions.dispose();
      rewardBatch.dispose();
      actionBatch.dispose();
      stateBatch.dispose();
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
        const output = prediction.squeeze().dataSync()[0];
        return output;
      })
      const choice = Math.random() < action ? 1 : 0;
      this.actions[choice]();
      this.updateActionHistory(choice);
      prediction.dispose();
  }
}
