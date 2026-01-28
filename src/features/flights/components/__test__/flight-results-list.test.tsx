import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { FlightResultsList } from "../flight-results-list";
import type { FlightResult } from "../../schemas";

const createMockFlight = (price: number): FlightResult => ({
  flights: [
    {
      departure_airport: { name: "CDG", id: "CDG", time: "2026-03-03 10:00" },
      arrival_airport: { name: "AUS", id: "AUS", time: "2026-03-03 17:00" },
      duration: 600,
      airline: "British Airways",
      airline_logo: "https://example.com/ba.png",
      travel_class: "Economy",
      flight_number: "BA 123",
    },
  ],
  total_duration: 600,
  price,
  type: "One way",
  airline_logo: "https://example.com/ba.png",
  booking_token: `token-${price}`,
});

describe("FlightResultsList", () => {
  const defaultProps = {
    bestFlights: [],
    otherFlights: [],
    isLoading: false,
    sortBy: "price" as const,
    onSortChange: vi.fn(),
    totalResults: 0,
    filteredCount: 0,
  };

  it("shows empty state when no flights", () => {
    render(<FlightResultsList {...defaultProps} />);
    expect(screen.getByText("No flights found")).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    render(<FlightResultsList {...defaultProps} isLoading />);
    // Loading state renders skeletons
    expect(screen.queryByText("No flights found")).not.toBeInTheDocument();
  });

  it("renders best flights section", () => {
    const bestFlights = [createMockFlight(300), createMockFlight(350)];

    render(
      <FlightResultsList
        {...defaultProps}
        bestFlights={bestFlights}
        totalResults={2}
        filteredCount={2}
      />
    );

    expect(screen.getByText("Best flights")).toBeInTheDocument();
    expect(screen.getByText("₹300")).toBeInTheDocument();
    expect(screen.getByText("₹350")).toBeInTheDocument();
  });

  it("renders other flights section", () => {
    const otherFlights = [createMockFlight(500), createMockFlight(600)];

    render(
      <FlightResultsList
        {...defaultProps}
        otherFlights={otherFlights}
        totalResults={2}
        filteredCount={2}
      />
    );

    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByText("₹600")).toBeInTheDocument();
  });

  it("shows results count", () => {
    const bestFlights = [createMockFlight(300)];
    const otherFlights = [createMockFlight(500), createMockFlight(600)];

    render(
      <FlightResultsList
        {...defaultProps}
        bestFlights={bestFlights}
        otherFlights={otherFlights}
        totalResults={10}
        filteredCount={3}
      />
    );

    expect(screen.getByText(/showing 3 of 10 flights/i)).toBeInTheDocument();
  });

  it("shows filtered badge when count is less than total", () => {
    render(
      <FlightResultsList
        {...defaultProps}
        otherFlights={[createMockFlight(500)]}
        totalResults={10}
        filteredCount={1}
      />
    );

    expect(screen.getByText("Filtered")).toBeInTheDocument();
  });

  it("has sort selector", () => {
    render(
      <FlightResultsList
        {...defaultProps}
        otherFlights={[createMockFlight(500)]}
        totalResults={1}
        filteredCount={1}
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders section headers when both best and other flights exist", () => {
    const bestFlights = [createMockFlight(300)];
    const otherFlights = [createMockFlight(500)];

    render(
      <FlightResultsList
        {...defaultProps}
        bestFlights={bestFlights}
        otherFlights={otherFlights}
        totalResults={2}
        filteredCount={2}
      />
    );

    expect(screen.getByText("Best flights")).toBeInTheDocument();
    expect(screen.getByText("Other departing flights")).toBeInTheDocument();
  });
});
