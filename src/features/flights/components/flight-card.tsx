import * as React from "react";
import { ChevronDown, ChevronUp, Clock, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FlightResult } from "../schemas";
import {
  formatDuration,
  formatPrice,
  formatTime,
  getStopsCount,
  getStopsLabel,
  getEmissionsLabel,
} from "../utils";

interface FlightCardProps {
  flight: FlightResult;
  rank?: number;
  isBestFlight?: boolean;
  currency?: string;
}

export function FlightCard({ flight, rank, isBestFlight, currency = "INR" }: FlightCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const firstSegment = flight.flights[0];
  const lastSegment = flight.flights[flight.flights.length - 1];
  const stopsCount = getStopsCount(flight);
  const emissions = flight.carbon_emissions;

  if (!firstSegment || !lastSegment) return null;

  const departureTime = formatTime(firstSegment.departure_airport.time || "");
  const arrivalTime = formatTime(lastSegment.arrival_airport.time || "");

  const emissionsInfo = emissions ? getEmissionsLabel(emissions.difference_percent) : null;

  return (
    <Card
      className={`transition-all hover:shadow-md ${isBestFlight ? "ring-2 ring-primary/20" : ""
        }`}
    >
      <CardContent className="p-4">
        {/* Main flight info */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Rank badge */}
          {rank && isBestFlight && (
            <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {rank}
            </div>
          )}

          {/* Airline logo and info */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={flight.airline_logo}
              alt="Airline"
              className="w-8 h-8 object-contain"
            />
            <div className="md:hidden">
              <p className="text-sm font-medium">{firstSegment.airline}</p>
              <p className="text-xs text-muted-foreground">
                {firstSegment.flight_number}
              </p>
            </div>
          </div>

          {/* Flight times and route */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-left min-w-[80px]">
                <p className="text-xl font-bold">{firstSegment.departure_airport.id}</p>
                <p className="text-sm text-muted-foreground">{departureTime}</p>
              </div>

              {/* Duration and stops */}
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(flight.total_duration)}</span>
                </div>
                <div className="relative">
                  <div className="h-[2px] bg-muted w-full" />
                  {stopsCount > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                      {Array.from({ length: Math.min(stopsCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {getStopsLabel(stopsCount)}
                </p>
              </div>

              {/* Arrival */}
              <div className="text-left min-w-[80px]">
                <p className="text-xl font-bold">{lastSegment.arrival_airport.id}</p>
                <p className="text-sm text-muted-foreground">{arrivalTime}</p>
              </div>
            </div>
          </div>

          {/* Price and book */}
          <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 ml-auto shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(flight.price, currency)}
              </p>
              <p className="text-xs text-muted-foreground">{flight.type}</p>
            </div>
            {emissionsInfo && emissions && emissions.difference_percent < 0 && (
              <Badge variant={emissionsInfo.variant} className="gap-1">
                <Leaf className="h-3 w-3" />
                {emissionsInfo.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Expand/collapse button */}
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                Hide details <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Flight details <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-4">
            {flight.flights.map((segment, index) => (
              <React.Fragment key={index}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <img
                      src={segment.airline_logo}
                      alt={segment.airline}
                      className="w-6 h-6 object-contain"
                    />
                    <div className="flex-1 w-[2px] bg-muted my-2" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Departure */}
                    <div>
                      <p className="font-medium">
                        {formatTime(segment.departure_airport.time || "")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {segment.departure_airport.name} ({segment.departure_airport.id})
                      </p>
                    </div>

                    {/* Flight info */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {segment.airline} · {segment.flight_number} · {segment.airplane}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDuration(segment.duration)} · {segment.travel_class}
                      </p>
                      {segment.legroom && (
                        <p>Legroom: {segment.legroom}</p>
                      )}
                    </div>

                    {/* Arrival */}
                    <div>
                      <p className="font-medium">
                        {formatTime(segment.arrival_airport.time || "")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {segment.arrival_airport.name} ({segment.arrival_airport.id})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Layover */}
                {flight.layovers && flight.layovers[index] && (
                  <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDuration(flight.layovers[index].duration)} layover ·{" "}
                      {flight.layovers[index].name}
                      {flight.layovers[index].overnight && (
                        <Badge variant="outline" className="ml-2">
                          Overnight
                        </Badge>
                      )}
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Extensions/amenities */}
            {flight.extensions && flight.extensions.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {flight.extensions.map((ext, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {/* Carbon emissions */}
            {emissions && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Leaf className="h-4 w-4" />
                  <span>
                    {Math.round(emissions.this_flight / 1000)} kg CO₂
                    {emissionsInfo && (
                      <span className={emissions.difference_percent < 0 ? "text-green-600" : ""}>
                        {" "}
                        ({emissionsInfo.label})
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
