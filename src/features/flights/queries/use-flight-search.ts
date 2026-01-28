import { queryOptions, useQuery } from "@tanstack/react-query";
import { searchFlights } from "../api";
import type { FlightSearchRequest } from "../schemas";

export const flightSearchQueryOptions = (params: FlightSearchRequest | null) =>
  queryOptions({
    queryKey: ["flights", params],
    queryFn: async ({ signal }) => {
      if (!params) {
        throw new Error("Search parameters are required");
      }
      return searchFlights(params, signal);
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });

export function useFlightSearch(params: FlightSearchRequest | null) {
  return useQuery(flightSearchQueryOptions(params));
}
