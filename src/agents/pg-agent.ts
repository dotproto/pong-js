import * as tf from "@tensorflow/tfjs";

export class PGAgent {
  /** Hyperparameters */
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
  hidden = tf.layers.dense({units: this.hidden_units, activation: 'relu', inputShape: [6]});
  /** outputs the best action for the observed prior state */
  //  switch to softmax to handle num actions > 2 
  output = tf.layers.dense({units: 1, activation: 'sigmoid'});

  constructor() {
    /** build and compile the policy network */
    this.policy_net.add(this.hidden);
    this.policy_net.add(this.output);

    this.policy_net.compile({loss: 'logLoss', optimizer: tf.train.adam(this.alpha)});
  }

  // paraphrased from karpathy. not sure if we need to reset G (line 47) when batch_size = 1 game
  discount_rewards(rewards: Array<number>) {
    let discounted_rewards: Array<number> = Array(rewards.length);
    this.discount_rewards.fill(0); // huh?
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
    // TODO/QUESTION: discounted_rewards has to be converted into a tensor before
    // it can be used for fit/train. convert before returning or after?
    return discounted_rewards;
  }

  /** ... */
  async train() {
    await this.policy_net.fit(this.action_history, this.reward_history);
  }

  /** Return the best action for for the given state according to the policy */
  next_action(state: tf.Tensor) {
    return this.policy_net.predict(state);
  }

}
