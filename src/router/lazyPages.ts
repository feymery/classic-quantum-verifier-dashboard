import { lazy } from "react";

export const DashboardPage = lazy(async () => {
  const module = await import("../pages/DashboardPage");
  return { default: module.DashboardPage };
});

export const ExperimentPage = lazy(async () => {
  const module = await import("../pages/ExperimentPage");
  return { default: module.ExperimentPage };
});

export const VisualizationPage = lazy(async () => {
  const module = await import("../pages/VisualizationPage");
  return { default: module.VisualizationPage };
});

export const CircuitPage = lazy(async () => {
  const module = await import("../modules/twoQubit/pages/CircuitPage");
  return { default: module.CircuitPage };
});

export const AdversarialPage = lazy(async () => {
  const module = await import("../modules/adversarial/pages/AdversarialPage");
  return { default: module.AdversarialPage };
});

export const TrapsPage = lazy(async () => {
  const module = await import("../modules/traps/pages/TrapsPage");
  return { default: module.TrapsPage };
});
