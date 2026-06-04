import { RATING_MAX } from './constants';

/** Renders a 1–5 rating as `value/5` for display. */
export const formatRating = (value: number): string => `${value}/${RATING_MAX}`;
