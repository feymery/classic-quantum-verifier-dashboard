/**
 * adversarial module — adversarial attack analysis and detection
 *
 * Physics:   adversarial.ts, detection.ts
 * Services:  adversarialApi.ts, simulateAdversarial.ts
 * Components: AdversarialControlPanel/, AdversarialPlot/,
 *             DetectionPanel/, AdversarialCircuitPanel/
 * Pages:     AdversarialPage.tsx
 */

// Physics
export * from "./physics/adversarial";
export * from "./physics/detection";

// Services
export { simulateAdversarial } from "./services/simulateAdversarial";
export type {
  SimulateAdversarialParams,
  SimulateAdversarialResult,
} from "./services/simulateAdversarial";

// Components
export { AdversarialControlPanel } from "./components/AdversarialControlPanel/AdversarialControlPanel";
export { AdversarialPlot } from "./components/AdversarialPlot/AdversarialPlot";
export { DetectionPanel } from "./components/DetectionPanel/DetectionPanel";
export { AdversarialCircuitPanel } from "./components/AdversarialCircuitPanel/AdversarialCircuitPanel";
