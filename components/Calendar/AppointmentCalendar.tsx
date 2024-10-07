import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface AppointmentCalendarProps {
  appointments: Appointment[];
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onDateChange = (date: any) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      const appointmentDates = appointments.map((appt) => appt.date.split("T")[0]);

      if (appointmentDates.includes(dateString)) {
        return <div className="appointment-marker">📅</div>;
      }
    }
    return null;
  };

  const appointmentsForSelectedDate = appointments.filter(
    (appt) =>
      new Date(appt.date).toLocaleDateString() === selectedDate?.toLocaleDateString()
  );

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Calendar</CardTitle>
          <CardDescription>View and manage your appointments in the calendar.</CardDescription>
        </CardHeader>
        <CardContent className="w-full grid grid-col-1 lg:grid-cols-1 mx-auto">
          <div className="w-full flex ">
            <Calendar
              onChange={onDateChange}
              value={selectedDate}
              tileContent={getTileContent}
              className="rounded-lg shadow-md w-full lg:w-full"
            />
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointments for {selectedDate?.toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          <CardContent>
            {appointmentsForSelectedDate.length > 0 ? (
              <div>
                {appointmentsForSelectedDate.map((appt) => (
                  <div
                    key={appt.id}
                    className="my-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {appt.startTime} - {appt.endTime}:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appt.name} ({appt.company})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-gray-500">No appointments for this date.</p>
            )}
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCalendar;
