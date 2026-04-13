import { RouterProvider } from "react-router-dom";
import { appRouter } from "./router/routes";
import { AppStateProvider } from "./state/AppStateContext";

function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={appRouter} />
    </AppStateProvider>
  );
}

export default App;
