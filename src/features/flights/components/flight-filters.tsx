import * as React from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FlightFilter } from "../schemas";
import { formatDuration, formatPrice } from "../utils";

interface FlightFiltersProps {
  filters: FlightFilter;
  onFilterChange: (filters: Partial<FlightFilter>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  airlines: string[];
  priceRange: { min: number; max: number };
  durationRange: { min: number; max: number };
  currency?: string;
}

function FilterContent({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  airlines,
  priceRange,
  durationRange,
  currency = "INR",
}: FlightFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = React.useState<[number, number]>([
    filters.minPrice ?? priceRange.min,
    filters.maxPrice ?? priceRange.max,
  ]);

  const [localDuration, setLocalDuration] = React.useState<number>(
    filters.maxDuration ?? durationRange.max
  );

  const [localDepartureTime, setLocalDepartureTime] = React.useState<[number, number]>(
    filters.departureTimeRange ?? [0, 24]
  );

  // Sync local state with filters
  React.useEffect(() => {
    setLocalPriceRange([
      filters.minPrice ?? priceRange.min,
      filters.maxPrice ?? priceRange.max,
    ]);
  }, [filters.minPrice, filters.maxPrice, priceRange.min, priceRange.max]);

  React.useEffect(() => {
    setLocalDuration(filters.maxDuration ?? durationRange.max);
  }, [filters.maxDuration, durationRange.max]);

  React.useEffect(() => {
    setLocalDepartureTime(filters.departureTimeRange ?? [0, 24]);
  }, [filters.departureTimeRange]);

  const handleStopsChange = (stops: number, checked: boolean | "indeterminate") => {
    const currentStops = filters.stops || [];
    const isChecked = checked === true;
    const newStops = isChecked
      ? [...currentStops, stops]
      : currentStops.filter((s) => s !== stops);
    onFilterChange({ stops: newStops.length > 0 ? newStops : undefined });
  };

  const handleAirlineChange = (airline: string, checked: boolean | "indeterminate") => {
    const currentAirlines = filters.airlines || [];
    const isChecked = checked === true;
    const newAirlines = isChecked
      ? [...currentAirlines, airline]
      : currentAirlines.filter((a) => a !== airline);
    onFilterChange({ airlines: newAirlines.length > 0 ? newAirlines : undefined });
  };

  const handlePriceCommit = (value: number[]) => {
    const [min, max] = value;
    onFilterChange({
      minPrice: min > priceRange.min ? min : undefined,
      maxPrice: max < priceRange.max ? max : undefined,
    });
  };

  const handleDurationCommit = (value: number[]) => {
    onFilterChange({
      maxDuration: value[0] < durationRange.max ? value[0] : undefined,
    });
  };

  const handleDepartureTimeCommit = (value: number[]) => {
    const [start, end] = value;
    onFilterChange({
      departureTimeRange: start > 0 || end < 24 ? [start, end] as [number, number] : undefined,
    });
  };

  const formatHour = (hour: number) => {
    if (hour === 0 || hour === 24) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const stopOptions = [
    { value: 0, label: "Nonstop" },
    { value: 1, label: "1 stop" },
    { value: 2, label: "2+ stops" },
  ];

  return (
    <div className="space-y-6">
      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="w-full justify-start text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}

      {/* Stops filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Stops</h4>
        <div className="space-y-2">
          {stopOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`stops-${option.value}`}
                checked={filters.stops?.includes(option.value) ?? false}
                onCheckedChange={(checked) =>
                  handleStopsChange(option.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`stops-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price range filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Price</h4>
          <span className="text-xs text-muted-foreground">
            {formatPrice(localPriceRange[0], currency)} - {formatPrice(localPriceRange[1], currency)}
          </span>
        </div>
        <Slider
          value={localPriceRange}
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          onValueChange={(value) => setLocalPriceRange(value as [number, number])}
          onValueCommit={handlePriceCommit}
          className="py-2"
        />
      </div>

      <Separator />

      {/* Duration filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Duration</h4>
          <span className="text-xs text-muted-foreground">
            Up to {formatDuration(localDuration)}
          </span>
        </div>
        <Slider
          value={[localDuration]}
          min={durationRange.min}
          max={durationRange.max}
          step={30}
          onValueChange={(value) => setLocalDuration(value[0])}
          onValueCommit={handleDurationCommit}
          className="py-2"
        />
      </div>

      <Separator />

      {/* Departure time filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Departure time</h4>
          <span className="text-xs text-muted-foreground">
            {formatHour(localDepartureTime[0])} - {formatHour(localDepartureTime[1])}
          </span>
        </div>
        <Slider
          value={localDepartureTime}
          min={0}
          max={24}
          step={1}
          onValueChange={(value) => setLocalDepartureTime(value as [number, number])}
          onValueCommit={handleDepartureTimeCommit}
          className="py-2"
        />
      </div>

      <Separator />

      {/* Airlines filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Airlines</h4>
        <ScrollArea className="h-[180px] pr-3">
          <div className="space-y-2">
            {airlines.map((airline) => (
              <div key={airline} className="flex items-center space-x-2">
                <Checkbox
                  id={`airline-${airline}`}
                  checked={filters.airlines?.includes(airline) ?? false}
                  onCheckedChange={(checked) =>
                    handleAirlineChange(airline, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`airline-${airline}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {airline}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Desktop filters (sidebar card)
export function FlightFiltersDesktop(props: FlightFiltersProps) {
  return (
    <Card className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </CardTitle>
          {props.hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        <FilterContent {...props} />
      </CardContent>
    </Card>
  );
}

// Mobile filters (sheet)
export function FlightFiltersMobile(props: FlightFiltersProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {props.hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
              •
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col px-8">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-4 pb-4 pr-4">
          <FilterContent {...props} />
        </div>
        <div className="shrink-0 p-4 bg-background border-t">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Show results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Active filters display
export function ActiveFilters({
  filters,
  onFilterChange,
  currency = "INR",
}: {
  filters: FlightFilter;
  onFilterChange: (filters: Partial<FlightFilter>) => void;
  currency?: string;
}) {
  const chips: { label: string; onRemove: () => void }[] = [];

  // Stops chips
  if (filters.stops && filters.stops.length > 0) {
    filters.stops.forEach((stop) => {
      const label = stop === 0 ? "Nonstop" : stop === 1 ? "1 stop" : "2+ stops";
      chips.push({
        label,
        onRemove: () => {
          const newStops = filters.stops?.filter((s) => s !== stop);
          onFilterChange({ stops: newStops?.length ? newStops : undefined });
        },
      });
    });
  }

  // Price chips
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice ? formatPrice(filters.minPrice, currency) : "Any";
    const max = filters.maxPrice ? formatPrice(filters.maxPrice, currency) : "Any";
    chips.push({
      label: `${min} - ${max}`,
      onRemove: () => onFilterChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  // Duration chip
  if (filters.maxDuration !== undefined) {
    chips.push({
      label: `Max ${formatDuration(filters.maxDuration)}`,
      onRemove: () => onFilterChange({ maxDuration: undefined }),
    });
  }

  // Departure time chip
  if (filters.departureTimeRange) {
    const formatHour = (h: number) => (h === 0 || h === 24 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);
    chips.push({
      label: `Depart ${formatHour(filters.departureTimeRange[0])} - ${formatHour(filters.departureTimeRange[1])}`,
      onRemove: () => onFilterChange({ departureTimeRange: undefined }),
    });
  }

  // Airline chips
  if (filters.airlines && filters.airlines.length > 0) {
    filters.airlines.forEach((airline) => {
      chips.push({
        label: airline,
        onRemove: () => {
          const newAirlines = filters.airlines?.filter((a) => a !== airline);
          onFilterChange({ airlines: newAirlines?.length ? newAirlines : undefined });
        },
      });
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <Badge
          key={i}
          variant="secondary"
          className="gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80"
          onClick={chip.onRemove}
        >
          {chip.label}
          <X className="h-3 w-3" />
        </Badge>
      ))}
    </div>
  );
}
