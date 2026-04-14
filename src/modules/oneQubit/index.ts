/**
 * oneQubit module — 1-qubit clock protocol
 *
 * Physics:   hamiltonian.ts, measurements.ts
 * Services:  simulate1Q.ts, backendExperiment1Q.ts, quantumApi.ts
 * Components: MeasurementPanel/
 */

// Physics
export * from "./physics/hamiltonian";
export * from "./physics/measurements";

// Services
export { runExperiment, runComparison } from "./services/quantumApi";
export type { ExperimentConfig, ExperimentResult } from "./services/quantumApi";

// Components
export { MeasurementPanel } from "./components/MeasurementPanel/index";
