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

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <FlightSearchPage />
      </Suspense>
    ),
  },
]);

export default AppRouter;