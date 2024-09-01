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

interface SelectedDataTypes {
  Income: boolean;
  Expense: boolean;
  Tax: boolean;
  netIncome: boolean;
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

interface EmployeeData {
  incomeBreakdown: IncomeBreakdown;
  expenseBreakdown: ExpenseBreakdown;
  taxBreakdown: TaxBreakdown;
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
  //------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/" + slug + "/compare");
        const jsonResponse = await res.json();
        const data = jsonResponse.data;
        const years = jsonResponse.uniqueYears;

        // Sort and set data
        const sortedData = data.sort((a: ChartData, b: ChartData) => {
          if (a.year === b.year) {
            return a.monthIndex - b.monthIndex; // Optional: sort by month within the same year
          }
          return a.year - b.year;
        });

        setChartData(sortedData);

        const groupedIncomeData: YearlyIncomeBreakdown = data.reduce(
          (acc: YearlyIncomeBreakdown, item: any) => {
            if (item.incomeBreakdown) {
              acc[item.year] = item.incomeBreakdown;
            }
            return acc;
          },
          {}
        );

        const groupedExpenseData: YearlyExpenseBreakdown = data.reduce(
          (acc: YearlyExpenseBreakdown, item: any) => {
            if (item.expenseBreakdown) {
              acc[item.year] = item.expenseBreakdown;
            }
            return acc;
          },
          {}
        );

        const groupedTaxData: YearlyTaxBreakdown = data.reduce(
          (acc: YearlyTaxBreakdown, item: any) => {
            if (item.taxBreakdown) {
              acc[item.year] = item.taxBreakdown;
            }
            return acc;
          },
          {}
        );

        setIncomeBreakdownData(groupedIncomeData);
        setExpenseBreakdownData(groupedExpenseData);
        setTaxBreakdownData(groupedTaxData);

        // Update unique years and set all years as selected
        const sortedYears = years.sort((a: number, b: number) => b - a);
        setUniqueYears(sortedYears);

        const latestTwoYears = sortedYears.slice(0, 2);
        setSelectedYears(new Set(latestTwoYears));
        //setSelectedYears(new Set(sortedYears)); // Set all years as selected
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

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
  const latestYear = SortuniqueYears[0];

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

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 h-full">
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-end my-5 gap-4">
                  <Popover
                    open={popoverMainOpen}
                    onOpenChange={setPopoverMainOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline">Filter</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Filter Data</h4>
                          <p className="text-sm text-muted-foreground">
                            Set the dimensions for the layer.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="mb-2 block">Data Types</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {(
                                Object.keys(selectedDataTypes) as Array<
                                  keyof SelectedDataTypes
                                >
                              ).map((dataType) => (
                                <div
                                  key={dataType}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={dataType}
                                    checked={selectedDataTypes[dataType]}
                                    onCheckedChange={() =>
                                      handleDataTypeChange(dataType)
                                    }
                                  />
                                  <Label htmlFor={dataType}>{dataType}</Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="chartType">Chart Type</Label>
                              <Select
                                onValueChange={(value) => setChartType(value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bar">Bar Chart</SelectItem>
                                  <SelectItem value="area">
                                    Area Chart
                                  </SelectItem>
                                  <SelectItem value="line">
                                    Line Chart
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
                  <Button variant="outline">Export</Button>
                </div>
                <div className="grid lg:grid-cols-2 items-start gap-4 md:gap-8 w-full">
                  <Card className="w-full">
                    <CardHeader className="flex flex-row justify-between">
                      <div>
                        <CardTitle>Financial Overview</CardTitle>
                        <CardDescription>
                          View a summary of all orders
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Popover
                          open={popoverOpen}
                          onOpenChange={setPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="outline">Filter</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
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
                                          onClick={() => setDialogOpen(true)}
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
                                                <Label htmlFor={`year-${year}`}>
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
                                  <div className="grid grid-cols-2 gap-2">
                                    {(
                                      Object.keys(selectedDataTypes) as Array<
                                        keyof SelectedDataTypes
                                      >
                                    ).map((dataType) => (
                                      <div
                                        key={dataType}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={dataType}
                                          checked={selectedDataTypes[dataType]}
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
                                  <div className="flex justify-between items-center">
                                    <Label htmlFor="chartType">
                                      Chart Type
                                    </Label>
                                    <Select
                                      value="bar"
                                      onValueChange={(value) =>
                                        setChartType(value)
                                      }
                                    >
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue>{chartType}</SelectValue>
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
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="year" className="mt-2">
                        <TabsList className="grid lg:grid-cols-2 max-w-xl grid-cols-1 mx-auto">
                          <TabsTrigger value="year">Year</TabsTrigger>
                          <TabsTrigger value="month">Month</TabsTrigger>
                        </TabsList>
                        <TabsContent value="year">
                          <ChartContainer config={chartConfig}>
                            {renderChart()}
                          </ChartContainer>
                        </TabsContent>
                        <TabsContent value="mounth"></TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                  <Card>
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
                                      <SelectValue>{selectedYear}</SelectValue>
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
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="income" className="mb-8">
                        <TabsList className="grid max-w-xl grid-cols-3 mx-auto ">
                          <TabsTrigger value="income">Income</TabsTrigger>
                          <TabsTrigger value="expense">Expense</TabsTrigger>
                          <TabsTrigger value="tax">Tax</TabsTrigger>
                        </TabsList>
                        <TabsContent value="income">
                          <PieChartComponent
                            incomeBreakdown={selectedIncomeData}
                          />
                        </TabsContent>
                        <TabsContent value="expense">
                          <PieChartComponent
                            expenseBreakdown={selectedExpenseData}
                          />
                        </TabsContent>
                        <TabsContent value="tax">
                          <PieChartComponent taxBreakdown={selectedTaxData} />
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
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
