"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Label } from "../../../../../components/ui/label";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import {
  addMonths,
  format,
  isAfter,
  isBefore,
  startOfToday,
  addDays,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../../../../../lib/utils";
import { Calendar } from "../../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useSession } from "next-auth/react";
import useAuthAdmin from "../../../../../lib/useAuthAdmin";
import { DatePickerWithRange } from "../../../../../components/Datepicker/Daterange";

import AppointmentCalendar from "../../../../../components/Calendar/AppointmentCalendar";
import { useTranslations } from 'next-intl';

type Appointment = {
  id: number;
  name: string;
  company: string;
  email: string;
  telephone: string;
  startTime: string;
  endTime: string;
  date: string;
  note: string;
  status: string;
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

  const [formAdminData, setFormAdminData] = useState({
    name: "",
    company: "",
    email: "",
    telephone: "",
    note: "",
    timeSlots: [] as { date: string; startTime: string; endTime: string }[], // Store multiple time slots
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [disabledTimes, setDisabledTimes] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [BookedInDates, setBookedInDates] = useState<string[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const { data: session, status } = useSession();

  useAuthAdmin((authenticated) => {
    setIsAuthChecked(authenticated);
  });

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
            console.log("dateMap:", dateMap);
          });

          const fullyBooked = Object.keys(dateMap).filter(
            (dateStr) => dateMap[dateStr] >= 3 // Assuming 3 time slots per day
          );
          const Bookedday = Object.keys(dateMap).filter(
            (dateStr) => dateMap[dateStr] > 0 // Assuming 3 time slots per day
          );
          console.log("Fully booked dates:", fullyBooked);
          setFullyBookedDates(fullyBooked);
          setBookedInDates(Bookedday);
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
        (appointment) =>
          new Date(appointment.date).toDateString() === date.toDateString()
      );
      setDisabledTimes(
        selectedDateAppointments.map((appointment) => appointment.startTime)
      );
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
  const oneMonthLater = addMonths(today, 2);
  const dateFullyBookedDates = fullyBookedDates.map(
    (dateStr) => new Date(dateStr)
  );
  const dateBookedInDates = BookedInDates.map((dateStr) => new Date(dateStr));

  useEffect(() => {
    // Update formAdminData with session info if available
    if (session && session.user) {
      setFormAdminData((prevData) => {
        if (
          prevData.email !== session.user?.email ||
          prevData.company !== session.user.company ||
          prevData.name !== session.user.role
        ) {
          return {
            name: session.user?.role || "",
            company: session.user?.company || "",
            email: session.user?.email || "",
            telephone: prevData.telephone, // Keep existing telephone
            note: prevData.note, // Keep existing note
            timeSlots: prevData.timeSlots, // Keep existing time slots
          };
        }
        return prevData; // No change needed
      });
    }
  }, [session]);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormAdminData({
      ...formAdminData,
      [e.target.id]: e.target.value,
    });
  };

  // const handleDateChange = (slots: { date: string; startTime: string; endTime: string }[]) => {
  //   if (slots.length > 0) {
  //     const firstSlot = slots[0]; // Assuming you're using the first slot or you can customize this
  //     setFormAdminData({
  //       ...formAdminData,
  //       startTime: firstSlot.startTime,
  //       endTime: firstSlot.endTime,
  //       date: firstSlot.date, // Set the date from the slot
  //     });
  //   }
  //   console.log(slots)

  // };

  const handleDateChange = (
    slots: { date: string; startTime: string; endTime: string }[]
  ) => {
    if (slots.length > 0) {
      // Update formAdminData to hold all selected time slots
      setFormAdminData((prevState) => ({
        ...prevState,
        timeSlots: slots.map((slot) => ({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      }));
    }

    // Log the selected slots
    console.log("Selected slots:", slots);
  };

  const handleAdminAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, company, email, telephone, timeSlots } = formAdminData;

    // Client-side validation
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/appointment/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          company,
          email,
          telephone,
          timeSlots,
          note: formAdminData.note,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("data", data);
        Swal.fire({
          title: "Good job!",
          text: "Appointment successfully created",
          icon: "success",
        }).then(() => {
          setLoading(false);
        });
      } else {
        Swal.fire({
          title: "Something went wrong!",
          text: "You clicked the button!",
          icon: "error",
        });
        setLoading(false);
      }
    } catch (e) {
      Swal.fire({
        title: "Something went wrong!",
        text: "You clicked the button!",
        icon: "error",
      });
      setLoading(false);
      console.log(e)
    }
  };

  const t = useTranslations('AppointmentForm');

  return (
    <>
      <div className="grid grid-cols-2 min-h-[100dvh] justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg space-y-6 border rounded-lg shadow-lg p-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Tabs defaultValue="customer" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">{t('tabs.customer')}</TabsTrigger>
              <TabsTrigger value="admin">{t('tabs.admin')}</TabsTrigger>
            </TabsList>
            <TabsContent value="customer">
              <form onSubmit={handleAppointment}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('fields.name')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('fields.name')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">{t('fields.company')}</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={t('fields.company')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('fields.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('fields.email')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">{t('fields.date')}</Label>
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
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>{t('fields.pickDate')}</span>
                          )}
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
                      <Label htmlFor="startTime">{t('fields.startTime')}</Label>
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
                          <SelectValue placeholder={t('fields.startTime')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{t('fields.selectStartTime')}</SelectLabel>
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
                      <Label htmlFor="endTime">{t('fields.endTime')}</Label>
                      <Input
                        id="endTime"
                        value={formData.endTime}
                        readOnly
                        placeholder={t('fields.endTime')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">{t('fields.telephone')}</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">{t('fields.note')}</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder={t('fields.note')}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submit..." : "Submit"}
                  </Button>
                </div>
                {error && <p className="text-red-500 mt-6">{error}</p>}
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminAppointment}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('fields.name')}</Label>
                    <Input
                      id="name"
                      value={formAdminData.name}
                      onChange={handleAdminChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">{t('fields.company')}</Label>
                    <Input
                      id="company"
                      value={formAdminData.company}
                      onChange={handleAdminChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('fields.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formAdminData.email}
                      onChange={handleAdminChange}
                      placeholder="m@example.com"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="daterange">{t('fields.date')}</Label>
                    <DatePickerWithRange
                      fullyBookedDates={dateFullyBookedDates}
                      bookedInDates={dateBookedInDates}
                      onDateChange={handleDateChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">{t('fields.telephone')}</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={formAdminData.telephone}
                      onChange={handleAdminChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">{t('fields.note')}</Label>
                    <Input
                      id="note"
                      value={formAdminData.note}
                      onChange={handleAdminChange}
                      placeholder={t('fields.note')}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('buttons.submitting') : t('buttons.submit')}
                  </Button>
                </div>
                {error && <p className="text-red-500 mt-6">{error}</p>}
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <AppointmentCalendar
            appointments={appointments}
          ></AppointmentCalendar>
        </div>
      </div>
    </>
  );
}