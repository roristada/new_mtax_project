"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlignEndHorizontal,
  BookUser,
  ChevronDown,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "../../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { Input } from "../../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import EmployeeDetailsDialog from "./Employee_detail";
import EmployeeBarChartsDialog from "./EmpBarChart";
import { useTranslations } from 'next-intl';

type Employee = {
  id: number;
  employeeCode: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  currentSalary: number;
  year: number;
  startDate: string;
  endDate: string;
};

const formatSalary = (salary: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(salary);
};

export default function Employee({ slug }: { slug: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<Employee[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Employee');

  const handleDetails = async (employee: Employee) => {
    try {
      const res = await fetch(
        `/api/dashboard/${slug}/employee/${employee.employeeCode}?year=${employee.year}`
      );
      const result = await res.json();
      console.log("emp :", result);

      if (result.data) {
        setSelectedEmployee(result.data);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const handleChartDetails = async (employee: Employee) => {
    try {
      const res = await fetch(
        `/api/dashboard/${slug}/employee/${employee.employeeCode}?year=${employee.year}`
      );
      const result = await res.json();
      console.log("emp :", result);

      if (result.data) {
        setSelectedEmployee(result.data);
        setIsDialogOpen2(true); // เปิด Dialog ที่สอง
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const closeDialog2 = () => {
    setIsDialogOpen2(false);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`/api/dashboard/${slug}/employee`);
        const result = await res.json();

        if (result.data) {
          setLoading(true);
          setData(result.data);
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [slug]);

  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(data.map((employee) => employee.year))
    ).sort((a, b) => b - a);
    return ["all", ...uniqueYears.map(String)];
  }, [data]);

  const filteredData = useMemo(() => {
    if (yearFilter === "all") return data;
    return data.filter((employee) => employee.year.toString() === yearFilter);
  }, [data, yearFilter]);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "employeeCode",
      header: t('tableHeaders.employeeCode'),
    },
    {
      accessorKey: "title",
      header: t('tableHeaders.title'),
    },
    {
      accessorKey: "firstName",
      header: t('tableHeaders.firstName'),
    },
    {
      accessorKey: "lastName",
      header: t('tableHeaders.lastName'),
    },
    {
      accessorKey: "gender",
      header: t('tableHeaders.gender'),
    },
    {
      accessorKey: "currentSalary",
      header: t('tableHeaders.currentSalary'),
      cell: ({ row }) => {
        const salary = parseFloat(row.getValue("currentSalary"));
        return (
          <div className="text-right font-medium">
            {salary === 0 ? t('unknownSalary') : formatSalary(salary)}
          </div>
        );
      },
    },
    {
      accessorKey: "year",
      header: t('tableHeaders.workingYear'),
    },
    {
      accessorKey: "actions",
      header: t('tableHeaders.actions'),
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDetails(row.original)}>
                <BookUser /> <span className="ml-2">{t('actions.details')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleChartDetails(row.original)}
              >
                <AlignEndHorizontal />
                <span className="ml-2">{t('actions.chart')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
            <p className="text-sm text-gray-500">
              {t('description')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="flex gap-4">
                <Input
                  placeholder={t('filterPlaceholder')}
                  value={
                    (table
                      .getColumn("firstName")
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("firstName")
                      ?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('filterByYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year === "all" ? t('allYears') : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {t('columns')} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {t(`tableHeaders.${column.id}`)}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
              {loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {t('noResults')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {t('employeesFound', { count: table.getFilteredRowModel().rows.length })}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {t('pagination.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        open={isDialogOpen}
        onClose={closeDialog}
      />
      <EmployeeBarChartsDialog
        employee={selectedEmployee}
        open={isDialogOpen2}
        onClose={closeDialog2}
      />
    </div>
  );
}