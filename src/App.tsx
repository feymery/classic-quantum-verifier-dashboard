import { RouterProvider } from "react-router-dom";
import { appRouter } from "./router/routes";
import { AppStateProvider } from "./state/AppStateContext";
import { ToastProvider } from "./ui/Toast";

function App() {
  return (
    <ToastProvider>
      <AppStateProvider>
        <RouterProvider router={appRouter} />
      </AppStateProvider>
    </ToastProvider>
  );
}

export default App;
