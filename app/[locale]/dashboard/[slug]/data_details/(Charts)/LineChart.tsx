import { useTranslations } from 'next-intl';
import { ChartConfig, ChartContainer } from "../../../../../../components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import CustomTooltip from '../../../../../../components/Charts/CustomTooltip';

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

interface FinancialLineChartProps {
  chartData: ChartDataItem[];
  selectedDataTypes: SelectedDataTypes;
}

const FinancialLineChart = ({
  chartData,
  selectedDataTypes,
}: FinancialLineChartProps) => {
  const t = useTranslations('Charts');

  const chartConfig = {
    Income: {
      label: t('labels.income'),
      color: "hsl(var(--chart-1))",
    },
    Expense: {
      label: t('labels.expense'),
      color: "hsl(var(--chart-2))",
    },
    Tax: {
      label: t('labels.tax'),
      color: "hsl(var(--chart-3))",
    },
    netIncome: {
      label: t('labels.netincome'),
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        width={600}
        height={300}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="year" 
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${t('currency')}${(value / 1000000).toFixed(2)}${t('million')}`}
          domain={[0, 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {(Object.keys(selectedDataTypes) as Array<keyof SelectedDataTypes>).map(
          (dataType) =>
            selectedDataTypes[dataType] && (
              <Line
                key={dataType}
                type="monotone"
                dataKey={dataType}
                name={t(`labels.${dataType.toLowerCase()}`)}
                stroke={chartConfig[dataType].color}
                strokeWidth={2}
              />
            )
        )}
      </LineChart>
    </ChartContainer>
  );
};

export default FinancialLineChart;
