import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  disabled,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const defaultDisabled = React.useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    },
    [minDate]
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-12",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "EEE, MMM d") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            disabled={disabled || defaultDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
