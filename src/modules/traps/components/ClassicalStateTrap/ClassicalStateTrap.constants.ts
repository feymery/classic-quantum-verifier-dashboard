import type { TrapState2Q } from "./ClassicalStateTrap.types";

export const ALL_STATES: TrapState2Q[] = ["00", "10", "11", "01"];

export const STATE_HINT: Record<TrapState2Q, string> = {
  "00": "Trivial: correct input but wrong output",
  "01": "Partial: may appear in the honest distribution",
  "10": "Worst choice: penalized directly by H_in",
  "11": "Dangerous: correct output, but H_prop exposes it",
};

export const VERDICT_SUBTITLE: Record<TrapState2Q, string> = {
  "11": "⚠ Looks honest in Z-basis — only H_prop exposes missing history",
  "10": "✗ Trivially detected — H_in directly penalizes |10⟩",
  "00": "✗ Detected — correct input but H_out and H_prop both fail",
  "01": "✗ Detected — H_prop exposes missing U(α) transition",
};
