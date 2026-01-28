import { z } from "zod";

// Airport Schema
export const airportSchema = z.object({
  name: z.string(),
  id: z.string(),
  time: z.string().optional(),
});

// Flight Segment Schema
export const flightSegmentSchema = z.object({
  departure_airport: airportSchema,
  arrival_airport: airportSchema,
  duration: z.number(),
  airplane: z.string().optional(),
  airline: z.string(),
  airline_logo: z.string().url(),
  travel_class: z.string(),
  flight_number: z.string(),
  ticket_also_sold_by: z.array(z.string()).optional(),
  legroom: z.string().optional(),
  extensions: z.array(z.string()).optional(),
  often_delayed_by_over_30_min: z.boolean().optional(),
});

// Layover Schema
export const layoverSchema = z.object({
  duration: z.number(),
  name: z.string(),
  id: z.string(),
  overnight: z.boolean().optional(),
});

// Carbon Emissions Schema
export const carbonEmissionsSchema = z.object({
  this_flight: z.number(),
  typical_for_this_route: z.number(),
  difference_percent: z.number(),
});

// Flight Result Schema
export const flightResultSchema = z.object({
  flights: z.array(flightSegmentSchema),
  layovers: z.array(layoverSchema).optional(),
  total_duration: z.number(),
  carbon_emissions: carbonEmissionsSchema.optional(),
  price: z.number(),
  type: z.string(),
  airline_logo: z.url(),
  extensions: z.array(z.string()).optional(),
  booking_token: z.string().optional(),
});

// Price Insights Schema
export const priceInsightsSchema = z.object({
  lowest_price: z.number(),
  price_level: z.enum(["low", "typical", "high"]),
  typical_price_range: z.tuple([z.number(), z.number()]),
  price_history: z.array(z.tuple([z.number(), z.number()])),
});

// Airport Info Schema
export const airportInfoSchema = z.object({
  airport: z.object({
    id: z.string(),
    name: z.string(),
  }),
  city: z.string(),
  country: z.string(),
  country_code: z.string(),
  image: z.url().optional(),
  thumbnail: z.url().optional(),
});

// Airports Schema
export const airportsSchema = z.object({
  departure: z.array(airportInfoSchema),
  arrival: z.array(airportInfoSchema),
});

// Search Parameters Schema
export const searchParametersSchema = z.object({
  engine: z.literal("google_flights"),
  hl: z.string().optional(),
  gl: z.string().optional(),
  type: z.string(),
  departure_id: z.string(),
  arrival_id: z.string(),
  outbound_date: z.string(),
  return_date: z.string().optional(),
  currency: z.string(),
});

// API Response Schema - Discriminated Union for Success/Error
export const flightSearchSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    search_parameters: searchParametersSchema,
    best_flights: z.array(flightResultSchema),
    other_flights: z.array(flightResultSchema).optional(),
    price_insights: priceInsightsSchema.optional(),
    airports: z.array(airportsSchema).optional(),
  }),
});

export const flightSearchErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

export const flightSearchResponseSchema = z.discriminatedUnion("success", [
  flightSearchSuccessSchema,
  flightSearchErrorSchema,
]);

// Search Request Schema
export const flightSearchRequestSchema = z.object({
  departure_id: z.string().min(1, "Departure airport is required"),
  arrival_id: z.string().min(1, "Arrival airport is required"),
  outbound_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  type: z.enum(["1", "2"]).default("2"), // 1 = Round trip, 2 = One way
  travel_class: z.enum(["1", "2", "3", "4"]).default("1"), // 1 = Economy
  adults: z.number().min(1).max(9).default(1),
  currency: z.string().default("USD"),
  stops: z.enum(["0", "1", "2", "3"]).optional(), // 0 = Any, 1 = Nonstop, 2 = 1 stop, 3 = 2 stops
});

// Filter Schema
export const flightFilterSchema = z.object({
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  stops: z.array(z.number()).optional(), // 0 = nonstop, 1 = 1 stop, 2+ = 2+ stops
  airlines: z.array(z.string()).optional(),
  maxDuration: z.number().optional(), // in minutes
  departureTimeRange: z.tuple([z.number(), z.number()]).optional(), // [startHour, endHour]
});

// Types
export type Airport = z.infer<typeof airportSchema>;
export type FlightSegment = z.infer<typeof flightSegmentSchema>;
export type Layover = z.infer<typeof layoverSchema>;
export type CarbonEmissions = z.infer<typeof carbonEmissionsSchema>;
export type FlightResult = z.infer<typeof flightResultSchema>;
export type PriceInsights = z.infer<typeof priceInsightsSchema>;
export type AirportInfo = z.infer<typeof airportInfoSchema>;
export type Airports = z.infer<typeof airportsSchema>;
export type SearchParameters = z.infer<typeof searchParametersSchema>;
export type FlightSearchSuccess = z.infer<typeof flightSearchSuccessSchema>;
export type FlightSearchError = z.infer<typeof flightSearchErrorSchema>;
export type FlightSearchResponse = z.infer<typeof flightSearchResponseSchema>;
export type FlightSearchRequest = z.infer<typeof flightSearchRequestSchema>;
export type FlightFilter = z.infer<typeof flightFilterSchema>;
