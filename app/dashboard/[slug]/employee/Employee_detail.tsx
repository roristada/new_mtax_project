import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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

type EmployeeDetailsDialogProps = {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
};

const EmployeeDetailsDialog: React.FC<EmployeeDetailsDialogProps> = ({
  employee,
  open,
  onClose,
}) => {
  if (!employee) return null;

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(salary);
  };

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

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid grid-cols-3 w-[80%] mx-auto">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
            </TabsList>

            <TabsContent value="income">
              {employee.incomes && employee.incomes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Income Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {employee.incomes.map((income) => (
                      <div
                        key={income.id}
                        className="bg-gray-50 p-4 rounded-lg shadow-md"
                      >
                        <p>
                          <strong>Month/Year:</strong> {income.month}/
                          {income.year}
                        </p>
                        <p>
                          <strong>Salary:</strong>{" "}
                          {formatSalary(income.salary || 0)}
                        </p>
                        <p>
                          <strong>Overtime:</strong>{" "}
                          {formatSalary(income.overtime || 0)}
                        </p>
                        <p>
                          <strong>Bonus:</strong>{" "}
                          {formatSalary(income.bonus || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="expense">
              {employee.expenses && employee.expenses.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Expense Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {employee.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="bg-gray-50 p-4 rounded-lg shadow-md"
                      >
                        <p>
                          <strong>Month/Year:</strong> {expense.month}/
                          {expense.year}
                        </p>
                        <p>
                          <strong>Loan:</strong>{" "}
                          {formatSalary(expense.loan || 0)}
                        </p>
                        <p>
                          <strong>Salary Advance:</strong>{" "}
                          {formatSalary(expense.salaryAdvance || 0)}
                        </p>
                        <p>
                          <strong>Other Deductions:</strong>{" "}
                          {formatSalary(expense.otherDeductions || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="tax">
              {employee.taxes && employee.taxes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Tax Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {employee.taxes.map((tax) => (
                      <div
                        key={tax.id}
                        className="bg-gray-50 p-4 rounded-lg shadow-md"
                      >
                        <p>
                          <strong>Month/Year:</strong> {tax.month}/{tax.year}
                        </p>
                        <p>
                          <strong>Employee Tax:</strong>{" "}
                          {formatSalary(tax.employeeTax || 0)}
                        </p>
                        <p>
                          <strong>Company Tax:</strong>{" "}
                          {formatSalary(tax.companyTax || 0)}
                        </p>
                        <p>
                          <strong>Social Security (Employee):</strong>{" "}
                          {formatSalary(tax.socialSecurityEmployee || 0)}
                        </p>
                        <p>
                          <strong>Social Security (Company):</strong>{" "}
                          {formatSalary(tax.socialSecurityCompany || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsDialog;
