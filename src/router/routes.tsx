import { Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import {
  DashboardPage,
  ExperimentPage,
  VisualizationPage,
  CircuitPage,
  AdversarialPage,
} from "./lazyPages";

function withPageLoader(node: ReactNode) {
  return (
    <Suspense
      fallback={
        <div
          className="rounded-3xl border px-4 py-5 font-mono text-[11px]"
          style={{
            borderColor: "#2d2b3a",
            background: "#181620",
            color: "#9490a8",
          }}
        >
          loading route module...
        </div>
      }
    >
      {node}
    </Suspense>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: withPageLoader(<DashboardPage />) },
      { path: "experiment", element: withPageLoader(<ExperimentPage />) },
      { path: "visualization", element: withPageLoader(<VisualizationPage />) },
      { path: "circuit", element: withPageLoader(<CircuitPage />) },
      { path: "adversarial", element: withPageLoader(<AdversarialPage />) },
    ],
  },
]);
