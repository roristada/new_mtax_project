"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import Loading from "../../../../components/Loading/Loading";
import Swal from "sweetalert2";
import useAuthAdmin from "../../../../lib/useAuthAdmin";
import {Link} from '../../../../i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import AppointmentCalendar from "../../../../components/Calendar/AppointmentCalendar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "../../../../components/ui/dialog"; // Assuming using Radix dialog
import {
  CalendarIcon,
  BuildingIcon,
  AtSignIcon,
  PhoneIcon,
  ClockIcon,
  FileTextIcon,
} from "lucide-react";
import { Separator } from "../../../../components/ui/separator";
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

const AppointmentsManage = () => {
  const t = useTranslations('AppointmentsManage');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [appointmentsPerPage] = useState(10); // Appointments per page
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null); // State for selected appointment
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility

  useAuthAdmin((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  useEffect(() => {
    if (isAuthChecked) {
      const fetchAppointments = async () => {
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
          setLoading(false);
        }
      };

      fetchAppointments();
    }
  }, [isAuthChecked]);

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(
    (appt) =>
      appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(appt.date).toLocaleDateString().includes(searchQuery)
  );

  // Get current appointments based on pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  // Calculate total pages
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const onClickActionsDetails = async (appointmentId: number) => {
    try {
      const res = await fetch(`/api/appointment/${appointmentId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAppointment(data); // Assuming API returns an 'appointment' object
        setIsDialogOpen(true); // Open the dialog
      } else {
        console.error("Failed to fetch appointment details");
      }
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    }
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
            setAppointments(
              appointments.filter((appt) => appt.id !== appointmentId)
            );
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

  const onClickActionsStatus = async (
    appointmentId: number,
    status: string
  ) => {
    const statusText =
      status === "completed"
        ? "completed"
        : status === "canceled"
        ? "canceled"
        : "confirmed";

    Swal.fire({
      title: `Status appointment`,
      text: `Are you sure you want to ${statusText} this appointment?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${statusText} it!`,
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/appointment/${appointmentId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }), // Pass status to the backend
          });

          if (res.ok) {
            setAppointments(
              appointments.map((appt) =>
                appt.id === appointmentId ? { ...appt, status } : appt
              )
            );

            Swal.fire({
              title: "Status!",
              text: `The appointment status has been updated to ${statusText}.`,
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
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 my-4">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all">
            <Card className="shadow-lg">
              <CardHeader className="grid grid-cols-2">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {t('title')}
                  </CardTitle>
                  <CardDescription>
                    {t('description')}
                  </CardDescription>
                </div>
                <div className="ml-auto">
                  <Link href={`/appointment/admin/add`}>
                    <Button>{t('addAppointment')}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add search input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                {loading ? (
                  <Loading />
                ) : (
                  <>
                    <Table className="w-full bg-white rounded-lg shadow-md">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2">{t('tableHeaders.name')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.company')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.email')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.telephone')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.date')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.startTime')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.endTime')}</TableHead>
                          <TableHead className="py-2">{t('tableHeaders.status')}</TableHead>
                          <TableHead className="py-2">
                            <span className="sr-only">{t('tableHeaders.actions')}</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAppointments.length > 0 ? (
                          currentAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell className="py-2 font-medium">
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
                                {new Date(
                                  appointment.date
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="py-2">
                                {appointment.startTime}
                              </TableCell>
                              <TableCell className="py-2">
                                {appointment.endTime}
                              </TableCell>
                              <TableCell className="py-2">
                                <Badge
                                  className={`py-1 px-2 ${
                                    appointment.status === "pending"
                                      ? "bg-yellow-500 text-white"
                                      : appointment.status === "completed"
                                      ? "bg-green-500 text-white"
                                      : appointment.status === "canceled"
                                      ? "bg-red-500 text-white"
                                      : appointment.status === "confirmed"
                                      ? "bg-blue-500 text-white"
                                      : ""
                                  }}`}
                                >
                                  {" "}
                                  {appointment.status === "pending"
                                    ? "Pending"
                                    : appointment.status === "completed"
                                    ? "Completed"
                                    : appointment.status === "canceled"
                                    ? "Cancel"
                                    : appointment.status === "confirmed"
                                    ? "Confirmed"
                                    : ""}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      {t('actions')}
                                    </DropdownMenuLabel>

                                    {/* Show Details and Delete for completed or canceled appointments */}
                                    {appointment.status === "completed" ||
                                    appointment.status === "canceled" ? (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsDetails(
                                              appointment.id
                                            )
                                          }
                                        >
                                          {t('details')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsDelete(appointment.id)
                                          }
                                        >
                                          {t('delete')}
                                        </DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsDetails(
                                              appointment.id
                                            )
                                          }
                                        >
                                          {t('details')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsStatus(
                                              appointment.id,
                                              "confirmed"
                                            )
                                          }
                                        >
                                          {t('status.confirmed')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsStatus(
                                              appointment.id,
                                              "completed"
                                            )
                                          }
                                        >
                                          {t('status.completed')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsStatus(
                                              appointment.id,
                                              "canceled"
                                            )
                                          }
                                        >
                                          {t('status.canceled')}
                                        </DropdownMenuItem>
                                        <Separator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            onClickActionsDelete(appointment.id)
                                          }
                                        >
                                          {t('delete')}
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              {t('noAppointmentsFound')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        {t('pagination.previous')}
                      </Button>
                      <span>
                        {t('pagination.page', { currentPage, totalPages })}
                      </span>
                      <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        {t('pagination.next')}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent className="w-[80%] mx-auto" value="calendar">
            <AppointmentCalendar
              appointments={appointments}
            ></AppointmentCalendar>
          </TabsContent>
        </Tabs>
      </main>
      {selectedAppointment && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('dialog.title')}</DialogTitle>
              <DialogDescription>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-black">
                      {selectedAppointment.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.company}
                    </p>
                  </div>
                  <AtSignIcon className="h-5 w-5 text-muted-foreground" />
                  <p className="text-black">{selectedAppointment.email}</p>
                  <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                  <p className="text-black">{selectedAppointment.telephone}</p>
                  <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-black">
                    {selectedAppointment.note}
                  </p>
                  <ClockIcon className="my-auto h-5 w-5 text-muted-foreground" />
                  <Badge
                    className={`py-2 px-2  ${
                      selectedAppointment.status === "pending"
                        ? "bg-yellow-500 text-white"
                        : selectedAppointment.status === "completed"
                        ? "bg-green-500 text-white"
                        : selectedAppointment.status === "canceled"
                        ? "bg-red-500 text-white"
                        : selectedAppointment.status === "confirmed"
                        ? "bg-blue-500 text-white"
                        : ""
                    }}`}
                  >
                    {t(`status.${selectedAppointment.status}`)}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AppointmentsManage;