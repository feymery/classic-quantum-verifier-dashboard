import { lazy } from "react";

export const ExperimentPage = lazy(async () => {
  const module = await import("../pages/ExperimentPage");
  return { default: module.ExperimentPage };
});

export const TrapsPage = lazy(async () => {
  const module = await import("../pages/TrapsPage");
  return { default: module.TrapsPage };
});

export const FundamentalsPage = lazy(async () => {
  const module = await import("../pages/FundamentalsPage");
  return { default: module.FundamentalsPage };
});
