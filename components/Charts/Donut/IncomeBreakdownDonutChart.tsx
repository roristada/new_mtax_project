import React from "react";
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
import { ChartConfig, ChartContainer } from "../../../components/ui/chart";
import { useTranslations } from 'next-intl';

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

interface IncomeBreakdownDonutChartProps {
  incomeBreakdown: IncomeBreakdown | null | undefined;
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

export const IncomeBreakdownDonutChart: React.FC<
  IncomeBreakdownDonutChartProps
> = ({ incomeBreakdown }) => {
  const t = useTranslations('Charts');

  if (!incomeBreakdown) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>{t('income_breakdown')}</CardTitle>
          <CardDescription>{t('no_data_available')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const categories = Object.keys(incomeBreakdown);
  const COLORS = generateVibrantColors(categories.length);

  const chartData = Object.entries(incomeBreakdown)
    .map(([key, value], index) => ({
      name: t(`income_labels.${key}`),
      value: value,
      fill: COLORS[index],
    }))
    .sort((a, b) => b.value - a.value).filter(item => item.value > 0);

  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((key, index) => [
      key,
      { label: t(`income_labels.${key}`), color: COLORS[index] }
    ])
  );

  const totalIncome = Object.values(incomeBreakdown).reduce(
    (sum, value) => sum + value,
    0
  );

  if ( totalIncome === 0) {
    return (
      <Card className="w-full h-[450px] flex items-center justify-center">
        <p className="text-gray-500 text-lg">{t('no_data_available')}</p>
      </Card>
    );
  }

  const CustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
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

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat(t('locale'), {
      style: "currency",
      currency: t('currencyCode'),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(salary)
  }

  const CustomizedLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-2 text-[10px] sm:text-xs px-2">
        {payload.map((entry: any, index: any) => (
          <li key={`item-${index}`} className="flex items-center">
            <span
              style={{ backgroundColor: entry.color }}
              className="inline-block w-2 h-2 sm:w-3 sm:h-3 mr-1"
            ></span>
            <span className="whitespace-nowrap">
              {entry.value} (
              {((entry.payload.value / totalIncome) * 100).toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalIncome) * 100).toFixed(1);
      return (
        <div className="custom-tooltip bg-white p-2 sm:p-4 rounded-lg shadow-md border border-gray-200 max-w-[200px] sm:max-w-none">
          <p className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{data.name}</p>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            {t('amount')}: <span className="font-medium">{formatSalary(data.value)}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            {t('percentage')}: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate dynamic chart dimensions based on screen size
  const getChartDimensions = () => {
    // Default small screen dimensions
    let outerRadius = 80;
    let innerRadius = 40;

    // Adjust for larger screens
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 640) { // sm
        outerRadius = 100;
        innerRadius = 50;
      }
      if (window.innerWidth >= 768) { // md
        outerRadius = 120;
        innerRadius = 60;
      }
      if (window.innerWidth >= 1024) { // lg
        outerRadius = 150;
        innerRadius = 80;
      }
    }

    return { outerRadius, innerRadius };
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg sm:text-xl text-center">{t('income_breakdown')}</CardTitle>
        <CardDescription className="text-sm text-center px-2">
          {t('employee_income_distribution')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={getChartDimensions().outerRadius}
                innerRadius={getChartDimensions().innerRadius}
                paddingAngle={2}
                labelLine={false}
                label={<CustomizedLabel />}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend content={<CustomizedLegend />} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-xs sm:text-sm mt-4 sm:mt-8">
        <div className="flex items-center gap-2 font-medium leading-none text-center">
          {t('total_income')}: {formatSalary(totalIncome)} 
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <div className="leading-none text-muted-foreground text-center px-2">
          {t('showing_income_breakdown')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default IncomeBreakdownDonutChart;