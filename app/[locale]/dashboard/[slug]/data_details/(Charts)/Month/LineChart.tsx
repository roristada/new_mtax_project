import { useTranslations } from 'next-intl';
import { ChartConfig, ChartContainer } from "../../../../../../../components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import CustomTooltipMonth from '../../../../../../../components/Charts/CustomTooltipMonth';

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

const FinancialLineChart = ({
  chartData,
}: {
  chartData: MonthlySummary[];
}) => {
  const t = useTranslations('Charts');

  const chartConfig = {
    totalIncome: {
      label: t('labels.totalincome'),
      color: "hsl(var(--chart-1))",
    },
    totalExpense: {
      label: t('labels.totalexpense'),
      color: "hsl(var(--chart-2))",
    },
    totalTax: {
      label: t('labels.totaltax'),
      color: "hsl(var(--chart-3))",
    },
    netIncome: {
      label: t('labels.netincome'),
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  const monthNames = t.raw('monthNames');

  const sortedChartData = chartData.sort((a, b) => a.month - b.month);

  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        width={600}
        height={300}
        data={sortedChartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" tickFormatter={(month) => monthNames[month - 1]} />
        <YAxis
          tickFormatter={(value) => `${t('currency')}${(value / 1000000).toFixed(2)}${t('million')}`}
        />
        <Tooltip content={<CustomTooltipMonth />} />
        <Legend />
        {(Object.keys(chartConfig) as Array<keyof SelectedDataTypes>).map(
          (dataType) => (
            <Line
              key={dataType}
              type="monotone"
              dataKey={dataType}
              name={chartConfig[dataType].label}
              stroke={chartConfig[dataType].color}
            />
          )
        )}
      </LineChart>
    </ChartContainer>
  );
};

export default FinancialLineChart;
