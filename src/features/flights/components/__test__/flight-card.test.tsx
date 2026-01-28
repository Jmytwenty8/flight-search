import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { FlightCard } from "../flight-card";
import type { FlightResult } from "../../schemas";

const mockFlight: FlightResult = {
  flights: [
    {
      departure_airport: {
        name: "Paris Charles de Gaulle Airport",
        id: "CDG",
        time: "2026-03-03 10:10",
      },
      arrival_airport: {
        name: "Heathrow Airport",
        id: "LHR",
        time: "2026-03-03 11:40",
      },
      duration: 90,
      airplane: "Airbus A319",
      airline: "British Airways",
      airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/BA.png",
      travel_class: "Economy",
      flight_number: "BA 301",
      legroom: "29 in",
      extensions: ["Below average legroom (29 in)", "In-seat USB outlet"],
    },
    {
      departure_airport: {
        name: "Heathrow Airport",
        id: "LHR",
        time: "2026-03-03 13:10",
      },
      arrival_airport: {
        name: "Austin-Bergstrom International Airport",
        id: "AUS",
        time: "2026-03-03 17:50",
      },
      duration: 640,
      airplane: "Airbus A350",
      airline: "British Airways",
      airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/BA.png",
      travel_class: "Economy",
      flight_number: "BA 191",
      legroom: "31 in",
      extensions: ["Average legroom (31 in)", "Wi-Fi for a fee"],
    },
  ],
  layovers: [
    {
      duration: 90,
      name: "Heathrow Airport",
      id: "LHR",
    },
  ],
  total_duration: 820,
  carbon_emissions: {
    this_flight: 525000,
    typical_for_this_route: 529000,
    difference_percent: -1,
  },
  price: 520,
  type: "One way",
  airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/BA.png",
  extensions: ["Checked baggage for a fee", "Full refund for cancellations"],
  booking_token: "test-token",
};

describe("FlightCard", () => {
  it("renders flight price", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText("₹520")).toBeInTheDocument();
  });

  it("renders departure and arrival airport codes", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText("CDG")).toBeInTheDocument();
    expect(screen.getByText("AUS")).toBeInTheDocument();
  });

  it("renders flight type", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText("One way")).toBeInTheDocument();
  });

  it("renders airline logo", () => {
    render(<FlightCard flight={mockFlight} />);
    const logos = screen.getAllByRole("img", { name: /airline/i });
    expect(logos.length).toBeGreaterThan(0);
  });

  it("displays stop information", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText("1 stop")).toBeInTheDocument();
  });

  it("displays total duration", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText(/13h 40m/)).toBeInTheDocument();
  });

  it("can expand to show flight details", async () => {
    const user = userEvent.setup();
    render(<FlightCard flight={mockFlight} />);

    // Find expand button
    const expandButton = screen.getByRole("button", { name: /flight details/i });
    expect(expandButton).toBeInTheDocument();

    // Click to expand
    await user.click(expandButton);

    // After expanding, the hide details button should appear
    expect(screen.getByRole("button", { name: /hide details/i })).toBeInTheDocument();
  });

  it("shows rank badge for best flights", () => {
    render(<FlightCard flight={mockFlight} rank={1} isBestFlight />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders nonstop flight correctly", () => {
    const nonstopFlight: FlightResult = {
      ...mockFlight,
      flights: [mockFlight.flights[0]],
      layovers: undefined,
      total_duration: 90,
    };

    render(<FlightCard flight={nonstopFlight} />);
    expect(screen.getByText("Nonstop")).toBeInTheDocument();
  });
});
