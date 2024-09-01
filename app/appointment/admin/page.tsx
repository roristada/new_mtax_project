"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal } from "lucide-react";
import Loading from "@/components/Loading/Loading";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import useAuthAdmin from "@/lib/useAuthAdmin";

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

const Appointments_manage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useAuthAdmin((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  

  useEffect(() => {
    // Fetch appointments from the API
    async function fetchAppointments() {
      try {
        const res = await fetch(`/api/appointment`);
        const data = await res.json();

        // Sort appointments by date
        const sortedAppointments = data.appointments.sort(
          (a: Appointment, b: Appointment) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        );
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    }

    fetchAppointments();
  }, []);

  const onDateChange = (date: any) => {
    setSelectedDate(date);
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      const appointmentDates = appointments.map(
        (appt) => appt.date.split("T")[0]
      );

      if (appointmentDates.includes(dateString)) {
        return <div className="appointment-marker">📅</div>;
      }
    }
    return null;
  };

  const appointmentsForSelectedDate = appointments.filter(
    (appt) =>
      new Date(appt.date).toLocaleDateString() ===
      selectedDate?.toLocaleDateString()
  );

  const onClickActionsEdit = () => {
    Swal.fire({
      title: "Edit appointment",
      text: "Edit appointment details.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, edit it!",
    }).then((result: any) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Edited!",
          text: "Your file has been edited.",
          icon: "success",
        });
      }
    });
  };

  const onClickActionsDelete = async (appointmentId: number) => {
    Swal.fire({
      title: "Delete appointment",
      text: "Are you sure you want to delete this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/appointment/${appointmentId}`, {
            method: "DELETE",
          });
  
          if (res.ok) {
            setAppointments(appointments.filter(appt => appt.id !== appointmentId));
            Swal.fire({
              title: "Deleted!",
              text: "Your appointment has been deleted.",
              icon: "success",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete the appointment.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the appointment.",
            icon: "error",
          });
          console.error("Failed to delete appointment:", error);
        }
      }
    });
  };

  const onClickActionsStatus = async (appointmentId: number) => {

    Swal.fire({
      title: "Status appointment",
      text: "Are you sure you want to update the status of this appointment?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update status!",
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/appointment/${appointmentId}`, {
            method: "PATCH",
          });
  
          if (res.ok) {
            setAppointments(appointments.map(appt => 
              appt.id === appointmentId ? { ...appt, status: 'completed' } : appt
            ));
            Swal.fire({
              title: "Status!",
              text: "The status has been updated.",
              icon: "success",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to update the appointment status.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while updating the appointment.",
            icon: "error",
          });
          console.error("Failed to update appointment:", error);
        }
      }
    });

  };

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Appointments
                </CardTitle>
                <CardDescription>
                  Manage your appointments and view their details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loading />
                ) : (
                  <Table className="w-full bg-white rounded-lg shadow-md">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-2">Name</TableHead>
                        <TableHead className="py-2">Company</TableHead>
                        <TableHead className="py-2">Email</TableHead>
                        <TableHead className="py-2">Telephone</TableHead>
                        <TableHead className="py-2">Date</TableHead>
                        <TableHead className="py-2">Start Time</TableHead>
                        <TableHead className="py-2">End Time</TableHead>
                        <TableHead className="py-2">Status</TableHead>
                        <TableHead className="py-2">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow
                          key={appointment.id}
                          className="hover:bg-gray-100"
                        >
                          <TableCell className="font-medium py-2">
                            {appointment.name}
                          </TableCell>
                          <TableCell className="py-2">
                            {appointment.company}
                          </TableCell>
                          <TableCell className="py-2">
                            {appointment.email}
                          </TableCell>
                          <TableCell className="py-2">
                            {appointment.telephone}
                          </TableCell>
                          <TableCell className="py-2">
                            {new Date(appointment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-2">
                            {appointment.startTime}
                          </TableCell>
                          <TableCell className="py-2">
                            {appointment.endTime}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge className={`py-1 px-2 ${
                              appointment.status === "pending"
                                ? "bg-yellow-500 text-white"
                                : appointment.status === "completed"
                                ? "bg-green-500 text-white"
                                : appointment.status === "canceled"
                                ? "bg-red-500 text-white"
                                : ""
                            }`}>
                              {appointment.status === "pending"
                                ? "Pending"
                                : appointment.status === "completed"
                                ? "Complete"
                                : appointment.status === "canceled"
                                ? "Cancel"
                                : ""}
                            </Badge>{" "}
                          </TableCell>
                          <TableCell className="py-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => onClickActionsStatus(appointment.id)}
                                >
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onClickActionsEdit}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onClickActionsDelete(appointment.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Showing <strong>{appointments.length}</strong> appointments
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="calendar">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Calendar</CardTitle>
                <CardDescription>
                  View and manage your appointments in the calendar.
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full grid grid-col-1 lg:grid-cols-2 mx-auto">
                <div className="w-full flex justify-end">
                  <Calendar
                    onChange={onDateChange}
                    value={selectedDate}
                    tileContent={getTileContent}
                    className="rounded-lg shadow-md w-full lg:w-full"
                  />
                </div>
                <Card className="mt-4 lg:mt-0 lg:ml-4 p-4 rounded-lg shadow-md bg-white mx-auto ">
                  <CardHeader>
                    <h3 className="mt-4 text-lg font-semibold">
                      Appointments for {selectedDate?.toLocaleDateString()}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    {appointmentsForSelectedDate.length > 0 ? (
                      <div>
                        {appointmentsForSelectedDate.map((appt) => (
                          <div
                            key={appt.id}
                            className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
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
                      <p className="mt-2 text-gray-500">
                        No appointments for this date.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Appointments_manage;
