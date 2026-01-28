import type { FlightFilter, FlightResult } from "../schemas";

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatPrice(price: number, currency = "INR"): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatTime(dateTimeString: string): string {
  const time = dateTimeString.split(" ")[1];
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function getStopsCount(flight: FlightResult): number {
  return flight.layovers?.length ?? 0;
}

export function getStopsLabel(stops: number): string {
  if (stops === 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export function getUniqueAirlines(flights: FlightResult[]): string[] {
  const airlines = new Set<string>();
  flights.forEach((flight) => {
    flight.flights.forEach((segment) => {
      airlines.add(segment.airline);
    });
  });
  return Array.from(airlines).sort();
}

export function getPriceRange(flights: FlightResult[]): { min: number; max: number } {
  if (flights.length === 0) return { min: 0, max: 1000 };
  const prices = flights.map((f) => f.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function getDurationRange(flights: FlightResult[]): { min: number; max: number } {
  if (flights.length === 0) return { min: 0, max: 1440 };
  const durations = flights.map((f) => f.total_duration);
  return {
    min: Math.min(...durations),
    max: Math.max(...durations),
  };
}

export function filterFlights(
  flights: FlightResult[],
  filters: FlightFilter
): FlightResult[] {
  return flights.filter((flight) => {
    // Price filter
    if (filters.maxPrice !== undefined && flight.price > filters.maxPrice) {
      return false;
    }
    if (filters.minPrice !== undefined && flight.price < filters.minPrice) {
      return false;
    }

    // Stops filter
    if (filters.stops && filters.stops.length > 0) {
      const stopCount = getStopsCount(flight);
      const normalizedStops = stopCount >= 2 ? 2 : stopCount;
      if (!filters.stops.includes(normalizedStops)) {
        return false;
      }
    }

    // Airlines filter
    if (filters.airlines && filters.airlines.length > 0) {
      const flightAirlines = flight.flights.map((s) => s.airline);
      if (!flightAirlines.some((a) => filters.airlines!.includes(a))) {
        return false;
      }
    }

    // Duration filter
    if (filters.maxDuration !== undefined && flight.total_duration > filters.maxDuration) {
      return false;
    }

    // Departure time filter
    if (filters.departureTimeRange) {
      const [minHour, maxHour] = filters.departureTimeRange;
      const departureTime = flight.flights[0]?.departure_airport.time;
      if (departureTime) {
        const timePart = departureTime.split(" ")[1];
        if (timePart) {
          const hour = parseInt(timePart.split(":")[0], 10);
          if (hour < minHour || hour > maxHour) {
            return false;
          }
        }
      }
    }

    return true;
  });
}

export function sortFlights(
  flights: FlightResult[],
  sortBy: "price" | "duration" | "departure" | "arrival"
): FlightResult[] {
  return [...flights].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "duration":
        return a.total_duration - b.total_duration;
      case "departure": {
        const aTime = a.flights[0]?.departure_airport.time || "";
        const bTime = b.flights[0]?.departure_airport.time || "";
        return aTime.localeCompare(bTime);
      }
      case "arrival": {
        const aArr = a.flights[a.flights.length - 1]?.arrival_airport.time || "";
        const bArr = b.flights[b.flights.length - 1]?.arrival_airport.time || "";
        return aArr.localeCompare(bArr);
      }
      default:
        return 0;
    }
  });
}

export function getEmissionsLabel(differencePercent: number): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (differencePercent <= -10) {
    return { label: `${Math.abs(differencePercent)}% less CO₂`, variant: "secondary" };
  }
  if (differencePercent <= 0) {
    return { label: "Avg emissions", variant: "outline" };
  }
  if (differencePercent <= 20) {
    return { label: `${differencePercent}% more CO₂`, variant: "outline" };
  }
  return { label: `${differencePercent}% more CO₂`, variant: "destructive" };
}
