"use client";

import {
  Loader2,
  MinusIcon,
  TrendingDownIcon,
  TrendingUp,
  TrendingUpIcon,
} from "lucide-react";

import IncomeBreakdownDonutChart from "../../../../components/Charts/Donut/IncomeBreakdownDonutChart";
import BarChart_Component from "../../../../components/Charts/Bar/BarChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { ChartConfig } from "../../../../components/ui/chart";

import { useEffect, useMemo, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import ExpenseBreakdownDonutChart from "../../../../components/Charts/Donut/ExpenseBreakdownDonutChart ";
import TaxBreakdownDonutChart from "../../../../components/Charts/Donut/TaxBreakdownDonutChart";
import useAuthEffect from "../../../../lib/useAuthEffect";
import { useTranslations } from "next-intl";

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

interface EmployeeData {
  incomeBreakdown: IncomeBreakdown;
  expenseBreakdown: ExpenseBreakdown;
  taxBreakdown: TaxBreakdown;
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
  const t = useTranslations("Dashboard");

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useAuthEffect((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] =
    useState<IncomeBreakdown | null>(null);

  const [expenseBreakdown, setExpenseBreakdown] =
    useState<ExpenseBreakdown | null>(null);

  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [totalIncomedata, setTotalIncomedata] = useState(0);
  const [totalExpensedata, setTotalExpensedata] = useState(0);
  const [totalTaxdata, setTotalTaxdata] = useState(0);
  const [netIncomedata, setNetIncomedata] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthChecked) {
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/` + params.slug);
        const jsonResponse = await res.json();
        const data = jsonResponse.data;
        console.log(data);

        const totalIncomeBreakdown = aggregateIncomeBreakdown(data);
        const totalExpenseBreakdown = aggregateExpenseBreakdown(data);
        const totalTaxBreakdown = aggregateTaxBreakdown(data);

        const totalIncome = Object.values(totalIncomeBreakdown).reduce(
          (sum, value) => sum + value,
          0
        );
        const totalExpense = Object.values(totalExpenseBreakdown).reduce(
          (sum, value) => sum + value,
          0
        );
        const totalTax = Object.values(totalTaxBreakdown).reduce(
          (sum, value) => sum + value,
          0
        );
        const netIncome = totalIncome - totalExpense;
        setIncomeBreakdown(totalIncomeBreakdown);
        setExpenseBreakdown(totalExpenseBreakdown);
        setTaxBreakdown(totalTaxBreakdown);

        setTotalIncomedata(totalIncome);
        setTotalExpensedata(totalExpense);
        setTotalTaxdata(totalTax);
        setNetIncomedata(netIncome);

        const formattedChartData = formatChartData(data);
        setChartData(formattedChartData);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.slug, isAuthChecked]);

  const memoizedChartData = useMemo(() => chartData, [chartData]);
  const memoizedIncomeBreakdown = useMemo(
    () => incomeBreakdown,
    [incomeBreakdown]
  );
  const memoizedExpenseBreakdown = useMemo(
    () => expenseBreakdown,
    [expenseBreakdown]
  );
  const memoizedTaxBreakdown = useMemo(() => taxBreakdown, [taxBreakdown]);

  const chartBarConfig = {
    income: {
      label: t("labels.income"),
      color: "hsl(var(--chart-1))",
    },
    expense: {
      label: t("labels.expense"),
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const formatThaiCurrency = (amount: number) => {
    return new Intl.NumberFormat(t("Charts.locale"), {
      style: "currency",
      currency: t("Charts.currencyCode"),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const FinancialCard = ({
    title,
    amount,
    icon: Icon,
    year,
    previousAmount,
  }: {
    title: string;
    amount: number;
    icon: React.ElementType;
    year: number;
    previousAmount?: number;
  }) => {
    const percentageChange =
      previousAmount !== undefined
        ? getPercentageChange(amount, previousAmount)
        : undefined;

    return (
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatThaiCurrency(amount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("Charts.year")} {year}
          </p>
          {percentageChange !== undefined && (
            <div
              className={`flex items-center mt-2 text-sm ${
                percentageChange > 0
                  ? "text-green-600"
                  : percentageChange < 0
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {percentageChange > 0 ? (
                <TrendingUpIcon className="w-4 h-4 mr-1" />
              ) : percentageChange < 0 ? (
                <TrendingDownIcon className="w-4 h-4 mr-1" />
              ) : (
                <MinusIcon className="w-4 h-4 mr-1" />
              )}
              <span>
                {Math.abs(percentageChange).toFixed(2)}%{" "}
                {t("from_previous_year")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FinancialCard
              title={t("labels.totalincome")}
              amount={totalIncomedata}
              icon={DollarSignIcon}
              year={chartData.length > 0 ? Number(chartData[0].year) : 0}
            />
            <FinancialCard
              title={t("labels.totalexpense")}
              amount={totalExpensedata}
              icon={DollarSignIcon}
              year={chartData.length > 0 ? Number(chartData[0].year) : 0}
            />
            <FinancialCard
              title={t("labels.totaltax")}
              amount={totalTaxdata}
              icon={DollarSignIcon}
              year={chartData.length > 0 ? Number(chartData[0].year) : 0}
            />
            <FinancialCard
              title={t("labels.netincome")}
              amount={netIncomedata}
              icon={DollarSignIcon}
              year={chartData.length > 0 ? Number(chartData[0].year) : 0}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardContent className="mt-8">
                {isLoading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <BarChart_Component
                    chartData={memoizedChartData}
                    chartConfig={chartBarConfig}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <Tabs defaultValue="income" className="mt-8 w-full">
                <TabsList className="ms-6">
                  <TabsTrigger value="income">{t("tabs.income")}</TabsTrigger>
                  <TabsTrigger value="expense">{t("tabs.expense")}</TabsTrigger>
                  <TabsTrigger value="tax">{t("tabs.tax")}</TabsTrigger>
                </TabsList>
                <TabsContent value="income">
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <IncomeBreakdownDonutChart
                        incomeBreakdown={memoizedIncomeBreakdown}
                      />
                    )}
                  </CardContent>
                </TabsContent>
                <TabsContent value="expense">
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ExpenseBreakdownDonutChart
                        ExpenseBreakdown={memoizedExpenseBreakdown}
                      />
                    )}
                  </CardContent>
                </TabsContent>
                <TabsContent value="tax">
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <TaxBreakdownDonutChart
                        taxBreakdown={memoizedTaxBreakdown}
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

function formatChartData(data: any[]): ChartData[] {
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

  return formattedChartData;
}

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
    employeeTax: 0,
    companyTax: 0,
    socialSecurityEmployee: 0,
    socialSecurityCompany: 0,
    providentFund: 0,
  };

  data.forEach((employee) => {
    if (employee.taxBreakdown) {
      (Object.keys(totalTaxBreakdown) as Array<keyof TaxBreakdown>).forEach(
        (key) => {
          totalTaxBreakdown[key] += employee.taxBreakdown[key] || 0;
        }
      );
    }
  });

  return totalTaxBreakdown;
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
