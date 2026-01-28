import * as React from "react";
import { format, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ArrowRightLeft, Search, Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AirportSelect } from "./airport-select";
import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";
import type { FlightSearchRequest } from "../schemas";

interface SearchFormProps {
  initialValues?: Partial<FlightSearchRequest>;
  onSearch: (params: FlightSearchRequest) => void;
  isLoading?: boolean;
}

export function SearchForm({ initialValues, onSearch, isLoading }: SearchFormProps) {
  const [departure, setDeparture] = React.useState(initialValues?.departure_id || "");
  const [arrival, setArrival] = React.useState(initialValues?.arrival_id || "");

  // For one-way trips
  const [outboundDate, setOutboundDate] = React.useState<Date | undefined>(
    initialValues?.outbound_date
      ? parse(initialValues.outbound_date, "yyyy-MM-dd", new Date())
      : undefined
  );

  // For round trips - date range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    if (initialValues?.outbound_date) {
      return {
        from: parse(initialValues.outbound_date, "yyyy-MM-dd", new Date()),
        to: initialValues?.return_date
          ? parse(initialValues.return_date, "yyyy-MM-dd", new Date())
          : undefined,
      };
    }
    return undefined;
  });

  const [tripType, setTripType] = React.useState<"1" | "2">(
    (initialValues?.type as "1" | "2") || "2"
  );
  const [passengers, setPassengers] = React.useState(
    String(initialValues?.adults || 1)
  );
  const [travelClass, setTravelClass] = React.useState<"1" | "2" | "3" | "4">(
    (initialValues?.travel_class as "1" | "2" | "3" | "4") || "1"
  );

  // Sync form state when URL params change (e.g., on refresh or direct URL navigation)
  React.useEffect(() => {
    if (initialValues?.departure_id) {
      setDeparture(initialValues.departure_id);
    }
    if (initialValues?.arrival_id) {
      setArrival(initialValues.arrival_id);
    }
    if (initialValues?.outbound_date) {
      const parsedDate = parse(initialValues.outbound_date, "yyyy-MM-dd", new Date());
      setOutboundDate(parsedDate);
      setDateRange({
        from: parsedDate,
        to: initialValues.return_date
          ? parse(initialValues.return_date, "yyyy-MM-dd", new Date())
          : undefined,
      });
    }
    if (initialValues?.type) {
      setTripType(initialValues.type as "1" | "2");
    }
    if (initialValues?.adults) {
      setPassengers(String(initialValues.adults));
    }
    if (initialValues?.travel_class) {
      setTravelClass(initialValues.travel_class as "1" | "2" | "3" | "4");
    }
  }, [
    initialValues?.departure_id,
    initialValues?.arrival_id,
    initialValues?.outbound_date,
    initialValues?.return_date,
    initialValues?.type,
    initialValues?.adults,
    initialValues?.travel_class,
  ]);

  const handleSwapAirports = () => {
    const temp = departure;
    setDeparture(arrival);
    setArrival(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!departure || !arrival) {
      return;
    }

    // Round trip validation
    if (tripType === "1") {
      if (!dateRange?.from || !dateRange?.to) {
        return;
      }
      onSearch({
        departure_id: departure,
        arrival_id: arrival,
        outbound_date: format(dateRange.from, "yyyy-MM-dd"),
        return_date: format(dateRange.to, "yyyy-MM-dd"),
        type: tripType,
        travel_class: travelClass,
        adults: parseInt(passengers, 10),
        currency: "INR",
      });
    } else {
      // One-way trip
      if (!outboundDate) {
        return;
      }
      onSearch({
        departure_id: departure,
        arrival_id: arrival,
        outbound_date: format(outboundDate, "yyyy-MM-dd"),
        type: tripType,
        travel_class: travelClass,
        adults: parseInt(passengers, 10),
        currency: "INR",
      });
    }
  };

  const canSubmit = departure && arrival && (
    tripType === "2" ? outboundDate : (dateRange?.from && dateRange?.to)
  );

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip options row */}
          <div className="space-y-3">
            <Select value={tripType} onValueChange={(v) => setTripType(v as "1" | "2")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">One way</SelectItem>
                <SelectItem value="1">Round trip</SelectItem>
              </SelectContent>
            </Select>

            {/* Passengers counter */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Passengers</label>
              <div className="flex items-center w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-r-none border-r-0 shrink-0"
                  onClick={() => setPassengers(String(Math.max(1, parseInt(passengers) - 1)))}
                  disabled={parseInt(passengers) <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center h-10 px-4 border-y border-input bg-background flex-1">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{passengers}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-l-none border-l-0 shrink-0"
                  onClick={() => setPassengers(String(Math.min(9, parseInt(passengers) + 1)))}
                  disabled={parseInt(passengers) >= 9}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Select
            value={travelClass}
            onValueChange={(v) => setTravelClass(v as "1" | "2" | "3" | "4")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Economy</SelectItem>
              <SelectItem value="2">Premium Economy</SelectItem>
              <SelectItem value="3">Business</SelectItem>
              <SelectItem value="4">First</SelectItem>
            </SelectContent>
          </Select>

          {/* Airport inputs - stacked vertically */}
          <div className="space-y-3">
            <AirportSelect
              value={departure}
              onChange={setDeparture}
              label="From"
              placeholder="Where from?"
              excludeAirport={arrival}
            />

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleSwapAirports}
                disabled={!departure && !arrival}
                aria-label="Swap airports"
              >
                <ArrowRightLeft className="h-4 w-4 rotate-90" />
              </Button>
            </div>

            <AirportSelect
              value={arrival}
              onChange={setArrival}
              label="To"
              placeholder="Where to?"
              excludeAirport={departure}
            />
          </div>

          {/* Date selection */}
          {tripType === "2" ? (
            <DatePicker
              value={outboundDate}
              onChange={setOutboundDate}
              label="Departure"
              placeholder="Select date"
            />
          ) : (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              label="Travel Dates"
              placeholder="Select dates"
            />
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Flights
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
