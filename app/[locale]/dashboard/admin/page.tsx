"use client";
import React, { useEffect, useState } from "react";
import { Link } from "../../../../i18n/routing";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import {
  BookOpenText,
  Building2,
  CalendarCheck2,
  Loader2,
  ScanSearch,
  Bell,
  Trash,
  FileX,
} from "lucide-react";
import useAuthAdmin from "../../../../lib/useAuthAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { useTranslations } from "next-intl";
import Swal from 'sweetalert2';

interface DashboardData {
  totalCustomer: number;
  totalBlog: number;
  totalAppointment: number;
  users: {
    id: number;
    name: string;
    email: string;
    company: string;
    telephone: string;
    address: string;
    createdAt: string;
  }[];
  blog: {
    id: number;
    title: string;
    category: string;
    createdAt: string;
    author: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}

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

interface YearData {
  year: number;
  hasData: boolean;
  hasFiles: boolean;
  files: string[];
}

interface DeleteDataResponse {
  databaseYears: number[];
  storageFiles: Record<string, string[]>;
  summary: YearData[];
}

const formatDateInThailand = (dateString: any) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(date);
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [yearData, setYearData] = useState<DeleteDataResponse | null>(null);
  const t = useTranslations("DashboardAdmin");
  useAuthAdmin((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard_admin`);
        const fetchedData: DashboardData = await res.json();
        console.log("Fetched data:", fetchedData);

        if (JSON.stringify(fetchedData) !== JSON.stringify(data)) {
          setData(fetchedData);
        }
      } catch (e) {
        console.error("Fetch error", e);
      }
    };

    async function fetchAppointments() {
      try {
        const res = await fetch(`/api/appointment`);
        const data = await res.json();
        const sortedAppointments = data.appointments.sort(
          (a: Appointment, b: Appointment) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        );

        if (
          JSON.stringify(sortedAppointments) !== JSON.stringify(appointments)
        ) {
          setAppointments(sortedAppointments);
        }
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false); 
      }
    }

    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/support/admin/rooms`);
        const data = await res.json();
        if (data.unreadMessagesCount !== unreadMessagesCount) {
          setUnreadMessagesCount(data.unreadMessagesCount);
        }
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      }
    };

    fetchData();
    fetchAppointments();
    fetchRooms();
  }, [isAuthChecked, data, appointments, unreadMessagesCount]);

  const onDateChange = (date: any) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
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

  const fetchYearData = async (userId: number) => {
    try {
      const response = await fetch(`/api/dashboard_admin/delete_data?companyId=${userId}`);
      const data = await response.json();
      setYearData(data);
    } catch (error) {
      console.error("Error fetching year data:", error);
    }
  };

  const deleteYearData = async (companyId: number, year: number) => {
    try {
      setDeleteDataOpen(false);
      const result = await Swal.fire({
        title: t("delete_intable.confirmDeleteTitle", {year: year}),
        text: t("delete_intable.confirmDeleteText"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: t("delete_intable.delete"),
        cancelButtonText: t("delete_intable.cancel"),
        
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: t("delete_intable.deleting"),
          html: t("delete_intable.deletingMessage"),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          
        });

        const response = await fetch(
          `/api/dashboard_admin/delete_data?companyId=${companyId}&year=${year}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete data');
        }
        const data = await response.json();
        
        await fetchYearData(companyId);
        
        await Swal.fire({
          title: t("delete_intable.deleteSuccess"),
          text: t("delete_intable.deleteSuccessMessage", {year: year}),
          icon: 'success',
          confirmButtonColor: '#10b981',
         
        });

        setDeleteDataOpen(true);
      } else {
        setDeleteDataOpen(true);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      await Swal.fire({
        title: t("delete_intable.deleteError"),
        text: t("delete_intable.deleteErrorMessage"),
        icon: 'error',
        confirmButtonColor: '#dc2626',
        
      });
      
      setDeleteDataOpen(true);
    }
  };

  const deleteAccount = async (userId: number) => {
    try {
      setDeleteDataOpen(false);
      const result = await Swal.fire({
        title: t("delete_account.confirmDeleteTitle"),
        text: t("delete_account.confirmDeleteText"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: t("delete_account.delete"),
        cancelButtonText: t("delete_account.cancel"),
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: t("delete_account.deleting"),
          html: t("delete_account.deletingMessage"),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(
          `/api/users/delete_account?userId=${userId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        const data = await response.json();
        await Swal.fire({
          title: t("delete_account.deleteSuccess"),
          text: t("delete_account.deleteSuccessMessage"),
          icon: 'success',
          confirmButtonColor: '#10b981',
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      await Swal.fire({
        title: t("delete_account.deleteError"),
        text: t("delete_account.deleteErrorMessage"),
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  return (
    <>
      {!isAuthChecked ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("customer")}
                </CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalCustomer : t("loading")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("totalCustomersRegistered")}
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("blog")}
                </CardTitle>
                <BookOpenText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalBlog : t("loading")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("totalBlogsPublished")}
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("appointments")}
                </CardTitle>
                <CalendarCheck2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalAppointment : t("loading")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("totalAppointmentsScheduled")}
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("notifications")}
                </CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadMessagesCount}</div>
                <p className="text-xs text-muted-foreground">
                  {t("recentNotifications")}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 grid-cols-1 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="grid gap-2">
                  <CardTitle>{t("company")}</CardTitle>
                  <CardDescription>{t("recentTransactions")}</CardDescription>
                </div>
                <div className="sm:ml-auto">
                  <Link href={`/dashboard/formUpload`}>
                    <Button>{t("uploadFile")}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">{t("customer")}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t("contact")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("name")}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t("date")}</TableHead>
                      <TableHead className="text-center">{t("details")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.company}</div>
                          <div className="text-sm text-muted-foreground md:hidden">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{user.telephone}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatDateInThailand(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="p-2 mr-2">
                                  {<ScanSearch className="h-4 w-4 " />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuSeparator />
                                <Link href={`/dashboard/${user.id}`}>
                                  <DropdownMenuItem>
                                    {t("overview")}
                                  </DropdownMenuItem>
                                </Link>

                                <DropdownMenuSeparator />
                                <Link href={`/dashboard/${user.id}/employee`}>
                                  <DropdownMenuItem>
                                    {t("employee")}
                                  </DropdownMenuItem>
                                </Link>

                                <DropdownMenuSeparator />
                                <Link
                                  href={`/dashboard/${user.id}/data_details/data_visualization`}
                                >
                                  <DropdownMenuItem>
                                    {t("dataVisualization")}
                                  </DropdownMenuItem>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="p-2 ">
                                  {<Trash className="h-4 w-4" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={async (event) => {
                                  event.preventDefault();
                                  setSelectedUserId(user.id);
                                  await fetchYearData(user.id);
                                  setDeleteDataOpen(true);
                                }}>
                                  {t("delete_intable.deleteData")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={(event) => {
                                  event.preventDefault();
                                  deleteAccount(user.id);
                                }}>
                                  {t("delete_intable.deleteAccount")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("recentBlogs")}</CardTitle>
                  <Link href="/blog/admin">
                    <Button variant="outline" size="sm">
                      {t("viewAll")}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data?.blog && data.blog.length > 0 ? (
                    <div className="space-y-2">
                      {data.blog.slice(0, 5).map((blog) => (
                        <div 
                          key={blog.id} 
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="space-y-1 min-w-0 flex-1 mr-4">
                            <Link 
                              href={`/blog/${blog.id}`}
                              className="text-sm font-medium leading-none hover:underline line-clamp-1"
                            >
                              {blog.title}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatDateInThailand(blog.createdAt)}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {t(`categories.${blog.category}`)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("noBlogs")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("calendar")}</CardTitle>
                  <CardDescription>{t("calendarDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <Calendar
                      onChange={onDateChange}
                      value={selectedDate}
                      tileContent={getTileContent}
                      className="rounded-lg shadow-md w-full max-w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("appointmentsFor", {
                    date: selectedDate?.toLocaleDateString(),
                  })}
                </DialogTitle>
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
                  <p className="mt-2 text-gray-500">{t("noAppointments")}</p>
                )}
              </CardContent>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteDataOpen} onOpenChange={setDeleteDataOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("delete_intable.deleteData")}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {t("delete_intable.selectYearToDelete")}
                </p>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto">
                {yearData?.summary && yearData.summary.length > 0 ? (
                  yearData.summary.map((item) => (
                    <div
                      key={item.year}
                      className="mb-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {t("year")}: {item.year}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              {t("delete_intable.dataInDatabase")}: 
                              <Badge 
                                variant={item.hasData ? "secondary" : "destructive"} 
                                className="ml-2"
                              >
                                {item.hasData ? t("delete_intable.yes") : t("delete_intable.no")}
                              </Badge>
                            </p>
                            <p className="text-sm">
                              {t("delete_intable.filesInStorage")}: 
                              <Badge 
                                variant={item.hasFiles ? "secondary" : "destructive"} 
                                className="ml-2"
                              >
                                {item.hasFiles ? t("delete_intable.yes") : t("delete_intable.no")}
                              </Badge>
                            </p>
                            {item.files.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">{t("delete_intable.files")}:</p>
                                <ul className="ml-4 text-sm">
                                  {item.files.map((file, index) => (
                                    <li key={index}>{file}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteYearData(selectedUserId!, item.year)}
                        >
                          {t("delete")}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-muted-foreground mb-2">
                      <FileX className="h-12 w-12 mx-auto mb-2" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      {t("delete_intable.noDataFound")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("delete_intable.noDataFoundDescription")}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDataOpen(false)}>
                  {t("delete_intable.cancel")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      )}
    </>
  );
};

export default Dashboard;
