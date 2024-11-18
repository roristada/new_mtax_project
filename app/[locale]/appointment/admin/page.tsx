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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import Loading from "../../../../components/Loading/Loading";
import Swal from "sweetalert2";
import useAuthAdmin from "../../../../lib/useAuthAdmin";
import { Link } from "../../../../i18n/routing";
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
import { useTranslations } from "next-intl";

import { ChevronsUpDown } from "lucide-react";

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
  const t = useTranslations("AppointmentsManage");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [appointmentsPerPage] = useState(10); // Appointments per page
  

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null); // State for selected appointment
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]); // ['pending', 'completed', 'canceled', 'confirmed']

  const [isAuthChecked, setIsAuthChecked] = useState(false);
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
  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(appt.date).toLocaleDateString().includes(searchQuery);

    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(appt.status);

    return matchesSearch && matchesStatus;
  });

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
        setSelectedAppointment(data); 
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
      title: t("deleteAppointment"),
      text: t("deleteAppointmentText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("deleteAppointmentYes"),
      cancelButtonText: t("cancelDelete"),
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
              title: t('deleteDialog.title'),
              text: t('deleteDialog.confirmDelete'),
              icon: "success",
            });
          } else {
            Swal.fire({
              title: t('error.title'),
              text: t('error.message'),
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: t('error.title'),
            text: t('error.message'),
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
      title: t(`statusTextDialog.${status}`),
      text: t(`statusTextDetail.${status}`),
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: t("cancelDelete"),
      confirmButtonText: t("confirmAppointment"),
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
              title: t(`statusTextDialog.${status}`),
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            Swal.fire({
              title: t("error.title"),
              text: t("error.message"),
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: t("error.title"),
            text: t("error.message"),
            icon: "error",
          });
          console.error("Failed to update appointment:", error);
        }
      }
    });
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    const sorted = [...appointments].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateB - dateA : dateA - dateB;
    });
    setAppointments(sorted);
  };

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 my-4">
        <Tabs defaultValue="all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
                  <CardDescription>{t("description")}</CardDescription>
                </div>
                <div className="w-full sm:w-auto sm:ml-auto">
                  <Link href={`/appointment/admin/add`}>
                    <Button className="w-full sm:w-auto">{t("addAppointment")}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 p-2 border border-gray-300 rounded"
                  />
                  <div className="w-full sm:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {statusFilter.length
                            ? `${statusFilter.length} selected`
                            : t("filterStatus")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>
                          {t("selectStatus")}
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setStatusFilter([])}>
                          {t("showAll")}
                        </DropdownMenuItem>
                        {["pending", "completed", "canceled", "confirmed"].map(
                          (status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => {
                                if (statusFilter.includes(status)) {
                                  setStatusFilter(
                                    statusFilter.filter((s) => s !== status)
                                  );
                                } else {
                                  setStatusFilter([...statusFilter, status]);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={statusFilter.includes(status)}
                                  readOnly
                                />
                                {t(`status.${status}`)}
                              </div>
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("tableHeaders.name")}</TableHead>
                            <TableHead className="hidden sm:table-cell">{t("tableHeaders.company")}</TableHead>
                            <TableHead className="hidden md:table-cell">{t("tableHeaders.email")}</TableHead>
                            <TableHead className="hidden lg:table-cell">{t("tableHeaders.telephone")}</TableHead>
                            <TableHead className="hidden sm:table-cell">
                              <div className="flex items-center gap-1 cursor-pointer" onClick={toggleSort}>
                                {t("tableHeaders.date")}
                                <ChevronsUpDown className="h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">{t("tableHeaders.startTime")}</TableHead>
                            <TableHead className="hidden md:table-cell">{t("tableHeaders.endTime")}</TableHead>
                            <TableHead>{t("tableHeaders.status")}</TableHead>
                            <TableHead>{t("tableHeaders.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentAppointments.length > 0 ? (
                            currentAppointments.map((appointment) => (
                              <TableRow key={appointment.id}>
                                <TableCell className="font-medium">
                                  {appointment.name}
                                  {/* Show mobile-only information */}
                                  <div className="block sm:hidden text-sm text-muted-foreground">
                                    {appointment.company}
                                  </div>
                                  <div className="block md:hidden text-sm text-muted-foreground">
                                    {appointment.email}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{appointment.company}</TableCell>
                                <TableCell className="hidden md:table-cell">{appointment.email}</TableCell>
                                <TableCell className="hidden lg:table-cell">{appointment.telephone}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {new Date(appointment.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{appointment.startTime}</TableCell>
                                <TableCell className="hidden md:table-cell">{appointment.endTime}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={`whitespace-nowrap ${
                                      appointment.status === "pending"
                                        ? "bg-yellow-500"
                                        : appointment.status === "completed"
                                        ? "bg-green-500"
                                        : appointment.status === "canceled"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                    } text-white`}
                                  >
                                    {t(`status.${appointment.status}`)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
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
                                        {t("action")}
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
                                            {t("details")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onClickActionsDelete(appointment.id)
                                            }
                                          >
                                            {t("delete")}
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
                                            {t("details")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onClickActionsStatus(
                                                appointment.id,
                                                "confirmed"
                                              )
                                            }
                                          >
                                            {t("status.confirmed")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onClickActionsStatus(
                                                appointment.id,
                                                "completed"
                                              )
                                            }
                                          >
                                            {t("status.completed")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onClickActionsStatus(
                                                appointment.id,
                                                "canceled"
                                              )
                                            }
                                          >
                                            {t("status.canceled")}
                                          </DropdownMenuItem>
                                          <Separator />
                                          <DropdownMenuItem
                                            onClick={() =>
                                              onClickActionsDelete(appointment.id)
                                            }
                                          >
                                            {t("delete")}
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
                              <TableCell colSpan={9} className="text-center py-4">
                                {t("noAppointmentsFound")}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                      <Button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="w-full sm:w-auto"
                      >
                        {t("pagination.previous")}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {t("pagination.page", { currentPage, totalPages })}
                      </span>
                      <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="w-full sm:w-auto"
                      >
                        {t("pagination.next")}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar" className="w-full lg:w-[80%] mx-auto">
            <AppointmentCalendar appointments={appointments} />
          </TabsContent>
        </Tabs>
      </main>
      {selectedAppointment && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">{t("dialog.title")}</DialogTitle>
              <DialogDescription>
                {/* Customer Information Section */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">{t("dialog.customerInfo")}</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BuildingIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-lg">{selectedAppointment.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedAppointment.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <AtSignIcon className="h-5 w-5 text-primary" />
                        </div>
                        <p>{selectedAppointment.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <PhoneIcon className="h-5 w-5 text-primary" />
                        </div>
                        <p>{selectedAppointment.telephone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">{t("dialog.appointmentDetails")}</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("dialog.date")}</p>
                          <p className="font-medium">
                            {new Date(selectedAppointment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ClockIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("dialog.time")}</p>
                          <p className="font-medium">
                            {selectedAppointment.startTime} - {selectedAppointment.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileTextIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("dialog.note")}</p>
                          <p className="font-medium">{selectedAppointment.note || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t("dialog.status")}</span>
                    <Badge
                      className={`px-4 py-1.5 text-sm font-medium ${
                        selectedAppointment.status === "pending"
                          ? "bg-yellow-500 text-white"
                          : selectedAppointment.status === "completed"
                          ? "bg-green-500 text-white"
                          : selectedAppointment.status === "canceled"
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {t(`status.${selectedAppointment.status}`)}
                    </Badge>
                  </div>
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
