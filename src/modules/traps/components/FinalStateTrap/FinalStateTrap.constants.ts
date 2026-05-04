import type { ClaimStep } from "./FinalStateTrap.types";

export const STEP_HINT: Record<ClaimStep, string> = {
  t0: "Implausible: claims only the initial state — trivially detected",
  t1: "Partial: claims intermediate step — H_prop detects both transitions",
  t2: "Dangerous: claims final state — H_out passes, but H_prop fails",
};

export const STEP_VERDICT: Record<ClaimStep, string> = {
  t2: "⚠ H_out is satisfied — only H_prop detects the missing history",
  t1: "✗ Both transitions t=0→1 and t=1→2 are missing — H_prop is high",
  t0: "✗ Trivially detected — no evolution performed at all",
};

export const TICK_ANNOTATION: Record<ClaimStep, string> = {
  t2: "prover prepares |ψ₂⟩⊗|2⟩ directly — skips t=0,1",
  t1: "prover prepares |ψ₁⟩⊗|1⟩ directly — skips t=0,2",
  t0: "prover prepares |ψ₀⟩⊗|0⟩ directly — skips t=1,2",
};
