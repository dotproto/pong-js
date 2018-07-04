export const P1: unique symbol = Symbol('P1');
export const P2: unique symbol = Symbol('P2');

export type Player = typeof P1 | typeof P2;

export const Player: {
  P1: typeof P1,
  P2: typeof P2
} = {
  P1,
  P2,
};
