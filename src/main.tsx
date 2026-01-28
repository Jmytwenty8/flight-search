import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import "./index.css";
import AppRouter from "./router/app-router.tsx";
import { QueryProvider, ErrorBoundary } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <NuqsAdapter>
          <RouterProvider router={AppRouter} />
        </NuqsAdapter>
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>
);
