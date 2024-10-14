import { useTranslations } from 'next-intl';
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

interface FinancialAreaChartProps {
  chartData: ChartDataItem[];
  selectedDataTypes: SelectedDataTypes;
}

const FinancialAreaChart = ({
  chartData,
  selectedDataTypes,
}: FinancialAreaChartProps) => {
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
      <AreaChart
        width={600}
        height={300}
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="year" />
        <YAxis
          tickFormatter={(value) => `${t('currency')}${(value / 1000000).toFixed(2)}${t('million')}`}
          domain={[0, 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {(Object.keys(selectedDataTypes) as Array<keyof SelectedDataTypes>).map(
          (dataType) =>
            selectedDataTypes[dataType] && (
              <Area
                key={dataType}
                type="monotone"
                dataKey={dataType}
                name={t(`labels.${dataType.toLowerCase()}`)}
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
