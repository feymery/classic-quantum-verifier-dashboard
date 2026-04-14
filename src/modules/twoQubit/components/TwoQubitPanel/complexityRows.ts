export interface Row {
  aspect: string;
  oneQ: string;
  twoQ: string;
  why: string;
  highlight?: boolean;
}

export const ROWS: Row[] = [
  {
    aspect: "total qubits",
    oneQ: "2",
    twoQ: "3",
    why: "Hilbert space doubles from 2^2 to 2^3.",
  },
  {
    aspect: "clock qubits",
    oneQ: "1",
    twoQ: "1",
    why: "Verifier clock is unchanged.",
  },
  {
    aspect: "work qubits",
    oneQ: "1",
    twoQ: "2",
    why: "Need one extra target for entanglement checks.",
  },
  {
    aspect: "entanglement",
    oneQ: "none",
    twoQ: "CNOT in work register",
    why: "Adds non-classical correlation constraints.",
    highlight: true,
  },
  {
    aspect: "state dimension",
    oneQ: "4  (2²)",
    twoQ: "8  (2³)",
    why: "More basis outcomes to sample.",
  },
  {
    aspect: "Z observables",
    oneQ: "2  (Z₁, Z₂)",
    twoQ: "3  (Z₁, Z₂, Z₃)",
    why: "New work qubit introduces one extra local term.",
  },
  {
    aspect: "ZZ observables",
    oneQ: "1  (Z₁Z₂)",
    twoQ: "3  (Z₁Z₂, Z₁Z₃, Z₂Z₃)",
    why: "Pairwise correlations scale with qubit pairs.",
  },
  {
    aspect: "XX observables",
    oneQ: "1  (X₁X₂)",
    twoQ: "3  (X₁X₂, X₁X₃, X₂X₃)",
    why: "Cross-check channel duplicates the primary estimator.",
  },
  {
    aspect: "total observables",
    oneQ: "4",
    twoQ: "10",
    why: "Coverage broadens from local checks to structural checks.",
    highlight: true,
  },
  {
    aspect: "energy estimators",
    oneQ: "1",
    twoQ: "2  (averaged)",
    why: "Primary + cross-check improves robustness.",
  },
  {
    aspect: "CNOT signature",
    oneQ: "n/a",
    twoQ: "⟨Z₂Z₃⟩ = 1",
    why: "Hard to spoof together with correct energy.",
    highlight: true,
  },
  {
    aspect: "circuit depth",
    oneQ: "O(1)",
    twoQ: "O(1)  (+1 CNOT)",
    why: "Depth barely changes, but verification conditions do.",
  },
  {
    aspect: "fake-prover constraint",
    oneQ: "energy only",
    twoQ: "energy + correlations",
    why: "Attacker must satisfy multiple independent checks.",
    highlight: true,
  },
];

export const SUMMARY = {
  observablesGrowth: "4 -> 10",
  basisGrowth: "4 -> 8",
  expectedShotMultiplier: "~2x to stabilize variance",
};
