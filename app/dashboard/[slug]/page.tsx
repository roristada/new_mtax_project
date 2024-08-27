"use client";

import { Loader2, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Sector,
  XAxis,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import IncomeBreakdownDonutChart from "@/components/Charts/Donut/IncomeBreakdownDonutChart";
import BarChart_Component from "@/components/Charts/Bar/BarChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseBreakdownDonutChart from "@/components/Charts/Donut/ExpenseBreakdownDonutChart copy";
import { useParams } from "next/navigation";
import TaxBreakdownDonutChart from "@/components/Charts/Donut/TaxBreakdownDonutChart copy";

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
}

interface AggregatedData {
  [key: string]: {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
  };
}

interface ChartData {
  monthIndex: number;
  year: number;
  month: string;
  Income: number;
  Expense: number;
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

export default function Component({ params }: { params: { slug: string } }) {
  

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] =
    useState<IncomeBreakdown | null>(null);

  const [expenseBreakdown, setExpenseBreakdown] =
    useState<ExpenseBreakdown | null>(null);

    const [taxBreakdown, setTaxBreakdown] =
    useState<TaxBreakdown | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/" + params.slug);
        const jsonResponse = await res.json();

        // Log the entire response to inspect it
        console.log("API Data:", jsonResponse);

        // Access the array inside the `data` property
        const data = jsonResponse.data;
        const totalIncomeBreakdown = aggregateIncomeBreakdown(data);
        setIncomeBreakdown(totalIncomeBreakdown);

        const totalExpenseBreakdown = aggregateExpenseBreakdown(data);
        setExpenseBreakdown(totalExpenseBreakdown);

        const totalTaxBreakdown = aggregateTaxBreakdown(data);
        setTaxBreakdown(totalTaxBreakdown);

        const aggregatedData: AggregatedData = {};
        data.forEach((employeeData: any) => {
          employeeData.monthlySummaries.forEach((summary: MonthlySummary) => {
            const monthYear = `${summary.month}-${summary.year}`;
            if (!aggregatedData[monthYear]) {
              aggregatedData[monthYear] = {
                month: summary.month,
                year: summary.year,
                totalIncome: 0,
                totalExpense: 0,
              };
            }
            aggregatedData[monthYear].totalIncome += summary.totalIncome;
            aggregatedData[monthYear].totalExpense += summary.totalExpense;
          });
        });

        let formattedChartData: ChartData[] = Object.keys(aggregatedData).map(
          (key) => ({
            month: new Date(
              aggregatedData[key].year,
              aggregatedData[key].month - 1
            ).toLocaleString("default", { month: "short" }),
            Income: aggregatedData[key].totalIncome,
            Expense: aggregatedData[key].totalExpense,
            year: aggregatedData[key].year,
            monthIndex: aggregatedData[key].month - 1,
          })
        );

        // Sort the data by year and month index
        formattedChartData.sort((a, b) => {
          if (a.year === b.year) {
            return a.monthIndex - b.monthIndex;
          } else {
            return a.year - b.year;
          }
        });

        setChartData(formattedChartData);

        console.log("Chart Data:", formattedChartData);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  const chartBarConfig = {
    income: {
      label: "Revenue ",
      color: "hsl(var(--chart-1))",
    },
    expense: {
      label: "Expenses ",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  function aggregateIncomeBreakdown(data: EmployeeData[]): IncomeBreakdown {
    const totalIncomeBreakdown: IncomeBreakdown = {
      salary: 0,
      shiftAllowance: 0,
      foodAllowance: 0,
      overtime: 0,
      diligence: 0,
      beverage: 0,
      commission: 0,
      brokerFee: 0,
      otherIncome: 0,
      bonus: 0,
    };

    data.forEach((employee) => {
      if (employee.incomeBreakdown) {
        (
          Object.keys(totalIncomeBreakdown) as Array<keyof IncomeBreakdown>
        ).forEach((key) => {
          totalIncomeBreakdown[key] += employee.incomeBreakdown[key] || 0;
        });
      }
    });

    return totalIncomeBreakdown;
  }

  function aggregateExpenseBreakdown(data: EmployeeData[]): ExpenseBreakdown {
    const totalExpenseBreakdown: ExpenseBreakdown = {
      loan: 0,
      salaryAdvance: 0,
      commissionDeduction: 0,
      otherDeductions: 0,
    };

    data.forEach((employee) => {
      if (employee.expenseBreakdown) {
        (
          Object.keys(totalExpenseBreakdown) as Array<keyof ExpenseBreakdown>
        ).forEach((key) => {
          totalExpenseBreakdown[key] += employee.expenseBreakdown[key] || 0;
        });
      }
    });

    return totalExpenseBreakdown;
  }

  function aggregateTaxBreakdown(data: EmployeeData[]): TaxBreakdown {
    const totalTaxBreakdown: TaxBreakdown = {
      employeeTax:0,
  companyTax:0,
  socialSecurityEmployee:0,
  socialSecurityCompany:0,
  providentFund:0
    };

    data.forEach((employee) => {
      if (employee.taxBreakdown) {
        (
          Object.keys(totalTaxBreakdown) as Array<keyof TaxBreakdown>
        ).forEach((key) => {
          totalTaxBreakdown[key] += employee.taxBreakdown[key] || 0;
        });
      }
    });

    return totalTaxBreakdown;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$32,456.12</div>
                <p className="text-xs text-muted-foreground">
                  +10.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Net</CardTitle>
                <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,775.77</div>
                <p className="text-xs text-muted-foreground">
                  +35.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$28,901.34</div>
                <p className="text-xs text-muted-foreground">
                  +15.8% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardContent className="mt-8">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <BarChart_Component
                    chartData={chartData}
                    chartConfig={chartBarConfig}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <Tabs defaultValue="income" className="w-full mt-8">
                <TabsList className="ms-6">
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                  <TabsTrigger value="tax">Tax</TabsTrigger>
                </TabsList>
                <TabsContent value="income">
                  <CardContent className="">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <IncomeBreakdownDonutChart
                        incomeBreakdown={incomeBreakdown}
                      />
                    )}
                  </CardContent>
                </TabsContent>
                <TabsContent value="expense">
                  <CardContent className="">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ExpenseBreakdownDonutChart
                        ExpenseBreakdown={expenseBreakdown}
                      />
                    )}
                  </CardContent>
                </TabsContent>
                <TabsContent value="tax">
                  <CardContent className="">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <TaxBreakdownDonutChart
                        taxBreakdown={taxBreakdown}
                      />
                    )}
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function DollarSignIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
