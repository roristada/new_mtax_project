import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ChartDataItem {
  year: number;
  Income: number;
  Expense: number;
  Tax: number;
  netIncome: number;
}
interface SelectedDataTypes {
  Income: boolean;
  Expense: boolean;
  Tax: boolean;
  netIncome: boolean;
}
const chartConfig = {
  Income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  Expense: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  Tax: {
    label: "Tax",
    color: "hsl(var(--chart-3))",
  },
  netIncome: {
    label: "Net",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

interface FinancialAreaChartProps {
  chartData: ChartDataItem[];
  selectedDataTypes: SelectedDataTypes;
}

const FinancialAreaChart = ({
  chartData,
  selectedDataTypes,
}: FinancialAreaChartProps) => {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        width={600}
        height={300}
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="year" />
        <YAxis
          tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
          domain={[0, 350000000]} // Adjust this value based on your data range
        />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("en").format(Number(value))
          }
        />
        <Legend />
        {(Object.keys(selectedDataTypes) as Array<keyof SelectedDataTypes>).map(
          (dataType) =>
            selectedDataTypes[dataType] && (
              <Area
                key={dataType}
                type="monotone"
                dataKey={dataType}
                fill={chartConfig[dataType].color}
                stroke={chartConfig[dataType].color}
                fillOpacity={0.5}
              />
            )
        )}
      </AreaChart>
    </ChartContainer>
  );
};

export default FinancialAreaChart;
