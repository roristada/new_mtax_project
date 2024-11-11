import { useTranslations } from 'next-intl';
import CustomTooltip from "../../../../../../../components/Charts/CustomTooltipMonth";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "../../../../../../../components/ui/chart";
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalTax: number;
  netIncome: number;
}

interface SelectedDataTypes {
  totalIncome: boolean;
  totalExpense: boolean;
  totalTax: boolean;
  netIncome: boolean;
}

interface FinancialBarChartProps {
  chartData: MonthlySummary[];
}

const FinancialBarChart: React.FC<FinancialBarChartProps> = ({ chartData }) => {
  const t = useTranslations('Charts');

  const chartConfig = {
    totalIncome: {
      label: t('labels.income'),
      color: "hsl(var(--chart-1))",
    },
    totalExpense: {
      label: t('labels.expenses'),
      color: "hsl(var(--chart-2))",
    },
    totalTax: {
      label: t('labels.tax'),
      color: "hsl(var(--chart-3))",
    },
    netIncome: {
      label: t('labels.net'),
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  const sortedChartData = chartData.sort((a, b) => a.month - b.month);

  return (
    <ChartContainer config={chartConfig}>
      <RechartsBarChart
        data={sortedChartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          vertical={false}
          horizontal={true}
          stroke="#000"
          strokeDasharray="2 2"
        />
        <XAxis
          dataKey="month"
          tickLine={true}
          tickMargin={10}
          axisLine={true}
          tickFormatter={(month) => monthNames[month - 1]}
        />
        <YAxis
          tickLine={true}
          axisLine={true}
          tickFormatter={(value) => `${t('currency')}${(value / 1000000).toFixed(2)}${t('million')}`}
          domain={[0, "auto"]}
        />
        <ChartTooltip cursor={false} content={<CustomTooltip />} />
        <ChartLegend content={<ChartLegendContent />} />

        {/* Dynamically render bars for the selected data types */}
        {(Object.keys(chartConfig) as Array<keyof SelectedDataTypes>).map(
          (dataType) => (
            <Bar
              key={dataType}
              dataKey={dataType}
              fill={chartConfig[dataType].color}
            />
          )
        )}
      </RechartsBarChart>
    </ChartContainer>
  );
};

export default FinancialBarChart;
