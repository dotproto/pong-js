import * as tf from '@tensorflow/tfjs'
import { Move } from './pong'

export class PGAgent {
  /** Hyperparameters */
  /** Learning rate - */
  alpha = 1e-4;
  /** Discount factor - */
  gamma = 0.99;
  /** size of the policy network's hidden layer */
  hidden_units = 25;

  // The numbers here are placeholders because i dont know a better way.
  // update tf.variable.assign
  state_history = tf.variable(tf.zeros([6]));
  action_history = tf.variable(tf.zeros([1]));
  reward_history = tf.variable(tf.zeros([1]));

  /** Policy network - outputs the probability of an action given the current state */
  policy_net = tf.sequential();
  /** hidden layer of the policy net */
  //  TODOs:
  //    h.config.inputShape = State.shape
  //    State.shape = paddleLen + paddlePos*2 + ballPos(x, y) + ballV, + ballRad
  hidden = tf.layers.dense({units: this.hidden_units, activation: 'relu', inputShape: [6]});
  /** outputs the best action for the observed prior state */
  //  switch to softmax to handle num actions > 2 
  output = tf.layers.dense({units: 1, activation: 'sigmoid'});

  constructor(actions:Move[]) {
    /** build and compile the policy network */
    this.policy_net.add(this.hidden);
    this.policy_net.add(this.output);

    this.policy_net.compile({loss: 'logLoss', optimizer: tf.train.adam(this.alpha)});
  }

  // paraphrased from karpathy. not sure if we need to reset G when batch_size = 1 game
  discount(rewards, gamma) {
    let discounted_rewards = tf.zerosLike(rewards);
    /** G is the cumulative discounted reward after time t */
    let G = 0.0;
    // loop from rewards.size to 0
    //   if rewards[t] != 0 then set G = 0 (pong specific)
    //   G = G * gamma + rewards[t]
    //   discounted_rewards[t] = G
    
    return discounted_rewards;
  }

  /** ... */
  async train() {
    await this.policy_net.fit(this.action_history, this.reward_history);
  }

  /** Return the best action for for the given state according to the policy */
  take_action(state) {
    return this.policy_net.predict(state);
  }

}


export class RandomAgent {
  actions = [];

  constructor (actions:Move[]) {
    this.actions = actions;
  }
  take_action(state) {
    var choice = Math.floor(Math.random() * this.actions.length);
    return this.actions[choice];
  }
}
