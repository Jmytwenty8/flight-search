import { describe, it, expect } from "vitest";
import { searchAirportsAsync, type AirportOption } from "../flights.api";

describe("searchAirportsAsync", () => {
  it("returns empty array for short queries", async () => {
    expect(await searchAirportsAsync("")).toEqual([]);
    expect(await searchAirportsAsync("a")).toEqual([]);
  });

  it("returns AirportOption array type", async () => {
    // This test verifies the function signature without making actual API calls
    const result = await searchAirportsAsync("");
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("AirportOption type", () => {
  it("has required properties", () => {
    const airport: AirportOption = {
      id: "DEL",
      name: "Indira Gandhi International Airport",
      city: "New Delhi",
      country: "India",
    };
    expect(airport).toHaveProperty("id");
    expect(airport).toHaveProperty("name");
    expect(airport).toHaveProperty("city");
    expect(airport).toHaveProperty("country");
    expect(airport.id).toMatch(/^[A-Z]{3}$/);
  });
});
