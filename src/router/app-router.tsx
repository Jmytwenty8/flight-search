import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router";

const FlightSearchPage = React.lazy(() =>
  import("@/pages/flight-search-page").then((m) => ({ default: m.FlightSearchPage }))
);

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Router-level error fallback
function RouterErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Page Error</h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => window.location.href = "/"}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <FlightSearchPage />
      </Suspense>
    ),
    errorElement: <RouterErrorFallback />,
  },
]);

export default AppRouter;