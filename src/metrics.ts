import embed from 'vega-embed';

export class Metrics {
  lossLabel = document.getElementById('loss-label');
  rewardLabel = document.getElementById('reward-label');
  
  plotLosses(losses: Array<number>) {
    embed(
      '#loss-canvas', {
        '$schema': 'https://vega.github.io/schema/vega-lite/v2.json',
        'data': {'values': losses},
        'mark': {'type': 'line'},
        'width': 260,
        'encoding': {
          'x': {'field': 'batch', 'type': 'ordinal'},
          'y': {'field': 'loss', 'type': 'quantitative'},
          'color': {'field': 'set', 'type': 'nominal', 'legend': null},
        }
      },
      {width: 360});
  }
  
  plotRewards(rewards: Array<number>) {
    embed(
      '#reward-canvas', {
        '$schema': 'https://vega.github.io/schema/vega-lite/v2.json',
        'data': {'values': rewards},
        'width': 260,
        'mark': {'type': 'line', 'legend': null},
        'encoding': {
          'x': {'field': 'batch', 'type': 'ordinal'},
          'y': {'field': 'accuracy', 'type': 'quantitative'},
          'color': {'field': 'set', 'type': 'nominal', 'legend': null},
        }
      },
      {'width': 360});
  }
}
