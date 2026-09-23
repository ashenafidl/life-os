import { CalendarIcon, CaretDownIcon } from "@phosphor-icons/react";
import { format, startOfDay } from "date-fns";
import { useState } from "react";
import { DayPickerProps } from "react-day-picker";

import FormBase, { FormControlProps } from "@/components/form/base";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/use-form";

type CalendarPassthroughProps = Pick<
  DayPickerProps,
  "disabled" | "startMonth" | "endMonth"
>;

interface Props extends FormControlProps, CalendarPassthroughProps {
  showTime?: boolean;
}

function toTimeString(date: Date): string {
  return format(date, "HH:mm");
}

function applyTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export default function FormDate({
  disabled,
  startMonth,
  endMonth,
  showTime = false,
  ...props
}: Props) {
  const field = useFieldContext<Date>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const today = startOfDay(new Date());

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(field.state.value);

  const commit = (newDate: Date) => {
    setDate(newDate);
    field.setValue(newDate);
  };

  const handleDateSelect = (newDate: Date) => {
    // Preserve whatever time-of-day was already set, rather than resetting
    // to midnight every time the calendar day changes — picking a new date
    // shouldn't silently discard a time the user already chose.
    const merged = showTime
      ? applyTime(newDate, toTimeString(date ?? today))
      : newDate;
    commit(merged);

    // Only auto-close when there's no time step left to complete —
    // with showTime on, the user still needs to adjust the time input.
    if (!showTime) setOpen(false);
  };

  const handleTimeChange = (value: string) => {
    if (!value) return;
    commit(applyTime(date ?? today, value));
  };

  return (
    <FormBase {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              data-empty={!date}
              className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
            />
          }
          aria-invalid={isInvalid}
        >
          <CalendarIcon />
          <span className="grow">
            {date
              ? format(
                  date,
                  showTime ? "MMMM d, yyyy 'at' HH:mm" : "MMMM d, yyyy",
                )
              : "Pick a date"}
          </span>
          <CaretDownIcon />
        </PopoverTrigger>
        <PopoverContent className="w-auto gap-0 p-0!">
          <Calendar
            required
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            defaultMonth={date ?? today}
            disabled={disabled}
            startMonth={startMonth}
            endMonth={endMonth}
            className="pb-0"
          />
          {showTime && (
            <div className="m-0 flex flex-col gap-2 p-4">
              <Input
                type="time"
                value={date ? toTimeString(date) : ""}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </FormBase>
  );
}
