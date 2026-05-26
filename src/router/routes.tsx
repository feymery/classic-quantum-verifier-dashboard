import { Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import {
  ConclusionsPage,
  ExperimentPage,
  AdversarialPage,
  FundamentalsPage,
  MotivationPage,
} from "./lazyPages";

function withPageLoader(node: ReactNode) {
  return (
    <Suspense
      fallback={
        <div
          className="rounded-lg border px-4 py-5  text-[11px]"
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
      { index: true, element: <Navigate to="/motivation" replace /> },
      { path: "motivation", element: withPageLoader(<MotivationPage />) },
      { path: "fundamentals", element: withPageLoader(<FundamentalsPage />) },
      { path: "1Qexperiment", element: withPageLoader(<ExperimentPage />) },
      { path: "adversarial", element: withPageLoader(<AdversarialPage />) },
      { path: "conclusions", element: withPageLoader(<ConclusionsPage />) },
    ],
  },
]);
