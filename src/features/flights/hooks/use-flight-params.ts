import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { useMemo, useCallback } from "react";
import type { FlightFilter, FlightSearchRequest } from "../schemas";

export function useFlightSearchParams() {
  const [params, setParams] = useQueryStates({
    from: parseAsString,
    to: parseAsString,
    date: parseAsString,
    return: parseAsString,
    type: parseAsString.withDefault("2"),
    class: parseAsString.withDefault("1"),
    adults: parseAsInteger.withDefault(1),
    currency: parseAsString.withDefault("INR"),
  });

  const searchRequest = useMemo((): FlightSearchRequest | null => {
    if (!params.from || !params.to || !params.date) {
      return null;
    }

    return {
      departure_id: params.from,
      arrival_id: params.to,
      outbound_date: params.date,
      return_date: params.return || undefined,
      type: (params.type as "1" | "2"),
      travel_class: (params.class as "1" | "2" | "3" | "4"),
      adults: params.adults,
      currency: params.currency,
    };
  }, [params]);

  const setSearchRequest = useCallback(
    (request: Partial<FlightSearchRequest>) => {
      setParams({
        from: request.departure_id || null,
        to: request.arrival_id || null,
        date: request.outbound_date || null,
        return: request.return_date || null,
        type: request.type || null,
        class: request.travel_class || null,
        adults: request.adults || null,
        currency: request.currency || null,
      });
    },
    [setParams]
  );

  return { searchRequest, setSearchRequest };
}

export function useFlightFilters() {
  const [params, setParams] = useQueryStates({
    stops: parseAsString,
    airlines: parseAsString,
    maxPrice: parseAsInteger,
    minPrice: parseAsInteger,
    maxDuration: parseAsInteger,
    depTime: parseAsString,
  });

  const filters = useMemo((): FlightFilter => {
    return {
      stops: params.stops ? params.stops.split(",").map(Number) : undefined,
      airlines: params.airlines ? params.airlines.split(",") : undefined,
      maxPrice: params.maxPrice ?? undefined,
      minPrice: params.minPrice ?? undefined,
      maxDuration: params.maxDuration ?? undefined,
      departureTimeRange: params.depTime
        ? (params.depTime.split(",").map(Number) as [number, number])
        : undefined,
    };
  }, [params]);

  const setFilters = useCallback(
    (newFilters: Partial<FlightFilter>) => {
      setParams({
        stops: newFilters.stops && newFilters.stops.length > 0
          ? newFilters.stops.join(",")
          : null,
        airlines: newFilters.airlines && newFilters.airlines.length > 0
          ? newFilters.airlines.join(",")
          : null,
        maxPrice: newFilters.maxPrice ?? null,
        minPrice: newFilters.minPrice ?? null,
        maxDuration: newFilters.maxDuration ?? null,
        depTime: newFilters.departureTimeRange
          ? newFilters.departureTimeRange.join(",")
          : null,
      });
    },
    [setParams]
  );

  const clearFilters = useCallback(() => {
    setParams({
      stops: null,
      airlines: null,
      maxPrice: null,
      minPrice: null,
      maxDuration: null,
      depTime: null,
    });
  }, [setParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      (filters.stops && filters.stops.length > 0) ||
      (filters.airlines && filters.airlines.length > 0) ||
      filters.maxPrice !== undefined ||
      filters.minPrice !== undefined ||
      filters.maxDuration !== undefined ||
      filters.departureTimeRange !== undefined
    );
  }, [filters]);

  return { filters, setFilters, clearFilters, hasActiveFilters };
}

export function useSortBy() {
  const [sort, setSort] = useQueryStates({
    sort: parseAsString.withDefault("price"),
  });

  const sortBy = useMemo((): "price" | "duration" | "departure" | "arrival" => {
    if (sort.sort === "duration" || sort.sort === "departure" || sort.sort === "arrival") {
      return sort.sort;
    }
    return "price";
  }, [sort.sort]);

  const setSortBy = useCallback(
    (value: "price" | "duration" | "departure" | "arrival") => {
      setSort({ sort: value === "price" ? null : value });
    },
    [setSort]
  );

  return { sortBy, setSortBy };
}

export function useCurrency() {
  const [currencyParams, setCurrencyParams] = useQueryStates({
    currency: parseAsString.withDefault("INR"),
  });

  const currency = currencyParams.currency;

  const setCurrency = useCallback(
    (value: string) => {
      setCurrencyParams({ currency: value });
    },
    [setCurrencyParams]
  );

  return { currency, setCurrency };
}
