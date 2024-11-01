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
} from "../../../components/ui/select";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter, useParams } from "next/navigation";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Navbar from "../../../components/Navbar";
import { addMonths, format, isAfter, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { useTranslations } from 'next-intl';
import ReCAPTCHA from "react-google-recaptcha";

type Appointment = {
  date: string;
  startTime: string;
  endTime: string;
};

export default function Appointment() {
  const t = useTranslations('AppointmentForm');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  

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

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch(`/api/appointment`, {
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
        captchaToken,
      }),
    });

    if (!res.ok) {
      setLoading(false);
      const { error } = await res.json();
      setError(error || t('error.message'));
      return;
    }

    const data = await res.json();
    console.log(data);

    Swal.fire({
      title: t('success.title'),
      text: t('success.message'),
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

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };
  console.log("captchaToken:",process.env.NEXT_PUBLIC_RECAPTCHA_KEY);

  return (
    <>
      <Navbar />
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg space-y-6 border rounded-lg shadow-lg p-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

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
                  placeholder="m@example.com"
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
                      {date ? format(date, "PPP") : <span>{t('fields.pickDate')}</span>}
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
                        <SelectLabel>{t('fields.startTime')}:</SelectLabel>
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

              <div className="my-4">
                <ReCAPTCHA
                  sitekey={"6Lemg4YoAAAAAJPZvU6lqaLaV-4-KAC-UyjKjbVQ"}
                  onChange={handleCaptchaChange}
                  hl={locale}
                  theme="light"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
                {loading ? t('buttons.submitting') : t('buttons.submit')}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-6">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
}