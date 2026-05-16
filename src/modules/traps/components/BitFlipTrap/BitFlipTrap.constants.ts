export const P_MAX = 0.5;
export const P_STEP = 0.01;
export const DEFAULT_P = 0.1;

export const SHOTS_OPTIONS = [1, 10, 44, 64, 100, 1000, 10000] as const;
export type ShotsOption = (typeof SHOTS_OPTIONS)[number];
export const DEFAULT_SHOTS_OPTION: ShotsOption = 64;
