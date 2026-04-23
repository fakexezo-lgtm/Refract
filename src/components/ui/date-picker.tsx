import React from "react";
import { 
  Button, 
  Calendar, 
  CalendarCell, 
  CalendarGrid, 
  CalendarGridBody, 
  CalendarGridHeader, 
  CalendarHeaderCell, 
  DatePicker as AriaDatePicker, 
  DatePickerProps as AriaDatePickerProps, 
  DateInput, 
  DateSegment, 
  Dialog, 
  Group, 
  Heading, 
  Popover,
  DateValue
} from "react-aria-components";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Calendar03Icon, 
  ArrowLeft01Icon, 
  ArrowRight01Icon 
} from "@hugeicons/core-free-icons";
import { cn } from "@/utils";

export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
  return (
    <AriaDatePicker
      {...props}
      className={cn("group flex flex-col gap-1.5", props.className)}
    >
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-soft ml-1">
          {label}
        </label>
      )}
      <Group className="flex items-center gap-0 w-full rounded-xl border border-hair bg-white focus-within:border-charcoal transition-all h-11 px-3 shadow-sm group-data-[invalid]:border-danger">
        <DateInput className="flex flex-1 py-2 text-sm text-ink selection:bg-charcoal selection:text-white">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 rounded-sm focus:bg-charcoal focus:text-white outline-none caret-transparent tabular-nums"
            />
          )}
        </DateInput>
        <Button className="flex items-center justify-center w-8 h-8 rounded-lg text-soft hover:text-ink hover:bg-cream transition-all outline-none active:scale-90">
          <HugeiconsIcon icon={Calendar03Icon} size={16} />
        </Button>
      </Group>
      {description && <p className="text-[10px] text-soft px-1">{description}</p>}
      {errorMessage && <p className="text-[10px] text-danger px-1">{errorMessage}</p>}
      
      <Popover
        className="z-50 rounded-2xl border border-hair bg-white p-4 shadow-xl data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in data-[exiting]:fade-out data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95"
        offset={8}
      >
        <Dialog className="outline-none">
          <Calendar className="w-[280px]">
            <header className="flex items-center justify-between pb-4">
              <Button
                slot="previous"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-hair bg-white text-soft hover:text-ink hover:bg-cream transition-all active:scale-90"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </Button>
              <Heading className="text-sm font-serif font-bold text-ink" />
              <Button
                slot="next"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-hair bg-white text-soft hover:text-ink hover:bg-cream transition-all active:scale-90"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Button>
            </header>
            <CalendarGrid className="w-full border-collapse">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-[10px] font-bold text-soft/60 uppercase pb-2">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody className="border-collapse">
                {(date) => (
                  <CalendarCell
                    date={date}
                    className="w-8 h-8 text-sm flex items-center justify-center rounded-lg cursor-default outline-none transition-all
                      hover:bg-cream hover:text-ink
                      data-[selected]:bg-charcoal data-[selected]:text-white data-[selected]:font-bold
                      data-[outside-month]:text-soft/20 data-[outside-month]:pointer-events-none
                      data-[disabled]:text-soft/20 data-[disabled]:pointer-events-none
                      data-[today]:border data-[today]:border-brown/20 data-[today]:text-brown
                      data-[focus-visible]:ring-2 data-[focus-visible]:ring-charcoal/20"
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}

