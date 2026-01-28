import { ArrowUpDown, Plane } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlightCard } from "./flight-card";
import { FlightResultsSkeleton } from "./flight-skeleton";
import type { FlightResult } from "../schemas";

interface FlightResultsListProps {
  bestFlights: FlightResult[];
  otherFlights: FlightResult[];
  isLoading?: boolean;
  sortBy: "price" | "duration" | "departure" | "arrival";
  onSortChange: (sort: "price" | "duration" | "departure" | "arrival") => void;
  totalResults: number;
  filteredCount: number;
}

export function FlightResultsList({
  bestFlights,
  otherFlights,
  isLoading,
  sortBy,
  onSortChange,
  totalResults,
  filteredCount,
}: FlightResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
        <FlightResultsSkeleton count={5} />
      </div>
    );
  }

  const allFlights = [...bestFlights, ...otherFlights];

  if (allFlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plane className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No flights found</h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your filters or search criteria to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalResults} flights
          </span>
          {filteredCount < totalResults && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price (lowest)</SelectItem>
              <SelectItem value="duration">Duration (shortest)</SelectItem>
              <SelectItem value="departure">Departure (earliest)</SelectItem>
              <SelectItem value="arrival">Arrival (earliest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Best flights section */}
      {bestFlights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Best flights</h3>
            <Badge variant="outline" className="text-xs">
              Top {bestFlights.length}
            </Badge>
          </div>
          {bestFlights.map((flight, index) => (
            <FlightCard
              key={flight.booking_token || index}
              flight={flight}
              rank={index + 1}
              isBestFlight
            />
          ))}
        </div>
      )}

      {/* Other flights section */}
      {otherFlights.length > 0 && (
        <div className="space-y-3">
          {bestFlights.length > 0 && (
            <h3 className="font-semibold pt-4">Other departing flights</h3>
          )}
          {otherFlights.map((flight, index) => (
            <FlightCard
              key={flight.booking_token || `other-${index}`}
              flight={flight}
            />
          ))}
        </div>
      )}
    </div>
  );
}
