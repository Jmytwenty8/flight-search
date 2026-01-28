import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatPrice,
  formatTime,
  getStopsCount,
  getStopsLabel,
  getUniqueAirlines,
  getPriceRange,
  getDurationRange,
  filterFlights,
  sortFlights,
  getEmissionsLabel,
} from "../flight.utils";
import type { FlightResult, FlightFilter } from "../../schemas";

// Mock flight data for testing
const createMockFlight = (overrides: Partial<FlightResult> = {}): FlightResult => ({
  flights: [
    {
      departure_airport: { name: "CDG", id: "CDG", time: "2026-03-03 10:00" },
      arrival_airport: { name: "LHR", id: "LHR", time: "2026-03-03 11:30" },
      duration: 90,
      airline: "British Airways",
      airline_logo: "https://example.com/ba.png",
      travel_class: "Economy",
      flight_number: "BA 123",
    },
  ],
  total_duration: 90,
  price: 500,
  type: "One way",
  airline_logo: "https://example.com/ba.png",
  ...overrides,
});

describe("formatDuration", () => {
  it("formats hours and minutes correctly", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(60)).toBe("1h 0m");
    expect(formatDuration(125)).toBe("2h 5m");
  });

  it("formats minutes only when less than an hour", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(30)).toBe("30m");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});

describe("formatPrice", () => {
  it("formats INR correctly (default currency)", () => {
    expect(formatPrice(500)).toBe("₹500");
    expect(formatPrice(1234)).toBe("₹1,234");
    expect(formatPrice(99)).toBe("₹99");
  });

  it("formats USD correctly when specified", () => {
    expect(formatPrice(500, "USD")).toBe("$500");
    expect(formatPrice(1234, "USD")).toBe("$1,234");
  });

  it("formats EUR correctly", () => {
    const result = formatPrice(500, "EUR");
    expect(result).toContain("500");
    expect(result).toContain("€");
  });

  it("formats GBP correctly", () => {
    const result = formatPrice(500, "GBP");
    expect(result).toContain("500");
    expect(result).toContain("£");
  });

  it("formats JPY correctly", () => {
    const result = formatPrice(500, "JPY");
    expect(result).toContain("500");
    // JPY uses ￥ (fullwidth) in Japanese locale
    expect(result).toMatch(/[¥￥]/);
  });

  it("formats AUD correctly", () => {
    const result = formatPrice(500, "AUD");
    expect(result).toContain("500");
    // AUD uses $ symbol
    expect(result).toContain("$");
  });

  it("formats CAD correctly", () => {
    const result = formatPrice(500, "CAD");
    expect(result).toContain("500");
    // CAD uses $ symbol
    expect(result).toContain("$");
  });

  it("formats CNY correctly", () => {
    const result = formatPrice(500, "CNY");
    expect(result).toContain("500");
    // CNY uses ¥ symbol
    expect(result).toMatch(/[¥￥]/);
  });

  it("uses correct locale for each currency", () => {
    // USD should use en-US locale
    expect(formatPrice(1234567, "USD")).toBe("$1,234,567");
    
    // EUR should use en-DE locale
    const eurResult = formatPrice(1234567, "EUR");
    expect(eurResult).toContain("1");
    expect(eurResult).toContain("234");
    expect(eurResult).toContain("567");
    
    // INR should use en-IN locale
    expect(formatPrice(1234567, "INR")).toBe("₹12,34,567");
  });

  it("handles zero amount", () => {
    expect(formatPrice(0, "USD")).toBe("$0");
    expect(formatPrice(0, "EUR")).toContain("0");
  });

  it("handles large amounts", () => {
    expect(formatPrice(999999, "USD")).toBe("$999,999");
    expect(formatPrice(1000000, "GBP")).toContain("1,000,000");
  });
});

describe("formatTime", () => {
  it("formats 24h time to 12h format", () => {
    expect(formatTime("2026-03-03 10:30")).toBe("10:30 AM");
    expect(formatTime("2026-03-03 14:45")).toBe("2:45 PM");
    expect(formatTime("2026-03-03 00:00")).toBe("12:00 AM");
    expect(formatTime("2026-03-03 12:00")).toBe("12:00 PM");
  });

  it("handles edge cases", () => {
    expect(formatTime("")).toBe("");
    expect(formatTime("invalid")).toBe("");
  });
});

describe("getStopsCount", () => {
  it("returns 0 for direct flights", () => {
    const flight = createMockFlight({ layovers: undefined });
    expect(getStopsCount(flight)).toBe(0);
  });

  it("returns correct count for flights with layovers", () => {
    const flight = createMockFlight({
      layovers: [
        { duration: 60, name: "LHR", id: "LHR" },
        { duration: 90, name: "DFW", id: "DFW" },
      ],
    });
    expect(getStopsCount(flight)).toBe(2);
  });
});

describe("getStopsLabel", () => {
  it("returns correct labels", () => {
    expect(getStopsLabel(0)).toBe("Nonstop");
    expect(getStopsLabel(1)).toBe("1 stop");
    expect(getStopsLabel(2)).toBe("2 stops");
    expect(getStopsLabel(3)).toBe("3 stops");
  });
});

describe("getUniqueAirlines", () => {
  it("extracts unique airlines from flights", () => {
    const flights = [
      createMockFlight({
        flights: [
          { ...createMockFlight().flights[0], airline: "British Airways" },
        ],
      }),
      createMockFlight({
        flights: [
          { ...createMockFlight().flights[0], airline: "Delta" },
        ],
      }),
      createMockFlight({
        flights: [
          { ...createMockFlight().flights[0], airline: "British Airways" },
        ],
      }),
    ];

    const airlines = getUniqueAirlines(flights);
    expect(airlines).toHaveLength(2);
    expect(airlines).toContain("British Airways");
    expect(airlines).toContain("Delta");
  });

  it("returns empty array for no flights", () => {
    expect(getUniqueAirlines([])).toEqual([]);
  });
});

describe("getPriceRange", () => {
  it("returns min and max prices", () => {
    const flights = [
      createMockFlight({ price: 300 }),
      createMockFlight({ price: 500 }),
      createMockFlight({ price: 700 }),
    ];

    const range = getPriceRange(flights);
    expect(range.min).toBe(300);
    expect(range.max).toBe(700);
  });

  it("handles empty array", () => {
    const range = getPriceRange([]);
    expect(range.min).toBe(0);
    expect(range.max).toBe(1000);
  });
});

describe("getDurationRange", () => {
  it("returns min and max durations", () => {
    const flights = [
      createMockFlight({ total_duration: 120 }),
      createMockFlight({ total_duration: 300 }),
      createMockFlight({ total_duration: 480 }),
    ];

    const range = getDurationRange(flights);
    expect(range.min).toBe(120);
    expect(range.max).toBe(480);
  });
});

describe("filterFlights", () => {
  const flights = [
    createMockFlight({ price: 300, total_duration: 120, layovers: undefined }),
    createMockFlight({
      price: 500,
      total_duration: 300,
      layovers: [{ duration: 60, name: "LHR", id: "LHR" }],
    }),
    createMockFlight({
      price: 700,
      total_duration: 480,
      layovers: [
        { duration: 60, name: "LHR", id: "LHR" },
        { duration: 90, name: "DFW", id: "DFW" },
      ],
    }),
  ];

  it("filters by max price", () => {
    const filter: FlightFilter = { maxPrice: 400 };
    const result = filterFlights(flights, filter);
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(300);
  });

  it("filters by min price", () => {
    const filter: FlightFilter = { minPrice: 400 };
    const result = filterFlights(flights, filter);
    expect(result).toHaveLength(2);
  });

  it("filters by stops", () => {
    const filter: FlightFilter = { stops: [0] };
    const result = filterFlights(flights, filter);
    expect(result).toHaveLength(1);
    expect(result[0].layovers).toBeUndefined();
  });

  it("filters by max duration", () => {
    const filter: FlightFilter = { maxDuration: 200 };
    const result = filterFlights(flights, filter);
    expect(result).toHaveLength(1);
    expect(result[0].total_duration).toBe(120);
  });

  it("combines multiple filters", () => {
    const filter: FlightFilter = { maxPrice: 600, stops: [1] };
    const result = filterFlights(flights, filter);
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(500);
  });
});

describe("sortFlights", () => {
  const flights = [
    createMockFlight({ price: 500, total_duration: 300 }),
    createMockFlight({ price: 300, total_duration: 480 }),
    createMockFlight({ price: 700, total_duration: 120 }),
  ];

  it("sorts by price", () => {
    const sorted = sortFlights(flights, "price");
    expect(sorted[0].price).toBe(300);
    expect(sorted[1].price).toBe(500);
    expect(sorted[2].price).toBe(700);
  });

  it("sorts by duration", () => {
    const sorted = sortFlights(flights, "duration");
    expect(sorted[0].total_duration).toBe(120);
    expect(sorted[1].total_duration).toBe(300);
    expect(sorted[2].total_duration).toBe(480);
  });
});

describe("getEmissionsLabel", () => {
  it("returns low emissions label for significant reduction", () => {
    const result = getEmissionsLabel(-15);
    expect(result.label).toBe("15% less CO₂");
    expect(result.variant).toBe("secondary");
  });

  it("returns average label for slight reduction", () => {
    const result = getEmissionsLabel(-5);
    expect(result.label).toBe("Avg emissions");
    expect(result.variant).toBe("outline");
  });

  it("returns high emissions label for significant increase", () => {
    const result = getEmissionsLabel(25);
    expect(result.label).toBe("25% more CO₂");
    expect(result.variant).toBe("destructive");
  });
});
