import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import exp from "constants";
import {
  LineChart,
  Line,
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

interface FinancialLineChartProps {
  chartData: ChartDataItem[];
  selectedDataTypes: SelectedDataTypes;
}
const FinancialLineChart = ({
  chartData,
  selectedDataTypes,
}: FinancialLineChartProps) => {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        width={600}
        height={300}
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="year" />
        <YAxis
          tickFormatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`}
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
              <Line
                key={dataType}
                type="monotone"
                dataKey={dataType}
                stroke={chartConfig[dataType].color}
              />
            )
        )}
      </LineChart>
    </ChartContainer>
  );
};

export default FinancialLineChart;

{
  /* <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
              domain={[0, "auto"]} // Adjust this to zoom in on the differences
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="Income"
              stroke="var(--color-income)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Expense"
              stroke="var(--color-expense)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Tax"
              stroke="var(--color-tax)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="netIncome"
              stroke="var(--color-net)"
              strokeWidth={2}
            />
          </LineChart> */
}
