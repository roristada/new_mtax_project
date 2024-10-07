"use client";
import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { File, ListFilter, Loader2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FinancialBarChart from "./(Charts)/BarChart";
import FinancialLineChart from "./(Charts)/LineChart";
import FinancialAreaChart from "./(Charts)/AreaChart";
import PieChartComponent from "./(Charts)/Breakdown/PieChartIncome";
import FinancialMonthBarChart from "./(Charts)/Month/BarChart";
import FinancialMonthAreaChart from "./(Charts)/Month/AreaChart";
import FinancialMonthLineChart from "./(Charts)/Month/LineChart";

import RangeComChart from "@/components/Charts/Range_Commission/BarChart";
import RangeDilChart from "@/components/Charts/Range_Diligence/BarChart";
import Radian from "@/components/Charts/Radian/Employee_Count/Radian";

interface SelectedDataTypes {
  Income: boolean;
  Expense: boolean;
  Tax: boolean;
  netIncome: boolean;
}

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalTax: number;
  netIncome: number;
}

const chartConfig = {
  Income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  Expense: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  Tax: {
    label: "Tax",
    color: "hsl(var(--chart-3))",
  },
  netIncome: {
    label: "Net",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

interface ChartData {
  monthIndex: number;
  year: number;
  month: string;
  Income: number;
  Expense: number;
  Tax: number;
  netIncome: number;
}

interface IncomeBreakdown {
  salary: number;
  shiftAllowance: number;
  foodAllowance: number;
  overtime: number;
  diligence: number;
  beverage: number;
  commission: number;
  brokerFee: number;
  otherIncome: number;
  bonus: number;
}

interface YearlyIncomeBreakdown {
  [year: number]: IncomeBreakdown;
}

interface YearlyExpenseBreakdown {
  [year: number]: ExpenseBreakdown;
}

interface YearlyTaxBreakdown {
  [year: number]: TaxBreakdown;
}

interface ExpenseBreakdown {
  loan: number;
  salaryAdvance: number;
  commissionDeduction: number;
  otherDeductions: number;
}

interface TaxBreakdown {
  employeeTax: number;
  companyTax: number;
  socialSecurityEmployee: number;
  socialSecurityCompany: number;
  providentFund: number;
}

const formatYearRange = (years: Set<number>): string => {
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  if (sortedYears.length === 0) return "";
  if (sortedYears.length === 1) return sortedYears[0].toString();
  return `${sortedYears[sortedYears.length - 1]}-${sortedYears[0]}`;
};

export default function Compare({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverMainOpen, setPopoverMainOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [chartType, setChartType] = useState<string>("BarChart");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [incomeBreakdownData, setIncomeBreakdownData] =
    useState<YearlyIncomeBreakdown>({});
  const [expenseBreakdownData, setExpenseBreakdownData] =
    useState<YearlyExpenseBreakdown>({});
  const [taxBreakdownData, setTaxBreakdownData] = useState<YearlyTaxBreakdown>(
    {}
  );
  const [uniqueYears, setUniqueYears] = useState<number[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<SelectedDataTypes>(
    {
      Income: true,
      Expense: true,
      Tax: true,
      netIncome: true,
    }
  );

  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [ChartDataYear, setChartDataYear] = useState<MonthlySummary[]>([]);
  const [Checkfilter, setCheckfilter] = useState("year");

  const [employeeCountGenderByYear, setEmployeeCountGenderByYear] = useState<
    any[]
  >([]);

  //------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch main data
        const mainRes = await fetch("/api/dashboard/" + slug + "/compare");
        const mainJsonResponse = await mainRes.json();
        const data = mainJsonResponse.data;
        const years = mainJsonResponse.uniqueYears;
        setEmployeeCountGenderByYear(
          mainJsonResponse.employeeCountGenderByYear
        );
        console.log(
          mainJsonResponse.employeeCountByYear.map(
            (item: { year: number; _count: { _all: number } }) =>
              `${item.year} ${item._count._all}`
          )
        );
        console.log(
          mainJsonResponse.employeeCountGenderByYear.map(
            (item: {
              year: number;
              gender: string;
              _count: { _all: number };
            }) => `${item.year} ${item.gender || "Null"}: ${item._count._all}`
          )
        );
        // Sort and set data
        const sortedData = data.sort((a: ChartData, b: ChartData) => {
          if (a.year === b.year) {
            return a.monthIndex - b.monthIndex;
          }
          return a.year - b.year;
        });

        setChartData(sortedData);

        // Set income, expense, and tax breakdown data
        setIncomeBreakdownData(groupDataByYear(data, "incomeBreakdown"));
        setExpenseBreakdownData(groupDataByYear(data, "expenseBreakdown"));
        setTaxBreakdownData(groupDataByYear(data, "taxBreakdown"));

        // Update unique years and set selected years
        const sortedYears = years.sort((a: number, b: number) => b - a);
        setUniqueYears(sortedYears);
        const latestTwoYears = sortedYears.slice(0, 2);
        setSelectedYears(new Set(latestTwoYears));

        // Set latest year for other selects
        if (sortedYears.length > 0) {
          const latestYear = sortedYears[0];
          setSelectedMonthYear(latestYear);
          setSelectedYear(latestYear);
          setSelectedYearCom(latestYear);

          // Fetch monthly data for the latest year
          const monthRes = await fetch(
            `/api/dashboard/${slug}/month?companyId=${slug}&year=${latestYear}`
          );
          const monthData = await monthRes.json();
          setChartDataYear(monthData);

          // Fetch commission and diligence data for the latest year
          const commissionRes = await fetch(
            `/api/dashboard/${slug}/commission_sum?year=${latestYear}`
          );
          const commissionData = await commissionRes.json();
          setRangeCommission(commissionData.commissionRanges);
          setRangeDiligence(commissionData.diligenceRanges);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [slug]);

  // Helper function to group data by year
  const groupDataByYear = (data: any[], key: string) => {
    return data.reduce((acc, item) => {
      if (item[key]) {
        acc[item.year] = item[key];
      }
      return acc;
    }, {});
  };

  const handleDataTypeChange = (dataType: keyof SelectedDataTypes) => {
    setSelectedDataTypes((prev) => ({
      ...prev,
      [dataType]: !prev[dataType],
    }));
  };

  const handleApplyMainFilters = () => {
    setPopoverOpen(false);
    setPopoverMainOpen(false);
  };

  const handleApplyComFilters = () => {
    setPopoverOpenCom(false);
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    // console.log(
    //   "Form submitted with selected years:",
    //   Array.from(selectedYears)
    // );
    setDialogOpen(false); // Close the dialog
  };

  //-------------------------------------------------------------------------------------------------
  const SortuniqueYears = uniqueYears.sort((a, b) => b - a); // เรียงลำดับจากมากไปน้อย
  const latestYear = SortuniqueYears.length > 0 ? SortuniqueYears[0] : null;
  const [selectedMonthYear, setSelectedMonthYear] = useState<number | null>(
    latestYear
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(latestYear);

  const { selectedIncomeData, selectedExpenseData, selectedTaxData } =
    useMemo(() => {
      return {
        selectedIncomeData: selectedYear
          ? incomeBreakdownData[selectedYear]
          : null,
        selectedExpenseData: selectedYear
          ? expenseBreakdownData[selectedYear]
          : null,
        selectedTaxData: selectedYear ? taxBreakdownData[selectedYear] : null,
      };
    }, [
      selectedYear,
      incomeBreakdownData,
      expenseBreakdownData,
      taxBreakdownData,
    ]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleYearlyDataChange = (year: number, checked: boolean) => {
    setSelectedYears((prev) => {
      const updated = new Set(prev);
      if (checked) {
        updated.add(year);
      } else {
        updated.delete(year);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!selectedYear) {
      setSelectedYear(latestYear);
    }
  }, [latestYear, selectedYear]);

  const filteredChartData = chartData.filter((item) =>
    selectedYears.has(item.year)
  );

  //------------------------------------------------------------------------------------------------
  const renderChart = () => {
    switch (chartType) {
      case "BarChart":
        return (
          <FinancialBarChart
            chartData={filteredChartData}
            selectedDataTypes={selectedDataTypes}
          />
        );
      case "AreaChart":
        return (
          <FinancialAreaChart
            chartData={filteredChartData}
            selectedDataTypes={selectedDataTypes}
          />
        );
      case "LineChart":
        return (
          <FinancialLineChart
            chartData={filteredChartData}
            selectedDataTypes={selectedDataTypes}
          />
        );
      default:
        return <></>;
    }
  };

  const rendermonthChart = () => {
    switch (monthchartType) {
      case "BarChart":
        return <FinancialMonthBarChart chartData={ChartDataYear} />;
      case "AreaChart":
        return <FinancialMonthAreaChart chartData={ChartDataYear} />;
      case "LineChart":
        return <FinancialMonthLineChart chartData={ChartDataYear} />;
      default:
        return <></>;
    }
  };

  useEffect(() => {
    if (SortuniqueYears.length > 0) {
      setSelectedMonthYear(SortuniqueYears[0]);
      setSelectedYearCom(SortuniqueYears[0]);
    }
  }, [SortuniqueYears]);

  const onhandleClick = (type: string) => {
    const fetchYears = async () => {
      try {
        const res = await fetch(
          `/api/dashboard/${slug}/month?companyId=${slug}&year=${selectedMonthYear}`
        );
        const jsonResponse = await res.json();
        setChartDataYear(jsonResponse);
      } catch (err) {
        console.log(err);
      }
    };

    fetchYears();
    setCheckfilter(type);
  };

  const [monthchartType, setMonthchartType] = useState<string>("BarChart");

  const handleMonthData = (year: number) => {
    setSelectedMonthYear(year);
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch(
          `/api/dashboard/${slug}/month?companyId=${slug}&year=${selectedMonthYear}`
        );
        const jsonResponse = await res.json();
        setChartDataYear(jsonResponse);
      } catch (err) {
        console.log(err);
      }
    };

    if (selectedMonthYear) {
      // Check if selectedMonthYear is not null
      fetchYears();
      console.log(selectedMonthYear);
    }
  }, [selectedMonthYear]); // Dependency array to run effect when selectedMonthYear changes

  const [language, setLanguage] = useState<string>("English");
  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    console.log(language);
  };

  //------------------------------------------------------------------------------------------------------------------------//
  interface Employee {
    name: string;
    totalCommission: number;
    totalDiligence: number;
  }

  interface CommissionRange {
    min: number;
    max: number;
    count: number;
    employees: Employee[];
    range?: string;
  }

  const [popoverOpenCom, setPopoverOpenCom] = useState(false);
  const [selectedYearCom, setSelectedYearCom] = useState<number | null>(
    latestYear
  );
  const [rangeCommission, setRangeCommission] = useState<CommissionRange[]>([]);
  const [rangeDiligence, setRangeDiligence] = useState<CommissionRange[]>([]);
  const handleSelectedYearCom = (year: number) => {
    setSelectedYearCom(year);
  };

  useEffect(() => {
    const fetchApi = async () => {
      const response = await fetch(
        `/api/dashboard/${slug}/commission_sum?year=${selectedYearCom}`
      );
      const data = await response.json();
      setRangeCommission(data.commissionRanges);
      setRangeDiligence(data.diligenceRanges);
    };

    fetchApi();
  }, [selectedYearCom, slug]);

  return (
    <>
      <div className="flex w-full flex-col bg-muted">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 h-full">
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-end my-5 gap-4">
                  <Button variant="outline">Export</Button>
                </div>
                <div className="grid lg:grid-cols-1 items-start gap-4 md:gap-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Radian
                      employeeCountGenderByYear={employeeCountGenderByYear}
                    />
                    <div className="col-span-1 md:col-span-2 ">
                      <Card className="w-full">
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <CardTitle className="mb-1">
                              Commission & Diligence
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-semibold">
                              View a summary of all orders for{" "}
                              <span className="text-primary">
                                {selectedYearCom}
                              </span>
                            </CardDescription>
                          </div>
                          <Popover
                            open={popoverOpenCom}
                            onOpenChange={setPopoverOpenCom}
                          >
                            <PopoverTrigger asChild className="mt-2 sm:mt-0">
                              <Button variant="outline">Filter</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] sm:w-[320px]">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Filter Data
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Set the dimensions for the layer.
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label className="mb-2 block">Year</Label>
                                    <Select
                                      onValueChange={(value) =>
                                        handleSelectedYearCom(Number(value))
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue
                                          placeholder={
                                            selectedYearCom
                                              ? String(selectedYearCom)
                                              : "Select Year"
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {SortuniqueYears.map((year) => (
                                          <SelectItem
                                            key={year}
                                            value={year.toString()}
                                          >
                                            {year}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <Button
                                  className="w-full"
                                  onClick={handleApplyComFilters}
                                >
                                  Apply Filters
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                          <div className="w-full">
                            <RangeComChart rangeCommission={rangeCommission} />
                          </div>
                          <div className="w-full">
                            <RangeDilChart rangeDiligence={rangeDiligence} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="w-full mb-4">
                      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <CardTitle>Financial Overview</CardTitle>
                          <CardDescription>
                            View a summary of all orders
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          {Checkfilter === "year" ? (
                            <Popover
                              open={popoverOpen}
                              onOpenChange={setPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button variant="outline">Filter</Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full sm:w-80">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Filter Data
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Set the dimensions for the layer.
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="mb-2 block">Year</Label>
                                      <div className="flex items-center space-x-2">
                                        <Dialog
                                          open={isDialogOpen}
                                          onOpenChange={setDialogOpen}
                                        >
                                          <DialogTrigger
                                            className="mx-auto"
                                            asChild
                                          >
                                            <Button
                                              variant="outline"
                                              onClick={() =>
                                                setDialogOpen(true)
                                              }
                                            >
                                              Filter Year
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                              <DialogTitle>
                                                Choose Year :
                                              </DialogTitle>
                                              <DialogDescription>
                                                Choose Years for Show in Charts.
                                              </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-4 py-4">
                                              <div className="grid grid-cols-2 gap-2">
                                                {SortuniqueYears.map((year) => (
                                                  <div
                                                    key={year}
                                                    className="flex items-center space-x-2"
                                                  >
                                                    <Checkbox
                                                      id={`year-${year}`}
                                                      checked={selectedYears.has(
                                                        year
                                                      )}
                                                      onCheckedChange={(
                                                        checked: boolean
                                                      ) =>
                                                        handleYearlyDataChange(
                                                          year,
                                                          checked
                                                        )
                                                      }
                                                    />
                                                    <Label
                                                      htmlFor={`year-${year}`}
                                                    >
                                                      {year}
                                                    </Label>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            <DialogFooter>
                                              <Button
                                                type="button"
                                                onClick={handleSubmit}
                                              >
                                                Save changes
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="mb-2 block">
                                        Data Types
                                      </Label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(
                                          Object.keys(
                                            selectedDataTypes
                                          ) as Array<keyof SelectedDataTypes>
                                        ).map((dataType) => (
                                          <div
                                            key={dataType}
                                            className="flex items-center space-x-2"
                                          >
                                            <Checkbox
                                              id={dataType}
                                              checked={
                                                selectedDataTypes[dataType]
                                              }
                                              onCheckedChange={() =>
                                                handleDataTypeChange(dataType)
                                              }
                                            />
                                            <Label htmlFor={dataType}>
                                              {dataType}
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <Label
                                          htmlFor="chartType"
                                          className="mb-2 sm:mb-0"
                                        >
                                          Chart Type
                                        </Label>
                                        <Select
                                          value="bar"
                                          onValueChange={(value) =>
                                            setChartType(value)
                                          }
                                        >
                                          <SelectTrigger className="w-[120px]">
                                            <SelectValue>
                                              {chartType}
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="BarChart">
                                              BarChart
                                            </SelectItem>
                                            <SelectItem value="AreaChart">
                                              AreaChart
                                            </SelectItem>
                                            <SelectItem value="LineChart">
                                              LineChart
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    className="w-full"
                                    onClick={handleApplyMainFilters}
                                  >
                                    Apply Filters
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Popover
                              open={popoverOpen}
                              onOpenChange={setPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button variant="outline">Filter</Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full sm:w-80">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Filter Data
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Set the dimensions for the layer.
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="mb-2 block">Year</Label>
                                      <Select
                                        onValueChange={(value) =>
                                          handleMonthData(Number(value))
                                        } // Use a function that calls handleMonthData
                                      >
                                        <SelectTrigger className="border rounded-md p-2">
                                          <SelectValue
                                            placeholder={
                                              selectedMonthYear
                                                ? String(selectedMonthYear)
                                                : "Select Year"
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {SortuniqueYears.map((year) => (
                                            <SelectItem
                                              key={year}
                                              value={year.toString()}
                                            >
                                              {year}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                      <Label
                                        htmlFor="chartType"
                                        className="mb-2 sm:mb-0"
                                      >
                                        Chart Type
                                      </Label>
                                      <Select
                                        value="bar"
                                        onValueChange={(value) =>
                                          setMonthchartType(value)
                                        }
                                      >
                                        <SelectTrigger className="w-[120px]">
                                          <SelectValue>
                                            {monthchartType}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="BarChart">
                                            BarChart
                                          </SelectItem>
                                          <SelectItem value="AreaChart">
                                            AreaChart
                                          </SelectItem>
                                          <SelectItem value="LineChart">
                                            LineChart
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <Button
                                    className="w-full"
                                    onClick={handleApplyMainFilters}
                                  >
                                    Apply Filters
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="year" className="mt-2">
                          <TabsList className="grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto">
                            <TabsTrigger
                              onClick={() => onhandleClick("year")} // Wrap the function call in an arrow function
                              value="year"
                            >
                              Year
                            </TabsTrigger>
                            <TabsTrigger
                              onClick={() => onhandleClick("month")} // Same for the other one
                              value="month"
                            >
                              Month
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="year">
                            <ChartContainer config={chartConfig}>
                              {renderChart()}
                            </ChartContainer>
                          </TabsContent>
                          <TabsContent value="month">
                            <ChartContainer config={chartConfig}>
                              {rendermonthChart()}
                            </ChartContainer>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full items-start gap-2 text-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center gap-2 font-medium leading-none">
                              Financial Breakdown{" "}
                              <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2 leading-none text-muted-foreground">
                              Yearly Summary for{" "}
                              {formatYearRange(selectedYears)}: January -
                              December
                            </div>
                            <div className="leading-none text-muted-foreground">
                              Analyzing income, expenses, and taxes for{" "}
                              {formatYearRange(selectedYears)}.
                            </div>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                    <Card className="w-full mb-4">
                      <CardHeader className="flex flex-row justify-between">
                        <div>
                          <CardTitle>Financial Breakdown</CardTitle>
                          <CardDescription>
                            View a summary of all orders
                          </CardDescription>
                        </div>
                        <div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">Filter</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium leading-none">
                                    Filter Data
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Set the dimensions for the layer.
                                  </p>
                                </div>
                                <div className="grid gap-2">
                                  <div className="flex flex-col items-center gap-4">
                                    <Label htmlFor="width">Year</Label>

                                    <Select
                                      value={selectedYear?.toString()}
                                      onValueChange={(value) =>
                                        handleYearChange(Number(value))
                                      }
                                    >
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue>
                                          {selectedYear}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {uniqueYears.map((year) => (
                                          <SelectItem
                                            key={year}
                                            value={year.toString()}
                                          >
                                            {year}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex flex-col items-center gap-4">
                                    <Label htmlFor="width">Languages</Label>

                                    <Select
                                      value={language}
                                      onValueChange={(value) =>
                                        handleLanguageChange(value)
                                      }
                                    >
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue>{language}</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="English">
                                          English
                                        </SelectItem>
                                        <SelectItem value="Thai">
                                          Thai
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="income" className="mb-8">
                          <TabsList className="grid grid-cols-1 sm:grid-cols-3 max-w-xl mx-auto">
                            <TabsTrigger value="income">Income</TabsTrigger>
                            <TabsTrigger value="expense">Expense</TabsTrigger>
                            <TabsTrigger value="tax">Tax</TabsTrigger>
                          </TabsList>
                          <TabsContent value="income">
                            <PieChartComponent
                              incomeBreakdown={selectedIncomeData}
                              languages={language}
                            />
                          </TabsContent>
                          <TabsContent value="expense">
                            <PieChartComponent
                              expenseBreakdown={selectedExpenseData}
                              languages={language}
                            />
                          </TabsContent>
                          <TabsContent value="tax">
                            <PieChartComponent
                              taxBreakdown={selectedTaxData}
                              languages={language}
                            />
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full items-start gap-2 text-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center gap-2 font-medium leading-none">
                              Financial Breakdown{" "}
                              <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2 leading-none text-muted-foreground">
                              Yearly Summary for {selectedYear}: January -
                              December
                            </div>
                            <div className="leading-none text-muted-foreground">
                              Analyzing income, expenses, and taxes for{" "}
                              {selectedYear}.
                            </div>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}