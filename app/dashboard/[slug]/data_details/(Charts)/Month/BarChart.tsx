import CustomTooltip from "@/components/Charts/CustomTooltipMonth";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

// Function to convert month numbers to abbreviated names
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

const chartConfig = {
  totalIncome: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  totalExpense: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  totalTax: {
    label: "Tax",
    color: "hsl(var(--chart-3))",
  },
  netIncome: {
    label: "Net",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const FinancialBarChart: React.FC<FinancialBarChartProps> = ({ chartData }) => {
  // Sort the chartData by month
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
          // Format the month to display abbreviated names
          tickFormatter={(month) => monthNames[month - 1]}
        />
        <YAxis
          tickLine={true}
          axisLine={true}
          tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
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
