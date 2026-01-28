import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { FlightFiltersDesktop, ActiveFilters } from "./flight-filters";
import type { FlightFilter } from "../schemas";

const createDefaultProps = () => ({
    filters: {} as FlightFilter,
    onFilterChange: vi.fn(() => { }),
    onClearFilters: vi.fn(() => { }),
    hasActiveFilters: false,
    airlines: ["British Airways", "Delta", "American"],
    priceRange: { min: 200, max: 1000 },
    durationRange: { min: 60, max: 1200 },
});

describe("FlightFiltersDesktop", () => {
    it("renders filter card title", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} />);

        expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("renders stop options with labels", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} />);

        expect(screen.getByText("Stops")).toBeInTheDocument();
        expect(screen.getByText("Nonstop")).toBeInTheDocument();
        expect(screen.getByText("1 stop")).toBeInTheDocument();
        expect(screen.getByText("2+ stops")).toBeInTheDocument();
    });

    it("renders airline options", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} />);

        expect(screen.getByText("Airlines")).toBeInTheDocument();
        expect(screen.getByText("British Airways")).toBeInTheDocument();
        expect(screen.getByText("Delta")).toBeInTheDocument();
        expect(screen.getByText("American")).toBeInTheDocument();
    });

    it("shows clear filters button when filters are active", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} hasActiveFilters />);

        expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
    });

    it("does not show clear filters button when no filters are active", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} hasActiveFilters={false} />);

        expect(screen.queryByText(/clear all filters/i)).not.toBeInTheDocument();
    });

    it("calls onClearFilters when clear button is clicked", async () => {
        const user = userEvent.setup();
        const onClearFilters = vi.fn(() => { });

        render(
            <FlightFiltersDesktop
                {...createDefaultProps()}
                hasActiveFilters
                onClearFilters={onClearFilters}
            />
        );

        await user.click(screen.getByText(/clear all filters/i));
        expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it("renders checkboxes for stops filter", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} />);

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("shows active badge when filters are applied", () => {
        render(<FlightFiltersDesktop {...createDefaultProps()} hasActiveFilters />);

        expect(screen.getByText("Active")).toBeInTheDocument();
    });
});

describe("ActiveFilters", () => {
    it("renders nothing when no filters are active", () => {
        const { container } = render(
            <ActiveFilters
                filters={{}}
                onFilterChange={vi.fn(() => { })}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renders stop filter chips", () => {
        render(
            <ActiveFilters
                filters={{ stops: [0, 1] }}
                onFilterChange={vi.fn(() => { })}
            />
        );

        expect(screen.getByText("Nonstop")).toBeInTheDocument();
        expect(screen.getByText("1 stop")).toBeInTheDocument();
    });

    it("renders price filter chip", () => {
        render(
            <ActiveFilters
                filters={{ minPrice: 200, maxPrice: 500 }}
                onFilterChange={vi.fn(() => { })}
            />
        );

        expect(screen.getByText("₹200 - ₹500")).toBeInTheDocument();
    });

    it("renders duration filter chip", () => {
        render(
            <ActiveFilters
                filters={{ maxDuration: 300 }}
                onFilterChange={vi.fn(() => { })}
            />
        );

        expect(screen.getByText("Max 5h 0m")).toBeInTheDocument();
    });

    it("renders airline filter chips", () => {
        render(
            <ActiveFilters
                filters={{ airlines: ["Delta", "American"] }}
                onFilterChange={vi.fn(() => { })}
            />
        );

        expect(screen.getByText("Delta")).toBeInTheDocument();
        expect(screen.getByText("American")).toBeInTheDocument();
    });

    it("removes filter when chip is clicked", async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn(() => { });

        render(
            <ActiveFilters
                filters={{ stops: [0] }}
                onFilterChange={onFilterChange}
            />
        );

        await user.click(screen.getByText("Nonstop"));
        expect(onFilterChange).toHaveBeenCalledWith({ stops: undefined });
    });
});
