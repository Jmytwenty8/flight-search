import { useQuery } from "@tanstack/react-query";
import { searchAirportsAsync } from "../api";

export function useAirportSearch(query: string) {
  return useQuery({
    queryKey: ["airports", query],
    queryFn: ({ signal }) => searchAirportsAsync(query, signal),
    enabled: query.length >= 2, // Only search when query has 2+ characters
    staleTime: 10 * 60 * 1000, // 10 minutes - airport data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1,
  });
}
