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
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

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

const prepareIncomeData = (employee: Employee) => {
  return [
    {
      name: "Salary",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.salary || 0),
          0
        ) || 0,
    },
    {
      name: "Shift Allowance",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.shiftAllowance || 0),
          0
        ) || 0,
    },
    {
      name: "Food Allowance",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.foodAllowance || 0),
          0
        ) || 0,
    },
    {
      name: "Overtime",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.overtime || 0),
          0
        ) || 0,
    },
    {
      name: "Diligence",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.diligence || 0),
          0
        ) || 0,
    },
    {
      name: "Beverage",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.beverage || 0),
          0
        ) || 0,
    },
    {
      name: "Commission",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.commission || 0),
          0
        ) || 0,
    },
    {
      name: "BrokerFee",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.brokerFee || 0),
          0
        ) || 0,
    },
    {
      name: "Bonus",
      value:
        employee.incomes?.reduce(
          (acc, income) => acc + (income.bonus || 0),
          0
        ) || 0,
    },
    {
      name: "Other",
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
      name: "Loan",
      value:
        employee.expenses?.reduce(
          (acc, expense) => acc + (expense.loan || 0),
          0
        ) || 0,
    },
    {
      name: "Salary Advance",
      value:
        employee.expenses?.reduce(
          (acc, expense) => acc + (expense.salaryAdvance || 0),
          0
        ) || 0,
    },
    {
      name: "Commission Deduction",
      value:
        employee.expenses?.reduce(
          (acc, expense) => acc + (expense.commissionDeduction || 0),
          0
        ) || 0,
    },
    {
      name: "Other Deductions",
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
      name: "Employee Tax",
      value:
        employee.taxes?.reduce((acc, tax) => acc + (tax.employeeTax || 0), 0) ||
        0,
    },
    {
      name: "Company Tax",
      value:
        employee.taxes?.reduce((acc, tax) => acc + (tax.companyTax || 0), 0) ||
        0,
    },
    {
      name: "Social Security (Employee)",
      value:
        employee.taxes?.reduce(
          (acc, tax) => acc + (tax.socialSecurityEmployee || 0),
          0
        ) || 0,
    },
    {
      name: "Social Security (Company)",
      value:
        employee.taxes?.reduce(
          (acc, tax) => acc + (tax.socialSecurityCompany || 0),
          0
        ) || 0,
    },
    {
      name: "Provident Fund",
      value:
        employee.taxes?.reduce(
          (acc, tax) => acc + (tax.providentFund || 0),
          0
        ) || 0,
    },
  ].filter((item) => item.value > 0);
};

const EmployeeChart: React.FC<EmployeeChartDialogProps> = ({
  employee,
  open,
  onClose,
}) => {
  const [breakdownType, setBreakdownType] = useState<
    "income" | "expense" | "tax"
  >("income");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  if (!employee) return null;

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
        monthName: new Date(0, income.month - 1).toLocaleString("default", {
          month: "long",
        }),
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
            Employee Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View the details of the employee below:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p>
                <strong>Employee Code:</strong> {employee.employeeCode}
              </p>
              <p>
                <strong>Name:</strong> {employee.title} {employee.firstName}{" "}
                {employee.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {employee.gender}
              </p>
            </div>
            <div>
              <p>
                <strong>Current Salary:</strong>{" "}
                {formatSalary(employee.currentSalary)}
              </p>
              <p>
                <strong>Working Year:</strong> {employee.year}
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 w-[80%] mx-auto">
              <TabsTrigger value="all">Income/Expense/Tax</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="net">Net</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isDataEmpty ? (
                <div className="text-center text-gray-500 m-8">
                  No data available for this period.
                </div>
              ) : (
                <Card className="lg:max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle>Bar Chart - Multiple</CardTitle>
                    <CardDescription>
                      January - December {employee.year}
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
                          content={<ChartTooltipContent indicator="dashed" />}
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
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                      Trending up by 5.2% this month{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Showing total visitors for the last 6 months
                    </div>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="breakdown">
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>
                    {breakdownType.charAt(0).toUpperCase() +
                      breakdownType.slice(1)}{" "}
                    Breakdown
                  </CardTitle>
                  <CardDescription>
                    January - December {employee.year}
                  </CardDescription>
                  <Select
                    onValueChange={(value: "income" | "expense" | "tax") =>
                      setBreakdownType(value)
                    }
                    defaultValue="income" // Set the default value to "income"
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select breakdown type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="tax">Tax</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardHeader>
                {isBreakdownDataEmpty() ? (
                  <div className="text-center text-gray-500 m-8">
                    No data available for this period.
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
                        Trending up by 5.2% this month{" "}
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="leading-none text-muted-foreground">
                        Showing total {breakdownType} breakdown for the year
                      </div>
                    </CardFooter>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="net">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    January - December {employee.year}
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
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Months</SelectItem>
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
                      <strong>Total Income:</strong> {formatSalary(totalIncome)}
                    </div>
                    <div>
                      <strong>Total Expense:</strong>{" "}
                      {formatSalary(totalExpense)}
                    </div>
                    <div>
                      <strong>Total Tax:</strong> {formatSalary(totalTax)}
                    </div>
                    <div>
                      <strong>Net Result:</strong> {formatSalary(netResult)}
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
