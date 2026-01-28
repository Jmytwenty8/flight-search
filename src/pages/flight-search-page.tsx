import * as React from "react";
import {
    SearchForm,
    FlightResultsList,
    FlightFiltersDesktop,
    FlightFiltersMobile,
    ActiveFilters,
    PriceGraph
} from "@/features/flights/components";
import {
    useFlightSearchParams,
    useFlightFilters,
    useSortBy,
    useCurrency,
} from "@/features/flights/hooks";
import { useFlightSearch } from "@/features/flights/queries";
import {
    filterFlights,
    sortFlights,
    getUniqueAirlines,
    getPriceRange,
    getDurationRange,
} from "@/features/flights/utils";
import type { FlightSearchRequest } from "@/features/flights/schemas";
import { Plane } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/currency-selector";

export function FlightSearchPage() {
    const { searchRequest, setSearchRequest } = useFlightSearchParams();
    const { filters, setFilters, clearFilters, hasActiveFilters } = useFlightFilters();
    const { sortBy, setSortBy } = useSortBy();
    const { currency, setCurrency } = useCurrency();

    const { data, isLoading, isError, error } = useFlightSearch(searchRequest);

    const handleSearch = React.useCallback(
        (params: FlightSearchRequest) => {
            // Clear filters when doing a new search
            clearFilters();
            setSearchRequest(params);
        },
        [setSearchRequest, clearFilters]
    );

    // Get all flights for filtering
    const allFlights = React.useMemo(() => {
        if (!data?.success) return [];
        return [...(data.data.best_flights || []), ...(data.data.other_flights || [])];
    }, [data]);

    // Apply filters and sorting
    const processedFlights = React.useMemo(() => {
        let flights = allFlights;
        if (hasActiveFilters) {
            flights = filterFlights(flights, filters);
        }
        return sortFlights(flights, sortBy);
    }, [allFlights, filters, hasActiveFilters, sortBy]);

    // Split back into best and other
    const { bestFlights, otherFlights } = React.useMemo(() => {
        if (processedFlights.length === 0) {
            return { bestFlights: [], otherFlights: [] };
        }

        // If sorting by price, first 5 are "best"
        if (sortBy === "price") {
            return {
                bestFlights: processedFlights.slice(0, Math.min(5, processedFlights.length)),
                otherFlights: processedFlights.slice(5),
            };
        }

        // Otherwise, no "best" designation
        return {
            bestFlights: [],
            otherFlights: processedFlights,
        };
    }, [processedFlights, sortBy]);

    // Get filter options from all flights
    const airlines = React.useMemo(() => getUniqueAirlines(allFlights), [allFlights]);
    const priceRange = React.useMemo(() => getPriceRange(allFlights), [allFlights]);
    const durationRange = React.useMemo(() => getDurationRange(allFlights), [allFlights]);

    // Get filter range for price graph
    const filterRange = React.useMemo(() => {
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            return {
                min: filters.minPrice ?? priceRange.min,
                max: filters.maxPrice ?? priceRange.max,
            };
        }
        return undefined;
    }, [filters.minPrice, filters.maxPrice, priceRange]);

    const hasResults = data?.success && allFlights.length > 0;
    const showResults = searchRequest && (isLoading || hasResults || isError);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                                <Plane className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Flight Search</h1>
                                <p className="text-xs text-muted-foreground">Find the best deals on flights</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CurrencySelector value={currency} onValueChange={setCurrency} />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content - 2 column layout */}
            <main className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left column - Search form + Filters (sticky on desktop) */}
                    <aside className="w-full lg:w-[340px] lg:shrink-0">
                        <div className="space-y-6">
                            <SearchForm
                                initialValues={searchRequest || undefined}
                                onSearch={handleSearch}
                                isLoading={isLoading}
                            />

                            {/* Desktop filters - only show when we have results */}
                            {hasResults && (
                                <div className="hidden lg:block">
                                    <FlightFiltersDesktop
                                        filters={filters}
                                        onFilterChange={setFilters}
                                        onClearFilters={clearFilters}
                                        hasActiveFilters={hasActiveFilters}
                                        airlines={airlines}
                                        priceRange={priceRange}
                                        durationRange={durationRange}
                                        currency={currency}
                                    />
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Right column - Results + Graph (flexible width) */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {!showResults && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                                    <Plane className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">
                                    Where would you like to go?
                                </h2>
                                <p className="text-muted-foreground max-w-md">
                                    Enter your departure and destination airports, select your travel
                                    dates, and we'll find the best flights for you.
                                </p>
                            </div>
                        )}

                        {isError && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                    <Plane className="h-8 w-8 text-destructive" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Search Error</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    {error instanceof Error
                                        ? error.message
                                        : "Unable to fetch flight data. Please try again."}
                                </p>
                            </div>
                        )}

                        {showResults && !isError && (
                            <div className="space-y-4">
                                {/* Price Graph */}
                                <PriceGraph
                                    priceInsights={data?.success ? data.data.price_insights : undefined}
                                    filteredFlights={processedFlights}
                                    isLoading={isLoading}
                                    filterRange={filterRange}
                                    currency={currency}
                                />

                                {/* Mobile filters button */}
                                <div className="flex items-center gap-3 lg:hidden">
                                    <FlightFiltersMobile
                                        filters={filters}
                                        onFilterChange={setFilters}
                                        onClearFilters={clearFilters}
                                        hasActiveFilters={hasActiveFilters}
                                        airlines={airlines}
                                        priceRange={priceRange}
                                        durationRange={durationRange}
                                        currency={currency}
                                    />
                                </div>

                                {/* Active filters chips */}
                                {hasActiveFilters && (
                                    <ActiveFilters
                                        filters={filters}
                                        onFilterChange={setFilters}
                                        currency={currency}
                                    />
                                )}

                                {/* Results list */}
                                <FlightResultsList
                                    bestFlights={bestFlights}
                                    otherFlights={otherFlights}
                                    isLoading={isLoading}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                    totalResults={allFlights.length}
                                    filteredCount={processedFlights.length}
                                    currency={currency}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-auto">
                <div className="container mx-auto px-4 py-6">
                    <p className="text-center text-sm text-muted-foreground">
                        Flight prices and availability are subject to change. Prices shown are
                        estimates and may not include all fees.
                    </p>
                </div>
            </footer>
        </div>
    );
}
