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
import { BookOpenText, Building2, CalendarCheck2, Loader2 } from "lucide-react";
import useAuthAdmin from "@/lib/useAuthAdmin";

interface DashboardData {
  totalCustomer: number;
  totalBlog: number;
  totalAppointment: number;
  users: {
    id: number;
    name: string;
    email: string;
    company: string;
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
                <CardTitle className="text-sm font-medium">
                  Total Customer
                </CardTitle>
                <Building2 />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalCustomer : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Blog
                </CardTitle>
                <BookOpenText />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalBlog : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments
                </CardTitle>
                <CalendarCheck2 />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data ? data.totalAppointment : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                {/* <ActivityIcon className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
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
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="#" prefetch={false}>
                    View All
                    {/* <ArrowUpRightIcon className="h-4 w-4" /> */}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="">Type</TableHead>
                      <TableHead className="">Status</TableHead>
                      <TableHead className="">Date</TableHead>
                      <TableHead className="text-right">Employee</TableHead>
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
                        <TableCell className="">Sale</TableCell>
                        <TableCell className="">
                          <Badge className="text-xs" variant="outline">
                            Approved
                          </Badge>
                        </TableCell>
                        <TableCell className="">2023-06-23</TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
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
