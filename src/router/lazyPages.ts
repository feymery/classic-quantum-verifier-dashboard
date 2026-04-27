import { lazy } from "react";

export const ExperimentPage = lazy(async () => {
  const module = await import("../pages/ExperimentPage");
  return { default: module.ExperimentPage };
});

export const VisualizationPage = lazy(async () => {
  const module = await import("../pages/VisualizationPage");
  return { default: module.VisualizationPage };
});

export const CircuitPage = lazy(async () => {
  const module = await import("../pages/Circuit2QPage");
  return { default: module.CircuitPage };
});

export const AdversarialPage = lazy(async () => {
  const module = await import("../modules/adversarial/pages/AdversarialPage");
  return { default: module.AdversarialPage };
});

export const TrapsPage = lazy(async () => {
  const module = await import("../pages/TrapsPage");
  return { default: module.TrapsPage };
});
