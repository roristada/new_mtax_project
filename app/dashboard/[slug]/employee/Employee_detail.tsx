import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Income = {
  id: number
  month: number
  year: number
  salary?: number
  shiftAllowance?: number
  foodAllowance?: number
  overtime?: number
  diligence?: number
  beverage?: number
  commission?: number
  brokerFee?: number
  otherIncome?: number
  bonus?: number
}

type Expense = {
  id: number
  month: number
  year: number
  loan?: number
  salaryAdvance?: number
  commissionDeduction?: number
  otherDeductions?: number
}

type Tax = {
  id: number
  month: number
  year: number
  employeeTax?: number
  companyTax?: number
  socialSecurityEmployee?: number
  socialSecurityCompany?: number
  providentFund?: number
}

type Employee = {
  employeeCode: string
  title: string
  firstName: string
  lastName: string
  gender: string
  currentSalary: number
  year: number
  incomes?: Income[]
  expenses?: Expense[]
  taxes?: Tax[]
}

type EmployeeDetailsDialogProps = {
  employee: Employee | null
  open: boolean
  onClose: () => void
}

const formatSalary = (salary: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(salary)
}

const DetailsCard = ({ title, items }: { title: string; items: { label: string; value: string | number }[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <dt className="font-medium text-muted-foreground">{item.label}</dt>
            <dd>{typeof item.value === 'number' ? formatSalary(item.value) : item.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </CardContent>
  </Card>
)

export default function EmployeeDetailsDialog({ employee, open, onClose }: EmployeeDetailsDialogProps) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-7xl p-6 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Employee Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View the details of the employee below:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p><strong>Employee Code:</strong> {employee.employeeCode}</p>
                  <p><strong>Name:</strong> {employee.title} {employee.firstName} {employee.lastName}</p>
                  <p><strong>Gender:</strong> {employee.gender}</p>
                </div>
                <div>
                  <p><strong>Current Salary:</strong> {formatSalary(employee.currentSalary)}</p>
                  <p><strong>Working Year:</strong> {employee.year}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
            </TabsList>

            <TabsContent value="income">
              {employee.incomes && employee.incomes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {employee.incomes.map((income) => (
                    <DetailsCard
                      key={income.id}
                      title={`Income: ${income.month}/${income.year}`}
                      items={[
                        { label: "Salary", value: income.salary || 0 },
                        { label: "Overtime", value: income.overtime || 0 },
                        { label: "Bonus", value: income.bonus || 0 },
                        { label: "Shift Allowance", value: income.shiftAllowance || 0 },
                        { label: "Food Allowance", value: income.foodAllowance || 0 },
                        { label: "Diligence", value: income.diligence || 0 },
                        { label: "Beverage", value: income.beverage || 0 },
                        { label: "Commission", value: income.commission || 0 },
                        { label: "Broker Fee", value: income.brokerFee || 0 },
                        { label: "Other Income", value: income.otherIncome || 0 },
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
                      title={`Expense: ${expense.month}/${expense.year}`}
                      items={[
                        { label: "Loan", value: expense.loan || 0 },
                        { label: "Salary Advance", value: expense.salaryAdvance || 0 },
                        { label: "Commission Deduction", value: expense.commissionDeduction || 0 },
                        { label: "Other Deductions", value: expense.otherDeductions || 0 },
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
                      title={`Tax: ${tax.month}/${tax.year}`}
                      items={[
                        { label: "Employee Tax", value: tax.employeeTax || 0 },
                        { label: "Company Tax", value: tax.companyTax || 0 },
                        { label: "Social Security (Employee)", value: tax.socialSecurityEmployee || 0 },
                        { label: "Social Security (Company)", value: tax.socialSecurityCompany || 0 },
                        { label: "Provident Fund", value: tax.providentFund || 0 },
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
  )
}