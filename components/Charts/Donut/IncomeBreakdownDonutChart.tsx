import React from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
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
  if (!incomeBreakdown) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Income Breakdown</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const categories = Object.keys(incomeBreakdown);
  const COLORS = generateVibrantColors(categories.length);

  const chartData = Object.entries(incomeBreakdown)
    .map(([key, value], index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
      fill: COLORS[index],
    }))
    .sort((a, b) => b.value - a.value).filter(item => item.value > 0);

  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((key, index) => [
      key,
      {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: COLORS[index],
      },
    ])
  );

  const totalIncome = Object.values(incomeBreakdown).reduce(
    (sum, value) => sum + value,
    0
  );

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
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(salary)
  }

  const CustomizedLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-2 text-xs ">
        {payload.map((entry: any, index: any) => (
          <li key={`item-${index}`} className="flex items-center">
            <span
              style={{ backgroundColor: entry.color }}
              className="inline-block w-3 h-3 mr-1"
            ></span>
            <span>
              {entry.value} (
              {((entry.payload.value / totalIncome) * 100).toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Income Breakdown</CardTitle>
        <CardDescription>Employee Income Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
          Total Income: {formatSalary(totalIncome)}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing income breakdown for the current period
        </div>
      </CardFooter>
    </Card>
  );
};

export default IncomeBreakdownDonutChart;
