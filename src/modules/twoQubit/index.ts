/**
 * twoQubit module — 2-qubit clock protocol extension
 *
 * Physics:   hamiltonian2Q.ts, measurements2Q.ts
 * Services:  simulate2Q.ts, backendExperiment2Q.ts
 * Components: TwoQubitPanel/
 * Pages:     CircuitPage.tsx
 */

// Physics
export * from "./physics/hamiltonian2Q";
export * from "./physics/measurements2Q";

// Services
export { runExperiment2Q } from "./services/simulate2Q";
export type {
  ExperimentConfig2Q,
  ExperimentResult2Q,
} from "./services/simulate2Q";

// Components
export { TwoQubitPanel } from "./components/TwoQubitPanel/index";
