"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../../components/ui/tabs";
import { Button } from "../../../../../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../../components/ui/popover";
import { TrendingUp, ArrowUpIcon, ArrowDownIcon, PercentIcon, CalendarIcon } from "lucide-react";
import PieChartComponent from "../../(Charts)/Breakdown/PieChartIncome";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../components/ui/select";
import { Label } from "../../../../../../../components/ui/label";
import { useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../components/ui/table";
import useAuthEffect from "../../../../../../../lib/useAuthEffect";


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

const createEmptyIncomeBreakdown = (): IncomeBreakdown => ({
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
});

const createEmptyExpenseBreakdown = (): ExpenseBreakdown => ({
  loan: 0,
  salaryAdvance: 0,
  commissionDeduction: 0,
  otherDeductions: 0,
});

const createEmptyTaxBreakdown = (): TaxBreakdown => ({
  employeeTax: 0,
  companyTax: 0,
  socialSecurityEmployee: 0,
  socialSecurityCompany: 0,
  providentFund: 0,
});

export default function FinancialBreakdownPage() {
  const t = useTranslations("FinancialBreakdown");
  const params = useParams();
  const id = params.slug as string;
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [incomeBreakdownData, setIncomeBreakdownData] =
    useState<YearlyIncomeBreakdown>({});
  const [expenseBreakdownData, setExpenseBreakdownData] =
    useState<YearlyExpenseBreakdown>({});
  const [taxBreakdownData, setTaxBreakdownData] = useState<YearlyTaxBreakdown>(
    {}
  );
  const [activeTab, setActiveTab] = useState("income");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useAuthEffect((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  const formatThaiCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      // Fallback to a simple formatting if Intl.NumberFormat fails
      return `฿${amount.toFixed(2)}`;
    }
  };

  const groupDataByYear = (data: any[], key: string) => {
    return data.reduce((acc, item) => {
      if (item[key]) {
        acc[item.year] = item[key];
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    if (!isAuthChecked) return;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/${id}/financial_breakdown`
        );
        const responseData = await response.json();
        console.log("responseData", responseData);

        if (Array.isArray(responseData.data) && responseData.data.length > 0) {
          setIncomeBreakdownData(
            groupDataByYear(responseData.data, "incomeBreakdown")
          );
          setExpenseBreakdownData(
            groupDataByYear(responseData.data, "expenseBreakdown")
          );
          setTaxBreakdownData(
            groupDataByYear(responseData.data, "taxBreakdown")
          );

          // Find the latest year
          const latestYear = Math.max(
            ...responseData.data.map((item: any) => item.year)
          );
          setSelectedYear(latestYear);
        } else {
          console.error("Unexpected data format or empty data:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, isAuthChecked]);

  

  const selectedIncomeData = useMemo(
    () =>
      selectedYear !== null
        ? incomeBreakdownData[selectedYear] || createEmptyIncomeBreakdown()
        : createEmptyIncomeBreakdown(),
    [incomeBreakdownData, selectedYear]
  );
  const selectedExpenseData = useMemo(
    () =>
      selectedYear !== null
        ? expenseBreakdownData[selectedYear] || createEmptyExpenseBreakdown()
        : createEmptyExpenseBreakdown(),
    [expenseBreakdownData, selectedYear]
  );
  const selectedTaxData = useMemo(
    () =>
      selectedYear !== null
        ? taxBreakdownData[selectedYear] || createEmptyTaxBreakdown()
        : createEmptyTaxBreakdown(),
    [taxBreakdownData, selectedYear]
  );

  const renderDataTable = (data: IncomeBreakdown | ExpenseBreakdown | TaxBreakdown) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">{t("item")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead className="text-right w-[20%]">{t("percentage")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{t(`labels.${key}`)}</TableCell>
              <TableCell className="text-right">{formatThaiCurrency(value)}</TableCell>
              <TableCell className="text-right">
                {total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell>{t("total")}</TableCell>
            <TableCell className="text-right">{formatThaiCurrency(total)}</TableCell>
            <TableCell className="text-right">100%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  const tabIcons = {
    income: <ArrowUpIcon className="w-4 h-4" />,
    expense: <ArrowDownIcon className="w-4 h-4" />,
    tax: <PercentIcon className="w-4 h-4" />,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50">
      
        <Card className="w-full mb-4 shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">{t("financialBreakdown")}</CardTitle>
              <CardDescription>{t("viewSummaryAllOrders")}</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {t("filter")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">{t("filterData")}</h4>
                    <p className="text-sm text-muted-foreground">{t("setDimensions")}</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex flex-col items-center gap-4">
                      <Label htmlFor="width">{t("year")}</Label>
                      <Select
                        value={selectedYear?.toString() || ""}
                        onValueChange={(value) => setSelectedYear(Number(value))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>{selectedYear || t("selectYear")}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(incomeBreakdownData).map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="income" className="mb-8" onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="grid grid-cols-3 max-w-md mx-auto bg-gray-100 p-1 rounded-lg">
                {Object.entries(tabIcons).map(([key, icon]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-2 py-2 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {icon}
                    {t(`labels.${key}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="income">
                <PieChartComponent incomeBreakdown={selectedIncomeData} />
              </TabsContent>
              <TabsContent value="expense">
                <PieChartComponent expenseBreakdown={selectedExpenseData} />
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
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  {t("financialBreakdown")}
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  {t("yearlySummary", { year: selectedYear })}
                </div>
                <div className="leading-none text-muted-foreground">
                  {t("analyzingData", { year: selectedYear })}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      

      
        <Card className="w-full mb-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              {tabIcons[activeTab as keyof typeof tabIcons]}
              {t(`labels.${activeTab}Details`, { year: selectedYear })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "income" && renderDataTable(selectedIncomeData)}
            {activeTab === "expense" && renderDataTable(selectedExpenseData)}
            {activeTab === "tax" && renderDataTable(selectedTaxData)}
          </CardContent>
        </Card>
      
    </div>
  );
}
