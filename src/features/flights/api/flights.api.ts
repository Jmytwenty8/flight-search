import axios from "axios";
import type { FlightSearchRequest, FlightSearchResponse, FlightResult, PriceInsights } from "../schemas";

// Create axios instance with defaults
const api = axios.create({
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// ============= Amadeus API Types =============

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Airport/Location search response
interface AmadeusLocation {
  type: string;
  subType: string; // AIRPORT, CITY
  name: string;
  detailedName: string;
  id: string;
  iataCode: string;
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    regionCode?: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  analytics?: {
    travelers: {
      score: number;
    };
  };
}

interface AmadeusLocationResponse {
  meta?: { count: number };
  data?: AmadeusLocation[];
  errors?: Array<{ status: number; code: number; title: string; detail: string }>;
}

// Flight offers response
interface AmadeusFlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating?: { carrierCode: string };
  duration: string; // ISO 8601 duration like "PT2H30M"
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

interface AmadeusItinerary {
  duration: string;
  segments: AmadeusFlightSegment[];
}

interface AmadeusPrice {
  currency: string;
  total: string;
  base: string;
  fees?: Array<{ amount: string; type: string }>;
  grandTotal: string;
}

interface AmadeusTravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: AmadeusPrice;
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags?: { weight?: number; weightUnit?: string; quantity?: number };
  }>;
}

interface AmadeusFlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: AmadeusItinerary[];
  price: AmadeusPrice;
  pricingOptions: { fareType: string[]; includedCheckedBagsOnly: boolean };
  validatingAirlineCodes: string[];
  travelerPricings: AmadeusTravelerPricing[];
}

interface AmadeusDictionaries {
  locations: Record<string, { cityCode: string; countryCode: string }>;
  aircraft: Record<string, string>;
  currencies: Record<string, string>;
  carriers: Record<string, string>;
}

interface AmadeusFlightOffersResponse {
  meta?: { count: number };
  data?: AmadeusFlightOffer[];
  dictionaries?: AmadeusDictionaries;
  errors?: Array<{ status: number; code: number; title: string; detail: string }>;
}

// ============= Token Management =============

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  try {
    const { data } = await api.post<AmadeusTokenResponse>(
      "/api/amadeus/auth",
      {}
    );

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return cachedToken;
  } catch (error) {
    console.error("Failed to get Amadeus access token:", error);
    throw new Error("Authentication failed");
  }
}

// ============= Utility Functions =============

// Parse ISO 8601 duration (PT2H30M) to minutes
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
}

// Format time from ISO datetime to HH:MM format
function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

// Get airline logo URL (using a free service)
function getAirlineLogo(carrierCode: string): string {
  return `https://pics.avs.io/60/60/${carrierCode}.png`;
}

// Map Amadeus cabin class to display string
function mapCabinClass(cabin: string): string {
  const mapping: Record<string, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "Premium Economy",
    BUSINESS: "Business",
    FIRST: "First",
  };
  return mapping[cabin] || cabin;
}

// Map our travel class param (1-4) to Amadeus cabin class
function mapTravelClassToAmadeus(travelClass: string): string {
  const mapping: Record<string, string> = {
    "1": "ECONOMY",
    "2": "PREMIUM_ECONOMY",
    "3": "BUSINESS",
    "4": "FIRST",
  };
  return mapping[travelClass] || "ECONOMY";
}

// ============= Transform Functions =============

function transformAmadeusResponse(
  amadeusData: AmadeusFlightOffersResponse,
  params: FlightSearchRequest
): FlightSearchResponse {
  if (amadeusData.errors && amadeusData.errors.length > 0) {
    return {
      success: false,
      error: {
        message: amadeusData.errors[0].detail || amadeusData.errors[0].title,
        code: `AMADEUS_${amadeusData.errors[0].code}`,
      },
    };
  }

  if (!amadeusData.data || amadeusData.data.length === 0) {
    return {
      success: true,
      data: {
        search_parameters: {
          engine: "google_flights",
          hl: "en",
          gl: "us",
          type: params.type,
          departure_id: params.departure_id,
          arrival_id: params.arrival_id,
          outbound_date: params.outbound_date,
          return_date: params.return_date,
          currency: params.currency,
        },
        best_flights: [],
        other_flights: [],
      },
    };
  }

  const dictionaries = amadeusData.dictionaries || { carriers: {}, aircraft: {}, locations: {}, currencies: {} };

  const transformOffer = (offer: AmadeusFlightOffer): FlightResult => {
    // Get cabin class from first traveler pricing
    const cabin = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || "ECONOMY";
    const airlineName = dictionaries.carriers[offer.validatingAirlineCodes[0]] || offer.validatingAirlineCodes[0];

    // Build flights array from all segments in all itineraries
    const flights = offer.itineraries.flatMap(itinerary =>
      itinerary.segments.map(segment => ({
        departure_airport: {
          name: dictionaries.locations[segment.departure.iataCode]?.cityCode || segment.departure.iataCode,
          id: segment.departure.iataCode,
          time: formatTime(segment.departure.at),
        },
        arrival_airport: {
          name: dictionaries.locations[segment.arrival.iataCode]?.cityCode || segment.arrival.iataCode,
          id: segment.arrival.iataCode,
          time: formatTime(segment.arrival.at),
        },
        duration: parseDuration(segment.duration),
        airplane: dictionaries.aircraft[segment.aircraft.code] || segment.aircraft.code,
        airline: dictionaries.carriers[segment.carrierCode] || segment.carrierCode,
        airline_logo: getAirlineLogo(segment.carrierCode),
        travel_class: mapCabinClass(cabin),
        flight_number: `${segment.carrierCode}${segment.number}`,
        extensions: [],
      }))
    );

    // Calculate layovers between segments
    const layovers = offer.itineraries.flatMap(itinerary => {
      const result = [];
      for (let i = 0; i < itinerary.segments.length - 1; i++) {
        const arrival = new Date(itinerary.segments[i].arrival.at);
        const nextDeparture = new Date(itinerary.segments[i + 1].departure.at);
        const layoverMinutes = Math.round((nextDeparture.getTime() - arrival.getTime()) / 60000);

        result.push({
          duration: layoverMinutes,
          name: dictionaries.locations[itinerary.segments[i].arrival.iataCode]?.cityCode || itinerary.segments[i].arrival.iataCode,
          id: itinerary.segments[i].arrival.iataCode,
          overnight: layoverMinutes > 480, // > 8 hours
        });
      }
      return result;
    });

    // Calculate total duration
    const totalDuration = offer.itineraries.reduce(
      (sum, it) => sum + parseDuration(it.duration),
      0
    );

    // Determine flight type
    const totalStops = offer.itineraries.reduce(
      (sum, it) => sum + it.segments.length - 1,
      0
    );
    const flightType = totalStops === 0 ? "Nonstop" : `${totalStops} stop${totalStops > 1 ? "s" : ""}`;

    return {
      flights,
      layovers: layovers.length > 0 ? layovers : undefined,
      total_duration: totalDuration,
      price: parseFloat(offer.price.grandTotal),
      type: flightType,
      airline_logo: getAirlineLogo(offer.validatingAirlineCodes[0]),
      extensions: [
        `${offer.numberOfBookableSeats} seats left`,
        airlineName,
      ],
      booking_token: offer.id,
    };
  };

  const allFlights = amadeusData.data.map(transformOffer);

  // Sort by price and separate best flights (top 3 by value)
  allFlights.sort((a, b) => a.price - b.price);

  const bestFlights = allFlights.slice(0, 3);
  const otherFlights = allFlights.slice(3);

  // Generate price insights from the data
  const prices = allFlights.map(f => f.price);
  const lowestPrice = Math.min(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  let priceLevel: "low" | "typical" | "high" = "typical";
  if (lowestPrice < avgPrice * 0.8) priceLevel = "low";
  else if (lowestPrice > avgPrice * 1.2) priceLevel = "high";

  const priceInsights: PriceInsights | undefined = prices.length > 0 ? {
    lowest_price: lowestPrice,
    price_level: priceLevel,
    typical_price_range: [Math.round(avgPrice * 0.9), Math.round(avgPrice * 1.1)],
    price_history: [], // Amadeus doesn't provide historical data
  } : undefined;

  return {
    success: true,
    data: {
      search_parameters: {
        engine: "google_flights",
        hl: "en",
        gl: "us",
        type: params.type,
        departure_id: params.departure_id,
        arrival_id: params.arrival_id,
        outbound_date: params.outbound_date,
        return_date: params.return_date,
        currency: params.currency,
      },
      best_flights: bestFlights,
      other_flights: otherFlights,
      price_insights: priceInsights,
    },
  };
}

// ============= API Functions =============

// Search flights using Amadeus Flight Offers API
export async function searchFlights(
  params: FlightSearchRequest,
  signal?: AbortSignal
): Promise<FlightSearchResponse> {
  try {
    const token = await getAccessToken();

    // Build the request body for Amadeus Flight Offers Search
    const requestBody = {
      currencyCode: params.currency,
      originDestinations: [
        {
          id: "1",
          originLocationCode: params.departure_id,
          destinationLocationCode: params.arrival_id,
          departureDateTimeRange: {
            date: params.outbound_date,
          },
        },
        // Add return leg for round trip
        ...(params.type === "1" && params.return_date
          ? [
            {
              id: "2",
              originLocationCode: params.arrival_id,
              destinationLocationCode: params.departure_id,
              departureDateTimeRange: {
                date: params.return_date,
              },
            },
          ]
          : []),
      ],
      travelers: Array.from({ length: params.adults || 1 }, (_, i) => ({
        id: String(i + 1),
        travelerType: "ADULT",
      })),
      sources: ["GDS"],
      searchCriteria: {
        maxFlightOffers: 50,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: mapTravelClassToAmadeus(params.travel_class || "1"),
              coverage: "MOST_SEGMENTS",
              originDestinationIds: ["1", ...(params.type === "1" && params.return_date ? ["2"] : [])],
            },
          ],
        },
      },
    };

    const { data } = await api.post<AmadeusFlightOffersResponse>(
      "/api/amadeus/flights",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }
    );

    return transformAmadeusResponse(data, params);
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: {
        message: `Failed to fetch flights: ${message}`,
        code: "NETWORK_ERROR",
      },
    };
  }
}

// Airport type for autocomplete results
export interface AirportOption {
  id: string;
  name: string;
  city: string;
  country: string;
}

// Search airports using Amadeus Airport & City Search API
export async function searchAirportsAsync(
  query: string,
  signal?: AbortSignal
): Promise<AirportOption[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const token = await getAccessToken();

    const searchParams = new URLSearchParams({
      subType: "AIRPORT,CITY",
      keyword: query,
      "page[limit]": "10",
      view: "LIGHT",
    });

    const { data } = await api.get<AmadeusLocationResponse>(
      `/api/amadeus/locations?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }
    );

    if (data.errors && data.errors.length > 0) {
      console.error("Amadeus location search error:", data.errors[0]);
      return [];
    }

    if (!data.data) {
      return [];
    }

    // Transform Amadeus locations to our AirportOption format
    const airports: AirportOption[] = data.data
      .filter(loc => loc.subType === "AIRPORT" || loc.subType === "CITY")
      .map(loc => ({
        id: loc.iataCode,
        name: loc.name,
        city: loc.address.cityName,
        country: loc.address.countryName,
      }));

    // Remove duplicates by IATA code
    const seen = new Set<string>();
    return airports.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
    console.error("Airport search error:", error);
    return [];
  }
}
