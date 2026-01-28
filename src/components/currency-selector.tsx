import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CURRENCIES } from "@/lib/currencies";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (currency: string) => void;
}

export function CurrencySelector({ value, onValueChange }: CurrencySelectorProps) {
  const selectedCurrency = CURRENCIES.find((c) => c.code === value) || CURRENCIES[3]; // Default to INR

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span className="text-base font-semibold">{selectedCurrency.symbol}</span>
          <span className="font-semibold">{selectedCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Select Currency
        </div>
        <DropdownMenuSeparator />
        {CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => onValueChange(currency.code)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currency.symbol}</span>
              <div>
                <div className="font-medium">{currency.code}</div>
                <div className="text-xs text-muted-foreground">{currency.name}</div>
              </div>
            </div>
            {value === currency.code && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
