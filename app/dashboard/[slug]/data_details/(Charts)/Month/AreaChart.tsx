import { ChartConfig, ChartContainer } from "../../../../../../components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface FinancialAreaChartProps {
  chartData: MonthlySummary[];
  
}

const FinancialAreaChart = ({
  chartData,
  
}: FinancialAreaChartProps) => {

  const sortedChartData = chartData.sort((a, b) => a.month - b.month);
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        width={600}
        height={300}
        data={sortedChartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" tickFormatter={(month) => monthNames[month - 1]} />
        <YAxis
          tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
          
        />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("en").format(Number(value))
          }
        />
        <Legend />
        {(Object.keys(chartConfig) as Array<keyof SelectedDataTypes>).map(
          (dataType) =>
             (
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
