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
} from "../../../../components/ui/dialog";
import { useTranslations } from 'next-intl';

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
    // Note: using `blog` instead of `blogs`
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

        // Compare with existing data
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

        // Sort appointments by date
        const sortedAppointments = data.appointments.sort(
          (a: Appointment, b: Appointment) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        );

        // Compare with existing appointments
        if (JSON.stringify(sortedAppointments) !== JSON.stringify(appointments)) {
          setAppointments(sortedAppointments);
        }
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    }

    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/support/admin/rooms`);
        const data = await res.json();

        // Compare with existing unread messages count
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

  return (
    <>
      {!isAuthChecked ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('customer')}</CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalCustomer : t('loading')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('totalCustomersRegistered')}
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('blog')}</CardTitle>
                <BookOpenText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalBlog : t('loading')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('totalBlogsPublished')}
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('appointments')}
                </CardTitle>
                <CalendarCheck2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalAppointment : t('loading')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('totalAppointmentsScheduled')}
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('notifications')}
                </CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadMessagesCount}</div>
                <p className="text-xs text-muted-foreground">
                  {t('recentNotifications')}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2 xl:row-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>{t('company')}</CardTitle>
                  <CardDescription>
                    {t('recentTransactions')}
                  </CardDescription>
                </div>
                <div className="ml-auto">
                  <Link href={`/dashboard/formUpload`}>
                    <Button>{t('uploadFile')}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('customer')}</TableHead>
                      <TableHead className="">{t('contact')}</TableHead>
                      <TableHead className="">{t('name')}</TableHead>
                      <TableHead className="">{t('date')}</TableHead>
                      <TableHead className="text-center">{t('details')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.company}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="">{user.telephone}</TableCell>
                        <TableCell className="">
                          {user.name}
                        </TableCell>
                        <TableCell className="">
                          {formatDateInThailand(user.createdAt)}
                        </TableCell>
                        <TableCell className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                {<ScanSearch className="h-6 w-6 " />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuSeparator />
                              <Link href={`/dashboard/${user.id}`}>
                                <DropdownMenuItem>{t('overview')}</DropdownMenuItem>
                              </Link>

                              <DropdownMenuSeparator />
                              <Link href={`/dashboard/${user.id}/employee`}>
                                <DropdownMenuItem>{t('employee')}</DropdownMenuItem>
                              </Link>

                              <DropdownMenuSeparator />
                              <Link href={`/dashboard/${user.id}/data_details/data_visualization`}>
                                <DropdownMenuItem>
                                  {t('dataVisualization')}
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className=" grid row-span-2 gap-4">
              <Card x-chunk="dashboard-01-chunk-5">
                <CardHeader>
                  <CardTitle>{t('recentBlogs')}</CardTitle>
                </CardHeader>
                {data?.blog && data.blog.length > 0 ? (
                  data.blog.map((blog) => (
                    <CardContent key={blog.id} className="grid gap-8">
                      <div className="flex items-center gap-4">
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                            <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {blog.createdAt}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {blog.category}
                        </div>
                      </div>
                    </CardContent>
                  ))
                ) : (
                  <CardContent className="grid gap-8">
                    <p className="text-sm text-muted-foreground">
                      {t('noBlogs')}
                    </p>
                  </CardContent>
                )}
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{t('calendar')}</CardTitle>
                  <CardDescription>
                    {t('calendarDescription')}
                  </CardDescription>
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
            </div>
            
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('appointmentsFor', { date: selectedDate?.toLocaleDateString() })}
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
                  <p className="mt-2 text-gray-500">
                    {t('noAppointments')}
                  </p>
                )}
              </CardContent>
            </DialogContent>
          </Dialog>
        </main>
      )}
    </>
  );
};

export default Dashboard;