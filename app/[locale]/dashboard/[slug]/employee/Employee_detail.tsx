"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
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

type EmployeeDetailsDialogProps = {
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
  const t = useTranslations('Employee_detail');

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-7xl p-6 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t('title', { name: `${employee.title} ${employee.firstName} ${employee.lastName}` })}</DialogTitle>
          <DialogDescription className="flex text-muted-foreground">
            {t('viewDetails')}
            
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

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">{t('tabs.income')}</TabsTrigger>
              <TabsTrigger value="expense">{t('tabs.expense')}</TabsTrigger>
              <TabsTrigger value="tax">{t('tabs.tax')}</TabsTrigger>
            </TabsList>

            <TabsContent value="income">
              {employee.incomes && employee.incomes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {employee.incomes.map((income) => (
                    <DetailsCard
                      key={income.id}
                      title={`${t('income')}: ${income.month}/${income.year}`}
                      items={[
                        { label: t('salary'), value: income.salary || 0 },
                        { label: t('overtime'), value: income.overtime || 0 },
                        { label: t('bonus'), value: income.bonus || 0 },
                        {
                          label: t('shiftAllowance'),
                          value: income.shiftAllowance || 0,
                        },
                        {
                          label: t('foodAllowance'),
                          value: income.foodAllowance || 0,
                        },
                        { label: t('diligence'), value: income.diligence || 0 },
                        { label: t('beverage'), value: income.beverage || 0 },
                        { label: t('commission'), value: income.commission || 0 },
                        { label: t('brokerFee'), value: income.brokerFee || 0 },
                        {
                          label: t('otherIncome'),
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
                      title={`${t('expense')}: ${expense.month}/${expense.year}`}
                      items={[
                        { label: t('loan'), value: expense.loan || 0 },
                        { label: t('salaryAdvance'), value: expense.salaryAdvance || 0 },
                        { label: t('commissionDeduction'), value: expense.commissionDeduction || 0 },
                        { label: t('otherDeductions'), value: expense.otherDeductions || 0 },
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
                      title={`${t('tax')}: ${tax.month}/${tax.year}`}
                      items={[
                        { label: t('employeeTax'), value: tax.employeeTax || 0 },
                        { label: t('companyTax'), value: tax.companyTax || 0 },
                        { label: t('socialSecurityEmployee'), value: tax.socialSecurityEmployee || 0 },
                        { label: t('socialSecurityCompany'), value: tax.socialSecurityCompany || 0 },
                        { label: t('providentFund'), value: tax.providentFund || 0 },
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