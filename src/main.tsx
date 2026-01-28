import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import "./index.css";
import AppRouter from "./router/app-router.tsx";
import { QueryProvider, ErrorBoundary, ThemeProvider } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryProvider>
          <NuqsAdapter>
            <RouterProvider router={AppRouter} />
          </NuqsAdapter>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
