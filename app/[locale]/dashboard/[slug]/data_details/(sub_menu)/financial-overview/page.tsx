"use client";
import * as React from "react";

import { File, ListFilter, Loader2, TrendingUp } from "lucide-react";
import { Input } from "../../../../../../../components/ui/input";
import { Label } from "../../../../../../../components/ui/label";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  CalculatorIcon,
} from "lucide-react";

import {
  ChartConfig,
  ChartContainer,
} from "../../../../../../../components/ui/chart";
import { Button } from "../../../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../../../components/ui/card";

import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../../components/ui/dialog";

import { Checkbox } from "../../../../../../../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../../components/ui/tabs";

import FinancialBarChart from "../../(Charts)/BarChart";
import FinancialLineChart from "../../(Charts)/LineChart";
import FinancialAreaChart from "../../(Charts)/AreaChart";
import PieChartComponent from "../../(Charts)/Breakdown/PieChartIncome";
import FinancialMonthBarChart from "../../(Charts)/Month/BarChart";
import FinancialMonthAreaChart from "../../(Charts)/Month/AreaChart";
import FinancialMonthLineChart from "../../(Charts)/Month/LineChart";

import { useTranslations } from "next-intl";
import { useParams, usePathname } from "next/navigation";
// Assume this utility function exists
import { useLocale } from "next-intl";
import useAuthEffect from "@/lib/useAuthEffect";

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


const formatYearRange = (years: Set<number>): string => {
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  if (sortedYears.length === 0) return "";
  if (sortedYears.length === 1) return sortedYears[0].toString();
  return `${sortedYears[sortedYears.length - 1]}-${sortedYears[0]}`;
};

export default function FinancialOverview({ slug }: { slug: string }) {
  const params = useParams();
  const id = params.slug as string;
  const t = useTranslations("FinancialOverview");
  const locale = useLocale(); // Get the current locale

  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverMainOpen, setPopoverMainOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [chartType, setChartType] = useState<string>("BarChart");
  const [chartData, setChartData] = useState<ChartData[]>([]);

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

  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useAuthEffect((authenticated) => {
    setIsAuthChecked(authenticated);
  });


  


  //------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthChecked) return;
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch main data
        const mainRes = await fetch(`/api/dashboard/${id}/finance_overview`);
        const mainJsonResponse = await mainRes.json();
        console.log("mainJsonResponse", mainJsonResponse);
        const data = mainJsonResponse.data;
        const years = mainJsonResponse.uniqueYears;

        // Sort and set data
        const sortedData = data.sort((a: ChartData, b: ChartData) => {
          if (a.year === b.year) {
            return a.monthIndex - b.monthIndex;
          }
          return a.year - b.year;
        });

        setChartData(sortedData);

        // Set income, expense, and tax breakdown data

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

          // Fetch monthly data for the latest year
          const monthRes = await fetch(
            `/api/dashboard/${id}/month?companyId=${id}&year=${latestYear}`
          );
          const monthData = await monthRes.json();
          setChartDataYear(monthData);

          // Fetch commission and diligence data for the latest year
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, isAuthChecked]);

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
    }
  }, [SortuniqueYears]);

  const onhandleClick = (type: 'year' | 'month') => {
    setViewMode(type);
    if (type === 'month') {
      const fetchYears = async () => {
        try {
          const res = await fetch(`/api/dashboard/${id}/month?companyId=${id}&year=${selectedMonthYear}`);
          const jsonResponse = await res.json();
          setChartDataYear(jsonResponse);
        } catch (err) {
          console.log(err);
        }
      };
      fetchYears();
    }
    setCheckfilter(type);
  };

  const [monthchartType, setMonthchartType] = useState<string>("BarChart");

  const handleMonthData = async (year: number) => {
    setSelectedMonthYear(year);
    try {
      const res = await fetch(`/api/dashboard/${id}/month?companyId=${id}&year=${year}`);
      const jsonResponse = await res.json();
      setChartDataYear(jsonResponse);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch(
          `/api/dashboard/${id}/month?companyId=${id}&year=${selectedMonthYear}`
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

  //------------------------------------------------------------------------------------------------------------------------//
  const formatThaiCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "THB", // Assuming Thai Baht, change if needed
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      // Fallback to a simple formatting if Intl.NumberFormat fails
      return `฿${amount.toFixed(2)}`;
    }
  };

  

  const calculateTotalsByYear = (data: ChartData[]) => {
    return data.reduce((acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = {
          totalIncome: 0,
          totalExpense: 0,
          totalTax: 0,
          totalNetIncome: 0,
        };
      }
      acc[item.year].totalIncome += item.Income;
      acc[item.year].totalExpense += item.Expense;
      acc[item.year].totalTax += item.Tax;
      acc[item.year].totalNetIncome += item.netIncome;
      return acc;
    }, {} as Record<number, { totalIncome: number; totalExpense: number; totalTax: number; totalNetIncome: number }>);
  };

  const totalsByYear = useMemo(
    () => calculateTotalsByYear(filteredChartData),
    [filteredChartData]
  );

  function FinancialItem({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
  }) {
    const formattedValue = formatThaiCurrency(value);

    return (
      <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex-shrink-0 mr-4">
          <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
          <p className="text-lg font-semibold text-gray-900 break-all">
            {formattedValue.length > 15 ? (
              <>
                <span className="text-base">{formattedValue.slice(0, -3)}</span>
                <span className="text-sm">{formattedValue.slice(-3)}</span>
              </>
            ) : (
              formattedValue
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full h-screen flex-col ">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 h-full">
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid lg:grid-cols-1 mx-auto gap-4 md:gap-4 max-w-7xl ">
                  <div className="grid grid-cols-1 gap-4 ">
                    <Card className="lg:col-span-3 w-full mb-4 ">
                      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <CardTitle>{t("financialOverview")}</CardTitle>
                          <CardDescription>
                            {t("viewSummaryAllOrders")}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          {Checkfilter === "year" ? (
                            <Popover
                              open={popoverOpen}
                              onOpenChange={setPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button variant="outline">{t("filter")}</Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full sm:w-80">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      {t("filterData")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {t("setDimensions")}
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="mb-2 block">
                                        {t("year")}
                                      </Label>
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
                                              {t("filterYear")}
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                              <DialogTitle>
                                                {t("chooseYear")} :
                                              </DialogTitle>
                                              <DialogDescription>
                                                {t("chooseYears")}
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
                                                {t("saveChanges")}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="mb-2 block">
                                        {t("dataTypes")}
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
                                              {t(`labels.${dataType}`)}
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
                                          {t("chartType")}
                                        </Label>
                                        <Select
                                          value="bar"
                                          onValueChange={(value) =>
                                            setChartType(value)
                                          }
                                        >
                                          <SelectTrigger className="w-[120px]">
                                            <SelectValue>
                                              {t(`${chartType}`)}
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="BarChart">
                                              {t("barChart")}
                                            </SelectItem>
                                            <SelectItem value="AreaChart">
                                              {t("areaChart")}
                                            </SelectItem>
                                            <SelectItem value="LineChart">
                                              {t("lineChart")}
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
                                    {t("applyFilters")}
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
                                <Button variant="outline">{t("filter")}</Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full sm:w-80">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      {t("filterData")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {t("setDimensions")}
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="mb-2 block">
                                        {t("year")}
                                      </Label>
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
                                        {t("chartType")}
                                      </Label>
                                      <Select
                                        value="bar"
                                        onValueChange={(value) =>
                                          setMonthchartType(value)
                                        }
                                      >
                                        <SelectTrigger className="w-[120px]">
                                          <SelectValue>
                                            {t(`${monthchartType}`)}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="BarChart">
                                            {t("barChart")}
                                          </SelectItem>
                                          <SelectItem value="AreaChart">
                                            {t("areaChart")}
                                          </SelectItem>
                                          <SelectItem value="LineChart">
                                            {t("lineChart")}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <Button
                                    className="w-full"
                                    onClick={handleApplyMainFilters}
                                  >
                                    {t("applyFilters")}
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
                              {t("year")}
                            </TabsTrigger>
                            <TabsTrigger
                              onClick={() => onhandleClick("month")} // Same for the other one
                              value="month"
                            >
                              {t("month")}
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
                              {t("financialOverview")}
                              <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2 leading-none text-muted-foreground">
                              {t("yearlySummary", {
                                year: formatYearRange(selectedYears),
                              })}
                            </div>
                            <div className="leading-none text-muted-foreground">
                              {t("analyzingData", {
                                year: formatYearRange(selectedYears),
                              })}
                            </div>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>

                    {/* New Financial Summary Card */}
                    <Card className="w-full mb-4 overflow-hidden xl:col-span-3">
                      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <CardTitle className="text-xl sm:text-2xl font-bold">
                          {t("financialSummary")}
                        </CardTitle>
                        <p className="text-blue-100 text-sm sm:text-base">
                          {t("overviewOfFinances")}
                        </p>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        {viewMode === 'year' ? (
                          // แสดงข้อมูลรายปี
                          Array.from(selectedYears).sort((a, b) => b - a).map((year) => (
                            <div key={year} className="mb-6 last:mb-0">
                              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
                                {t("yearSummary", { year })}
                              </h3>
                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <FinancialItem
                                  icon={
                                    <ArrowUpIcon className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />
                                  }
                                  label={t("totalIncome")}
                                  value={totalsByYear[year]?.totalIncome || 0}
                                />
                                <FinancialItem
                                  icon={
                                    <ArrowDownIcon className="text-red-500 h-4 w-4 sm:h-5 sm:w-5" />
                                  }
                                  label={t("totalExpense")}
                                  value={totalsByYear[year]?.totalExpense || 0}
                                />
                                <FinancialItem
                                  icon={
                                    <CalculatorIcon className="text-yellow-500 h-4 w-4 sm:h-5 sm:w-5" />
                                  }
                                  label={t("totalTax")}
                                  value={totalsByYear[year]?.totalTax || 0}
                                />
                                <FinancialItem
                                  icon={
                                    <BanknoteIcon className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />
                                  }
                                  label={t("netIncome")}
                                  value={
                                    totalsByYear[year]?.totalNetIncome || 0
                                  }
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          // แสดงข้อมูลรายเดือน
                          selectedMonthYear && (
                            <div className="mb-6">
                              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
                                {t("yearSummary", { year: selectedMonthYear })}
                              </h3>
                              {ChartDataYear.sort((a, b) => a.month - b.month).map((data) => (
                                <div key={data.month} className="mb-4">
                                  <h4 className="text-md font-medium mb-2">{t(`month_${data.month}`)}</h4>
                                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <FinancialItem
                                      icon={<ArrowUpIcon className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />}
                                      label={t("totalIncome")}
                                      value={data.totalIncome}
                                    />
                                    <FinancialItem
                                      icon={<ArrowDownIcon className="text-red-500 h-4 w-4 sm:h-5 sm:w-5" />}
                                      label={t("totalExpense")}
                                      value={data.totalExpense}
                                    />
                                    <FinancialItem
                                      icon={<CalculatorIcon className="text-yellow-500 h-4 w-4 sm:h-5 sm:w-5" />}
                                      label={t("totalTax")}
                                      value={data.totalTax}
                                    />
                                    <FinancialItem
                                      icon={<BanknoteIcon className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />}
                                      label={t("netIncome")}
                                      value={data.netIncome}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </CardContent>
                      <CardFooter className="bg-gray-50 text-xs sm:text-sm text-gray-600 px-4 sm:px-6 py-3 sm:py-4">
                        {viewMode === 'year' 
                          ? t("summaryForPeriod", { year: formatYearRange(selectedYears) })
                          : t("summaryForYear", { year: selectedMonthYear })
                        }
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