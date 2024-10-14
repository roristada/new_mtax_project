import React, { useState } from "react";
import {
  AlignEndHorizontal,
  BookUser,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
  XAxis,
  Tooltip,
} from "recharts";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { useTranslations } from 'next-intl';

interface ChartData {
  monthIndex: number;
  year: number;
  month: string;
  Income: number;
  Expense: number;
}

interface BarChartComponentProps {
  chartData: ChartData[];
  chartConfig: any;
}

const DynamicChartComponent = ({
  chartData,
  chartConfig,
}: BarChartComponentProps) => {
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const t = useTranslations('Charts');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(t('locale'), {
      style: "currency",
      currency: t('currencyCode'),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-lg mb-2">{t(`monthNameBar.${label}`)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 mb-1">
              <span style={{ color: entry.color }}>{t(`labels.${entry.name}`)}: </span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle>
            {chartType === "bar" ? t('income_expense') : t('area_chart_legend')}
          </CardTitle>
          <CardDescription>
            {t('january_december')} {chartData.length > 0 ? chartData[0].year : ""}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <span className="sr-only">{t('open_menu')}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setChartType("bar")}>
              <BookUser className="mr-2 h-4 w-4" />
              <span>{t('BarChart')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setChartType("area")}>
              <AlignEndHorizontal className="mr-2 h-4 w-4" />
              <span>{t('AreaChart')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {chartType === "bar" ? (
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => t(`monthNameBar.${value}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => t(`labels.${value}`)} />
              <Bar dataKey="Income" fill="var(--color-income)" radius={4} />
              <Bar dataKey="Expense" fill="var(--color-expense)" radius={4} />
            </BarChart>
          ) : (
            <AreaChart width={600} height={300} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => t(`monthNameBar.${value}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                dataKey="Income"
                type="natural"
                fill="var(--color-income)"
                fillOpacity={0.4}
                stroke="var(--color-income)"
              />
              <Area
                dataKey="Expense"
                type="natural"
                fill="var(--color-expense)"
                fillOpacity={0.4}
                stroke="var(--color-expense)"
              />
              <Legend formatter={(value) => t(`labels.${value}`)} />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {t('description')} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {t('showing_total_visitors')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DynamicChartComponent;
