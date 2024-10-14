import React from 'react';
import { TrendingUp } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { useTranslations } from 'next-intl';

interface TaxBreakdown {
  employeeTax: number;
  companyTax: number;
  socialSecurityEmployee: number;
  socialSecurityCompany: number;
  providentFund: number;
}

interface TaxBreakdownDonutChartProps {
  taxBreakdown: TaxBreakdown | null | undefined;
}

const generateVibrantColors = (numColors: number) => {
  const vibrantHues = [0, 210, 120, 280, 30, 330, 180, 60];
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = vibrantHues[i % vibrantHues.length];
    const saturation = 85 + Math.random() * 15;
    const lightness = 55 + Math.random() * 10;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

export const TaxBreakdownDonutChart: React.FC<TaxBreakdownDonutChartProps> = ({ taxBreakdown }) => {
  const t = useTranslations('Charts');

  if (!taxBreakdown) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>{t('tax_breakdown')}</CardTitle>
          <CardDescription>{t('no_data_available')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const categories = Object.keys(taxBreakdown);
  const COLORS = generateVibrantColors(categories.length);

  const chartData = Object.entries(taxBreakdown)
    .map(([key, value], index) => ({
      name: t(`tax_labels.${key}`),
      value: value,
      fill: COLORS[index],
    }))
    .sort((a, b) => b.value - a.value).filter(item => item.value > 0);

  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((key, index) => [
      key,
      { label: t(`tax_labels.${key}`), color: COLORS[index] }
    ])
  );

  const totalTax = Object.values(taxBreakdown).reduce((sum, value) => sum + value, 0);

  const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index } :any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomizedLegend = (props:any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-2 text-xs ">
        {payload.map((entry:any, index:any) => (
          <li key={`item-${index}`} className="flex items-center">
            <span style={{ backgroundColor: entry.color }} className="inline-block w-3 h-3 mr-1"></span>
            <span>{entry.value} ({((entry.payload.value / totalTax) * 100).toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalTax) * 100).toFixed(1);
      return (
        <div className="custom-tooltip bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-lg mb-2">{data.name}</p>
          <p className="text-sm text-gray-600 mb-1">
            {t('amount')}: <span className="font-medium">{formatSalary(data.value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            {t('percentage')}: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat(t('locale'), {
      style: "currency",
      currency: t('currencyCode'),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(salary)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t('tax_breakdown')}</CardTitle>
        <CardDescription>{t('employee_tax_distribution')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[450px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={80}
                paddingAngle={2}
                labelLine={false}        
                label={<CustomizedLabel />}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend content={<CustomizedLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-8">
        <div className="flex items-center gap-2 font-medium leading-none">
          {t('total_tax')}: {formatSalary(totalTax)} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {t('showing_tax_breakdown')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaxBreakdownDonutChart;
