import { describe, it, expect } from "vitest";
import { CURRENCIES } from "../currencies";

describe("currencies", () => {
    it("exports CURRENCIES array", () => {
        expect(CURRENCIES).toBeDefined();
        expect(Array.isArray(CURRENCIES)).toBe(true);
    });

    it("contains 8 currencies", () => {
        expect(CURRENCIES).toHaveLength(8);
    });

    it("contains required currency properties", () => {
        CURRENCIES.forEach((currency) => {
            expect(currency).toHaveProperty("code");
            expect(currency).toHaveProperty("symbol");
            expect(currency).toHaveProperty("name");

            expect(typeof currency.code).toBe("string");
            expect(typeof currency.symbol).toBe("string");
            expect(typeof currency.name).toBe("string");
        });
    });

    it("contains expected currencies", () => {
        const codes = CURRENCIES.map((c) => c.code);
        expect(codes).toContain("USD");
        expect(codes).toContain("EUR");
        expect(codes).toContain("GBP");
        expect(codes).toContain("INR");
        expect(codes).toContain("JPY");
        expect(codes).toContain("AUD");
        expect(codes).toContain("CAD");
        expect(codes).toContain("CNY");
    });

    it("has correct symbols for currencies", () => {
        const currencyMap = new Map(CURRENCIES.map((c) => [c.code, c.symbol]));

        expect(currencyMap.get("USD")).toBe("$");
        expect(currencyMap.get("EUR")).toBe("€");
        expect(currencyMap.get("GBP")).toBe("£");
        expect(currencyMap.get("INR")).toBe("₹");
        expect(currencyMap.get("JPY")).toBe("¥");
        expect(currencyMap.get("AUD")).toBe("A$");
        expect(currencyMap.get("CAD")).toBe("C$");
        expect(currencyMap.get("CNY")).toBe("¥");
    });

    it("has correct names for currencies", () => {
        const currencyMap = new Map(CURRENCIES.map((c) => [c.code, c.name]));

        expect(currencyMap.get("USD")).toBe("US Dollar");
        expect(currencyMap.get("EUR")).toBe("Euro");
        expect(currencyMap.get("GBP")).toBe("British Pound");
        expect(currencyMap.get("INR")).toBe("Indian Rupee");
        expect(currencyMap.get("JPY")).toBe("Japanese Yen");
        expect(currencyMap.get("AUD")).toBe("Australian Dollar");
        expect(currencyMap.get("CAD")).toBe("Canadian Dollar");
        expect(currencyMap.get("CNY")).toBe("Chinese Yuan");
    });

    it("has unique currency codes", () => {
        const codes = CURRENCIES.map((c) => c.code);
        const uniqueCodes = new Set(codes);
        expect(uniqueCodes.size).toBe(codes.length);
    });

    it("has no empty strings", () => {
        CURRENCIES.forEach((currency) => {
            expect(currency.code.length).toBeGreaterThan(0);
            expect(currency.symbol.length).toBeGreaterThan(0);
            expect(currency.name.length).toBeGreaterThan(0);
        });
    });

    it("INR is at index 3 (default fallback)", () => {
        expect(CURRENCIES[3].code).toBe("INR");
    });
});
