import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface BreakdownChartProps {
  incomeBreakdown?: IncomeBreakdown | null;
  expenseBreakdown?: ExpenseBreakdown | null; 
  taxBreakdown?: TaxBreakdown | null;
  languages: string;
}

const chartConfig = {
  salary: { label: "Salary", color: "#FF6384" },
  shiftAllowance: { label: "Shift Allowance", color: "#36A2EB" },
  foodAllowance: { label: "Food Allowance", color: "#FFCE56" },
  overtime: { label: "Overtime", color: "#4BC0C0" },
  diligence: { label: "Diligence", color: "#9966FF" },
  beverage: { label: "Beverage", color: "#FF9F40" },
  commission: { label: "Commission", color: "#FFCD56" },
  brokerFee: { label: "Broker Fee", color: "#C9CBCF" },
  otherIncome: { label: "Other Income", color: "#FF6384" },
  bonus: { label: "Bonus", color: "#36A2EB" },
  loan: { label: "Loan", color: "#FF6384" },
  salaryAdvance: { label: "Salary Advance", color: "#36A2EB" },
  commissionDeduction: { label: "Commission Deduction", color: "#FFCE56" },
  otherDeductions: { label: "Other Deductions", color: "#4BC0C0" },
  employeeTax: { label: "Employee Tax", color: "#9966FF" },
  companyTax: { label: "Company Tax", color: "#FF9F40" },
  socialSecurityEmployee: { label: "Social Security (Employee)", color: "#FFCD56" },
  socialSecurityCompany: { label: "Social Security (Company)", color: "#C9CBCF" },
  providentFund: { label: "Provident Fund", color: "#FF6384" },
};

const chartConfigTH = {
  salary: { label: "เงินเดือน", color: "#FF6384" },
  shiftAllowance: { label: "เบี้ยเลี้ยงกะ", color: "#36A2EB" },
  foodAllowance: { label: "เบี้ยเลี้ยงอาหาร", color: "#FFCE56" },
  overtime: { label: "OT", color: "#4BC0C0" },
  diligence: { label: "ความขยัน", color: "#9966FF" },
  beverage: { label: "เครื่องดื่ม", color: "#FF9F40" },
  commission: { label: "ค่าคอมมิชชั่น", color: "#FFCD56" },
  brokerFee: { label: "ค่าธรรมเนียมนายหน้า", color: "#C9CBCF" },
  otherIncome: { label: "รายได้อื่น ๆ", color: "#FF6384" },
  bonus: { label: "โบนัส", color: "#36A2EB" },
  loan: { label: "เงินกู้", color: "#FF6384" },
  salaryAdvance: { label: "เงินเดือนล่วงหน้า", color: "#36A2EB" },
  commissionDeduction: { label: "การหักค่าคอมมิชชั่น", color: "#FFCE56" },
  otherDeductions: { label: "การหักอื่น ๆ", color: "#4BC0C0" },
  employeeTax: { label: "ภาษีเงินได้ (พนักงาน)", color: "#9966FF" },
  companyTax: { label: "ภาษีเงินได้ (บริษัท)", color: "#FF9F40" },
  socialSecurityEmployee: { label: "ประกันสังคม (พนักงาน)", color: "#FFCD56" },
  socialSecurityCompany: { label: "ประกันสังคม (บริษัท)", color: "#C9CBCF" },
  providentFund: { label: "กองทุนสำรองเลี้ยงชีพ", color: "#FF6384" },
};

const BreakdownChart: React.FC<BreakdownChartProps> = ({ incomeBreakdown, expenseBreakdown, taxBreakdown , languages }) => {
  const [otherItems, setOtherItems] = useState<Array<{ name: string; value: number }>>([]);

  // Correctly set the chartConfig based on language
  const selectedChartConfig = languages === 'English' ? chartConfig : chartConfigTH;

  const prepareData = (breakdown: IncomeBreakdown | ExpenseBreakdown | TaxBreakdown) => {
    return Object.entries(breakdown)
      .map(([key, value]) => ({
        name: selectedChartConfig[key as keyof typeof selectedChartConfig]?.label || key,
        value: value,
        color: selectedChartConfig[key as keyof typeof selectedChartConfig]?.color || "#999999",
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const chartData = incomeBreakdown ? prepareData(incomeBreakdown) 
    : expenseBreakdown ? prepareData(expenseBreakdown) 
    : taxBreakdown ? prepareData(taxBreakdown) 
    : [];

  const totalValue = chartData.reduce((acc, entry) => acc + entry.value, 0);

  // Group small slices into "Other"
  const threshold = 0.03; // 3%
  const groupedData = chartData.reduce((acc, entry) => {
    if (entry.value / totalValue < threshold) {
      const otherIndex = acc.findIndex((item) => item.name === "Other");
      if (otherIndex !== -1) {
        acc[otherIndex].value += entry.value;
        acc[otherIndex].items.push(entry);
      } else {
        acc.push({ name: "Other", value: entry.value, color: "#999999", items: [entry] });
      }
    } else {
      acc.push({ ...entry, items: [] });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string; items: Array<{ name: string; value: number }> }>);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${groupedData[index].name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const customLegend = (props: any) => {
    const { payload } = props;
  
    return (
      <ul className="flex flex-wrap justify-center gap-5" style={{ fontSize: '12px' }}>
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <span style={{ color: entry.color }}>■</span>
            <span className="ml-2">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };
  

  return (
    <div className="w-full h-[450px] grid grid-cols-1">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={groupedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            innerRadius={80}
            labelLine={true}
            label={renderCustomizedLabel}
            onMouseEnter={(data) => {
              if (data.name === "Other") {
                setOtherItems(data.items);
              }
            }}
            onMouseLeave={() => setOtherItems([])}
          >
            {groupedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border rounded shadow" style={{ fontSize: "12px" }}>
                    <p className="font-bold">{`${data.name}: ${((data.value / totalValue) * 100).toFixed(2)}%`}</p>
                    <p>{`Value: ${data.value.toFixed(2)}`}</p>
                    {data.name === "Other" && otherItems.length > 0 && (
                      <div className="mt-2">
                        <p className="font-bold">Other items:</p>
                        <ul>
                          {otherItems.map((item, index) => (
                            <li key={index}>{`${item.name}: ${((item.value / totalValue) * 100).toFixed(2)}%`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend content={customLegend} layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BreakdownChart;
