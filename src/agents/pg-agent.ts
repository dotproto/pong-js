import * as tf from "@tensorflow/tfjs";
import { Game, GameState } from "../index";

/** 
 * A reinforcement learning agent that uses a policy gradient to play pong.
 * The policy representation is a simple two layer neural net with 1 hidden layer
 * of 25 relu nodes and a sigmoid output layer.
 * TODO: talk about loss function and optimizer
 * TODO: hyperparameters
 */
export class PGAgent {
  game: Game;
  state: tf.Tensor;

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
  hidden_units = 25;

  // The numbers here are placeholders because i dont know a better way.
  // update with tf.variable.assign
  state_history = tf.variable(tf.zeros([6]));
  action_history = tf.variable(tf.zeros([1]));
  reward_history = tf.variable(tf.zeros([1]));

  /** Policy network - outputs the probability of an action given the current state */
  policy_net = tf.sequential();
  /** hidden layer of the policy net */
  //  TODOs:
  //    hidden.config.inputShape = State.shape
  //    State.shape = paddleLen + paddlePos*2 + ballPos(x, y) + ballV, + ballRad
  hidden = tf.layers.dense({
    units: this.hidden_units, 
    activation: 'relu', 
    inputShape: [6],
    kernelInitializer: 'glorotUniform',
    name: 'hidden'
  });
  /** outputs the highest probability action given the observed prior state */
  //  switch activation to softmax to handle num actions > 2
  output = tf.layers.dense({units: 1, activation: 'sigmoid'});

  constructor(game: Game) {
    this.game = game;
    this.state = game.getStateTensor();

    // build and compile the policy network
    this.policy_net.add(this.hidden);
    this.policy_net.add(this.output);

    // NOTE: try vanilla logLoss first but may need a custom loss function.
    this.policy_net.compile({optimizer: tf.train.adam(this.alpha), loss: tf.losses.logLoss});
  }

  // paraphrased from karpathy. not sure if we need to reset G (line 47) when batch_size = 1 game
  discount_rewards(rewards: Array<number>) {
    let discounted_rewards: Array<number> = Array.apply(null, Array(rewards.length)).map(() => 0);
    // discounted_rewards.fill(0); throws an error...because we're targeting es5?
    /** G is the `return` the cumulative discounted reward after time t */
    let G = 0.0;
    // loop from rewards.size to 0
    for (let t = rewards.length; t >= 0; t--) {
      // from karpathy blog:  reset the sum, since this was a game boundary (pong specific!)
      // that might be specific to the way ai-gym handles the rewards. 
      if (rewards[t] != 0 ) {
        G = 0.0;
      }
        G = G * this.gamma + rewards[t];
        discounted_rewards[t] = G
    }
    // TODO: convert to tensor
    return discounted_rewards;
  }

  /** ... */
  async train() {
    await this.policy_net.fit(this.action_history, this.reward_history);
  }

  /** Stochastically determine the next action for the given state according to the policy */
  next_action(state: tf.Tensor) {
    // set the output layer's activation to softmax and use tf.argmax() to handle more than 2 actions
    const prediction = this.policy_net.predict(state, {batchSize: 1}) as tf.Tensor;
    prediction.print(true)
    const output = prediction.squeeze().dataSync()[0]
    const choice = Math.random() < output ? 1 : 0;
    this.actions[choice]();
  }
}
