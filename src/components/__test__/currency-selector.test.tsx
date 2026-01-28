import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencySelector } from "../currency-selector";
import { CURRENCIES } from "@/lib/currencies";

describe("CurrencySelector", () => {
    it("renders with default INR currency", () => {
        const onValueChange = vi.fn();
        render(<CurrencySelector value="INR" onValueChange={onValueChange} />);

        expect(screen.getByRole("button")).toHaveTextContent("₹");
        expect(screen.getByRole("button")).toHaveTextContent("INR");
    });

    it("renders with USD currency", () => {
        const onValueChange = vi.fn();
        render(<CurrencySelector value="USD" onValueChange={onValueChange} />);

        expect(screen.getByRole("button")).toHaveTextContent("$");
        expect(screen.getByRole("button")).toHaveTextContent("USD");
    });

    it("opens dropdown menu on click", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<CurrencySelector value="USD" onValueChange={onValueChange} />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByText("Select Currency")).toBeInTheDocument();
    });

    it("displays all available currencies in dropdown", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<CurrencySelector value="USD" onValueChange={onValueChange} />);

        await user.click(screen.getByRole("button"));

        CURRENCIES.forEach((currency) => {
            const codeElements = screen.getAllByText(currency.code);
            expect(codeElements.length).toBeGreaterThan(0);
            expect(screen.getByText(currency.name)).toBeInTheDocument();
        });
    });

    it("shows checkmark for selected currency", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<CurrencySelector value="EUR" onValueChange={onValueChange} />);

        await user.click(screen.getByRole("button"));

        // EUR should have a checkmark (svg with path element)
        const menuItems = screen.getAllByRole("menuitem");
        const eurItem = menuItems.find(item => item.textContent?.includes("Euro"));
        expect(eurItem?.querySelector("svg")).toBeInTheDocument();
    });

    it("calls onValueChange when currency is selected", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<CurrencySelector value="USD" onValueChange={onValueChange} />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByText("Euro"));

        expect(onValueChange).toHaveBeenCalledWith("EUR");
    });

    it("updates displayed symbol when value changes", () => {
        const onValueChange = vi.fn();
        const { rerender } = render(
            <CurrencySelector value="USD" onValueChange={onValueChange} />
        );

        expect(screen.getByRole("button")).toHaveTextContent("$");

        rerender(<CurrencySelector value="GBP" onValueChange={onValueChange} />);

        expect(screen.getByRole("button")).toHaveTextContent("£");
    });

    it("falls back to INR if invalid currency code is provided", () => {
        const onValueChange = vi.fn();
        render(<CurrencySelector value="INVALID" onValueChange={onValueChange} />);

        expect(screen.getByRole("button")).toHaveTextContent("₹");
        expect(screen.getByRole("button")).toHaveTextContent("INR");
    });

    it("displays currency symbols correctly for all currencies", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<CurrencySelector value="USD" onValueChange={onValueChange} />);

        await user.click(screen.getByRole("button"));

        const expectedSymbols = ["$", "€", "£", "₹", "¥", "A$", "C$"];
        expectedSymbols.forEach((symbol) => {
            expect(screen.getAllByText(symbol).length).toBeGreaterThan(0);
        });
    });
});
