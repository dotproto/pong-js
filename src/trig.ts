/** Math.PI is too long :( */
export const PI = Math.PI;

/** Math.PI * 2 is even longer. Plus we shouldn't re-calculate that value every time we need it */
export const TAU = Math.PI * 2;

/** Reflect the input angle across the X axis */
export const mirrorX = (radians:number) =>
    TAU - radians;

/** Reflect the input angle across the Y axis */
export const mirrorY = (radians:number) =>
  radians < PI
    ? PI - radians
    : PI * 3 - radians;
