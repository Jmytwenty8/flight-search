import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FlightCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Airline logo */}
          <Skeleton className="w-8 h-8 rounded" />

          {/* Flight times */}
          <div className="flex-1">
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-8">
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-10" />
              </div>

              <div className="flex-1 max-w-[200px] px-2">
                <Skeleton className="h-3 w-16 mx-auto mb-2" />
                <Skeleton className="h-[2px] w-full" />
                <Skeleton className="h-3 w-12 mx-auto mt-2" />
              </div>

              <div className="space-y-2 text-right">
                <Skeleton className="h-6 w-16 ml-auto" />
                <Skeleton className="h-4 w-10 ml-auto" />
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FlightResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FlightCardSkeleton key={i} />
      ))}
    </div>
  );
}
