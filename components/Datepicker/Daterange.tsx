"use client";

import * as React from "react";
import { addDays,differenceInDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  fullyBookedDates?: Date[];
  bookedInDates: Date[]; // Accept fullyBookedDates as an array of Date objects
  onDateChange?: (dates: { date: string; startTime: string; endTime: string }[]) => void; // Add onDateChange prop
}

export function DatePickerWithRange({
  className,
  fullyBookedDates,
  bookedInDates,
  onDateChange,  // Default empty array
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  console.log("range" ,date)

  

  // const getAllDatesInRange = (start: Date, end: Date): Date[] => {
  //   const dates: Date[] = [];
  //   const daysCount = differenceInDays(end, start);

  //   for (let i = 0; i <= daysCount; i++) {
  //     dates.push(addDays(start, i));
  //   }
  //   return dates;
  // };

  const generateTimeSlotsForDate = (date: Date) => {
    const timeSlots = [
      { startTime: "10:00 AM", endTime: "11:00 AM" },
      { startTime: "12:00 PM", endTime: "1:00 PM" },
      { startTime: "2:00 PM", endTime: "3:00 PM" },
    ];
  
    // แปลงวันที่เป็น string (เช่น '2024-01-01')
    const dateString = format(date, "yyyy-MM-dd HH:mm:ss.SSS");
  
    // สร้าง array ของเวลาที่มีวันที่กำกับ
    return timeSlots.map((slot) => ({
      date: dateString,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const generateTimeSlotsForDateRange = (from: Date, to: Date) => {
    const daysBetween = differenceInDays(to, from);
    let allTimeSlots: Array<{ date: string; startTime: string; endTime: string }> = [];
  
    for (let i = 0; i <= daysBetween; i++) {
      const currentDate = addDays(from, i);
      const timeSlotsForCurrentDate = generateTimeSlotsForDate(currentDate);
      allTimeSlots = [...allTimeSlots, ...timeSlotsForCurrentDate];
    }
  
    return allTimeSlots;
  };

  const handleDateRangeSelection = (selectedDate: DateRange | undefined) => {
    if (selectedDate?.from && selectedDate?.to) {
      // If the user selects a range (from one day to another)
      const allTimeSlots = generateTimeSlotsForDateRange(
        selectedDate.from,
        selectedDate.to
      );
      setDate(selectedDate);
      console.log("All Time Slots (Range):", allTimeSlots);
  
      // Call onDateChange and pass the selected time slots to the parent
      if (onDateChange) {
        onDateChange(allTimeSlots);
      }
    } else if (selectedDate?.from) {
      // If the user selects a single day
      const timeSlotsForSingleDay = generateTimeSlotsForDate(selectedDate.from);
      setDate(selectedDate);
      console.log("Time Slots (Single Day):", timeSlotsForSingleDay);
  
      // Call onDateChange and pass the selected time slots to the parent
      if (onDateChange) {
        onDateChange(timeSlotsForSingleDay);
      }
    }
  };

  const isDisabled = (date: Date) => {
    // Compare date.getTime() for proper comparison
    return (
      fullyBookedDates?.some(
        (bookedDate) => bookedDate.getTime() === date.getTime()
      ) ||
      bookedInDates.some(
        (bookedDate) => bookedDate.getTime() === date.getTime()
      )
    );
  };


  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={handleDateRangeSelection}
            numberOfMonths={2}
            fromDate={new Date()}  // Disables past dates
            disabled={isDisabled} // Disable fully booked dates
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
