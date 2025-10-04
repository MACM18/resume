"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, formatMonthYear } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react";

type MonthPickerProps = {
  value: string | null | undefined; // YYYY-MM
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseValue(
  value?: string | null
): { year: number; month: number } | null {
  if (!value) return null;
  const [y, m] = value.split("-");
  const year = Number(y);
  const month = Number(m) - 1;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 0 ||
    month > 11
  )
    return null;
  return { year, month };
}

function padMonth(m: number) {
  return String(m + 1).padStart(2, "0");
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Pick a month",
  disabled,
  className,
  allowClear = false,
}: MonthPickerProps) {
  const parsed = parseValue(value ?? null) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };
  const [open, setOpen] = React.useState(false);
  const [year, setYear] = React.useState(parsed.year);

  // Keep internal year in sync if the external value changes
  React.useEffect(() => {
    const p = parseValue(value ?? null);
    if (p) setYear(p.year);
  }, [value]);

  const displayText = value ? formatMonthYear(`${value}-01`) : undefined;

  const selectMonth = (monthIndex: number) => {
    const v = `${year}-${padMonth(monthIndex)}`;
    onChange(v);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {displayText || placeholder}
          {allowClear && value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clear}
              className='ml-auto inline-flex items-center text-foreground/60 hover:text-foreground'
              aria-label='Clear selection'
            >
              <X className='h-4 w-4' />
            </Button>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[320px]' align='start'>
        <div className='flex items-center justify-between mb-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='text-sm font-medium'>{year}</div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {(() => {
            const parsedValue = parseValue(value ?? null);
            return MONTHS.map((label, idx) => (
              <Button
                key={label}
                type='button'
                variant={
                  parsedValue?.year === year &&
                  parsedValue?.month === idx
                    ? "default"
                    : "outline"
                }
                className='w-full'
                onClick={() => selectMonth(idx)}
              >
                {label}
              </Button>
            ));
          })()}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default MonthPicker;
