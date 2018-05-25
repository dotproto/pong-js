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

  hidden_layer_neurons = 200
  batch_size = 10
  learning_rate = 1e-4
  gamma = 0.99
  decay_rate = 0.99
  render = false

  model = tf.sequential();

  actions = []

  constructor (actions:Move[]) {
    /** fully connected nn. */
    this.model.add(
      tf.layers.dense({
        units: this.hidden_layer_neurons,
        activation: 'relu',
        inputShape: [1]
      })
    )
    this.model.add(
      tf.layers.dense({
        units: this.
      })
    )
    /** training procedure. */

  }
}
