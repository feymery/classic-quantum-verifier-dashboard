export interface KeyAlpha {
  value: number;
  label: string;
  desc: string;
  insight: string;
  color: string; // CSS hex for this preset's accent
}

export interface AlphaControlProps {
  alpha: number;
  setAlpha: (v: number) => void;
  comparisonAlphas: number[];
  setComparisonAlphas: (alphas: number[]) => void;
}
