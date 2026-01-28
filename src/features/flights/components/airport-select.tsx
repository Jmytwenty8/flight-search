import * as React from "react";
import { Check, ChevronsUpDown, Plane, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { type AirportOption } from "../api";
import { useAirportSearch } from "../queries";
import { useDebouncedValue } from "../hooks";

interface AirportSelectProps {
    value: string;
    onChange: (value: string, airport?: AirportOption) => void;
    placeholder?: string;
    label?: string;
    excludeAirport?: string;
    selectedAirport?: AirportOption | null;
}

export function AirportSelect({
    value,
    onChange,
    placeholder = "Select airport",
    label,
    excludeAirport,
    selectedAirport: externalSelectedAirport,
}: AirportSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [internalSelectedAirport, setInternalSelectedAirport] = React.useState<AirportOption | null>(null);

    // Use external selectedAirport if provided, otherwise use internal state
    const selectedAirport = externalSelectedAirport !== undefined ? externalSelectedAirport : internalSelectedAirport;

    // Debounce the search query for API calls
    const debouncedQuery = useDebouncedValue(searchQuery, 300);

    // Use TanStack Query for airport search
    const { data: airports = [], isLoading } = useAirportSearch(debouncedQuery);

    // Find selected airport from search results (only for internal state)
    React.useEffect(() => {
        if (externalSelectedAirport === undefined) {
            if (value) {
                const found = airports.find((a) => a.id === value);
                if (found) {
                    setInternalSelectedAirport(found);
                }
            } else {
                setInternalSelectedAirport(null);
            }
        }
    }, [value, airports, externalSelectedAirport]);

    const filteredAirports = React.useMemo(() => {
        return excludeAirport
            ? airports.filter((a) => a.id !== excludeAirport)
            : airports;
    }, [airports, excludeAirport]);

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-muted-foreground">
                    {label}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-12 text-left font-normal"
                    >
                        {selectedAirport ? (
                            <div className="flex items-center gap-2 truncate">
                                <Plane className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="font-semibold">{selectedAirport.id}</span>
                                <span className="text-muted-foreground truncate">
                                    {selectedAirport.city}
                                </span>
                            </div>
                        ) : value ? (
                            <div className="flex items-center gap-2 truncate">
                                <Plane className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="font-semibold">{value}</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-xs p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search airports..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>No airport found.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredAirports.map((airport) => (
                                            <CommandItem
                                                key={airport.id}
                                                value={airport.id}
                                                onSelect={() => {
                                                    onChange(airport.id, airport);
                                                    if (externalSelectedAirport === undefined) {
                                                        setInternalSelectedAirport(airport);
                                                    }
                                                    setOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className="flex items-center gap-3 py-3"
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                                                    <span className="font-bold text-sm">{airport.id}</span>
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="font-medium truncate">{airport.city}</span>
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {airport.name}
                                                    </span>
                                                </div>
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        value === airport.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
