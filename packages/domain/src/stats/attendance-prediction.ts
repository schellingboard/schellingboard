const K = 0.66;
const INTRINSIC_VARIANCE = 0.3134;
const Z = { 0.5: 0.674, 0.8: 1.282 } as const;

export type PredictionConfidence = keyof typeof Z;

export type PredictionInput = {
  share: number;
  voters: number;
  attendees: number;
  parallel: number;
  meanShare: number;
};

export type Prediction = { low: number; mid: number; high: number };

export const meanInterestShare = (shares: readonly number[]) =>
  shares.length === 0 ? 0 : shares.reduce((s, v) => s + v, 0) / shares.length;

export function predictAttendance(
  input: PredictionInput,
  confidence: PredictionConfidence
): Prediction | null {
  const { share, voters, attendees, parallel, meanShare } = input;
  if (share <= 0 || voters <= 0 || meanShare <= 0 || parallel <= 0) return null;
  const mid = K * (attendees / parallel) * (share / meanShare);
  const sigma = Math.sqrt(INTRINSIC_VARIANCE + (1 - share) / (share * voters));
  const factor = Math.exp(Z[confidence] * sigma);
  return { low: mid / factor, mid, high: mid * factor };
}

export const rangeCovers = (
  predicted: Pick<Prediction, "low" | "high">,
  reported: { min: number; max: number }
) => reported.max >= predicted.low && reported.min <= predicted.high;
