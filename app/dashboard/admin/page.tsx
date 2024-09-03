"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BookOpenText,
  Building2,
  CalendarCheck2,
  Loader2,
  ScanSearch,
  Bell,
} from "lucide-react";
import useAuthAdmin from "@/lib/useAuthAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  useAuthAdmin((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard_admin");
        const fetchedData: DashboardData = await res.json();
        console.log("Fetched data:", fetchedData);
        setData(fetchedData);
      } catch (e) {
        console.error("Fetch error", e);
      }
    };

    fetchData();
  }, [isAuthChecked]);

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
                <CardTitle className="text-sm font-medium">Customer</CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalCustomer : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total number of customers currently registered.
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blog</CardTitle>
                <BookOpenText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalBlog : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total number of blog posts published.
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments
                </CardTitle>
                <CalendarCheck2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalAppointment : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total number of appointments scheduled.
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notifications
                </CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Recent notifications and updates.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Company</CardTitle>
                  <CardDescription>
                    Recent transactions from your store.
                  </CardDescription>
                </div>
                <div className="ml-auto">
                  <Link href={`/dashboard/formUpload`}>
                    <Button>Upload File</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="">Contact</TableHead>
                      <TableHead className="">Status</TableHead>
                      <TableHead className="">Date</TableHead>
                      <TableHead className="text-center">Details</TableHead>
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
                          <Badge className="text-xs" variant="outline">
                            Approved
                          </Badge>
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
                                <DropdownMenuItem>Overview</DropdownMenuItem>
                              </Link>

                              <DropdownMenuSeparator />
                              <Link href={`/dashboard/${user.id}/employee`}>
                                <DropdownMenuItem>Employee</DropdownMenuItem>
                              </Link>

                              <DropdownMenuSeparator />
                              <Link href={`/dashboard/${user.id}/compare`}>
                                <DropdownMenuItem>
                                  Compare Data
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
            <Card x-chunk="dashboard-01-chunk-5">
              <CardHeader>
                <CardTitle>Recent Blogs</CardTitle>
              </CardHeader>
              {data?.blog && data.blog.length > 0 ? (
                data.blog.map((blog) => (
                  <CardContent key={blog.id} className="grid gap-8">
                    <div className="flex items-center gap-4">
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {blog.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {blog.createdAt}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">{blog.category}</div>
                    </div>
                  </CardContent>
                ))
              ) : (
                <CardContent className="grid gap-8">
                  <p className="text-sm text-muted-foreground">
                    No blogs available
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </main>
      )}
    </>
  );
};

export default Dashboard;
