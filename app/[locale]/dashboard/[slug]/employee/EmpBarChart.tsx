import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../../components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { useState } from "react";
import { useTranslations } from "next-intl";

type Income = {
  id: number;
  month: number;
  year: number;
  salary?: number;
  shiftAllowance?: number;
  foodAllowance?: number;
  overtime?: number;
  diligence?: number;
  beverage?: number;
  commission?: number;
  brokerFee?: number;
  otherIncome?: number;
  bonus?: number;
};

type Expense = {
  id: number;
  month: number;
  year: number;
  loan?: number;

  salaryAdvance?: number;
  commissionDeduction?: number;
  otherDeductions?: number;
};

type Tax = {
  id: number;
  month: number;
  year: number;
  employeeTax?: number;
  companyTax?: number;
  socialSecurityEmployee?: number;
  socialSecurityCompany?: number;
  providentFund?: number;
};

type Employee = {
  employeeCode: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  currentSalary: number;
  year: number;
  startDate: string;
  endDate: string;
  incomes?: Income[];
  expenses?: Expense[];
  taxes?: Tax[];
};

type EmployeeChartDialogProps = {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
};



const formatSalary = (salary: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(salary);
};

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
  tax: {
    label: "Tax",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];



const EmployeeChart: React.FC<EmployeeChartDialogProps> = ({
  employee,
  open,
  onClose,
}) => {
  const [breakdownType, setBreakdownType] = useState<
    "income" | "expense" | "tax"
  >("income");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  // Add this line to use translations
  const t = useTranslations('Employee_Chart'); 
  const prepareIncomeData = (employee: Employee) => {
    return [
      {
        name: t("income_labels.salary"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.salary || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.shiftAllowance"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.shiftAllowance || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.foodAllowance"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.foodAllowance || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.overtime"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.overtime || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.diligence"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.diligence || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.beverage"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.beverage || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.commission"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.commission || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.brokerFee"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.brokerFee || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.bonus"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.bonus || 0),
            0
          ) || 0,
      },
      {
        name: t("income_labels.other"),
        value:
          employee.incomes?.reduce(
            (acc, income) => acc + (income.otherIncome || 0),
            0
          ) || 0,
      },
    ].filter((item) => item.value > 0);
  };
  
  const prepareExpenseData = (employee: Employee) => {
    return [
      {
        name: t("expense_labels.loan"),
        value:
          employee.expenses?.reduce(
            (acc, expense) => acc + (expense.loan || 0),
            0
          ) || 0,
      },
      {
        name: t("expense_labels.salaryAdvance"),
        value:
          employee.expenses?.reduce(
            (acc, expense) => acc + (expense.salaryAdvance || 0),
            0
          ) || 0,
      },
      {
        name: t("expense_labels.commissionDeduction"),
        value:
          employee.expenses?.reduce(
            (acc, expense) => acc + (expense.commissionDeduction || 0),
            0
          ) || 0,
      },
      {
        name: t("expense_labels.otherDeductions"),
        value:
          employee.expenses?.reduce(
            (acc, expense) => acc + (expense.otherDeductions || 0),
            0
          ) || 0,
      },
    ].filter((item) => item.value > 0);
  };
  
  const prepareTaxData = (employee: Employee) => {
    return [
      {
        name: t("tax_labels.employeeTax"),
        value:
          employee.taxes?.reduce((acc, tax) => acc + (tax.employeeTax || 0), 0) ||
          0,
      },
      {
        name: t("tax_labels.companyTax"),
        value:
          employee.taxes?.reduce((acc, tax) => acc + (tax.companyTax || 0), 0) ||
          0,
      },
      {
        name: t("tax_labels.socialSecurityEmployee"),
        value:
          employee.taxes?.reduce(
            (acc, tax) => acc + (tax.socialSecurityEmployee || 0),
            0
          ) || 0,
      },
      {
        name: t("tax_labels.socialSecurityCompany"),
        value:
          employee.taxes?.reduce(
            (acc, tax) => acc + (tax.socialSecurityCompany || 0),
            0
          ) || 0,
      },
      {
        name: t("tax_labels.providentFund"),
        value:
          employee.taxes?.reduce(
            (acc, tax) => acc + (tax.providentFund || 0),
            0
          ) || 0,
      },
    ].filter((item) => item.value > 0);
  };

  if (!employee) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-4 border border-gray-200 rounded shadow">
          <p className="label font-bold">{`${label}`}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${t(`tooltip.${pld.dataKey}`)}: ${formatSalary(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const combinedData = employee.incomes
    ?.map((income) => {
      const expense = employee.expenses?.find(
        (expense) =>
          expense.month === income.month && expense.year === income.year
      );
      const tax = employee.taxes?.find(
        (tax) => tax.month === income.month && tax.year === income.year
      );

      const totalIncome =
        (income.salary || 0) +
        (income.shiftAllowance || 0) +
        (income.foodAllowance || 0) +
        (income.overtime || 0) +
        (income.diligence || 0) +
        (income.beverage || 0) +
        (income.commission || 0) +
        (income.brokerFee || 0) +
        (income.otherIncome || 0) +
        (income.bonus || 0);

      const totalExpense =
        (expense?.loan || 0) +
        (expense?.salaryAdvance || 0) +
        (expense?.commissionDeduction || 0) +
        (expense?.otherDeductions || 0);

      const totalTax =
        (tax?.employeeTax || 0) +
        (tax?.companyTax || 0) +
        (tax?.socialSecurityEmployee || 0) +
        (tax?.socialSecurityCompany || 0) +
        (tax?.providentFund || 0);

      return {
        monthNumber: income.month,
        monthName: t(`months.${income.month - 1}`), // Use the new translation
        income: totalIncome,
        expense: totalExpense,
        tax: totalTax,
        netIncome: totalIncome - totalExpense - totalTax,
      };
    })
    .sort((a, b) => a.monthNumber - b.monthNumber);

  // Check if all data values are zero
  const isDataEmpty = combinedData?.every(
    (data) => data.income === 0 && data.expense === 0 && data.tax === 0
  );

  const getBreakdownData = () => {
    switch (breakdownType) {
      case "income":
        return prepareIncomeData(employee);
      case "expense":
        return prepareExpenseData(employee);
      case "tax":
        return prepareTaxData(employee);
    }
  };

  const isBreakdownDataEmpty = () => {
    const breakdownData = getBreakdownData();
    return breakdownData.every((item) => item.value === 0);
  };

  const filteredData =
    selectedMonth === "all"
      ? combinedData
      : combinedData?.filter((data) => data.monthNumber === selectedMonth);

  const totalIncome =
    filteredData?.reduce((acc, data) => acc + data.income, 0) || 0;
  const totalExpense =
    filteredData?.reduce((acc, data) => acc + data.expense, 0) || 0;
  const totalTax = filteredData?.reduce((acc, data) => acc + data.tax, 0) || 0;
  const netResult = totalIncome - totalExpense - totalTax;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-7xl p-6 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t('title', { name: `${employee.firstName} ${employee.lastName}` })} {/* Translated */}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('viewDetails')} {/* Translated */}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
        <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p>
                    <strong>{t('employeeCode')}:</strong> {employee.employeeCode}
                  </p>
                  <p>
                    <strong>{t('name-lastName')}</strong> {employee.title}{" "}
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p>
                    <strong>{t('gender')}:</strong> {t(`genders.${employee.gender}`)}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>{t('currentSalary')}:</strong>{" "}
                    {formatSalary(employee.currentSalary)}
                  </p>
                  <p>
                    <strong>{t('workingYear')}:</strong> {employee.year}
                  </p>
                  <p>
                    <strong>{t('startDate')}:</strong> {employee.startDate}
                  </p>
                  <p>
                    <strong>{t('endDate')}:</strong>{" "}
                    {employee.endDate || t('stillEmployed')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 w-[80%] mx-auto">
              <TabsTrigger value="all">{t('income')}/{t('expense')}/{t('tax')}</TabsTrigger> {/* Translated */}
              <TabsTrigger value="breakdown">{t('financialBreakdown', { ns: 'Compare' })}</TabsTrigger> {/* Translated */}
              <TabsTrigger value="net">{t('tabs.net')}</TabsTrigger> {/* Translated */}
            </TabsList>

            <TabsContent value="all">
              {isDataEmpty ? (
                <div className="text-center text-gray-500 m-8">
                  {t('noResults', { ns: 'Employee' })} {/* Translated */}
                </div>
              ) : (
                <Card className="lg:max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle>{t('financialOverview', { ns: 'Compare' })} {employee.year}</CardTitle> {/* Translated */}
                    <CardDescription>
                      {t('yearlySummary', { ns: 'Compare', year: employee.year })} {/* Translated */}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart accessibilityLayer data={combinedData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="monthName"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <YAxis />
                        <ChartTooltip
                          cursor={false}
                          content={<CustomTooltip />}
                        />
                        <Bar
                          dataKey="income"
                          fill="var(--color-income)"
                          radius={4}
                        />
                        <Bar
                          dataKey="expense"
                          fill="var(--color-expense)"
                          radius={4}
                        />
                        <Bar dataKey="tax" fill="var(--color-tax)" radius={4} />
                        <Legend />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                      {t('financialOverview', { ns: 'Compare' })} {employee.year} {" "} {/* Translated */}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      {t('analyzingData', { ns: 'Compare', year: employee.year })} {/* Translated */}
                    </div>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="breakdown">
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>
                  {t('financialBreakdown', { ns: 'Compare' })}: {t(`tabs.${breakdownType}`)}  {/* Translated */}
                  </CardTitle>
                  <CardDescription>
                    {t('yearlySummary', { ns: 'Compare', year: employee.year })} {/* Translated */}
                  </CardDescription>
                  <Select
                    onValueChange={(value: "income" | "expense" | "tax") =>
                      setBreakdownType(value)
                    }
                    defaultValue="income"
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('filterData', { ns: 'Compare' })} /> {/* Translated */}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="income">{t('income')}</SelectItem> {/* Translated */}
                        <SelectItem value="expense">{t('expense')}</SelectItem> {/* Translated */}
                        <SelectItem value="tax">{t('tax')}</SelectItem> {/* Translated */}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardHeader>
                {isBreakdownDataEmpty() ? (
                  <div className="text-center text-gray-500 m-8">
                    {t('noResults', { ns: 'Employee' })} {/* Translated */}
                  </div>
                ) : (
                  <>
                    <CardContent className="w-full pb-0">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[400px] w-full pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                      >
                        <PieChart>
                          <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={getBreakdownData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="70%"
                            innerRadius="40%"
                            paddingAngle={5}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={true}
                          >
                            {getBreakdownData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 font-medium leading-none">
                        {t('footerTitle')}{" "} {/* Translated */}
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="leading-none text-muted-foreground">
                        {t('viewSummaryAllOrders')} {/* Translated */}
                      </div>
                    </CardFooter>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="net">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>{t('financialOverview', { ns: 'Compare' })}</CardTitle> {/* Translated */}
                  <CardDescription>
                    {t('yearlySummary', { ns: 'Compare', year: employee.year })} {/* Translated */}
                  </CardDescription>
                  <Select
                    onValueChange={(value) =>
                      setSelectedMonth(
                        value === "all" ? "all" : parseInt(value)
                      )
                    }
                    defaultValue="all"
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('month', { ns: 'Compare' })} /> {/* Translated */}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">{t('allYears')}</SelectItem> {/* Translated */}
                        {combinedData?.map((data) => (
                          <SelectItem
                            key={data.monthNumber}
                            value={data.monthNumber.toString()}
                          >
                            {data.monthName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="w-full pb-0">
                  <div className="grid grid-cols-2 gap-4 m-8">
                    <div>
                      <strong>{t('labels.totalincome', { ns: 'Charts' })}:</strong> {formatSalary(totalIncome)} {/* Translated */}
                    </div>
                    <div>
                      <strong>{t('labels.totalexpense', { ns: 'Charts' })}:</strong>{" "} {/* Translated */}
                      {formatSalary(totalExpense)}
                    </div>
                    <div>
                      <strong>{t('labels.totaltax', { ns: 'Charts' })}:</strong> {formatSalary(totalTax)} {/* Translated */}
                    </div>
                    <div>
                      <strong>{t('labels.netincome', { ns: 'Charts' })}:</strong> {formatSalary(netResult)} {/* Translated */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeChart;