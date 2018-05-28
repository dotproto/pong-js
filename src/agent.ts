import * as tf from '@tensorflow/tfjs'
enum Player {
  P1 = 'p1',
  P2 = 'p2',
}

enum Move {
  UP = 'up',
  DOWN = 'down',
}

export default class PGAgent {
  /** Hyperparameters */
  /** Learning rate - */
  alpha = 1e-4;
  /** Discount factor - */
  gamma = 0.99;
  /** size of the policy network's hidden layer */
  hidden_units = 50;

  /** Policy network - outputs the probability of an action given the current state */
  policy_net = tf.sequential();
  /** hidden layer of the policy net */
  //  TODOs:
  //    h.config.inputShape = State.shape
  //    State.shape = paddleLen + paddlePos*2 + ballPos(x, y) + ballV, + ballRad
  hidden = tf.layers.dense({units: this.hidden_units, activation: 'relu', inputShape: [6]});
  /** outputs the best action for the observed prior state */
  // need to switch to softmax to handle num actions > 2 
  best_action = tf.layers.dense({units: 1, activation: 'sigmoid'});
  /**  */
  loss = tf.losses.logLoss(labels=tf.variable, predictions=tf.variable, weights=tf.variable);

  constructor (actions:Move[]) {
    /** build and compile the policy network */
    this.policy_net.add(this.hidden);
    this.policy_net.add(this.best_action);

    this.policy_net.compile({loss: this.loss, optimizer: tf.train.adam(this.alpha)});
  }

  discount(r, gamma) {
    let discounted_reward = tf.zerosLike(r);
    let G = 0.0;
    /** loop from 0 to r.size 
     *  if r[t] != 0 then set run = 0
     *  G = G * gamma + r[t]
     *  discounted_reward[t] = G
    */
    return discounted_reward;
  }
}
