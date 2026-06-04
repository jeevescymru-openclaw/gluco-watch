export const RATING_MIN = 1;

export const RATING_MAX = 5;

export const RATING_VALUES = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_unused, index) => RATING_MIN + index,
);

export const DOT_SIZE = 48;
