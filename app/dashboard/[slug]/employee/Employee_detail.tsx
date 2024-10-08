import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

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

type EmployeeDetailsDialogProps = {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
};

// Step 1: Create a translation object
const translations = {
  en: {
    employeeCode: "Employee Code",
    name: "Name",
    gender: "Gender",
    currentSalary: "Current Salary",
    workingYear: "Working Year",
    income: "Income",
    expense: "Expense",
    tax: "Tax",
    salary: "Salary",
    overtime: "Overtime",
    bonus: "Bonus",
    shiftAllowance: "Shift Allowance",
    foodAllowance: "Food Allowance",
    diligence: "Diligence",
    beverage: "Beverage",
    commission: "Commission",
    brokerFee: "Broker Fee",
    otherIncome: "Other Income",
    loan: "Loan",
    salaryAdvance: "Salary Advance",
    commissionDeduction: "Commission Deduction",
    otherDeductions: "Other Deductions",
    employeeTax: "Employee Tax",
    companyTax: "Company Tax",
    socialSecurityEmployee: "Social Security (Employee)",
    socialSecurityCompany: "Social Security (Company)",
    providentFund: "Provident Fund",
    viewDetails: "View the details of the employee below:",
    title: "Employee Details",
    startDate: "Start Working Date",
    endDate: "End Working Date",
  },
  th: {
    employeeCode: "รหัสพนักงาน",
    name: "ชื่อ",
    gender: "เพศ",
    currentSalary: "เงินเดือนปัจจุบัน",
    workingYear: "ปีทำงาน",
    income: "รายได้",
    expense: "ค่าใช้จ่าย",
    tax: "ภาษี",
    salary: "เงินเดือน",
    overtime: "ล่วงเวลา",
    bonus: "โบนัส",
    shiftAllowance: "ค่าเบี้ยเลี้ยงกะ",
    foodAllowance: "ค่าอาหาร",
    diligence: "ความขยัน",
    beverage: "เครื่องดื่ม",
    commission: "ค่าคอมมิชชั่น",
    brokerFee: "ค่านายหน้า",
    otherIncome: "รายได้อื่น ๆ",
    loan: "เงินกู้",
    salaryAdvance: "เงินเดือนล่วงหน้า",
    commissionDeduction: "การหักค่าคอมมิชชั่น",
    otherDeductions: "การหักอื่น ๆ",
    employeeTax: "ภาษีเงินได้พนักงาน",
    companyTax: "ภาษีเงินได้บริษัท",
    socialSecurityEmployee: "ประกันสังคม (พนักงาน)",
    socialSecurityCompany: "ประกันสังคม (บริษัท)",
    providentFund: "กองทุนสำรองเลี้ยงชีพ",
    viewDetails: "ดูรายละเอียดของพนักงานด้านล่าง:",
    title: "รายละเอียดพนักงาน",
    startDate: "วันที่เริ่มงาน",
    endDate: "วันที่สิ้นสุดงาน",
  },
};

const formatSalary = (salary: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(salary);
};

const DetailsCard = ({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string | number }[];
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <dt className="font-medium text-muted-foreground">{item.label}</dt>
            <dd>
              {typeof item.value === "number"
                ? formatSalary(item.value)
                : item.value}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </CardContent>
  </Card>
);

export default function EmployeeDetailsDialog({
  employee,
  open,
  onClose,
}: EmployeeDetailsDialogProps) {
  const [language, setLanguage] = React.useState<"en" | "th">("en"); // Step 2: Add state for language selection

  if (!employee) return null;

  const t = translations[language]; // Step 3: Get the correct translations based on selected language

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-7xl p-6 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.title}</DialogTitle>
          <DialogDescription className="flex text-muted-foreground">
            {t.viewDetails}
            <Button
              className="ml-auto bg-white text-black hover:bg-black hover:text-white"
              onClick={() => setLanguage(language === "en" ? "th" : "en")}
            >
              {language === "en" ? "Eng" : "TH"}
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p>
                    <strong>{t.employeeCode}:</strong> {employee.employeeCode}
                  </p>
                  <p>
                    <strong>{t.name}:</strong> {employee.title}{" "}
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p>
                    <strong>{t.gender}:</strong> {employee.gender}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>{t.currentSalary}:</strong>{" "}
                    {formatSalary(employee.currentSalary)}
                  </p>
                  <p>
                    <strong>{t.workingYear}:</strong> {employee.year}
                  </p>
                  <p>
                    <strong>{t.startDate}:</strong> {employee.startDate}
                  </p>
                  <p>
                    <strong>{t.endDate}:</strong>{" "}
                    {employee.endDate || (language === "th" ? "กำลังทำงาน" : "On Working")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">{t.income}</TabsTrigger>
              <TabsTrigger value="expense">{t.expense}</TabsTrigger>
              <TabsTrigger value="tax">{t.tax}</TabsTrigger>
            </TabsList>

            <TabsContent value="income">
              {employee.incomes && employee.incomes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {employee.incomes.map((income) => (
                    <DetailsCard
                      key={income.id}
                      title={`${t.income}: ${income.month}/${income.year}`}
                      items={[
                        { label: t.salary, value: income.salary || 0 },
                        { label: t.overtime, value: income.overtime || 0 },
                        { label: t.bonus, value: income.bonus || 0 },
                        {
                          label: t.shiftAllowance,
                          value: income.shiftAllowance || 0,
                        },
                        {
                          label: t.foodAllowance,
                          value: income.foodAllowance || 0,
                        },
                        { label: t.diligence, value: income.diligence || 0 },
                        { label: t.beverage, value: income.beverage || 0 },
                        { label: t.commission, value: income.commission || 0 },
                        { label: t.brokerFee, value: income.brokerFee || 0 },
                        {
                          label: t.otherIncome,
                          value: income.otherIncome || 0,
                        },
                      ]}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expense">
              {employee.expenses && employee.expenses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {employee.expenses.map((expense) => (
                    <DetailsCard
                      key={expense.id}
                      title={`${t.expense}: ${expense.month}/${expense.year}`}
                      items={[
                        { label: t.loan, value: expense.loan || 0 },
                        {
                          label: t.salaryAdvance,
                          value: expense.salaryAdvance || 0,
                        },
                        {
                          label: t.commissionDeduction,
                          value: expense.commissionDeduction || 0,
                        },
                        {
                          label: t.otherDeductions,
                          value: expense.otherDeductions || 0,
                        },
                      ]}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tax">
              {employee.taxes && employee.taxes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {employee.taxes.map((tax) => (
                    <DetailsCard
                      key={tax.id}
                      title={`${t.tax}: ${tax.month}/${tax.year}`}
                      items={[
                        { label: t.employeeTax, value: tax.employeeTax || 0 },
                        { label: t.companyTax, value: tax.companyTax || 0 },
                        {
                          label: t.socialSecurityEmployee,
                          value: tax.socialSecurityEmployee || 0,
                        },
                        {
                          label: t.socialSecurityCompany,
                          value: tax.socialSecurityCompany || 0,
                        },
                        {
                          label: t.providentFund,
                          value: tax.providentFund || 0,
                        },
                      ]}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
