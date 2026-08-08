import { CalendarIcon, CaretDownIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";

import FormBase, { FormControlProps } from "@/components/form/base";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/use-form";

interface Props extends FormControlProps {}

export default function FormDate({ ...props }: Props) {
  const field = useFieldContext<Date>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(field.state.value);

  function handleChange(newDate: Date) {
    setDate(newDate);
    field.setValue(newDate);
    setOpen(false);
  }

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
            {date ? format(date, "PPP") : "Pick a date"}
          </span>
          <CaretDownIcon />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleChange}
            captionLayout="dropdown"
            required
          />
        </PopoverContent>
      </Popover>
    </FormBase>
  );
}
