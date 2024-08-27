"use client";
import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { File, ListFilter, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Area,
  AreaChart,
  PieChart,
  Pie,
  LineChart,
  Line,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomTooltip from "@/components/Charts/CustomTooltip";

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

const chartData2 = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig2 = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalTax: number;
  netIncome: number;
}

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
  const [chartType, setChartType] = useState<string>("bar");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [uniqueYears, setUniqueYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/" + slug + "/compare");
        const jsonResponse = await res.json();
        const data = jsonResponse.data;
        const years = jsonResponse.uniqueYears;

        // Group by year
        const groupedByYear = data.reduce(
          (
            acc: { [x: string]: any[] },
            curr: { year: string | number; monthIndex: number }
          ) => {
            if (!acc[curr.year]) acc[curr.year] = [];
            acc[curr.year].push(curr);
            return acc;
          },
          {}
        );

        // Aggregate data by year and map to ChartData interface
        const aggregatedData = Object.keys(groupedByYear).map((year) => {
          const summaries = groupedByYear[year];

          // Log the summaries to check the properties
          console.log("Summaries for year", year, summaries);

          const totalIncome = summaries.reduce((sum: any, item: any) => {
            console.log("Item:", item);
            return sum + (item.Income || 0); // Adjust the property name if needed
          }, 0);
          const totalExpense = summaries.reduce((sum: any, item: any) => {
            return sum + (item.Expense || 0); // Adjust the property name if needed
          }, 0);
          const totalTax = summaries.reduce((sum: any, item: any) => {
            return sum + (item.Tax || 0); // Adjust the property name if needed
          }, 0);
          const netIncome = summaries.reduce((sum: any, item: any) => {
            return sum + (item.netIncome || 0);
          }, 0);

          return {
            year: parseInt(year, 10),
            monthIndex: 0, // Dummy monthIndex for yearly aggregation
            month: "Yearly", // Dummy month name for yearly aggregation
            Income: totalIncome,
            Expense: totalExpense,
            Tax: totalTax,
            netIncome: netIncome,
          };
        });

        // Sort the aggregated data by year
        const sortedData = aggregatedData.sort((a, b) => a.year - b.year);

        // Set the formatted data to chartData state
        console.log("data", sortedData);
        setChartData(sortedData);
        setUniqueYears(years);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [slug]);

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              accessibilityLayer
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false} // Hide vertical lines
                horizontal={true} // Ensure horizontal lines are shown
                stroke="#000" // Make the grid lines black for visibility
                strokeDasharray="2 2" // Dash pattern
              />
              <XAxis
                dataKey="year"
                tickLine={true}
                tickMargin={10}
                axisLine={true}
              />
              <YAxis
                tickLine={true}
                axisLine={true}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
                domain={[0, "auto"]} // Adjust this to zoom in on the differences
              />
              <ChartTooltip
                cursor={false}
                 // This will display the year as the title
                content={<CustomTooltip />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="Income" fill="var(--color-Income)" radius={4} />
              <Bar dataKey="Expense" fill="var(--color-Expense)" radius={4} />
              <Bar dataKey="Tax" fill="var(--color-Tax)" radius={4} />
              <Bar
                dataKey="netIncome"
                fill="var(--color-netIncome)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        );
      case "line":
        return (
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
              domain={[0, "auto"]} // Adjust this to zoom in on the differences
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="Income"
              stroke="var(--color-income)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Expense"
              stroke="var(--color-expense)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Tax"
              stroke="var(--color-tax)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="netIncome"
              stroke="var(--color-net)"
              strokeWidth={2}
            />
          </LineChart>
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 w-full">
            <div className="flex justify-end my-5 gap-4">
              <Popover>
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
                        <Label className="mb-2 block">Year Range</Label>
                        <div className="flex items-center space-x-2">
                          <Select>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Start year" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span>-</span>
                          <Select>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="End year" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Data Types</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="income" />
                            <Label htmlFor="income">Income</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="expense" />
                            <Label htmlFor="expense">Expense</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tax" />
                            <Label htmlFor="tax">Tax</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="net" />
                            <Label htmlFor="net">Net</Label>
                          </div>
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
                              <SelectItem value="area">Area Chart</SelectItem>
                              <SelectItem value="pie">Pie Chart</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="maxHeight">Max. height</Label>
                          <Input
                            id="maxHeight"
                            defaultValue="none"
                            className="w-[100px] h-8"
                          />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">Apply Filters</Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline">Export</Button>
            </div>
            <div className="grid lg:grid-cols-2 items-start gap-4 md:gap-8 w-full">
              <Card className="w-full">
                <CardHeader className="flex flex-row justify-between">
                  <div>
                    <CardTitle>Monthly Financial Overview</CardTitle>
                    <CardDescription>
                      View a summary of all orders
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tabs defaultValue="income" className="mt-2">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="income">Income</TabsTrigger>
                        <TabsTrigger value="expense">Expense</TabsTrigger>
                        <TabsTrigger value="tax">Tax</TabsTrigger>
                        <TabsTrigger value="net">Net</TabsTrigger>
                      </TabsList>
                      <TabsContent value="income"></TabsContent>
                      <TabsContent value="expense"></TabsContent>
                      <TabsContent value="tax"></TabsContent>
                      <TabsContent value="net"></TabsContent>
                    </Tabs>
                    <Popover>
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
                              <Label className="mb-2 block">Year Range</Label>
                              <div className="flex items-center space-x-2">
                                <Select>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Start year" />
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
                                <span>-</span>
                                <Select>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="End year" />
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

                            <div>
                              <Label className="mb-2 block">Data Types</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="income" />
                                  <Label htmlFor="income">Income</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="expense" />
                                  <Label htmlFor="expense">Expense</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="tax" />
                                  <Label htmlFor="tax">Tax</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="net" />
                                  <Label htmlFor="net">Net</Label>
                                </div>
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
                                    <SelectItem value="bar">
                                      Bar Chart
                                    </SelectItem>
                                    <SelectItem value="area">
                                      Area Chart
                                    </SelectItem>
                                    <SelectItem value="line">
                                      Line Chart
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-between items-center">
                                <Label htmlFor="maxHeight">Max. height</Label>
                                <Input
                                  id="maxHeight"
                                  defaultValue="none"
                                  className="w-[100px] h-8"
                                />
                              </div>
                            </div>
                          </div>

                          <Button className="w-full">Apply Filters</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    {renderChart()}
                  </ChartContainer>
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
                              <Select>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select a fruit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Fruits</SelectLabel>
                                    <SelectItem value="apple">Apple</SelectItem>
                                    <SelectItem value="banana">
                                      Banana
                                    </SelectItem>
                                    <SelectItem value="blueberry">
                                      Blueberry
                                    </SelectItem>
                                    <SelectItem value="grapes">
                                      Grapes
                                    </SelectItem>
                                    <SelectItem value="pineapple">
                                      Pineapple
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <p>-</p>
                              <Select>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select a fruit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Fruits</SelectLabel>
                                    <SelectItem value="apple">Apple</SelectItem>
                                    <SelectItem value="banana">
                                      Banana
                                    </SelectItem>
                                    <SelectItem value="blueberry">
                                      Blueberry
                                    </SelectItem>
                                    <SelectItem value="grapes">
                                      Grapes
                                    </SelectItem>
                                    <SelectItem value="pineapple">
                                      Pineapple
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label htmlFor="maxWidth">Max. width</Label>
                              <Input
                                id="maxWidth"
                                defaultValue="300px"
                                className="col-span-2 h-8"
                              />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label htmlFor="height">Height</Label>
                              <Input
                                id="height"
                                defaultValue="25px"
                                className="col-span-2 h-8"
                              />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label htmlFor="maxHeight">Max. height</Label>
                              <Input
                                id="maxHeight"
                                defaultValue="none"
                                className="col-span-2 h-8"
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig2}
                    className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={chartData2}
                        dataKey="visitors"
                        label
                        nameKey="browser"
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 font-medium leading-none">
                        Trending up by 5.2% this month{" "}
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 leading-none text-muted-foreground">
                        January - June 2024
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
