import { lazy } from "react";

export const MotivationPage = lazy(async () => {
  const module = await import("../pages/MotivationPage");
  return { default: module.MotivationPage };
});

export const ExperimentPage = lazy(async () => {
  const module = await import("../pages/ExperimentPage");
  return { default: module.ExperimentPage };
});

export const AdversarialPage = lazy(async () => {
  const module = await import("../pages/AdversarialPage");
  return { default: module.TrapsPage };
});

export const ConclusionsPage = lazy(async () => {
  const module = await import("../pages/ConclusionsPage");
  return { default: module.ConclusionsPage };
});

export const FundamentalsPage = lazy(async () => {
  const module = await import("../pages/FundamentalsPage");
  return { default: module.FundamentalsPage };
});
