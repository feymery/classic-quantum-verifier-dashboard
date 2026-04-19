import type { SampledExpectations2Q } from "../../../physics/measurements2Q";

export interface ObsRow {
  key: keyof SampledExpectations2Q;
  label: string;
  desc: string;
  special?: "cnot" | "primary" | "crosscheck";
}

export const ROWS: ObsRow[] = [
  { key: "Z1Z2", label: "⟨Z₁Z₂⟩", desc: "clock·work1 ZZ", special: "primary" },
  { key: "X1X2", label: "⟨X₁X₂⟩", desc: "clock·work1 XX", special: "primary" },
  {
    key: "Z1Z3",
    label: "⟨Z₁Z₃⟩",
    desc: "clock·work2 ZZ",
    special: "crosscheck",
  },
  {
    key: "X1X3",
    label: "⟨X₁X₃⟩",
    desc: "clock·work2 XX",
    special: "crosscheck",
  },
  { key: "Z2Z3", label: "⟨Z₂Z₃⟩", desc: "work1·work2 ZZ", special: "cnot" },
  { key: "X2X3", label: "⟨X₂X₃⟩", desc: "work1·work2 XX" },
  { key: "Z1", label: "⟨Z₁⟩", desc: "clock magnetisation" },
  { key: "Z2", label: "⟨Z₂⟩", desc: "work1 magnetisation" },
  { key: "Z3", label: "⟨Z₃⟩", desc: "work2 magnetisation" },
  { key: "Z1Z2Z3", label: "⟨Z₁Z₂Z₃⟩", desc: "3-qubit parity" },
];

export const SPECIAL_COLORS = {
  primary: "#a78bfa",
  crosscheck: "#a78bfa",
  cnot: "#34d399",
} as const;
