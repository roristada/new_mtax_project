"use client";
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { addMonths, format, isAfter, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Appointment = {
  date: string;
  startTime: string;
  endTime: string;
};

export default function Appointment() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    telephone: "",
    note: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [disabledTimes, setDisabledTimes] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all appointments on initial load
    async function fetchAppointments() {
      try {
        const res = await fetch(`/api/appointment`);
        const data = await res.json();
        if (data.appointments) {
          setAppointments(data.appointments);

          // Calculate fully booked dates
          const dateMap: { [key: string]: number } = {};
          data.appointments.forEach((appointment: Appointment) => {
            const dateStr = new Date(appointment.date).toDateString();
            if (!dateMap[dateStr]) {
              dateMap[dateStr] = 0;
            }
            dateMap[dateStr]++;
            console.log("dateMap:",dateMap)
          });

          const fullyBooked = Object.keys(dateMap).filter(
            (dateStr) => dateMap[dateStr] >= 3 // Assuming 3 time slots per day
          );
          console.log("Fully booked dates:", fullyBooked);
          setFullyBookedDates(fullyBooked);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    }

    fetchAppointments();
  }, []);

  useEffect(() => {
    // Update disabled times based on selected date
    if (date) {
      const selectedDateAppointments = appointments.filter(
        (appointment) => new Date(appointment.date).toDateString() === date.toDateString()
      );
      setDisabledTimes(selectedDateAppointments.map((appointment) => appointment.startTime));
    } else {
      setDisabledTimes([]);
    }
  }, [date, appointments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, company, email, telephone, startTime, endTime } = formData;

    // Client-side validation
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        company,
        email,
        telephone,
        startTime,
        endTime,
        date,
        note: formData.note,
      }),
    });

    if (!res.ok) {
      setLoading(false);
      const { error } = await res.json();
      setError(error || "Appointment failed");
      return;
    }

    const data = await res.json();
    console.log(data);

    Swal.fire({
      title: "Good job!",
      text: "Appointment successfully created",
      icon: "success",
    }).then(() => {
      setLoading(false);
      router.push("/");
    });
  };

  const startTimes = ["10:00 AM", "12:00 PM", "2:00 PM"] as const;
  const endTimes: { [key in (typeof startTimes)[number]]: string } = {
    "10:00 AM": "11:00 AM",
    "12:00 PM": "1:00 PM",
    "2:00 PM": "3:00 PM",
  };

  const today = startOfToday();
  const oneMonthLater = addMonths(today, 1);

  return (
    <>
      <Navbar />
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg space-y-6 border rounded-lg shadow-lg p-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Appointment</h1>
            <p className="text-muted-foreground">
              Enter your details to Appointment.
            </p>
          </div>

          <form onSubmit={handleAppointment}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter your Company"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(d) =>
                        isBefore(d, today) || 
                        isAfter(d, oneMonthLater) || 
                        fullyBookedDates.includes(d.toDateString())
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        startTime: value,
                        endTime: endTimes[value as keyof typeof endTimes],
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Start Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Start Times:</SelectLabel>
                        {startTimes.map((time) => (
                          <SelectItem
                            key={time}
                            value={time}
                            disabled={disabledTimes.includes(time)}
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    value={formData.endTime}
                    readOnly
                    placeholder="End Time"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Enter your note"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submiting..." : "Submit"}

              </Button>
            </div>
            {error && <p className="text-red-500 mt-6">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
