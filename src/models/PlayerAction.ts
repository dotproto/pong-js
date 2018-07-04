export const up: unique symbol = Symbol('up');
export const down: unique symbol = Symbol('down');
export const stay: unique symbol = Symbol('stay');

export type PlayerAction = typeof up | typeof down | typeof stay;

export const PlayerAction: {
  up: typeof up,
  down: typeof down,
  stay: typeof stay,
} = {
  up,
  down,
  stay,
};
